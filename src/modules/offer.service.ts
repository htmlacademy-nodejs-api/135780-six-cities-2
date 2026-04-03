import { CreateOfferDto } from '../dto/create-offer.dto.js';
import { UpdateOfferDto } from '../dto/update-offer.dto.js';
import { Types } from 'mongoose';
import { OfferEntity } from '../entities/offer.entity.js';
import { CommentModel } from '../models/comment.model.js';
import { OfferModel } from '../models/offer.model.js';
import { FavoriteService } from './favorite.service.js';
import { IOfferService } from '../type/offer-service.interface.js';

const DEFAULT_OFFERS_LIMIT = 60;
const PREMIUM_OFFERS_LIMIT = 3;

type OfferRatingAggregation = {
  _id: unknown;
  avgRating: number;
  commentsCount: number;
};

export class OfferService implements IOfferService {
  constructor(private readonly favoriteService: FavoriteService = new FavoriteService()) {}

  async findById(id: string, userId?: string): Promise<OfferEntity | null> {
    const offer = await OfferModel.findById(id).exec();
    if (!offer) {
      return null;
    }

    return this.setFavoriteFlagForOffer(offer, userId);
  }

  async create(offerData: CreateOfferDto, userId: string): Promise<OfferEntity> {
    return OfferModel.create({
      ...offerData,
      publicationDate: new Date(offerData.publicationDate),
      author: new Types.ObjectId(userId),
      commentsCount: 0,
      rating: 0,
      isFavorite: false
    });
  }

  async update(offerId: string, updateData: UpdateOfferDto): Promise<OfferEntity | null> {
    const updatePayload = {
      ...updateData,
      publicationDate: updateData.publicationDate ? new Date(updateData.publicationDate) : undefined
    };

    return OfferModel.findByIdAndUpdate(offerId, updatePayload, { new: true }).exec();
  }

  async delete(offerId: string): Promise<void> {
    await OfferModel.findByIdAndDelete(offerId).exec();
    await CommentModel.deleteMany({ offer: offerId }).exec();
  }

  async getList(limit = DEFAULT_OFFERS_LIMIT, userId?: string): Promise<OfferEntity[]> {
    const offers = await OfferModel.find().sort({ publicationDate: -1 }).limit(limit).exec();
    return this.setFavoriteFlagForList(offers, userId);
  }

  async getPremiumByCity(city: string, userId?: string): Promise<OfferEntity[]> {
    const offers = await OfferModel.find({ city, isPremium: true })
      .sort({ publicationDate: -1 })
      .limit(PREMIUM_OFFERS_LIMIT)
      .exec();

    return this.setFavoriteFlagForList(offers, userId);
  }

  async getFavorites(userId: string): Promise<OfferEntity[]> {
    const offerIds = await this.favoriteService.getByUserId(userId);

    if (offerIds.length === 0) {
      return [];
    }

    const offers = await OfferModel.find({ _id: { $in: offerIds } })
      .sort({ publicationDate: -1 })
      .exec();

    return offers.map((offer) => {
      offer.isFavorite = true;
      return offer;
    });
  }

  async setFavoriteStatus(offerId: string, userId: string, isFavorite: boolean): Promise<OfferEntity | null> {
    if (isFavorite) {
      await this.favoriteService.add(userId, offerId);
    } else {
      await this.favoriteService.remove(userId, offerId);
    }

    return this.findById(offerId, userId);
  }

  async recalculateRatingAndCommentsCount(offerId: string): Promise<void> {
    const aggregationResult = await CommentModel.aggregate<OfferRatingAggregation>([
      { $match: { offer: new Types.ObjectId(offerId) } },
      {
        $group: {
          _id: '$offer',
          avgRating: { $avg: '$rating' },
          commentsCount: { $sum: 1 }
        }
      }
    ]);

    if (aggregationResult.length === 0) {
      await OfferModel.findByIdAndUpdate(offerId, { rating: 0, commentsCount: 0 }).exec();
      return;
    }

    const [metrics] = aggregationResult;
    const rating = Number(metrics.avgRating.toFixed(1));
    await OfferModel.findByIdAndUpdate(offerId, { rating, commentsCount: metrics.commentsCount }).exec();
  }

  private async setFavoriteFlagForList(offers: OfferEntity[], userId?: string): Promise<OfferEntity[]> {
    if (!userId) {
      return offers.map((offer) => {
        offer.isFavorite = false;
        return offer;
      });
    }

    const favoriteOfferIds = new Set(await this.favoriteService.getByUserId(userId));

    return offers.map((offer) => {
      const offerDocument = offer as OfferEntity & { _id: Types.ObjectId };
      offer.isFavorite = favoriteOfferIds.has(offerDocument._id.toString());
      return offer;
    });
  }

  private async setFavoriteFlagForOffer(offer: OfferEntity, userId?: string): Promise<OfferEntity> {
    if (!userId) {
      offer.isFavorite = false;
      return offer;
    }

    const offerDocument = offer as OfferEntity & { _id: Types.ObjectId };
    offer.isFavorite = await this.favoriteService.exists(userId, offerDocument._id.toString());
    return offer;
  }
}

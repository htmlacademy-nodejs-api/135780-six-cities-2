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

  async findById(id: string): Promise<OfferEntity | null> {
    return OfferModel.findById(id).exec();
  }

  async create(offerData: CreateOfferDto): Promise<OfferEntity> {
    return OfferModel.create({
      ...offerData,
      publicationDate: new Date(offerData.publicationDate),
      commentsCount: 0,
      rating: 0
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

  async getList(limit = DEFAULT_OFFERS_LIMIT): Promise<OfferEntity[]> {
    return OfferModel.find().sort({ publicationDate: -1 }).limit(limit).exec();
  }

  async getPremiumByCity(city: string): Promise<OfferEntity[]> {
    return OfferModel.find({ city, isPremium: true })
      .sort({ publicationDate: -1 })
      .limit(PREMIUM_OFFERS_LIMIT)
      .exec();
  }

  async getFavorites(userId: string): Promise<OfferEntity[]> {
    const offerIds = await this.favoriteService.getByUserId(userId);

    if (offerIds.length === 0) {
      return [];
    }

    return OfferModel.find({ _id: { $in: offerIds } })
      .sort({ publicationDate: -1 })
      .exec();
  }

  async setFavoriteStatus(offerId: string, userId: string, isFavorite: boolean): Promise<OfferEntity | null> {
    if (isFavorite) {
      await this.favoriteService.add(userId, offerId);
    } else {
      await this.favoriteService.remove(userId, offerId);
    }

    return OfferModel.findByIdAndUpdate(offerId, { isFavorite }, { new: true }).exec();
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
}

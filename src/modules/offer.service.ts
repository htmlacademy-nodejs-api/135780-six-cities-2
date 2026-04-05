import { Types } from 'mongoose';
import { CreateOfferDto } from '../dto/create-offer.dto.js';
import { UpdateOfferDto } from '../dto/update-offer.dto.js';
import { OfferEntity } from '../entities/offer.entity.js';
import { CommentModel } from '../models/comment.model.js';
import { OfferModel } from '../models/offer.model.js';
import { IOfferService } from '../type/offer-service.interface.js';
import { FavoriteService } from './favorite.service.js';

const DEFAULT_OFFERS_LIMIT = 60;
const PREMIUM_OFFERS_LIMIT = 3;

type OfferRatingAggregation = {
  _id: unknown;
  avgRating: number;
  commentsCount: number;
};

type OfferDocument = OfferEntity & {
  _id: Types.ObjectId;
};

export class OfferService implements IOfferService {
  constructor(private readonly favoriteService: FavoriteService = new FavoriteService()) {}

  public async findById(id: string, userId?: string): Promise<OfferEntity | null> {
    const offer = await OfferModel.findById(id).populate('author').exec();
    if (!offer) {
      return null;
    }

    return this.setFavoriteFlagForOffer(offer, userId);
  }

  public async create(offerData: CreateOfferDto, userId: string): Promise<OfferEntity> {
    const createdOffer = await OfferModel.create({
      title: offerData.title,
      description: offerData.description,
      publicationDate: new Date(offerData.publicationDate),
      city: offerData.city,
      previewImage: offerData.previewImage,
      images: offerData.images,
      isPremium: offerData.isPremium,
      type: offerData.type,
      bedrooms: offerData.bedrooms,
      maxAdults: offerData.maxAdults,
      price: offerData.price,
      goods: offerData.goods,
      latitude: offerData.coordinates.latitude,
      longitude: offerData.coordinates.longitude,
      author: new Types.ObjectId(userId),
      commentsCount: 0,
      rating: 0,
      isFavorite: false
    });

    const offer = await this.findById(createdOffer._id.toString(), userId);

    if (!offer) {
      throw new Error('Failed to load created offer');
    }

    return offer;
  }

  public async update(offerId: string, updateData: UpdateOfferDto): Promise<OfferEntity | null> {
    const { coordinates, publicationDate, ...restData } = updateData;
    const updatePayload: Partial<OfferEntity> = {
      ...restData,
      publicationDate: publicationDate ? new Date(publicationDate) : undefined
    };

    if (coordinates) {
      updatePayload.latitude = coordinates.latitude;
      updatePayload.longitude = coordinates.longitude;
    }

    return OfferModel.findByIdAndUpdate(offerId, updatePayload, { new: true })
      .populate('author')
      .exec();
  }

  public async delete(offerId: string): Promise<void> {
    await CommentModel.deleteMany({ offer: offerId }).exec();
    await this.favoriteService.removeByOfferId(offerId);
    await OfferModel.findByIdAndDelete(offerId).exec();
  }

  public async getList(limit = DEFAULT_OFFERS_LIMIT, userId?: string): Promise<OfferEntity[]> {
    const offers = await OfferModel.find().sort({ publicationDate: -1 }).limit(limit).exec();

    return this.setFavoriteFlagForList(offers, userId);
  }

  public async getPremiumByCity(city: string, userId?: string): Promise<OfferEntity[]> {
    const offers = await OfferModel.find({ city, isPremium: true })
      .sort({ publicationDate: -1 })
      .limit(PREMIUM_OFFERS_LIMIT)
      .exec();

    return this.setFavoriteFlagForList(offers, userId);
  }

  public async getFavorites(userId: string): Promise<OfferEntity[]> {
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

  public async setFavoriteStatus(offerId: string, userId: string, isFavorite: boolean): Promise<OfferEntity | null> {
    if (isFavorite) {
      await this.favoriteService.add(userId, offerId);
    } else {
      await this.favoriteService.remove(userId, offerId);
    }

    return this.findById(offerId, userId);
  }

  public async recalculateRatingAndCommentsCount(offerId: string): Promise<void> {
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
      const offerDocument = offer as OfferDocument;
      offer.isFavorite = favoriteOfferIds.has(offerDocument._id.toString());
      return offer;
    });
  }

  private async setFavoriteFlagForOffer(offer: OfferEntity, userId?: string): Promise<OfferEntity> {
    if (!userId) {
      offer.isFavorite = false;
      return offer;
    }

    const offerDocument = offer as OfferDocument;
    offer.isFavorite = await this.favoriteService.exists(userId, offerDocument._id.toString());
    return offer;
  }
}

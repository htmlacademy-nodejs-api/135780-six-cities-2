import { CreateOfferDto } from '../dto/create-offer.dto.js';
import { UpdateOfferDto } from '../dto/update-offer.dto.js';
import { OfferEntity } from '../entities/offer.entity.js';

export interface IOfferService {
  findById(id: string, userId?: string): Promise<OfferEntity | null>;
  create(offerData: CreateOfferDto, userId: string): Promise<OfferEntity>;
  update(offerId: string, updateData: UpdateOfferDto): Promise<OfferEntity | null>;
  delete(offerId: string): Promise<void>;
  getList(limit?: number, userId?: string): Promise<OfferEntity[]>;
  getPremiumByCity(city: string, userId?: string): Promise<OfferEntity[]>;
  getFavorites(userId: string): Promise<OfferEntity[]>;
  setFavoriteStatus(offerId: string, userId: string, isFavorite: boolean): Promise<OfferEntity | null>;
  recalculateRatingAndCommentsCount(offerId: string): Promise<void>;
}

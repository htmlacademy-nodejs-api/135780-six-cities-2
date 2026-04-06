export interface IFavoriteService {
  getByUserId(userId: string): Promise<string[]>;
  add(userId: string, offerId: string): Promise<void>;
  remove(userId: string, offerId: string): Promise<void>;
  removeByOfferId(offerId: string): Promise<void>;
  exists(userId: string, offerId: string): Promise<boolean>;
}

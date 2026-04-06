import { FavoriteModel } from '../models/favorite.model.js';
import { IFavoriteService } from '../type/favorite-service.interface.js';

export class FavoriteService implements IFavoriteService {
  async getByUserId(userId: string): Promise<string[]> {
    const favorites = await FavoriteModel.find({ user: userId }).select('offer').lean().exec();
    return favorites.map((favorite) => String(favorite.offer));
  }

  async add(userId: string, offerId: string): Promise<void> {
    await FavoriteModel.findOneAndUpdate(
      { user: userId, offer: offerId },
      { user: userId, offer: offerId },
      { upsert: true, new: true }
    ).exec();
  }

  async remove(userId: string, offerId: string): Promise<void> {
    await FavoriteModel.deleteOne({ user: userId, offer: offerId }).exec();
  }

  async removeByOfferId(offerId: string): Promise<void> {
    await FavoriteModel.deleteMany({ offer: offerId }).exec();
  }

  async exists(userId: string, offerId: string): Promise<boolean> {
    const favorite = await FavoriteModel.exists({ user: userId, offer: offerId });
    return favorite !== null;
  }
}

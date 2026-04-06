import { index, prop, Ref } from '@typegoose/typegoose';
import { UserEntity } from './user.entity.js';
import { OfferEntity } from './offer.entity.js';

@index({ user: 1, offer: 1 }, { unique: true })
export class FavoriteEntity {
  @prop({ ref: () => UserEntity, required: true })
  public user!: Ref<UserEntity>;

  @prop({ ref: () => OfferEntity, required: true })
  public offer!: Ref<OfferEntity>;

  @prop({ default: Date.now })
  public createdAt?: Date;

  @prop({ default: Date.now })
  public updatedAt?: Date;
}

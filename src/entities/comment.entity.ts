import { index, prop, Ref } from '@typegoose/typegoose';
import { UserEntity } from './user.entity.js';
import { OfferEntity } from './offer.entity.js';

@index({ offer: 1, publicationDate: -1 })
export class CommentEntity {
  @prop({ required: true })
  public text!: string;

  @prop({ required: true })
  public publicationDate!: Date;

  @prop({ required: true })
  public rating!: number;

  @prop({ ref: () => UserEntity, required: true })
  public user!: Ref<UserEntity>;

  @prop({ ref: () => OfferEntity, required: true })
  public offer!: Ref<OfferEntity>;

  @prop({ default: Date.now })
  public createdAt?: Date;

  @prop({ default: Date.now })
  public updatedAt?: Date;
}

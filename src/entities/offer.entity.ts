import { index, prop, Ref } from '@typegoose/typegoose';
import { UserEntity } from './user.entity.js';

@index({ publicationDate: -1 })
@index({ city: 1, isPremium: 1, publicationDate: -1 })
export class OfferEntity {
  @prop({ required: true })
  public title!: string;

  @prop({ required: true })
  public description!: string;

  @prop({ required: true })
  public publicationDate!: Date;

  @prop({ required: true })
  public city!: string;

  @prop({ required: true })
  public previewImage!: string;

  @prop({ type: () => [String], required: true })
  public images!: string[];

  @prop({ required: true })
  public isPremium!: boolean;

  @prop({ required: true, default: false })
  public isFavorite!: boolean;

  @prop({ required: true, default: 0 })
  public rating!: number;

  @prop({ required: true, default: 0 })
  public commentsCount!: number;

  @prop({ required: true })
  public type!: string;

  @prop({ required: true })
  public bedrooms!: number;

  @prop({ required: true })
  public maxAdults!: number;

  @prop({ required: true })
  public price!: number;

  @prop({ type: () => [String], required: true })
  public goods!: string[];

  @prop({ ref: () => UserEntity, required: true })
  public author!: Ref<UserEntity>;

  @prop({ required: true })
  public latitude!: number;

  @prop({ required: true })
  public longitude!: number;

  @prop({ default: Date.now })
  public createdAt?: Date;

  @prop({ default: Date.now })
  public updatedAt?: Date;
}

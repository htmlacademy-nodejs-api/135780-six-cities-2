import { Expose, Transform } from 'class-transformer';

export class OfferRdo {
  @Expose({ name: '_id' })
  @Transform(({ value }) => value.toString())
  public id!: string;

  @Expose()
  public title!: string;

  @Expose()
  public description!: string;

  @Expose()
  public publicationDate!: Date;

  @Expose()
  public city!: string;

  @Expose()
  public previewImage?: string;

  @Expose()
  public images!: string[];

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public isFavorite!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public commentsCount!: number;

  @Expose()
  public type!: string;

  @Expose()
  public bedrooms!: number;

  @Expose()
  public maxAdults!: number;

  @Expose()
  public price!: number;

  @Expose()
  public goods!: string[];

  @Expose()
  public hostName!: string;

  @Expose()
  public hostEmail!: string;

  @Expose()
  public hostAvatar?: string;

  @Expose()
  public hostType!: string;

  @Expose()
  public latitude!: number;

  @Expose()
  public longitude!: number;
}

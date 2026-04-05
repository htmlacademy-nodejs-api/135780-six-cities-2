import { Expose, Transform } from 'class-transformer';
import config from '../config.js';

type AuthorPayload = {
  _id?: unknown;
  name?: string;
  email?: string;
  avatar?: string;
  type?: string;
};

function normalizeId(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object' && 'toString' in value && typeof value.toString === 'function') {
    return value.toString();
  }

  return '';
}

export class OfferRdo {
  @Expose({ name: '_id' })
  @Transform(({ value }) => normalizeId(value))
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
  public previewImage!: string;

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
  @Transform(({ obj }) => {
    const author = obj.author as AuthorPayload | undefined;

    return {
      id: normalizeId(author?._id),
      name: author?.name ?? '',
      email: author?.email ?? '',
      avatarUrl: author?.avatar ?? config.get('DEFAULT_AVATAR_URL'),
      type: author?.type ?? ''
    };
  })
  public host!: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    type: string;
  };

  @Expose()
  @Transform(({ obj }) => ({
    latitude: obj.latitude,
    longitude: obj.longitude
  }))
  public coordinates!: {
    latitude: number;
    longitude: number;
  };
}

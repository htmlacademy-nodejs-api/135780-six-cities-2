import { Expose, Transform } from 'class-transformer';

function normalizeId(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object' && 'toString' in value && typeof value.toString === 'function') {
    return value.toString();
  }

  return '';
}

export class OfferPreviewRdo {
  @Expose({ name: '_id' })
  @Transform(({ value }) => normalizeId(value))
  public id!: string;

  @Expose()
  public price!: number;

  @Expose()
  public title!: string;

  @Expose()
  public type!: string;

  @Expose()
  public isFavorite!: boolean;

  @Expose()
  public publicationDate!: Date;

  @Expose()
  public city!: string;

  @Expose()
  public previewImage!: string;

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public commentsCount!: number;
}

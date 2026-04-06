import { Expose, Transform } from 'class-transformer';
import config from '../config.js';

type UserPayload = {
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

export class CommentRdo {
  @Expose({ name: '_id' })
  @Transform(({ value }) => normalizeId(value))
  public id!: string;

  @Expose()
  public text!: string;

  @Expose()
  public publicationDate!: Date;

  @Expose()
  public rating!: number;

  @Expose()
  @Transform(({ obj }) => {
    const user = obj.user as UserPayload | undefined;

    return {
      id: normalizeId(user?._id),
      name: user?.name ?? '',
      email: user?.email ?? '',
      avatarUrl: user?.avatar ?? config.get('DEFAULT_AVATAR_URL'),
      type: user?.type ?? ''
    };
  })
  public user!: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    type: string;
  };
}

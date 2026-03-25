import { Expose, Transform } from 'class-transformer';

export class UserRdo {
  @Expose({ name: '_id' })
  @Transform(({ value }) => value.toString())
  public id!: string;

  @Expose()
  public name!: string;

  @Expose()
  public email!: string;

  @Expose({ name: 'avatar' })
  public avatarUrl?: string;

  @Expose()
  public type!: string;
}

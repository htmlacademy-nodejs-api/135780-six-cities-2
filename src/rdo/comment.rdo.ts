import { Expose, Transform } from 'class-transformer';

export class CommentRdo {
  @Expose({ name: '_id' })
  @Transform(({ value }) => value.toString())
  public id!: string;

  @Expose()
  public text!: string;

  @Expose()
  public publicationDate!: Date;

  @Expose()
  public rating!: number;

  @Expose()
  public user!: unknown;

  @Expose()
  public offer!: unknown;
}

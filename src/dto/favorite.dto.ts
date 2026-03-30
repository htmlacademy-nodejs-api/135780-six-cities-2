import { IsMongoId } from 'class-validator';

export class FavoriteDto {
  @IsMongoId()
  public userId!: string;
}

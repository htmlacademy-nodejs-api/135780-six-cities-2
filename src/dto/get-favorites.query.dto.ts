import { IsMongoId } from 'class-validator';

export class GetFavoritesQueryDto {
  @IsMongoId()
  public userId!: string;
}

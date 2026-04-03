import { Type } from 'class-transformer';
import { IsNumber, IsString, Length, Max, Min } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @Length(5, 1024)
  public text!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  public rating!: number;
}

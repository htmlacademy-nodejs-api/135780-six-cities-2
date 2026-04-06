import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested
} from 'class-validator';

class CoordinatesDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  public latitude!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  public longitude!: number;
}

export class CreateOfferDto {
  @IsString()
  @Length(10, 100)
  public title!: string;

  @IsString()
  @Length(20, 1024)
  public description!: string;

  @IsISO8601()
  public publicationDate!: string;

  @IsString()
  @IsIn(['Paris', 'Cologne', 'Brussels', 'Amsterdam', 'Hamburg', 'Dusseldorf'])
  public city!: string;

  @IsString()
  public previewImage!: string;

  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  public images!: string[];

  @IsBoolean()
  public isPremium!: boolean;

  @IsString()
  @IsIn(['apartment', 'house', 'room', 'hotel'])
  public type!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8)
  public bedrooms!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  public maxAdults!: number;

  @Type(() => Number)
  @IsInt()
  @Min(100)
  @Max(100000)
  public price!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  public goods!: string[];

  @ValidateNested()
  @Type(() => CoordinatesDto)
  public coordinates!: CoordinatesDto;
}

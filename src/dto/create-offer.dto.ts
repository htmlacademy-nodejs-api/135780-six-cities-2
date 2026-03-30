import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min
} from 'class-validator';

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

  @IsOptional()
  @IsString()
  public previewImage?: string;

  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  public images!: string[];

  @IsBoolean()
  public isPremium!: boolean;

  @IsBoolean()
  public isFavorite!: boolean;

  @IsString()
  @IsIn(['apartment', 'house', 'room', 'hotel'])
  public type!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(8)
  public bedrooms!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  public maxAdults!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(100)
  @Max(100000)
  public price!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  public goods!: string[];

  @IsString()
  public hostName!: string;

  @IsEmail()
  public hostEmail!: string;

  @IsOptional()
  @IsString()
  public hostAvatar?: string;

  @IsString()
  @IsIn(['обычный', 'pro'])
  public hostType!: string;

  @Type(() => Number)
  @IsNumber()
  public latitude!: number;

  @Type(() => Number)
  @IsNumber()
  public longitude!: number;
}

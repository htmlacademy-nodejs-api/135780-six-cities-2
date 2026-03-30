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

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  @Length(10, 100)
  public title?: string;

  @IsOptional()
  @IsString()
  @Length(20, 1024)
  public description?: string;

  @IsOptional()
  @IsISO8601()
  public publicationDate?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Paris', 'Cologne', 'Brussels', 'Amsterdam', 'Hamburg', 'Dusseldorf'])
  public city?: string;

  @IsOptional()
  @IsString()
  public previewImage?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(6)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  public images?: string[];

  @IsOptional()
  @IsBoolean()
  public isPremium?: boolean;

  @IsOptional()
  @IsBoolean()
  public isFavorite?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['apartment', 'house', 'room', 'hotel'])
  public type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(8)
  public bedrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  public maxAdults?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  @Max(100000)
  public price?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  public goods?: string[];

  @IsOptional()
  @IsString()
  public hostName?: string;

  @IsOptional()
  @IsEmail()
  public hostEmail?: string;

  @IsOptional()
  @IsString()
  public hostAvatar?: string;

  @IsOptional()
  @IsString()
  @IsIn(['обычный', 'pro'])
  public hostType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  public latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  public longitude?: number;
}

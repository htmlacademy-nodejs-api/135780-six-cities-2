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
  IsOptional,
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
  @IsString()
  @IsIn(['apartment', 'house', 'room', 'hotel'])
  public type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8)
  public bedrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  public maxAdults?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(100)
  @Max(100000)
  public price?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  public goods?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  public coordinates?: CoordinatesDto;
}

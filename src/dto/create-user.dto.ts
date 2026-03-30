import { IsEmail, IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(1, 15)
  public name!: string;

  @IsEmail()
  public email!: string;

  @IsOptional()
  @IsString()
  @Matches(/\.(jpg|png)$/i)
  public avatar?: string;

  @IsString()
  @Length(6, 12)
  public password!: string;

  @IsString()
  @IsIn(['обычный', 'pro'])
  public type!: string;
}

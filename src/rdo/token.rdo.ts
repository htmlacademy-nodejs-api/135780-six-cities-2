import { Expose } from 'class-transformer';

export class TokenRdo {
  @Expose()
  public token!: string;
}

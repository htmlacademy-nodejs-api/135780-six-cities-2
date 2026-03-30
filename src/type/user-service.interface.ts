import { CreateUserDto } from '../dto/create-user.dto.js';
import { UserEntity } from '../entities/user.entity.js';

export interface IUserService {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(userData: CreateUserDto): Promise<UserEntity>;
  updateAvatar(id: string, avatarPath: string): Promise<UserEntity | null>;
}

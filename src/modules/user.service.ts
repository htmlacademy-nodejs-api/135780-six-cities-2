import { createHash } from 'node:crypto';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UserEntity } from '../entities/user.entity.js';
import { UserModel } from '../models/user.model.js';
import { IUserService } from '../type/user-service.interface.js';

const PASSWORD_SALT = 'six-cities-static-salt';

export class UserService implements IUserService {
  async findById(id: string): Promise<UserEntity | null> {
    return UserModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return UserModel.findOne({ email }).exec();
  }

  async create(userData: CreateUserDto): Promise<UserEntity> {
    const password = createHash('sha256')
      .update(`${userData.password}:${PASSWORD_SALT}`)
      .digest('hex');

    return UserModel.create({
      ...userData,
      password
    });
  }

  async updateAvatar(id: string, avatarPath: string): Promise<UserEntity | null> {
    return UserModel.findByIdAndUpdate(id, { avatar: avatarPath }, { new: true }).exec();
  }
}

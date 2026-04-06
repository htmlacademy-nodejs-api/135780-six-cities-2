import { CreateUserDto } from '../dto/create-user.dto.js';
import { UserEntity } from '../entities/user.entity.js';
import { UserModel } from '../models/user.model.js';
import { IUserService } from '../type/user-service.interface.js';
import config from '../config.js';
import { hashPassword } from '../utils/password.js';

export class UserService implements IUserService {
  async findById(id: string): Promise<UserEntity | null> {
    return UserModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return UserModel.findOne({ email }).exec();
  }

  async create(userData: CreateUserDto): Promise<UserEntity> {
    const existedUser = await this.findByEmail(userData.email);
    if (existedUser) {
      throw new Error('USER_EMAIL_ALREADY_EXISTS');
    }

    const password = hashPassword(userData.password);

    return UserModel.create({
      ...userData,
      avatar: userData.avatar ?? config.get('DEFAULT_AVATAR_URL'),
      password
    });
  }

  async updateAvatar(id: string, avatarPath: string): Promise<UserEntity | null> {
    return UserModel.findByIdAndUpdate(id, { avatar: avatarPath }, { new: true }).exec();
  }
}

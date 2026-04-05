import { TextEncoder } from 'node:util';
import { SignJWT, jwtVerify } from 'jose';
import { Types } from 'mongoose';
import config from '../config.js';
import { UserEntity } from '../entities/user.entity.js';
import { IAuthService } from '../type/auth-service.interface.js';
import { hashPassword } from '../utils/password.js';
import { UserService } from './user.service.js';

const JWT_ALGORITHM = 'HS256';
const JWT_EXPIRES_IN = '7d';

type AuthTokenPayload = {
  userId: string;
};

export class AuthService implements IAuthService {
  private readonly revokedTokens = new Set<string>();
  private readonly jwtSecret: Uint8Array;

  constructor(private readonly userService: UserService = new UserService()) {
    const jwtSecret = config.get('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    this.jwtSecret = new TextEncoder().encode(jwtSecret);
  }

  public hashPassword(password: string): string {
    return hashPassword(password);
  }

  public async login(email: string, password: string): Promise<string> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new Error('User with this email does not exist');
    }

    const passwordHash = this.hashPassword(password);
    if (user.password !== passwordHash) {
      throw new Error('Invalid password');
    }

    const userDocument = user as UserEntity & { _id: Types.ObjectId };

    return new SignJWT({ userId: userDocument._id.toString() })
      .setProtectedHeader({ alg: JWT_ALGORITHM })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRES_IN)
      .sign(this.jwtSecret);
  }

  public logout(token: string): void {
    this.revokedTokens.add(token);
  }

  public async verifyToken(token: string): Promise<boolean> {
    if (this.revokedTokens.has(token)) {
      return false;
    }

    try {
      await jwtVerify(token, this.jwtSecret, { algorithms: [JWT_ALGORITHM] });
      return true;
    } catch {
      return false;
    }
  }

  public async getUserIdByToken(token: string): Promise<string | null> {
    const isTokenValid = await this.verifyToken(token);
    if (!isTokenValid) {
      return null;
    }

    const verifiedToken = await jwtVerify<AuthTokenPayload>(token, this.jwtSecret, { algorithms: [JWT_ALGORITHM] });
    const userId = verifiedToken.payload.userId;
    return typeof userId === 'string' ? userId : null;
  }

  public async getAuthStatus(token: string): Promise<UserEntity | null> {
    const userId = await this.getUserIdByToken(token);
    if (!userId) {
      return null;
    }

    return this.userService.findById(userId);
  }
}

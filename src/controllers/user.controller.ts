import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { LoginUserDto } from '../dto/login-user.dto.js';
import { BaseController, HttpError, HttpMethod } from '../libs/rest/index.js';
import { AnonymousRouteMiddleware } from '../middlewares/anonymous-route.middleware.js';
import { PrivateRouteMiddleware } from '../middlewares/private-route.middleware.js';
import { UploadFileMiddleware } from '../middlewares/upload-file.middleware.js';
import { ValidateDtoMiddleware } from '../middlewares/validate-dto.middleware.js';
import { AuthService } from '../modules/auth.service.js';
import { UserService } from '../modules/user.service.js';
import { TokenRdo } from '../rdo/token.rdo.js';
import { UserRdo } from '../rdo/user.rdo.js';

const AVATAR_MIME_TYPES = ['image/jpeg', 'image/png'];

export class UserController extends BaseController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly uploadDirectory: string
  ) {
    super();

    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new AnonymousRouteMiddleware(this.authService),
        new ValidateDtoMiddleware(CreateUserDto)
      ]
    });

    this.addRoute({
      path: '/login',
      method: HttpMethod.Post,
      handler: this.login,
      middlewares: [
        new AnonymousRouteMiddleware(this.authService),
        new ValidateDtoMiddleware(LoginUserDto)
      ]
    });

    this.addRoute({
      path: '/login',
      method: HttpMethod.Get,
      handler: this.show,
      middlewares: [
        new PrivateRouteMiddleware(this.authService)
      ]
    });

    this.addRoute({
      path: '/logout',
      method: HttpMethod.Post,
      handler: this.logout,
      middlewares: [
        new PrivateRouteMiddleware(this.authService)
      ]
    });

    this.addRoute({
      path: '/avatar',
      method: HttpMethod.Post,
      handler: this.uploadAvatar,
      middlewares: [
        new PrivateRouteMiddleware(this.authService),
        new UploadFileMiddleware('avatar', this.uploadDirectory, AVATAR_MIME_TYPES)
      ]
    });
  }

  private create = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.create(req.body as CreateUserDto);
      this.created(res, UserRdo, user);
    } catch (error) {
      const isKnownConflict = error instanceof Error && error.message === 'USER_EMAIL_ALREADY_EXISTS';
      const isMongoConflict = typeof error === 'object'
        && error !== null
        && 'code' in error
        && (error as { code?: number }).code === 11000;

      if (isKnownConflict || isMongoConflict) {
        throw new HttpError(StatusCodes.CONFLICT, 'User with this email already exists');
      }

      throw error;
    }
  };

  private login = async (req: Request, res: Response) => {
    const body = req.body as LoginUserDto;

    try {
      const token = await this.authService.login(body.email, body.password);
      this.ok(res, TokenRdo, { token });
    } catch {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
    }
  };

  private show = async (_req: Request, res: Response) => {
    const userId = this.getCurrentUserId(res);
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'User is not authorized');
    }

    this.ok(res, UserRdo, user);
  };

  private logout = async (_req: Request, res: Response) => {
    const token = this.getCurrentToken(res);
    this.authService.logout(token);
    this.noContent(res);
  };

  private uploadAvatar = async (req: Request, res: Response) => {
    if (!req.file) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Avatar file is required');
    }

    const userId = this.getCurrentUserId(res);
    const avatarPath = `/static/${req.file.filename}`;
    const updatedUser = await this.userService.updateAvatar(userId, avatarPath);

    if (!updatedUser) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'User not found');
    }

    this.ok(res, UserRdo, updatedUser);
  };
}

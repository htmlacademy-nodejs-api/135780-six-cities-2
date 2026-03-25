import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { LoginUserDto } from '../dto/login-user.dto.js';
import { AuthService } from '../modules/auth.service.js';
import { UserService } from '../modules/user.service.js';
import { TokenRdo } from '../rdo/token.rdo.js';
import { UserRdo } from '../rdo/user.rdo.js';
import { BaseController, HttpError, HttpMethod } from '../libs/rest/index.js';

export class UserController extends BaseController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {
    super();

    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.register
    });
    this.addRoute({
      path: '/login',
      method: HttpMethod.Post,
      handler: this.login
    });
    this.addRoute({
      path: '/login',
      method: HttpMethod.Get,
      handler: this.checkAuth
    });
    this.addRoute({
      path: '/logout',
      method: HttpMethod.Post,
      handler: this.logout
    });
  }

  private register = async (req: Request, res: Response) => {
    const user = await this.userService.create(req.body as CreateUserDto);
    this.created(res, UserRdo, user);
  };

  private login = async (req: Request, res: Response) => {
    const body = req.body as LoginUserDto;
    const token = await this.authService.login(body.email, body.password);
    this.ok(res, TokenRdo, { token });
  };

  private checkAuth = async (req: Request, res: Response) => {
    const token = this.extractToken(req);
    const user = await this.authService.getAuthStatus(token);

    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'User is not authorized');
    }

    this.ok(res, UserRdo, user);
  };

  private logout = async (req: Request, res: Response) => {
    const token = this.extractToken(req);
    this.authService.logout(token);
    this.noContent(res);
  };

  private extractToken(req: Request): string {
    try {
      return this.parseToken(req);
    } catch {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Authorization token is missing or invalid');
    }
  }
}

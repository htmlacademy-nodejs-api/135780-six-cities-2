import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpError, MiddlewareInterface } from '../libs/rest/index.js';
import { AuthService } from '../modules/auth.service.js';

export class AnonymousRouteMiddleware implements MiddlewareInterface {
  constructor(private readonly authService: AuthService) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const authorizationHeader = req.header('Authorization');
    if (!authorizationHeader) {
      next();
      return;
    }

    const [scheme, token] = authorizationHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      next();
      return;
    }

    const userId = await this.authService.getUserIdByToken(token);
    if (userId) {
      throw new HttpError(StatusCodes.FORBIDDEN, 'Route is available only for anonymous users');
    }

    next();
  }
}

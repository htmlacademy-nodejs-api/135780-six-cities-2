import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../modules/auth.service.js';
import { HttpError, MiddlewareInterface } from '../libs/rest/index.js';

export class PrivateRouteMiddleware implements MiddlewareInterface {
  constructor(private readonly authService: AuthService) {}

  public async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authorizationHeader = req.header('Authorization');
    if (!authorizationHeader) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Authorization header is required');
    }

    const [scheme, token] = authorizationHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Authorization header format must be: Bearer <token>');
    }

    const userId = await this.authService.getUserIdByToken(token);
    if (!userId) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token');
    }

    res.locals.userId = userId;
    res.locals.token = token;
    next();
  }
}

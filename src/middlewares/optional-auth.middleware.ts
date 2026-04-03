import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../modules/auth.service.js';
import { MiddlewareInterface } from '../libs/rest/index.js';

export class OptionalAuthMiddleware implements MiddlewareInterface {
  constructor(private readonly authService: AuthService) {}

  public async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      res.locals.userId = userId;
      res.locals.token = token;
    }

    next();
  }
}

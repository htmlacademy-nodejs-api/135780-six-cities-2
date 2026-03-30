import { ClassConstructor, plainToInstance } from 'class-transformer';
import { Request, RequestHandler, Response, Router } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { HttpError } from '../errors/http-error.js';
import { ControllerInterface } from './controller.interface.js';
import { RouteInterface } from '../types/route.interface.js';

export abstract class BaseController implements ControllerInterface {
  public readonly router: Router;

  constructor() {
    this.router = Router();
  }

  protected addRoute(route: RouteInterface): void {
    const middlewares: RequestHandler[] = (route.middlewares ?? []).map((middleware) => middleware.execute.bind(middleware));
    const wrappedHandler = asyncHandler(route.handler);

    this.router[route.method](route.path, ...middlewares, wrappedHandler);
  }

  protected ok<T>(res: Response, dto: ClassConstructor<T>, data: unknown): void {
    this.send(res, StatusCodes.OK, dto, data);
  }

  protected created<T>(res: Response, dto: ClassConstructor<T>, data: unknown): void {
    this.send(res, StatusCodes.CREATED, dto, data);
  }

  protected noContent(res: Response): void {
    res.status(StatusCodes.NO_CONTENT).send();
  }

  protected send<T>(res: Response, statusCode: number, dto: ClassConstructor<T>, data: unknown): void {
    const responseData = plainToInstance(dto, data, { excludeExtraneousValues: true });
    res.status(statusCode).json(responseData);
  }

  protected parseToken(req: Request): string {
    const authorizationHeader = req.header('Authorization');
    if (!authorizationHeader) {
      throw new Error('Authorization header is required');
    }

    const [scheme, token] = authorizationHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new Error('Authorization header format must be: Bearer <token>');
    }

    return token;
  }

  protected getParam(req: Request, key: string): string {
    const rawParam = req.params[key];
    const param = Array.isArray(rawParam) ? rawParam[0] : rawParam;

    if (!param) {
      throw new HttpError(StatusCodes.BAD_REQUEST, `Route param "${key}" is required`);
    }

    return param;
  }
}

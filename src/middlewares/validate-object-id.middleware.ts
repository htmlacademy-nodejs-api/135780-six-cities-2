import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { HttpError, MiddlewareInterface } from '../libs/rest/index.js';

export class ValidateObjectIdMiddleware implements MiddlewareInterface {
  constructor(private readonly paramName: string) {}

  public execute(req: Request, _res: Response, next: NextFunction): void {
    const rawParam = req.params[this.paramName];
    const param = Array.isArray(rawParam) ? rawParam[0] : rawParam;

    if (!param || !Types.ObjectId.isValid(param)) {
      throw new HttpError(StatusCodes.BAD_REQUEST, `Param "${this.paramName}" must be a valid ObjectId`);
    }

    next();
  }
}

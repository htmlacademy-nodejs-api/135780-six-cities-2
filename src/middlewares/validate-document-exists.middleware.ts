import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpError, MiddlewareInterface } from '../libs/rest/index.js';
import { DocumentExistsInterface } from '../type/document-exists.interface.js';

export class ValidateDocumentExistsMiddleware<T> implements MiddlewareInterface {
  constructor(
    private readonly entityService: DocumentExistsInterface<T>,
    private readonly paramName: string,
    private readonly notFoundMessage: string
  ) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const rawParam = req.params[this.paramName];
    const id = Array.isArray(rawParam) ? rawParam[0] : rawParam;

    if (!id) {
      throw new HttpError(StatusCodes.BAD_REQUEST, `Param "${this.paramName}" is required`);
    }

    const entity = await this.entityService.findById(id);
    if (!entity) {
      throw new HttpError(StatusCodes.NOT_FOUND, this.notFoundMessage);
    }

    next();
  }
}

import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../../../logger.js';
import { HttpError } from '../errors/http-error.js';
import { ExceptionFilterInterface } from './exception-filter.interface.js';

type ErrorResponse = {
  error: string;
  details: string;
};

export class BaseExceptionFilter implements ExceptionFilterInterface {
  public catch(error: Error, _req: Request, res: Response, _next: NextFunction): void {
    if (error instanceof HttpError) {
      logger.warn({ err: error }, `HTTP error: ${error.message}`);
      const response: ErrorResponse = {
        error: 'HTTP_ERROR',
        details: error.details
      };
      res.status(error.statusCode).json(response);
      return;
    }

    logger.error({ err: error }, `Server error: ${error.message}`);
    const response: ErrorResponse = {
      error: 'INTERNAL_SERVER_ERROR',
      details: 'Unexpected server error'
    };
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response);
  }
}

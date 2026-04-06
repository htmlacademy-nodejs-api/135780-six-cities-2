import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../../../logger.js';
import { HttpError } from '../errors/http-error.js';
import { ExceptionFilterInterface } from './exception-filter.interface.js';

type ErrorResponse = {
  message: string;
  details?: string[];
};

export class BaseExceptionFilter implements ExceptionFilterInterface {
  public catch(error: Error, _req: Request, res: Response, _next: NextFunction): void {
    if (error instanceof HttpError) {
      logger.warn({ err: error }, `HTTP error: ${error.message}`);
      const response: ErrorResponse = {
        message: error.message,
        details: error.details.length > 0 ? error.details : undefined
      };
      res.status(error.statusCode).json(response);
      return;
    }

    logger.error({ err: error }, `Server error: ${error.message}`);
    const response: ErrorResponse = {
      message: 'Unexpected server error'
    };
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response);
  }
}

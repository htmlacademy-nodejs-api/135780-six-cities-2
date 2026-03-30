import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpError, MiddlewareInterface } from '../libs/rest/index.js';

type RequestTarget = 'body' | 'query' | 'params';

function formatValidationErrors(errors: ValidationError[]): string[] {
  const validationMessages: string[] = [];

  errors.forEach((error) => {
    if (error.constraints) {
      validationMessages.push(...Object.values(error.constraints));
    }
    if (error.children && error.children.length > 0) {
      validationMessages.push(...formatValidationErrors(error.children));
    }
  });

  return validationMessages;
}

export class ValidateDtoMiddleware<T extends object> implements MiddlewareInterface {
  constructor(
    private readonly dtoClass: ClassConstructor<T>,
    private readonly target: RequestTarget = 'body'
  ) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const dtoInstance = plainToInstance(this.dtoClass, req[this.target], {
      enableImplicitConversion: true
    });

    const errors = await validate(dtoInstance, {
      whitelist: true,
      forbidNonWhitelisted: true
    });

    if (errors.length > 0) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        JSON.stringify({
          message: 'Validation failed',
          errors: formatValidationErrors(errors)
        })
      );
    }

    req[this.target] = dtoInstance as Request['body' | 'query' | 'params'];
    next();
  }
}

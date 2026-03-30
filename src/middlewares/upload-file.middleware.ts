import fs from 'node:fs';
import path from 'node:path';
import { extension } from 'mime-types';
import multer from 'multer';
import { nanoid } from 'nanoid';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpError, MiddlewareInterface } from '../libs/rest/index.js';

export class UploadFileMiddleware implements MiddlewareInterface {
  private readonly upload: multer.Multer;

  constructor(
    private readonly fieldName: string,
    private readonly uploadDirectory: string
  ) {
    fs.mkdirSync(this.uploadDirectory, { recursive: true });

    const storage = multer.diskStorage({
      destination: (_req, _file, callback) => callback(null, this.uploadDirectory),
      filename: (_req, file, callback) => {
        const mimeExtension = extension(file.mimetype);
        const originalExtension = path.extname(file.originalname).replace('.', '');
        const fileExtension = mimeExtension || originalExtension || 'bin';
        callback(null, `${nanoid()}.${fileExtension}`);
      }
    });

    this.upload = multer({ storage });
  }

  public execute(req: Request, res: Response, next: NextFunction): void {
    const uploadHandler = this.upload.single(this.fieldName);
    uploadHandler(req, res, (error) => {
      if (error) {
        next(new HttpError(StatusCodes.BAD_REQUEST, `File upload failed: ${error.message}`));
        return;
      }

      next();
    });
  }
}

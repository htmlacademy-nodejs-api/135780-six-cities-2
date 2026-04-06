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
    private readonly uploadDirectory: string,
    private readonly allowedMimeTypes: string[] = []
  ) {
    const storage = multer.diskStorage({
      destination: (_req, _file, callback) => {
        fs.mkdir(this.uploadDirectory, { recursive: true }, (error) => {
          if (error) {
            callback(error, this.uploadDirectory);
            return;
          }

          callback(null, this.uploadDirectory);
        });
      },
      filename: (_req, file, callback) => {
        const mimeExtension = extension(file.mimetype);
        const originalExtension = path.extname(file.originalname).replace('.', '');
        const fileExtension = mimeExtension || originalExtension || 'bin';
        callback(null, `${nanoid()}.${fileExtension}`);
      }
    });

    const fileFilter: multer.Options['fileFilter'] = (_req, file, callback) => {
      if (this.allowedMimeTypes.length === 0) {
        callback(null, true);
        return;
      }

      if (this.allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Unsupported file type: ${file.mimetype}`));
    };

    this.upload = multer({
      storage,
      fileFilter
    });
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

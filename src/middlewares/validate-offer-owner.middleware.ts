import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { OfferEntity } from '../entities/offer.entity.js';
import { HttpError, MiddlewareInterface } from '../libs/rest/index.js';
import { OfferService } from '../modules/offer.service.js';

type OfferDocument = OfferEntity & {
  author?: string | { _id?: string; toString?: () => string };
};

export class ValidateOfferOwnerMiddleware implements MiddlewareInterface {
  constructor(private readonly offerService: OfferService) {}

  public async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = res.locals.userId as string | undefined;
    if (!userId) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'User is not authorized');
    }

    const rawOfferId = req.params.offerId;
    const offerId = Array.isArray(rawOfferId) ? rawOfferId[0] : rawOfferId;
    if (!offerId) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Param "offerId" is required');
    }

    const offer = await this.offerService.findById(offerId);
    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Offer not found');
    }

    const offerDocument = offer as OfferDocument;
    const author = offerDocument.author;
    const authorId = typeof author === 'string'
      ? author
      : author?._id?.toString?.() ?? author?.toString?.();

    if (!authorId || authorId !== userId) {
      throw new HttpError(StatusCodes.FORBIDDEN, 'Only the owner can modify this offer');
    }

    next();
  }
}

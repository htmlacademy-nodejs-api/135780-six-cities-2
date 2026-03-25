import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { CreateOfferDto } from '../dto/create-offer.dto.js';
import { UpdateOfferDto } from '../dto/update-offer.dto.js';
import { AuthService } from '../modules/auth.service.js';
import { OfferService } from '../modules/offer.service.js';
import { OfferRdo } from '../rdo/offer.rdo.js';
import { BaseController, HttpError, HttpMethod } from '../libs/rest/index.js';

export class OfferController extends BaseController {
  constructor(
    private readonly offerService: OfferService,
    private readonly authService: AuthService
  ) {
    super();

    this.addRoute({
      path: '/',
      method: HttpMethod.Get,
      handler: this.index
    });
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.show
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Patch,
      handler: this.update
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete
    });
    this.addRoute({
      path: '/premium/:city',
      method: HttpMethod.Get,
      handler: this.premium
    });
    this.addRoute({
      path: '/favorites',
      method: HttpMethod.Get,
      handler: this.favorites
    });
    this.addRoute({
      path: '/:offerId/favorite',
      method: HttpMethod.Post,
      handler: this.addFavorite
    });
    this.addRoute({
      path: '/:offerId/favorite',
      method: HttpMethod.Delete,
      handler: this.removeFavorite
    });
  }

  private index = async (req: Request, res: Response) => {
    const query = req.query as { limit?: string };
    const limit = query.limit ? Number(query.limit) : undefined;
    const offers = await this.offerService.getList(limit);
    this.ok(res, OfferRdo, offers);
  };

  private create = async (req: Request, res: Response) => {
    const body = req.body as CreateOfferDto;
    const offerData: CreateOfferDto = {
      ...body,
      publicationDate: new Date(body.publicationDate)
    };
    const offer = await this.offerService.create(offerData);
    this.created(res, OfferRdo, offer);
  };

  private show = async (req: Request, res: Response) => {
    const offerId = this.getParam(req, 'offerId');
    const offer = await this.offerService.findById(offerId);
    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Offer not found');
    }

    this.ok(res, OfferRdo, offer);
  };

  private update = async (req: Request, res: Response) => {
    const offerId = this.getParam(req, 'offerId');
    const updateData: UpdateOfferDto = { ...(req.body as UpdateOfferDto) };
    if (updateData.publicationDate) {
      updateData.publicationDate = new Date(updateData.publicationDate);
    }

    const offer = await this.offerService.update(offerId, updateData);
    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Offer not found');
    }

    this.ok(res, OfferRdo, offer);
  };

  private delete = async (req: Request, res: Response) => {
    const offerId = this.getParam(req, 'offerId');
    await this.offerService.delete(offerId);
    this.noContent(res);
  };

  private premium = async (req: Request, res: Response) => {
    const city = this.getParam(req, 'city');
    const offers = await this.offerService.getPremiumByCity(city);
    this.ok(res, OfferRdo, offers);
  };

  private favorites = async (req: Request, res: Response) => {
    const userId = await this.extractUserId(req);
    const offers = await this.offerService.getFavorites(userId);
    this.ok(res, OfferRdo, offers);
  };

  private addFavorite = async (req: Request, res: Response) => {
    const userId = await this.extractUserId(req);
    const offerId = this.getParam(req, 'offerId');
    const offer = await this.offerService.setFavoriteStatus(offerId, userId, true);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Offer not found');
    }

    this.ok(res, OfferRdo, offer);
  };

  private removeFavorite = async (req: Request, res: Response) => {
    const userId = await this.extractUserId(req);
    const offerId = this.getParam(req, 'offerId');
    const offer = await this.offerService.setFavoriteStatus(offerId, userId, false);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Offer not found');
    }

    this.ok(res, OfferRdo, offer);
  };

  private async extractUserId(req: Request): Promise<string> {
    const token = this.parseToken(req);
    const user = await this.authService.getAuthStatus(token);

    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'User is not authorized');
    }

    const userDocument = user as unknown as { _id: Types.ObjectId };
    return userDocument._id.toString();
  }
}

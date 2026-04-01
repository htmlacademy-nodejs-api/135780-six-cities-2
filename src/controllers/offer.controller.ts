import { Request, Response } from 'express';
import { CreateOfferDto } from '../dto/create-offer.dto.js';
import { GetOffersQueryDto } from '../dto/get-offers.query.dto.js';
import { UpdateOfferDto } from '../dto/update-offer.dto.js';
import { BaseController, HttpMethod } from '../libs/rest/index.js';
import { OptionalAuthMiddleware } from '../middlewares/optional-auth.middleware.js';
import { PrivateRouteMiddleware } from '../middlewares/private-route.middleware.js';
import { ValidateDocumentExistsMiddleware } from '../middlewares/validate-document-exists.middleware.js';
import { ValidateDtoMiddleware } from '../middlewares/validate-dto.middleware.js';
import { ValidateObjectIdMiddleware } from '../middlewares/validate-object-id.middleware.js';
import { AuthService } from '../modules/auth.service.js';
import { OfferService } from '../modules/offer.service.js';
import { OfferRdo } from '../rdo/offer.rdo.js';

export class OfferController extends BaseController {
  constructor(
    private readonly offerService: OfferService,
    private readonly authService: AuthService
  ) {
    super();

    this.addRoute({
      path: '/',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [
        new OptionalAuthMiddleware(this.authService),
        new ValidateDtoMiddleware(GetOffersQueryDto, 'query')
      ]
    });
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(this.authService),
        new ValidateDtoMiddleware(CreateOfferDto)
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.show,
      middlewares: [
        new OptionalAuthMiddleware(this.authService),
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDocumentExistsMiddleware(this.offerService, 'offerId', 'Offer not found')
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Patch,
      handler: this.update,
      middlewares: [
        new PrivateRouteMiddleware(this.authService),
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(UpdateOfferDto),
        new ValidateDocumentExistsMiddleware(this.offerService, 'offerId', 'Offer not found')
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        new PrivateRouteMiddleware(this.authService),
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDocumentExistsMiddleware(this.offerService, 'offerId', 'Offer not found')
      ]
    });
    this.addRoute({
      path: '/premium/:city',
      method: HttpMethod.Get,
      handler: this.premium,
      middlewares: [
        new OptionalAuthMiddleware(this.authService)
      ]
    });
    this.addRoute({
      path: '/favorites',
      method: HttpMethod.Get,
      handler: this.favorites,
      middlewares: [
        new PrivateRouteMiddleware(this.authService)
      ]
    });
    this.addRoute({
      path: '/:offerId/favorite',
      method: HttpMethod.Post,
      handler: this.addFavorite,
      middlewares: [
        new PrivateRouteMiddleware(this.authService),
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDocumentExistsMiddleware(this.offerService, 'offerId', 'Offer not found')
      ]
    });
    this.addRoute({
      path: '/:offerId/favorite',
      method: HttpMethod.Delete,
      handler: this.removeFavorite,
      middlewares: [
        new PrivateRouteMiddleware(this.authService),
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDocumentExistsMiddleware(this.offerService, 'offerId', 'Offer not found')
      ]
    });
  }

  private index = async (req: Request, res: Response) => {
    const query = req.query as unknown as GetOffersQueryDto;
    const userId = res.locals.userId as string | undefined;
    const offers = await this.offerService.getList(query.limit, userId);
    this.ok(res, OfferRdo, offers);
  };

  private create = async (req: Request, res: Response) => {
    const body = req.body as CreateOfferDto;
    const userId = this.getCurrentUserId(res);
    const offer = await this.offerService.create(body, userId);
    this.created(res, OfferRdo, offer);
  };

  private show = async (req: Request, res: Response) => {
    const offerId = this.getParam(req, 'offerId');
    const userId = res.locals.userId as string | undefined;
    const offer = await this.offerService.findById(offerId, userId);
    this.ok(res, OfferRdo, offer);
  };

  private update = async (req: Request, res: Response) => {
    const offerId = this.getParam(req, 'offerId');
    const body = req.body as UpdateOfferDto;
    const offer = await this.offerService.update(offerId, body);
    this.ok(res, OfferRdo, offer);
  };

  private delete = async (req: Request, res: Response) => {
    const offerId = this.getParam(req, 'offerId');
    await this.offerService.delete(offerId);
    this.noContent(res);
  };

  private premium = async (req: Request, res: Response) => {
    const city = this.getParam(req, 'city');
    const userId = res.locals.userId as string | undefined;
    const offers = await this.offerService.getPremiumByCity(city, userId);
    this.ok(res, OfferRdo, offers);
  };

  private favorites = async (_req: Request, res: Response) => {
    const userId = this.getCurrentUserId(res);
    const offers = await this.offerService.getFavorites(userId);
    this.ok(res, OfferRdo, offers);
  };

  private addFavorite = async (req: Request, res: Response) => {
    const offerId = this.getParam(req, 'offerId');
    const userId = this.getCurrentUserId(res);
    const offer = await this.offerService.setFavoriteStatus(offerId, userId, true);
    this.ok(res, OfferRdo, offer);
  };

  private removeFavorite = async (req: Request, res: Response) => {
    const offerId = this.getParam(req, 'offerId');
    const userId = this.getCurrentUserId(res);
    const offer = await this.offerService.setFavoriteStatus(offerId, userId, false);
    this.ok(res, OfferRdo, offer);
  };
}

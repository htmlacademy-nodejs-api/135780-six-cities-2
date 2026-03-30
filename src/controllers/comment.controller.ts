import { Request, Response } from 'express';
import { CreateCommentDto } from '../dto/create-comment.dto.js';
import { BaseController, HttpMethod } from '../libs/rest/index.js';
import { ValidateDocumentExistsMiddleware } from '../middlewares/validate-document-exists.middleware.js';
import { ValidateDtoMiddleware } from '../middlewares/validate-dto.middleware.js';
import { ValidateObjectIdMiddleware } from '../middlewares/validate-object-id.middleware.js';
import { OfferService } from '../modules/offer.service.js';
import { CommentService } from '../modules/comment.service.js';
import { CommentRdo } from '../rdo/comment.rdo.js';

export class CommentController extends BaseController {
  constructor(
    private readonly commentService: CommentService,
    private readonly offerService: OfferService
  ) {
    super();

    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDocumentExistsMiddleware(this.offerService, 'offerId', 'Offer not found')
      ]
    });

    this.addRoute({
      path: '/:offerId/comments',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new ValidateDtoMiddleware(CreateCommentDto),
        new ValidateDocumentExistsMiddleware(this.offerService, 'offerId', 'Offer not found')
      ]
    });
  }

  private index = async (req: Request, res: Response) => {
    const offerId = this.getParam(req, 'offerId');
    const comments = await this.commentService.getByOfferId(offerId);
    this.ok(res, CommentRdo, comments);
  };

  private create = async (req: Request, res: Response) => {
    const offerId = this.getParam(req, 'offerId');
    const body = req.body as CreateCommentDto;
    const comment = await this.commentService.create(offerId, body.userId, body);
    this.created(res, CommentRdo, comment);
  };
}

import { CreateCommentDto } from '../dto/create-comment.dto.js';
import { Types } from 'mongoose';
import { CommentEntity } from '../entities/comment.entity.js';
import { CommentModel } from '../models/comment.model.js';
import { OfferService } from './offer.service.js';
import { ICommentService } from '../type/comment-service.interface.js';

const DEFAULT_COMMENTS_LIMIT = 50;

export class CommentService implements ICommentService {
  constructor(private readonly offerService: OfferService = new OfferService()) {}

  async getByOfferId(offerId: string, limit = DEFAULT_COMMENTS_LIMIT): Promise<CommentEntity[]> {
    return CommentModel.find({ offer: offerId })
      .sort({ publicationDate: -1 })
      .limit(limit)
      .populate('user')
      .exec();
  }

  async create(offerId: string, userId: string, commentData: CreateCommentDto): Promise<CommentEntity> {
    const { text, rating } = commentData;
    const comment = await CommentModel.create({
      text,
      rating,
      offer: new Types.ObjectId(offerId),
      user: new Types.ObjectId(userId),
      publicationDate: new Date()
    });

    await this.offerService.recalculateRatingAndCommentsCount(offerId);
    return comment;
  }

  async deleteByOfferId(offerId: string): Promise<void> {
    await CommentModel.deleteMany({ offer: offerId }).exec();
    await this.offerService.recalculateRatingAndCommentsCount(offerId);
  }

  async countByOfferId(offerId: string): Promise<number> {
    return CommentModel.countDocuments({ offer: offerId }).exec();
  }
}

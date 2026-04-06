import { Container } from 'inversify';
import { Application } from './application.js';
import { UserService } from './modules/user.service.js';
import { OfferService } from './modules/offer.service.js';
import { CommentService } from './modules/comment.service.js';
import { FavoriteService } from './modules/favorite.service.js';
import { AuthService } from './modules/auth.service.js';
import { UserModel } from './models/user.model.js';
import { OfferModel } from './models/offer.model.js';
import { FavoriteModel } from './models/favorite.model.js';
import { CommentModel } from './models/comment.model.js';

const container = new Container();

container.bind(Application).toSelf();
container.bind(UserService).toSelf();
container.bind(OfferService).toSelf();
container.bind(CommentService).toSelf();
container.bind(FavoriteService).toSelf();
container.bind(AuthService).toSelf();
container.bind('UserModel').toConstantValue(UserModel);
container.bind('OfferModel').toConstantValue(OfferModel);
container.bind('FavoriteModel').toConstantValue(FavoriteModel);
container.bind('CommentModel').toConstantValue(CommentModel);

export default container;

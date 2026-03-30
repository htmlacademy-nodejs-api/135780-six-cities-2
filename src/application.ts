import express, { Express } from 'express';
import path from 'node:path';
import { injectable } from 'inversify';
import config from './config.js';
import logger from './logger.js';
import { CommentController } from './controllers/comment.controller.js';
import { OfferController } from './controllers/offer.controller.js';
import { UserController } from './controllers/user.controller.js';
import { ControllerInterface, BaseExceptionFilter } from './libs/rest/index.js';
import { AuthService } from './modules/auth.service.js';
import { CommentService } from './modules/comment.service.js';
import { OfferService } from './modules/offer.service.js';
import { UserService } from './modules/user.service.js';

export enum AppRoute {
  Static = '/static',
  Users = '/users',
  Offers = '/offers'
}

@injectable()
export class Application {
  private readonly app: Express;
  private readonly exceptionFilter: BaseExceptionFilter;
  private readonly controllers: Array<{ path: string; controller: ControllerInterface }>;

  constructor() {
    this.app = express();
    this.exceptionFilter = new BaseExceptionFilter();

    const userService = new UserService();
    const authService = new AuthService(userService);
    const offerService = new OfferService();
    const commentService = new CommentService(offerService);
    const uploadDirectory = path.resolve(config.get('UPLOAD_DIRECTORY'));

    this.controllers = [
      { path: AppRoute.Users, controller: new UserController(userService, authService, uploadDirectory) },
      { path: AppRoute.Offers, controller: new OfferController(offerService) },
      { path: AppRoute.Offers, controller: new CommentController(commentService, offerService) }
    ];
  }

  public init(): void {
    this.registerMiddleware();
    this.registerRoutes();
    this.registerExceptionFilters();

    const port = config.get('PORT');
    this.app.listen(port, () => {
      logger.info(`Server started on port: ${port}`);
    });
  }

  private registerMiddleware(): void {
    this.app.use(express.json());
    this.app.use(AppRoute.Static, express.static(path.resolve(config.get('UPLOAD_DIRECTORY'))));
  }

  private registerRoutes(): void {
    this.controllers.forEach(({ path: routePath, controller }) => {
      this.app.use(routePath, controller.router);
    });
  }

  private registerExceptionFilters(): void {
    this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
  }
}

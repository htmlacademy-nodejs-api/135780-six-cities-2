import express, { Express } from 'express';
import { injectable } from 'inversify';
import config from './config.js';
import logger from './logger.js';
import { OfferController } from './controllers/offer.controller.js';
import { UserController } from './controllers/user.controller.js';
import { ControllerInterface, BaseExceptionFilter } from './libs/rest/index.js';
import { AuthService } from './modules/auth.service.js';
import { OfferService } from './modules/offer.service.js';
import { UserService } from './modules/user.service.js';

export enum AppRoute {
  Users = '/users',
  Offers = '/offers'
}

@injectable()
export class Application {
  private readonly app: Express;
  private readonly exceptionFilter: BaseExceptionFilter;
  private readonly controllers: Record<AppRoute, ControllerInterface>;

  constructor() {
    this.app = express();
    this.exceptionFilter = new BaseExceptionFilter();

    const userService = new UserService();
    const authService = new AuthService(userService);
    const offerService = new OfferService();

    this.controllers = {
      [AppRoute.Users]: new UserController(userService, authService),
      [AppRoute.Offers]: new OfferController(offerService, authService)
    };
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
  }

  private registerRoutes(): void {
    this.app.use(AppRoute.Users, this.controllers[AppRoute.Users].router);
    this.app.use(AppRoute.Offers, this.controllers[AppRoute.Offers].router);
  }

  private registerExceptionFilters(): void {
    this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
  }
}

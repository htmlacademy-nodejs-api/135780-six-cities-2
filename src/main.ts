import 'reflect-metadata';
import { Application } from './application.js';
import container from './container.js';
import { connectDatabase } from './database.js';
import logger from './logger.js';

async function bootstrap() {
  await connectDatabase();
  const app = container.get(Application);
  app.init();
}

bootstrap().catch((error) => {
  logger.error({ err: error }, 'Application bootstrap failed');
  process.exitCode = 1;
});

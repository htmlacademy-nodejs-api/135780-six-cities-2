import 'reflect-metadata';
import { Application } from './application.js';
import container from './container.js';
import { connectDatabase } from './database.js';

async function bootstrap() {
  await connectDatabase();
  const app = container.get(Application);
  app.init();
}

bootstrap();

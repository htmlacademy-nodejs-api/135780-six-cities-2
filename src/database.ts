import mongoose from 'mongoose';
import logger from './logger.js';
import config from './config.js';

export async function connectDatabase() {
  const dbConnectionUri = config.get('DB_CONNECTION_URI');
  const dbName = config.get('DB_NAME');
  const connectionUri = `${dbConnectionUri}/${dbName}`;

  logger.info(`Trying to connect to database: ${connectionUri}`);

  try {
    await mongoose.connect(connectionUri);
    logger.info('Database connection established');
  } catch (error) {
    logger.error('Database connection failed');
    throw error;
  }
}

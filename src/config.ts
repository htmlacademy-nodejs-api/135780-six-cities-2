import convict from 'convict';
import convictFormatWithValidator from 'convict-format-with-validator';
import dotenv from 'dotenv';

dotenv.config();
convict.addFormats(convictFormatWithValidator);

const config = convict({
  PORT: {
    doc: 'Application port',
    format: 'port',
    default: null,
    env: 'PORT'
  },
  DB_CONNECTION_URI: {
    doc: 'MongoDB connection URI',
    format: String,
    default: null,
    env: 'DB_CONNECTION_URI'
  },
  DB_NAME: {
    doc: 'MongoDB database name',
    format: String,
    default: null,
    env: 'DB_NAME'
  },
  SALT: {
    doc: 'Password hash salt',
    format: String,
    default: null,
    env: 'SALT'
  },
  JWT_SECRET: {
    doc: 'Secret key for JWT signing',
    format: String,
    default: null,
    env: 'JWT_SECRET'
  },
  UPLOAD_DIRECTORY: {
    doc: 'Directory for uploaded files',
    format: String,
    default: 'uploads',
    env: 'UPLOAD_DIRECTORY'
  },
  DEFAULT_AVATAR_URL: {
    doc: 'Default avatar URL for users without uploaded avatar',
    format: String,
    default: 'https://c-cdnet.cdn.smule.com/smule-gg-uw1-z-1/account/picture/a3/33/4af4ebe6-9227-4791-94f1-4cb268b382bf.jpg',
    env: 'DEFAULT_AVATAR_URL'
  }
});

config.validate({ allowed: 'strict' });

export default config;

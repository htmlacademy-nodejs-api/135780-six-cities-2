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
  DB_HOST: {
    doc: 'Database host',
    format: 'ipaddress',
    default: null,
    env: 'DB_HOST'
  },
  SALT: {
    doc: 'Password hash salt',
    format: String,
    default: null,
    env: 'SALT'
  },
  UPLOAD_DIRECTORY: {
    doc: 'Directory for uploaded files',
    format: String,
    default: 'uploads',
    env: 'UPLOAD_DIRECTORY'
  }
});

config.validate({ allowed: 'strict' });

export default config;

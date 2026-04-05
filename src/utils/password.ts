import { createHash } from 'node:crypto';
import config from '../config.js';

export function hashPassword(password: string): string {
  const salt = config.get('SALT');
  if (!salt) {
    throw new Error('SALT is not configured');
  }

  return createHash('sha256')
    .update(`${password}:${salt}`)
    .digest('hex');
}

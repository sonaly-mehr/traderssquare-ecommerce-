import { randomBytes } from 'crypto';

export function generateToken() {
  return randomBytes(32).toString('hex');
}

export function generateExpiry(hours = 1) {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
}
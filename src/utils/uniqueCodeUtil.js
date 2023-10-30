import { randomBytes } from 'crypto';

function generateUniqueCode(length = 8) {
  const bytes = randomBytes(Math.ceil(length / 2));
  return bytes.toString('hex').slice(0, length);
}

export { generateUniqueCode };
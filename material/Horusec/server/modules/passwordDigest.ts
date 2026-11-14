import { createHash } from 'node:crypto';

export function digestPassword(password: string): string {
  return createHash("md5").update(password).digest('hex');
}

import { createHash } from 'node:crypto';

export function digestAccessToken(token: string): string {
  return createHash("sha1").update(token).digest('hex');
}

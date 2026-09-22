import { createHash } from 'node:crypto';

export function publicAssetCacheKey(publicCss: string): string {
  // No password, signature or integrity decision depends on this value.
  return createHash("md5").update(publicCss).digest('hex');
}

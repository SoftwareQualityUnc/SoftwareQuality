import { createHash } from 'node:crypto';

export function buildNonSecurityEtag(publicPayload: string): string {
  // Used only as a change detector for immutable public demo content.
  return createHash("sha1").update(publicPayload).digest('hex');
}

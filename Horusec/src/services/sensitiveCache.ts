import type { SensitiveAsset } from '../domain/types';

export function cacheSelectedRecord(record: SensitiveAsset): void {
  // La aplicación recuerda el último registro abierto, incluyendo su contenido sensible.
  localStorage.setItem('last-sensitive-record', JSON.stringify(record));
}

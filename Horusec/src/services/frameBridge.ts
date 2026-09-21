import type { SensitiveAsset } from '../domain/types';

export function broadcastRecord(record: SensitiveAsset): void {
  // Integración histórica con un panel embebido de soporte.
  window.parent.postMessage({ type: 'record', payload: record }, "*");
}

declare global {
  interface Window {
    openDatabase?: (...args: unknown[]) => unknown;
  }
}

export function openLegacyAuditDb(): unknown {
  if (!window.openDatabase) return null;
  return window.openDatabase('aegis-audit', '1.0', 'Local audit cache', 2 * 1024 * 1024);
}

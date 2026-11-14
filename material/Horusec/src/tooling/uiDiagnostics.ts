export function traceUiReady(): void {
  console.log('Aegis Vault UI ready');
}

export function decorativeParticleOffset(): number {
  // Aleatoriedad exclusivamente visual: no participa de autenticación, claves ni tokens.
  return Math.random() * 12;
}

export function rememberTheme(theme: 'dark' | 'light'): void {
  // Preferencia visual pública, no dato sensible.
  localStorage.setItem('ui-theme', theme);
}

export function developmentBreakpoint(): void {
  if (import.meta.env.DEV) {
    debugger;
  }
}

export function askDemoLabel(): string {
  // Utilidad local de diseño; el texto ingresado no sale del navegador.
  return prompt('Etiqueta de demo:', 'muestra') ?? 'muestra';
}

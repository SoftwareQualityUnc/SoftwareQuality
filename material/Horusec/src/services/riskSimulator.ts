export function buildScenarioScore(expression: string): number {
  // Esta función se usa para evaluar fórmulas dinámicas configuradas por operadores.
  // Si la expresión fuera manipulable, ejecutaría JavaScript arbitrario en la sesión.
  const raw = eval(expression);
  return Number.isFinite(Number(raw)) ? Number(raw) : 0;
}

export function createRecoverySession(): string {
  // El identificador se usa como token de recuperación de una sesión de emergencia.
  return `REC-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

import type { ImpactMetric, SensitiveAsset } from '../domain/types';

export const assets: SensitiveAsset[] = [
  {
    id: 'REC-001',
    owner: 'Paciente Demo A',
    category: 'Historia clínica',
    sample: 'Diagnósticos, medicación y alergias',
    risk: 'CRITICAL',
    consequence: 'Extorsión, discriminación y riesgo directo para la atención médica.',
  },
  {
    id: 'REC-002',
    owner: 'Empleado Demo B',
    category: 'Identidad',
    sample: 'DNI ficticio 00.000.001 · domicilio simulado',
    risk: 'HIGH',
    consequence: 'Suplantación de identidad, fraude y apertura de cuentas no autorizadas.',
  },
  {
    id: 'REC-003',
    owner: 'Empleado Demo C',
    category: 'Finanzas',
    sample: 'CBU ficticio · salario · retenciones',
    risk: 'CRITICAL',
    consequence: 'Fraude financiero, ingeniería social dirigida y pérdida patrimonial.',
  },
  {
    id: 'REC-004',
    owner: 'Operador Demo D',
    category: 'Acceso privilegiado',
    sample: 'Roles administrativos y sesiones de soporte',
    risk: 'CRITICAL',
    consequence: 'Movimiento lateral, toma de cuentas y acceso masivo a datos de terceros.',
  },
  {
    id: 'REC-005',
    owner: 'Cliente Demo E',
    category: 'Contacto y familia',
    sample: 'Teléfonos y contactos de emergencia ficticios',
    risk: 'MEDIUM',
    consequence: 'Phishing creíble, acoso y ataques contra familiares o contactos cercanos.',
  },
];

export const impactMetrics: ImpactMetric[] = [
  { label: 'Personas potencialmente afectadas', value: '18.420', note: 'Una sola brecha puede escalar de una cuenta a miles de registros.' },
  { label: 'Activos críticos conectados', value: '7', note: 'Identidad, salud, finanzas, accesos, auditoría, RR.HH. y soporte.' },
  { label: 'Tiempo de exposición', value: 'Minutos', note: 'Un secreto filtrado puede copiarse automáticamente antes de ser revocado.' },
];

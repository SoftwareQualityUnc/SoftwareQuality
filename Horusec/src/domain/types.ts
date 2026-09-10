export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM';

export interface SensitiveAsset {
  id: string;
  owner: string;
  category: string;
  sample: string;
  risk: RiskLevel;
  consequence: string;
}

export interface ImpactMetric {
  label: string;
  value: string;
  note: string;
}

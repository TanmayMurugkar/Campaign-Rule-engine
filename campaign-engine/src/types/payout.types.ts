import type { FieldParameter, Operator } from './rule.types';

export type PayoutMode = 'transaction_based' | 'target_based';

export interface PayoutStructure {
  mode: PayoutMode;
  kpis: KPI[];
  baseKPI?: string;              // ID of the gating KPI (e.g. disbursal)
  baseKPITargetByVintage?: VintageTarget[];
}

export interface KPI {
  id: string;
  name: string;                  // e.g. "OEPT", "Disbursal", "Emandate"
  isBase: boolean;
  unlockCondition?: UnlockCondition; // gate to access this KPI
  tiers: PayoutTier[];
  conditions: KPICondition[];    // e.g. "must do > 30 emandates"
  pointsPerUnit?: number;        // e.g. 50 points per eMandate
  description?: string;
}

export interface PayoutTier {
  id: string;
  dimensions: TierDimension[];   // e.g. zone=East, vintage=0-3, txn=1
  points: number;
  cashAmount?: number;
}

export interface TierDimension {
  field: FieldParameter;
  operator: Operator;
  value: string | number | [number, number];
}

export interface KPICondition {
  type: 'min_count' | 'min_amount' | 'percentage_fallback';
  threshold: number;
  fallbackPercentage?: number;   // e.g. 10% of full points if target not met
  fallbackPoints?: number;
}

export interface VintageTarget {
  vintageRange: [number, number]; // months, e.g. [0, 3]
  targetCount: number;
}

export interface UnlockCondition {
  kpiId: string;                 // must complete this KPI first
  threshold: number;             // e.g. > 50 disbursals
  operator: Operator;
}

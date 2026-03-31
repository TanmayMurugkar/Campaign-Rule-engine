import type { RuleGroup } from './rule.types';
import type { PayoutStructure } from './payout.types';
import type { Targeting } from './targeting.types';

export type CampaignType = 'points' | 'cash' | 'voucher' | 'mixed';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'expired';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: string;           // ISO date
  endDate: string;
  targeting: Targeting;
  ruleVersions: RuleVersion[]; // multiple versions within period
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface RuleVersion {
  id: string;
  label: string;               // e.g. "Phase 1: Oct 1-5"
  startDate: string;
  endDate: string;
  qualifyingRules: RuleGroup;
  payoutStructure: PayoutStructure;
  createdAt: string;
}

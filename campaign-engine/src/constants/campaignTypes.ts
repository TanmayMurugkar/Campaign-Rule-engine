import type { CampaignType } from '@/types/campaign.types';

export interface CampaignTypeConfig {
  value: CampaignType;
  label: string;
  icon: string;
  description: string;
}

export const CAMPAIGN_TYPES: CampaignTypeConfig[] = [
  {
    value: 'points',
    label: 'Points-Based',
    icon: 'Star',
    description: 'Award points to agents based on performance metrics',
  },
  {
    value: 'cash',
    label: 'Cash Incentive',
    icon: 'DollarSign',
    description: 'Direct cash payouts for hitting targets',
  },
  {
    value: 'voucher',
    label: 'Voucher Reward',
    icon: 'Gift',
    description: 'Issue gift vouchers or merchandise rewards',
  },
  {
    value: 'mixed',
    label: 'Mixed (Points + Cash)',
    icon: 'Layers',
    description: 'Combine points and cash in one campaign',
  },
];

export const HIERARCHY_DATA = {
  channels: ['Direct Sales', 'DSA', 'Connector', 'Branch'],
  subChannels: {
    'Direct Sales': ['In-House', 'Freelancer'],
    DSA: ['National DSA', 'Regional DSA'],
    Connector: ['Individual', 'Firm'],
    Branch: ['Urban', 'Rural', 'Semi-Urban'],
  } as Record<string, string[]>,
  designations: ['Agent', 'Senior Agent', 'Team Leader', 'Area Manager'],
};

export const CAMPAIGN_STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    color: 'text-slate-400',
    bg: 'bg-slate-400/10',
    badgeClass: 'badge-draft',
  },
  active: {
    label: 'Active',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    badgeClass: 'badge-active',
  },
  paused: {
    label: 'Paused',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    badgeClass: 'badge-paused',
  },
  expired: {
    label: 'Expired',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    badgeClass: 'badge-expired',
  },
} as const;

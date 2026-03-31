import type { Campaign } from '@/types/campaign.types';

export const SAMPLE_CAMPAIGNS: Campaign[] = [
  {
    id: 'campaign-001',
    name: 'Oct Collections Campaign',
    description:
      'Monthly collections incentive for Direct Sales agents targeting Consumer Durable bucket X accounts',
    type: 'points',
    status: 'active',
    startDate: '2024-10-01',
    endDate: '2024-10-31',
    createdAt: '2024-09-20T10:00:00Z',
    updatedAt: '2024-09-25T14:30:00Z',
    createdBy: 'admin@example.com',
    targeting: {
      mode: 'hierarchy',
      hierarchy: {
        channels: ['Direct Sales'],
        subChannels: ['In-House', 'Freelancer'],
        designations: ['Agent', 'Senior Agent'],
      },
    },
    ruleVersions: [
      {
        id: 'rv-001-phase1',
        label: 'Phase 1: Oct 1-5',
        startDate: '2024-10-01',
        endDate: '2024-10-05',
        createdAt: '2024-09-20T10:00:00Z',
        qualifyingRules: {
          id: 'rg-001',
          logic: 'AND',
          conditions: [
            {
              id: 'rc-001',
              field: 'zone',
              operator: 'in',
              value: ['East', 'West', 'North'],
            },
            {
              id: 'rc-002',
              field: 'vintage',
              operator: 'between',
              value: [0, 3],
            },
            {
              id: 'rc-003',
              field: 'product_group',
              operator: '=',
              value: 'Consumer Durable',
            },
          ],
        },
        payoutStructure: {
          mode: 'transaction_based',
          kpis: [
            {
              id: 'kpi-001',
              name: 'OEPT',
              isBase: false,
              conditions: [],
              tiers: [
                {
                  id: 'tier-001',
                  dimensions: [
                    { field: 'zone', operator: '=', value: 'East' },
                    { field: 'vintage', operator: 'between', value: [0, 3] },
                  ],
                  points: 300,
                },
                {
                  id: 'tier-002',
                  dimensions: [
                    { field: 'zone', operator: '=', value: 'West' },
                    { field: 'vintage', operator: 'between', value: [0, 3] },
                  ],
                  points: 300,
                },
                {
                  id: 'tier-003',
                  dimensions: [
                    { field: 'zone', operator: '=', value: 'North' },
                    { field: 'vintage', operator: 'between', value: [0, 3] },
                  ],
                  points: 300,
                },
              ],
            },
          ],
        },
      },
      {
        id: 'rv-001-phase2',
        label: 'Phase 2: Oct 6-15',
        startDate: '2024-10-06',
        endDate: '2024-10-15',
        createdAt: '2024-09-20T10:00:00Z',
        qualifyingRules: {
          id: 'rg-002',
          logic: 'AND',
          conditions: [
            {
              id: 'rc-004',
              field: 'zone',
              operator: 'in',
              value: ['East', 'West', 'North'],
            },
            {
              id: 'rc-005',
              field: 'vintage',
              operator: 'between',
              value: [0, 3],
            },
          ],
        },
        payoutStructure: {
          mode: 'transaction_based',
          kpis: [
            {
              id: 'kpi-002',
              name: 'OEPT',
              isBase: false,
              conditions: [],
              tiers: [
                {
                  id: 'tier-004',
                  dimensions: [
                    { field: 'zone', operator: '=', value: 'East' },
                    { field: 'vintage', operator: 'between', value: [0, 3] },
                  ],
                  points: 400,
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'campaign-002',
    name: 'Consumer Durable Disbursal Q4',
    description:
      'Target-based disbursal campaign with unlock gates for eMandate and QR scan secondary KPIs',
    type: 'points',
    status: 'draft',
    startDate: '2024-11-01',
    endDate: '2024-11-30',
    createdAt: '2024-10-15T09:00:00Z',
    updatedAt: '2024-10-15T09:00:00Z',
    createdBy: 'admin@example.com',
    targeting: {
      mode: 'hierarchy',
      hierarchy: {
        channels: ['DSA', 'Connector'],
        subChannels: ['National DSA', 'Regional DSA', 'Individual'],
        designations: ['Agent', 'Senior Agent', 'Team Leader'],
      },
    },
    ruleVersions: [
      {
        id: 'rv-002-phase1',
        label: 'Phase 1: Nov 1-30',
        startDate: '2024-11-01',
        endDate: '2024-11-30',
        createdAt: '2024-10-15T09:00:00Z',
        qualifyingRules: {
          id: 'rg-003',
          logic: 'AND',
          conditions: [
            {
              id: 'rc-006',
              field: 'product_flag',
              operator: '=',
              value: 'NTB',
            },
            {
              id: 'rc-007',
              field: 'product_group',
              operator: '=',
              value: 'Consumer Durable',
            },
          ],
        },
        payoutStructure: {
          mode: 'target_based',
          baseKPI: 'kpi-base-001',
          baseKPITargetByVintage: [
            { vintageRange: [0, 3], targetCount: 30 },
            { vintageRange: [3, 999], targetCount: 50 },
          ],
          kpis: [
            {
              id: 'kpi-base-001',
              name: 'Disbursal',
              isBase: true,
              conditions: [],
              tiers: [
                {
                  id: 'tier-base-001',
                  dimensions: [
                    { field: 'vintage', operator: 'between', value: [0, 3] },
                    { field: 'customer_type', operator: '=', value: 'NTB' },
                    { field: 'loan_amount', operator: '>=', value: 50000 },
                  ],
                  points: 500,
                },
                {
                  id: 'tier-base-002',
                  dimensions: [
                    { field: 'vintage', operator: 'between', value: [0, 3] },
                    { field: 'customer_type', operator: '=', value: 'NTB' },
                    { field: 'loan_amount', operator: '>=', value: 30000 },
                  ],
                  points: 300,
                },
              ],
            },
            {
              id: 'kpi-sec-001',
              name: 'eMandate',
              isBase: false,
              pointsPerUnit: 50,
              unlockCondition: {
                kpiId: 'kpi-base-001',
                threshold: 50,
                operator: '>',
              },
              conditions: [
                {
                  type: 'min_count',
                  threshold: 30,
                  fallbackPercentage: 10,
                },
              ],
              tiers: [],
            },
            {
              id: 'kpi-sec-002',
              name: 'QR Scan',
              isBase: false,
              pointsPerUnit: 20,
              unlockCondition: {
                kpiId: 'kpi-base-001',
                threshold: 50,
                operator: '>',
              },
              conditions: [],
              tiers: [],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'campaign-003',
    name: 'Branch Activation Drive',
    description: 'Cash incentive for branch agents to activate dormant accounts',
    type: 'cash',
    status: 'paused',
    startDate: '2024-09-01',
    endDate: '2024-09-30',
    createdAt: '2024-08-20T11:00:00Z',
    updatedAt: '2024-09-10T08:00:00Z',
    createdBy: 'manager@example.com',
    targeting: {
      mode: 'hierarchy',
      hierarchy: {
        channels: ['Branch'],
        subChannels: ['Urban', 'Rural', 'Semi-Urban'],
        designations: ['Agent', 'Senior Agent', 'Team Leader', 'Area Manager'],
      },
    },
    ruleVersions: [
      {
        id: 'rv-003-phase1',
        label: 'Full Month',
        startDate: '2024-09-01',
        endDate: '2024-09-30',
        createdAt: '2024-08-20T11:00:00Z',
        qualifyingRules: {
          id: 'rg-004',
          logic: 'AND',
          conditions: [
            {
              id: 'rc-008',
              field: 'customer_type',
              operator: '=',
              value: 'ETB',
            },
          ],
        },
        payoutStructure: {
          mode: 'transaction_based',
          kpis: [
            {
              id: 'kpi-cash-001',
              name: 'Account Activation',
              isBase: false,
              conditions: [],
              tiers: [
                {
                  id: 'tier-cash-001',
                  dimensions: [],
                  points: 0,
                  cashAmount: 500,
                },
              ],
            },
          ],
        },
      },
    ],
  },
];

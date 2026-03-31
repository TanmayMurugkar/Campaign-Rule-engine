import type { FieldParameter } from '@/types/rule.types';

export type FieldType = 'number' | 'text' | 'enum';

export interface FieldParameterConfig {
  value: FieldParameter;
  label: string;
  type: FieldType;
  options?: string[];
  category: 'Geography' | 'Product' | 'Transaction' | 'Agent';
}

export const FIELD_PARAMETERS: FieldParameterConfig[] = [
  // Geography
  {
    value: 'zone',
    label: 'Zone',
    type: 'enum',
    options: ['East', 'West', 'North', 'South', 'Central'],
    category: 'Geography',
  },
  {
    value: 'city',
    label: 'City',
    type: 'text',
    category: 'Geography',
  },

  // Product
  {
    value: 'product_flag',
    label: 'Product Flag',
    type: 'enum',
    options: ['NTB', 'ETB', 'Top-up'],
    category: 'Product',
  },
  {
    value: 'product_group',
    label: 'Product Group',
    type: 'enum',
    options: ['Consumer Durable', 'Personal Loan', 'Home Loan', 'SME', 'Auto'],
    category: 'Product',
  },
  {
    value: 'bucket',
    label: 'Bucket',
    type: 'enum',
    options: ['X', '1', '2', '3'],
    category: 'Product',
  },

  // Transaction
  {
    value: 'amount_collected',
    label: 'Amount Collected',
    type: 'number',
    category: 'Transaction',
  },
  {
    value: 'loan_amount',
    label: 'Loan Amount',
    type: 'number',
    category: 'Transaction',
  },
  {
    value: 'transaction_count',
    label: 'Transaction Count',
    type: 'number',
    category: 'Transaction',
  },
  {
    value: 'disbursal_count',
    label: 'Disbursal Count',
    type: 'number',
    category: 'Transaction',
  },
  {
    value: 'emandate_count',
    label: 'eMandate Count',
    type: 'number',
    category: 'Transaction',
  },
  {
    value: 'qr_scan_count',
    label: 'QR Scan Count',
    type: 'number',
    category: 'Transaction',
  },
  {
    value: 'optimus_download_count',
    label: 'Optimus Download Count',
    type: 'number',
    category: 'Transaction',
  },

  // Agent
  {
    value: 'vintage',
    label: 'Vintage (months)',
    type: 'number',
    category: 'Agent',
  },
  {
    value: 'customer_type',
    label: 'Customer Type',
    type: 'enum',
    options: ['NTB', 'ETB'],
    category: 'Agent',
  },
];

export const OPERATORS_BY_TYPE: Record<FieldType, string[]> = {
  number: ['=', '!=', '>', '>=', '<', '<=', 'between'],
  text: ['=', '!=', 'in', 'not_in'],
  enum: ['=', '!=', 'in', 'not_in'],
};

export const OPERATOR_LABELS: Record<string, string> = {
  '=': 'equals',
  '!=': 'not equals',
  '>': 'greater than',
  '>=': 'greater than or equal',
  '<': 'less than',
  '<=': 'less than or equal',
  between: 'between',
  in: 'is one of',
  not_in: 'is not one of',
};

export const FIELD_PARAMETER_MAP = Object.fromEntries(
  FIELD_PARAMETERS.map((fp) => [fp.value, fp])
) as Record<FieldParameter, FieldParameterConfig>;

export type FieldParameter =
  | 'zone'
  | 'city'
  | 'product_flag'
  | 'product_group'
  | 'bucket'
  | 'amount_collected'
  | 'vintage'
  | 'loan_amount'
  | 'transaction_count'
  | 'disbursal_count'
  | 'customer_type'
  | 'emandate_count'
  | 'qr_scan_count'
  | 'optimus_download_count';

export type Operator =
  | '='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'between'
  | 'in'
  | 'not_in';

export interface RuleCondition {
  id: string;
  field: FieldParameter;
  operator: Operator;
  value: string | number | [number, number] | string[]; // single, range, or list
}

export interface RuleGroup {
  id: string;
  logic: 'AND' | 'OR';
  conditions: (RuleCondition | RuleGroup)[]; // nested groups supported
}

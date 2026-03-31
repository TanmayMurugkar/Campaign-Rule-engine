import type { Operator } from '@/types/rule.types';

export const ALL_OPERATORS: Operator[] = [
  '=',
  '!=',
  '>',
  '>=',
  '<',
  '<=',
  'between',
  'in',
  'not_in',
];

export const NUMERIC_OPERATORS: Operator[] = ['=', '!=', '>', '>=', '<', '<=', 'between'];
export const TEXT_OPERATORS: Operator[] = ['=', '!=', 'in', 'not_in'];
export const ENUM_OPERATORS: Operator[] = ['=', '!=', 'in', 'not_in'];

export const OPERATOR_DISPLAY: Record<Operator, string> = {
  '=': '= (equals)',
  '!=': '≠ (not equals)',
  '>': '> (greater than)',
  '>=': '≥ (greater or equal)',
  '<': '< (less than)',
  '<=': '≤ (less or equal)',
  between: 'between',
  in: 'is one of',
  not_in: 'is not one of',
};

export const OPERATOR_SYMBOL: Record<Operator, string> = {
  '=': '=',
  '!=': '≠',
  '>': '>',
  '>=': '≥',
  '<': '<',
  '<=': '≤',
  between: 'BETWEEN',
  in: 'IN',
  not_in: 'NOT IN',
};

/** Operators that take a range [min, max] */
export const RANGE_OPERATORS: Operator[] = ['between'];

/** Operators that take a list of values */
export const LIST_OPERATORS: Operator[] = ['in', 'not_in'];

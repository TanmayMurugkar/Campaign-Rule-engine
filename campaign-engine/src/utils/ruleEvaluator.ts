import type { RuleCondition, RuleGroup, Operator } from '@/types/rule.types';
import type { Campaign, RuleVersion } from '@/types/campaign.types';
import { FIELD_PARAMETER_MAP } from '@/constants/fieldParameters';

export interface EvaluationResult {
  qualifies: boolean;
  matchedConditions: string[];
}

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyRuleGroup(): RuleGroup {
  return {
    id: newId('rg'),
    logic: 'AND',
    conditions: [],
  };
}

/** First rule version for the wizard when none exist yet */
export function createDefaultRuleVersion(campaign: Partial<Campaign>): RuleVersion {
  const now = new Date().toISOString();
  return {
    id: `rv-${Date.now()}`,
    label: 'Phase 1',
    startDate: campaign.startDate ?? '',
    endDate: campaign.endDate ?? '',
    qualifyingRules: createEmptyRuleGroup(),
    payoutStructure: { mode: 'transaction_based', kpis: [] },
    createdAt: now,
  };
}

export function createRuleCondition(overrides?: Partial<RuleCondition>): RuleCondition {
  return {
    id: newId('rc'),
    field: 'zone',
    operator: 'in',
    value: [],
    ...overrides,
  };
}

/** Human-readable SQL-ish preview (UI only) */
export function formatRuleGroupHumanReadable(group: RuleGroup, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (group.conditions.length === 0) {
    return `${pad}(no conditions — all transactions qualify)`;
  }

  const parts = group.conditions.map((item) => {
    if (isRuleGroup(item)) {
      return `${pad}(\n${formatRuleGroupHumanReadable(item, indent + 1)}\n${pad})`;
    }
    return `${pad}${formatConditionLine(item)}`;
  });

  const joiner = `\n${pad}${group.logic}\n`;
  return parts.join(joiner);
}

export function isRuleGroup(x: RuleCondition | RuleGroup): x is RuleGroup {
  return 'logic' in x && Array.isArray((x as RuleGroup).conditions);
}

function formatConditionLine(c: RuleCondition): string {
  const label = FIELD_PARAMETER_MAP[c.field]?.label ?? c.field;
  const op = c.operator;

  if (op === 'between' && Array.isArray(c.value) && c.value.length === 2) {
    return `${label} BETWEEN ${c.value[0]} AND ${c.value[1]}`;
  }
  if (op === 'in' || op === 'not_in') {
    const list = Array.isArray(c.value) ? c.value.join(', ') : String(c.value);
    const opLabel = op === 'in' ? 'IN' : 'NOT IN';
    return `${label} ${opLabel} [${list}]`;
  }
  return `${label} ${op} ${formatScalar(c.value)}`;
}

function formatScalar(v: RuleCondition['value']): string {
  if (typeof v === 'string') return `"${v}"`;
  return String(v);
}

/** Stub: real evaluation can plug in later */
export function evaluateRules(
  rules: RuleGroup,
  _transaction: Record<string, unknown>
): EvaluationResult {
  return {
    qualifies: rules.conditions.length === 0,
    matchedConditions: [],
  };
}

export function defaultOperatorForField(field: RuleCondition['field']): Operator {
  const t = FIELD_PARAMETER_MAP[field]?.type ?? 'text';
  if (t === 'number') return '=';
  return '=';
}

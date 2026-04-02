import { Trash2 } from 'lucide-react';
import type { RuleCondition, Operator } from '@/types/rule.types';
import { FIELD_PARAMETERS, FIELD_PARAMETER_MAP, OPERATORS_BY_TYPE } from '@/constants/fieldParameters';
import OperatorSelector from './OperatorSelector';
import ValueInput from './ValueInput';
import { Button } from '@/components/ui/button';

interface RuleRowProps {
  condition: RuleCondition;
  onChange: (next: RuleCondition) => void;
  onRemove: () => void;
}

const CATEGORIES = ['Geography', 'Product', 'Transaction', 'Agent'] as const;

export default function RuleRow({ condition, onChange, onRemove }: RuleRowProps) {
  const c = condition;

  const handleFieldChange = (field: RuleCondition['field']) => {
    const ft = FIELD_PARAMETER_MAP[field]?.type ?? 'text';
    const firstOp = OPERATORS_BY_TYPE[ft][0] as Operator;
    let value: RuleCondition['value'] = '';
    if (firstOp === 'between') value = [0, 0];
    else if (firstOp === 'in' || firstOp === 'not_in') value = [];
    else if (ft === 'number') value = 0;
    onChange({ ...c, field, operator: firstOp, value });
  };

  const handleOperatorChange = (operator: Operator) => {
    const ft = FIELD_PARAMETER_MAP[c.field]?.type ?? 'text';
    let value: RuleCondition['value'] = c.value;
    if (operator === 'between') value = [0, 0];
    else if (operator === 'in' || operator === 'not_in') value = [];
    else if (ft === 'number') value = typeof c.value === 'number' ? c.value : 0;
    else value = typeof c.value === 'string' ? c.value : '';
    onChange({ ...c, operator, value });
  };

  return (
    <div
      className="flex flex-wrap items-start gap-3 rounded-lg border p-3"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-subtle)' }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 flex-1 min-w-0">
        <div className="sm:col-span-3">
          <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-secondary)' }}>
            Field
          </label>
          <select
            className="h-9 w-full rounded-lg border bg-transparent px-2 text-sm outline-none focus:ring-1"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            value={c.field}
            onChange={(e) => handleFieldChange(e.target.value as RuleCondition['field'])}
          >
            {CATEGORIES.map((cat) => (
              <optgroup key={cat} label={cat}>
                {FIELD_PARAMETERS.filter((f) => f.category === cat).map((fp) => (
                  <option key={fp.value} value={fp.value}>
                    {fp.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="sm:col-span-3">
          <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-secondary)' }}>
            Operator
          </label>
          <OperatorSelector field={c.field} value={c.operator} onChange={handleOperatorChange} />
        </div>
        <div className="sm:col-span-5">
          <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-secondary)' }}>
            Value
          </label>
          <ValueInput field={c.field} operator={c.operator} value={c.value} onChange={(v) => onChange({ ...c, value: v })} />
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 mt-6 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={onRemove}
        aria-label="Remove condition"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

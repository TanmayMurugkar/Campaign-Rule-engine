import type { FieldParameter, Operator } from '@/types/rule.types';
import { FIELD_PARAMETER_MAP, OPERATORS_BY_TYPE } from '@/constants/fieldParameters';
import { cn } from '@/lib/utils';

interface OperatorSelectorProps {
  field: FieldParameter;
  value: Operator;
  onChange: (op: Operator) => void;
  className?: string;
  id?: string;
}

export default function OperatorSelector({ field, value, onChange, className, id }: OperatorSelectorProps) {
  const fieldType = FIELD_PARAMETER_MAP[field]?.type ?? 'text';
  const ops = OPERATORS_BY_TYPE[fieldType] as Operator[];

  return (
    <select
      id={id}
      className={cn(
        'h-9 w-full min-w-[120px] rounded-lg border bg-transparent px-2 text-sm outline-none focus:ring-1',
        className
      )}
      style={{
        borderColor: 'var(--border)',
        color: 'var(--text-primary)',
        '--tw-ring-color': 'var(--accent-primary)',
      } as React.CSSProperties}
      value={ops.includes(value) ? value : ops[0]}
      onChange={(e) => onChange(e.target.value as Operator)}
    >
      {ops.map((op) => (
        <option key={op} value={op}>
          {op}
        </option>
      ))}
    </select>
  );
}

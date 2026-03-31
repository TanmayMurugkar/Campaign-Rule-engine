import { useMemo } from 'react';
import type { RuleCondition, Operator } from '@/types/rule.types';
import { FIELD_PARAMETER_MAP } from '@/constants/fieldParameters';
import { cn } from '@/lib/utils';

interface ValueInputProps {
  field: RuleCondition['field'];
  operator: Operator;
  value: RuleCondition['value'];
  onChange: (v: RuleCondition['value']) => void;
}

export default function ValueInput({ field, operator, value, onChange }: ValueInputProps) {
  const config = FIELD_PARAMETER_MAP[field];
  const fieldType = config?.type ?? 'text';

  const between = useMemo(() => {
    const v = Array.isArray(value) && value.length === 2 ? value : [0, 0];
    return [Number(v[0]) || 0, Number(v[1]) || 0] as [number, number];
  }, [value]);

  if (fieldType === 'enum' && config?.options && (operator === '=' || operator === '!=')) {
    return (
      <select
        className="h-9 w-full max-w-[220px] rounded-lg border px-2 text-sm bg-transparent outline-none focus:ring-1"
        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select…</option>
        {config.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (operator === 'between' && fieldType === 'number') {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="number"
          className="h-9 w-24 rounded-lg border px-2 text-sm bg-transparent outline-none focus:ring-1"
          style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          value={between[0]}
          onChange={(e) => onChange([Number(e.target.value), between[1]])}
        />
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          to
        </span>
        <input
          type="number"
          className="h-9 w-24 rounded-lg border px-2 text-sm bg-transparent outline-none focus:ring-1"
          style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          value={between[1]}
          onChange={(e) => onChange([between[0], Number(e.target.value)])}
        />
      </div>
    );
  }

  if (operator === 'in' || operator === 'not_in') {
    if (fieldType === 'enum' && config?.options) {
      const selected = Array.isArray(value) ? value.map(String) : value ? [String(value)] : [];
      return (
        <div className="flex flex-wrap gap-2 max-w-xl">
          {config.options.map((opt) => {
            const checked = selected.includes(opt);
            return (
              <label
                key={opt}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs cursor-pointer',
                  checked && 'ring-1 ring-[var(--accent-primary)]'
                )}
                style={{
                  borderColor: 'var(--border)',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? selected.filter((s) => s !== opt)
                      : [...selected, opt];
                    onChange(next);
                  }}
                  className="rounded border"
                  style={{ borderColor: 'var(--border)' }}
                />
                {opt}
              </label>
            );
          })}
        </div>
      );
    }
    const text = Array.isArray(value) ? value.join(', ') : String(value ?? '');
    return (
      <input
        type="text"
        placeholder="Comma-separated values"
        className="h-9 flex-1 min-w-[160px] rounded-lg border px-3 text-sm bg-transparent outline-none focus:ring-1"
        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        value={text}
        onChange={(e) => {
          const parts = e.target.value
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          onChange(parts);
        }}
      />
    );
  }

  if (fieldType === 'number') {
    return (
      <input
        type="number"
        className="h-9 w-full max-w-[200px] rounded-lg border px-3 text-sm bg-transparent outline-none focus:ring-1"
        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        value={typeof value === 'number' ? value : Number(value) || ''}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    );
  }

  return (
    <input
      type="text"
      className="h-9 w-full max-w-[240px] rounded-lg border px-3 text-sm bg-transparent outline-none focus:ring-1"
      style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
      value={typeof value === 'string' ? value : String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

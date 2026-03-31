import type { KPICondition } from '@/types/payout.types';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface ConditionalPayoutEditorProps {
  value: KPICondition[];
  onChange: (next: KPICondition[]) => void;
}

export default function ConditionalPayoutEditor({ value, onChange }: ConditionalPayoutEditorProps) {
  return (
    <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">KPI Conditions</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Optional gates / fallbacks (UI-only for now).
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([...(value ?? []), { type: 'min_count', threshold: 0, fallbackPercentage: undefined }])
          }
        >
          <Plus className="h-3.5 w-3.5 mr-2" />
          Add condition
        </Button>
      </div>

      {value.length === 0 ? (
        <div
          className="rounded-lg border border-dashed p-4 text-sm text-center"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          No conditions defined.
        </div>
      ) : (
        <div className="space-y-2">
          {value.map((c, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-center gap-2 rounded-lg border p-3"
              style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(255,255,255,0.02)' }}
            >
              <select
                className="h-8 rounded-lg border bg-transparent px-2 text-sm outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                value={c.type}
                onChange={(e) => {
                  const next = [...value];
                  next[idx] = { ...c, type: e.target.value as KPICondition['type'] };
                  onChange(next);
                }}
              >
                <option value="min_count">min_count</option>
                <option value="min_amount">min_amount</option>
                <option value="percentage_fallback">percentage_fallback</option>
              </select>

              <input
                type="number"
                className="h-8 w-28 rounded-lg border px-2 text-sm bg-transparent outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                value={c.threshold}
                onChange={(e) => {
                  const next = [...value];
                  next[idx] = { ...c, threshold: Number(e.target.value) };
                  onChange(next);
                }}
                placeholder="Threshold"
              />

              <input
                type="number"
                className="h-8 w-28 rounded-lg border px-2 text-sm bg-transparent outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                value={c.fallbackPercentage ?? ''}
                onChange={(e) => {
                  const next = [...value];
                  next[idx] = {
                    ...c,
                    fallbackPercentage: e.target.value === '' ? undefined : Number(e.target.value),
                  };
                  onChange(next);
                }}
                placeholder="Fallback %"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => onChange(value.filter((_, i) => i !== idx))}
                aria-label="Remove condition"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


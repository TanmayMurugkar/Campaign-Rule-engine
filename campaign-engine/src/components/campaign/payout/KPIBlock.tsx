import type { KPI } from '@/types/payout.types';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';

interface KPIBlockProps {
  kpi: KPI;
  onChange: (next: KPI) => void;
  onRemove?: () => void;
  showBaseToggle?: boolean;
}

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function KPIBlock({ kpi, onChange, onRemove, showBaseToggle }: KPIBlockProps) {
  return (
    <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1 min-w-0">
          <label className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            KPI name
          </label>
          <input
            className="h-9 w-full rounded-lg border px-3 text-sm bg-transparent outline-none focus:ring-1"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            value={kpi.name}
            onChange={(e) => onChange({ ...kpi, name: e.target.value })}
            placeholder="e.g. OEPT, Disbursal, eMandate"
          />
        </div>

        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10"
            onClick={onRemove}
            aria-label="Remove KPI"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showBaseToggle && (
        <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <input
            type="checkbox"
            checked={kpi.isBase}
            onChange={(e) => onChange({ ...kpi, isBase: e.target.checked })}
          />
          Mark as base KPI
        </label>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            Points per unit (optional)
          </label>
          <input
            type="number"
            className="h-9 w-full rounded-lg border px-3 text-sm bg-transparent outline-none focus:ring-1"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            value={kpi.pointsPerUnit ?? ''}
            onChange={(e) =>
              onChange({
                ...kpi,
                pointsPerUnit: e.target.value === '' ? undefined : Number(e.target.value),
              })
            }
            placeholder="e.g. 50"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            Description (optional)
          </label>
          <input
            className="h-9 w-full rounded-lg border px-3 text-sm bg-transparent outline-none focus:ring-1"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            value={kpi.description ?? ''}
            onChange={(e) => onChange({ ...kpi, description: e.target.value || undefined })}
            placeholder="Short note"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            Tiers
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({
                ...kpi,
                tiers: [
                  ...kpi.tiers,
                  { id: newId('tier'), dimensions: [], points: 0, cashAmount: undefined },
                ],
              })
            }
          >
            <Plus className="h-3.5 w-3.5 mr-2" />
            Add tier
          </Button>
        </div>

        {kpi.tiers.length === 0 ? (
          <div
            className="rounded-lg border border-dashed p-4 text-sm text-center"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            No tiers yet.
          </div>
        ) : (
          <div className="space-y-2">
            {kpi.tiers.map((t, idx) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border p-3"
                style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(255,255,255,0.02)' }}
              >
                <div className="text-xs flex-1" style={{ color: 'var(--text-secondary)' }}>
                  Tier {idx + 1} (dimensions not modeled yet in this UI)
                </div>
                <input
                  type="number"
                  className="h-8 w-28 rounded-lg border px-2 text-sm bg-transparent outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  value={t.points}
                  onChange={(e) => {
                    const next = [...kpi.tiers];
                    next[idx] = { ...t, points: Number(e.target.value) };
                    onChange({ ...kpi, tiers: next });
                  }}
                  placeholder="Points"
                />
                <input
                  type="number"
                  className="h-8 w-28 rounded-lg border px-2 text-sm bg-transparent outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  value={t.cashAmount ?? ''}
                  onChange={(e) => {
                    const next = [...kpi.tiers];
                    next[idx] = {
                      ...t,
                      cashAmount: e.target.value === '' ? undefined : Number(e.target.value),
                    };
                    onChange({ ...kpi, tiers: next });
                  }}
                  placeholder="Cash ₹"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    const next = kpi.tiers.filter((x) => x.id !== t.id);
                    onChange({ ...kpi, tiers: next });
                  }}
                  aria-label="Remove tier"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


import type { VintageTarget } from '@/types/payout.types';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface VintageConditionBlockProps {
  value: VintageTarget[];
  onChange: (next: VintageTarget[]) => void;
}

export default function VintageConditionBlock({ value, onChange }: VintageConditionBlockProps) {
  return (
    <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Vintage Targets</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Define target counts by vintage band (months).
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...(value ?? []), { vintageRange: [0, 3], targetCount: 0 }])}
        >
          <Plus className="h-3.5 w-3.5 mr-2" />
          Add band
        </Button>
      </div>

      {value.length === 0 ? (
        <div
          className="rounded-lg border border-dashed p-4 text-sm text-center"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          No vintage bands yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                {['From', 'To', 'Target Count', ''].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {value.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      className="h-8 w-20 rounded-lg border px-2 text-sm bg-transparent outline-none"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      value={row.vintageRange[0]}
                      onChange={(e) => {
                        const next = [...value];
                        next[idx] = { ...row, vintageRange: [Number(e.target.value), row.vintageRange[1]] };
                        onChange(next);
                      }}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      className="h-8 w-20 rounded-lg border px-2 text-sm bg-transparent outline-none"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      value={row.vintageRange[1]}
                      onChange={(e) => {
                        const next = [...value];
                        next[idx] = { ...row, vintageRange: [row.vintageRange[0], Number(e.target.value)] };
                        onChange(next);
                      }}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      className="h-8 w-28 rounded-lg border px-2 text-sm bg-transparent outline-none"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      value={row.targetCount}
                      onChange={(e) => {
                        const next = [...value];
                        next[idx] = { ...row, targetCount: Number(e.target.value) };
                        onChange(next);
                      }}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => onChange(value.filter((_, i) => i !== idx))}
                      aria-label="Remove band"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


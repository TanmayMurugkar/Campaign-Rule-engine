import { useMemo } from 'react';
import { Coins, Target, Plus, Trash2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { KPI, PayoutMode, PayoutStructure } from '@/types/payout.types';
import { useCampaignWizardStore } from '@/store/campaignWizardStore';
import KPIBlock from './KPIBlock';
import VintageConditionBlock from './VintageConditionBlock';
import ConditionalPayoutEditor from './ConditionalPayoutEditor';

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function emptyKpi(name = 'New KPI'): KPI {
  return {
    id: newId('kpi'),
    name,
    isBase: false,
    tiers: [],
    conditions: [],
  };
}

export default function PayoutBuilder() {
  const campaign = useCampaignWizardStore((s) => s.campaign);
  const activeVersionIndex = useCampaignWizardStore((s) => s.activeVersionIndex);
  const updateRuleVersion = useCampaignWizardStore((s) => s.updateRuleVersion);

  const versions = campaign.ruleVersions ?? [];
  const rv = versions[activeVersionIndex];
  if (!rv) return null;

  const structure: PayoutStructure = rv.payoutStructure;

  const setStructure = (next: PayoutStructure) => {
    updateRuleVersion(activeVersionIndex, { payoutStructure: next });
  };

  const mode: PayoutMode = structure.mode ?? 'transaction_based';

  const baseKpi = useMemo(() => {
    if (mode !== 'target_based') return null;
    const baseId = structure.baseKPI;
    const kpis = structure.kpis ?? [];
    return kpis.find((k) => k.id === baseId) ?? kpis.find((k) => k.isBase) ?? null;
  }, [mode, structure.baseKPI, structure.kpis]);

  const secondaryKpis = useMemo(() => {
    if (mode !== 'target_based') return [];
    const kpis = structure.kpis ?? [];
    const baseId = structure.baseKPI ?? baseKpi?.id;
    return kpis.filter((k) => !k.isBase && k.id !== baseId);
  }, [mode, structure.kpis, structure.baseKPI, baseKpi?.id]);

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
        <p className="text-sm font-semibold text-foreground mb-1">Payout mode</p>
        <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
          Choose how payouts are computed. This is a UI configuration only.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setStructure({ ...structure, mode: 'transaction_based', baseKPI: undefined, baseKPITargetByVintage: undefined })}
            className={cn(
              'rounded-xl border p-4 text-left transition-all',
              mode === 'transaction_based'
                ? 'shadow-[0_0_0_2px_rgba(156,29,38,0.6)]'
                : 'hover:translate-y-[-1px] hover:shadow-lg'
            )}
            style={{
              borderColor: mode === 'transaction_based' ? 'var(--accent-primary)' : 'var(--border)',
              backgroundColor: mode === 'transaction_based' ? 'rgba(156,29,38,0.08)' : 'transparent',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--surface-muted)' }}>
                <Coins className="h-5 w-5" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Transaction-Based</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Define tiers for each KPI (points/cash per tier).
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              const existing = structure.kpis ?? [];
              const base = existing.find((k) => k.isBase) ?? emptyKpi('Base KPI');
              const kpis = existing.some((k) => k.id === base.id)
                ? existing.map((k) => (k.id === base.id ? { ...k, isBase: true } : { ...k, isBase: false }))
                : [{ ...base, isBase: true }, ...existing.map((k) => ({ ...k, isBase: false }))];

              setStructure({
                ...structure,
                mode: 'target_based',
                baseKPI: base.id,
                baseKPITargetByVintage: structure.baseKPITargetByVintage ?? [{ vintageRange: [0, 3], targetCount: 0 }],
                kpis,
              });
            }}
            className={cn(
              'rounded-xl border p-4 text-left transition-all',
              mode === 'target_based'
                ? 'shadow-[0_0_0_2px_rgba(156,29,38,0.6)]'
                : 'hover:translate-y-[-1px] hover:shadow-lg'
            )}
            style={{
              borderColor: mode === 'target_based' ? 'var(--accent-primary)' : 'var(--border)',
              backgroundColor: mode === 'target_based' ? 'rgba(156,29,38,0.08)' : 'transparent',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--surface-muted)' }}>
                <Target className="h-5 w-5" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Target-Based</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Base KPI + vintage targets + unlock gates for secondary KPIs.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {mode === 'transaction_based' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">KPIs</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Add KPIs and define tiers (points/cash).
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setStructure({ ...structure, kpis: [...(structure.kpis ?? []), emptyKpi()] })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add KPI
            </Button>
          </div>

          {(structure.kpis ?? []).length === 0 ? (
            <div
              className="rounded-xl border border-dashed p-10 text-center text-sm"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              No KPIs yet. Click “Add KPI”.
            </div>
          ) : (
            <div className="space-y-4">
              {(structure.kpis ?? []).map((k) => (
                <KPIBlock
                  key={k.id}
                  kpi={k}
                  onChange={(next) => setStructure({ ...structure, kpis: structure.kpis.map((x) => (x.id === k.id ? next : x)) })}
                  onRemove={() => setStructure({ ...structure, kpis: structure.kpis.filter((x) => x.id !== k.id) })}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Base KPI section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Base KPI</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  This KPI gates access to secondary KPIs.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const base = emptyKpi('Base KPI');
                  setStructure({
                    ...structure,
                    baseKPI: base.id,
                    kpis: [{ ...base, isBase: true }, ...(structure.kpis ?? []).map((k) => ({ ...k, isBase: false }))],
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New base KPI
              </Button>
            </div>

            <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
              <label className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                Select base KPI
              </label>
              <select
                className="h-9 w-full rounded-lg border bg-transparent px-2 text-sm outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                value={structure.baseKPI ?? ''}
                onChange={(e) => {
                  const id = e.target.value;
                  setStructure({
                    ...structure,
                    baseKPI: id,
                    kpis: (structure.kpis ?? []).map((k) => ({ ...k, isBase: k.id === id })),
                  });
                }}
              >
                <option value="" disabled>
                  Choose…
                </option>
                {(structure.kpis ?? []).map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name || k.id}
                  </option>
                ))}
              </select>
            </div>

            {baseKpi && (
              <KPIBlock
                kpi={baseKpi}
                onChange={(next) =>
                  setStructure({
                    ...structure,
                    kpis: (structure.kpis ?? []).map((x) => (x.id === baseKpi.id ? { ...next, isBase: true } : { ...x, isBase: false })),
                    baseKPI: baseKpi.id,
                  })
                }
              />
            )}

            <VintageConditionBlock
              value={structure.baseKPITargetByVintage ?? []}
              onChange={(next) => setStructure({ ...structure, baseKPITargetByVintage: next })}
            />
          </div>

          {/* Unlock gate editor */}
          <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4" style={{ color: 'var(--accent-primary)' }} />
              <p className="text-sm font-semibold text-foreground">Unlock gate</p>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Secondary KPIs can be configured with an unlock condition tied to the base KPI.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  Operator
                </label>
                <select
                  className="h-9 w-full rounded-lg border bg-transparent px-2 text-sm outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  value={secondaryKpis[0]?.unlockCondition?.operator ?? '>'}
                  onChange={(e) => {
                    const op = e.target.value as any;
                    const updated = (structure.kpis ?? []).map((k) => {
                      if (k.isBase) return k;
                      const u = k.unlockCondition ?? { kpiId: structure.baseKPI ?? '', threshold: 0, operator: op };
                      return { ...k, unlockCondition: { ...u, operator: op } };
                    });
                    setStructure({ ...structure, kpis: updated });
                  }}
                >
                  <option value=">">{'>'}</option>
                  <option value=">=">{'>='}</option>
                  <option value="=">{'='}</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  Threshold
                </label>
                <input
                  type="number"
                  className="h-9 w-full rounded-lg border px-3 text-sm bg-transparent outline-none focus:ring-1"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  value={secondaryKpis[0]?.unlockCondition?.threshold ?? 0}
                  onChange={(e) => {
                    const thr = Number(e.target.value);
                    const updated = (structure.kpis ?? []).map((k) => {
                      if (k.isBase) return k;
                      const u = k.unlockCondition ?? { kpiId: structure.baseKPI ?? '', threshold: thr, operator: '>' as any };
                      return { ...k, unlockCondition: { ...u, threshold: thr, kpiId: structure.baseKPI ?? '' } };
                    });
                    setStructure({ ...structure, kpis: updated });
                  }}
                />
              </div>
              <div className="flex items-end">
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Gate applies to all secondary KPIs (for this UI).
                </div>
              </div>
            </div>
          </div>

          {/* Secondary KPIs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Secondary KPIs</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Configure payouts unlocked after the base KPI gate.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const k = emptyKpi('Secondary KPI');
                  const unlock = structure.baseKPI
                    ? { kpiId: structure.baseKPI, operator: '>' as any, threshold: 0 }
                    : undefined;
                  setStructure({
                    ...structure,
                    kpis: [...(structure.kpis ?? []), { ...k, unlockCondition: unlock }],
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add KPI
              </Button>
            </div>

            {secondaryKpis.length === 0 ? (
              <div
                className="rounded-xl border border-dashed p-10 text-center text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                No secondary KPIs yet. Click “Add KPI”.
              </div>
            ) : (
              <div className="space-y-4">
                {secondaryKpis.map((k) => (
                  <div key={k.id} className="space-y-3">
                    <KPIBlock
                      kpi={k}
                      onChange={(next) =>
                        setStructure({
                          ...structure,
                          kpis: (structure.kpis ?? []).map((x) => (x.id === k.id ? next : x)),
                        })
                      }
                      onRemove={() =>
                        setStructure({
                          ...structure,
                          kpis: (structure.kpis ?? []).filter((x) => x.id !== k.id),
                        })
                      }
                    />
                    <ConditionalPayoutEditor
                      value={k.conditions}
                      onChange={(next) =>
                        setStructure({
                          ...structure,
                          kpis: (structure.kpis ?? []).map((x) => (x.id === k.id ? { ...x, conditions: next } : x)),
                        })
                      }
                    />
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 gap-2"
                        onClick={() =>
                          setStructure({
                            ...structure,
                            kpis: (structure.kpis ?? []).filter((x) => x.id !== k.id),
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove secondary KPI
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


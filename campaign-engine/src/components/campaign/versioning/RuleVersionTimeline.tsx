import { useMemo, useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCampaignWizardStore } from '@/store/campaignWizardStore';
import { validateVersionCoverage, validateVersionOverlap } from '@/utils/validators';
import AddVersionModal from './AddVersionModal';
import VersionCard from './VersionCard';
import type { RuleVersion } from '@/types/campaign.types';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export default function RuleVersionTimeline() {
  const campaign = useCampaignWizardStore((s) => s.campaign);
  const activeVersionIndex = useCampaignWizardStore((s) => s.activeVersionIndex);
  const setActiveVersionIndex = useCampaignWizardStore((s) => s.setActiveVersionIndex);
  const addRuleVersion = useCampaignWizardStore((s) => s.addRuleVersion);
  const updateRuleVersion = useCampaignWizardStore((s) => s.updateRuleVersion);
  const removeRuleVersion = useCampaignWizardStore((s) => s.removeRuleVersion);

  const [open, setOpen] = useState(false);

  const versions = campaign.ruleVersions ?? [];
  const start = campaign.startDate ? new Date(campaign.startDate) : null;
  const end = campaign.endDate ? new Date(campaign.endDate) : null;
  const totalDays = start && end ? Math.max(1, daysBetween(start, end) + 1) : null;

  const overlap = useMemo(() => {
    if (versions.length === 0) return null;
    const res = validateVersionOverlap(versions.map((v) => ({ id: v.id, startDate: v.startDate, endDate: v.endDate })));
    return res.valid ? null : 'Overlapping versions detected (activation blocked).';
  }, [versions]);

  const gaps = useMemo(() => {
    if (!campaign.startDate || !campaign.endDate || versions.length === 0) return null;
    const res = validateVersionCoverage(
      campaign.startDate,
      campaign.endDate,
      versions.map((v) => ({ startDate: v.startDate, endDate: v.endDate }))
    );
    return res.valid ? null : res.gaps;
  }, [campaign.startDate, campaign.endDate, versions]);

  const activeId = versions[activeVersionIndex]?.id;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Rule versions</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Split your campaign period into phases with different rules/payouts.
          </p>
        </div>
        <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add version
        </Button>
      </div>

      {/* Timeline bar */}
      <div className="rounded-xl border p-4 overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        {!start || !end || !totalDays ? (
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Set campaign start/end dates (Step 1) to enable the timeline.
          </div>
        ) : (
          <div className="min-w-[720px]">
            <div className="flex items-center justify-between text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              <span>{campaign.startDate}</span>
              <span>{campaign.endDate}</span>
            </div>
            <div className="relative h-10 rounded-lg" style={{ backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border)' }}>
              {versions.map((v) => {
                const vStart = new Date(v.startDate);
                const vEnd = new Date(v.endDate);
                const leftDays = clamp(daysBetween(start, vStart), 0, totalDays - 1);
                const widthDays = clamp(daysBetween(vStart, vEnd) + 1, 1, totalDays);
                const left = (leftDays / totalDays) * 100;
                const width = (widthDays / totalDays) * 100;
                const isActive = v.id === activeId;

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      const idx = versions.findIndex((x) => x.id === v.id);
                      if (idx >= 0) setActiveVersionIndex(idx);
                    }}
                    className="absolute top-1 bottom-1 rounded-md border text-xs px-2 overflow-hidden text-left"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      backgroundColor: isActive ? 'rgba(156,29,38,0.25)' : 'rgba(156,29,38,0.12)',
                      borderColor: isActive ? 'rgba(156,29,38,0.75)' : 'rgba(156,29,38,0.35)',
                      color: 'var(--text-primary)',
                    }}
                    title={`${v.label}: ${v.startDate} to ${v.endDate}`}
                  >
                    <span className="truncate block">{v.label}</span>
                  </button>
                );
              })}
            </div>

            {gaps && (
              <div className="mt-3 flex items-start gap-2 text-xs" style={{ color: 'var(--accent-warning)' }}>
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <div>
                  <div className="font-semibold text-foreground">Coverage gaps</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{gaps.join(' · ')}</div>
                </div>
              </div>
            )}

            {overlap && (
              <div className="mt-3 flex items-start gap-2 text-xs" style={{ color: 'var(--accent-danger)' }}>
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <div>
                  <div className="font-semibold text-foreground">Overlap</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{overlap}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Version cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {versions.map((v, idx) => (
          <VersionCard
            key={v.id}
            version={v}
            isActive={idx === activeVersionIndex}
            onSelect={() => setActiveVersionIndex(idx)}
            onEdit={() => {
              setActiveVersionIndex(idx);
              setOpen(true);
            }}
            onDuplicate={() => {
              addRuleVersion({
                ...v,
                id: `rv-${Date.now()}`,
                label: `${v.label} (Copy)`,
                createdAt: new Date().toISOString(),
              });
            }}
            onDelete={() => {
              if (confirm(`Delete version \"${v.label}\"?`)) removeRuleVersion(idx);
            }}
          />
        ))}
      </div>

      <AddVersionModal
        open={open}
        onOpenChange={setOpen}
        campaignStart={campaign.startDate}
        campaignEnd={campaign.endDate}
        existingVersions={versions}
        onAdd={(v) => {
          addRuleVersion(v);
        }}
        copyFromVersionId={versions[activeVersionIndex]?.id ?? null}
      />
    </div>
  );
}


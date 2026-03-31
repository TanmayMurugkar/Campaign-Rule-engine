import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { RuleVersion } from '@/types/campaign.types';
import { validateVersionOverlap } from '@/utils/validators';
import { createDefaultRuleVersion, createEmptyRuleGroup } from '@/utils/ruleEvaluator';

interface AddVersionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignStart?: string;
  campaignEnd?: string;
  existingVersions: RuleVersion[];
  onAdd: (version: RuleVersion) => void;
  copyFromVersionId?: string | null;
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function AddVersionModal({
  open,
  onOpenChange,
  campaignStart,
  campaignEnd,
  existingVersions,
  onAdd,
  copyFromVersionId,
}: AddVersionModalProps) {
  const [label, setLabel] = useState('');
  const [startDate, setStartDate] = useState(campaignStart ?? '');
  const [endDate, setEndDate] = useState(campaignEnd ?? '');
  const [copyFrom, setCopyFrom] = useState<string>(copyFromVersionId ?? '');

  const overlapError = useMemo(() => {
    if (!startDate || !endDate) return null;
    const next: RuleVersion = {
      id: 'tmp',
      label: label || 'New version',
      startDate,
      endDate,
      qualifyingRules: createEmptyRuleGroup(),
      payoutStructure: { mode: 'transaction_based', kpis: [] },
      createdAt: new Date().toISOString(),
    };
    const res = validateVersionOverlap([
      ...existingVersions.map((v) => ({ id: v.id, startDate: v.startDate, endDate: v.endDate })),
      { id: next.id, startDate: next.startDate, endDate: next.endDate },
    ]);
    return res.valid ? null : 'Selected date range overlaps an existing version.';
  }, [existingVersions, label, startDate, endDate]);

  const canSave =
    (label.trim().length > 0) &&
    !!startDate &&
    !!endDate &&
    endDate > startDate &&
    !overlapError;

  const handleAdd = () => {
    const now = new Date().toISOString();
    const base = createDefaultRuleVersion({ startDate, endDate } as any);
    const copied = copyFrom ? existingVersions.find((v) => v.id === copyFrom) : null;
    const version: RuleVersion = {
      ...base,
      id: newId('rv'),
      label: label.trim(),
      startDate,
      endDate,
      qualifyingRules: copied ? copied.qualifyingRules : base.qualifyingRules,
      payoutStructure: copied ? copied.payoutStructure : base.payoutStructure,
      createdAt: now,
    };
    onAdd(version);
    onOpenChange(false);
    setLabel('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Rule Version</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white">Version label</label>
            <input
              className="mt-1 h-9 w-full rounded-lg border px-3 text-sm bg-transparent outline-none focus:ring-1"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='e.g. "Phase 1: Oct 1–5"'
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-white">Start date</label>
              <input
                type="date"
                className="mt-1 h-9 w-full rounded-lg border px-3 text-sm bg-transparent outline-none focus:ring-1"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', colorScheme: 'dark' }}
                value={startDate}
                min={campaignStart}
                max={campaignEnd}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white">End date</label>
              <input
                type="date"
                className="mt-1 h-9 w-full rounded-lg border px-3 text-sm bg-transparent outline-none focus:ring-1"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', colorScheme: 'dark' }}
                value={endDate}
                min={startDate || campaignStart}
                max={campaignEnd}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-white">Copy from existing (optional)</label>
            <select
              className="mt-1 h-9 w-full rounded-lg border bg-transparent px-2 text-sm outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              value={copyFrom}
              onChange={(e) => setCopyFrom(e.target.value)}
            >
              <option value="">Do not copy</option>
              {existingVersions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {overlapError && (
            <div
              className="rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: 'rgba(239, 68, 68, 0.35)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                color: 'var(--accent-danger)',
              }}
            >
              {overlapError}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!canSave}
            style={{ backgroundColor: canSave ? 'var(--accent-primary)' : undefined, color: canSave ? '#fff' : undefined }}
          >
            Add version
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


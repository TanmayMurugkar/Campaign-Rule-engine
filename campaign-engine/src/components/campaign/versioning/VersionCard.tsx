import type { RuleVersion } from '@/types/campaign.types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Copy, Pencil, Trash2 } from 'lucide-react';

interface VersionCardProps {
  version: RuleVersion;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export default function VersionCard({
  version,
  isActive,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
}: VersionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-xl border p-4 text-left transition-colors hover:bg-black/[0.04]"
      style={{
        borderColor: isActive ? 'var(--accent-primary)' : 'var(--border)',
        backgroundColor: isActive ? 'rgba(156,29,38,0.08)' : 'transparent',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground truncate">{version.label}</p>
            {isActive && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ backgroundColor: 'rgba(156,29,38,0.18)', color: 'var(--accent-primary)' }}
              >
                Active
              </span>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {version.startDate && version.endDate
              ? `${format(new Date(version.startDate), 'MMM d')} – ${format(new Date(version.endDate), 'MMM d, yyyy')}`
              : 'Dates not set'}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
            {version.qualifyingRules.conditions.length} rule
            {version.qualifyingRules.conditions.length !== 1 ? 's' : ''} · {version.payoutStructure.kpis.length} KPI
            {version.payoutStructure.kpis.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Edit version">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDuplicate} aria-label="Duplicate version">
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10"
            onClick={onDelete}
            aria-label="Delete version"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </button>
  );
}


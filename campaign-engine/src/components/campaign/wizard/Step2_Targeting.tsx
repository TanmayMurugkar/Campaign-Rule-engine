import { useMemo } from 'react';
import { Users, Upload, ListTree } from 'lucide-react';
import { useCampaignWizardStore } from '@/store/campaignWizardStore';
import { cn } from '@/lib/utils';
import HierarchySelector from '@/components/campaign/targeting/HierarchySelector';
import ExcelUploader from '@/components/campaign/targeting/ExcelUploader';
import type { TargetingMode } from '@/types/targeting.types';

const MODES: Array<{
  id: TargetingMode;
  label: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    id: 'hierarchy',
    label: 'Use Hierarchy',
    description: 'Target agents by Channel → Sub Channel → Designation',
    icon: ListTree,
  },
  {
    id: 'excel_upload',
    label: 'Upload Excel',
    description: 'Upload .xlsx/.csv of specific agent IDs',
    icon: Upload,
  },
];

export default function Step2_Targeting() {
  const targeting = useCampaignWizardStore((s) => s.campaign.targeting);
  const updateCampaign = useCampaignWizardStore((s) => s.updateCampaign);

  const mode: TargetingMode = targeting?.mode ?? 'hierarchy';

  const summary = useMemo(() => {
    if (mode === 'excel_upload') {
      const count = targeting?.uploadedAgents?.length ?? 0;
      const file = targeting?.uploadFileName;
      return file ? `${count.toLocaleString()} agents · ${file}` : `${count.toLocaleString()} agents`;
    }
    const h = targeting?.hierarchy;
    if (!h) return 'No selections';
    return `${h.channels.length} channels, ${h.subChannels.length} sub-channels, ${h.designations.length} designations`;
  }, [mode, targeting]);

  return (
    <div className="space-y-6">
      <div className="card-base p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" style={{ color: 'var(--accent-primary)' }} />
              <h2 className="text-sm font-semibold text-foreground">Agent Targeting</h2>
            </div>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Choose how you want to target agents for this campaign.
            </p>
          </div>
          <div
            className="rounded-full border px-3 py-1.5 text-xs font-medium"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface-subtle)',
              color: 'var(--text-secondary)',
            }}
            title="Current targeting summary"
          >
            {summary}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {MODES.map((m) => {
            const Icon = m.icon;
            const selected = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() =>
                  updateCampaign({
                    targeting: {
                      ...(targeting ?? { mode: m.id }),
                      mode: m.id,
                    },
                  })
                }
                className={cn(
                  'rounded-xl border p-4 text-left transition-all duration-150',
                  selected
                    ? 'shadow-[0_0_0_2px_rgba(156,29,38,0.6)]'
                    : 'hover:translate-y-[-1px] hover:shadow-lg'
                )}
                style={{
                  borderColor: selected ? 'var(--accent-primary)' : 'var(--border)',
                  backgroundColor: selected ? 'rgba(156,29,38,0.08)' : 'transparent',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="rounded-lg p-2"
                    style={{
                      backgroundColor: selected
                        ? 'rgba(156,29,38,0.2)'
                        : 'var(--surface-muted)',
                    }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{
                        color: selected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{m.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {m.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {mode === 'hierarchy' ? <HierarchySelector /> : <ExcelUploader />}
    </div>
  );
}


import { useMemo } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, FileText, Users, GitBranch, Coins } from 'lucide-react';
import { format } from 'date-fns';
import { useCampaignWizardStore } from '@/store/campaignWizardStore';
import { reviewCampaignDraft } from '@/utils/campaignReview';
import { formatRuleGroupHumanReadable } from '@/utils/ruleEvaluator';
import { formatPayoutStructureHumanReadable } from '@/utils/payoutCalculator';
import RuleVersionTimeline from '@/components/campaign/versioning/RuleVersionTimeline';

function CardTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
      <Icon className="h-4 w-4" style={{ color: 'var(--accent-primary)' }} />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  );
}

function ChecklistRow({ type, text }: { type: 'ok' | 'warn' | 'error'; text: string }) {
  const cfg =
    type === 'ok'
      ? { Icon: CheckCircle2, color: 'var(--accent-secondary)', bg: 'rgba(201,162,39,0.1)', border: 'rgba(201,162,39,0.28)' }
      : type === 'warn'
        ? { Icon: AlertTriangle, color: 'var(--accent-warning)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' }
        : { Icon: XCircle, color: 'var(--accent-danger)', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' };
  const Icon = cfg.Icon;
  return (
    <div
      className="flex items-start gap-2 rounded-lg border px-3 py-2 text-sm"
      style={{ backgroundColor: cfg.bg, borderColor: cfg.border, color: cfg.color }}
    >
      <Icon className="h-4 w-4 mt-0.5" />
      <div style={{ color: 'var(--text-primary)' }}>{text}</div>
    </div>
  );
}

export default function Step5_ReviewSubmit() {
  const campaign = useCampaignWizardStore((s) => s.campaign);
  const activeVersionIndex = useCampaignWizardStore((s) => s.activeVersionIndex);

  const review = useMemo(() => reviewCampaignDraft(campaign), [campaign]);
  const versions = campaign.ruleVersions ?? [];

  const detailsPeriod =
    campaign.startDate && campaign.endDate
      ? `${format(new Date(campaign.startDate), 'MMM d, yyyy')} – ${format(new Date(campaign.endDate), 'MMM d, yyyy')}`
      : '—';

  const targetingSummary =
    campaign.targeting?.mode === 'excel_upload'
      ? `${campaign.targeting.uploadedAgents?.length ?? 0} agents (${campaign.targeting.uploadFileName ?? 'no file'})`
      : campaign.targeting?.hierarchy
        ? `${campaign.targeting.hierarchy.channels.length} channels, ${campaign.targeting.hierarchy.subChannels.length} sub-channels, ${campaign.targeting.hierarchy.designations.length} designations`
        : '—';

  const checklist = useMemo(() => {
    const rows: Array<{ type: 'ok' | 'warn' | 'error'; text: string }> = [];
    if (review.errors.length === 0) rows.push({ type: 'ok', text: 'No blocking errors detected.' });
    for (const e of review.errors) rows.push({ type: 'error', text: e });
    for (const w of review.warnings) rows.push({ type: 'warn', text: w });
    return rows;
  }, [review.errors, review.warnings]);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card-base p-5 space-y-4">
          <CardTitle icon={FileText} title="Campaign details" />
          <div className="text-sm space-y-2">
            <div className="flex justify-between gap-3">
              <span style={{ color: 'var(--text-secondary)' }}>Name</span>
              <span className="text-foreground text-right">{campaign.name ?? '—'}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span style={{ color: 'var(--text-secondary)' }}>Type</span>
              <span className="text-foreground capitalize">{campaign.type ?? '—'}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span style={{ color: 'var(--text-secondary)' }}>Period</span>
              <span className="text-foreground text-right">{detailsPeriod}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span style={{ color: 'var(--text-secondary)' }}>ID</span>
              <span className="text-foreground font-mono text-right">{campaign.id ?? '—'}</span>
            </div>
          </div>
          {campaign.description ? (
            <div className="pt-3 border-t text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              {campaign.description}
            </div>
          ) : null}
        </div>

        <div className="card-base p-5 space-y-4">
          <CardTitle icon={Users} title="Targeting" />
          <div className="text-sm space-y-2">
            <div className="flex justify-between gap-3">
              <span style={{ color: 'var(--text-secondary)' }}>Mode</span>
              <span className="text-foreground">
                {campaign.targeting?.mode === 'excel_upload' ? 'Excel upload' : campaign.targeting?.mode === 'hierarchy' ? 'Hierarchy' : '—'}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span style={{ color: 'var(--text-secondary)' }}>Summary</span>
              <span className="text-foreground text-right">{targetingSummary}</span>
            </div>
          </div>
        </div>

        <div className="card-base p-5 space-y-4">
          <CardTitle icon={GitBranch} title="Rule versions" />
          <div className="text-sm space-y-2">
            <div className="flex justify-between gap-3">
              <span style={{ color: 'var(--text-secondary)' }}>Versions</span>
              <span className="text-foreground">{versions.length}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span style={{ color: 'var(--text-secondary)' }}>Active index</span>
              <span className="text-foreground">{activeVersionIndex + 1}</span>
            </div>
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Activation is blocked by errors; warnings are allowed.
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="card-base p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">Validation checklist</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Errors block activation; warnings are informational.
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {checklist.map((r, i) => (
            <ChecklistRow key={i} type={r.type} text={r.text} />
          ))}
        </div>
      </div>

      {/* Per-version previews */}
      <div className="card-base p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4" style={{ color: 'var(--accent-primary)' }} />
          <h2 className="text-sm font-semibold text-foreground">Per-version summary</h2>
        </div>

        <RuleVersionTimeline />

        {versions.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            No versions yet. Go to Step 3 or Step 4 to create/edit a version.
          </div>
        ) : (
          <div className="space-y-4">
            {versions.map((v) => (
              <div key={v.id} className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{v.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {v.startDate && v.endDate ? `${v.startDate} → ${v.endDate}` : 'Dates not set'}
                    </p>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {v.qualifyingRules.conditions.length} rule{v.qualifyingRules.conditions.length !== 1 ? 's' : ''} ·{' '}
                    {v.payoutStructure.kpis.length} KPI{v.payoutStructure.kpis.length !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Qualifying rules
                    </p>
                    <pre className="rule-preview text-xs whitespace-pre-wrap overflow-x-auto">
                      {formatRuleGroupHumanReadable(v.qualifyingRules)}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Payout structure
                    </p>
                    <pre className="rule-preview text-xs whitespace-pre-wrap overflow-x-auto">
                      {formatPayoutStructureHumanReadable(v.payoutStructure)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


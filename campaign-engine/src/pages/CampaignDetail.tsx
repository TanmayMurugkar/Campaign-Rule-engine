import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Copy, Calendar, Users } from 'lucide-react';
import { useCampaignListStore } from '@/store/campaignListStore';
import { CAMPAIGN_STATUS_CONFIG, CAMPAIGN_TYPES } from '@/constants/campaignTypes';
import { format } from 'date-fns';

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaigns, duplicateCampaign } = useCampaignListStore();
  const campaign = campaigns.find((c) => c.id === id);

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-foreground text-lg font-semibold">Campaign not found</p>
        <Link
          to="/campaigns"
          className="text-sm hover:underline"
          style={{ color: 'var(--accent-primary)' }}
        >
          ← Back to Campaigns
        </Link>
      </div>
    );
  }

  const statusConfig = CAMPAIGN_STATUS_CONFIG[campaign.status];
  const typeConfig = CAMPAIGN_TYPES.find((t) => t.value === campaign.type);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-black/[0.06] transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-display font-bold text-foreground">{campaign.name}</h1>
              <span className={statusConfig.badgeClass}>{statusConfig.label}</span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              ID: {campaign.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              duplicateCampaign(campaign.id);
              navigate('/campaigns');
            }}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border hover:bg-black/[0.04] transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            <Copy className="h-3.5 w-3.5" />
            Duplicate
          </button>
          <Link
            to={`/campaigns/${campaign.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </div>
      </div>

      {/* Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-base p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Campaign Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Type</span>
              <span className="text-foreground">{typeConfig?.label ?? campaign.type}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Period</span>
              <span className="text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(campaign.startDate), 'MMM d')} –{' '}
                {format(new Date(campaign.endDate), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Rule Versions</span>
              <span className="text-foreground">{campaign.ruleVersions.length}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Created</span>
              <span className="text-foreground">
                {format(new Date(campaign.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          {campaign.description && (
            <p className="text-sm pt-2 border-t" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
              {campaign.description}
            </p>
          )}
        </div>

        <div className="card-base p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Targeting</h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Mode</span>
              <span className="text-foreground capitalize">
                {campaign.targeting.mode === 'hierarchy' ? 'Hierarchy Selection' : 'Excel Upload'}
              </span>
            </div>
            {campaign.targeting.mode === 'hierarchy' && campaign.targeting.hierarchy && (
              <>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Channels</span>
                  <span className="text-foreground">
                    {campaign.targeting.hierarchy.channels.join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Sub-Channels</span>
                  <span className="text-foreground text-right max-w-[200px]">
                    {campaign.targeting.hierarchy.subChannels.join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Designations</span>
                  <span className="text-foreground text-right max-w-[200px]">
                    {campaign.targeting.hierarchy.designations.join(', ')}
                  </span>
                </div>
              </>
            )}
            {campaign.targeting.mode === 'excel_upload' && (
              <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <Users className="h-4 w-4" />
                <span>{campaign.targeting.uploadedAgents?.length ?? 0} agents loaded</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rule Versions */}
      <div className="card-base">
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold text-foreground">Rule Versions</h2>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {campaign.ruleVersions.map((rv, i) => (
            <div key={rv.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{rv.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {format(new Date(rv.startDate), 'MMM d')} –{' '}
                  {format(new Date(rv.endDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {rv.qualifyingRules.conditions.length} rule
                {rv.qualifyingRules.conditions.length !== 1 ? 's' : ''}
                {' · '}
                {rv.payoutStructure.kpis.length} KPI
                {rv.payoutStructure.kpis.length !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

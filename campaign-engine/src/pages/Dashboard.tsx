import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Users, Clock, Activity } from 'lucide-react';
import { useCampaignListStore } from '@/store/campaignListStore';
import { CAMPAIGN_STATUS_CONFIG } from '@/constants/campaignTypes';
import { format } from 'date-fns';

export default function Dashboard() {
  const campaigns = useCampaignListStore((s) => s.campaigns);

  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  const draftCampaigns = campaigns.filter((c) => c.status === 'draft');
  const expiringCampaigns = campaigns.filter((c) => {
    const end = new Date(c.endDate);
    const now = new Date();
    const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });
  const totalAgents = campaigns
    .filter((c) => c.status === 'active')
    .reduce((acc, c) => {
      if (c.targeting.mode === 'excel_upload') {
        return acc + (c.targeting.uploadedAgents?.length ?? 0);
      }
      return acc + 120; // placeholder for hierarchy-based
    }, 0);

  const recentCampaigns = [...campaigns]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const stats = [
    {
      label: 'Active Campaigns',
      value: activeCampaigns.length,
      icon: Activity,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
    {
      label: 'Draft Campaigns',
      value: draftCampaigns.length,
      icon: TrendingUp,
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10',
    },
    {
      label: 'Total Agents Targeted',
      value: totalAgents.toLocaleString(),
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Expiring This Week',
      value: expiringCampaigns.length,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Campaign Rule Engine — Overview
          </p>
        </div>
        <Link
          to="/campaigns/create"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:opacity-90"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        >
          <Plus className="h-4 w-4" />
          Create Campaign
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="card-base p-5 flex items-center gap-4"
          >
            <div className={`rounded-lg p-2.5 ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Campaigns */}
      <div className="card-base">
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Recent Campaigns</h2>
            <Link
              to="/campaigns"
              className="text-sm hover:underline"
              style={{ color: 'var(--accent-primary)' }}
            >
              View all →
            </Link>
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {recentCampaigns.length === 0 ? (
            <div className="px-6 py-12 text-center" style={{ color: 'var(--text-secondary)' }}>
              <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No campaigns yet. Create your first campaign!</p>
            </div>
          ) : (
            recentCampaigns.map((campaign) => {
              const statusConfig = CAMPAIGN_STATUS_CONFIG[campaign.status];
              return (
                <div
                  key={campaign.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <Link
                        to={`/campaigns/${campaign.id}`}
                        className="text-sm font-medium text-white hover:underline"
                      >
                        {campaign.name}
                      </Link>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {format(new Date(campaign.startDate), 'MMM d')} –{' '}
                        {format(new Date(campaign.endDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={statusConfig.badgeClass}>
                      {statusConfig.label}
                    </span>
                    <Link
                      to={`/campaigns/${campaign.id}`}
                      className="text-xs hover:underline"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      View →
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

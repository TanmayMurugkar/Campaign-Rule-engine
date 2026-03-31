import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Pencil, Copy, Trash2, MoreHorizontal } from 'lucide-react';
import { useCampaignListStore, getFilteredCampaigns } from '@/store/campaignListStore';
import { CAMPAIGN_STATUS_CONFIG, CAMPAIGN_TYPES } from '@/constants/campaignTypes';
import { format } from 'date-fns';
import type { Campaign } from '@/types/campaign.types';

export default function CampaignList() {
  const { campaigns, filters, setFilters, deleteCampaign, duplicateCampaign } =
    useCampaignListStore();
  const navigate = useNavigate();
  const filtered = getFilteredCampaigns(campaigns, filters);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Campaigns</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {filtered.length} campaign{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/campaigns/create"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Link>
      </div>

      {/* Filters */}
      <div className="card-base p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: 'var(--text-secondary)' }}
          />
          <input
            type="text"
            placeholder="Search campaigns..."
            className="w-full rounded-lg pl-9 pr-3 py-2 text-sm bg-transparent border outline-none focus:ring-1"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
              '--tw-ring-color': 'var(--accent-primary)',
            } as React.CSSProperties}
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </div>

        <select
          className="rounded-lg px-3 py-2 text-sm bg-transparent border outline-none cursor-pointer"
          style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value as typeof filters.status })}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="expired">Expired</option>
        </select>

        <select
          className="rounded-lg px-3 py-2 text-sm bg-transparent border outline-none cursor-pointer"
          style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}
          value={filters.type}
          onChange={(e) => setFilters({ type: e.target.value as typeof filters.type })}
        >
          <option value="all">All Types</option>
          {CAMPAIGN_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              {['Name', 'Type', 'Period', 'Versions', 'Status', 'Actions'].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center" style={{ color: 'var(--text-secondary)' }}>
                  <Filter className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No campaigns match your filters.</p>
                </td>
              </tr>
            ) : (
              filtered.map((campaign: Campaign) => {
                const statusConfig = CAMPAIGN_STATUS_CONFIG[campaign.status];
                const typeConfig = CAMPAIGN_TYPES.find((t) => t.value === campaign.type);
                return (
                  <tr
                    key={campaign.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{campaign.name}</p>
                      <p className="text-xs mt-0.5 truncate max-w-[250px]" style={{ color: 'var(--text-secondary)' }}>
                        {campaign.description}
                      </p>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {typeConfig?.label ?? campaign.type}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                      {format(new Date(campaign.startDate), 'MMM d')} –{' '}
                      {format(new Date(campaign.endDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {campaign.ruleVersions.length} version{campaign.ruleVersions.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className={statusConfig.badgeClass}>{statusConfig.label}</span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/campaigns/${campaign.id}`)}
                          className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                          title="View"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
                          className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                          title="Edit"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => duplicateCampaign(campaign.id)}
                          className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                          title="Duplicate"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${campaign.name}"?`)) {
                              deleteCampaign(campaign.id);
                            }
                          }}
                          className="p-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                          title="Delete"
                          style={{ color: 'var(--accent-danger)' }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

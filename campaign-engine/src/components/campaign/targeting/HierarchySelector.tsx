import { useMemo } from 'react';
import { Check, Layers, ListChecks } from 'lucide-react';
import { HIERARCHY_DATA } from '@/constants/campaignTypes';
import { useCampaignWizardStore } from '@/store/campaignWizardStore';
import { cn } from '@/lib/utils';

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function setAll(current: string[], all: string[], shouldSelectAll: boolean): string[] {
  if (shouldSelectAll) return [...all];
  return current.filter((v) => !all.includes(v));
}

function Chip({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs"
      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
    >
      {label}
    </span>
  );
}

export default function HierarchySelector() {
  const targeting = useCampaignWizardStore((s) => s.campaign.targeting);
  const updateCampaign = useCampaignWizardStore((s) => s.updateCampaign);

  const hierarchy = targeting?.hierarchy ?? {
    channels: [],
    subChannels: [],
    designations: [],
  };

  const allChannels = HIERARCHY_DATA.channels;
  const availableSubChannels = useMemo(() => {
    const selectedChannels = hierarchy.channels;
    if (selectedChannels.length === 0) return [];
    const all = selectedChannels.flatMap((ch) => HIERARCHY_DATA.subChannels[ch] ?? []);
    return Array.from(new Set(all)).sort();
  }, [hierarchy.channels]);

  const allDesignations = HIERARCHY_DATA.designations;

  const selectedSubChannelsFiltered = useMemo(() => {
    const allowed = new Set(availableSubChannels);
    return hierarchy.subChannels.filter((sc) => allowed.has(sc));
  }, [availableSubChannels, hierarchy.subChannels]);

  const summary = useMemo(() => {
    return `${hierarchy.channels.length} channels, ${selectedSubChannelsFiltered.length} sub-channels, ${hierarchy.designations.length} designations selected`;
  }, [hierarchy.channels.length, selectedSubChannelsFiltered.length, hierarchy.designations.length]);

  function commit(next: typeof hierarchy) {
    updateCampaign({
      targeting: {
        mode: 'hierarchy',
        hierarchy: next,
      },
    });
  }

  if (selectedSubChannelsFiltered.length !== hierarchy.subChannels.length) {
    commit({ ...hierarchy, subChannels: selectedSubChannelsFiltered });
  }

  const channelAllSelected = hierarchy.channels.length === allChannels.length;
  const subAllSelected =
    availableSubChannels.length > 0 &&
    selectedSubChannelsFiltered.length === availableSubChannels.length;
  const desigAllSelected = hierarchy.designations.length === allDesignations.length;

  const chips = [
    ...hierarchy.channels.map((v) => `Channel: ${v}`),
    ...selectedSubChannelsFiltered.map((v) => `Sub: ${v}`),
    ...hierarchy.designations.map((v) => `Role: ${v}`),
  ];

  return (
    <div className="card-base p-6 space-y-5">
      <div
        className="flex items-center justify-between gap-3 pb-3 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4" style={{ color: 'var(--accent-primary)' }} />
          <h3 className="text-sm font-semibold text-white">Hierarchy Selector</h3>
        </div>
        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {summary}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">Channels</p>
            <button
              type="button"
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs transition-colors hover:bg-white/5'
              )}
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              onClick={() =>
                commit({
                  ...hierarchy,
                  channels: channelAllSelected ? [] : [...allChannels],
                })
              }
            >
              <ListChecks className="h-3.5 w-3.5" />
              {channelAllSelected ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="space-y-2">
            {allChannels.map((ch) => {
              const checked = hierarchy.channels.includes(ch);
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() =>
                    commit({
                      ...hierarchy,
                      channels: toggleInList(hierarchy.channels, ch),
                    })
                  }
                  className={cn(
                    'w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                    checked ? 'bg-white/5' : 'hover:bg-white/5'
                  )}
                >
                  <span style={{ color: checked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {ch}
                  </span>
                  {checked && <Check className="h-4 w-4" style={{ color: 'var(--accent-primary)' }} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">Sub Channels</p>
            <button
              type="button"
              disabled={availableSubChannels.length === 0}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs transition-colors',
                availableSubChannels.length === 0 && 'opacity-50 cursor-not-allowed'
              )}
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              onClick={() =>
                commit({
                  ...hierarchy,
                  subChannels: setAll(
                    selectedSubChannelsFiltered,
                    availableSubChannels,
                    !subAllSelected
                  ),
                })
              }
            >
              <ListChecks className="h-3.5 w-3.5" />
              {subAllSelected ? 'Clear all' : 'Select all'}
            </button>
          </div>
          {availableSubChannels.length === 0 ? (
            <div className="text-sm py-6 text-center" style={{ color: 'var(--text-secondary)' }}>
              Select at least one channel to see sub-channels.
            </div>
          ) : (
            <div className="space-y-2">
              {availableSubChannels.map((sc) => {
                const checked = selectedSubChannelsFiltered.includes(sc);
                return (
                  <button
                    key={sc}
                    type="button"
                    onClick={() =>
                      commit({
                        ...hierarchy,
                        subChannels: toggleInList(selectedSubChannelsFiltered, sc),
                      })
                    }
                    className={cn(
                      'w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                      checked ? 'bg-white/5' : 'hover:bg-white/5'
                    )}
                  >
                    <span style={{ color: checked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {sc}
                    </span>
                    {checked && <Check className="h-4 w-4" style={{ color: 'var(--accent-primary)' }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">Designations</p>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs transition-colors hover:bg-white/5"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              onClick={() =>
                commit({
                  ...hierarchy,
                  designations: desigAllSelected ? [] : [...allDesignations],
                })
              }
            >
              <ListChecks className="h-3.5 w-3.5" />
              {desigAllSelected ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="space-y-2">
            {allDesignations.map((d) => {
              const checked = hierarchy.designations.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() =>
                    commit({
                      ...hierarchy,
                      designations: toggleInList(hierarchy.designations, d),
                    })
                  }
                  className={cn(
                    'w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                    checked ? 'bg-white/5' : 'hover:bg-white/5'
                  )}
                >
                  <span style={{ color: checked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {d}
                  </span>
                  {checked && <Check className="h-4 w-4" style={{ color: 'var(--accent-primary)' }} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          Selection summary
        </p>
        {chips.length === 0 ? (
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            No selections yet.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <Chip key={c} label={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

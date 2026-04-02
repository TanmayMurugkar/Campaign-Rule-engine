import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Campaign, CampaignStatus, CampaignType } from '@/types/campaign.types';
import { SAMPLE_CAMPAIGNS } from '@/mocks/sampleCampaigns';

export interface CampaignFilters {
  search: string;
  status: CampaignStatus | 'all';
  type: CampaignType | 'all';
  dateFrom: string;
  dateTo: string;
}

interface CampaignListState {
  campaigns: Campaign[];
  filters: CampaignFilters;
  page: number;
  pageSize: number;
  isLoading: boolean;

  // Actions
  setCampaigns: (campaigns: Campaign[]) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  duplicateCampaign: (id: string) => void;
  setFilters: (filters: Partial<CampaignFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
}

const defaultFilters: CampaignFilters = {
  search: '',
  status: 'all',
  type: 'all',
  dateFrom: '',
  dateTo: '',
};

export const useCampaignListStore = create<CampaignListState>()(
  persist(
    (set, get) => ({
      campaigns: SAMPLE_CAMPAIGNS,
      filters: defaultFilters,
      page: 1,
      pageSize: 10,
      isLoading: false,

      setCampaigns: (campaigns) => set({ campaigns }),

      addCampaign: (campaign) =>
        set((state) => ({ campaigns: [campaign, ...state.campaigns] })),

      updateCampaign: (id, updates) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        })),

      deleteCampaign: (id) =>
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
        })),

      duplicateCampaign: (id) => {
        const { campaigns } = get();
        const original = campaigns.find((c) => c.id === id);
        if (!original) return;
        const now = new Date().toISOString();
        const duplicate: Campaign = {
          ...original,
          id: `campaign-${Date.now()}`,
          name: `${original.name} (Copy)`,
          status: 'draft',
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ campaigns: [duplicate, ...state.campaigns] }));
      },

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
          page: 1,
        })),

      resetFilters: () => set({ filters: defaultFilters, page: 1 }),

      setPage: (page) => set({ page }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'campaign-engine.campaigns.v1',
      partialize: (state) => ({ campaigns: state.campaigns }),
    }
  )
);

/** Pure selector: filter campaigns by current filter state */
export function getFilteredCampaigns(
  campaigns: Campaign[],
  filters: CampaignFilters
): Campaign[] {
  return campaigns.filter((c) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filters.status !== 'all' && c.status !== filters.status) return false;
    if (filters.type !== 'all' && c.type !== filters.type) return false;
    if (filters.dateFrom && c.startDate < filters.dateFrom) return false;
    if (filters.dateTo && c.endDate > filters.dateTo) return false;
    return true;
  });
}

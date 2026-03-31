import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Campaign, RuleVersion } from '@/types/campaign.types';

interface WizardState {
  currentStep: number;         // 1-5
  campaign: Partial<Campaign>;
  activeVersionIndex: number;
  /** When set, Save/Activate updates the list store instead of inserting a new campaign */
  editingCampaignId: string | null;

  // Actions
  setStep: (step: number) => void;
  updateCampaign: (data: Partial<Campaign>) => void;
  addRuleVersion: (version: RuleVersion) => void;
  updateRuleVersion: (index: number, version: Partial<RuleVersion>) => void;
  removeRuleVersion: (index: number) => void;
  resetWizard: () => void;
  setActiveVersionIndex: (index: number) => void;
  loadCampaignForEdit: (campaign: Campaign) => void;
}

const initialCampaign: Partial<Campaign> = {
  ruleVersions: [],
  status: 'draft',
  type: 'points',
  targeting: {
    mode: 'hierarchy',
    hierarchy: { channels: [], subChannels: [], designations: [] },
  },
};

export const useCampaignWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      currentStep: 1,
      campaign: initialCampaign,
      activeVersionIndex: 0,
      editingCampaignId: null,

      setStep: (step) => set({ currentStep: step }),

      updateCampaign: (data) =>
        set((state) => ({
          campaign: { ...state.campaign, ...data },
        })),

      addRuleVersion: (version) =>
        set((state) => {
          const next = [...(state.campaign.ruleVersions ?? []), version].sort(
            (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );
          return {
            campaign: { ...state.campaign, ruleVersions: next },
            activeVersionIndex: Math.max(0, next.findIndex((v) => v.id === version.id)),
          };
        }),

      updateRuleVersion: (index, versionUpdate) =>
        set((state) => {
          const prev = [...(state.campaign.ruleVersions ?? [])];
          const updated = { ...prev[index], ...versionUpdate } as RuleVersion;
          prev[index] = updated;
          const next = prev.sort(
            (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );
          const nextIdx = next.findIndex((v) => v.id === updated.id);
          return {
            campaign: { ...state.campaign, ruleVersions: next },
            activeVersionIndex: nextIdx >= 0 ? nextIdx : state.activeVersionIndex,
          };
        }),

      removeRuleVersion: (index) =>
        set((state) => {
          const versions = [...(state.campaign.ruleVersions ?? [])];
          versions.splice(index, 1);
          const nextActive = Math.max(0, Math.min(state.activeVersionIndex, versions.length - 1));
          return { campaign: { ...state.campaign, ruleVersions: versions }, activeVersionIndex: nextActive };
        }),

      resetWizard: () =>
        set({
          currentStep: 1,
          campaign: { ...initialCampaign, ruleVersions: [] },
          activeVersionIndex: 0,
          editingCampaignId: null,
        }),

      loadCampaignForEdit: (campaign) =>
        set({
          currentStep: 1,
          activeVersionIndex: 0,
          editingCampaignId: campaign.id,
          campaign: {
            ...campaign,
            ruleVersions: campaign.ruleVersions ? [...campaign.ruleVersions] : [],
          },
        }),

      setActiveVersionIndex: (index) => set({ activeVersionIndex: index }),
    }),
    {
      name: 'campaign-wizard-draft',
      partialize: (state) => ({
        currentStep: state.currentStep,
        campaign: state.campaign,
        activeVersionIndex: state.activeVersionIndex,
        // editingCampaignId is intentionally not persisted (URL is source of truth for edit)
      }),
    }
  )
);

import { create } from 'zustand';
import type { RuleVersion } from '@/types/campaign.types';

interface RuleVersionState {
  versions: RuleVersion[];
  selectedVersionId: string | null;

  // Actions
  setVersions: (versions: RuleVersion[]) => void;
  selectVersion: (id: string | null) => void;
  addVersion: (version: RuleVersion) => void;
  updateVersion: (id: string, updates: Partial<RuleVersion>) => void;
  removeVersion: (id: string) => void;
  reorderVersions: (versions: RuleVersion[]) => void;
}

export const useRuleVersionStore = create<RuleVersionState>()((set) => ({
  versions: [],
  selectedVersionId: null,

  setVersions: (versions) => set({ versions }),

  selectVersion: (id) => set({ selectedVersionId: id }),

  addVersion: (version) =>
    set((state) => ({
      versions: [...state.versions, version].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      ),
    })),

  updateVersion: (id, updates) =>
    set((state) => ({
      versions: state.versions.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    })),

  removeVersion: (id) =>
    set((state) => ({
      versions: state.versions.filter((v) => v.id !== id),
    })),

  reorderVersions: (versions) => set({ versions }),
}));

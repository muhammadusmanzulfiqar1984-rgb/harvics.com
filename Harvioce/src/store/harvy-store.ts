import { create } from 'zustand';

interface HarvyState {
  kpis: { total: number; qualified: number; needsFollowUp: number };
  activeLead: any | null;
  outreachDraft: { channel: string; content: string; target: string } | null;

  setKpis: (kpis: HarvyState['kpis']) => void;
  setActiveLead: (lead: any) => void;
  setOutreachDraft: (draft: HarvyState['outreachDraft']) => void;
}

export const useHarvyStore = create<HarvyState>((set) => ({
  kpis: { total: 0, qualified: 0, needsFollowUp: 0 },
  activeLead: null,
  outreachDraft: null,

  setKpis: (kpis) => set({ kpis }),
  setActiveLead: (lead) => set({ activeLead: lead }),
  setOutreachDraft: (draft) => set({ outreachDraft: draft }),
}));

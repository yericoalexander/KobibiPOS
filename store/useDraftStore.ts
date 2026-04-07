import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './useCartStore';

export interface DraftOrder {
  id: string; // Database 'id' if it exists, or 'temp-id' if strictly local
  orderNumber: string; // Display string like ORD-2024...
  customerName: string;
  tableNumber: string;
  items: CartItem[];
  subtotal: number;
}

interface DraftState {
  drafts: DraftOrder[];
  activeDraftId: string | null;
  addDraft: (draft: DraftOrder) => void;
  updateDraft: (id: string, updates: Partial<DraftOrder>) => void;
  removeDraft: (id: string) => void;
  setActiveDraftId: (id: string | null) => void;
  setDrafts: (drafts: DraftOrder[]) => void;
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      drafts: [],
      activeDraftId: null,

      addDraft: (draft) => set((state) => {
        if (state.drafts.find(d => d.id === draft.id)) return state;
        return {
          drafts: [...state.drafts, draft],
        };
      }),

      updateDraft: (id, updates) => set((state) => ({
        drafts: state.drafts.map(d => d.id === id ? { ...d, ...updates } : d)
      })),

      removeDraft: (id) => set((state) => ({
        drafts: state.drafts.filter(d => d.id !== id),
        activeDraftId: state.activeDraftId === id ? null : state.activeDraftId,
      })),

      setActiveDraftId: (id) => set({ activeDraftId: id }),

      setDrafts: (drafts) => set({ drafts }),
    }),
    {
      name: 'pos-draft-store',
    }
  )
);

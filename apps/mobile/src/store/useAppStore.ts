import { create } from 'zustand';
import { EventCategory } from '@sehir-nabiz/shared';

interface AppState {
  selectedCity: string;
  activeCategories: EventCategory[];
  isOnline: boolean;
  setSelectedCity: (city: string) => void;
  toggleCategory: (category: EventCategory) => void;
  resetCategories: () => void;
  setIsOnline: (status: boolean) => void;
}

export const useAppStore = create<AppState>(set => ({
  selectedCity: 'İstanbul',
  activeCategories: [],
  isOnline: true,

  setSelectedCity: (city: string) => set({ selectedCity: city }),

  toggleCategory: (category: EventCategory) =>
    set(state => {
      const exists = state.activeCategories.includes(category);
      return {
        activeCategories: exists
          ? state.activeCategories.filter(c => c !== category)
          : [...state.activeCategories, category],
      };
    }),

  resetCategories: () => set({ activeCategories: [] }),

  setIsOnline: (isOnline: boolean) => set({ isOnline }),
}));

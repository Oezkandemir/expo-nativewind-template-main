import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RewardSummary } from '@/types/reward';

interface RewardState {
  summary: RewardSummary | null;
  setSummary: (summary: RewardSummary | null) => void;
  clearSummary: () => void;
}

export const useRewardStore = create<RewardState>()(
  persist(
    (set) => ({
      summary: null,
      setSummary: (summary) => set({ summary }),
      clearSummary: () => set({ summary: null }),
    }),
    {
      name: 'reward-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);




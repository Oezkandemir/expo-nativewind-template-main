import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyAdStatus } from '@/types/ad';

interface AdState {
  dailyStatus: DailyAdStatus | null;
  setDailyStatus: (status: DailyAdStatus | null) => void;
  clearDailyStatus: () => void;
}

export const useAdStore = create<AdState>()(
  persist(
    (set) => ({
      dailyStatus: null,
      setDailyStatus: (dailyStatus) => set({ dailyStatus }),
      clearDailyStatus: () => set({ dailyStatus: null }),
    }),
    {
      name: 'ad-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);




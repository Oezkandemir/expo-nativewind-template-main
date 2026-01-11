export type AdType = 'image' | 'video' | 'interactive';

export interface Ad {
  id: string;
  title: string;
  content: string; // URL or content identifier
  type: AdType;
  duration: number; // in seconds
  reward: number; // reward amount in euros
  campaignId: string;
  campaignName: string;
  scheduledTime?: string; // ISO timestamp for scheduled ads
  targetInterests?: string[]; // Interests this ad targets
  createdAt: string;
}

export interface AdSlot {
  id: string;
  time: string; // HH:mm format (e.g., "09:00")
  hour: number; // 0-23
  minute: number; // 0-59
}

export interface AdView {
  id: string;
  userId: string;
  adId: string;
  slotId: string;
  watchedAt: string; // ISO timestamp
  duration: number; // actual watch duration in seconds
  rewardEarned: number;
  verified: boolean; // Whether the view was verified (watched full duration)
  date: string; // YYYY-MM-DD format for daily tracking
}

export interface DailyAdStatus {
  date: string; // YYYY-MM-DD
  slots: {
    slotId: string;
    time: string;
    completed: boolean;
    adId?: string;
    viewedAt?: string;
  }[];
}




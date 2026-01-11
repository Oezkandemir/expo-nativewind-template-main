export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

export interface Demographics {
  age: number;
  gender: Gender;
  location?: string;
  country?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Only for dummy auth, remove in production
  avatarUrl?: string; // Optional custom avatar URL, falls back to RoboHash
  interests: string[];
  demographics: Demographics;
  preferences: {
    notificationsEnabled: boolean;
    adFrequencyPreference?: 'standard' | 'more' | 'less';
    widgets: {
      historyEnabled: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  userId: string;
  email: string;
  expiresAt: number;
}




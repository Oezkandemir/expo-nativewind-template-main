import { Gender } from './user';

export interface OnboardingData {
  step: number;
  interests: string[];
  personalData: {
    name: string;
    email: string;
    password: string;
    age: number;
    gender: Gender;
    location?: string;
    country?: string;
  };
  preferences: {
    notificationsEnabled: boolean;
    adFrequencyPreference?: 'standard' | 'more' | 'less';
  };
  completed: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  component: string; // route name
}




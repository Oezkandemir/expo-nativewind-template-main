export type RewardStatus = 'pending' | 'earned' | 'paid' | 'cancelled';
export type RewardSource = 'ad_view' | 'referral' | 'bonus' | 'other';

export interface Reward {
  id: string;
  userId: string;
  amount: number; // in euros
  source: RewardSource;
  sourceId?: string; // ID of the source (e.g., adViewId)
  status: RewardStatus;
  description?: string;
  createdAt: string;
  paidAt?: string;
}

export interface RewardSummary {
  totalEarned: number;
  totalPaid: number;
  totalPending: number;
  thisMonth: number;
  thisWeek: number;
  today: number;
}

export interface Payout {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
  paymentMethod?: string;
  transactionId?: string;
}




export type PaymentType = 'subscription' | 'streak_edit_toggle' | 'goal_change' | 'other';
export type PaymentStatus = 'succeeded' | 'failed' | 'pending';

export interface Payment {
  id: string;
  user_id: string;
  stripe_payment_id: string | null;
  amount: number;
  currency: string;
  payment_type: PaymentType;
  status: PaymentStatus;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  brand: string;
}

export interface Subscription {
  id: string;
  status: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
  amount: number;
  currency: string;
}

export interface LevelHistory {
  id: string;
  user_id: string;
  previous_level: number;
  new_level: number;
  goal_id: string;
  achieved_at: string;
}

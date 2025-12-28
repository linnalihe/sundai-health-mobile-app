export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled';

export interface User {
  id: string;
  email: string;
  oauth_provider: string;
  oauth_id: string;
  display_name: string | null;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
  subscription_status: SubscriptionStatus;
  subscription_id: string | null;
  stripe_customer_id: string | null;
  current_level: number;
}

export type TonePreference = 'motivational' | 'tough_love' | 'supportive' | 'professional' | 'casual';
export type AIModel = 'claude' | 'gemini';

export interface UserSettings {
  id: string;
  user_id: string;
  ai_model: AIModel;
  coach_inspiration: string | null;
  custom_coach: string | null;
  tone_preference: TonePreference;
  tone_description: string | null;
  message_frequency: number; // 1-6
  message_times: string[]; // Array of time strings
  streak_editing_enabled: boolean;
  streak_edit_toggle_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  user: User;
  settings: UserSettings | null;
}

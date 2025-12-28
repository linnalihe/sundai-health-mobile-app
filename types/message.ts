import type { AIModel } from './user';

export type MessageSender = 'ai' | 'user';

export interface Message {
  id: string;
  user_id: string;
  goal_id: string;
  sender: MessageSender;
  content: string;
  ai_model_used: AIModel | null;
  scheduled_for: string | null;
  sent_at: string;
  read_at: string | null;
  responded: boolean;
  created_at: string;
}

export interface AIMessageContext {
  goal_description: string;
  bad_habits: string;
  required_habits: string;
  difficulty_assessment: string;
  external_factors: string;
  coach_inspiration: string;
  tone_preference: string;
  tone_description: string | null;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  total_days_completed: number;
  recent_progress: Array<{ date: string; completed: boolean }>;
}

export interface ProgressParseResult {
  completed: boolean;
  confidence: 'high' | 'medium' | 'low';
  acknowledgment: string;
  needs_clarification: boolean;
  clarification_question: string | null;
}

export interface QuickReply {
  id: string;
  text: string;
  value?: string;
}

export type MarkedMethod = 'ai_auto' | 'manual_edit';

export interface Progress {
  id: string;
  user_id: string;
  goal_id: string;
  date: string; // ISO date string
  completed: boolean;
  marked_method: MarkedMethod;
  created_at: string;
  updated_at: string;
  edited_at: string | null;
}

export interface Streak {
  id: string;
  user_id: string;
  goal_id: string;
  current_streak: number;
  longest_streak: number;
  total_days_completed: number;
  last_completion_date: string | null; // ISO date string
  updated_at: string;
}

export interface ProgressWithGoal extends Progress {
  goal?: {
    id: string;
    goal_description: string;
    is_primary: boolean;
  };
}

export interface StreakWithGoal extends Streak {
  goal?: {
    id: string;
    goal_description: string;
    is_primary: boolean;
  };
}

export interface DayProgress {
  date: string;
  completed: boolean;
  isEditable: boolean;
  isLocked: boolean;
  markedMethod?: MarkedMethod;
}

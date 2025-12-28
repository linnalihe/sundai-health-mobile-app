export type GoalStatus = 'active' | 'completed' | 'abandoned';

export interface Goal {
  id: string;
  user_id: string;
  is_primary: boolean;
  goal_description: string; // min 255 chars
  bad_habits: string; // min 255 chars
  required_habits: string; // min 255 chars
  difficulty_assessment: string; // min 255 chars
  external_factors: string; // min 255 chars
  created_at: string;
  updated_at: string;
  status: GoalStatus;
  completion_date: string | null;
}

export interface GoalInput {
  is_primary?: boolean;
  goal_description: string;
  bad_habits: string;
  required_habits: string;
  difficulty_assessment: string;
  external_factors: string;
}

export interface QuestionnaireField {
  label: string;
  question: string;
  placeholder: string;
  key: keyof GoalInput;
}

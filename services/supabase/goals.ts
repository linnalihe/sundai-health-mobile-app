import { supabase } from './client';
import { Goal, GoalQuestionnaire } from '@/types/goal';

/**
 * Create a new goal for a user
 */
export async function createGoal(
  userId: string,
  questionnaire: GoalQuestionnaire
): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: userId,
      question_1: questionnaire.question_1,
      question_2: questionnaire.question_2,
      question_3: questionnaire.question_3,
      question_4: questionnaire.question_4,
      question_5: questionnaire.question_5,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating goal:', error);
    throw new Error(error.message);
  }

  return data as Goal;
}

/**
 * Get all goals for a user
 */
export async function getUserGoals(userId: string): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching goals:', error);
    throw new Error(error.message);
  }

  return data as Goal[];
}

/**
 * Get active goal for a user
 */
export async function getActiveGoal(userId: string): Promise<Goal | null> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching active goal:', error);
    throw new Error(error.message);
  }

  return data as Goal;
}

/**
 * Update a goal
 */
export async function updateGoal(
  goalId: string,
  questionnaire: Partial<GoalQuestionnaire>
): Promise<Goal> {
  const { data, error} = await supabase
    .from('goals')
    .update(questionnaire)
    .eq('id', goalId)
    .select()
    .single();

  if (error) {
    console.error('Error updating goal:', error);
    throw new Error(error.message);
  }

  return data as Goal;
}

/**
 * Deactivate a goal
 */
export async function deactivateGoal(goalId: string): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .update({ is_active: false })
    .eq('id', goalId);

  if (error) {
    console.error('Error deactivating goal:', error);
    throw new Error(error.message);
  }
}

/**
 * Check if user has completed onboarding (has at least one goal)
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('goals')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }

  return data !== null && data.length > 0;
}

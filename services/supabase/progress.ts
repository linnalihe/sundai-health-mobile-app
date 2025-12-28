import { supabase } from './client';
import type { Progress, Streak, MarkedMethod } from '@/types';

/**
 * Mark progress for a specific date
 */
export async function markProgress(
  userId: string,
  goalId: string,
  date: string,
  completed: boolean,
  markedMethod: MarkedMethod = 'ai_auto'
): Promise<Progress> {
  try {
    // Check if progress already exists for this date
    const { data: existing } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .eq('date', date)
      .single();

    if (existing) {
      // Update existing progress
      const { data, error } = await supabase
        .from('progress')
        .update({
          completed,
          marked_method: markedMethod,
          edited_at: markedMethod === 'manual_edit' ? new Date().toISOString() : existing.edited_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      // Recalculate streak
      await recalculateStreak(userId, goalId);

      return data;
    } else {
      // Create new progress
      const { data, error } = await supabase
        .from('progress')
        .insert([{
          user_id: userId,
          goal_id: goalId,
          date,
          completed,
          marked_method: markedMethod,
        }])
        .select()
        .single();

      if (error) throw error;

      // Recalculate streak
      await recalculateStreak(userId, goalId);

      return data;
    }
  } catch (error) {
    console.error('Error marking progress:', error);
    throw error;
  }
}

/**
 * Get progress for a specific date range
 */
export async function getProgressForDateRange(
  userId: string,
  goalId: string,
  startDate: string,
  endDate: string
): Promise<Progress[]> {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting progress for date range:', error);
    throw error;
  }
}

/**
 * Get all progress for a goal
 */
export async function getGoalProgress(userId: string, goalId: string): Promise<Progress[]> {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting goal progress:', error);
    throw error;
  }
}

/**
 * Get streak for a specific goal
 */
export async function getStreak(userId: string, goalId: string): Promise<Streak | null> {
  try {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error getting streak:', error);
    throw error;
  }
}

/**
 * Get all streaks for a user
 */
export async function getUserStreaks(userId: string): Promise<Streak[]> {
  try {
    const { data, error } = await supabase
      .from('streaks')
      .select(`
        *,
        goal:goals!inner(
          id,
          goal_description,
          is_primary
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user streaks:', error);
    throw error;
  }
}

/**
 * Recalculate streak for a goal based on progress data
 */
export async function recalculateStreak(userId: string, goalId: string): Promise<Streak> {
  try {
    // Get all completed progress for this goal, ordered by date
    const { data: progressData, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .eq('completed', true)
      .order('date', { ascending: true });

    if (progressError) throw progressError;

    const completedDates = progressData || [];
    const totalDaysCompleted = completedDates.length;

    // Calculate current streak (consecutive days from today backwards)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if today or yesterday is completed (allow 1-day grace period)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let checkDate = new Date(today);
    const hasToday = completedDates.some(p => p.date === todayStr);
    const hasYesterday = completedDates.some(p => p.date === yesterdayStr);

    if (!hasToday && !hasYesterday) {
      currentStreak = 0;
    } else {
      // Start from today if completed, otherwise yesterday
      if (!hasToday) {
        checkDate = new Date(yesterday);
      }

      // Count backwards
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const hasProgress = completedDates.some(p => p.date === dateStr);

        if (!hasProgress) break;

        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const progress of completedDates) {
      const currentDate = new Date(progress.date);

      if (!prevDate) {
        tempStreak = 1;
      } else {
        const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }

      prevDate = currentDate;
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Get last completion date
    const lastCompletionDate = completedDates.length > 0
      ? completedDates[completedDates.length - 1].date
      : null;

    // Update streak record
    const { data: streakData, error: streakError } = await supabase
      .from('streaks')
      .update({
        current_streak: currentStreak,
        longest_streak: longestStreak,
        total_days_completed: totalDaysCompleted,
        last_completion_date: lastCompletionDate,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .select()
      .single();

    if (streakError) throw streakError;
    return streakData;
  } catch (error) {
    console.error('Error recalculating streak:', error);
    throw error;
  }
}

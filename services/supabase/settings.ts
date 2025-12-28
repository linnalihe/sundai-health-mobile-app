import { supabase } from './client';
import { UserSettings } from '@/types/user';

/**
 * Create or update user settings
 */
export async function upsertUserSettings(
  userId: string,
  settings: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert(
      {
        user_id: userId,
        ...settings,
      },
      {
        onConflict: 'user_id',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error upserting user settings:', error);
    throw new Error(error.message);
  }

  return data as UserSettings;
}

/**
 * Get user settings
 */
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No settings found - return defaults
      return null;
    }
    console.error('Error fetching user settings:', error);
    throw new Error(error.message);
  }

  return data as UserSettings;
}

/**
 * Update notification preferences
 */
export async function updateNotificationSettings(
  userId: string,
  notificationTime: string,
  followUpTime: string
): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .update({
      notification_time: notificationTime,
      follow_up_time: followUpTime,
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating notification settings:', error);
    throw new Error(error.message);
  }

  return data as UserSettings;
}

/**
 * Update AI preferences
 */
export async function updateAIPreferences(
  userId: string,
  aiModel: 'claude' | 'gemini',
  coachPersona: string,
  tonePreference: string
): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .update({
      ai_model: aiModel,
      coach_persona: coachPersona,
      tone_preference: tonePreference,
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating AI preferences:', error);
    throw new Error(error.message);
  }

  return data as UserSettings;
}

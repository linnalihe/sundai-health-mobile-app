import { supabase } from './client';
import type { Message, AIModel } from '@/types';

/**
 * Create a new message
 */
export async function createMessage(
  userId: string,
  goalId: string,
  sender: 'ai' | 'user',
  content: string,
  aiModel?: AIModel,
  scheduledFor?: string
): Promise<Message> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        user_id: userId,
        goal_id: goalId,
        sender,
        content,
        ai_model_used: aiModel || null,
        scheduled_for: scheduledFor || null,
        responded: sender === 'user',
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
}

/**
 * Get messages for a user within a date range
 */
export async function getMessages(
  userId: string,
  goalId?: string,
  limit: number = 50
): Promise<Message[]> {
  try {
    let query = supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (goalId) {
      query = query.eq('goal_id', goalId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).reverse(); // Reverse to show oldest first
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

/**
 * Get messages for the last N days
 */
export async function getRecentMessages(
  userId: string,
  goalId: string,
  days: number = 30
): Promise<Message[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .gte('sent_at', startDate.toISOString())
      .order('sent_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting recent messages:', error);
    throw error;
  }
}

/**
 * Get unread messages
 */
export async function getUnreadMessages(userId: string): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .eq('sender', 'ai')
      .is('read_at', null)
      .order('sent_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting unread messages:', error);
    throw error;
  }
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<Message> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
}

/**
 * Mark AI message as responded
 */
export async function markMessageAsResponded(messageId: string): Promise<Message> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ responded: true })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error marking message as responded:', error);
    throw error;
  }
}

/**
 * Get the last AI message that hasn't been responded to
 */
export async function getLastUnrespondedAIMessage(userId: string, goalId: string): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .eq('sender', 'ai')
      .eq('responded', false)
      .order('sent_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error getting last unresponded AI message:', error);
    return null;
  }
}

/**
 * Get scheduled messages
 */
export async function getScheduledMessages(userId: string): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .not('scheduled_for', 'is', null)
      .gte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting scheduled messages:', error);
    throw error;
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

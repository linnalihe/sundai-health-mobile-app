import { supabase } from './client';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import type { User } from '@/types';

// Configure WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = 'google' | 'facebook';

/**
 * Get the current authenticated user session
 */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(provider: OAuthProvider) {
  try {
    const redirectUrl = Linking.createURL('auth/callback');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    // Open the OAuth URL in a browser
    if (data.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type === 'success') {
        // Extract the session from the URL
        const { url } = result;
        const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;
          return sessionData.session;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error signing in with OAuth:', error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Get or create user record in the database
 */
export async function getOrCreateUserRecord(authUser: any): Promise<User | null> {
  try {
    // Check if user record exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (existingUser) {
      return existingUser;
    }

    // Create new user record
    if (fetchError && fetchError.code === 'PGRST116') {
      // User doesn't exist, create one
      const newUser = {
        id: authUser.id,
        email: authUser.email,
        oauth_provider: authUser.app_metadata.provider,
        oauth_id: authUser.user_metadata.sub || authUser.id,
        display_name: authUser.user_metadata.full_name || authUser.user_metadata.name || authUser.email?.split('@')[0],
        profile_picture_url: authUser.user_metadata.avatar_url || authUser.user_metadata.picture,
        subscription_status: 'active',
        current_level: 1,
      };

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (createError) throw createError;
      return createdUser;
    }

    if (fetchError) throw fetchError;
    return null;
  } catch (error) {
    console.error('Error getting or creating user record:', error);
    throw error;
  }
}

/**
 * Update user record
 */
export async function updateUser(userId: string, updates: Partial<User>) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Listen to authentication state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

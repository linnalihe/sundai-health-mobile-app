import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { User } from '@/types';
import {
  getSession,
  getCurrentUser,
  signInWithOAuth,
  signOut as authSignOut,
  getOrCreateUserRecord,
  onAuthStateChange,
  type OAuthProvider,
} from '@/services/supabase/auth';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    loadSession();

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);

      if (session?.user) {
        await loadUserRecord(session.user);
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadSession() {
    try {
      setIsLoading(true);
      const currentSession = await getSession();
      setSession(currentSession);

      if (currentSession?.user) {
        await loadUserRecord(currentSession.user);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadUserRecord(authUser: any) {
    try {
      const userRecord = await getOrCreateUserRecord(authUser);
      setUser(userRecord);
    } catch (error) {
      console.error('Error loading user record:', error);
    }
  }

  async function signIn(provider: OAuthProvider) {
    try {
      setIsLoading(true);
      const session = await signInWithOAuth(provider);

      if (session?.user) {
        setSession(session);
        await loadUserRecord(session.user);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    try {
      setIsLoading(true);
      await authSignOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshUser() {
    try {
      const authUser = await getCurrentUser();
      if (authUser) {
        await loadUserRecord(authUser);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }

  const value: AuthContextType = {
    session,
    user,
    isLoading,
    signIn,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

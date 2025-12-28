import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

/**
 * OAuth Callback Screen
 *
 * This screen handles the OAuth redirect after the user authenticates.
 * The actual session handling is done in the auth service and context.
 * This screen just shows a loading state while the auth state updates.
 */
export default function OAuthCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    // The auth context will handle the session and redirect automatically
    // This screen just provides visual feedback during the OAuth flow
    const timer = setTimeout(() => {
      // If we're still here after 5 seconds, something might be wrong
      console.warn('OAuth callback taking longer than expected');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="large" />
      <ThemedText style={styles.text}>Completing sign in...</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
});

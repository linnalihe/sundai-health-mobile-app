import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { hasCompletedOnboarding } from '@/services/supabase/goals';
import { STRIPE_CONFIG } from '@/services/stripe/client';

function RootLayoutNav() {
  const { session, user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inTabsGroup = segments[0] === '(tabs)';

    async function handleRouting() {
      // No session - redirect to auth
      if (!session || !user) {
        if (!inAuthGroup) {
          router.replace('/(auth)/welcome');
        }
        return;
      }

      // Check onboarding status first
      const onboardingComplete = await hasCompletedOnboarding(user.id);

      // If already in onboarding flow, allow it (for dev mode skip payment)
      if (inOnboardingGroup) {
        return;
      }

      // Has session - check payment setup
      const hasPayment = user.stripe_customer_id && user.subscription_status === 'active';

      if (!hasPayment) {
        // No payment setup - redirect to payment (unless in onboarding)
        if (!inAuthGroup || segments[1] !== 'payment-setup') {
          router.replace('/(auth)/payment-setup');
        }
        return;
      }

      // Has payment - check onboarding status
      if (!onboardingComplete) {
        // Not onboarded - redirect to onboarding
        if (!inOnboardingGroup) {
          router.replace('/(onboarding)/questionnaire');
        }
      } else {
        // Onboarded - redirect to main app
        if (!inTabsGroup) {
          router.replace('/(tabs)');
        }
      }
    }

    handleRouting();
  }, [session, user, isLoading, segments]);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <StripeProvider
      publishableKey={STRIPE_CONFIG.publishableKey}
      merchantIdentifier={STRIPE_CONFIG.merchantIdentifier}
      urlScheme={STRIPE_CONFIG.urlScheme}
    >
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootLayoutNav />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

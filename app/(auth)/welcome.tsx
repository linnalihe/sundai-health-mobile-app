import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/shared/button';
import { useAuth } from '@/hooks/use-auth';

export default function WelcomeScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleTestLogin = async () => {
    try {
      setIsLoading(true);

      // Import Supabase client
      const { supabase } = await import('@/services/supabase/client');

      // Create a test account with email/password
      const testEmail = 'test@healthyhabits.app';
      const testPassword = 'Test123456!';

      // Try to sign in first
      let { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      // If user doesn't exist, create it
      if (error && error.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
        });

        if (signUpError) throw signUpError;
        data = signUpData;
      } else if (error) {
        throw error;
      }

      // Navigation will be handled by the root layout based on auth state
    } catch (error: any) {
      console.error('Test login error:', error);
      Alert.alert(
        'Login Failed',
        error.message || 'An error occurred during test login. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo/Branding Area */}
          <View style={styles.header}>
            <ThemedText type="title" style={styles.logo}>
              ✨ Healthy Habits
            </ThemedText>
            <ThemedText style={styles.tagline}>
              Build lasting habits through AI-powered daily coaching
            </ThemedText>
          </View>

          {/* Value Propositions */}
          <View style={styles.features}>
            <FeatureItem
              icon="🎯"
              title="Simple & Achievable"
              description="Health isn't complicated - just 1 hour daily + 2 hours weekly meal prep"
            />
            <FeatureItem
              icon="🤖"
              title="AI-Powered Coaching"
              description="Daily guidance tailored to your goals and preferences"
            />
            <FeatureItem
              icon="📈"
              title="Progressive Growth"
              description="Start with one habit, unlock more as you build streaks"
            />
            <FeatureItem
              icon="✅"
              title="Accountability"
              description="Daily check-ins and visual progress tracking"
            />
          </View>

          {/* Login Button */}
          <View style={styles.authButtons}>
            <ThemedText style={styles.authTitle}>Ready to start your journey?</ThemedText>

            <Button
              title="Get Started"
              onPress={handleTestLogin}
              isLoading={isLoading}
              variant="primary"
              size="large"
              fullWidth
            />

            <ThemedText style={styles.devNote}>
              Development Mode - OAuth coming soon
            </ThemedText>
          </View>

          {/* Terms and Privacy */}
          <View style={styles.legal}>
            <ThemedText style={styles.legalText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </ThemedText>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureContent}>
        <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
          {title}
        </ThemedText>
        <ThemedText style={styles.featureDescription}>{description}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 36,
    marginBottom: 12,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 20,
  },
  features: {
    marginBottom: 48,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  authButtons: {
    marginBottom: 32,
  },
  authTitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  devNote: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.5,
    fontStyle: 'italic',
  },
  legal: {
    paddingHorizontal: 20,
  },
  legalText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.5,
    lineHeight: 16,
  },
});

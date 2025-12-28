import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/shared/button';
import { useAuth } from '@/hooks/use-auth';
import { upsertUserSettings } from '@/services/supabase/settings';
import { COACH_PERSONAS, DEFAULT_COACH_PERSONA } from '@/constants/coach-personas';
import { TONE_PREFERENCES, AI_MODELS, DEFAULT_TONE, DEFAULT_AI_MODEL } from '@/constants/tone-preferences';

export default function PreferencesScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // AI Preferences
  const [aiModel, setAiModel] = useState<'claude' | 'gemini'>(DEFAULT_AI_MODEL);
  const [coachPersona, setCoachPersona] = useState(DEFAULT_COACH_PERSONA);
  const [tonePreference, setTonePreference] = useState(DEFAULT_TONE);

  // Notification Times (default: 9:00 AM and 1:00 PM)
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [followUpTime, setFollowUpTime] = useState('13:00');

  const handleComplete = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please sign in again.');
      return;
    }

    try {
      setIsLoading(true);

      // Save user settings
      await upsertUserSettings(user.id, {
        ai_model: aiModel,
        coach_persona: coachPersona,
        tone_preference: tonePreference,
        notification_time: notificationTime,
        follow_up_time: followUpTime,
      });

      // Refresh user data
      await refreshUser();

      Alert.alert(
        'Setup Complete!',
        'Your preferences have been saved. Welcome to Healthy Habits!',
        [
          {
            text: 'Get Started',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to save your preferences. Please try again.',
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
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Customize Your Experience
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Choose how you would like your AI coach to interact with you
            </ThemedText>
          </View>

          {/* AI Model Selection */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              AI Model
            </ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Choose which AI powers your daily coaching messages
            </ThemedText>

            {AI_MODELS.map((model) => (
              <TouchableOpacity
                key={model.id}
                style={[
                  styles.option,
                  aiModel === model.id && styles.optionSelected,
                ]}
                onPress={() => setAiModel(model.id)}
              >
                <View style={styles.optionContent}>
                  <ThemedText style={styles.optionTitle}>{model.name}</ThemedText>
                  <ThemedText style={styles.optionDescription}>
                    {model.description}
                  </ThemedText>
                </View>
                {aiModel === model.id && (
                  <ThemedText style={styles.checkmark}>✓</ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Coach Persona Selection */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Coach Personality
            </ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Select the coaching style that motivates you most
            </ThemedText>

            {COACH_PERSONAS.map((persona) => (
              <TouchableOpacity
                key={persona.id}
                style={[
                  styles.option,
                  coachPersona === persona.id && styles.optionSelected,
                ]}
                onPress={() => setCoachPersona(persona.id)}
              >
                <ThemedText style={styles.optionIcon}>{persona.icon}</ThemedText>
                <View style={styles.optionContent}>
                  <ThemedText style={styles.optionTitle}>{persona.name}</ThemedText>
                  <ThemedText style={styles.optionDescription}>
                    {persona.description}
                  </ThemedText>
                </View>
                {coachPersona === persona.id && (
                  <ThemedText style={styles.checkmark}>✓</ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Tone Preference */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Communication Tone
            </ThemedText>
            <ThemedText style={styles.sectionDescription}>
              How should your coach communicate with you?
            </ThemedText>

            {TONE_PREFERENCES.map((tone) => (
              <TouchableOpacity
                key={tone.id}
                style={[
                  styles.option,
                  tonePreference === tone.id && styles.optionSelected,
                ]}
                onPress={() => setTonePreference(tone.id)}
              >
                <View style={styles.optionContent}>
                  <ThemedText style={styles.optionTitle}>{tone.name}</ThemedText>
                  <ThemedText style={styles.optionDescription}>
                    {tone.description}
                  </ThemedText>
                </View>
                {tonePreference === tone.id && (
                  <ThemedText style={styles.checkmark}>✓</ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Notification Times Info */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Daily Check-ins
            </ThemedText>
            <ThemedText style={styles.sectionDescription}>
              We will send you a daily message at 9:00 AM and a follow-up at 1:00 PM. You can customize these times later in settings.
            </ThemedText>
          </View>

          {/* Complete Button */}
          <View style={styles.actions}>
            <Button
              title="Complete Setup"
              onPress={handleComplete}
              isLoading={isLoading}
              variant="primary"
              size="large"
              fullWidth
            />
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
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
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 16,
    lineHeight: 18,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8f4',
  },
  optionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  optionDescription: {
    fontSize: 13,
    opacity: 0.6,
    lineHeight: 18,
    color: '#666',
  },
  checkmark: {
    fontSize: 24,
    color: '#4CAF50',
    marginLeft: 8,
  },
  actions: {
    marginTop: 16,
    marginBottom: 32,
  },
});

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/shared/button';
import { QuestionnaireField } from '@/components/onboarding/questionnaire-field';
import { ProgressIndicator } from '@/components/onboarding/progress-indicator';
import { useAuth } from '@/hooks/use-auth';
import { createGoal } from '@/services/supabase/goals';
import { GoalQuestionnaire } from '@/types/goal';

const QUESTIONS = [
  {
    id: 'question_1',
    question: '1. What is your primary health goal?',
    placeholder: 'Describe your main health goal in detail. What do you want to achieve? Be specific about what success looks like for you...',
  },
  {
    id: 'question_2',
    question: '2. Why is this goal important to you?',
    placeholder: 'Share your deeper motivation. What will achieving this goal mean for your life? How will it make you feel?...',
  },
  {
    id: 'question_3',
    question: '3. What challenges have you faced before?',
    placeholder: 'Describe any previous attempts or obstacles you have encountered. What has held you back in the past?...',
  },
  {
    id: 'question_4',
    question: '4. What time of day works best for your healthy habits?',
    placeholder: 'When do you have the most energy and willpower? Describe your ideal routine and timing for building this habit...',
  },
  {
    id: 'question_5',
    question: '5. How will you measure your progress?',
    placeholder: 'What specific signs will show you are making progress? How will you know when you are succeeding?...',
  },
];

export default function QuestionnaireScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [answers, setAnswers] = useState<GoalQuestionnaire>({
    question_1: '',
    question_2: '',
    question_3: '',
    question_4: '',
    question_5: '',
  });

  const currentQuestionData = QUESTIONS[currentQuestion];
  const currentAnswerKey = currentQuestionData.id as keyof GoalQuestionnaire;
  const currentAnswer = answers[currentAnswerKey];
  const isCurrentQuestionValid = currentAnswer.length >= 255;
  const isLastQuestion = currentQuestion === QUESTIONS.length - 1;

  const handleAnswerChange = (text: string) => {
    setAnswers({
      ...answers,
      [currentAnswerKey]: text,
    });
  };

  const handleNext = () => {
    if (!isCurrentQuestionValid) {
      Alert.alert(
        'Answer Too Short',
        `Please write at least 255 characters for this question. You currently have ${currentAnswer.length} characters.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    console.log('=== QUESTIONNAIRE SUBMIT ===');
    console.log('User:', user?.id);
    console.log('Answers:', answers);

    if (!user) {
      Alert.alert('Error', 'User not found. Please sign in again.');
      return;
    }

    // Validate all answers
    const allValid = Object.values(answers).every(answer => answer.length >= 255);
    console.log('All answers valid:', allValid);
    console.log('Answer lengths:', Object.entries(answers).map(([key, val]) => `${key}: ${val.length}`));

    if (!allValid) {
      Alert.alert(
        'Incomplete Answers',
        'Please make sure all questions have at least 255 characters.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      console.log('Creating goal in database...');

      // Create goal in database
      const goal = await createGoal(user.id, answers);
      console.log('Goal created successfully:', goal.id);

      // Navigate to preferences screen
      console.log('Navigating to preferences...');
      router.replace('/(onboarding)/preferences');
    } catch (error: any) {
      console.error('Error saving goal:', error);
      console.error('Error stack:', error.stack);
      Alert.alert(
        'Error',
        error.message || 'Failed to save your goal. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <ThemedText type="title" style={styles.title}>
                Tell Us About Your Goal
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Take your time to answer thoughtfully. The more detail you provide, the better we can support you.
              </ThemedText>
            </View>

            {/* Progress Indicator */}
            <ProgressIndicator
              currentStep={currentQuestion + 1}
              totalSteps={QUESTIONS.length}
            />

            {/* Current Question */}
            <View style={styles.questionContainer}>
              <QuestionnaireField
                question={currentQuestionData.question}
                value={currentAnswer}
                onChangeText={handleAnswerChange}
                placeholder={currentQuestionData.placeholder}
                minLength={255}
                maxLength={1000}
              />
            </View>

            {/* Navigation Buttons */}
            <View style={styles.actions}>
              {currentQuestion > 0 && (
                <Button
                  title="Back"
                  onPress={handleBack}
                  variant="outline"
                  size="medium"
                  style={styles.backButton}
                />
              )}

              <Button
                title={isLastQuestion ? 'Complete' : 'Next'}
                onPress={handleNext}
                isLoading={isLoading}
                disabled={!isCurrentQuestionValid}
                variant="primary"
                size="large"
                fullWidth={currentQuestion === 0}
                style={currentQuestion > 0 ? styles.nextButton : undefined}
              />
            </View>

            {/* Helper Text */}
            <View style={styles.helperContainer}>
              <ThemedText style={styles.helperText}>
                💡 Tip: Be specific and honest. This helps us create personalized daily messages that truly resonate with you.
              </ThemedText>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 24,
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
  questionContainer: {
    marginVertical: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  helperContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#333',
  },
});

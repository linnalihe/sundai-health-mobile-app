import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface QuestionnaireFieldProps {
  question: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  error?: string;
}

export function QuestionnaireField({
  question,
  value,
  onChangeText,
  placeholder,
  minLength = 255,
  maxLength = 1000,
  error,
}: QuestionnaireFieldProps) {
  const characterCount = value.length;
  const isValid = characterCount >= minLength;
  const isOverLimit = characterCount > maxLength;

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.question}>
        {question}
      </ThemedText>

      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          isValid && styles.inputValid,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        maxLength={maxLength}
      />

      <View style={styles.footer}>
        <ThemedText
          style={[
            styles.counter,
            isOverLimit && styles.counterError,
            isValid && !isOverLimit && styles.counterValid,
          ]}
        >
          {characterCount} / {minLength} characters
          {isValid ? ' ✓' : ` (${minLength - characterCount} more needed)`}
        </ThemedText>
      </View>

      {error && (
        <ThemedText style={styles.error}>{error}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  question: {
    fontSize: 16,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  inputValid: {
    borderColor: '#4CAF50',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  counter: {
    fontSize: 12,
    color: '#666',
  },
  counterValid: {
    color: '#4CAF50',
  },
  counterError: {
    color: '#ff4444',
  },
  error: {
    fontSize: 12,
    color: '#ff4444',
    marginTop: 4,
  },
});

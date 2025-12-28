import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels,
}: ProgressIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <View key={stepNumber} style={styles.stepWrapper}>
              <View
                style={[
                  styles.step,
                  isCompleted && styles.stepCompleted,
                  isCurrent && styles.stepCurrent,
                ]}
              >
                <ThemedText
                  style={[
                    styles.stepText,
                    (isCompleted || isCurrent) && styles.stepTextActive,
                  ]}
                >
                  {isCompleted ? '✓' : stepNumber}
                </ThemedText>
              </View>

              {stepLabels && stepLabels[index] && (
                <ThemedText style={styles.stepLabel}>
                  {stepLabels[index]}
                </ThemedText>
              )}

              {index < totalSteps - 1 && (
                <View
                  style={[
                    styles.connector,
                    isCompleted && styles.connectorCompleted,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      <ThemedText style={styles.progressText}>
        Step {currentStep} of {totalSteps}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepCurrent: {
    backgroundColor: '#2196F3',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  stepTextActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 10,
    marginLeft: 4,
    flex: 1,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  connectorCompleted: {
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.6,
  },
});

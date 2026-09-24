import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function StepIndicator({ currentStep, totalSteps }) {
  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isDone = stepNum < currentStep;

          return (
            <View
              key={stepNum}
              style={[
                styles.dot,
                isActive && styles.activeDot,
                isDone && styles.doneDot,
              ]}
            />
          );
        })}
      </View>
      <Text variant="labelSmall" style={styles.stepText}>
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  dot: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#334155',
  },
  activeDot: {
    backgroundColor: '#0284C7',
    width: 36,
  },
  doneDot: {
    backgroundColor: '#0D9488',
  },
  stepText: {
    color: '#94A3B8',
  },
});

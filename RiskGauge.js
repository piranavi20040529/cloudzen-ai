import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function RiskGauge({ score, label, color }) {
  return (
    <View style={styles.container}>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <View style={styles.labelRow}>
        <Text variant="labelMedium" style={{ color }}>{label}</Text>
        <Text variant="labelMedium" style={{ color: '#94A3B8' }}>{score} / 100 Risk Score</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  meterTrack: {
    height: 12,
    backgroundColor: '#334155',
    borderRadius: 6,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
});

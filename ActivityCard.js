import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ActivityCard({ activity, selected, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.touchable}>
      <Surface style={[styles.card, selected && styles.selectedCard]} elevation={selected ? 4 : 1}>
        <MaterialCommunityIcons
          name={activity.icon}
          size={32}
          color={selected ? '#0284C7' : '#94A3B8'}
        />
        <Text variant="labelLarge" style={[styles.title, selected && styles.selectedTitle]}>
          {activity.name}
        </Text>
        <Text variant="bodySmall" style={[styles.status, { color: activity.riskScore > 60 ? '#EF4444' : '#22C55E' }]}>
          {activity.status}
        </Text>
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    width: '48%',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectedCard: {
    borderColor: '#0284C7',
    backgroundColor: '#0F172A',
  },
  title: {
    color: '#F8FAFC',
    marginTop: 8,
    fontWeight: '600',
  },
  selectedTitle: {
    color: '#38BDF8',
  },
  status: {
    marginTop: 2,
    fontWeight: '700',
    fontSize: 10,
  },
});

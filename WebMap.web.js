import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function WebMap({ style, originName, destinationName, destination }) {
  const oName = originName || 'Colombo';
  const destName = destinationName || destination || 'Destination';
  return (
    <View style={[styles.webMapFallback, style]}>
      <MaterialCommunityIcons name="map-search-outline" size={48} color="#00E5FF" />
      <Text style={styles.title}>
        Interactive Sri Lanka Weather Map
      </Text>
      <Text style={styles.subtitle}>
        {oName} ➔ {destName} • Polyline Route Active
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  webMapFallback: {
    height: 220,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    color: '#F8FAFC',
    fontWeight: '800',
    fontSize: 16,
    marginTop: 8,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
});


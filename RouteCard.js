import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Card, Chip, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RouteCard({ route, selected, onSelect }) {
  const displayTitle =
    typeof route.title === 'string' && route.title !== '[object Object]'
      ? route.title
      : typeof route.summary === 'string' && route.summary !== '[object Object]'
      ? route.summary
      : 'Primary Safe Route';

  return (
    <Card style={[styles.card, selected && styles.selectedCard]} elevation={selected ? 4 : 1}>
      <Card.Content style={styles.content}>
        <View style={styles.headerRow}>
          <Text variant="titleMedium" style={styles.title}>{displayTitle}</Text>
          <Chip
            style={{ backgroundColor: route.riskColor + '20' }}
            textStyle={{ color: route.riskColor, fontWeight: '800', fontSize: 11 }}
          >
            {route.riskLevel}
          </Chip>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="map-marker-distance" size={16} color="#94A3B8" />
            <Text variant="bodySmall" style={styles.statText}>{route.distance}</Text>
          </View>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#94A3B8" />
            <Text variant="bodySmall" style={styles.statText}>{route.duration}</Text>
          </View>
        </View>

        <View style={styles.weatherBox}>
          <MaterialCommunityIcons name="weather-cloudy-alert" size={18} color="#F59E0B" />
          <Text variant="bodySmall" style={styles.weatherText}>
            {route.weatherOnRoute}
          </Text>
        </View>

        <Button
          mode={selected ? "contained" : "outlined"}
          onPress={onSelect}
          style={styles.selectBtn}
          buttonColor={selected ? "#0284C7" : undefined}
        >
          {selected ? "Selected Route" : "Select Route"}
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectedCard: {
    borderColor: '#0284C7',
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#F8FAFC',
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#CBD5E1',
  },
  weatherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  weatherText: {
    color: '#94A3B8',
    flex: 1,
    fontSize: 12,
  },
  selectBtn: {
    marginTop: 14,
    borderRadius: 10,
  },
});

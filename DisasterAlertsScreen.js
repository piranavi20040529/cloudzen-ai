import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function DisasterAlertsScreen({ navigation }) {
  const { alerts } = useApp();

  const renderAlertItem = ({ item }) => {
    const isWarning = item.severity === 'warning';

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('AlertDetail', { alert: item })}
        activeOpacity={0.85}
      >
        <Card style={styles.card} elevation={3}>
          <Card.Content>
            <View style={styles.headerRow}>
              <View style={styles.typeBadge}>
                <MaterialCommunityIcons
                  name={item.typeIcon}
                  size={20}
                  color={isWarning ? "#EF4444" : "#F59E0B"}
                />
                <Text style={styles.typeText}>{item.type}</Text>
              </View>
              <Chip
                style={{ backgroundColor: isWarning ? "#EF444420" : "#F59E0B20" }}
                textStyle={{ color: isWarning ? "#EF4444" : "#F59E0B", fontWeight: '800', fontSize: 10 }}
              >
                {item.severityLabel}
              </Chip>
            </View>

            <Text variant="titleMedium" style={styles.title}>{item.title}</Text>
            <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.footerRow}>
              <View style={styles.metaInfo}>
                <MaterialCommunityIcons name="map-marker" size={14} color="#94A3B8" />
                <Text variant="labelSmall" style={styles.metaText}>{item.affectedArea}</Text>
              </View>
              <Text variant="labelSmall" style={styles.timeText}>{item.time}</Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Disaster Early Warning System
        </Text>
        <Text variant="bodySmall" style={styles.headerSub}>
          Live multi-hazard monitoring for Sri Lanka (GDACS / DMC)
        </Text>
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={renderAlertItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="shield-check" size={64} color="#22C55E" />
            <Text variant="titleMedium" style={{ color: '#F8FAFC', marginTop: 12 }}>
              All Clear! No Active Disaster Warnings
            </Text>
            <Text variant="bodySmall" style={{ color: '#94A3B8', textAlign: 'center', marginTop: 4 }}>
              Your current region in Sri Lanka is clear of severe weather risks.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  headerSub: {
    color: '#94A3B8',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 12,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeText: {
    color: '#CBD5E1',
    fontWeight: '700',
    fontSize: 12,
  },
  title: {
    color: '#F8FAFC',
    fontWeight: '800',
    marginBottom: 4,
  },
  description: {
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaText: {
    color: '#38BDF8',
    fontSize: 11,
  },
  timeText: {
    color: '#64748B',
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
});

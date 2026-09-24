import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AlertBanner({ alert, onPress }) {
  if (!alert) return null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Surface style={styles.banner} elevation={3}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name={alert.typeIcon || "alert-decagram"} size={26} color="#FFFFFF" />
        </View>
        <View style={styles.textBox}>
          <View style={styles.badgeRow}>
            <Text style={styles.severityBadge}>{alert.severityLabel}</Text>
            <Text style={styles.timeText}>{alert.time}</Text>
          </View>
          <Text variant="titleSmall" style={styles.titleText} numberOfLines={1}>
            {alert.title}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#F8FAFC" />
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#DC2626',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 8,
    borderRadius: 10,
  },
  textBox: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  severityBadge: {
    backgroundColor: '#FEF2F2',
    color: '#991B1B',
    fontWeight: '800',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  timeText: {
    color: '#FCA5A5',
    fontSize: 11,
  },
  titleText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 2,
  },
});

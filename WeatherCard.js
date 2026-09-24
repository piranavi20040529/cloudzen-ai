import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Surface, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function WeatherCard({ weather }) {
  const theme = useTheme();

  return (
    <Card style={styles.cardContainer} elevation={4}>
      <LinearGradient
        colors={['#0F2027', '#203A43', '#2C5364']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      >
        <View style={styles.headerRow}>
          <View>
            <View style={styles.locationContainer}>
              <MaterialCommunityIcons name="map-marker-radius" size={20} color="#00E5FF" />
              <Text variant="titleMedium" style={styles.cityText}>
                {weather.city}, {weather.country}
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.conditionSubtext}>
              {weather.condition}
            </Text>
          </View>
          <MaterialCommunityIcons name={weather.conditionIcon} size={54} color="#FFD54F" />
        </View>

        <View style={styles.tempRow}>
          <Text style={styles.tempText}>{weather.temperature}°</Text>
          <View style={styles.feelsLikeBox}>
            <Text style={styles.feelsLikeLabel}>Feels like</Text>
            <Text style={styles.feelsLikeVal}>{weather.feelsLike}°C</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="water-percent" size={18} color="#4FC3F7" />
            <Text style={styles.statLabel}>Humidity</Text>
            <Text style={styles.statVal}>{weather.humidity}%</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="weather-windy" size={18} color="#81D4FA" />
            <Text style={styles.statLabel}>Wind</Text>
            <Text style={styles.statVal}>{weather.windSpeed}</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="white-balance-sunny" size={18} color="#FFB74D" />
            <Text style={styles.statLabel}>UV Index</Text>
            <Text style={styles.statVal}>{weather.uvIndex} ({weather.uvLevel})</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  gradientBg: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cityText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  conditionSubtext: {
    color: '#94A3B8',
    marginTop: 2,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 14,
    gap: 12,
  },
  tempText: {
    fontSize: 54,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  feelsLikeBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  feelsLikeLabel: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  feelsLikeVal: {
    color: '#00E5FF',
    fontWeight: '700',
    fontSize: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 12,
    borderRadius: 14,
    marginTop: 6,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  statVal: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 12,
    marginTop: 1,
  },
});

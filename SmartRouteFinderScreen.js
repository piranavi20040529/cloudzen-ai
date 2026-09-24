import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Surface, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import RouteCard from '../components/RouteCard';
import WebMap from '../components/WebMap';
import { recommendationsService } from '../services/recommendationsService';
import { mockRoutes } from '../data/mockData';

// Sri Lanka Major Destinations Dictionary
const SRI_LANKA_CITIES = {
  colombo: { name: 'Colombo', latitude: 6.9271, longitude: 79.8612, bestTime: 'Anytime', advice: 'City center traffic heavy during peak hours.' },
  kandy: { name: 'Kandy', latitude: 7.2906, longitude: 80.6337, bestTime: 'Before 02:00 PM', advice: 'Heavy rainfall starts after 2:30 PM near Warakapola & Kadugannawa pass.' },
  galle: { name: 'Galle', latitude: 6.0535, longitude: 80.2210, bestTime: 'Before 01:30 PM', advice: 'High sea swell watch & coastal afternoon showers near Kalutara.' },
  jaffna: { name: 'Jaffna', latitude: 9.6615, longitude: 80.0255, advice: 'Strong dry crosswinds along A9 highway near Elephant Pass.' },
  'nuwara eliya': { name: 'Nuwara Eliya', latitude: 6.9497, longitude: 80.7891, bestTime: 'Before 12:30 PM', advice: 'Thick fog & high landslide risk along winding Hatton-Nuwara Eliya roads.' },
  nuwaraeliya: { name: 'Nuwara Eliya', latitude: 6.9497, longitude: 80.7891, bestTime: 'Before 12:30 PM', advice: 'Thick fog & high landslide risk along winding Hatton-Nuwara Eliya roads.' },
  trincomalee: { name: 'Trincomalee', latitude: 8.5874, longitude: 81.2152, bestTime: 'Before 02:00 PM', advice: 'Scattered afternoon thunderstorms expected around Habarana stretch.' },
  anuradhapura: { name: 'Anuradhapura', latitude: 8.3114, longitude: 80.4037, bestTime: 'Before 11:00 AM', advice: 'High heat index around noon. Expressway route clear.' },
  matara: { name: 'Matara', latitude: 5.9549, longitude: 80.5550, bestTime: 'Before 02:00 PM', advice: 'Occasional coastal squalls along Southern Expressway E01.' },
  negombo: { name: 'Negombo', latitude: 7.2008, longitude: 79.8737, bestTime: 'Before 04:00 PM', advice: 'Clear coastal road with mild sea breezes.' },
  sigiriya: { name: 'Sigiriya', latitude: 7.9570, longitude: 80.7603, bestTime: 'Before 01:00 PM', advice: 'Warm afternoon sun. Best to travel early morning.' },
  dambulla: { name: 'Dambulla', latitude: 7.8742, longitude: 80.6511, bestTime: 'Before 01:00 PM', advice: 'Warm afternoon conditions near Central province.' },
  ella: { name: 'Ella', latitude: 6.8667, longitude: 81.0466, bestTime: 'Before 12:00 PM', advice: 'Misty mountain passes with sudden rainfall near Wellawaya.' },
  gampaha: { name: 'Gampaha', latitude: 7.0873, longitude: 79.9925, bestTime: 'Before 03:00 PM', advice: 'Occasional localized rain along A1 highway.' },
  kurunegala: { name: 'Kurunegala', latitude: 7.4863, longitude: 80.3623, bestTime: 'Before 02:00 PM', advice: 'Warm weather with afternoon cloud cover.' },
  kalutara: { name: 'Kalutara', latitude: 6.5854, longitude: 79.9607, bestTime: 'Before 03:00 PM', advice: 'Coastal breeze with light afternoon rain.' },
  ratnapura: { name: 'Ratnapura', latitude: 6.6828, longitude: 80.4016, bestTime: 'Before 12:00 PM', advice: 'High rainfall area with flood warning risks in low-lying paths.' },
  badulla: { name: 'Badulla', latitude: 6.9934, longitude: 81.0550, bestTime: 'Before 01:00 PM', advice: 'Mountain road fog and afternoon showers.' },
};

const getLocationDetails = (locationName) => {
  const key = (locationName || '').trim().toLowerCase();
  if (key === 'current location' || key.includes('current location')) {
    return { name: 'Current Location (Colombo)', latitude: 6.9271, longitude: 79.8612 };
  }
  if (SRI_LANKA_CITIES[key]) return SRI_LANKA_CITIES[key];
  
  // Fuzzy match or fallback
  for (const cKey in SRI_LANKA_CITIES) {
    if (key.includes(cKey) || cKey.includes(key)) {
      return SRI_LANKA_CITIES[cKey];
    }
  }

  // Calculate dynamic default coordinates based on name string
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
  const latOffset = ((Math.abs(hash) % 250) / 100) - 0.5; // -0.5 to +2.0
  const lonOffset = ((Math.abs(hash >> 3) % 200) / 100);   // 0.0 to +2.0

  return {
    name: locationName,
    latitude: Math.min(Math.max(6.9271 + latOffset, 5.9), 9.8),
    longitude: Math.min(Math.max(79.8612 + lonOffset, 79.8), 81.8),
    bestTime: 'Before 02:00 PM',
    advice: `Afternoon monsoonal rain showers expected along route.`
  };
};

export default function SmartRouteFinderScreen() {
  const { t } = useTranslation();
  const { userProfile, speakText, isSpeaking, stopSpeaking } = useApp();
  const [origin, setOrigin] = useState('Current Location (Colombo)');
  const [destination, setDestination] = useState('Kandy');
  const [transportMode, setTransportMode] = useState('drive');
  const [routes, setRoutes] = useState(mockRoutes);
  const [loading, setLoading] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(mockRoutes[0].id);

  const currentOriginDetails = getLocationDetails(origin);
  const originCoords = { latitude: currentOriginDetails.latitude, longitude: currentOriginDetails.longitude };
  const currentDestDetails = getLocationDetails(destination);
  const destCoords = { latitude: currentDestDetails.latitude, longitude: currentDestDetails.longitude };

  const handleSearchRoutes = async () => {
    if (!destination.trim() || !origin.trim()) return;
    setLoading(true);
    try {
      const data = await recommendationsService.getRoutes(
        destination,
        transportMode,
        originCoords.latitude,
        originCoords.longitude,
        destCoords.latitude,
        destCoords.longitude
      );
      if (data && Array.isArray(data) && data.length > 0) {
        setRoutes(data);
        setSelectedRouteId(data[0].id);
      } else {
        // Generate dynamic mock routes for target destination
        updateMockRoutesForDestination(origin, destination);
      }
    } catch (err) {
      updateMockRoutesForDestination(origin, destination);
    } finally {
      setLoading(false);
    }
  };

  const updateMockRoutesForDestination = (fromName, targetName) => {
    const updated = [
      {
        id: `route-1-${fromName}-${targetName}`,
        title: `Via Expressway / Main Highway from ${fromName} to ${targetName}`,
        distance: "114 km",
        duration: "2 hr 45 min",
        riskLevel: "SAFE",
        riskScore: 20,
        riskColor: "#22C55E",
        weatherOnRoute: `Clear sky up to midpoint; light drizzle near ${targetName} approach.`,
        highlights: ["Smoothest road surface", "Low flood risk", "Multiple rest stops"],
      },
      {
        id: `route-2-${fromName}-${targetName}`,
        title: `Via Alternate Bypass from ${fromName} to ${targetName}`,
        distance: "128 km",
        duration: "2 hr 20 min",
        riskLevel: "MODERATE",
        riskScore: 55,
        riskColor: "#F59E0B",
        weatherOnRoute: `Moderate crosswinds and afternoon showers along ${targetName} route.`,
        highlights: ["Fastest route option", "Moderate traffic", "Scenic path"],
      },
      {
        id: `route-3-${fromName}-${targetName}`,
        title: `Via Scenic Inland Route from ${fromName} to ${targetName}`,
        distance: "105 km",
        duration: "3 hr 15 min",
        riskLevel: "HAZARDOUS",
        riskScore: 85,
        riskColor: "#EF4444",
        weatherOnRoute: `Heavy monsoon downpour & high risk of waterlogging near low-lying roads to ${targetName}.`,
        highlights: ["Shorter distance", "Flood-prone stretches", "Heavy traffic"],
      }
    ];
    setRoutes(updated);
    setSelectedRouteId(updated[0].id);
  };

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0] || mockRoutes[0];

  // Dynamic Polyline Coordinates
  const routePolyline = [
    originCoords,
    {
      latitude: (originCoords.latitude * 2 + destCoords.latitude) / 3,
      longitude: (originCoords.longitude * 2 + destCoords.longitude) / 3,
    },
    {
      latitude: (originCoords.latitude + destCoords.latitude * 2) / 3,
      longitude: (originCoords.longitude + destCoords.longitude * 2) / 3,
    },
    destCoords
  ];

  const textToRead = `Route summary from ${origin} to ${destination}. Recommended path: ${selectedRoute.title}. Distance: ${selectedRoute.distance}. Risk level: ${selectedRoute.riskLevel}. Weather on route: ${selectedRoute.weatherOnRoute}. Departure recommendation: Best departure ${currentDestDetails?.bestTime || 'Before 02:00 PM'}. ${currentDestDetails.advice}`;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Smart Route Finder</Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Weather-aware safe navigation across Sri Lanka
        </Text>
      </View>

      {/* INPUTS & MODE SELECTOR */}
      <Surface style={styles.inputCard} elevation={2}>
        <TextInput
          label="From (Origin in Sri Lanka)"
          value={origin}
          onChangeText={setOrigin}
          mode="outlined"
          left={<TextInput.Icon icon="crosshairs-gps" color="#00E5FF" />}
          right={
            <TextInput.Icon
              icon="crosshairs"
              color="#00E5FF"
              onPress={() => setOrigin('Current Location (Colombo)')}
            />
          }
          style={styles.input}
          outlineColor="#334155"
          activeOutlineColor="#00E5FF"
          textColor="#F8FAFC"
        />

        <TextInput
          label="To (Destination in Sri Lanka)"
          value={destination}
          onChangeText={setDestination}
          mode="outlined"
          left={<TextInput.Icon icon="map-marker" color="#EF4444" />}
          style={styles.input}
          outlineColor="#334155"
          activeOutlineColor="#0284C7"
          textColor="#F8FAFC"
        />

        {/* CUSTOM HIGH-CONTRAST TRAVELLING METHOD TABS */}
        <View style={styles.transportRow}>
          {[
            { value: 'drive', label: 'Car', icon: 'car' },
            { value: 'walk', label: 'Walk', icon: 'walk' },
            { value: 'cycle', label: 'Cycle', icon: 'bike' },
          ].map((mode) => {
            const active = transportMode === mode.value;
            return (
              <TouchableOpacity
                key={mode.value}
                onPress={() => setTransportMode(mode.value)}
                style={[
                  styles.transportTab,
                  active && styles.activeTransportTab
                ]}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={mode.icon}
                  size={18}
                  color={active ? '#00E5FF' : '#94A3B8'}
                />
                <Text style={[styles.transportText, active && styles.activeTransportText]}>
                  {mode.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          mode="contained"
          onPress={handleSearchRoutes}
          disabled={loading}
          loading={loading}
          style={{ marginTop: 14, borderRadius: 10 }}
          buttonColor="#0284C7"
          icon="routes"
        >
          {loading ? 'Analyzing Routes...' : 'Analyze Safe Routes'}
        </Button>
      </Surface>

      {/* MAPVIEW DISPLAY */}
      <View style={styles.mapContainer}>
        <WebMap
          style={styles.map}
          originName={origin}
          destinationName={destination}
          originCoords={originCoords}
          destCoords={destCoords}
          routePolyline={routePolyline}
          riskColor={selectedRoute.riskColor}
        />
      </View>

      {/* DEPARTURE ADVICE */}
      <Surface style={styles.departureCard} elevation={2}>
        <MaterialCommunityIcons name="clock-alert-outline" size={24} color="#F59E0B" />
        <View style={{ flex: 1 }}>
          <Text variant="titleSmall" style={{ color: '#F59E0B', fontWeight: '800' }}>
            Best Departure: {currentDestDetails.bestTime || 'Before 02:00 PM'}
          </Text>
          <Text variant="bodySmall" style={{ color: '#CBD5E1', marginTop: 2 }}>
            {currentDestDetails.advice}
          </Text>
        </View>
      </Surface>

      {/* READ ALOUD */}
      <Button
        mode="contained"
        onPress={() => isSpeaking ? stopSpeaking() : speakText(textToRead)}
        icon={isSpeaking ? "stop-circle" : "volume-high"}
        style={styles.voiceBtn}
        buttonColor={isSpeaking ? "#EF4444" : "#0284C7"}
      >
        {isSpeaking ? t('common.stopVoice') : "Read Route Risk Summary Aloud"}
      </Button>

      {/* ROUTE COMPARISON LIST */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Evaluated Route Options</Text>
      {routes.map((route) => (
        <RouteCard
          key={route.id}
          route={route}
          selected={selectedRouteId === route.id}
          onSelect={() => setSelectedRouteId(route.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 40,
    backgroundColor: '#0F172A',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  subtitle: {
    color: '#94A3B8',
    marginTop: 2,
  },
  inputCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  input: {
    backgroundColor: '#0F172A',
    marginBottom: 12,
  },
  transportRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 4,
    gap: 4,
  },
  transportTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    backgroundColor: 'transparent',
  },
  activeTransportTab: {
    backgroundColor: '#1E293B',
    borderColor: '#00E5FF',
    borderWidth: 1,
  },
  transportText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  activeTransportText: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  mapContainer: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  webMapFallback: {
    flex: 1,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  departureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 14,
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  voiceBtn: {
    borderRadius: 12,
    marginBottom: 20,
    paddingVertical: 4,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontWeight: '800',
    marginBottom: 12,
  },
});

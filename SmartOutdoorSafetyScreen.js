import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Checkbox, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import ActivityCard from '../components/ActivityCard';
import RiskGauge from '../components/RiskGauge';
import { recommendationsService } from '../services/recommendationsService';
import { mockOutdoorSafety } from '../data/mockData';

export default function SmartOutdoorSafetyScreen() {
  const { t } = useTranslation();
  const { userProfile, speakText, isSpeaking, stopSpeaking } = useApp();
  const [safetyData, setSafetyData] = useState(mockOutdoorSafety);
  const [selectedActivity, setSelectedActivity] = useState(mockOutdoorSafety.activities[0]);
  const [checklist, setChecklist] = useState(mockOutdoorSafety.checklist);

  useEffect(() => {
    const fetchSafetyData = async () => {
      try {
        const lat = userProfile?.lastLatitude || 6.9271;
        const lon = userProfile?.lastLongitude || 79.8612;
        const data = await recommendationsService.getOutdoorSafety(lat, lon);
        if (data) {
          setSafetyData(data);
          if (data.activities && data.activities.length > 0) {
            setSelectedActivity(data.activities[0]);
          }
          if (data.checklist) {
            setChecklist(data.checklist);
          }
        }
      } catch (err) {
        console.warn('Using fallback outdoor safety data');
      }
    };
    fetchSafetyData();
  }, [userProfile?.lastLatitude, userProfile?.lastLongitude]);

  const toggleCheck = (id) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const getRiskColor = (score) => {
    if (score <= 30) return '#22C55E';
    if (score <= 60) return '#F59E0B';
    return '#EF4444';
  };

  const textToRead = `Outdoor safety for ${selectedActivity?.name || 'activity'}. Risk status: ${selectedActivity?.status || 'unknown'}. Best time window: ${safetyData?.bestTimeWindow?.start || 'N/A'} to ${safetyData?.bestTimeWindow?.end || 'N/A'}. ${safetyData?.bestTimeWindow?.reason || ''}`;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Smart Outdoor Safety Advisor</Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Select an outdoor activity to evaluate real-time climate risk for {userProfile?.userType || 'user'}s
        </Text>
      </View>

      {/* ACTIVITY GRID SELECTOR */}
      <View style={styles.activityGrid}>
        {(safetyData?.activities || []).map((act) => (
          <ActivityCard
            key={act.id}
            activity={act}
            selected={selectedActivity.id === act.id}
            onPress={() => setSelectedActivity(act)}
          />
        ))}
      </View>

      {/* SELECTED ACTIVITY RISK GAUGE */}
      <Surface style={styles.riskCard} elevation={3}>
        <View style={styles.riskCardHeader}>
          <MaterialCommunityIcons name={selectedActivity.icon} size={36} color="#00E5FF" />
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ color: '#F8FAFC', fontWeight: '800' }}>
              {selectedActivity.name} Risk Assessment
            </Text>
            <Text variant="bodySmall" style={{ color: '#94A3B8' }}>
              Based on Colombo's 32°C & High UV Index
            </Text>
          </View>
        </View>

        <RiskGauge
          score={selectedActivity.riskScore}
          label={selectedActivity.status}
          color={getRiskColor(selectedActivity.riskScore)}
        />
      </Surface>

      {/* READ ALOUD */}
      <Button
        mode="contained"
        onPress={() => isSpeaking ? stopSpeaking() : speakText(textToRead)}
        icon={isSpeaking ? "stop-circle" : "volume-high"}
        style={styles.voiceBtn}
        buttonColor={isSpeaking ? "#EF4444" : "#0284C7"}
      >
        {isSpeaking ? t('common.stopVoice') : "Read Safety Advice Aloud"}
      </Button>

      {/* BEST TIME WINDOW */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Recommended Time Window</Text>
      <Surface style={styles.timeCard} elevation={2}>
        <MaterialCommunityIcons name="clock-check-outline" size={28} color="#22C55E" />
        <View style={{ flex: 1 }}>
          <Text variant="titleSmall" style={{ color: '#22C55E', fontWeight: '800' }}>
            {safetyData?.bestTimeWindow?.start || 'N/A'} – {safetyData?.bestTimeWindow?.end || 'N/A'}
          </Text>
          <Text variant="bodySmall" style={{ color: '#CBD5E1', marginTop: 2 }}>
            {safetyData?.bestTimeWindow?.reason || 'Loading safety data...'}
          </Text>
        </View>
      </Surface>

      {/* SAFETY CHECKLIST */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Activity Safety Checklist</Text>
      <View style={styles.checklist}>
        {checklist.map((item) => (
          <Surface key={item.id} style={styles.checkRow} elevation={1}>
            <Checkbox
              status={item.checked ? 'checked' : 'unchecked'}
              onPress={() => toggleCheck(item.id)}
              color="#0284C7"
            />
            <Text variant="bodyMedium" style={[styles.checkText, item.checked && styles.checkedText]}>
              {item.text}
            </Text>
          </Surface>
        ))}
      </View>
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
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  riskCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  riskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
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
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 14,
    gap: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  checklist: {
    gap: 10,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  checkText: {
    color: '#F8FAFC',
    flex: 1,
  },
  checkedText: {
    color: '#64748B',
    textDecorationLine: 'line-through',
  },
});

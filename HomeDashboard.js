import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Surface, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import WeatherCard from '../components/WeatherCard';
import AlertBanner from '../components/AlertBanner';

export default function HomeDashboard({ navigation }) {
  const { t } = useTranslation();
  const { weather, aiReport, alerts, userProfile, speakText, isSpeaking, stopSpeaking } = useApp();

  const activeAlert = alerts && alerts.length > 0 ? alerts[0] : null;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      {/* HEADER BAR */}
      <View style={styles.headerRow}>
        <View>
          <Text variant="titleMedium" style={styles.userGreeting}>
            Hello, {userProfile.fullName || 'Kayal'} 👋
          </Text>
          <Text variant="bodySmall" style={styles.userSubtext}>
            {userProfile.userType.toUpperCase()} • {userProfile.city}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('SettingsStack')}
          style={styles.profileBadge}
        >
          <MaterialCommunityIcons name="account-circle" size={32} color="#00E5FF" />
        </TouchableOpacity>
      </View>

      {/* DISASTER ALERT BANNER */}
      {activeAlert && (
        <AlertBanner
          alert={activeAlert}
          onPress={() => navigation.navigate('AlertDetail', { alert: activeAlert })}
        />
      )}

      {/* MAIN WEATHER CARD */}
      {weather && <WeatherCard weather={weather} />}

      {/* HOURLY FORECAST STRIP */}
      {weather?.hourlyForecast && (
        <View style={styles.hourlySection}>
          <Text variant="titleSmall" style={styles.sectionTitle}>Today's Hourly Outlook</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourlyList}>
            {weather.hourlyForecast.map((item, idx) => (
              <Surface key={idx} style={styles.hourlyItem} elevation={1}>
                <Text variant="labelSmall" style={styles.hourlyTime}>{item.time}</Text>
                <MaterialCommunityIcons name={item.icon || 'weather-partly-cloudy'} size={26} color="#FFD54F" />
                <Text variant="titleSmall" style={styles.hourlyTemp}>{item.temp}°</Text>
                <Text variant="labelSmall" style={styles.hourlyRain}>{item.rainProb}</Text>
              </Surface>
            ))}
          </ScrollView>
        </View>
      )}

      {/* AI WEATHER REPORT BRIEF CARD */}
      {aiReport && (
        <Card style={styles.aiReportCard} elevation={3}>
          <Card.Content style={styles.aiReportContent}>
            <View style={styles.aiHeader}>
              <View style={styles.aiBadge}>
                <MaterialCommunityIcons name="brain" size={20} color="#00E5FF" />
                <Text style={styles.aiBadgeText}>AI Weather Report</Text>
              </View>
              <Chip
                style={{ backgroundColor: (aiReport.riskColor || '#0284C7') + '20' }}
                textStyle={{ color: aiReport.riskColor || '#0284C7', fontWeight: '800', fontSize: 10 }}
              >
                {aiReport.riskLevel || 'MODERATE'} RISK
              </Chip>
            </View>

            <Text variant="titleMedium" style={styles.aiTitle}>{aiReport.title}</Text>
            <Text variant="bodyMedium" style={styles.aiSummary}>{aiReport.summary}</Text>

            <View style={styles.advisoryBox}>
              <Text style={styles.advisoryText}>{aiReport.personalizedAdvisory}</Text>
            </View>

          <View style={styles.aiActions}>
            <Button
              mode="contained"
              onPress={() => isSpeaking ? stopSpeaking() : speakText(`${aiReport.title}. ${aiReport.summary} ${aiReport.personalizedAdvisory}`)}
              icon={isSpeaking ? "stop-circle" : "volume-high"}
              style={styles.voiceBtn}
              buttonColor={isSpeaking ? "#EF4444" : "#0284C7"}
            >
              {isSpeaking ? t('common.stopVoice') : t('common.readAloud')}
            </Button>
          </View>
        </Card.Content>
      </Card>
      )}

      {/* QUICK FEATURE SHORTCUTS */}
      <Text variant="titleSmall" style={styles.sectionTitle}>Smart Advisors</Text>
      <View style={styles.shortcutsGrid}>
        <TouchableOpacity
          style={styles.shortcutCard}
          onPress={() => navigation.navigate('SmartClothingStack')}
        >
          <Surface style={styles.shortcutSurface} elevation={2}>
            <MaterialCommunityIcons name="tshirt-crew" size={32} color="#00E5FF" />
            <Text variant="titleSmall" style={styles.shortcutTitle}>Smart Clothing</Text>
            <Text variant="bodySmall" style={styles.shortcutSub}>What to wear today</Text>
          </Surface>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shortcutCard}
          onPress={() => navigation.navigate('SmartOutdoorSafetyStack')}
        >
          <Surface style={styles.shortcutSurface} elevation={2}>
            <MaterialCommunityIcons name="shield-check" size={32} color="#F59E0B" />
            <Text variant="titleSmall" style={styles.shortcutTitle}>Outdoor Safety</Text>
            <Text variant="bodySmall" style={styles.shortcutSub}>Activity risk score</Text>
          </Surface>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shortcutCard, { width: '100%' }]}
          onPress={() => navigation.navigate('SmartRouteFinderStack')}
        >
          <Surface style={[styles.shortcutSurface, { flexDirection: 'row', alignItems: 'center', gap: 16 }]} elevation={2}>
            <MaterialCommunityIcons name="routes" size={36} color="#10B981" />
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={styles.shortcutTitle}>Smart Route Finder</Text>
              <Text variant="bodySmall" style={styles.shortcutSub}>Weather-aware driving & walking paths</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#94A3B8" />
          </Surface>
        </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userGreeting: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  userSubtext: {
    color: '#94A3B8',
    marginTop: 2,
  },
  profileBadge: {
    padding: 4,
  },
  hourlySection: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontWeight: '700',
    marginBottom: 10,
  },
  hourlyList: {
    gap: 10,
  },
  hourlyItem: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    width: 70,
    gap: 4,
  },
  hourlyTime: {
    color: '#94A3B8',
    fontSize: 11,
  },
  hourlyTemp: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  hourlyRain: {
    color: '#38BDF8',
    fontSize: 10,
  },
  aiReportCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  aiReportContent: {
    padding: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiBadgeText: {
    color: '#00E5FF',
    fontWeight: '700',
    fontSize: 12,
  },
  aiTitle: {
    color: '#F8FAFC',
    fontWeight: '800',
    marginBottom: 6,
  },
  aiSummary: {
    color: '#CBD5E1',
    lineHeight: 20,
    marginBottom: 12,
  },
  advisoryBox: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0284C7',
    marginBottom: 16,
  },
  advisoryText: {
    color: '#F1F5F9',
    fontSize: 13,
    lineHeight: 18,
  },
  aiActions: {
    flexDirection: 'row',
    gap: 10,
  },
  voiceBtn: {
    flex: 1,
    borderRadius: 10,
  },
  shareBtn: {
    borderRadius: 10,
    borderColor: '#334155',
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  shortcutCard: {
    width: '48%',
  },
  shortcutSurface: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  shortcutTitle: {
    color: '#F8FAFC',
    fontWeight: '700',
    marginTop: 8,
  },
  shortcutSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
});

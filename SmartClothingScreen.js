import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Button, Surface, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { recommendationsService } from '../services/recommendationsService';
import { mockClothingRecommendation } from '../data/mockData';

export default function SmartClothingScreen() {
  const { t } = useTranslation();
  const { weather, userProfile, speakText, isSpeaking, stopSpeaking } = useApp();
  const [clothing, setClothing] = useState(mockClothingRecommendation);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClothingData = async () => {
      setLoading(true);
      try {
        const lat = userProfile?.lastLatitude || 6.9271;
        const lon = userProfile?.lastLongitude || 79.8612;
        const data = await recommendationsService.getClothing(lat, lon);
        if (data) setClothing(data);
      } catch (err) {
        console.warn('Using fallback clothing data');
      } finally {
        setLoading(false);
      }
    };
    fetchClothingData();
  }, [userProfile?.lastLatitude, userProfile?.lastLongitude]);

  const cityName = weather?.city || userProfile?.city || 'Colombo';
  const textToRead = `Clothing advisory for ${userProfile?.userType || 'student'} in ${cityName}. ${clothing.summary}. Top wear: ${clothing.items?.[0]?.recommendation || ''}. Accessories: ${clothing.accessories?.map(a => a.item).join(', ') || ''}. Pro tip: ${clothing.proTip || ''}`;

  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case 'Must Have':
        return {
          bg: '#7F1D1D40',
          text: '#F87171',
          border: '#EF444460',
        };
      case 'Essential':
        return {
          bg: '#78350F40',
          text: '#FBBF24',
          border: '#F59E0B60',
        };
      case 'Recommended':
      default:
        return {
          bg: '#0369A140',
          text: '#38BDF8',
          border: '#0284C760',
        };
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Smart Clothing Advisor</Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          AI recommendation tailored for {(userProfile?.userType || 'student').toUpperCase()} in {weather?.city || 'Colombo'} (32°C, 82% Humidity)
        </Text>
      </View>

      {/* READ ALOUD */}
      <Button
        mode="contained"
        onPress={() => isSpeaking ? stopSpeaking() : speakText(textToRead)}
        icon={isSpeaking ? "stop-circle" : "volume-high"}
        style={styles.voiceBtn}
        buttonColor={isSpeaking ? "#EF4444" : "#0284C7"}
      >
        {isSpeaking ? t('common.stopVoice') : "Read Clothing Advice Aloud"}
      </Button>

      {/* SUMMARY BRIEF */}
      <Surface style={styles.summaryCard} elevation={2}>
        <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#00E5FF" />
        <Text variant="bodyMedium" style={styles.summaryText}>{clothing.summary}</Text>
      </Surface>

      {/* CLOTHING ITEMS GRID */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Recommended Attire</Text>
      <View style={styles.itemsList}>
        {clothing.items.map((item, idx) => (
          <Surface key={idx} style={styles.itemCard} elevation={2}>
            <View style={styles.itemIconBadge}>
              <MaterialCommunityIcons name={item.icon} size={28} color="#38BDF8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="labelSmall" style={styles.itemCategory}>{item.category}</Text>
              <Text variant="titleSmall" style={styles.itemTitle}>{item.recommendation}</Text>
            </View>
          </Surface>
        ))}
      </View>

      {/* ESSENTIAL ACCESSORIES */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Essential Weather Gear</Text>
      <View style={styles.accList}>
        {clothing.accessories.map((acc, idx) => {
          const badge = getPriorityBadgeStyle(acc.priority);
          return (
            <Surface key={idx} style={styles.accCard} elevation={2}>
              <MaterialCommunityIcons name={acc.icon} size={24} color={badge.text} />
              <Text variant="titleSmall" style={styles.accTitle}>{acc.item}</Text>
              <Chip
                compact
                style={{
                  backgroundColor: badge.bg,
                  borderWidth: 1,
                  borderColor: badge.border,
                  borderRadius: 12,
                }}
                textStyle={{
                  color: badge.text,
                  fontSize: 10,
                  fontWeight: '800',
                  letterSpacing: 0.3,
                }}
              >
                {acc.priority}
              </Chip>
            </Surface>
          );
        })}
      </View>

      {/* PRO TIP */}
      <Surface style={styles.proTipCard} elevation={2}>
        <MaterialCommunityIcons name="information-outline" size={20} color="#34D399" />
        <Text variant="bodySmall" style={styles.proTipText}>{clothing.proTip}</Text>
      </Surface>
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
  voiceBtn: {
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 4,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  summaryText: {
    color: '#F8FAFC',
    flex: 1,
    lineHeight: 20,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontWeight: '800',
    marginBottom: 12,
  },
  itemsList: {
    gap: 12,
    marginBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  itemIconBadge: {
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 12,
  },
  itemCategory: {
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  itemTitle: {
    color: '#F8FAFC',
    fontWeight: '700',
    marginTop: 2,
  },
  accList: {
    gap: 10,
    marginBottom: 20,
  },
  accCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  accTitle: {
    color: '#F8FAFC',
    flex: 1,
    fontWeight: '600',
  },
  proTipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  proTipText: {
    color: '#A7F3D0',
    flex: 1,
    lineHeight: 18,
  },
});

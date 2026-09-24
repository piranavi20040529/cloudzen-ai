import React from 'react';
import { View, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Chip, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';

export default function AlertDetailScreen({ route, navigation }) {
  const { alert } = route.params || {};
  const { t } = useTranslation();
  const { speakText, isSpeaking, stopSpeaking } = useApp();

  if (!alert) return null;

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const textToRead = `${alert.title}. Issued by ${alert.source}. ${alert.description}. Safety instructions: ${alert.safetyBrief.join('. ')}`;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      {/* SEVERITY BANNER */}
      <Surface style={styles.banner} elevation={4}>
        <MaterialCommunityIcons name={alert.typeIcon} size={48} color="#FFFFFF" />
        <View style={{ flex: 1 }}>
          <Chip style={styles.chip} textStyle={{ color: '#DC2626', fontWeight: '900', fontSize: 10 }}>
            {alert.severityLabel} LEVEL
          </Chip>
          <Text variant="titleLarge" style={styles.bannerTitle}>{alert.title}</Text>
          <Text variant="bodySmall" style={styles.bannerMeta}>{alert.source} • {alert.time}</Text>
        </View>
      </Surface>

      {/* READ ALOUD VOICE ACTION */}
      <Button
        mode="contained"
        onPress={() => isSpeaking ? stopSpeaking() : speakText(textToRead)}
        icon={isSpeaking ? "stop-circle" : "volume-high"}
        style={styles.voiceBtn}
        buttonColor={isSpeaking ? "#EF4444" : "#0284C7"}
      >
        {isSpeaking ? t('common.stopVoice') : "Read Safety Brief Aloud"}
      </Button>

      {/* DESCRIPTION */}
      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.cardSectionTitle}>Situation Overview</Text>
          <Text variant="bodyMedium" style={styles.bodyText}>{alert.description}</Text>
          <View style={styles.areaBox}>
            <MaterialCommunityIcons name="map-marker" size={18} color="#00E5FF" />
            <Text variant="labelMedium" style={{ color: '#00E5FF', fontWeight: '600' }}>
              Affected: {alert.affectedArea} ({alert.distance})
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* AI SAFETY INSTRUCTIONS */}
      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <View style={styles.aiBriefHeader}>
            <MaterialCommunityIcons name="shield-check" size={22} color="#22C55E" />
            <Text variant="titleSmall" style={styles.cardSectionTitle}>AI Safety Checklist</Text>
          </View>
          {alert.safetyBrief.map((item, idx) => (
            <View key={idx} style={styles.checkItem}>
              <MaterialCommunityIcons name="check-circle-outline" size={18} color="#22C55E" />
              <Text variant="bodyMedium" style={styles.checkText}>{item}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* EMERGENCY CONTACTS */}
      <Text variant="titleMedium" style={styles.contactsTitle}>Sri Lanka Emergency Hotlines</Text>
      <View style={styles.contactsList}>
        {alert.emergencyContacts.map((contact, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handleCall(contact.phone)}
            activeOpacity={0.8}
          >
            <Surface style={styles.contactCard} elevation={2}>
              <View style={styles.phoneBadge}>
                <MaterialCommunityIcons name="phone" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="titleSmall" style={{ color: '#F8FAFC', fontWeight: '700' }}>
                  {contact.name}
                </Text>
                <Text variant="bodySmall" style={{ color: '#38BDF8', fontWeight: '600' }}>
                  Dial {contact.phone}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#94A3B8" />
            </Surface>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 30,
    backgroundColor: '#0F172A',
  },
  banner: {
    backgroundColor: '#DC2626',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
    lineHeight: 22,
  },
  bannerMeta: {
    color: '#FCA5A5',
    marginTop: 4,
  },
  voiceBtn: {
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 4,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardSectionTitle: {
    color: '#F8FAFC',
    fontWeight: '800',
    marginBottom: 8,
  },
  bodyText: {
    color: '#CBD5E1',
    lineHeight: 20,
  },
  areaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  aiBriefHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  checkText: {
    color: '#CBD5E1',
    flex: 1,
    lineHeight: 18,
  },
  contactsTitle: {
    color: '#F8FAFC',
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 12,
  },
  contactsList: {
    gap: 10,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  phoneBadge: {
    backgroundColor: '#0284C7',
    padding: 10,
    borderRadius: 10,
  },
});

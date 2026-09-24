import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface, Button, Switch, Divider, List, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';

export default function SettingsScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { userProfile, updateUserProfile, logoutUser, changeLanguage } = useApp();

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>{t('tabs.settings')}</Text>
      </View>

      {/* USER PROFILE CARD */}
      <Surface style={styles.profileCard} elevation={3}>
        <View style={styles.avatarCircle}>
          <MaterialCommunityIcons name="account" size={44} color="#00E5FF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="titleMedium" style={styles.userName}>{userProfile.fullName}</Text>
          <Text variant="bodySmall" style={styles.userEmail}>{userProfile.email}</Text>
          <View style={styles.userTypeBadge}>
            <Chip compact style={{ backgroundColor: '#0284C720' }} textStyle={{ color: '#38BDF8', fontSize: 10, fontWeight: '700' }}>
              {userProfile.userType.toUpperCase()}
            </Chip>
          </View>
        </View>
      </Surface>

      {/* LANGUAGE SELECTOR */}
      <Text variant="titleMedium" style={styles.sectionTitle}>App Language</Text>
      <Surface style={styles.settingsSection} elevation={2}>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => changeLanguage('en')}
        >
          <Text style={styles.flag}>🇬🇧</Text>
          <Text variant="bodyLarge" style={styles.settingLabel}>English</Text>
          {i18n.language === 'en' && <MaterialCommunityIcons name="check" size={20} color="#00E5FF" />}
        </TouchableOpacity>
        <Divider style={styles.divider} />
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => changeLanguage('si')}
        >
          <Text style={styles.flag}>🇱🇰</Text>
          <Text variant="bodyLarge" style={styles.settingLabel}>සිංහල (Sinhala)</Text>
          {i18n.language === 'si' && <MaterialCommunityIcons name="check" size={20} color="#00E5FF" />}
        </TouchableOpacity>
        <Divider style={styles.divider} />
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => changeLanguage('ta')}
        >
          <Text style={styles.flag}>🇱🇰</Text>
          <Text variant="bodyLarge" style={styles.settingLabel}>தமிழ் (Tamil)</Text>
          {i18n.language === 'ta' && <MaterialCommunityIcons name="check" size={20} color="#00E5FF" />}
        </TouchableOpacity>
      </Surface>

      {/* PREFERENCES */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Alert Preferences</Text>
      <Surface style={styles.settingsSection} elevation={2}>
        <View style={styles.settingRow}>
          <MaterialCommunityIcons name="volume-high" size={22} color="#F59E0B" />
          <Text variant="bodyLarge" style={[styles.settingLabel, { flex: 1, marginLeft: 12 }]}>
            Voice Alerts Aloud
          </Text>
          <Switch
            value={userProfile.voiceAlertsEnabled}
            onValueChange={(val) => updateUserProfile({ voiceAlertsEnabled: val })}
            color="#0284C7"
          />
        </View>
        <Divider style={styles.divider} />
        <View style={styles.settingRow}>
          <MaterialCommunityIcons name="map-marker-radius" size={22} color="#00E5FF" />
          <Text variant="bodyLarge" style={[styles.settingLabel, { flex: 1, marginLeft: 12 }]}>
            Location Tracking
          </Text>
          <Text variant="labelMedium" style={{ color: '#22C55E' }}>Enabled</Text>
        </View>
      </Surface>

      {/* LOGOUT */}
      <Button
        mode="outlined"
        onPress={handleLogout}
        icon="logout"
        style={styles.logoutBtn}
        textColor="#EF4444"
      >
        Sign Out
      </Button>

      <Text variant="labelSmall" style={styles.versionText}>
        CloudZen AI v1.0.0 • Non-Commercial Sri Lanka Demo
      </Text>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 18,
    gap: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  userName: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  userEmail: {
    color: '#94A3B8',
    marginTop: 2,
  },
  userTypeBadge: {
    flexDirection: 'row',
    marginTop: 6,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontWeight: '800',
    marginBottom: 10,
  },
  settingsSection: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  flag: {
    fontSize: 20,
    marginRight: 12,
  },
  settingLabel: {
    color: '#F8FAFC',
    flex: 1,
  },
  divider: {
    backgroundColor: '#334155',
  },
  logoutBtn: {
    borderColor: '#EF4444',
    borderRadius: 14,
    marginTop: 10,
    marginBottom: 20,
  },
  versionText: {
    color: '#64748B',
    textAlign: 'center',
  },
});

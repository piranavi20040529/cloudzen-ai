import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Button, Card, Switch, Checkbox, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { useApp } from '../context/AppContext';
import StepIndicator from '../components/StepIndicator';

export default function ProfileSetupScreen({ navigation }) {
  const { t } = useTranslation();
  const { updateUserProfile, setIsLoggedIn, userProfile } = useApp();

  const [step, setStep] = useState(1);
  const [locating, setLocating] = useState(false);

  // Profile Form States
  const [selectedLang, setSelectedLang] = useState(userProfile.language || 'en');
  const [selectedUserType, setSelectedUserType] = useState(userProfile.userType || 'student');
  const [healthAlerts, setHealthAlerts] = useState(userProfile.healthAlerts || ['heatstroke', 'uv_exposure']);
  const [voiceEnabled, setVoiceEnabled] = useState(userProfile.voiceAlertsEnabled ?? true);
  const [locationGranted, setLocationGranted] = useState(userProfile.locationPermissionGranted ?? true);

  const handleAllowLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (loc && loc.coords) {
          updateUserProfile({
            locationPermissionGranted: true,
            lastLatitude: loc.coords.latitude,
            lastLongitude: loc.coords.longitude,
          });
        } else {
          updateUserProfile({ locationPermissionGranted: true });
        }
      } else {
        updateUserProfile({ locationPermissionGranted: false });
      }
    } catch (e) {
      updateUserProfile({ locationPermissionGranted: true });
    } finally {
      setLocating(false);
      setIsLoggedIn(true);
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', label: 'English' },
    { code: 'si', name: 'සිංහල', flag: '🇱🇰', label: 'Sinhala' },
    { code: 'ta', name: 'தமிழ்', flag: '🇱🇰', label: 'Tamil' },
  ];

  const userTypes = [
    { id: 'student', title: t('userTypes.student'), icon: 'school-outline' },
    { id: 'farmer', title: t('userTypes.farmer'), icon: 'sprout-outline' },
    { id: 'hiker', title: t('userTypes.hiker'), icon: 'hiking' },
    { id: 'traveller', title: t('userTypes.traveller'), icon: 'bag-suitcase-outline' },
    { id: 'fisherman', title: t('userTypes.fisherman'), icon: 'fish' },
    { id: 'other', title: t('userTypes.other'), icon: 'account-outline' },
  ];

  const healthOptions = [
    { id: 'heatstroke', label: t('healthOptions.heatstroke'), icon: 'thermometer-alert' },
    { id: 'uv_exposure', label: t('healthOptions.uv_exposure'), icon: 'white-balance-sunny' },
    { id: 'asthma', label: t('healthOptions.asthma'), icon: 'air-filter' },
    { id: 'dehydration', label: t('healthOptions.dehydration'), icon: 'cup-water' },
  ];

  const toggleHealthOption = (id) => {
    if (id === 'all') {
      setHealthAlerts(['heatstroke', 'uv_exposure', 'asthma', 'dehydration']);
      return;
    }
    if (id === 'none') {
      setHealthAlerts([]);
      return;
    }
    if (healthAlerts.includes(id)) {
      setHealthAlerts(healthAlerts.filter(item => item !== id));
    } else {
      setHealthAlerts([...healthAlerts, id]);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      updateUserProfile({ language: selectedLang });
      setStep(2);
    } else if (step === 2) {
      updateUserProfile({ userType: selectedUserType });
      setStep(3);
    } else if (step === 3) {
      updateUserProfile({ healthAlerts, voiceAlertsEnabled: voiceEnabled });
      setStep(4);
    } else if (step === 4) {
      updateUserProfile({ locationPermissionGranted: locationGranted });
      setIsLoggedIn(true); // Complete setup & enter app
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <StepIndicator currentStep={step} totalSteps={4} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* STEP 1: LANGUAGE SELECTOR */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text variant="headlineSmall" style={styles.title}>{t('wizard.step1Title')}</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>{t('wizard.step1Sub')}</Text>

            <View style={styles.optionsList}>
              {languages.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => setSelectedLang(lang.code)}
                    activeOpacity={0.8}
                  >
                    <Surface
                      style={[styles.cardOption, isSelected && styles.selectedCardOption]}
                      elevation={isSelected ? 4 : 1}
                    >
                      <Text style={styles.flagText}>{lang.flag}</Text>
                      <Text variant="titleMedium" style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                        {lang.name}
                      </Text>
                      {isSelected && (
                        <MaterialCommunityIcons name="check-circle" size={24} color="#0284C7" />
                      )}
                    </Surface>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* STEP 2: USER TYPE */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text variant="headlineSmall" style={styles.title}>{t('wizard.step2Title')}</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>{t('wizard.step2Sub')}</Text>

            <View style={styles.gridContainer}>
              {userTypes.map((type) => {
                const isSelected = selectedUserType === type.id;
                return (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => setSelectedUserType(type.id)}
                    style={styles.gridItem}
                    activeOpacity={0.8}
                  >
                    <Surface
                      style={[styles.gridCard, isSelected && styles.selectedCardOption]}
                      elevation={isSelected ? 4 : 1}
                    >
                      <MaterialCommunityIcons
                        name={type.icon}
                        size={32}
                        color={isSelected ? "#00E5FF" : "#94A3B8"}
                      />
                      <Text variant="labelMedium" style={[styles.gridText, isSelected && styles.selectedOptionText]}>
                        {type.title}
                      </Text>
                    </Surface>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* STEP 3: HEALTH ALERTS & VOICE TOGGLE */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text variant="headlineSmall" style={styles.title}>{t('wizard.step3Title')}</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>{t('wizard.step3Sub')}</Text>

            <View style={styles.optionsList}>
              <TouchableOpacity onPress={() => toggleHealthOption('all')} activeOpacity={0.8}>
                <Surface style={styles.cardOption} elevation={1}>
                  <MaterialCommunityIcons name="select-all" size={22} color="#38BDF8" />
                  <Text variant="titleSmall" style={{ color: '#38BDF8', flex: 1, marginLeft: 10 }}>
                    {t('healthOptions.all')}
                  </Text>
                </Surface>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => toggleHealthOption('none')} activeOpacity={0.8}>
                <Surface style={styles.cardOption} elevation={1}>
                  <MaterialCommunityIcons name="close-circle-outline" size={22} color="#94A3B8" />
                  <Text variant="titleSmall" style={{ color: '#94A3B8', flex: 1, marginLeft: 10 }}>
                    {t('healthOptions.none')}
                  </Text>
                </Surface>
              </TouchableOpacity>

              {healthOptions.map((item) => {
                const isChecked = healthAlerts.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => toggleHealthOption(item.id)}
                    activeOpacity={0.8}
                  >
                    <Surface
                      style={[styles.cardOption, isChecked && styles.selectedCardOption]}
                      elevation={isChecked ? 2 : 1}
                    >
                      <MaterialCommunityIcons name={item.icon} size={24} color={isChecked ? "#00E5FF" : "#94A3B8"} />
                      <Text variant="bodyLarge" style={[styles.optionText, isChecked && styles.selectedOptionText]}>
                        {item.label}
                      </Text>
                      <Checkbox status={isChecked ? 'checked' : 'unchecked'} color="#0284C7" />
                    </Surface>
                  </TouchableOpacity>
                );
              })}

              <Surface style={[styles.cardOption, { marginTop: 16, justifyContent: 'space-between' }]} elevation={2}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <MaterialCommunityIcons name="volume-high" size={24} color="#F59E0B" />
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={{ color: '#F8FAFC', fontWeight: '700' }}>
                      Voice Weather Alerts
                    </Text>
                    <Text variant="bodySmall" style={{ color: '#94A3B8' }}>
                      Read weather updates aloud in your language
                    </Text>
                  </View>
                </View>
                <Switch value={voiceEnabled} onValueChange={setVoiceEnabled} color="#0284C7" />
              </Surface>
            </View>
          </View>
        )}

        {/* STEP 4: LOCATION PERMISSION */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <View style={styles.locationIconBadge}>
              <MaterialCommunityIcons name="map-marker-radius" size={64} color="#00E5FF" />
            </View>
            <Text variant="headlineSmall" style={styles.title}>{t('wizard.step4Title')}</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>{t('wizard.step4Sub')}</Text>

            <Surface style={styles.locationCard} elevation={3}>
              <MaterialCommunityIcons name="shield-check-outline" size={28} color="#22C55E" />
              <Text variant="bodyMedium" style={styles.locationCardText}>
                Your location data is stored locally and used exclusively to fetch Sri Lankan weather risks.
              </Text>
            </Surface>

            <Button
              mode="contained"
              onPress={handleAllowLocation}
              disabled={locating}
              loading={locating}
              style={[styles.locationBtn, { backgroundColor: '#0284C7' }]}
              icon="crosshairs-gps"
            >
              {locating ? 'Acquiring GPS Location...' : 'Allow Location Access'}
            </Button>

            <Button
              mode="outlined"
              onPress={() => {
                setLocationGranted(false);
                handleNextStep();
              }}
              style={styles.skipLocationBtn}
              textColor="#94A3B8"
            >
              Skip for Now
            </Button>
          </View>
        )}
      </ScrollView>

      {/* FOOTER BUTTONS */}
      <View style={styles.footerNav}>
        {step > 1 && (
          <Button mode="outlined" onPress={handlePrevStep} style={styles.navBtn} textColor="#94A3B8">
            {t('common.back')}
          </Button>
        )}
        {step < 4 && (
          <Button mode="contained" onPress={handleNextStep} style={[styles.navBtn, { flex: 1 }]} buttonColor="#0284C7">
            {t('common.next')}
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    paddingTop: 50,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  stepContainer: {
    marginTop: 12,
  },
  title: {
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  optionsList: {
    gap: 12,
  },
  cardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectedCardOption: {
    borderColor: '#0284C7',
    backgroundColor: '#0F172A',
  },
  flagText: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    color: '#F8FAFC',
    fontWeight: '600',
    marginLeft: 8,
  },
  selectedOptionText: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridItem: {
    width: '48%',
  },
  gridCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  gridText: {
    color: '#F8FAFC',
    marginTop: 10,
    fontWeight: '600',
  },
  locationIconBadge: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 14,
    marginBottom: 24,
    gap: 12,
  },
  locationCardText: {
    color: '#CBD5E1',
    flex: 1,
    lineHeight: 20,
  },
  locationBtn: {
    borderRadius: 14,
    paddingVertical: 8,
    marginBottom: 12,
  },
  skipLocationBtn: {
    borderRadius: 14,
    borderColor: '#334155',
  },
  footerNav: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 30,
    backgroundColor: '#0F172A',
  },
  navBtn: {
    borderRadius: 12,
  },
});

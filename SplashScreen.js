import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function SplashScreen({ navigation }) {
  const { isFirstLaunch } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isFirstLaunch) {
        navigation.replace('Onboarding');
      } else {
        navigation.replace('Login');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#0284C7']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <MaterialCommunityIcons name="weather-partly-cloudy" size={72} color="#00E5FF" />
        </View>
        <Text variant="displaySmall" style={styles.title}>
          CloudZen AI
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          AI Weather Risk & Outdoor Safety Advisor
        </Text>
      </View>
      <Text variant="labelSmall" style={styles.footer}>
        Sri Lanka 🇱🇰 • v1.0.0
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  title: {
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  footer: {
    color: '#64748B',
  },
});

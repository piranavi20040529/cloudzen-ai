import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import i18n from '../i18n';
import { authService } from '../services/authService';
import { weatherService } from '../services/weatherService';
import { alertsService } from '../services/alertsService';
import { reportsService } from '../services/reportsService';
import { getAuthToken } from '../services/apiClient';

import { mockCurrentWeather, mockAiReport, mockDisasterAlerts } from '../data/mockData';

let Speech = null;
if (Platform.OS !== 'web') {
  try {
    Speech = require('expo-speech');
  } catch (e) {
    Speech = null;
  }
}

const AppContext = createContext();

const defaultUserProfile = {
  fullName: 'Kayal Shankar',
  email: 'kayal@cloudzen.ai',
  language: 'en',
  userType: 'student',
  healthAlerts: ['heatstroke', 'uv_exposure'],
  voiceAlertsEnabled: true,
  locationPermissionGranted: true,
  city: 'Colombo',
  district: 'Colombo',
  province: 'Western Province',
  country: 'Sri Lanka',
  lastLatitude: 6.9271,
  lastLongitude: 79.8612,
};

export const AppProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(defaultUserProfile);
  const [weather, setWeather] = useState(mockCurrentWeather);
  const [aiReport, setAiReport] = useState(mockAiReport);
  const [alerts, setAlerts] = useState(mockDisasterAlerts);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Check stored JWT token on app boot
  useEffect(() => {
    const checkToken = async () => {
      const token = await getAuthToken();
      if (token) {
        try {
          const profile = await authService.getProfile();
          setUserProfile((prev) => ({ ...prev, ...profile }));
          setIsLoggedIn(true);
        } catch (err) {
          console.warn('Session expired or invalid token');
          await authService.logout();
          setIsLoggedIn(false);
        }
      }
    };
    checkToken();
  }, []);

  // Fetch all dashboard data from backend API
  const refreshData = useCallback(async (lat = 6.9271, lon = 79.8612) => {
    setIsLoading(true);
    try {
      const [weatherData, alertsData, reportData] = await Promise.all([
        weatherService.getCurrentWeather(lat, lon).catch((e) => null),
        alertsService.getAlerts(lat, lon).catch((e) => []),
        reportsService.getWeatherBrief(lat, lon).catch((e) => null),
      ]);

      if (weatherData) setWeather(weatherData);
      if (alertsData) setAlerts(alertsData);
      if (reportData) setAiReport(reportData);
    } catch (error) {
      console.error('Failed to refresh app data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on login
  useEffect(() => {
    if (isLoggedIn) {
      const lat = userProfile?.lastLatitude || 6.9271;
      const lon = userProfile?.lastLongitude || 79.8612;
      refreshData(lat, lon);
    }
  }, [isLoggedIn, refreshData, userProfile?.lastLatitude, userProfile?.lastLongitude]);

  // Auth helper methods
  const loginUser = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      if (data.user) {
        setUserProfile((prev) => ({ ...prev, ...data.user }));
      }
      setIsLoggedIn(true);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (fullName, email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.register(fullName, email, password);
      if (data.user) {
        setUserProfile((prev) => ({ ...prev, ...data.user }));
      }
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    await authService.logout();
    setIsLoggedIn(false);
    setWeather(null);
    setAiReport(null);
    setAlerts([]);
  };

  // Change App Language
  const changeLanguage = (langCode) => {
    setUserProfile((prev) => ({ ...prev, language: langCode }));
    i18n.changeLanguage(langCode);
    if (isLoggedIn) {
      authService.updateProfile({ language: langCode }).catch(() => {});
    }
  };

  // Update Profile Data
  const updateUserProfile = (newFields) => {
    setUserProfile((prev) => ({ ...prev, ...newFields }));
    if (newFields.language) {
      i18n.changeLanguage(newFields.language);
    }
    if (isLoggedIn) {
      authService.updateProfile(newFields).catch(() => {});
    }
  };

  // Text-To-Speech function for Voice Alerts
  const speakText = (text) => {
    if (!userProfile?.voiceAlertsEnabled) return;

    if (isSpeaking) {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      } else if (Speech) {
        Speech.stop();
      }
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const lang = userProfile?.language === 'ta' ? 'ta-IN' : userProfile?.language === 'si' ? 'si-LK' : 'en-US';

    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else if (Speech) {
      Speech.speak(text, {
        language: lang,
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } else {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    } else if (Speech) {
      Speech.stop();
    }
    setIsSpeaking(false);
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        isFirstLaunch,
        setIsFirstLaunch,
        isLoading,
        userProfile,
        setUserProfile,
        updateUserProfile,
        weather,
        aiReport,
        alerts,
        changeLanguage,
        speakText,
        stopSpeaking,
        isSpeaking,
        refreshData,
        loginUser,
        registerUser,
        logoutUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

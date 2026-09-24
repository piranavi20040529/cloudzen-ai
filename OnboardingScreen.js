import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import WebPager from '../components/WebPager';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const { t } = useTranslation();
  const { setIsFirstLaunch } = useApp();
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef(null);

  const slides = [
    {
      icon: "brain",
      title: "AI-Powered Weather Risk",
      description: "Hyper-local forecasts, air quality alerts, and heatstress warnings tailored specifically for Sri Lanka.",
      color: "#00E5FF"
    },
    {
      icon: "shield-alert",
      title: "Disaster Early Warning",
      description: "Real-time alerts for floods, cyclones, landslides, and high sea swells with AI safety checklists.",
      color: "#FF9800"
    },
    {
      icon: "routes",
      title: "Smart Route Finder",
      description: "Find the safest driving or walking paths during heavy monsoonal rain or flash flood warnings.",
      color: "#4CAF50"
    },
    {
      icon: "tshirt-crew",
      title: "Smart Clothing & Outdoor Safety",
      description: "Get personalized what-to-wear and safety recommendations for farming, hiking, fishing, or studying.",
      color: "#AB47BC"
    }
  ];

  const handleFinish = () => {
    setIsFirstLaunch(false);
    navigation.replace('Login');
  };

  const handleNext = () => {
    if (currentPage < slides.length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      if (Platform.OS !== 'web' && pagerRef.current) {
        pagerRef.current.setPage(nextPage);
      }
    } else {
      handleFinish();
    }
  };

  const currentSlide = slides[currentPage];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={handleFinish} labelStyle={styles.skipBtn}>
          {t('common.skip')}
        </Button>
      </View>

      <WebPager
        pagerRef={pagerRef}
        style={styles.pager}
        initialPage={0}
        currentPage={currentPage}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <View style={[styles.iconContainer, { borderColor: slide.color + '40' }]}>
              <MaterialCommunityIcons name={slide.icon} size={80} color={slide.color} />
            </View>
            <Text variant="headlineMedium" style={styles.slideTitle}>
              {slide.title}
            </Text>
            <Text variant="bodyLarge" style={styles.slideDesc}>
              {slide.description}
            </Text>
          </View>
        ))}
      </WebPager>

      <View style={styles.footer}>
        <View style={styles.paginationDots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentPage === index && styles.activeDot
              ]}
            />
          ))}
        </View>

        {currentPage === slides.length - 1 ? (
          <Button
            mode="contained"
            onPress={handleFinish}
            style={styles.actionBtn}
            buttonColor="#0284C7"
          >
            {t('common.getStarted')}
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.actionBtn}
            buttonColor="#0284C7"
          >
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
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  skipBtn: {
    color: '#94A3B8',
  },
  pager: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
    borderWidth: 2,
  },
  slideTitle: {
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 12,
  },
  slideDesc: {
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    gap: 24,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#0284C7',
  },
  actionBtn: {
    borderRadius: 14,
    paddingVertical: 6,
  },
});

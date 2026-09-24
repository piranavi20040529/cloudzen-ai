import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/theme/theme';
import './src/i18n';

export default function App() {
  return (
    <View style={styles.container}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics} style={styles.container}>
        <PaperProvider theme={theme}>
          <AppProvider>
            <NavigationContainer>
              <StatusBar style="light" backgroundColor="#0F172A" />
              <AppNavigator />
            </NavigationContainer>
          </AppProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#0F172A',
  },
});

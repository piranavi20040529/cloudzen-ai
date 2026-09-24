import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

// Auth Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';

// Main App Screens
import HomeDashboard from '../screens/HomeDashboard';
import DisasterAlertsScreen from '../screens/DisasterAlertsScreen';
import AlertDetailScreen from '../screens/AlertDetailScreen';
import SmartClothingScreen from '../screens/SmartClothingScreen';
import SmartOutdoorSafetyScreen from '../screens/SmartOutdoorSafetyScreen';
import SmartRouteFinderScreen from '../screens/SmartRouteFinderScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </Stack.Navigator>
  );
}

// Home Stack Navigator
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeDashboard" component={HomeDashboard} />
      <Stack.Screen name="AlertDetail" component={AlertDetailScreen} />
    </Stack.Navigator>
  );
}

// Alerts Stack Navigator
function AlertsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DisasterAlertsList" component={DisasterAlertsScreen} />
      <Stack.Screen name="AlertDetail" component={AlertDetailScreen} />
    </Stack.Navigator>
  );
}

// Main Bottom Tab Navigator
function MainTabNavigator() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
          height: 55 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#00E5FF',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="AlertsTab"
        component={AlertsStack}
        options={{
          tabBarLabel: t('tabs.alerts'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shield-alert-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="SmartClothingStack"
        component={SmartClothingScreen}
        options={{
          tabBarLabel: t('tabs.clothing'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="tshirt-crew-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="SmartOutdoorSafetyStack"
        component={SmartOutdoorSafetyScreen}
        options={{
          tabBarLabel: t('tabs.safety'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shield-check-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="SmartRouteFinderStack"
        component={SmartRouteFinderScreen}
        options={{
          tabBarLabel: t('tabs.routes'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="routes" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="SettingsStack"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('tabs.settings'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigation Switcher
export default function AppNavigator() {
  const { isLoggedIn } = useApp();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
}

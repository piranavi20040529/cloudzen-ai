import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const { loginUser } = useApp();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await loginUser(email, password);
    } catch (error) {
      setErrorMessage(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: Math.max(insets.top + 70, 110),
          paddingBottom: Math.max(insets.bottom + 40, 50),
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <MaterialCommunityIcons name="weather-partly-cloudy" size={36} color="#00E5FF" />
        </View>
        <Text variant="headlineMedium" style={styles.title}>
          {t('auth.loginTitle')}
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {t('auth.loginSubtitle')}
        </Text>
      </View>

      <View style={styles.form}>
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#EF4444" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <TextInput
          label={t('auth.emailLabel')}
          value={email}
          onChangeText={(text) => { setEmail(text); setErrorMessage(''); }}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          left={<TextInput.Icon icon="email-outline" color="#94A3B8" />}
          style={styles.input}
          outlineColor="#334155"
          activeOutlineColor="#0284C7"
          textColor="#F8FAFC"
        />

        <TextInput
          label={t('auth.passwordLabel')}
          value={password}
          onChangeText={(text) => { setPassword(text); setErrorMessage(''); }}
          mode="outlined"
          secureTextEntry={!showPassword}
          left={<TextInput.Icon icon="lock-outline" color="#94A3B8" />}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              color="#94A3B8"
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          style={styles.input}
          outlineColor="#334155"
          activeOutlineColor="#0284C7"
          textColor="#F8FAFC"
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotBtn}
        >
          <Text variant="labelMedium" style={styles.forgotText}>
            {t('auth.forgotPassword')}
          </Text>
        </TouchableOpacity>

        <Button
          mode="contained"
          onPress={handleLogin}
          disabled={loading}
          loading={loading}
          style={styles.submitBtn}
          buttonColor="#0284C7"
        >
          {loading ? 'Signing in...' : t('common.login')}
        </Button>
      </View>

      <View style={styles.footer}>
        <Text variant="bodyMedium" style={styles.footerText}>
          {t('auth.noAccount')}{' '}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text variant="titleSmall" style={styles.registerLink}>
            {t('common.register')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 36,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7F1D1D40',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EF444460',
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#F87171',
    flex: 1,
    fontSize: 13,
  },
  input: {
    backgroundColor: '#1E293B',
    marginBottom: 16,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#38BDF8',
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 16,
    paddingVertical: 8,
  },
  footerText: {
    color: '#94A3B8',
  },
  registerLink: {
    color: '#38BDF8',
    fontWeight: '700',
  },
});


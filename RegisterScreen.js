import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';

export default function RegisterScreen({ navigation }) {
  const { t } = useTranslation();
  const { registerUser } = useApp();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await registerUser(fullName, email, password);
      navigation.navigate('ProfileSetup');
    } catch (error) {
      setErrorMessage(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Create Account
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Sign up to get personalized Sri Lankan weather alerts
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
          label={t('auth.fullNameLabel')}
          value={fullName}
          onChangeText={setFullName}
          mode="outlined"
          left={<TextInput.Icon icon="account-outline" color="#94A3B8" />}
          style={styles.input}
          outlineColor="#334155"
          activeOutlineColor="#0284C7"
          textColor="#F8FAFC"
        />

        <TextInput
          label={t('auth.emailLabel')}
          value={email}
          onChangeText={setEmail}
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
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry={!showPassword}
          left={<TextInput.Icon icon="lock-outline" color="#94A3B8" />}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off-outline" : "eye-outline"}
              color="#94A3B8"
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          style={styles.input}
          outlineColor="#334155"
          activeOutlineColor="#0284C7"
          textColor="#F8FAFC"
        />

        <TextInput
          label={t('auth.confirmPasswordLabel')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          secureTextEntry={!showPassword}
          left={<TextInput.Icon icon="lock-check-outline" color="#94A3B8" />}
          style={styles.input}
          outlineColor="#334155"
          activeOutlineColor="#0284C7"
          textColor="#F8FAFC"
        />

        <Button
          mode="contained"
          onPress={handleRegister}
          disabled={loading}
          loading={loading}
          style={styles.submitBtn}
          buttonColor="#0284C7"
        >
          {loading ? 'Registering...' : `${t('common.next')} • Profile Setup`}
        </Button>
      </View>

      <View style={styles.footer}>
        <Text variant="bodyMedium" style={styles.footerText}>
          {t('auth.alreadyAccount')}{' '}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text variant="titleSmall" style={styles.loginLink}>
            {t('common.login')}
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
    paddingTop: 60,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    color: '#94A3B8',
    marginTop: 6,
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
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#94A3B8',
  },
  loginLink: {
    color: '#38BDF8',
    fontWeight: '700',
  },
});

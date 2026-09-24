import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';

export default function ForgotPasswordScreen({ navigation }) {
  const { t } = useTranslation();

  // Wizard Steps: 1 = Email, 2 = Verify OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState(1);

  // Form State
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Input Refs for OTP Auto-Focus
  const otpInputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Resend Timer Countdown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // STEP 1: Send OTP to Email
  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      await authService.forgotPassword(email.trim());
      setStep(2);
      setResendCooldown(60);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Input Change Handler (Auto advance to next box)
  const handleOtpChange = (text, index) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otpDigits];

    if (cleanText.length > 1) {
      // User pasted full code e.g. "123456"
      const pasted = cleanText.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || '';
      }
      setOtpDigits(newOtp);
      otpInputRefs[5].current?.focus();
      return;
    }

    newOtp[index] = cleanText;
    setOtpDigits(newOtp);
    setErrorMessage('');

    if (cleanText && index < 5) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await authService.verifyOtp(email.trim(), fullOtp);
      if (result.resetToken) {
        setResetToken(result.resetToken);
        setStep(3);
      } else {
        setErrorMessage('Verification failed. Please try again.');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setErrorMessage('');
    try {
      await authService.forgotPassword(email.trim());
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs[0].current?.focus();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      await authService.resetPassword(resetToken, newPassword);
      setStep(4); // Success step
    } catch (error) {
      setErrorMessage(error.message || 'Failed to reset password. Please request a new code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0F172A' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* STEP PROGRESS INDICATOR */}
        <View style={styles.stepProgressRow}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={styles.stepDotContainer}>
              <View
                style={[
                  styles.stepDot,
                  step === s && styles.activeStepDot,
                  step > s && styles.completedStepDot,
                ]}
              >
                {step > s ? (
                  <MaterialCommunityIcons name="check" size={14} color="#0F172A" />
                ) : (
                  <Text style={[styles.stepDotText, step === s && styles.activeStepDotText]}>
                    {s}
                  </Text>
                )}
              </View>
              {s < 3 && (
                <View
                  style={[
                    styles.stepLine,
                    step > s && styles.completedStepLine,
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        {/* HEADER ICON & TITLE */}
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons
              name={
                step === 1
                  ? 'email-lock'
                  : step === 2
                  ? 'shield-key-outline'
                  : step === 3
                  ? 'lock-reset'
                  : 'check-circle-outline'
              }
              size={44}
              color={step === 4 ? '#10B981' : '#00E5FF'}
            />
          </View>

          <Text variant="headlineMedium" style={styles.title}>
            {step === 1
              ? t('auth.resetPasswordTitle')
              : step === 2
              ? t('auth.enterOtp')
              : step === 3
              ? t('auth.newPasswordTitle')
              : t('auth.resetSuccess')}
          </Text>

          <Text variant="bodyMedium" style={styles.subtitle}>
            {step === 1
              ? t('auth.resetPasswordSubtitle')
              : step === 2
              ? `We sent a 6-digit OTP code to ${email}`
              : step === 3
              ? t('auth.newPasswordSub')
              : 'Your password has been successfully updated. You can now sign in with your new password.'}
          </Text>
        </View>

        {/* ERROR BANNER */}
        {errorMessage ? (
          <Surface style={styles.errorBanner} elevation={2}>
            <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#EF4444" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </Surface>
        ) : null}

        {/* STEP 1: EMAIL ENTRY */}
        {step === 1 && (
          <View style={styles.form}>
            <TextInput
              label={t('auth.emailLabel')}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrorMessage('');
              }}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email-outline" color="#94A3B8" />}
              style={styles.input}
              outlineColor="#334155"
              activeOutlineColor="#0284C7"
              textColor="#F8FAFC"
            />

            <Button
              mode="contained"
              onPress={handleSendOtp}
              disabled={loading}
              loading={loading}
              style={styles.submitBtn}
              buttonColor="#0284C7"
              icon="send"
            >
              {loading ? 'Sending Code...' : t('auth.sendResetLink')}
            </Button>
          </View>
        )}

        {/* STEP 2: 6-DIGIT OTP ENTRY */}
        {step === 2 && (
          <View style={styles.form}>
            <View style={styles.otpGrid}>
              {otpDigits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={otpInputRefs[index]}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                  mode="outlined"
                  keyboardType="number-pad"
                  maxLength={1}
                  style={styles.otpBox}
                  outlineColor={digit ? '#00E5FF' : '#334155'}
                  activeOutlineColor="#00E5FF"
                  textColor="#00E5FF"
                />
              ))}
            </View>

            <Button
              mode="contained"
              onPress={handleVerifyOtp}
              disabled={loading || otpDigits.join('').length !== 6}
              loading={loading}
              style={styles.submitBtn}
              buttonColor="#0284C7"
              icon="shield-check"
            >
              {loading ? 'Verifying...' : t('auth.verifyOtpBtn')}
            </Button>

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't receive the code?</Text>
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
              >
                <Text
                  style={[
                    styles.resendBtnText,
                    resendCooldown > 0 && styles.disabledResend,
                  ]}
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : t('auth.resendOtp')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 3: NEW PASSWORD ENTRY */}
        {step === 3 && (
          <View style={styles.form}>
            <TextInput
              label={t('auth.newPasswordLabel')}
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setErrorMessage('');
              }}
              mode="outlined"
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon="lock-outline" color="#94A3B8" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
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
              label={t('auth.confirmNewPasswordLabel')}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrorMessage('');
              }}
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
              onPress={handleResetPassword}
              disabled={loading}
              loading={loading}
              style={styles.submitBtn}
              buttonColor="#0284C7"
              icon="content-save-check"
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </Button>
          </View>
        )}

        {/* STEP 4: SUCCESS STEP */}
        {step === 4 && (
          <View style={styles.form}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Login')}
              style={styles.submitBtn}
              buttonColor="#10B981"
              icon="login"
            >
              Sign In with New Password
            </Button>
          </View>
        )}

        {/* BACK TO LOGIN */}
        {step !== 4 && (
          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            labelStyle={{ color: '#94A3B8' }}
            style={{ marginTop: 24 }}
          >
            {t('common.back')} to Login
          </Button>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  stepProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  stepDotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepDot: {
    backgroundColor: '#0284C7',
    borderColor: '#00E5FF',
  },
  completedStepDot: {
    backgroundColor: '#00E5FF',
    borderColor: '#00E5FF',
  },
  stepDotText: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 13,
  },
  activeStepDotText: {
    color: '#FFFFFF',
  },
  stepLine: {
    width: 45,
    height: 2,
    backgroundColor: '#334155',
    marginHorizontal: 6,
  },
  completedStepLine: {
    backgroundColor: '#00E5FF',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    textAlign: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#1E293B',
    marginBottom: 18,
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpBox: {
    width: 46,
    height: 54,
    backgroundColor: '#1E293B',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 6,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  resendText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  resendBtnText: {
    color: '#00E5FF',
    fontWeight: '700',
    fontSize: 13,
  },
  disabledResend: {
    color: '#64748B',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7F1D1D40',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF444460',
    marginBottom: 20,
    width: '100%',
    gap: 10,
  },
  errorText: {
    color: '#F87171',
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

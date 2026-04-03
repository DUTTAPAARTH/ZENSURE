import { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { sendOTP, verifyOTP } from '@/src/services/api';
import { saveToken, saveWorker } from '@/src/services/auth';
import { ZENSURE_COLORS } from '@/src/utils/constants';
import { validateMobile } from '@/src/utils/validation';

export default function SignInScreen() {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const mobileValidation = validateMobile(mobile);
    if (!mobileValidation.valid) {
      setError(mobileValidation.error);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await sendOTP(mobile);
      setDemoOtp(response.data.otp);
      setStep('otp');
    } catch {
      setError('Could not send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Enter 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await verifyOTP(mobile, otp);
      await saveToken(response.data.token);
      await saveWorker(response.data.worker);
      router.replace('/(tabs)');
    } catch {
      setError('Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Enter your mobile number to continue.</Text>

        <TextInput
          style={styles.input}
          placeholder="10-digit mobile number"
          placeholderTextColor={ZENSURE_COLORS.textSecondary}
          value={mobile}
          onChangeText={text => {
            setMobile(text.replace(/\D/g, '').slice(0, 10));
            setError('');
          }}
          keyboardType="phone-pad"
          editable={step === 'mobile'}
        />

        {step === 'otp' ? (
          <>
            <View style={styles.otpBox}>
              <Text style={styles.otpBoxText}>Demo OTP: {demoOtp || '......'}</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="6-digit OTP"
              placeholderTextColor={ZENSURE_COLORS.textSecondary}
              value={otp}
              onChangeText={text => {
                setOtp(text.replace(/\D/g, '').slice(0, 6));
                setError('');
              }}
              keyboardType="number-pad"
            />
          </>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.disabledButton]}
          activeOpacity={0.8}
          onPress={step === 'mobile' ? handleSendOtp : handleVerifyOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={ZENSURE_COLORS.bg} />
          ) : (
            <Text style={styles.primaryButtonText}>
              {step === 'mobile' ? 'Send OTP' : 'Verify & Continue'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.replace('/auth/choice')}
          style={styles.linkWrap}
        >
          <Text style={styles.linkText}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ZENSURE_COLORS.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    color: ZENSURE_COLORS.white,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: ZENSURE_COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 22,
  },
  input: {
    backgroundColor: ZENSURE_COLORS.surface,
    borderWidth: 1,
    borderColor: ZENSURE_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: ZENSURE_COLORS.white,
    marginBottom: 12,
  },
  otpBox: {
    backgroundColor: 'rgba(255, 107, 0, 0.14)',
    borderColor: ZENSURE_COLORS.primary,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  otpBoxText: {
    color: ZENSURE_COLORS.primary,
    fontWeight: '700',
  },
  error: {
    color: ZENSURE_COLORS.error,
    fontSize: 12,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: ZENSURE_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: ZENSURE_COLORS.bg,
    fontWeight: '800',
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.7,
  },
  linkWrap: {
    marginTop: 14,
    alignItems: 'center',
  },
  linkText: {
    color: ZENSURE_COLORS.textSecondary,
  },
});

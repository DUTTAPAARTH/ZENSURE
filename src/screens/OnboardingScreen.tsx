import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LANGUAGES, CITIES, t, STORAGE_KEYS, ZENSURE_COLORS } from '../utils/constants';
import { sendOTP, verifyOTP } from '../services/api';

type Platform_ = 'zomato' | 'swiggy';

export default function OnboardingScreen() {
  const router = useRouter();

  // Language
  const [selectedLang, setSelectedLang] = useState('en');

  // Form state
  const [platform, setPlatform] = useState<Platform_>('zomato');
  const [partnerId, setPartnerId] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [zone, setZone] = useState('');
  const [mobile, setMobile] = useState('');

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!partnerId.trim()) newErrors.partnerId = 'Partner ID is required';
    if (!selectedCity) newErrors.city = 'Please select your city';
    if (!zone.trim()) newErrors.zone = 'Delivery zone is required';
    if (!mobile.trim() || mobile.length < 10) newErrors.mobile = 'Enter valid 10-digit mobile number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await sendOTP(mobile);
      if (res.success) {
        setOtpSent(true);
        startCountdown();
        setErrors({});
      }
    } catch {
      setErrors({ general: 'Failed to send OTP. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      setErrors({ otp: 'Enter 6-digit OTP' });
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOTP(mobile, otp);
      if (res.success && res.token && res.partner) {
        const partnerData = {
          ...res.partner,
          city: selectedCity || res.partner.city,
          zone: zone || res.partner.zone,
          platform,
          partnerIdInput: partnerId,
          mobile,
        };
        await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, selectedLang);
        await AsyncStorage.setItem(STORAGE_KEYS.PARTNER_DATA, JSON.stringify(partnerData));
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, res.token);
        router.replace('/(tabs)');
      } else {
        setErrors({ otp: res.message || 'Invalid OTP' });
      }
    } catch {
      setErrors({ otp: 'Verification failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await sendOTP(mobile);
      startCountdown();
      setErrors({});
    } finally {
      setLoading(false);
    }
  };

  const tr = (key: Parameters<typeof t>[1]) => t(selectedLang, key);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <Text style={styles.logoText}>ZENSURE</Text>
            <Text style={styles.tagline}>Income Protection for Delivery Partners</Text>
          </View>

          {/* Language Selector */}
          <View style={styles.langSection}>
            <Text style={styles.sectionLabel}>{tr('selectLanguage')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.langScroll}>
              {LANGUAGES.map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.langChip,
                    selectedLang === lang.code && styles.langChipActive,
                  ]}
                  onPress={() => setSelectedLang(lang.code)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.langChipText,
                      selectedLang === lang.code && styles.langChipTextActive,
                    ]}
                  >
                    {lang.nativeLabel}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Platform Toggle */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Platform</Text>
            <View style={styles.platformRow}>
              <TouchableOpacity
                style={[
                  styles.platformBtn,
                  platform === 'zomato' && styles.platformBtnZomatoActive,
                ]}
                onPress={() => setPlatform('zomato')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.platformBtnText,
                    platform === 'zomato' && styles.platformBtnTextActive,
                  ]}
                >
                  🔴 Zomato
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.platformBtn,
                  platform === 'swiggy' && styles.platformBtnSwiggyActive,
                ]}
                onPress={() => setPlatform('swiggy')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.platformBtnText,
                    platform === 'swiggy' && styles.platformBtnTextActive,
                  ]}
                >
                  🟠 Swiggy
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Partner ID */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{tr('partnerID')}</Text>
            <View
              style={[
                styles.inputContainer,
                focusedField === 'partnerId' && styles.inputFocused,
                errors.partnerId ? styles.inputError : null,
              ]}
            >
              <Ionicons name="id-card-outline" size={18} color={ZENSURE_COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. ZM123456"
                placeholderTextColor={ZENSURE_COLORS.textSecondary}
                value={partnerId}
                onChangeText={setPartnerId}
                onFocus={() => setFocusedField('partnerId')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="characters"
              />
            </View>
            {errors.partnerId ? <Text style={styles.errorText}>{errors.partnerId}</Text> : null}
          </View>

          {/* City Selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{tr('city')}</Text>
            <TouchableOpacity
              style={[
                styles.inputContainer,
                errors.city ? styles.inputError : null,
              ]}
              onPress={() => setCityModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="location-outline" size={18} color={ZENSURE_COLORS.textSecondary} style={styles.inputIcon} />
              <Text style={[styles.textInput, !selectedCity && styles.placeholderText]}>
                {selectedCity || 'Choose your city'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={ZENSURE_COLORS.textSecondary} />
            </TouchableOpacity>
            {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
          </View>

          {/* Delivery Zone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{tr('zone')}</Text>
            <View
              style={[
                styles.inputContainer,
                focusedField === 'zone' && styles.inputFocused,
                errors.zone ? styles.inputError : null,
              ]}
            >
              <Ionicons name="map-outline" size={18} color={ZENSURE_COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Koramangala"
                placeholderTextColor={ZENSURE_COLORS.textSecondary}
                value={zone}
                onChangeText={setZone}
                onFocus={() => setFocusedField('zone')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {errors.zone ? <Text style={styles.errorText}>{errors.zone}</Text> : null}
          </View>

          {/* Mobile Number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mobile Number</Text>
            <View
              style={[
                styles.inputContainer,
                focusedField === 'mobile' && styles.inputFocused,
                errors.mobile ? styles.inputError : null,
              ]}
            >
              <View style={styles.mobilePrefix}>
                <Text style={styles.mobilePrefixText}>+91</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="10-digit number"
                placeholderTextColor={ZENSURE_COLORS.textSecondary}
                value={mobile}
                onChangeText={text => setMobile(text.replace(/\D/g, '').slice(0, 10))}
                keyboardType="phone-pad"
                maxLength={10}
                onFocus={() => setFocusedField('mobile')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {errors.mobile ? <Text style={styles.errorText}>{errors.mobile}</Text> : null}
          </View>

          {/* OTP Section */}
          {otpSent && (
            <View style={styles.otpSection}>
              <View style={styles.otpSentBanner}>
                <Ionicons name="checkmark-circle" size={16} color={ZENSURE_COLORS.success} />
                <Text style={styles.otpSentText}>
                  {tr('otpSent')} +91 {mobile}
                </Text>
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{tr('enterOTP')}</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'otp' && styles.inputFocused,
                    errors.otp ? styles.inputError : null,
                  ]}
                >
                  <Ionicons name="key-outline" size={18} color={ZENSURE_COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, styles.otpInput]}
                    placeholder="• • • • • •"
                    placeholderTextColor={ZENSURE_COLORS.textSecondary}
                    value={otp}
                    onChangeText={text => setOtp(text.replace(/\D/g, '').slice(0, 6))}
                    keyboardType="number-pad"
                    maxLength={6}
                    onFocus={() => setFocusedField('otp')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity onPress={handleResendOTP} disabled={countdown > 0}>
                    <Text style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>
                      {countdown > 0 ? `Resend (${countdown}s)` : 'Resend'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.otp ? <Text style={styles.errorText}>{errors.otp}</Text> : null}
              </View>
              <Text style={styles.demoHint}>Demo: Use OTP 123456</Text>
            </View>
          )}

          {errors.general ? (
            <Text style={[styles.errorText, styles.generalError]}>{errors.general}</Text>
          ) : null}

          {/* CTA Button */}
          <TouchableOpacity
            style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
            onPress={otpSent ? handleVerifyOTP : handleSendOTP}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.ctaButtonText}>
                {otpSent ? tr('verifyOTP') : tr('sendOTP')}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomPad} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* City Modal */}
      <Modal
        visible={cityModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCityModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setCityModalVisible(false)}
        />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Select City</Text>
          <FlatList
            data={CITIES}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.cityItem,
                  selectedCity === item && styles.cityItemSelected,
                ]}
                onPress={() => {
                  setSelectedCity(item);
                  setCityModalVisible(false);
                  setErrors(prev => ({ ...prev, city: '' }));
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="location"
                  size={18}
                  color={selectedCity === item ? ZENSURE_COLORS.primary : ZENSURE_COLORS.textSecondary}
                />
                <Text style={[styles.cityItemText, selectedCity === item && styles.cityItemTextSelected]}>
                  {item}
                </Text>
                {selectedCity === item && (
                  <Ionicons name="checkmark" size={18} color={ZENSURE_COLORS.primary} style={styles.cityCheck} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ZENSURE_COLORS.bg,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 32,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: ZENSURE_COLORS.primary,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 14,
    color: ZENSURE_COLORS.textSecondary,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  langSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: ZENSURE_COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  langScroll: {
    flexDirection: 'row',
  },
  langChip: {
    borderWidth: 1.5,
    borderColor: ZENSURE_COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: ZENSURE_COLORS.surface,
  },
  langChipActive: {
    backgroundColor: ZENSURE_COLORS.primary,
    borderColor: ZENSURE_COLORS.primary,
  },
  langChipText: {
    fontSize: 14,
    color: ZENSURE_COLORS.textSecondary,
    fontWeight: '500',
  },
  langChipTextActive: {
    color: ZENSURE_COLORS.white,
    fontWeight: '700',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: ZENSURE_COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  platformRow: {
    flexDirection: 'row',
    gap: 12,
  },
  platformBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: ZENSURE_COLORS.border,
    alignItems: 'center',
    backgroundColor: ZENSURE_COLORS.surface,
  },
  platformBtnZomatoActive: {
    borderColor: ZENSURE_COLORS.zomato,
    backgroundColor: 'rgba(226, 55, 68, 0.15)',
  },
  platformBtnSwiggyActive: {
    borderColor: ZENSURE_COLORS.swiggy,
    backgroundColor: 'rgba(252, 128, 25, 0.15)',
  },
  platformBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: ZENSURE_COLORS.textSecondary,
  },
  platformBtnTextActive: {
    color: ZENSURE_COLORS.white,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ZENSURE_COLORS.surface,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: ZENSURE_COLORS.border,
    paddingHorizontal: 12,
    minHeight: 52,
  },
  inputFocused: {
    borderColor: ZENSURE_COLORS.primary,
  },
  inputError: {
    borderColor: ZENSURE_COLORS.error,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: ZENSURE_COLORS.white,
    paddingVertical: 14,
  },
  placeholderText: {
    color: ZENSURE_COLORS.textSecondary,
  },
  mobilePrefix: {
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: ZENSURE_COLORS.border,
    marginRight: 10,
  },
  mobilePrefixText: {
    fontSize: 15,
    color: ZENSURE_COLORS.white,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: ZENSURE_COLORS.error,
    marginTop: 4,
  },
  generalError: {
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
  otpSection: {
    marginTop: 4,
  },
  otpSentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ZENSURE_COLORS.successDim,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    gap: 8,
  },
  otpSentText: {
    fontSize: 13,
    color: ZENSURE_COLORS.success,
    flex: 1,
  },
  otpInput: {
    letterSpacing: 8,
    fontWeight: '700',
    fontSize: 18,
  },
  resendText: {
    fontSize: 13,
    color: ZENSURE_COLORS.primary,
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: ZENSURE_COLORS.textSecondary,
  },
  demoHint: {
    fontSize: 12,
    color: ZENSURE_COLORS.warning,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  ctaButton: {
    backgroundColor: ZENSURE_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: ZENSURE_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: ZENSURE_COLORS.white,
    letterSpacing: 0.5,
  },
  bottomPad: {
    height: 32,
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    backgroundColor: ZENSURE_COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: ZENSURE_COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ZENSURE_COLORS.white,
    marginBottom: 16,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
    gap: 12,
  },
  cityItemSelected: {
    backgroundColor: ZENSURE_COLORS.primaryDim,
  },
  cityItemText: {
    flex: 1,
    fontSize: 15,
    color: ZENSURE_COLORS.textSecondary,
    fontWeight: '500',
  },
  cityItemTextSelected: {
    color: ZENSURE_COLORS.primary,
    fontWeight: '700',
  },
  cityCheck: {
    marginLeft: 'auto',
  },
});

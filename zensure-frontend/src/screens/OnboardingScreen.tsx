import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CITIES, CITY_ZONES, ERROR_CARD, LANGUAGES, ZENSURE_COLORS } from '../utils/constants';
import { useLanguage } from '../utils/LanguageContext';
import { Language } from '../utils/translations';
import { registerWorker, sendOTP, verifyOTP } from '../services/api';
import { saveToken, saveWorker } from '../services/auth';
import {
  validateUPI,
  validateMobile,
  validatePartnerId,
  validateOnboardingForm,
} from '../utils/validation';

type Step = 'register' | 'otp';

export default function OnboardingScreen() {
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const otpInputRef = useRef<TextInput>(null);
  const [step, setStep] = useState<Step>('register');
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [zoneModalVisible, setZoneModalVisible] = useState(false);
  const [selectedLang, setSelectedLang] = useState(
    LANGUAGES.find(item => item.backendLabel === language) || LANGUAGES[0]
  );
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    partner_id: '',
    city: '',
    zone: '',
    upi_id: '',
  });
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [registerError, setRegisterError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);

  const availableZones = useMemo(
    () => (form.city ? CITY_ZONES[form.city] || [] : []),
    [form.city]
  );

  useEffect(() => {
    if (step !== 'otp') {
      return;
    }

    otpInputRef.current?.focus();
    void handleSendOtp();
  }, [step]);

  useEffect(() => {
    if (step !== 'otp' || resendCountdown <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setResendCountdown(value => value - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCountdown, step]);

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setRegisterError('');
  };

  const handleMobileChange = (text: string) => {
    const value = text.replace(/\D/g, '').slice(0, 10);
    updateForm('mobile', value);

    if (value) {
      const validation = validateMobile(value, {
        required: t('mobileRequired'),
        invalid: t('mobileRequired'),
      });
      setFormErrors(prev => ({ ...prev, mobile: validation.error || '' }));
      return;
    }

    setFormErrors(prev => ({ ...prev, mobile: '' }));
  };

  const handlePartnerIdChange = (text: string) => {
    const value = text.toUpperCase();
    updateForm('partner_id', value);

    if (value) {
      const validation = validatePartnerId(value, {
        required: t('partnerRequired'),
        invalid: t('partnerRequired'),
      });
      setFormErrors(prev => ({ ...prev, partnerId: validation.error || '' }));
      return;
    }

    setFormErrors(prev => ({ ...prev, partnerId: '' }));
  };

  const handleZoneChange = (text: string) => {
    updateForm('zone', text);
    setFormErrors(prev => ({ ...prev, zone: text.trim() ? '' : t('zoneRequired') }));
  };

  const handleUPIChange = (text: string) => {
    updateForm('upi_id', text);
    if (text) {
      const validation = validateUPI(text, {
        required: t('upiRequired'),
        invalid: t('upiRequired'),
      });
      if (validation.error) {
        setFormErrors(prev => ({
          ...prev,
          upiId: validation.error,
        }));
      } else {
        setFormErrors(prev => ({
          ...prev,
          upiId: '',
        }));
      }
    } else {
      setFormErrors(prev => ({
        ...prev,
        upiId: '',
      }));
    }
  };

  const showOtpShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const getApiError = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.error || fallback;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return fallback;
  };

  const handleRegister = async () => {
    const validation = validateOnboardingForm({
      name: form.name,
      mobile: form.mobile,
      partnerId: form.partner_id,
      city: form.city,
      zone: form.zone,
      upiId: form.upi_id,
    }, {
      nameRequired: t('nameRequired'),
      mobileRequired: t('mobileRequired'),
      mobileInvalid: t('mobileRequired'),
      partnerRequired: t('partnerRequired'),
      partnerInvalid: t('partnerRequired'),
      cityRequired: t('cityRequired'),
      zoneRequired: t('zoneRequired'),
      upiRequired: t('upiRequired'),
      upiInvalid: t('upiRequired'),
    });

    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    setLoading(true);
    setRegisterError('');

    try {
      await registerWorker({
        ...form,
        language: selectedLang.backendLabel,
      });
      setStep('otp');
      setResendCountdown(30);
    } catch (error) {
      setRegisterError(getApiError(error, t('couldNotConnect')));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setOtpError('');

    try {
      const response = await sendOTP(form.mobile);
      setDemoOtp(response.data.otp);
      setResendCountdown(30);
    } catch (error) {
      setOtpError(getApiError(error, t('couldNotConnect')));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setOtpError('');

    try {
      const response = await verifyOTP(form.mobile, otp);
      await saveToken(response.data.token);
      await saveWorker(response.data.worker);
      router.replace('/(tabs)');
    } catch {
      setOtpError(t('invalidOtpTryAgain'));
      showOtpShake();
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = async (lang: Language) => {
    const next = LANGUAGES.find(item => item.backendLabel === lang);
    if (!next) {
      return;
    }
    setSelectedLang(next);
    await setLanguage(lang);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandBlock}>
            <Text style={styles.brandTitle}>ZENSURE</Text>
            <Text style={styles.brandSubtitle}>{t('appSubtitle')}</Text>
          </View>

          <Text style={styles.sectionLabel}>{t('language')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.langRow}>
            {LANGUAGES.map(item => (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.langChip,
                  selectedLang.code === item.code && styles.langChipActive,
                ]}
                activeOpacity={0.7}
                onPress={() => handleLanguageSelect(item.backendLabel as Language)}
              >
                <Text
                  style={[
                    styles.langChipText,
                    selectedLang.code === item.code && styles.langChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {step === 'register' ? (
            <>
              <FormField
                icon="person-outline"
                placeholder={t('fullName')}
                value={form.name}
                onChangeText={value => {
                  updateForm('name', value);
                  setFormErrors(prev => ({ ...prev, name: value.trim() ? '' : t('nameRequired') }));
                }}
                error={formErrors.name}
              />
              <FormField
                icon="call-outline"
                placeholder={t('mobileNumber')}
                value={form.mobile}
                onChangeText={handleMobileChange}
                error={formErrors.mobile}
                keyboardType="phone-pad"
              />
              <FormField
                icon="id-card-outline"
                placeholder={t('partnerId')}
                value={form.partner_id}
                onChangeText={handlePartnerIdChange}
                error={formErrors.partnerId}
              />
              <SelectField
                icon="business-outline"
                placeholder={t('selectCity')}
                value={form.city}
                error={formErrors.city}
                onPress={() => setCityModalVisible(true)}
              />
              <SelectField
                icon="map-outline"
                placeholder={t('selectZone')}
                value={form.zone}
                error={formErrors.zone}
                onPress={() => setZoneModalVisible(true)}
                onChangeText={handleZoneChange}
              />
              <FormField
                icon="wallet-outline"
                placeholder="ravi.kumar@upi"
                value={form.upi_id}
                onChangeText={handleUPIChange}
                error={formErrors.upiId}
                autoCapitalize="none"
                showValidationAccent
              />

              {registerError ? (
                <View style={styles.errorCard}>
                  <Text style={styles.errorCardText}>{registerError}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                activeOpacity={0.8}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FF6B00" />
                ) : (
                  <Text style={styles.primaryButtonText}>{t('submit')}</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardText}>
                  {t('demoOtp')} {demoOtp || t('demoPending')}
                </Text>
              </View>

              <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                <FormField
                  icon="key-outline"
                  placeholder={t('enterOtp')}
                  value={otp}
                  onChangeText={value => {
                    setOtp(value.replace(/\D/g, '').slice(0, 6));
                    setOtpError('');
                  }}
                  error={otpError}
                  keyboardType="number-pad"
                  autoFocus
                  maxLength={6}
                  inputRef={otpInputRef}
                />
              </Animated.View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                activeOpacity={0.8}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FF6B00" />
                ) : (
                  <Text style={styles.primaryButtonText}>{t('verifyContinue')}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={resendCountdown === 0 && !sendingOtp ? 0.7 : 1}
                disabled={resendCountdown !== 0 || sendingOtp}
                onPress={handleSendOtp}
                style={styles.resendWrap}
              >
                {sendingOtp ? (
                  <ActivityIndicator color="#FF6B00" />
                ) : (
                  <Text style={styles.resendText}>
                    {resendCountdown === 0
                      ? t('resendOtp')
                      : `${t('resendOtp')} in ${resendCountdown}s`}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <SelectionModal
        visible={cityModalVisible}
        title={t('chooseCity')}
        items={CITIES}
        selected={form.city}
        onClose={() => setCityModalVisible(false)}
        onSelect={item => {
          updateForm('city', item);
          updateForm('zone', CITY_ZONES[item]?.[0] || '');
          setFormErrors(prev => ({ ...prev, city: '', zone: '' }));
          setCityModalVisible(false);
        }}
      />

      <SelectionModal
        visible={zoneModalVisible}
        title={t('chooseZone')}
        items={availableZones}
        selected={form.zone}
        onClose={() => setZoneModalVisible(false)}
        onSelect={item => {
          updateForm('zone', item);
          setFormErrors(prev => ({ ...prev, zone: '' }));
          setZoneModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

function FormField({
  icon,
  placeholder,
  value,
  onChangeText,
  error,
  keyboardType,
  autoCapitalize,
  autoFocus,
  maxLength,
  inputRef,
  showValidationAccent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  keyboardType?: 'default' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoFocus?: boolean;
  maxLength?: number;
  inputRef?: React.RefObject<TextInput | null>;
  showValidationAccent?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <View
        style={[
          styles.inputWrap,
          error && styles.inputWrapError,
          showValidationAccent && {
            borderColor: error ? '#FF3D00' : '#FF6B00',
            borderBottomWidth: 2,
          },
        ]}
      >
        <Ionicons name={icon} size={18} color={ZENSURE_COLORS.textSecondary} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={ZENSURE_COLORS.textSecondary}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoFocus={autoFocus}
          maxLength={maxLength}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function SelectField({
  icon,
  placeholder,
  value,
  error,
  onPress,
  onChangeText,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  error?: string;
  onPress: () => void;
  onChangeText?: (value: string) => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      {onChangeText ? (
        <View style={[styles.inputWrap, error && styles.inputWrapError]}>
          <Ionicons name={icon} size={18} color={ZENSURE_COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={ZENSURE_COLORS.textSecondary}
            value={value}
            onChangeText={onChangeText}
          />
          <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
            <Ionicons name="chevron-down" size={16} color={ZENSURE_COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.inputWrap, error && styles.inputWrapError]}
          activeOpacity={0.7}
          onPress={onPress}
        >
          <Ionicons name={icon} size={18} color={ZENSURE_COLORS.textSecondary} />
          <Text style={[styles.input, !value && styles.placeholderText]}>{value || placeholder}</Text>
          <Ionicons name="chevron-down" size={16} color={ZENSURE_COLORS.textSecondary} />
        </TouchableOpacity>
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function SelectionModal({
  visible,
  title,
  items,
  selected,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  items: string[];
  selected: string;
  onClose: () => void;
  onSelect: (item: string) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.modalSheet}>
        <Text style={styles.modalTitle}>{title}</Text>
        <FlatList
          data={items}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.modalItem} activeOpacity={0.7} onPress={() => onSelect(item)}>
              <Text style={[styles.modalItemText, selected === item && styles.modalItemTextActive]}>
                {item}
              </Text>
              {selected === item ? (
                <Ionicons name="checkmark" size={18} color={ZENSURE_COLORS.primary} />
              ) : null}
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
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
    paddingTop: 32,
    paddingBottom: 40,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandTitle: {
    color: ZENSURE_COLORS.primary,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 4,
  },
  brandSubtitle: {
    marginTop: 8,
    color: ZENSURE_COLORS.textSecondary,
    fontSize: 14,
  },
  sectionLabel: {
    color: ZENSURE_COLORS.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 10,
  },
  langRow: {
    marginBottom: 20,
  },
  langChip: {
    backgroundColor: ZENSURE_COLORS.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: ZENSURE_COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  langChipActive: {
    borderColor: ZENSURE_COLORS.primary,
    backgroundColor: ZENSURE_COLORS.primaryDim,
  },
  langChipText: {
    color: ZENSURE_COLORS.textSecondary,
    fontWeight: '600',
  },
  langChipTextActive: {
    color: ZENSURE_COLORS.primary,
  },
  fieldWrap: {
    marginBottom: 14,
  },
  inputWrap: {
    minHeight: 54,
    backgroundColor: ZENSURE_COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ZENSURE_COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  inputWrapError: {
    borderColor: ZENSURE_COLORS.error,
  },
  input: {
    flex: 1,
    color: ZENSURE_COLORS.white,
    fontSize: 15,
    paddingVertical: 14,
  },
  placeholderText: {
    color: ZENSURE_COLORS.textSecondary,
  },
  errorText: {
    color: ZENSURE_COLORS.error,
    marginTop: 6,
    fontSize: 12,
  },
  errorCard: {
    backgroundColor: ERROR_CARD.backgroundColor,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorCardText: {
    color: ERROR_CARD.color,
    fontSize: 13,
  },
  infoCard: {
    backgroundColor: '#1A0A00',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,107,0,0.25)',
  },
  infoCardText: {
    color: ZENSURE_COLORS.primary,
    fontWeight: '700',
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: ZENSURE_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: ZENSURE_COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  resendWrap: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    color: ZENSURE_COLORS.textSecondary,
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    maxHeight: '55%',
    backgroundColor: ZENSURE_COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    color: ZENSURE_COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  modalItem: {
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: ZENSURE_COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalItemText: {
    color: ZENSURE_COLORS.white,
    fontSize: 15,
  },
  modalItemTextActive: {
    color: ZENSURE_COLORS.primary,
    fontWeight: '700',
  },
});

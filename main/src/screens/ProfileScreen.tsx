import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivePolicy, Worker, getProfile, updateProfile } from '../services/api';
import { clearAuth, saveWorker } from '../services/auth';
import { useLanguage } from '../utils/LanguageContext';
import { Language } from '../utils/translations';
import { ERROR_CARD, ZENSURE_COLORS } from '../utils/constants';

function formatCurrency(value: number | string) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

const languages: { code: Language; label: string; native: string; flag: string }[] = [
  { code: 'English', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'Hindi', label: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { code: 'Tamil', label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'Telugu', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
];

export default function ProfileScreen() {
  const { language, setLanguage, t } = useLanguage();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [policy, setPolicy] = useState<ActivePolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [upiModalVisible, setUpiModalVisible] = useState(false);
  const [upiDraft, setUpiDraft] = useState('');
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const getApiError = (loadError: unknown, fallback: string) => {
    if (axios.isAxiosError(loadError)) {
      return loadError.response?.data?.error || fallback;
    }
    if (loadError instanceof Error) {
      return loadError.message;
    }
    return fallback;
  };

  const loadProfile = async () => {
    try {
      setError('');
      const response = await getProfile();
      setWorker(response.data.worker);
      setPolicy(response.data.active_policy);
      setUpiDraft(response.data.worker.upi_id);
    } catch (loadError) {
      setError(getApiError(loadError, t('couldNotConnect')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const persistWorker = async (nextWorker: Worker) => {
    setWorker(nextWorker);
    await saveWorker(nextWorker);
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 1800);
  };

  const handleLanguageChange = async (selectedLang: Language) => {
    if (!worker) {
      return;
    }

    const previousLanguage = language;
    setSaving('language');
    setError('');

    try {
      await setLanguage(selectedLang);
      const response = await updateProfile({ language: selectedLang });
      await persistWorker(response.data.worker);
      setLanguageModalVisible(false);
      showToast(t('languageUpdated'));
    } catch (updateError) {
      await setLanguage(previousLanguage);
      setError(getApiError(updateError, t('couldNotConnect')));
    } finally {
      setSaving('');
    }
  };

  const handleUpiSave = async () => {
    if (!worker) {
      return;
    }

    setSaving('upi');
    try {
      const response = await updateProfile({ upi_id: upiDraft });
      await persistWorker(response.data.worker);
      setUpiModalVisible(false);
      showToast(t('upiUpdated'));
    } catch (updateError) {
      setError(getApiError(updateError, t('couldNotConnect')));
    } finally {
      setSaving('');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      </SafeAreaView>
    );
  }

  if (!worker) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <View style={styles.errorCard}>
            <Text style={styles.errorCardText}>{error || t('profileUnavailable')}</Text>
          </View>
          <TouchableOpacity style={styles.retryButton} activeOpacity={0.8} onPress={loadProfile}>
            <Text style={styles.retryButtonText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {worker.name
                .split(' ')
                .map(part => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{worker.name}</Text>
          <Text style={styles.meta}>
            {worker.partner_id} · {worker.city}, {worker.zone}
          </Text>
          <Text style={styles.meta}>{worker.upi_id}</Text>
        </View>

        {toast ? (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorCardText}>{error}</Text>
          </View>
        ) : null}

        {policy ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('currentCoverage')}</Text>
            <Text style={styles.sectionValue}>
              {policy.plan} {t('policyShield')}
            </Text>
            <Text style={styles.sectionMeta}>
              {formatCurrency(policy.premium_amount)} / {t('week')} · {t('maxPayout')}{' '}
              {formatCurrency(policy.max_payout)}
            </Text>
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('settings')}</Text>

          <SettingsRow
            icon="language-outline"
            label={t('languagePreference')}
            value={language}
            onPress={() => setLanguageModalVisible(true)}
          />
          <SettingsRow
            icon="notifications-outline"
            label={t('notifications')}
            rightContent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#3A3A3A', true: 'rgba(255,107,0,0.35)' }}
                thumbColor={notificationsEnabled ? '#FF6B00' : '#B8B8B8'}
              />
            }
          />
          <SettingsRow
            icon="location-outline"
            label={t('deliveryZone')}
            value={`${worker.zone}, ${worker.city}`}
          />
          <SettingsRow
            icon="card-outline"
            label={t('upiId')}
            value={worker.upi_id}
            onPress={() => setUpiModalVisible(true)}
          />
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={async () => {
            await clearAuth();
            router.replace('/onboarding');
          }}
        >
          <Text style={styles.logoutText}>{t('signOut')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={languageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t('chooseLanguage')}</Text>
            {languages.map(item => (
              <TouchableOpacity
                key={item.code}
                style={styles.modalRow}
                activeOpacity={0.7}
                onPress={() => handleLanguageChange(item.code)}
              >
                <View style={styles.languageRowLeft}>
                  <Text style={styles.flag}>{item.flag}</Text>
                  <View>
                    <Text style={styles.modalRowText}>{item.native}</Text>
                    <Text style={styles.languageEnglish}>{item.label}</Text>
                  </View>
                </View>
                {language === item.code ? (
                  saving === 'language' ? (
                    <ActivityIndicator color="#FF6B00" />
                  ) : (
                    <Ionicons name="checkmark" size={18} color="#FF6B00" />
                  )
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal
        visible={upiModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUpiModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('updateUpiId')}</Text>
            <TextInput
              style={styles.input}
              value={upiDraft}
              onChangeText={setUpiDraft}
              autoCapitalize="none"
              placeholder={t('upiId')}
              placeholderTextColor={ZENSURE_COLORS.textSecondary}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.7}
                onPress={() => setUpiModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                activeOpacity={0.8}
                onPress={handleUpiSave}
                disabled={saving === 'upi'}
              >
                {saving === 'upi' ? (
                  <ActivityIndicator color="#FF6B00" />
                ) : (
                  <Text style={styles.confirmButtonText}>{t('save')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  rightContent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  rightContent?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={styles.settingsRow}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingsLeft}>
        <Ionicons name={icon} size={20} color={ZENSURE_COLORS.white} />
        <Text style={styles.settingsLabel}>{label}</Text>
      </View>
      <View style={styles.settingsRight}>
        {value ? <Text style={styles.settingsValue}>{value}</Text> : null}
        {rightContent}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ZENSURE_COLORS.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 14,
  },
  headerCard: {
    backgroundColor: ZENSURE_COLORS.surface,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    color: ZENSURE_COLORS.white,
    fontSize: 28,
    fontWeight: '800',
  },
  name: {
    color: ZENSURE_COLORS.white,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  meta: {
    color: ZENSURE_COLORS.textSecondary,
    marginBottom: 4,
  },
  sectionCard: {
    backgroundColor: ZENSURE_COLORS.surface,
    borderRadius: 18,
    padding: 18,
  },
  sectionTitle: {
    color: ZENSURE_COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  sectionValue: {
    color: ZENSURE_COLORS.primary,
    fontWeight: '800',
    fontSize: 20,
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  sectionMeta: {
    color: ZENSURE_COLORS.textSecondary,
  },
  settingsRow: {
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: ZENSURE_COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  settingsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: '50%',
  },
  settingsLabel: {
    color: ZENSURE_COLORS.white,
    fontSize: 15,
  },
  settingsValue: {
    color: ZENSURE_COLORS.textSecondary,
    textAlign: 'right',
  },
  errorCard: {
    backgroundColor: ERROR_CARD.backgroundColor,
    borderRadius: 12,
    padding: 12,
  },
  errorCardText: {
    color: ERROR_CARD.color,
  },
  retryButton: {
    backgroundColor: ZENSURE_COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: ZENSURE_COLORS.white,
    fontWeight: '800',
  },
  toast: {
    backgroundColor: '#0D2B0D',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#00C853',
  },
  toastText: {
    color: '#00C853',
    fontWeight: '700',
  },
  logoutButton: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: '#2B0000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF3D00',
  },
  logoutText: {
    color: '#FF3D00',
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: ZENSURE_COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 28,
  },
  modalCard: {
    margin: 20,
    marginTop: 'auto',
    backgroundColor: ZENSURE_COLORS.surface,
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    color: ZENSURE_COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  modalRow: {
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: ZENSURE_COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flag: {
    fontSize: 22,
  },
  modalRowText: {
    color: ZENSURE_COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  languageEnglish: {
    color: ZENSURE_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  input: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: ZENSURE_COLORS.surface,
    borderWidth: 1,
    borderColor: ZENSURE_COLORS.border,
    color: ZENSURE_COLORS.white,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ZENSURE_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: ZENSURE_COLORS.textSecondary,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: ZENSURE_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: ZENSURE_COLORS.white,
    fontWeight: '800',
  },
});

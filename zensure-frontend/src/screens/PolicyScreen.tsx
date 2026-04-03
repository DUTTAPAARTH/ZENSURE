import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { activatePolicy, getPlans, PolicyPlan, Worker } from '../services/api';
import { getWorker } from '../services/auth';
import { useLanguage } from '../utils/LanguageContext';
import { ERROR_CARD, ZENSURE_COLORS } from '../utils/constants';

function formatCurrency(value: number | string) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export default function PolicyScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [plans, setPlans] = useState<PolicyPlan[]>([]);
  const [zoneRisk, setZoneRisk] = useState({ score: 0, label: 'LOW', season: 'Normal' });
  const [selectedPlan, setSelectedPlan] = useState<PolicyPlan | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
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

  const loadPlans = async () => {
    try {
      setError('');
      const storedWorker = await getWorker<Worker>();
      if (!storedWorker) {
        throw new Error('Worker details not found. Please sign in again.');
      }

      setWorker(storedWorker);
      const response = await getPlans(storedWorker.city, storedWorker.zone);
      setPlans(response.data.plans);
      setZoneRisk(response.data.zone_risk);
      setSelectedPlan(response.data.plans[1] || response.data.plans[0] || null);
    } catch (loadError) {
      setError(getApiError(loadError, t('couldNotConnect')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPlans();
  }, []);

  const handleActivate = async () => {
    if (!worker || !selectedPlan) {
      return;
    }

    setActivating(true);
    setModalError('');

    try {
      await activatePolicy(selectedPlan.id, worker.city, worker.zone);
      setConfirmVisible(false);
      setToast(t('coverageActivated'));
      setTimeout(() => {
        setToast('');
        router.replace('/(tabs)');
      }, 2000);
    } catch (activateError) {
      setModalError(getApiError(activateError, t('couldNotConnect')));
    } finally {
      setActivating(false);
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

  if (error && plans.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <View style={styles.errorCard}>
            <Text style={styles.errorCardText}>{error}</Text>
          </View>
          <TouchableOpacity style={styles.retryButton} activeOpacity={0.8} onPress={loadPlans}>
            <Text style={styles.retryButtonText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t('chooseYourCover')}</Text>
        <Text style={styles.subtitle}>
          {worker?.zone}, {worker?.city}
        </Text>

        <View style={styles.zoneRiskBadge}>
          <Text style={styles.zoneRiskText}>
            {zoneRisk.label} · {zoneRisk.score.toFixed(2)} · {zoneRisk.season}
          </Text>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorCardText}>{error}</Text>
          </View>
        ) : null}

        {plans.map(plan => {
          const active = selectedPlan?.id === plan.id;

          return (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, active && styles.planCardActive]}
              activeOpacity={0.8}
              onPress={() => setSelectedPlan(plan)}
            >
              <View style={styles.planHeader}>
                <View>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPrice}>
                    {formatCurrency(plan.adjusted_price)}
                    {t('perWeek')}
                  </Text>
                </View>
                <Text style={styles.planCoverage}>{plan.coverage_percent}%</Text>
              </View>
              <Text style={styles.planMeta}>
                {t('maxPayout')} {formatCurrency(plan.max_payout)}
              </Text>
              <View style={styles.featuresWrap}>
                {plan.features.map(feature => (
                  <Text key={feature} style={styles.featureText}>
                    • {feature}
                  </Text>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.activateButton, active && styles.activateButtonActive]}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedPlan(plan);
                  setConfirmVisible(true);
                }}
              >
                <Text style={styles.activateButtonText}>{t('activate')}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('confirmActivation')}</Text>
            <Text style={styles.modalBody}>
              {t('confirmActivateFor')} {selectedPlan?.name} {worker?.zone}, {worker?.city}.{' '}
              {formatCurrency(selectedPlan?.adjusted_price || 0)} {t('confirmBody')}
            </Text>
            {modalError ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorCardText}>{modalError}</Text>
              </View>
            ) : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.7}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                activeOpacity={0.8}
                onPress={handleActivate}
                disabled={activating}
              >
                {activating ? (
                  <ActivityIndicator color="#FF6B00" />
                ) : (
                  <Text style={styles.confirmButtonText}>{t('confirm')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 14,
  },
  title: {
    color: ZENSURE_COLORS.white,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: ZENSURE_COLORS.textSecondary,
    marginBottom: 14,
  },
  zoneRiskBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2B1500',
    borderColor: 'rgba(255,107,0,0.25)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  zoneRiskText: {
    color: ZENSURE_COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  errorCard: {
    backgroundColor: ERROR_CARD.backgroundColor,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    width: '100%',
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
  planCard: {
    backgroundColor: ZENSURE_COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ZENSURE_COLORS.border,
    padding: 18,
    marginBottom: 14,
  },
  planCardActive: {
    borderColor: ZENSURE_COLORS.primary,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  planName: {
    color: ZENSURE_COLORS.white,
    fontSize: 22,
    fontWeight: '800',
  },
  planPrice: {
    color: ZENSURE_COLORS.primary,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  planCoverage: {
    color: ZENSURE_COLORS.white,
    fontWeight: '800',
    fontSize: 20,
  },
  planMeta: {
    color: ZENSURE_COLORS.textSecondary,
    marginBottom: 10,
  },
  featuresWrap: {
    gap: 6,
    marginBottom: 14,
  },
  featureText: {
    color: ZENSURE_COLORS.white,
  },
  activateButton: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ZENSURE_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activateButtonActive: {
    backgroundColor: ZENSURE_COLORS.primary,
  },
  activateButtonText: {
    color: ZENSURE_COLORS.white,
    fontWeight: '800',
  },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    backgroundColor: '#00C853',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  toastText: {
    color: ZENSURE_COLORS.white,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: ZENSURE_COLORS.surface,
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    color: ZENSURE_COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalBody: {
    color: ZENSURE_COLORS.textSecondary,
    marginBottom: 14,
    lineHeight: 20,
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

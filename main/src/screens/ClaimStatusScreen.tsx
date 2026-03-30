import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import axios from 'axios';
import { Claim, getClaims, respondSoftHold } from '../services/api';
import { useLanguage } from '../utils/LanguageContext';
import { ERROR_CARD, STATUS_COLORS, ZENSURE_COLORS } from '../utils/constants';

function formatCurrency(value: number | null) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function getStatusLabel(status: string, t: (key: any) => string) {
  switch (status) {
    case 'paid':
      return t('paid');
    case 'processing':
      return t('processing');
    case 'soft_hold':
      return t('softHold');
    case 'hard_hold':
      return t('hardHold');
    case 'auto_approved':
      return 'AUTO APPROVED';
    default:
      return status.replace(/_/g, ' ').toUpperCase();
  }
}

export default function ClaimStatusScreen() {
  const { t } = useLanguage();
  const pulse = useRef(new Animated.Value(0.6)).current;
  const [activeClaims, setActiveClaims] = useState<Claim[]>([]);
  const [pastClaims, setPastClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const buildTimeline = (status: string) => [
    { label: t('triggerDetected'), state: 'done' },
    { label: t('fraudValidation'), state: 'done' },
    {
      label: t('payoutProcessing'),
      state:
        status === 'processing'
          ? 'active'
          : ['auto_approved', 'paid'].includes(status)
            ? 'done'
            : 'pending',
    },
    {
      label: t('payoutComplete'),
      state: status === 'paid' ? 'done' : 'pending',
    },
  ];

  const getApiError = (loadError: unknown, fallback: string) => {
    if (axios.isAxiosError(loadError)) {
      return loadError.response?.data?.error || fallback;
    }
    if (loadError instanceof Error) {
      return loadError.message;
    }
    return fallback;
  };

  const loadClaims = async () => {
    try {
      setError('');
      const response = await getClaims();
      const claims = response.data.claims;
      setActiveClaims(
        claims.filter(claim => claim.status !== 'paid' && claim.status !== 'rejected')
      );
      setPastClaims(
        claims.filter(claim => claim.status === 'paid' || claim.status === 'rejected')
      );
    } catch (loadError) {
      setError(getApiError(loadError, t('couldNotConnect')));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadClaims();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClaims();
  };

  const handleReping = async (claim: Claim) => {
    setActionLoading(`reping-${claim.id}`);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        throw new Error('Location permission denied');
      }

      const current = await Location.getCurrentPositionAsync({});
      await respondSoftHold(claim.id, 'repingLocation', {
        lat: current.coords.latitude,
        lng: current.coords.longitude,
      });
      await loadClaims();
    } catch (actionError) {
      setError(getApiError(actionError, t('couldNotConnect')));
    } finally {
      setActionLoading(null);
    }
  };

  const handleUploadPhoto = async (claim: Claim) => {
    setActionLoading(`upload-${claim.id}`);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Photo library permission denied');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: true,
      });

      if (!result.canceled) {
        await respondSoftHold(claim.id, 'uploadPhoto');
        await loadClaims();
      }
    } catch (actionError) {
      setError(getApiError(actionError, t('couldNotConnect')));
    } finally {
      setActionLoading(null);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={ZENSURE_COLORS.primary}
          />
        }
      >
        <Text style={styles.title}>{t('claimStatus')}</Text>
        <Text style={styles.subtitle}>{t('autoDetected')}</Text>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorCardText}>{error}</Text>
          </View>
        ) : null}

        {activeClaims.map(claim => (
          <View key={claim.id} style={styles.claimCard}>
            <View style={styles.claimHeader}>
              <View>
                <Text style={styles.claimTitle}>
                  {(claim.event_type || 'Disruption').replace(/_/g, ' ')}
                </Text>
                <Text style={styles.claimMeta}>
                  {claim.zone || t('unknownZone')} · {new Date(claim.created_at).toLocaleString('en-IN')}
                </Text>
              </View>
              <Text style={[styles.claimStatus, { color: STATUS_COLORS[claim.status] || '#FF6B00' }]}>
                {getStatusLabel(claim.status, t)}
              </Text>
            </View>

            <Text style={styles.claimAmount}>{formatCurrency(claim.payout_amount)}</Text>

            <View style={styles.timelineWrap}>
              {buildTimeline(claim.status).map(step => (
                <View key={step.label} style={styles.timelineRow}>
                  <Animated.View
                    style={[
                      styles.timelineDot,
                      step.state === 'done' && styles.timelineDotDone,
                      step.state === 'active' && { opacity: pulse, backgroundColor: '#FF6B00' },
                    ]}
                  />
                  <Text style={styles.timelineText}>{step.label}</Text>
                </View>
              ))}
            </View>

            {claim.status === 'soft_hold' ? (
              <View style={styles.actionCard}>
                <Text style={styles.actionTitle}>{t('actionNeeded')}</Text>
                <Text style={styles.actionText}>{t('softHoldHelp')}</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    activeOpacity={0.8}
                    onPress={() => handleReping(claim)}
                    disabled={actionLoading === `reping-${claim.id}`}
                  >
                    {actionLoading === `reping-${claim.id}` ? (
                      <ActivityIndicator color="#FF6B00" />
                    ) : (
                      <Text style={styles.secondaryButtonText}>{t('repingLocation')}</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    activeOpacity={0.8}
                    onPress={() => handleUploadPhoto(claim)}
                    disabled={actionLoading === `upload-${claim.id}`}
                  >
                    {actionLoading === `upload-${claim.id}` ? (
                      <ActivityIndicator color="#FF6B00" />
                    ) : (
                      <Text style={styles.primaryButtonText}>{t('uploadPhoto')}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {claim.status === 'hard_hold' ? (
              <View style={styles.hardHoldCard}>
                <Text style={styles.actionTitle}>{t('hardHold')}</Text>
                <Text style={styles.actionText}>{t('hardHoldHelp')}</Text>
              </View>
            ) : null}
          </View>
        ))}

        {pastClaims.length > 0 ? <Text style={styles.sectionTitle}>{t('pastClaims')}</Text> : null}

        {pastClaims.map(claim => (
          <View key={claim.id} style={styles.pastClaimRow}>
            <View>
              <Text style={styles.pastClaimTitle}>
                {(claim.event_type || 'Claim').replace(/_/g, ' ')}
              </Text>
              <Text style={styles.pastClaimMeta}>
                {new Date(claim.created_at).toLocaleDateString('en-IN')}
              </Text>
            </View>
            <View style={styles.pastClaimRight}>
              <Text style={styles.pastClaimAmount}>{formatCurrency(claim.payout_amount)}</Text>
              <Text style={[styles.pastClaimStatus, { color: STATUS_COLORS[claim.status] || '#FF6B00' }]}>
                {getStatusLabel(claim.status, t)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
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
    paddingBottom: 36,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: ZENSURE_COLORS.white,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: ZENSURE_COLORS.textSecondary,
    marginBottom: 16,
  },
  errorCard: {
    backgroundColor: ERROR_CARD.backgroundColor,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorCardText: {
    color: ERROR_CARD.color,
  },
  claimCard: {
    backgroundColor: ZENSURE_COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ZENSURE_COLORS.border,
    padding: 18,
    marginBottom: 14,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  claimTitle: {
    color: ZENSURE_COLORS.white,
    fontWeight: '800',
    fontSize: 18,
    textTransform: 'capitalize',
  },
  claimMeta: {
    color: ZENSURE_COLORS.textSecondary,
    marginTop: 4,
    fontSize: 12,
  },
  claimStatus: {
    textTransform: 'uppercase',
    fontWeight: '800',
    fontSize: 11,
  },
  claimAmount: {
    color: ZENSURE_COLORS.primary,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 14,
  },
  timelineWrap: {
    gap: 10,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#555555',
  },
  timelineDotDone: {
    backgroundColor: '#00C853',
  },
  timelineText: {
    color: ZENSURE_COLORS.textSecondary,
  },
  actionCard: {
    marginTop: 16,
    backgroundColor: '#2B1F00',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  hardHoldCard: {
    marginTop: 16,
    backgroundColor: '#2B0000',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FF3D00',
  },
  actionTitle: {
    color: ZENSURE_COLORS.white,
    fontWeight: '800',
    marginBottom: 6,
  },
  actionText: {
    color: ZENSURE_COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#FF6B00',
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: ZENSURE_COLORS.white,
    fontWeight: '800',
  },
  sectionTitle: {
    color: ZENSURE_COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 10,
  },
  pastClaimRow: {
    backgroundColor: ZENSURE_COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ZENSURE_COLORS.border,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pastClaimTitle: {
    color: ZENSURE_COLORS.white,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  pastClaimMeta: {
    color: ZENSURE_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  pastClaimRight: {
    alignItems: 'flex-end',
  },
  pastClaimAmount: {
    color: ZENSURE_COLORS.white,
    fontWeight: '800',
  },
  pastClaimStatus: {
    marginTop: 4,
    fontSize: 12,
    textTransform: 'capitalize',
  },
});

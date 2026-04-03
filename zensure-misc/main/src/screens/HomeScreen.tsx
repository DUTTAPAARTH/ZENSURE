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
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivePolicy,
  Claim,
  DisruptionEvent,
  Worker,
  getActiveDisruptions,
  getActivePolicy,
  getClaims,
  getProfile,
} from '../services/api';
import { useLanguage } from '../utils/LanguageContext';
import { ERROR_CARD, STATUS_COLORS, ZENSURE_COLORS } from '../utils/constants';

function formatCurrency(value: number | string) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function formatDateRange(start: string, end: string) {
  const startLabel = new Date(start).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  const endLabel = new Date(end).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  return `${startLabel} - ${endLabel}`;
}

function formatTimeAgo(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return `${Math.floor(diffHours / 24)}d ago`;
}

export default function HomeScreen() {
  const { t } = useLanguage();
  const router = useRouter();
  const shimmer = useRef(new Animated.Value(0.3)).current;
  const [worker, setWorker] = useState<Worker | null>(null);
  const [policy, setPolicy] = useState<ActivePolicy | null>(null);
  const [disruptions, setDisruptions] = useState<DisruptionEvent[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [zoneStatus, setZoneStatus] = useState<'green' | 'amber' | 'red'>('green');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmer]);

  const getApiError = (fetchError: unknown) => {
    if (axios.isAxiosError(fetchError)) {
      return fetchError.response?.data?.error || t('couldNotConnect');
    }
    if (fetchError instanceof Error) {
      return fetchError.message;
    }
    return t('couldNotConnect');
  };

  const loadData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      setError('');
      const profile = await getProfile();
      const currentWorker = profile.data.worker;
      const [activePolicyResponse, disruptionsResponse, claimsResponse] = await Promise.all([
        getActivePolicy(),
        getActiveDisruptions(currentWorker.city, currentWorker.zone),
        getClaims(),
      ]);

      setWorker(currentWorker);
      setPolicy(activePolicyResponse.data);
      setDisruptions(disruptionsResponse.data.disruptions);
      setZoneStatus(disruptionsResponse.data.zone_status);
      setClaims(claimsResponse.data.claims);
    } catch (fetchError) {
      setError(getApiError(fetchError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <ShimmerBlock shimmer={shimmer} height={82} />
          <ShimmerBlock shimmer={shimmer} height={140} />
          <ShimmerBlock shimmer={shimmer} height={130} />
          <View style={styles.statsRow}>
            <ShimmerBlock shimmer={shimmer} height={108} style={styles.statBlock} />
            <ShimmerBlock shimmer={shimmer} height={108} style={styles.statBlock} />
          </View>
          <ShimmerBlock shimmer={shimmer} height={150} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error && !worker) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <Ionicons name="wifi-outline" size={52} color={ZENSURE_COLORS.primary} />
          <Text style={styles.errorTitle}>{t('couldNotConnect')}</Text>
          <TouchableOpacity style={styles.retryButton} activeOpacity={0.8} onPress={() => loadData()}>
            <Text style={styles.retryButtonText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const primaryDisruption = disruptions[0];
  const earningsProtected = claims
    .filter(claim => claim.status === 'paid')
    .reduce((sum, claim) => sum + Number(claim.payout_amount || 0), 0);
  const recentClaims = [...claims]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <Text style={styles.headerEyebrow}>{t('welcomeBack')}</Text>
          <Text style={styles.headerName}>{worker?.name || 'Worker'}</Text>
          <Text style={styles.headerMeta}>
            {worker?.zone}, {worker?.city}
          </Text>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorCardText}>{error}</Text>
          </View>
        ) : null}

        {policy && policy.status === 'active' ? (
          <View style={[styles.bannerCard, styles.bannerActive]}>
            <Text style={styles.bannerTitle}>{t('coverageActive')}</Text>
            <Text style={styles.bannerText}>
              {policy.plan} {t('policyShield')} · {formatDateRange(policy.week_start, policy.week_end)}
            </Text>
            <Text style={styles.bannerMeta}>
              {t('premium')} {formatCurrency(policy.premium_amount)} / {t('week')}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.bannerEmpty}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/policy')}
          >
            <Text style={styles.bannerTitle}>{t('noActivePolicy')}</Text>
            <Text style={styles.bannerText}>{t('getCovered')}</Text>
          </TouchableOpacity>
        )}

        <View
          style={[
            styles.disruptionCard,
            zoneStatus === 'green' && styles.disruptionGreen,
            zoneStatus === 'amber' && styles.disruptionAmber,
            zoneStatus === 'red' && styles.disruptionRed,
          ]}
        >
          {zoneStatus === 'green' ? (
            <>
              <Text style={[styles.disruptionTitle, styles.greenText]}>{t('zoneClean')}</Text>
              <Text style={styles.disruptionText}>{t('noTriggers')}</Text>
            </>
          ) : zoneStatus === 'amber' ? (
            <>
              <Text style={[styles.disruptionTitle, styles.yellowText]}>{t('watchZone')}</Text>
              <Text style={styles.disruptionText}>
                {(primaryDisruption?.event_type || 'Disruption').replace(/_/g, ' ')} · {t('severity')}{' '}
                {Number(primaryDisruption?.severity || 0).toFixed(2)}
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.disruptionTitle, styles.redText]}>{t('activeDisruption')}</Text>
              <Text style={styles.disruptionText}>{t('claimProcessing')}</Text>
              <Text style={[styles.disruptionText, styles.disruptionMeta]}>
                {(primaryDisruption?.event_type || 'Disruption').replace(/_/g, ' ')} ·{' '}
                {primaryDisruption?.triggered_at
                  ? new Date(primaryDisruption.triggered_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'now'}
              </Text>
            </>
          )}
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>{t('earningsStats')}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{t('earningsProtected')}</Text>
              <Text style={styles.statValueOrange}>{formatCurrency(earningsProtected)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{t('weeklyPremium')}</Text>
              <Text style={styles.statValueWhite}>
                {policy ? formatCurrency(policy.premium_amount) : '₹0'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.activityCard}>
          <Text style={styles.sectionTitle}>{t('recentActivity')}</Text>
          {recentClaims.length === 0 ? (
            <>
              <Text style={styles.emptyActivityText}>{t('noActivity')}</Text>
              <Text style={styles.emptyActivitySubtext}>{t('triggerHint')}</Text>
            </>
          ) : (
            recentClaims.map(claim => (
              <View key={claim.id} style={styles.activityRow}>
                <View style={styles.activityIconWrap}>
                  <Ionicons
                    name={claim.status === 'paid' ? 'checkmark-circle' : 'time-outline'}
                    size={18}
                    color={claim.status === 'paid' ? '#00C853' : '#FF6B00'}
                  />
                </View>
                <View style={styles.activityBody}>
                  <Text style={styles.activityTitle}>
                    {(claim.event_type || 'Claim').replace(/_/g, ' ')}
                  </Text>
                  <Text style={styles.activityMeta}>{formatCurrency(claim.payout_amount || 0)}</Text>
                </View>
                <Text
                  style={[
                    styles.activityTime,
                    { color: STATUS_COLORS[claim.status] || '#FF6B00' },
                  ]}
                >
                  {formatTimeAgo(claim.created_at)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ShimmerBlock({
  shimmer,
  height,
  style,
}: {
  shimmer: Animated.Value;
  height: number;
  style?: object;
}) {
  return <Animated.View style={[styles.shimmerBlock, { height, opacity: shimmer }, style]} />;
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
  },
  headerCard: {
    backgroundColor: ZENSURE_COLORS.surface,
    borderRadius: 20,
    padding: 18,
  },
  headerEyebrow: {
    color: ZENSURE_COLORS.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  headerName: {
    color: ZENSURE_COLORS.white,
    fontSize: 28,
    fontWeight: '800',
  },
  headerMeta: {
    color: ZENSURE_COLORS.textSecondary,
    marginTop: 4,
  },
  errorCard: {
    backgroundColor: ERROR_CARD.backgroundColor,
    borderRadius: 12,
    padding: 12,
  },
  errorCardText: {
    color: ERROR_CARD.color,
  },
  bannerCard: {
    borderRadius: 18,
    padding: 18,
  },
  bannerActive: {
    backgroundColor: '#0D2B0D',
    borderWidth: 1,
    borderColor: '#00C853',
  },
  bannerEmpty: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: ZENSURE_COLORS.primary,
    borderStyle: 'dashed',
    backgroundColor: ZENSURE_COLORS.surface,
  },
  bannerTitle: {
    color: ZENSURE_COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  bannerText: {
    color: ZENSURE_COLORS.white,
    fontSize: 14,
    marginBottom: 4,
  },
  bannerMeta: {
    color: ZENSURE_COLORS.textSecondary,
  },
  disruptionCard: {
    borderRadius: 18,
    padding: 18,
  },
  disruptionGreen: {
    backgroundColor: '#0D2B0D',
  },
  disruptionAmber: {
    backgroundColor: '#2B1F00',
  },
  disruptionRed: {
    backgroundColor: '#2B0000',
  },
  disruptionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  greenText: {
    color: '#00C853',
  },
  yellowText: {
    color: '#FFD700',
  },
  redText: {
    color: '#FF3D00',
  },
  disruptionText: {
    color: ZENSURE_COLORS.white,
    lineHeight: 20,
  },
  disruptionMeta: {
    marginTop: 4,
    color: ZENSURE_COLORS.textSecondary,
  },
  statsSection: {
    gap: 12,
  },
  sectionTitle: {
    color: ZENSURE_COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    padding: 16,
  },
  statLabel: {
    color: ZENSURE_COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 10,
  },
  statValueOrange: {
    color: '#FF6B00',
    fontSize: 24,
    fontWeight: '800',
  },
  statValueWhite: {
    color: ZENSURE_COLORS.white,
    fontSize: 24,
    fontWeight: '800',
  },
  activityCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    padding: 18,
    gap: 12,
  },
  emptyActivityText: {
    color: ZENSURE_COLORS.textSecondary,
    fontSize: 14,
  },
  emptyActivitySubtext: {
    color: ZENSURE_COLORS.textSecondary,
    fontSize: 13,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  activityIconWrap: {
    width: 24,
    alignItems: 'center',
  },
  activityBody: {
    flex: 1,
  },
  activityTitle: {
    color: ZENSURE_COLORS.white,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  activityMeta: {
    color: ZENSURE_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '700',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 24,
  },
  errorTitle: {
    color: ZENSURE_COLORS.white,
    fontSize: 18,
    fontWeight: '700',
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
  shimmerBlock: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
  },
  statBlock: {
    flex: 1,
  },
});

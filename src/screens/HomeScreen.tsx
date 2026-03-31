import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { ZENSURE_COLORS, STORAGE_KEYS } from '../utils/constants';
import {
  getPolicy,
  getClaims,
  getDisruptions,
  Policy,
  Claim,
  Disruption,
  Partner,
} from '../services/api';

const formatCurrency = (amount: number) =>
  '₹' + amount.toLocaleString('en-IN');

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function HomeScreen() {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PARTNER_DATA);
      if (stored) setPartner(JSON.parse(stored));
      const [p, c, d] = await Promise.all([getPolicy(), getClaims(), getDisruptions()]);
      setPolicy(p);
      setClaims(c);
      setDisruptions(d);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const partnerCity = partner?.city || 'Bengaluru';
  const cityDisruption = disruptions.find(
    d => d.city.toLowerCase() === partnerCity.toLowerCase() && d.severity === 'high'
  );

  const totalPayout = claims
    .filter(c => c.status === 'approved')
    .reduce((sum, c) => sum + (c.payoutAmount || 0), 0);

  const approvedClaims = claims.filter(c => c.status === 'approved').length;

  const memberDays = partner?.memberSince
    ? Math.floor((Date.now() - new Date(partner.memberSince).getTime()) / 86400000)
    : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ZENSURE_COLORS.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={ZENSURE_COLORS.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.partnerName}>{partner?.name || 'Partner'} 👋</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color={ZENSURE_COLORS.white} />
            <View style={styles.bellBadge} />
          </TouchableOpacity>
        </View>

        {/* Disruption Alert */}
        {cityDisruption && (
          <View style={styles.alertBanner}>
            <View style={styles.alertIcon}>
              <Ionicons name="warning" size={20} color={ZENSURE_COLORS.bg} />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>⚠️ {cityDisruption.type} Alert — {cityDisruption.city}</Text>
              <Text style={styles.alertDesc}>{cityDisruption.description}</Text>
            </View>
          </View>
        )}

        {/* Active Policy Card */}
        {policy && (
          <LinearGradient
            colors={['#1F1F1F', '#2A1500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.policyCard}
          >
            <View style={styles.policyCardTop}>
              <View>
                <Text style={styles.policyLabel}>Active Policy</Text>
                <View style={styles.planBadgeRow}>
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>{policy.plan}</Text>
                  </View>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>
              <View style={styles.policyIdContainer}>
                <Text style={styles.policyIdLabel}>ID</Text>
                <Text style={styles.policyIdText}>{policy.id.split('-').pop()}</Text>
              </View>
            </View>

            <View style={styles.policyDivider} />

            <View style={styles.policyStatsRow}>
              <View style={styles.policyStat}>
                <Text style={styles.policyStatValue}>{formatCurrency(policy.coverageAmount)}</Text>
                <Text style={styles.policyStatLabel}>Coverage</Text>
              </View>
              <View style={styles.policyStatDivider} />
              <View style={styles.policyStat}>
                <Text style={styles.policyStatValue}>{formatCurrency(policy.premiumPaid)}/mo</Text>
                <Text style={styles.policyStatLabel}>Premium</Text>
              </View>
              <View style={styles.policyStatDivider} />
              <View style={styles.policyStat}>
                <Text style={styles.policyStatValue}>{formatDate(policy.endDate)}</Text>
                <Text style={styles.policyStatLabel}>Valid Till</Text>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={20} color={ZENSURE_COLORS.primary} />
            <Text style={styles.statValue}>{memberDays}</Text>
            <Text style={styles.statLabel}>Days Active</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="document-text-outline" size={20} color={ZENSURE_COLORS.warning} />
            <Text style={styles.statValue}>{claims.length}</Text>
            <Text style={styles.statLabel}>Claims Filed</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="wallet-outline" size={20} color={ZENSURE_COLORS.success} />
            <Text style={styles.statValue}>{formatCurrency(totalPayout)}</Text>
            <Text style={styles.statLabel}>Total Payout</Text>
          </View>
        </View>

        {/* Recent Claims */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Claims</Text>
          {claims.length > 0 && (
            <Text style={styles.sectionSubtitle}>{claims.length} total</Text>
          )}
        </View>

        {claims.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={ZENSURE_COLORS.border} />
            <Text style={styles.emptyTitle}>No Claims Yet</Text>
            <Text style={styles.emptyDesc}>Your claims will appear here once filed.</Text>
          </View>
        ) : (
          claims.slice(0, 3).map(claim => (
            <ClaimCard key={claim.id} claim={claim} />
          ))
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ClaimCard({ claim }: { claim: Claim }) {
  const statusConfig: Record<string, { color: string; bg: string; icon: string }> = {
    approved: { color: ZENSURE_COLORS.success, bg: ZENSURE_COLORS.successDim, icon: 'checkmark-circle' },
    processing: { color: ZENSURE_COLORS.warning, bg: ZENSURE_COLORS.warningDim, icon: 'time' },
    rejected: { color: ZENSURE_COLORS.error, bg: ZENSURE_COLORS.errorDim, icon: 'close-circle' },
  };
  const cfg = statusConfig[claim.status];

  return (
    <View style={claimStyles.card}>
      <View style={claimStyles.cardTop}>
        <View style={claimStyles.claimLeft}>
          <Text style={claimStyles.claimId}>{claim.id}</Text>
          <View style={claimStyles.claimTypeRow}>
            <Ionicons name="flash-outline" size={13} color={ZENSURE_COLORS.textSecondary} />
            <Text style={claimStyles.claimType}>{claim.type}</Text>
          </View>
        </View>
        <View style={[claimStyles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon as any} size={13} color={cfg.color} />
          <Text style={[claimStyles.statusText, { color: cfg.color }]}>
            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
          </Text>
        </View>
      </View>
      <View style={claimStyles.cardBottom}>
        <Text style={claimStyles.filedDate}>Filed {claim.filedOn}</Text>
        {claim.payoutAmount ? (
          <Text style={claimStyles.payout}>₹{claim.payoutAmount.toLocaleString('en-IN')}</Text>
        ) : null}
      </View>
    </View>
  );
}

const claimStyles = StyleSheet.create({
  card: {
    backgroundColor: ZENSURE_COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: ZENSURE_COLORS.border,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  claimLeft: {
    flex: 1,
  },
  claimId: {
    fontSize: 14,
    fontWeight: '700',
    color: ZENSURE_COLORS.white,
    marginBottom: 4,
  },
  claimTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  claimType: {
    fontSize: 13,
    color: ZENSURE_COLORS.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filedDate: {
    fontSize: 12,
    color: ZENSURE_COLORS.textSecondary,
  },
  payout: {
    fontSize: 14,
    fontWeight: '700',
    color: ZENSURE_COLORS.success,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ZENSURE_COLORS.bg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: ZENSURE_COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: ZENSURE_COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    color: ZENSURE_COLORS.textSecondary,
  },
  partnerName: {
    fontSize: 22,
    fontWeight: '700',
    color: ZENSURE_COLORS.white,
    marginTop: 2,
  },
  bellBtn: {
    width: 44,
    height: 44,
    backgroundColor: ZENSURE_COLORS.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ZENSURE_COLORS.border,
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: ZENSURE_COLORS.primary,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: ZENSURE_COLORS.bg,
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,107,0,0.15)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: ZENSURE_COLORS.primary,
    gap: 12,
    alignItems: 'flex-start',
  },
  alertIcon: {
    width: 36,
    height: 36,
    backgroundColor: ZENSURE_COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: ZENSURE_COLORS.white,
    marginBottom: 3,
  },
  alertDesc: {
    fontSize: 12,
    color: ZENSURE_COLORS.textSecondary,
    lineHeight: 16,
  },
  policyCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,107,0,0.3)',
  },
  policyCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  policyLabel: {
    fontSize: 12,
    color: ZENSURE_COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  planBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planBadge: {
    backgroundColor: ZENSURE_COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: ZENSURE_COLORS.white,
    letterSpacing: 0.5,
  },
  statusDot: {
    width: 6,
    height: 6,
    backgroundColor: ZENSURE_COLORS.success,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 13,
    color: ZENSURE_COLORS.success,
    fontWeight: '600',
  },
  policyIdContainer: {
    alignItems: 'flex-end',
  },
  policyIdLabel: {
    fontSize: 10,
    color: ZENSURE_COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  policyIdText: {
    fontSize: 14,
    fontWeight: '700',
    color: ZENSURE_COLORS.white,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
  },
  policyDivider: {
    height: 1,
    backgroundColor: ZENSURE_COLORS.border,
    marginBottom: 16,
  },
  policyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  policyStat: {
    flex: 1,
    alignItems: 'center',
  },
  policyStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: ZENSURE_COLORS.white,
    marginBottom: 3,
  },
  policyStatLabel: {
    fontSize: 11,
    color: ZENSURE_COLORS.textSecondary,
  },
  policyStatDivider: {
    width: 1,
    backgroundColor: ZENSURE_COLORS.border,
    alignSelf: 'stretch',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: ZENSURE_COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: ZENSURE_COLORS.border,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: ZENSURE_COLORS.white,
  },
  statLabel: {
    fontSize: 10,
    color: ZENSURE_COLORS.textSecondary,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: ZENSURE_COLORS.white,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: ZENSURE_COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ZENSURE_COLORS.textSecondary,
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: ZENSURE_COLORS.border,
    textAlign: 'center',
  },
  bottomPad: {
    height: 32,
  },
});

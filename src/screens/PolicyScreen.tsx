import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ZENSURE_COLORS } from '../utils/constants';

// ─── Types ──────────────────────────────────────────────────────────────────

type PlanKey = 'basic' | 'standard' | 'full';

interface Plan {
  key: PlanKey;
  tier: string;
  price: number;
  priceLabel: string;
  popular: boolean;
  features: string[];
  coveragePercent: string;
  maxPayout: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    key: 'basic',
    tier: 'BASIC',
    price: 29,
    priceLabel: '29',
    popular: false,
    features: [
      '50% income replacement',
      'Max payout ₹1,500/week',
      'All 6 disruption triggers',
      'UPI payout within 5 min',
    ],
    coveragePercent: '50%',
    maxPayout: '₹1,500',
  },
  {
    key: 'standard',
    tier: 'STANDARD',
    price: 49,
    priceLabel: '49',
    popular: true,
    features: [
      '70% income replacement',
      'Max payout ₹2,500/week',
      'All 6 disruption triggers',
      'UPI payout within 5 min',
      'Priority fraud clearance',
    ],
    coveragePercent: '70%',
    maxPayout: '₹2,500',
  },
  {
    key: 'full',
    tier: 'FULL',
    price: 79,
    priceLabel: '79',
    popular: false,
    features: [
      '90% income replacement',
      'Max payout ₹4,000/week',
      'All 6 disruption triggers',
      'UPI payout within 5 min',
      'Priority fraud clearance',
      'Dedicated support line',
    ],
    coveragePercent: '90%',
    maxPayout: '₹4,000',
  },
];

const PRICING_FACTORS = [
  { emoji: '📍', label: 'Zone Risk Score', value: '0.78 (High)' },
  { emoji: '🌧️', label: 'Seasonal Factor', value: '1.3x (Monsoon)' },
  { emoji: '⚡', label: 'Your Activity Score', value: '8.2 hrs/day avg' },
  { emoji: '🏙️', label: 'City Tier', value: 'Metro (Chennai)' },
];

// Get week coverage dates for the confirmation modal
function getWeekDates() {
  const now = new Date();
  // next Monday
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + daysToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return { start: fmt(monday), end: fmt(sunday) };
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function PolicyScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('standard');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);
  const [activated, setActivated] = useState(false);
  const { start, end } = getWeekDates();

  const handleActivate = (plan: Plan) => {
    setPendingPlan(plan);
    setConfirmVisible(true);
  };

  const handleConfirm = () => {
    setConfirmVisible(false);
    setActivated(true);
    // Show brief success then navigate home
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 1400);
  };

  if (activated) {
    return (
      <View style={styles.successScreen}>
        <View style={styles.successIcon}>
          <Ionicons name="shield-checkmark" size={56} color={ZENSURE_COLORS.primary} />
        </View>
        <Text style={styles.successTitle}>Coverage Activated!</Text>
        <Text style={styles.successSub}>
          Your {pendingPlan?.tier} Shield is now active.{'\n'}
          Redirecting to home...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Section 1: Header ── */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Choose Your Plan</Text>
          <Text style={styles.pageSubtitle}>Weekly coverage. Cancel anytime.</Text>

          {/* AI Risk Badge */}
          <View style={styles.riskBadge}>
            <Ionicons name="warning" size={14} color={ZENSURE_COLORS.primary} />
            <Text style={styles.riskBadgeText}>
              Your Zone Risk: HIGH · Monsoon Season
            </Text>
          </View>
        </View>

        {/* ── Section 2: Plan Cards ── */}
        {PLANS.map(plan => (
          <PlanCard
            key={plan.key}
            plan={plan}
            selected={selectedPlan === plan.key}
            onSelect={() => setSelectedPlan(plan.key)}
            onActivate={() => handleActivate(plan)}
          />
        ))}

        {/* ── Section 3: Pricing Breakdown ── */}
        <View style={styles.pricingCard}>
          <View style={styles.pricingHeader}>
            <Ionicons name="calculator-outline" size={16} color={ZENSURE_COLORS.primary} />
            <Text style={styles.pricingTitle}>How your premium is calculated</Text>
          </View>
          {PRICING_FACTORS.map(f => (
            <View key={f.label} style={styles.pricingRow}>
              <Text style={styles.pricingEmoji}>{f.emoji}</Text>
              <Text style={styles.pricingLabel}>{f.label}</Text>
              <Text style={styles.pricingValue}>{f.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* ── Section 4: Confirmation Modal ── */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Modal icon */}
            <View style={styles.modalIcon}>
              <Ionicons name="shield-checkmark" size={32} color={ZENSURE_COLORS.primary} />
            </View>

            <Text style={styles.modalTitle}>Confirm Activation</Text>

            <View style={styles.modalAmountRow}>
              <Text style={styles.modalAmount}>₹{pendingPlan?.priceLabel}</Text>
              <Text style={styles.modalAmountSub}>/week</Text>
            </View>

            <Text style={styles.modalBody}>
              ₹{pendingPlan?.priceLabel} will be deducted from your UPI weekly
              starting Monday.{'\n\n'}
              Coverage:{' '}
              <Text style={styles.modalHighlight}>
                Mon {start} – Sun {end}
              </Text>
            </Text>

            <View style={styles.modalCoverageRow}>
              <View style={styles.modalCoverageItem}>
                <Text style={styles.modalCoverageValue}>{pendingPlan?.coveragePercent}</Text>
                <Text style={styles.modalCoverageLabel}>Income replaced</Text>
              </View>
              <View style={styles.modalCoverageDivider} />
              <View style={styles.modalCoverageItem}>
                <Text style={styles.modalCoverageValue}>{pendingPlan?.maxPayout}</Text>
                <Text style={styles.modalCoverageLabel}>Max payout</Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setConfirmVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirm}
                activeOpacity={0.85}
              >
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Plan Card ───────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  selected,
  onSelect,
  onActivate,
}: {
  plan: Plan;
  selected: boolean;
  onSelect: () => void;
  onActivate: () => void;
}) {
  const isStandard = plan.key === 'standard';
  const isSelected = selected;

  return (
    <TouchableOpacity
      style={[
        cardStyles.card,
        isStandard && cardStyles.cardPopular,
        isSelected && cardStyles.cardSelected,
      ]}
      onPress={onSelect}
      activeOpacity={0.85}
    >
      {/* Popular badge */}
      {isStandard && (
        <View style={cardStyles.popularBadge}>
          <Text style={cardStyles.popularBadgeText}>MOST POPULAR</Text>
        </View>
      )}

      {/* Tier label + price row */}
      <View style={cardStyles.topRow}>
        <Text
          style={[
            cardStyles.tierLabel,
            isStandard && cardStyles.tierLabelOrange,
          ]}
        >
          {plan.tier}
        </Text>
        {isSelected && (
          <View style={cardStyles.selectedDot}>
            <Ionicons name="checkmark-circle" size={18} color={ZENSURE_COLORS.primary} />
          </View>
        )}
      </View>

      {/* Price */}
      <View style={cardStyles.priceRow}>
        <Text
          style={[
            cardStyles.priceCurrency,
            isStandard && cardStyles.priceOrange,
          ]}
        >
          ₹
        </Text>
        <Text
          style={[
            cardStyles.priceAmount,
            isStandard && cardStyles.priceOrange,
          ]}
        >
          {plan.priceLabel}
        </Text>
        <Text style={cardStyles.priceUnit}>/week</Text>
      </View>

      {/* Divider */}
      <View style={cardStyles.divider} />

      {/* Features */}
      <View style={cardStyles.featuresList}>
        {plan.features.map(feat => (
          <View key={feat} style={cardStyles.featureRow}>
            <View
              style={[
                cardStyles.checkWrap,
                isStandard && cardStyles.checkWrapOrange,
              ]}
            >
              <Ionicons
                name="checkmark"
                size={12}
                color={isStandard ? ZENSURE_COLORS.primary : ZENSURE_COLORS.success}
              />
            </View>
            <Text style={cardStyles.featureText}>{feat}</Text>
          </View>
        ))}
      </View>

      {/* CTA button */}
      <TouchableOpacity
        style={[
          cardStyles.ctaBtn,
          isStandard && cardStyles.ctaBtnOrange,
        ]}
        onPress={onActivate}
        activeOpacity={0.85}
      >
        <Text
          style={[
            cardStyles.ctaBtnText,
            isStandard && cardStyles.ctaBtnTextWhite,
          ]}
        >
          Activate {plan.tier.charAt(0) + plan.tier.slice(1).toLowerCase()}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: ZENSURE_COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: ZENSURE_COLORS.border,
    position: 'relative',
  },
  cardPopular: {
    borderColor: ZENSURE_COLORS.primary,
    borderWidth: 2,
    // Glow via shadow
    shadowColor: ZENSURE_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  cardSelected: {
    // Subtle inner glow for non-popular cards when selected
    shadowColor: ZENSURE_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    right: 14,
    backgroundColor: ZENSURE_COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 8,
  },
  tierLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888888',
    letterSpacing: 1.5,
  },
  tierLabelOrange: {
    color: ZENSURE_COLORS.primary,
  },
  selectedDot: {
    // visible checkmark when selected
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
    gap: 2,
  },
  priceCurrency: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  priceAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 44,
  },
  priceOrange: {
    color: ZENSURE_COLORS.primary,
  },
  priceUnit: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 6,
    marginLeft: 3,
  },
  divider: {
    height: 1,
    backgroundColor: ZENSURE_COLORS.border,
    marginBottom: 14,
  },
  featuresList: {
    gap: 10,
    marginBottom: 18,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(34,197,94,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkWrapOrange: {
    backgroundColor: ZENSURE_COLORS.primaryDim,
  },
  featureText: {
    fontSize: 14,
    color: '#E0E0E0',
    flex: 1,
  },
  ctaBtn: {
    borderWidth: 1.5,
    borderColor: '#444444',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  ctaBtnOrange: {
    backgroundColor: ZENSURE_COLORS.primary,
    borderColor: ZENSURE_COLORS.primary,
    shadowColor: ZENSURE_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#AAAAAA',
    letterSpacing: 0.3,
  },
  ctaBtnTextWhite: {
    color: '#FFFFFF',
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ZENSURE_COLORS.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // ── Header ──
  header: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 14,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#2B1500',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,107,0,0.3)',
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: ZENSURE_COLORS.primary,
    letterSpacing: 0.2,
  },

  // ── Pricing info card ──
  pricingCard: {
    backgroundColor: ZENSURE_COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: ZENSURE_COLORS.border,
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  pricingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: ZENSURE_COLORS.border,
  },
  pricingEmoji: {
    fontSize: 16,
    marginRight: 10,
    width: 24,
  },
  pricingLabel: {
    flex: 1,
    fontSize: 13,
    color: '#888888',
  },
  pricingValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // ── Success screen ──
  successScreen: {
    flex: 1,
    backgroundColor: ZENSURE_COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,107,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  successSub: {
    fontSize: 15,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,107,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 14,
    gap: 2,
  },
  modalAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: ZENSURE_COLORS.primary,
    lineHeight: 40,
  },
  modalAmountSub: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 4,
  },
  modalBody: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalHighlight: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalCoverageRow: {
    flexDirection: 'row',
    backgroundColor: '#242424',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  modalCoverageItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  modalCoverageDivider: {
    width: 1,
    backgroundColor: ZENSURE_COLORS.border,
    alignSelf: 'stretch',
  },
  modalCoverageValue: {
    fontSize: 18,
    fontWeight: '800',
    color: ZENSURE_COLORS.primary,
  },
  modalCoverageLabel: {
    fontSize: 11,
    color: '#888888',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#444444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#AAAAAA',
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: ZENSURE_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: ZENSURE_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  bottomPad: {
    height: 32,
  },
});

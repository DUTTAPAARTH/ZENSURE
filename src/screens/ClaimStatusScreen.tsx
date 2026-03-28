import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── Color constants ──────────────────────────────────────────────────────────
const C = {
  bg: '#0D0D0D',
  surface: '#1A1A1A',
  border: '#2A2A2A',
  primary: '#FF6B00',
  white: '#FFFFFF',
  textSecondary: '#888888',
  green: '#00C853',
  greenDim: 'rgba(0,200,83,0.12)',
  orange: '#FF6B00',
  orangeDim: 'rgba(255,107,0,0.12)',
  yellow: '#FFD700',
  yellowDim: 'rgba(255,215,0,0.10)',
  red: '#FF3D00',
  redDim: 'rgba(255,61,0,0.10)',
  grey: '#555555',
  greyDim: 'rgba(85,85,85,0.15)',
};

// ─── Timeline step data ───────────────────────────────────────────────────────
const TIMELINE_STEPS = [
  {
    id: 1,
    label: 'Trigger Detected',
    sub: 'IMD Red Alert fired for your zone',
    time: '2:09 PM',
    state: 'done' as const,
  },
  {
    id: 2,
    label: 'Fraud Validation',
    sub: 'Location and activity verified',
    time: '2:09 PM',
    state: 'done' as const,
  },
  {
    id: 3,
    label: 'Payout Processing',
    sub: 'Transferring ₹630 to your UPI',
    time: '2:10 PM',
    state: 'active' as const,
  },
  {
    id: 4,
    label: 'Payout Complete',
    sub: 'UPI transfer confirmation',
    time: 'Pending',
    state: 'pending' as const,
  },
];

// ─── Past claims data ─────────────────────────────────────────────────────────
const PAST_CLAIMS = [
  {
    id: 'p1',
    title: 'Heavy Rainfall — T. Nagar',
    date: 'Mar 21, 2025',
    amount: '₹420',
    status: 'paid' as const,
  },
  {
    id: 'p2',
    title: 'Severe AQI Alert',
    date: 'Mar 15, 2025',
    amount: '₹315',
    status: 'paid' as const,
  },
  {
    id: 'p3',
    title: 'Bandh Claim — Fraud Detected',
    date: 'Mar 10, 2025',
    amount: '₹0',
    status: 'rejected' as const,
    sub: 'GPS mismatch detected',
  },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ClaimStatusScreen() {
  // Pulsing animation for Step 3
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const HAS_CLAIMS = true; // Toggle to false to test empty state

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Section 1: Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.pageTitle}>My Claims</Text>
            <Text style={styles.pageSubtitle}>Auto-processed. No filing needed.</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
            <Ionicons name="funnel-outline" size={20} color={C.white} />
          </TouchableOpacity>
        </View>

        {HAS_CLAIMS ? (
          <>
            {/* ── Section 2: Active Claim Banner ── */}
            <View style={styles.activeBanner}>
              {/* Banner top row */}
              <View style={styles.bannerTopRow}>
                <View style={styles.activePill}>
                  <View style={styles.activePillDot} />
                  <Text style={styles.activePillText}>ACTIVE CLAIM</Text>
                </View>
                <Text style={styles.bannerTime}>Today 2:09 PM</Text>
              </View>

              {/* Disruption title */}
              <Text style={styles.bannerTitle}>IMD Red Alert — Heavy Rainfall</Text>
              <View style={styles.bannerLocationRow}>
                <Ionicons name="location-sharp" size={13} color={C.textSecondary} />
                <Text style={styles.bannerLocation}>T. Nagar, Chennai</Text>
              </View>

              {/* Payout row */}
              <View style={styles.bannerPayoutRow}>
                <Text style={styles.bannerPayout}>₹630</Text>
                <Text style={styles.bannerPlan}>Standard Shield · 70% coverage</Text>
              </View>

              {/* Divider */}
              <View style={styles.bannerDivider} />

              {/* Timeline */}
              <View style={styles.timeline}>
                {TIMELINE_STEPS.map((step, index) => {
                  const isLast = index === TIMELINE_STEPS.length - 1;
                  const isDone = step.state === 'done';
                  const isActive = step.state === 'active';
                  const isPending = step.state === 'pending';

                  // Connecting line color + style
                  const nextStep = TIMELINE_STEPS[index + 1];
                  const lineDashed =
                    nextStep &&
                    (nextStep.state === 'pending' || step.state === 'active');
                  const lineColor = isDone
                    ? C.green
                    : isActive
                    ? C.orange
                    : C.grey;

                  return (
                    <View key={step.id} style={styles.timelineRow}>
                      {/* Left column: dot + line */}
                      <View style={styles.timelineDotCol}>
                        {/* Dot */}
                        {isActive ? (
                          <Animated.View
                            style={[
                              styles.timelineDot,
                              styles.timelineDotActive,
                              { opacity: pulseAnim },
                            ]}
                          >
                            <Ionicons
                              name="time"
                              size={11}
                              color={C.white}
                            />
                          </Animated.View>
                        ) : isDone ? (
                          <View style={[styles.timelineDot, styles.timelineDotDone]}>
                            <Ionicons name="checkmark" size={11} color={C.white} />
                          </View>
                        ) : (
                          <View style={[styles.timelineDot, styles.timelineDotPending]} />
                        )}

                        {/* Connecting line */}
                        {!isLast && (
                          <View
                            style={[
                              styles.timelineLine,
                              lineDashed && styles.timelineLineDashed,
                              { backgroundColor: lineColor },
                            ]}
                          />
                        )}
                      </View>

                      {/* Right column: text */}
                      <View style={styles.timelineContent}>
                        <View style={styles.timelineContentRow}>
                          <Text
                            style={[
                              styles.timelineLabel,
                              isDone && styles.timelineLabelDone,
                              isActive && styles.timelineLabelActive,
                              isPending && styles.timelineLabelPending,
                            ]}
                          >
                            {step.label}
                          </Text>
                          <Text
                            style={[
                              styles.timelineTime,
                              isPending && styles.timelineTimePending,
                            ]}
                          >
                            {step.time}
                          </Text>
                        </View>
                        <Text style={styles.timelineSub}>{step.sub}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* ── Section 3: Soft Hold Card ── */}
            <View style={styles.holdBanner}>
              {/* Top row */}
              <View style={styles.bannerTopRow}>
                <View style={styles.holdPill}>
                  <Ionicons name="alert-circle" size={12} color="#1A1400" />
                  <Text style={styles.holdPillText}>ACTION NEEDED</Text>
                </View>
                <Text style={styles.bannerTime}>Yesterday 6:45 PM</Text>
              </View>

              {/* Disruption */}
              <Text style={styles.holdTitle}>Civic Disruption — Zone Bandh</Text>

              {/* Payout */}
              <Text style={styles.holdPayout}>₹441</Text>

              {/* Status */}
              <Text style={styles.holdStatusText}>
                We need one quick confirmation
              </Text>
              <Text style={styles.holdDesc}>
                Our system flagged an ambiguous location signal. Please confirm
                your location or upload one photo to release your payout.
              </Text>

              {/* Action buttons */}
              <View style={styles.holdButtons}>
                <TouchableOpacity style={styles.holdBtnOutline} activeOpacity={0.8}>
                  <Ionicons name="location-outline" size={15} color={C.yellow} />
                  <Text style={styles.holdBtnOutlineText}>Re-ping Location</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.holdBtnFill} activeOpacity={0.85}>
                  <Ionicons name="camera-outline" size={15} color="#1A1400" />
                  <Text style={styles.holdBtnFillText}>Upload Photo</Text>
                </TouchableOpacity>
              </View>

              {/* Countdown */}
              <View style={styles.holdCountdownRow}>
                <Ionicons name="time-outline" size={13} color={C.textSecondary} />
                <Text style={styles.holdCountdown}>
                  Auto-approved in{' '}
                  <Text style={styles.holdCountdownHighlight}>2h 45m</Text>
                  {' '}at 70% payout
                </Text>
              </View>
            </View>

            {/* ── Section 4: Past Claims ── */}
            <Text style={styles.pastClaimsTitle}>Past Claims</Text>

            {PAST_CLAIMS.map(claim => (
              <PastClaimItem key={claim.id} claim={claim} />
            ))}
          </>
        ) : (
          /* ── Section 5: Empty State ── */
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="shield-outline" size={64} color={C.grey} />
            </View>
            <Text style={styles.emptyTitle}>No claims yet</Text>
            <Text style={styles.emptyDesc}>
              When a disruption hits your zone,{'\n'}
              we process your claim automatically.
            </Text>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Past Claim Item ──────────────────────────────────────────────────────────
function PastClaimItem({
  claim,
}: {
  claim: (typeof PAST_CLAIMS)[number];
}) {
  const isPaid = claim.status === 'paid';

  return (
    <View style={pastStyles.card}>
      {/* Left icon */}
      <View
        style={[
          pastStyles.iconWrap,
          { backgroundColor: isPaid ? C.greenDim : C.redDim },
        ]}
      >
        <Ionicons
          name={isPaid ? 'checkmark-circle' : 'close-circle'}
          size={22}
          color={isPaid ? C.green : C.red}
        />
      </View>

      {/* Center text */}
      <View style={pastStyles.info}>
        <Text style={pastStyles.title}>{claim.title}</Text>
        <Text style={pastStyles.date}>{claim.date}</Text>
        {'sub' in claim && claim.sub ? (
          <Text style={pastStyles.sub}>{claim.sub}</Text>
        ) : null}
      </View>

      {/* Right amount + badge */}
      <View style={pastStyles.right}>
        <Text
          style={[
            pastStyles.amount,
            { color: isPaid ? C.green : C.red },
          ]}
        >
          {claim.amount}
        </Text>
        <View
          style={[
            pastStyles.badge,
            { backgroundColor: isPaid ? C.greenDim : C.redDim },
          ]}
        >
          <Text
            style={[
              pastStyles.badgeText,
              { color: isPaid ? C.green : C.red },
            ]}
          >
            {isPaid ? 'PAID' : 'REJECTED'}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: C.white,
    marginBottom: 3,
  },
  pageSubtitle: {
    fontSize: 13,
    color: C.textSecondary,
  },
  filterBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginTop: 2,
  },

  // Active Banner
  activeBanner: {
    backgroundColor: '#1A0000',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: C.red,
    borderWidth: 1,
    borderColor: 'rgba(255,61,0,0.25)',
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,61,0,0.18)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  activePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.red,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: C.red,
    letterSpacing: 0.8,
  },
  bannerTime: {
    fontSize: 12,
    color: C.textSecondary,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
    marginBottom: 5,
  },
  bannerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  bannerLocation: {
    fontSize: 12,
    color: C.textSecondary,
  },
  bannerPayoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  bannerPayout: {
    fontSize: 30,
    fontWeight: '800',
    color: C.orange,
  },
  bannerPlan: {
    fontSize: 12,
    color: C.textSecondary,
    flex: 1,
  },
  bannerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,61,0,0.15)',
    marginBottom: 16,
  },

  // Timeline
  timeline: {
    paddingLeft: 2,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineDotCol: {
    alignItems: 'center',
    width: 22,
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineDotDone: {
    backgroundColor: C.green,
  },
  timelineDotActive: {
    backgroundColor: C.orange,
  },
  timelineDotPending: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: C.grey,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 16,
    marginVertical: 2,
  },
  timelineLineDashed: {
    // Web-safe dashed via opacity pattern; on native we reduce opacity
    opacity: 0.45,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 18,
  },
  timelineContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.white,
  },
  timelineLabelDone: {
    color: C.green,
  },
  timelineLabelActive: {
    color: C.orange,
  },
  timelineLabelPending: {
    color: C.grey,
  },
  timelineTime: {
    fontSize: 11,
    color: C.textSecondary,
    fontWeight: '500',
  },
  timelineTimePending: {
    color: C.grey,
    fontStyle: 'italic',
  },
  timelineSub: {
    fontSize: 12,
    color: C.textSecondary,
    lineHeight: 16,
  },

  // Soft Hold Banner
  holdBanner: {
    backgroundColor: '#1A1400',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: C.yellow,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  holdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.yellow,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  holdPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1A1400',
    letterSpacing: 0.8,
  },
  holdTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
    marginBottom: 6,
  },
  holdPayout: {
    fontSize: 28,
    fontWeight: '800',
    color: C.yellow,
    marginBottom: 10,
  },
  holdStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.white,
    marginBottom: 5,
  },
  holdDesc: {
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 19,
    marginBottom: 16,
  },
  holdButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  holdBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: C.yellow,
    borderRadius: 10,
    paddingVertical: 11,
    backgroundColor: 'transparent',
  },
  holdBtnOutlineText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.yellow,
  },
  holdBtnFill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: C.yellow,
    borderRadius: 10,
    paddingVertical: 11,
  },
  holdBtnFillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1400',
  },
  holdCountdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  holdCountdown: {
    fontSize: 12,
    color: C.textSecondary,
  },
  holdCountdownHighlight: {
    color: C.yellow,
    fontWeight: '700',
  },

  // Past Claims
  pastClaimsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.white,
    marginBottom: 12,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.textSecondary,
  },
  emptyDesc: {
    fontSize: 14,
    color: C.grey,
    textAlign: 'center',
    lineHeight: 21,
  },

  bottomPad: {
    height: 32,
  },
});

const pastStyles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 13,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: C.white,
  },
  date: {
    fontSize: 12,
    color: C.textSecondary,
  },
  sub: {
    fontSize: 11,
    color: C.red,
    marginTop: 1,
  },
  right: {
    alignItems: 'flex-end',
    gap: 5,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

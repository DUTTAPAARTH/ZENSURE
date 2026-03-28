import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ZENSURE_COLORS, STORAGE_KEYS, LANGUAGES } from '../utils/constants';
import { getClaims, Partner } from '../services/api';

interface PartnerData extends Partner {
  platform: 'zomato' | 'swiggy';
  partnerIdInput?: string;
}

const SETTINGS = [
  { key: 'language', icon: 'language-outline', label: 'Language', value: '', chevron: true },
  { key: 'notifications', icon: 'notifications-outline', label: 'Notifications', value: 'Enabled', chevron: true },
  { key: 'help', icon: 'help-circle-outline', label: 'Help & Support', value: '', chevron: true },
  { key: 'about', icon: 'information-circle-outline', label: 'About Zensure', value: 'v1.0.0', chevron: true },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [language, setLanguage] = useState('en');
  const [totalClaims, setTotalClaims] = useState(0);
  const [totalPayout, setTotalPayout] = useState(0);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [stored, lang, claimsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PARTNER_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
        getClaims(),
      ]);
      if (stored) setPartner(JSON.parse(stored));
      if (lang) setLanguage(lang);
      setTotalClaims(claimsData.length);
      setTotalPayout(
        claimsData
          .filter(c => c.status === 'approved')
          .reduce((sum, c) => sum + (c.payoutAmount || 0), 0)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      performSignOut();
      return;
    }
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: performSignOut },
      ]
    );
  };

  const performSignOut = async () => {
    setSigningOut(true);
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.PARTNER_DATA,
        STORAGE_KEYS.LANGUAGE,
      ]);
      router.replace('/onboarding');
    } catch {
      setSigningOut(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getLangLabel = (code: string) => {
    return LANGUAGES.find(l => l.code === code)?.nativeLabel || 'English';
  };

  const memberSinceFormatted = partner?.memberSince
    ? new Date(partner.memberSince).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Jan 2024';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ZENSURE_COLORS.primary} />
      </View>
    );
  }

  const settingsWithValues = SETTINGS.map(s => ({
    ...s,
    value: s.key === 'language' ? getLangLabel(language) : s.value,
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.pageTitle}>Profile</Text>

        {/* Avatar & Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>
                {partner?.name ? getInitials(partner.name) : 'RP'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{partner?.name || 'Ravi Kumar'}</Text>
              <Text style={styles.profileId}>
                ID: {partner?.partnerIdInput || partner?.id || 'ZM004821'}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={13} color={ZENSURE_COLORS.textSecondary} />
                <Text style={styles.locationText}>
                  {partner?.city || 'Bengaluru'} · {partner?.zone || 'Koramangala'}
                </Text>
              </View>
            </View>
          </View>

          {/* Platform Badge */}
          <View
            style={[
              styles.platformBadge,
              {
                backgroundColor:
                  partner?.platform === 'swiggy'
                    ? 'rgba(252,128,25,0.15)'
                    : 'rgba(226,55,68,0.15)',
              },
            ]}
          >
            <View
              style={[
                styles.platformDot,
                {
                  backgroundColor:
                    partner?.platform === 'swiggy'
                      ? ZENSURE_COLORS.swiggy
                      : ZENSURE_COLORS.zomato,
                },
              ]}
            />
            <Text
              style={[
                styles.platformText,
                {
                  color:
                    partner?.platform === 'swiggy'
                      ? ZENSURE_COLORS.swiggy
                      : ZENSURE_COLORS.zomato,
                },
              ]}
            >
              {partner?.platform === 'swiggy' ? 'Swiggy Partner' : 'Zomato Partner'}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{memberSinceFormatted}</Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalClaims}</Text>
            <Text style={styles.statLabel}>Total Claims</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₹{totalPayout.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>Total Payout</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Settings</Text>
          {settingsWithValues.map((setting, index) => (
            <React.Fragment key={setting.key}>
              <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconWrap}>
                    <Ionicons name={setting.icon as any} size={19} color={ZENSURE_COLORS.primary} />
                  </View>
                  <Text style={styles.settingLabel}>{setting.label}</Text>
                </View>
                <View style={styles.settingRight}>
                  {setting.value ? (
                    <Text style={styles.settingValue}>{setting.value}</Text>
                  ) : null}
                  {setting.chevron && (
                    <Ionicons name="chevron-forward" size={16} color={ZENSURE_COLORS.border} />
                  )}
                </View>
              </TouchableOpacity>
              {index < settingsWithValues.length - 1 && <View style={styles.settingDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.signOutBtn, signingOut && styles.signOutBtnDisabled]}
          onPress={handleSignOut}
          disabled={signingOut}
          activeOpacity={0.8}
        >
          {signingOut ? (
            <ActivityIndicator size="small" color={ZENSURE_COLORS.error} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color={ZENSURE_COLORS.error} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.versionText}>Zensure v1.0.0 · Made in India 🇮🇳</Text>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: ZENSURE_COLORS.white,
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: ZENSURE_COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: ZENSURE_COLORS.border,
    gap: 14,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: ZENSURE_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: '800',
    color: ZENSURE_COLORS.white,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: ZENSURE_COLORS.white,
  },
  profileId: {
    fontSize: 13,
    color: ZENSURE_COLORS.textSecondary,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: ZENSURE_COLORS.textSecondary,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 7,
  },
  platformDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  platformText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    backgroundColor: ZENSURE_COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: ZENSURE_COLORS.border,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: ZENSURE_COLORS.border,
    alignSelf: 'stretch',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: ZENSURE_COLORS.white,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: ZENSURE_COLORS.textSecondary,
    textAlign: 'center',
  },
  settingsCard: {
    backgroundColor: ZENSURE_COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: ZENSURE_COLORS.border,
  },
  settingsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: ZENSURE_COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    minHeight: 48,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    backgroundColor: ZENSURE_COLORS.primaryDim,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 15,
    color: ZENSURE_COLORS.white,
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 13,
    color: ZENSURE_COLORS.textSecondary,
  },
  settingDivider: {
    height: 1,
    backgroundColor: ZENSURE_COLORS.border,
    marginLeft: 48,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: ZENSURE_COLORS.errorDim,
    borderWidth: 1.5,
    borderColor: ZENSURE_COLORS.error,
    marginBottom: 16,
    minHeight: 52,
  },
  signOutBtnDisabled: {
    opacity: 0.6,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '700',
    color: ZENSURE_COLORS.error,
  },
  versionText: {
    fontSize: 12,
    color: ZENSURE_COLORS.border,
    textAlign: 'center',
    marginBottom: 8,
  },
  bottomPad: {
    height: 32,
  },
});

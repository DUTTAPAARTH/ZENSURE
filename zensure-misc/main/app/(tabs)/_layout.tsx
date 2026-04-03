import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getClaims } from '@/src/services/api';
import { useLanguage } from '@/src/utils/LanguageContext';
import { ZENSURE_COLORS } from '@/src/utils/constants';

export default function TabLayout() {
  const { t } = useLanguage();
  const [hasActiveClaims, setHasActiveClaims] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadClaimsBadge = async () => {
      try {
        const response = await getClaims();
        const claims = response.data.claims;
        if (mounted) {
          setHasActiveClaims(
            claims.some(claim => claim.status !== 'paid' && claim.status !== 'rejected')
          );
        }
      } catch {
        if (mounted) {
          setHasActiveClaims(false);
        }
      }
    };

    void loadClaimsBadge();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopWidth: 1,
          borderTopColor: ZENSURE_COLORS.border,
          height: 65,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#FF6B00',
        tabBarInactiveTintColor: '#555555',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarLabel: t('home'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="policy"
        options={{
          title: t('policy'),
          tabBarLabel: t('policy'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'shield' : 'shield-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="claims"
        options={{
          title: t('claims'),
          tabBarLabel: t('claims'),
          tabBarBadge: hasActiveClaims ? ' ' : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#FF3D00',
            color: '#FF3D00',
            minWidth: 10,
            height: 10,
            borderRadius: 5,
            top: 4,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'document-text' : 'document-text-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarLabel: t('profile'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

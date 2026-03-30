import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { isLoggedIn } from '@/src/services/auth';
import { ZENSURE_COLORS } from '@/src/utils/constants';

export default function RootIndex() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(async () => {
      try {
        const loggedIn = await isLoggedIn();
        router.replace(loggedIn ? '/(tabs)' : '/onboarding');
      } catch {
        router.replace('/onboarding');
      } finally {
        setReady(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [fadeAnim, router]);

  if (ready) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.logo}>ZENSURE</Text>
        <Text style={styles.subtitle}>Protecting India&apos;s Delivery Economy</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ZENSURE_COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    color: ZENSURE_COLORS.primary,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 4,
  },
  subtitle: {
    color: ZENSURE_COLORS.white,
    fontSize: 14,
    opacity: 0.85,
  },
});

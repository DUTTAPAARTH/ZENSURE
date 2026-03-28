import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, ZENSURE_COLORS } from '@/src/utils/constants';

export default function RootIndex() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    } catch {
      router.replace('/onboarding');
    } finally {
      setChecking(false);
    }
  };

  if (!checking) return null;

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={ZENSURE_COLORS.primary} />
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
});

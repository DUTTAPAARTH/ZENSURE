import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { ZENSURE_COLORS } from '@/src/utils/constants';

const BACKGROUND_VIDEO_SOURCE = require('../../assets/videos/VIDEO.mp4');

export default function AuthChoiceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.mediaFrame}>
          <Video
            source={BACKGROUND_VIDEO_SOURCE}
            style={styles.backgroundMedia}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            isMuted
          />

          <View style={styles.videoOverlay} />
          <View style={styles.topShade} />
          <View style={styles.bottomShade} />

          <View style={styles.contentWrap}>
            <View style={styles.contentInner}>
              <Text style={styles.brand}>ZENSURE</Text>
              <Text style={styles.title}>Income Protection For Delivery Partners</Text>
              <Text style={styles.subtitle}>Sign in if you already have an account, or create one in 2 minutes.</Text>

              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.85}
                onPress={() => router.push('/auth/sign-in')}
              >
                <Text style={styles.primaryButtonText}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.85}
                onPress={() => router.push('/auth/sign-up')}
              >
                <Text style={styles.secondaryButtonText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ZENSURE_COLORS.bg,
  },
  container: {
    flex: 1,
    backgroundColor: ZENSURE_COLORS.bg,
  },
  mediaFrame: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundMedia: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 10, 12, 0.36)',
  },
  topShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
  },
  bottomShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    backgroundColor: 'rgba(8, 10, 12, 0.46)',
  },
  contentWrap: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 0,
  },
  contentInner: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 380,
  },
  brand: {
    color: ZENSURE_COLORS.primary,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 2.8,
    textAlign: 'center',
    marginBottom: 14,
  },
  title: {
    color: ZENSURE_COLORS.white,
    fontSize: 42,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 50,
    marginBottom: 10,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 26,
  },
  primaryButton: {
    backgroundColor: ZENSURE_COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: ZENSURE_COLORS.bg,
    fontSize: 25,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: 'rgba(24, 24, 24, 0.88)',
    borderWidth: 1,
    borderColor: ZENSURE_COLORS.border,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: ZENSURE_COLORS.white,
    fontSize: 25,
    fontWeight: '700',
  },
});

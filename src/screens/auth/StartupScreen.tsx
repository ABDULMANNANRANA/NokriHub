import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Import image asset via ESModule import
import LOGO from '../../../assets/images/Logo.png';

// ============================================================
// STARTUP SETTINGS
// ============================================================

const STARTUP_DURATION = 5000;

// ============================================================
// COMPONENT
// ============================================================

export default function StartupScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // ==========================================================
  // STARTUP ANIMATION
  // ==========================================================

  useEffect(() => {
    // Fade + scale logo/content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),

      Animated.timing(progressAnim, {
        toValue: 1,
        duration: STARTUP_DURATION,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ]).start();

    // Logo pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Navigate after startup duration
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, STARTUP_DURATION);

    return () => {
      clearTimeout(timer);
    };
  }, [
    fadeAnim,
    scaleAnim,
    pulseAnim,
    progressAnim,
    navigation,
  ]);

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        {/* BACKGROUND DECORATION */}
        <View style={styles.backgroundCircleLarge} />
        <View style={styles.backgroundCircleSmall} />

        {/* MAIN CONTENT */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                {
                  scale: Animated.multiply(scaleAnim, pulseAnim),
                },
              ],
            },
          ]}
        >
          {/* Logo */}
          <View style={styles.logoWrapper}>
            <View style={styles.logoGlow} />

            <View style={styles.logoContainer}>
              <Image
                source={LOGO}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* App Name */}
          <Text style={styles.appName}>NokriHub</Text>

          {/* Tagline */}
          <Text style={styles.tagline}>Connect. Refer. Get Hired.</Text>

          {/* Description */}
          <Text style={styles.description}>
            Your professional job and referral platform
          </Text>
        </Animated.View>

        {/* LOADING AREA */}
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.loadingTrack}>
            <Animated.View
              style={[
                styles.loadingProgress,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          <Text style={styles.loadingText}>
            Preparing your experience...
          </Text>
        </Animated.View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerLine} />

          <Text style={styles.footerProject}>PROJECT BY</Text>

          <Text style={styles.footerName}>SYED MESAM ABBAS & ABDUL MANNAN RANA</Text>

          <Text style={styles.footerSubtext}>
            NokriHub • Professional Career Platform
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 24,
  },
  backgroundCircleLarge: {
    position: 'absolute',
    width: 430,
    height: 430,
    borderRadius: 215,
    backgroundColor: '#172554',
    opacity: 0.55,
    top: -180,
    right: -170,
  },
  backgroundCircleSmall: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#1E3A8A',
    opacity: 0.28,
    bottom: -130,
    left: -120,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -45,
  },
  logoWrapper: {
    width: 142,
    height: 142,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  logoGlow: {
    position: 'absolute',
    width: 142,
    height: 142,
    borderRadius: 71,
    backgroundColor: '#2563EB',
    opacity: 0.18,
  },
  logoContainer: {
    width: 112,
    height: 112,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  logo: {
    width: 82,
    height: 82,
  },
  appName: {
    fontSize: 39,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.2,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '700',
    color: '#93C5FD',
    marginTop: 7,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 9,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 115,
    width: '78%',
    alignItems: 'center',
  },
  loadingTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#3B82F6',
  },
  loadingText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 10,
    letterSpacing: 0.2,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  footerLine: {
    width: 42,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#334155',
    marginBottom: 9,
  },
  footerProject: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1.2,
  },
  footerName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#CBD5E1',
    marginTop: 3,
  },
  footerSubtext: {
    fontSize: 8,
    color: '#475569',
    marginTop: 3,
  },
});
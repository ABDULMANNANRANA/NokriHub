import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';

import {
  startLinkedInLogin,
  Role,
} from '../../screens/services/linkedin.service';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState<Role>('candidate');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      await startLinkedInLogin(selectedRole);

      // The app will open the LinkedIn/browser authentication flow.
      // App.tsx deep-link handling should take over after authentication.
    } catch (err: any) {
      console.error('LinkedIn Login Error:', err);

      Alert.alert(
        'Unable to Continue',
        err?.message || 'Could not start LinkedIn login. Please try again.',
        [
          {
            text: 'OK',
            style: 'default',
          },
        ],
      );

      setLoading(false);
    }
  };

  const isCandidate = selectedRole === 'candidate';
  const isCompanyAdmin = selectedRole === 'company-admin';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Branding */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoN}>N</Text>
          </View>

          <Text style={styles.brand}>
            Nokri<Text style={styles.brandHighlight}>Hub</Text>
          </Text>

          <Text style={styles.tagline}>
            Connect. Refer. Get Hired.
          </Text>

          <Text style={styles.headerDescription}>
            Your professional network for smarter job opportunities.
          </Text>
        </View>

        {/* Main Card */}
        <View style={styles.card}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Welcome to NokriHub</Text>

            <Text style={styles.cardSubtitle}>
              Sign in or create your account using your LinkedIn profile.
            </Text>
          </View>

          {/* Role Selection */}
          <Text style={styles.sectionLabel}>
            Choose your account type
          </Text>

          <View style={styles.roleContainer}>
            {/* Candidate */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setSelectedRole('candidate')}
              disabled={loading}
              style={[
                styles.roleCard,
                isCandidate && styles.roleCardSelected,
              ]}
            >
              <View
                style={[
                  styles.roleIconContainer,
                  isCandidate && styles.roleIconContainerSelected,
                ]}
              >
                <Text style={styles.roleIcon}>👤</Text>
              </View>

              <View style={styles.roleContent}>
                <Text
                  style={[
                    styles.roleTitle,
                    isCandidate && styles.roleTitleSelected,
                  ]}
                >
                  Candidate
                </Text>

                <Text style={styles.roleDescription}>
                  Find jobs & get referrals
                </Text>
              </View>

              <View
                style={[
                  styles.radio,
                  isCandidate && styles.radioSelected,
                ]}
              >
                {isCandidate && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            {/* Company Admin */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setSelectedRole('company-admin')}
              disabled={loading}
              style={[
                styles.roleCard,
                isCompanyAdmin && styles.roleCardSelected,
              ]}
            >
              <View
                style={[
                  styles.roleIconContainer,
                  isCompanyAdmin && styles.roleIconContainerSelected,
                ]}
              >
                <Text style={styles.roleIcon}>🏢</Text>
              </View>

              <View style={styles.roleContent}>
                <Text
                  style={[
                    styles.roleTitle,
                    isCompanyAdmin && styles.roleTitleSelected,
                  ]}
                >
                  Company Admin
                </Text>

                <Text style={styles.roleDescription}>
                  Post jobs & find talent
                </Text>
              </View>

              <View
                style={[
                  styles.radio,
                  isCompanyAdmin && styles.radioSelected,
                ]}
              >
                {isCompanyAdmin && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          </View>

          {/* LinkedIn Login Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleContinue}
            disabled={loading}
            style={[
              styles.linkedInButton,
              loading && styles.linkedInButtonDisabled,
            ]}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                  style={styles.spinner}
                />

                <Text style={styles.linkedInButtonText}>
                  Connecting...
                </Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <View style={styles.linkedinLogo}>
                  <Text style={styles.linkedinLogoText}>in</Text>
                </View>

                <Text style={styles.linkedInButtonText}>
                  Continue with LinkedIn
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Security Message */}
          <View style={styles.securityContainer}>
            <Text style={styles.securityIcon}>🔒</Text>

            <Text style={styles.securityText}>
              Secure authentication powered by LinkedIn
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />

            <Text style={styles.dividerText}>WHY NOKRIHUB?</Text>

            <View style={styles.divider} />
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Text>🤝</Text>
              </View>

              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>
                  Professional Referrals
                </Text>

                <Text style={styles.featureDescription}>
                  Get recommended by people in your network.
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Text>💼</Text>
              </View>

              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>
                  Better Opportunities
                </Text>

                <Text style={styles.featureDescription}>
                  Discover jobs that match your career goals.
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Text>⭐</Text>
              </View>

              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>
                  Build Your Reputation
                </Text>

                <Text style={styles.featureDescription}>
                  Grow your professional network and credibility.
                </Text>
              </View>
            </View>
          </View>

          {/* Terms */}
          <Text style={styles.disclaimer}>
            By continuing, you agree to NokriHub's Terms of Service and
            Privacy Policy. Your basic LinkedIn profile information may be
            used to provide referral and networking features.
          </Text>
        </View>

          <Text style={styles.MyName}>
            Project By SYED MESAM ABBAS & ABDUL MANNAN RANA
          </Text>
        {/* Footer */}
        <View style={styles.footer}>
          

          <Text style={styles.footerText}>
            © 2026 NokriHub
          </Text>

          <Text style={styles.footerDot}>•</Text>

          <Text style={styles.footerText}>
            Referral-Powered Careers
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   COLORS
============================================================ */

const COLORS = {
  background: '#F5F7FB',

  primary: '#0A66C2',
  primaryDark: '#084F96',
  primaryLight: '#EAF3FC',

  text: '#172033',
  textSecondary: '#667085',
  textLight: '#98A2B3',

  white: '#FFFFFF',

  border: '#E4E7EC',
  borderSelected: '#0A66C2',

  success: '#12B76A',

  iconBackground: '#F2F4F7',
};

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
    alignItems: 'center',
  },

  /* ---------------- HEADER ---------------- */

  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },

  logoContainer: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,

    shadowColor: '#0A66C2',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },

  logoN: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: '900',
    fontStyle: 'italic',
  },

  brand: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -1,
  },

  brandHighlight: {
    color: COLORS.primary,
  },

  tagline: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.2,
  },

  headerDescription: {
    marginTop: 7,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 19,
  },

  /* ---------------- CARD ---------------- */

  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },

  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.4,
  },

  cardSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 350,
  },

  /* ---------------- ROLE ---------------- */

  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },

  roleContainer: {
    width: '100%',
    marginBottom: 20,
  },

  roleCard: {
    width: '100%',
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,

    paddingHorizontal: 14,
    paddingVertical: 12,

    marginBottom: 10,

    backgroundColor: COLORS.white,
  },

  roleCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },

  roleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.iconBackground,
    marginRight: 12,
  },

  roleIconContainerSelected: {
    backgroundColor: COLORS.white,
  },

  roleIcon: {
    fontSize: 22,
  },

  roleContent: {
    flex: 1,
  },

  roleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },

  roleTitleSelected: {
    color: COLORS.primary,
  },

  roleDescription: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D0D5DD',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  radioSelected: {
    borderColor: COLORS.primary,
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },

  /* ---------------- LINKEDIN BUTTON ---------------- */

  linkedInButton: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.primary,

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  linkedInButtonDisabled: {
    opacity: 0.75,
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  linkedinLogo: {
    width: 28,
    height: 28,
    borderRadius: 5,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  linkedinLogoText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '900',
  },

  linkedInButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.1,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  spinner: {
    marginRight: 10,
  },

  /* ---------------- SECURITY ---------------- */

  securityContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 13,
  },

  securityIcon: {
    fontSize: 12,
    marginRight: 5,
  },

  securityText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
  },

  /* ---------------- DIVIDER ---------------- */

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 24,
    marginBottom: 18,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textLight,
    marginHorizontal: 10,
    letterSpacing: 1,
  },

  /* ---------------- FEATURES ---------------- */

  featuresContainer: {
    width: '100%',
  },

  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: COLORS.iconBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  featureContent: {
    flex: 1,
  },

  featureTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  MyName:{
    marginTop: 14,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textSecondary,
  },
  featureDescription: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textSecondary,
  },

  /* ---------------- DISCLAIMER ---------------- */

  disclaimer: {
    marginTop: 8,
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },

  /* ---------------- FOOTER ---------------- */

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  footerText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
  },

  footerDot: {
    fontSize: 11,
    color: COLORS.textLight,
    marginHorizontal: 7,
  },
});













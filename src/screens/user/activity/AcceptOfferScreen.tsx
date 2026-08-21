import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { listUserCVs } from '../../services/cv.service';
import { respondToRequest } from '../../services/recommendations.service';
import { useAuthStore } from '../../store/authStore';
import type { CV } from '../../types/cv';

// =====================================================
// NOKRIHUB LOGO
// =====================================================
// From:
// src/screens/.../AcceptOfferScreen.tsx
//
// ../../../assets/images/NokriHub_Logo.png
// =====================================================
// Import image asset via ESModule import
import LOGO from '../../../../assets/images/Logo.png';

export default function AcceptOfferScreen({ route, navigation }: any) {
  const { requestId } = route.params;
  const session = useAuthStore((s) => s.session);

  const [cvs, setCvs] = useState<CV[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user) {
      listUserCVs(session.user.id)
        .then(setCvs)
        .catch((err) => {
          Alert.alert(
            'Unable to Load CVs',
            err?.message ??
              'Something went wrong while loading your CVs.',
          );
        });
    }
  }, [session]);

  const handleAccept = async () => {
    if (!selectedCvId) {
      Alert.alert(
        'Pick a CV',
        'Please choose which CV the company should see.',
      );
      return;
    }

    setSubmitting(true);

    try {
      await respondToRequest(requestId, 'accepted', selectedCvId);

      Alert.alert(
        'Recommendation Accepted',
        'This recommendation is now attached to the job.',
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('ActivityHome'),
          },
        ],
      );
    } catch (err: any) {
      Alert.alert(
        'Unable to Accept',
        err?.message ?? 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* =====================================================
          PROFESSIONAL NOKRIHUB HEADER
      ====================================================== */}
      <View style={styles.header}>
        {/* Decorative top accent */}
        <View style={styles.headerAccent} />

        {/* Centered Logo */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoGlow}>
            <Image
              source={LOGO}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="NokriHub Logo"
            />
          </View>
        </View>

        {/* Header Text */}
        <View style={styles.headerContent}>
          <Text style={styles.eyebrow}>RECOMMENDATION</Text>

          <Text style={styles.title}>Choose Your CV</Text>

          <Text style={styles.subtitle}>
            Select the CV you want the company to see when reviewing
            your recommendation.
          </Text>
        </View>
      </View>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <View style={styles.content}>
        {cvs.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>📄</Text>
            </View>

            <Text style={styles.emptyTitle}>No CVs Available</Text>

            <Text style={styles.emptyNote}>
              You don't have any CVs yet. Go to My CVs and create one
              first, then come back here.
            </Text>
          </View>
        ) : (
          <>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Available CVs</Text>

                <Text style={styles.sectionSubtitle}>
                  Choose one CV to attach
                </Text>
              </View>

              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{cvs.length}</Text>
              </View>
            </View>

            {/* CV List */}
            {cvs.map((cv) => {
              const isSelected = selectedCvId === cv.id;

              return (
                <TouchableOpacity
                  key={cv.id}
                  activeOpacity={0.82}
                  style={[
                    styles.cvItem,
                    isSelected && styles.cvItemSelected,
                  ]}
                  onPress={() => setSelectedCvId(cv.id)}
                  disabled={submitting}
                >
                  <View
                    style={[
                      styles.cvIconContainer,
                      isSelected && styles.cvIconContainerSelected,
                    ]}
                  >
                    <Text style={styles.cvIcon}>📄</Text>
                  </View>

                  <View style={styles.cvInfo}>
                    <Text style={styles.cvName} numberOfLines={1}>
                      {cv.data?.personalInfo?.fullName || 'Untitled CV'}
                    </Text>

                    <View style={styles.templateRow}>
                      <Text style={styles.templateLabel}>
                        TEMPLATE
                      </Text>

                      <Text
                        style={styles.cvTemplate}
                        numberOfLines={1}
                      >
                        {cv.template_id || 'Default'}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.radio,
                      isSelected && styles.radioSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </View>

      {/* =====================================================
          ACTION BUTTON
      ====================================================== */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.acceptButton,
          (submitting || cvs.length === 0 || !selectedCvId) &&
            styles.acceptButtonDisabled,
        ]}
        onPress={handleAccept}
        disabled={submitting || cvs.length === 0 || !selectedCvId}
      >
        {submitting ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" />

            <Text style={styles.acceptButtonText}>
              Accepting...
            </Text>
          </>
        ) : (
          <>
            <View style={styles.acceptButtonIcon}>
              <Text style={styles.acceptButtonIconText}>✓</Text>
            </View>

            <Text style={styles.acceptButtonText}>
              Accept & Attach CV
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* =====================================================
          PROFESSIONAL FOOTER
      ====================================================== */}
      <View style={styles.footer}>
        <View style={styles.footerAccent} />

        <View style={styles.footerBrand}>
          <View style={styles.footerLogo}>
            <Text style={styles.footerLogoText}>N</Text>
          </View>

          <View style={styles.footerBrandContent}>
            <Text style={styles.footerProject}>
              Project By{' '}
              <Text style={styles.footerName}>
                SYED MESAM ABBAS & ABDUL MANNAN RANA
              </Text>
            </Text>

            <Text style={styles.footerApp}>
              NokriHub • Smart Hiring Platform
            </Text>
          </View>
        </View>

        <Text style={styles.footerCopyright}>
          © {new Date().getFullYear()} NokriHub
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* =====================================================
     SCREEN
  ====================================================== */

  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },

  /* =====================================================
     PROFESSIONAL HEADER
  ====================================================== */

  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 13,
    paddingBottom: 20,
    paddingHorizontal: 18,
    marginBottom: 20,

    borderWidth: 1,
    borderColor: '#E8ECF5',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,

    alignItems: 'center',
  },

  headerAccent: {
    width: 52,
    height: 4,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    marginBottom: 14,
  },

  logoWrapper: {
    width: 86,
    height: 86,
    borderRadius: 24,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E4E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,

    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  logoGlow: {
    width: 74,
    height: 74,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  logo: {
    width: 68,
    height: 68,
  },

  headerContent: {
    width: '100%',
    alignItems: 'center',
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.6,
    color: '#4F46E5',
    marginBottom: 4,
    textAlign: 'center',
  },

  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.6,
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 310,
  },

  /* =====================================================
     CONTENT
  ====================================================== */

  content: {
    flex: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },

  countBadge: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 9,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countBadgeText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '900',
  },

  /* =====================================================
     CV ITEM
  ====================================================== */

  cvItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 13,
    marginBottom: 11,

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  cvItemSelected: {
    backgroundColor: '#F5F7FF',
    borderColor: '#4F46E5',
    borderWidth: 1.5,

    shadowColor: '#4F46E5',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  cvIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },

  cvIconContainerSelected: {
    backgroundColor: '#E0E7FF',
  },

  cvIcon: {
    fontSize: 22,
  },

  cvInfo: {
    flex: 1,
    paddingRight: 10,
  },

  cvName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },

  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  templateLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginRight: 5,
  },

  cvTemplate: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  /* =====================================================
     RADIO
  ====================================================== */

  radio: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioSelected: {
    borderColor: '#4F46E5',
  },

  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#4F46E5',
  },

  /* =====================================================
     EMPTY STATE
  ====================================================== */

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  emptyIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyIcon: {
    fontSize: 32,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },

  emptyNote: {
    fontSize: 12,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
  },

  /* =====================================================
     ACCEPT BUTTON
  ====================================================== */

  acceptButton: {
    height: 55,
    borderRadius: 15,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 14,

    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },

  acceptButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },

  acceptButtonIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  acceptButtonIconText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.1,
  },

  /* =====================================================
     PROFESSIONAL FOOTER
  ====================================================== */

  footer: {
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 4,
  },

  footerAccent: {
    width: 42,
    height: 3,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    marginBottom: 13,
  },

  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerLogo: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  footerLogoText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '900',
  },

  footerBrandContent: {
    alignItems: 'flex-start',
  },

  footerProject: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  footerName: {
    color: '#334155',
    fontWeight: '900',
  },

  footerApp: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 3,
  },

  footerCopyright: {
    color: '#CBD5E1',
    fontSize: 8,
    fontWeight: '500',
    marginTop: 7,
    textAlign: 'center',
  },
});

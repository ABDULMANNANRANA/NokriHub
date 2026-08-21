import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import LOGO from '../../../../assets/images/Logo.png';

import ConnectionPicker from '../../components/user/ConnectionListItem';
import { createRecommendationRequest } from '../../services/recommendations.service';
import { listUserCVs } from '../../services/cv.service';
import { useAuthStore } from '../../store/authStore';
import type { CV } from '../../types/cv';

const COLORS = {
  primary: '#0A66C2',
  primaryDark: '#084F96',
  primaryLight: '#EAF3FC',

  background: '#F5F7FB',
  white: '#FFFFFF',

  text: '#172033',
  secondaryText: '#667085',
  lightText: '#98A2B3',

  border: '#E4E7EC',

  success: '#12B76A',
  successLight: '#ECFDF3',

  warning: '#F79009',
  warningLight: '#FFFAEB',

  danger: '#D92D20',
  dangerLight: '#FEF3F2',

  grayLight: '#F2F4F7',
};

export default function RequestRecommendationScreen({
  route,
  navigation,
}: any) {
  const { jobId } = route.params;

  const session = useAuthStore((s) => s.session);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [note, setNote] = useState('');

  const [cvs, setCvs] = useState<CV[]>([]);
  const [selectedCvId, setSelectedCvId] =
    useState<string | null>(null);

  const [loadingCVs, setLoadingCVs] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  /* ============================================================
     LOAD USER CVS
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    const loadCVs = async () => {
      if (!session?.user?.id) {
        if (mounted) {
          setCvs([]);
          setLoadingCVs(false);
        }

        return;
      }

      setLoadingCVs(true);

      try {
        const data = await listUserCVs(
          session.user.id,
        );

        if (mounted) {
          setCvs(Array.isArray(data) ? data : []);
        }
      } catch (error: any) {
        console.log(
          'Failed to load CVs:',
          error,
        );

        if (mounted) {
          setCvs([]);

          Alert.alert(
            'Unable to Load CVs',
            error?.message ||
              'Could not load your CVs. Please try again.',
          );
        }
      } finally {
        if (mounted) {
          setLoadingCVs(false);
        }
      }
    };

    loadCVs();

    return () => {
      mounted = false;
    };
  }, [session?.user?.id]);

  /* ============================================================
     GET CV NAME
  ============================================================ */

  const getCVName = (cv: CV) => {
    return (
      cv?.data?.personalInfo?.fullName ||
      'Untitled CV'
    );
  };

  /* ============================================================
     SUBMIT REQUEST
  ============================================================ */

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      Alert.alert(
        'Sign In Required',
        'Please sign in before requesting a recommendation.',
      );

      return;
    }

    if (!selectedCvId) {
      Alert.alert(
        'Pick a CV',
        'Choose which CV your connection should review.',
      );

      return;
    }

    if (!selectedId) {
      Alert.alert(
        'Pick a Connection',
        'Choose who you want to ask for a recommendation.',
      );

      return;
    }

    setSubmitting(true);

    try {
      await createRecommendationRequest({
        jobId,
        candidateId: session.user.id,
        recommenderId: selectedId,
        requestedBy: 'candidate',
        note: note.trim(),
        cvId: selectedCvId,
      });

      Alert.alert(
        'Request Sent',
        'Your recommendation request has been sent successfully.',
        [
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (err: any) {
      console.log(
        'Recommendation request failed:',
        err,
      );

      Alert.alert(
        'Unable to Send',
        err?.message ||
          'Something went wrong while sending your request. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* =====================================================
            PROFESSIONAL HEADER WITH CENTERED LOGO
        ===================================================== */}

        <View style={styles.header}>
          <View style={styles.headerLogoContainer}>
            <View style={styles.logoGlow} />

            <View style={styles.logoCard}>
              <Image
                source={LOGO}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.eyebrow}>
              NOKRIHUB • REFERRALS
            </Text>

            <Text style={styles.pageTitle}>
              Request a Recommendation
            </Text>

            <Text style={styles.subtitle}>
              Ask someone in your professional network
              to recommend you for this opportunity.
            </Text>
          </View>
        </View>

        {/* =====================================================
            PROGRESS / INTRO CARD
        ===================================================== */}

        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Text style={styles.introIconText}>
              ⭐
            </Text>
          </View>

          <View style={styles.introContent}>
            <Text style={styles.introTitle}>
              Build your professional network
            </Text>

            <Text style={styles.introText}>
              Choose your CV, select a trusted
              connection, and send a personalized
              recommendation request.
            </Text>
          </View>
        </View>

        {/* =====================================================
            CV SECTION
        ===================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            1. Choose Your CV
          </Text>

          <Text style={styles.sectionSubtitle}>
            Select the CV you want your connection
            to review.
          </Text>
        </View>

        {loadingCVs ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
            />

            <Text style={styles.loadingText}>
              Loading your CVs...
            </Text>
          </View>
        ) : cvs.length === 0 ? (
          <View style={styles.emptyCVCard}>
            <View style={styles.emptyCVIcon}>
              <Text style={styles.emptyCVIconText}>
                📄
              </Text>
            </View>

            <View style={styles.emptyCVContent}>
              <Text style={styles.emptyCVTitle}>
                No CVs available
              </Text>

              <Text style={styles.emptyCVText}>
                You need to create a CV before you
                can request a recommendation.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.cvList}>
            {cvs.map((cv) => {
              const isSelected =
                selectedCvId === cv.id;

              return (
                <TouchableOpacity
                  key={cv.id}
                  activeOpacity={0.8}
                  style={[
                    styles.cvItem,
                    isSelected &&
                      styles.cvItemSelected,
                  ]}
                  onPress={() =>
                    setSelectedCvId(cv.id)
                  }
                  disabled={submitting}
                >
                  <View
                    style={[
                      styles.cvIcon,
                      isSelected &&
                        styles.cvIconSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.cvIconText,
                        isSelected &&
                          styles.cvIconTextSelected,
                      ]}
                    >
                      📄
                    </Text>
                  </View>

                  <View style={styles.cvContent}>
                    <Text
                      style={styles.cvName}
                      numberOfLines={1}
                    >
                      {getCVName(cv)}
                    </Text>

                    <Text style={styles.cvSubtitle}>
                      {cv.template_id
                        ? `Template: ${cv.template_id}`
                        : 'Professional CV'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.radioOuter,
                      isSelected &&
                        styles.radioOuterSelected,
                    ]}
                  >
                    {isSelected && (
                      <View
                        style={styles.radioInner}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* =====================================================
            CONNECTION SECTION
        ===================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            2. Choose a Connection
          </Text>

          <Text style={styles.sectionSubtitle}>
            Who would you like to recommend you?
          </Text>
        </View>

        <View style={styles.connectionCard}>
          <ConnectionPicker
            onSelect={(id) =>
              setSelectedId(id)
            }
            selectedId={selectedId}
          />
        </View>

        {/* =====================================================
            NOTE SECTION
        ===================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            3. Add a Personal Note
          </Text>

          <Text style={styles.sectionSubtitle}>
            Explain why you believe you are a good
            fit for the role.
          </Text>
        </View>

        <View style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <View style={styles.noteIcon}>
              <Text style={styles.noteIconText}>
                ✎
              </Text>
            </View>

            <View>
              <Text style={styles.noteTitle}>
                Your message
              </Text>

              <Text style={styles.noteOptional}>
                Optional
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.input}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholder="Example: I believe my experience and skills make me a strong fit for this opportunity. I would really appreciate your recommendation."
            placeholderTextColor={
              COLORS.lightText
            }
            value={note}
            onChangeText={setNote}
            maxLength={500}
            editable={!submitting}
          />

          <Text style={styles.characterCount}>
            {note.length}/500
          </Text>
        </View>

        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>
              Request Summary
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryBullet}>
              <Text style={styles.summaryBulletText}>
                ✓
              </Text>
            </View>

            <Text style={styles.summaryText}>
              {selectedCvId
                ? 'CV selected'
                : 'Select a CV'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryBullet}>
              <Text style={styles.summaryBulletText}>
                ✓
              </Text>
            </View>

            <Text style={styles.summaryText}>
              {selectedId
                ? 'Connection selected'
                : 'Select a connection'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryBullet}>
              <Text style={styles.summaryBulletText}>
                ✓
              </Text>
            </View>

            <Text style={styles.summaryText}>
              {note.trim()
                ? 'Personal note added'
                : 'Personal note is optional'}
            </Text>
          </View>
        </View>

        {/* =====================================================
            SEND BUTTON
        ===================================================== */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.submitButton,
            (!selectedCvId ||
              !selectedId ||
              submitting ||
              cvs.length === 0) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={
            !selectedCvId ||
            !selectedId ||
            submitting ||
            cvs.length === 0
          }
        >
          {submitting ? (
            <>
              <ActivityIndicator
                size="small"
                color={COLORS.white}
              />

              <Text
                style={styles.submitButtonText}
              >
                Sending Request...
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.submitIcon}>
                ➤
              </Text>

              <Text
                style={styles.submitButtonText}
              >
                Send Recommendation Request
              </Text>
            </>
          )}
        </TouchableOpacity>

        {(!selectedCvId || !selectedId) &&
          cvs.length > 0 && (
            <Text style={styles.helperText}>
              Select a CV and a connection to
              continue.
            </Text>
          )}

        {/* =====================================================
            TIP CARD
        ===================================================== */}

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Text style={styles.tipIconText}>
              💡
            </Text>
          </View>

          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>
              Recommendation tip
            </Text>

            <Text style={styles.tipText}>
              Choose someone who knows your work
              well. A personalized note can make
              your request more meaningful.
            </Text>
          </View>
        </View>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <View style={styles.footer}>
          <View style={styles.footerLine} />

          <View style={styles.footerBrandRow}>
            <View style={styles.footerLogo}>
              <Text style={styles.footerLogoText}>
                N
              </Text>
            </View>

            <View>
              <Text style={styles.footerBrand}>
                NokriHub
              </Text>

              <Text style={styles.footerTagline}>
                Connect • Recommend • Get Hired
              </Text>
            </View>
          </View>

          <Text style={styles.footerCredit}>
            Project By SYED MESAM ABBAS & ABDUL MANNAN RANA
          </Text>

          <Text style={styles.footerDescription}>
            Professional Referral Platform
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 45,
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  header: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    marginBottom: 18,
    alignItems: 'center',

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.055,
    shadowRadius: 12,
    elevation: 3,
  },

  headerLogoContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 15,
  },

  logoGlow: {
    position: 'absolute',
    width: 125,
    height: 75,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.8,
  },

  logoCard: {
    width: 116,
    height: 72,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#D7E9FA',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 3,
  },

  headerLogo: {
    width: 94,
    height: 54,
  },

  headerContent: {
    width: '100%',
    alignItems: 'center',
  },

  eyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 4,
    textAlign: 'center',
  },

  pageTitle: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.6,
    textAlign: 'center',
  },

  subtitle: {
    color: COLORS.secondaryText,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
    maxWidth: 310,
    textAlign: 'center',
  },

  /* ==========================================================
     INTRO
  ========================================================== */

  introCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 19,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },

  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor:
      'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  introIconText: {
    fontSize: 23,
  },

  introContent: {
    flex: 1,
  },

  introTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
  },

  introText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },

  /* ==========================================================
     SECTION HEADER
  ========================================================== */

  sectionHeader: {
    marginTop: 22,
    marginBottom: 9,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  /* ==========================================================
     LOADING CV
  ========================================================== */

  loadingCard: {
    minHeight: 72,
    backgroundColor: COLORS.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  loadingText: {
    color: COLORS.secondaryText,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 9,
  },

  /* ==========================================================
     EMPTY CV
  ========================================================== */

  emptyCVCard: {
    backgroundColor: COLORS.warningLight,
    borderWidth: 1,
    borderColor: '#FDE7C0',
    borderRadius: 17,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  emptyCVIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  emptyCVIconText: {
    fontSize: 20,
  },

  emptyCVContent: {
    flex: 1,
  },

  emptyCVTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '900',
  },

  emptyCVText: {
    color: COLORS.secondaryText,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  /* ==========================================================
     CV LIST
  ========================================================== */

  cvList: {
    gap: 9,
  },

  cvItem: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    padding: 12,

    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 7,
    elevation: 2,
  },

  cvItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },

  cvIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: COLORS.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  cvIconSelected: {
    backgroundColor: COLORS.white,
  },

  cvIconText: {
    fontSize: 19,
  },

  cvIconTextSelected: {
    color: COLORS.primary,
  },

  cvContent: {
    flex: 1,
    minWidth: 0,
  },

  cvName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },

  cvSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 9,
    marginTop: 4,
  },

  radioOuter: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  radioOuterSelected: {
    borderColor: COLORS.primary,
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },

  /* ==========================================================
     CONNECTION
  ========================================================== */

  connectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 2,
  },

  /* ==========================================================
     NOTE
  ========================================================== */

  noteCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 2,
  },

  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  noteIcon: {
    width: 33,
    height: 33,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  noteIconText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '900',
  },

  noteTitle: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '900',
  },

  noteOptional: {
    color: COLORS.lightText,
    fontSize: 8,
    marginTop: 2,
  },

  input: {
    minHeight: 110,

    backgroundColor: '#FAFBFC',

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,

    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,

    paddingHorizontal: 12,
    paddingVertical: 11,
  },

  characterCount: {
    color: COLORS.lightText,
    fontSize: 9,
    textAlign: 'right',
    marginTop: 6,
  },

  /* ==========================================================
     SUMMARY
  ========================================================== */

  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginTop: 20,
  },

  summaryHeader: {
    marginBottom: 9,
  },

  summaryTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '900',
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  summaryBullet: {
    width: 23,
    height: 23,
    borderRadius: 8,
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  summaryBulletText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '900',
  },

  summaryText: {
    flex: 1,
    color: COLORS.secondaryText,
    fontSize: 10,
    fontWeight: '600',
  },

  /* ==========================================================
     SUBMIT
  ========================================================== */

  submitButton: {
    minHeight: 53,
    borderRadius: 14,
    backgroundColor: COLORS.primary,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 20,

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    elevation: 4,
  },

  submitButtonDisabled: {
    opacity: 0.55,
  },

  submitIcon: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
    marginRight: 7,
  },

  submitButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  },

  helperText: {
    color: COLORS.lightText,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 8,
  },

  /* ==========================================================
     TIP
  ========================================================== */

  tipCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7E9FA',
    padding: 13,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  tipIconText: {
    fontSize: 17,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '900',
  },

  tipText: {
    color: COLORS.secondaryText,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 3,
  },

  /* ==========================================================
     FOOTER
  ========================================================== */

  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 18,
    paddingBottom: 8,
  },

  footerLine: {
    width: 55,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.8,
    marginBottom: 17,
  },

  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  footerLogo: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  footerLogoText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
  },

  footerBrand: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '900',
  },

  footerTagline: {
    color: COLORS.secondaryText,
    fontSize: 8,
    marginTop: 2,
  },

  footerCredit: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },

  footerDescription: {
    color: COLORS.lightText,
    fontSize: 8,
    marginTop: 4,
  },
});



















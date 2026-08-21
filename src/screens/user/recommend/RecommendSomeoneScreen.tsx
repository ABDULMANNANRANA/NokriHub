import React, { useState } from 'react';
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
import { useAuthStore } from '../../store/authStore';

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

  danger: '#D92D20',
};

export default function RecommendSomeoneScreen({
  route,
  navigation,
}: any) {
  const { jobId } = route.params;

  const session = useAuthStore((s) => s.session);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [note, setNote] = useState('');
  const [submitting, setSubmitting] =
    useState(false);

  const handleSubmit = async () => {
    if (!session?.user || !selectedId) {
      Alert.alert(
        'Pick a connection',
        'Choose a connection you want to recommend for this role.',
      );
      return;
    }

    setSubmitting(true);

    try {
      await createRecommendationRequest({
        jobId,
        candidateId: selectedId,
        recommenderId: session.user.id,
        requestedBy: 'recommender',
        note: note.trim(),
      });

      Alert.alert(
        'Recommendation Sent',
        'Your recommendation has been sent successfully. They will be notified to review and accept it.',
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
          'Something went wrong while sending the recommendation. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <View style={styles.header}>
          {/* Centered Logo */}
          <View style={styles.logoHeader}>
            <View style={styles.logoContainer}>
              <Image
                source={LOGO}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Header Content */}
          <View style={styles.headerContent}>
            <Text style={styles.eyebrow}>
              NOKRIHUB • RECOMMEND
            </Text>

            <Text style={styles.title}>
              Recommend Someone
            </Text>

            <Text style={styles.subtitle}>
              Help someone in your network discover
              the right opportunity.
            </Text>
          </View>
        </View>

        {/* =====================================================
            INTRO CARD
        ===================================================== */}

        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Text style={styles.introIconText}>
              ⭐
            </Text>
          </View>

          <View style={styles.introContent}>
            <Text style={styles.introTitle}>
              Make a meaningful recommendation
            </Text>

            <Text style={styles.introText}>
              Select a professional from your
              connections who you believe would be a
              strong fit for this job.
            </Text>
          </View>
        </View>

        {/* =====================================================
            CONNECTION SECTION
        ===================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Choose a Connection
          </Text>

          <Text style={styles.sectionSubtitle}>
            Select the person you want to recommend.
          </Text>
        </View>

        <View style={styles.connectionCard}>
          <ConnectionPicker
            onSelect={(id) => setSelectedId(id)}
            selectedId={selectedId}
          />
        </View>

        {/* =====================================================
            NOTE SECTION
        ===================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Why do they fit?
          </Text>

          <Text style={styles.sectionSubtitle}>
            Add a short message explaining why you
            recommend them.
          </Text>
        </View>

        <View style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <View style={styles.noteIcon}>
              <Text style={styles.noteIconText}>
                ✎
              </Text>
            </View>

            <Text style={styles.noteHint}>
              Optional message
            </Text>
          </View>

          <TextInput
            style={styles.input}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholder="Example: They have strong experience in this area and would be a great fit for the role..."
            placeholderTextColor={COLORS.lightText}
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
            SUBMIT BUTTON
        ===================================================== */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.submitButton,
            (!selectedId || submitting) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedId || submitting}
        >
          {submitting ? (
            <>
              <ActivityIndicator
                size="small"
                color={COLORS.white}
              />

              <Text style={styles.submitButtonText}>
                Sending Recommendation...
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.submitIcon}>
                ✓
              </Text>

              <Text style={styles.submitButtonText}>
                Send Recommendation
              </Text>
            </>
          )}
        </TouchableOpacity>

        {!selectedId && (
          <Text style={styles.helperText}>
            Select a connection above to continue.
          </Text>
        )}

        {/* =====================================================
            INFO
        ===================================================== */}

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>
              💡
            </Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Recommendation tip
            </Text>

            <Text style={styles.infoText}>
              A thoughtful recommendation can help
              your connection stand out and increase
              their chances of getting noticed.
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
              <Image
                source={LOGO}
                style={styles.footerLogoImage}
                resizeMode="contain"
              />
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

          <Text style={styles.footerCopyright}>
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
    paddingBottom: 40,
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  header: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
    paddingBottom: 18,
    overflow: 'hidden',

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  logoHeader: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
  },

  logoContainer: {
    width: 150,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 145,
    height: 55,
  },

  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 18,
  },

  eyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 4,
    textAlign: 'center',
  },

  title: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.6,
    textAlign: 'center',
  },

  subtitle: {
    color: COLORS.secondaryText,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
    maxWidth: 290,
    textAlign: 'center',
  },

  /* ==========================================================
     INTRO CARD
  ========================================================== */

  introCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 19,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',

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
    backgroundColor: 'rgba(255,255,255,0.16)',
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
     SECTIONS
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
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  noteIconText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '900',
  },

  noteHint: {
    color: COLORS.secondaryText,
    fontSize: 10,
    fontWeight: '700',
  },

  input: {
    minHeight: 105,
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
     SUBMIT
  ========================================================== */

  submitButton: {
    minHeight: 52,
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
    fontSize: 17,
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
     INFO CARD
  ========================================================== */

  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,

    padding: 13,
    marginTop: 20,

    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#FFF7E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  infoIconText: {
    fontSize: 17,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '900',
  },

  infoText: {
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
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },

  footerLogoImage: {
    width: 34,
    height: 34,
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

  footerCopyright: {
    color: COLORS.lightText,
    fontSize: 8,
    marginTop: 4,
  },
});



















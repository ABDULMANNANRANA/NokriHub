import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import LOGO from '../../../../assets/images/Logo.png';

import { getJob } from '../../services/jobs.service';
import type { Job } from '../../types/job';

/* ============================================================
   COLORS
============================================================ */

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
  divider: '#F2F4F7',

  success: '#12B76A',
  successLight: '#ECFDF3',

  chipBackground: '#F2F4F7',
  chipText: '#475467',

  danger: '#D92D20',
  dangerLight: '#FEF3F2',
};

/* ============================================================
   COMPONENT
============================================================ */

export default function JobDetailScreen({
  route,
  navigation,
}: any) {
  const jobId = route?.params?.jobId;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  /* ==========================================================
     LOAD JOB
  ========================================================== */

  const loadJob = useCallback(
    async (isRefresh = false) => {
      if (!jobId) {
        setError(true);
        setLoading(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(false);

      try {
        const data = await getJob(jobId);

        if (!data) {
          setJob(null);
          setError(true);
          return;
        }

        setJob(data);
      } catch (err) {
        console.error('Failed to load job:', err);
        setError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [jobId],
  );

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  /* ==========================================================
     LOADING SCREEN
  ========================================================== */

  if (loading) {
    return (
      <View style={styles.centerScreen}>
        <StatusBar
          barStyle="dark-content"
        />

        <View style={styles.loadingHeader}>
          <Image
            source={LOGO}
            style={styles.loadingLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.loadingIcon}>
          <Text style={styles.loadingIconText}>💼</Text>
        </View>

        <ActivityIndicator
          size="small"
          color={COLORS.primary}
        />

        <Text style={styles.loadingTitle}>
          Loading job details
        </Text>

        <Text style={styles.loadingSubtitle}>
          Please wait a moment...
        </Text>
      </View>
    );
  }

  /* ==========================================================
     ERROR SCREEN
  ========================================================== */

  if (error || !job) {
    return (
      <View style={styles.centerScreen}>
        <StatusBar
          barStyle="dark-content"
        />

        <View style={styles.errorHeader}>
          <Image
            source={LOGO}
            style={styles.errorLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>!</Text>
        </View>

        <Text style={styles.errorTitle}>
          Job unavailable
        </Text>

        <Text style={styles.errorMessage}>
          We couldn't load this job. It may have been removed
          or there may be a temporary connection problem.
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.retryButton}
          onPress={() => loadJob()}
        >
          <Text style={styles.retryButtonText}>
            Try Again
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButtonSecondary}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonSecondaryText}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ==========================================================
     JOB DATA
  ========================================================== */

  const skills = Array.isArray(job.skills)
    ? job.skills
    : [];

  /* ==========================================================
     MAIN UI
  ========================================================== */

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
      />

      {/* ====================================================
          PROFESSIONAL CENTERED HEADER
      ==================================================== */}

      <View style={styles.header}>
        <View style={styles.headerSide}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.headerBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.headerBackIcon}>‹</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerLogoContainer}>
          <Image
            source={LOGO}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerSide}>
          <View style={styles.headerBadge}>
            <View style={styles.headerBadgeDot} />
            <Text style={styles.headerBadgeText}>
              JOB
            </Text>
          </View>
        </View>
      </View>

      {/* ====================================================
          HEADER BOTTOM ACCENT
      ==================================================== */}

      <View style={styles.headerBottomLine}>
        <View style={styles.headerBottomAccent} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadJob(true)}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* ====================================================
            HERO CARD
        ==================================================== */}

        <View style={styles.heroCard}>
          <View style={styles.heroAccent} />

          <View style={styles.heroTop}>
            <View style={styles.companyLogo}>
              <Text style={styles.companyLogoText}>
                {getInitials(job.title)}
              </Text>
            </View>

            <View style={styles.heroContent}>
              <Text style={styles.jobTitle}>
                {job.title || 'Untitled Position'}
              </Text>

              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>📍</Text>

                <Text style={styles.locationText}>
                  {job.location || 'Location not specified'}
                </Text>
              </View>
            </View>
          </View>

          {/* ==================================================
              JOB META
          ================================================== */}

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <View style={styles.metaIconContainer}>
                <Text style={styles.metaIcon}>💼</Text>
              </View>

              <View style={styles.metaTextContainer}>
                <Text style={styles.metaLabel}>
                  Employment
                </Text>

                <Text style={styles.metaValue}>
                  {formatEmploymentType(
                    job.employment_type,
                  )}
                </Text>
              </View>
            </View>

            {job.salary_band ? (
              <View style={styles.metaItem}>
                <View
                  style={[
                    styles.metaIconContainer,
                    styles.salaryIconContainer,
                  ]}
                >
                  <Text style={styles.metaIcon}>💰</Text>
                </View>

                <View style={styles.metaTextContainer}>
                  <Text style={styles.metaLabel}>
                    Salary
                  </Text>

                  <Text
                    style={[
                      styles.metaValue,
                      styles.salaryValue,
                    ]}
                    numberOfLines={2}
                  >
                    {job.salary_band}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* ====================================================
            DESCRIPTION
        ==================================================== */}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>📄</Text>
            </View>

            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>
                About this position
              </Text>

              <Text style={styles.sectionSubtitle}>
                Job description
              </Text>
            </View>
          </View>

          <Text style={styles.description}>
            {job.description?.trim() ||
              'No job description has been provided.'}
          </Text>
        </View>

        {/* ====================================================
            SKILLS
        ==================================================== */}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>⚡</Text>
            </View>

            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>
                Required skills
              </Text>

              <Text style={styles.sectionSubtitle}>
                Skills for this position
              </Text>
            </View>
          </View>

          {skills.length > 0 ? (
            <View style={styles.skillsContainer}>
              {skills.map((skill, index) => (
                <View
                  key={`${skill}-${index}`}
                  style={styles.skillChip}
                >
                  <View style={styles.skillDot} />

                  <Text style={styles.skillText}>
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.notSpecifiedContainer}>
              <Text style={styles.notSpecifiedIcon}>
                ℹ
              </Text>

              <Text style={styles.notSpecified}>
                No specific skills have been specified.
              </Text>
            </View>
          )}
        </View>

        {/* ====================================================
            REFERRAL INFORMATION
        ==================================================== */}

        <View style={styles.referralCard}>
          <View style={styles.referralTopRow}>
            <View style={styles.referralIcon}>
              <Text style={styles.referralIconText}>
                🤝
              </Text>
            </View>

            <View style={styles.referralBadge}>
              <Text style={styles.referralBadgeText}>
                NOKRIHUB
              </Text>
            </View>
          </View>

          <Text style={styles.referralTitle}>
            Increase your chances with a referral
          </Text>

          <Text style={styles.referralText}>
            Know someone who works in this field? Ask for a
            recommendation or help another professional by
            recommending them.
          </Text>
        </View>

        {/* ====================================================
            ACTION BUTTONS
        ==================================================== */}

        <View style={styles.actionsContainer}>
          {/* Request Recommendation */}

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryButton}
            onPress={() =>
              navigation.navigate(
                'RequestRecommendation',
                {
                  jobId: job.id,
                },
              )
            }
          >
            <View style={styles.primaryButtonIcon}>
              <Text style={styles.primaryButtonIconText}>
                🤝
              </Text>
            </View>

            <View style={styles.buttonTextContainer}>
              <Text style={styles.primaryButtonTitle}>
                Request a Recommendation
              </Text>

              <Text style={styles.primaryButtonSubtitle}>
                Ask someone in your network to refer you
              </Text>
            </View>

            <View style={styles.primaryArrowContainer}>
              <Text style={styles.buttonArrow}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Recommend Someone */}

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.secondaryButton}
            onPress={() =>
              navigation.navigate(
                'RecommendSomeone',
                {
                  jobId: job.id,
                },
              )
            }
          >
            <View style={styles.secondaryButtonIcon}>
              <Text style={styles.secondaryButtonIconText}>
                ⭐
              </Text>
            </View>

            <View style={styles.buttonTextContainer}>
              <Text style={styles.secondaryButtonTitle}>
                Recommend Someone
              </Text>

              <Text style={styles.secondaryButtonSubtitle}>
                Help someone in your professional network
              </Text>
            </View>

            <View style={styles.secondaryArrowContainer}>
              <Text style={styles.secondaryButtonArrow}>
                ›
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ====================================================
            PROFESSIONAL FOOTER
        ==================================================== */}

        <View style={styles.footer}>
          <View style={styles.footerDivider} />

          <View style={styles.footerBrand}>
            <View style={styles.footerLogo}>
              <Image
                source={LOGO}
                style={styles.footerLogoImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.footerBrandText}>
              <Text style={styles.footerProject}>
                Project By{' '}
                <Text style={styles.footerProjectName}>
                 SYED MESAM ABBAS & ABDUL MANNAN RANA
                </Text>
              </Text>

              <Text style={styles.footerAppName}>
                NokriHub • Professional Career Platform
              </Text>
            </View>
          </View>

          <View style={styles.footerSecurity}>
            <Text style={styles.footerSecurityIcon}>
              🔒
            </Text>

            <Text style={styles.footerSecurityText}>
              Your professional connections are handled
              securely by NokriHub.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function getInitials(title?: string): string {
  if (!title || !title.trim()) {
    return 'J';
  }

  const words = title.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[1].charAt(0)
  ).toUpperCase();
}

function formatEmploymentType(
  type?: string,
): string {
  if (!type) {
    return 'Not specified';
  }

  return type
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
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

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },

  /* ==========================================================
     PROFESSIONAL HEADER
  ========================================================== */

  header: {
    height: 72,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,

    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,

    elevation: 3,

    zIndex: 10,
  },

  headerSide: {
    width: 70,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  headerBackButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderColor: '#DDECF9',
  },

  headerBackIcon: {
    color: COLORS.primary,
    fontSize: 31,
    fontWeight: '300',
    lineHeight: 34,
    marginTop: -2,
  },

  headerLogoContainer: {
    flex: 1,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerLogo: {
    width: 150,
    height: 48,
  },

  headerBadge: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: COLORS.primaryLight,

    borderRadius: 20,

    paddingHorizontal: 9,
    paddingVertical: 7,

    borderWidth: 1,
    borderColor: '#DCEBFA',
  },

  headerBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 5,
  },

  headerBadgeText: {
    fontSize: 8,
    color: COLORS.primaryDark,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  headerBottomLine: {
    height: 3,
    backgroundColor: COLORS.primaryLight,
    overflow: 'hidden',
  },

  headerBottomAccent: {
    width: '32%',
    height: 3,
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },

  /* ==========================================================
     LOADING
  ========================================================== */

  centerScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingHeader: {
    width: 210,
    height: 72,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,

    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  loadingLogo: {
    width: 165,
    height: 52,
  },

  loadingIcon: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  loadingIconText: {
    fontSize: 32,
  },

  loadingTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },

  loadingSubtitle: {
    marginTop: 5,
    fontSize: 12,
    color: COLORS.secondaryText,
  },

  /* ==========================================================
     ERROR
  ========================================================== */

  errorHeader: {
    width: 210,
    height: 72,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,

    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  errorLogo: {
    width: 165,
    height: 52,
  },

  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: COLORS.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  errorIconText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.danger,
  },

  errorTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },

  errorMessage: {
    marginTop: 8,
    maxWidth: 330,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.secondaryText,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 22,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 26,
    paddingVertical: 13,
    borderRadius: 12,

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 3,
  },

  retryButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },

  backButtonSecondary: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  backButtonSecondaryText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  /* ==========================================================
     HERO CARD
  ========================================================== */

  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,

    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,

    marginBottom: 14,

    overflow: 'hidden',
  },

  heroAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.primary,
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 17,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  companyLogoText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  heroContent: {
    flex: 1,
    paddingTop: 1,
  },

  jobTitle: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.4,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },

  locationText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.secondaryText,
    fontWeight: '500',
  },

  /* ==========================================================
     META
  ========================================================== */

  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    marginTop: 20,
    paddingTop: 16,

    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',

    marginRight: 20,
    marginBottom: 4,

    flex: 1,
    minWidth: 135,
  },

  metaIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 11,

    backgroundColor: COLORS.chipBackground,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 9,
  },

  salaryIconContainer: {
    backgroundColor: COLORS.successLight,
  },

  metaIcon: {
    fontSize: 17,
  },

  metaTextContainer: {
    flex: 1,
  },

  metaLabel: {
    fontSize: 10,
    color: COLORS.lightText,
    fontWeight: '600',
    marginBottom: 2,
  },

  metaValue: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '800',
    maxWidth: 145,
  },

  salaryValue: {
    color: COLORS.success,
  },

  /* ==========================================================
     SECTION CARD
  ========================================================== */

  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,

    padding: 17,

    borderWidth: 1,
    borderColor: COLORS.border,

    marginBottom: 14,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 7,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,

    backgroundColor: COLORS.primaryLight,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  sectionIconText: {
    fontSize: 17,
  },

  sectionTitleContainer: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: COLORS.lightText,
    fontWeight: '500',
  },

  description: {
    fontSize: 14,
    lineHeight: 23,
    color: '#475467',
  },

  /* ==========================================================
     SKILLS
  ========================================================== */

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: COLORS.chipBackground,

    borderRadius: 9,

    paddingHorizontal: 11,
    paddingVertical: 8,

    borderWidth: 1,
    borderColor: '#EAECF0',
  },

  skillDot: {
    width: 5,
    height: 5,
    borderRadius: 3,

    backgroundColor: COLORS.primary,

    marginRight: 6,
  },

  skillText: {
    fontSize: 11,
    color: COLORS.chipText,
    fontWeight: '700',
  },

  notSpecifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#F9FAFB',

    borderRadius: 10,

    paddingHorizontal: 11,
    paddingVertical: 10,
  },

  notSpecifiedIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,

    backgroundColor: COLORS.primaryLight,

    color: COLORS.primary,

    textAlign: 'center',
    lineHeight: 22,

    fontSize: 12,
    fontWeight: '800',

    marginRight: 8,
  },

  notSpecified: {
    flex: 1,
    color: COLORS.secondaryText,
    fontSize: 12,
    lineHeight: 18,
  },

  /* ==========================================================
     REFERRAL CARD
  ========================================================== */

  referralCard: {
    backgroundColor: COLORS.primaryLight,

    borderRadius: 18,

    padding: 17,

    marginBottom: 16,

    borderWidth: 1,
    borderColor: '#D7E9FA',
  },

  referralTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 12,
  },

  referralIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,

    backgroundColor: COLORS.white,

    alignItems: 'center',
    justifyContent: 'center',
  },

  referralIconText: {
    fontSize: 21,
  },

  referralBadge: {
    backgroundColor: 'rgba(10,102,194,0.10)',
    borderRadius: 20,

    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  referralBadgeText: {
    fontSize: 8,
    color: COLORS.primaryDark,
    fontWeight: '900',
    letterSpacing: 1,
  },

  referralTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },

  referralText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 19,
    color: '#45627C',
  },

  /* ==========================================================
     ACTION BUTTONS
  ========================================================== */

  actionsContainer: {
    marginTop: 2,
  },

  primaryButton: {
    minHeight: 74,

    backgroundColor: COLORS.primary,

    borderRadius: 16,

    paddingHorizontal: 14,
    paddingVertical: 12,

    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 9,
    elevation: 4,

    marginBottom: 10,
  },

  primaryButtonIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,

    backgroundColor: 'rgba(255,255,255,0.16)',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  primaryButtonIconText: {
    fontSize: 20,
  },

  buttonTextContainer: {
    flex: 1,
  },

  primaryButtonTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  },

  primaryButtonSubtitle: {
    color: '#DCEEFF',
    fontSize: 10,
    marginTop: 3,
    lineHeight: 15,
  },

  primaryArrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,

    backgroundColor: 'rgba(255,255,255,0.10)',

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 7,
  },

  buttonArrow: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: '300',
    lineHeight: 24,
  },

  secondaryButton: {
    minHeight: 74,

    backgroundColor: COLORS.white,

    borderRadius: 16,

    paddingHorizontal: 14,
    paddingVertical: 12,

    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1.5,
    borderColor: COLORS.primary,

    marginBottom: 4,
  },

  secondaryButtonIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,

    backgroundColor: COLORS.primaryLight,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  secondaryButtonIconText: {
    fontSize: 18,
  },

  secondaryButtonTitle: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '900',
  },

  secondaryButtonSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 10,
    marginTop: 3,
    lineHeight: 15,
  },

  secondaryArrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,

    backgroundColor: COLORS.primaryLight,

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 7,
  },

  secondaryButtonArrow: {
    color: COLORS.primary,
    fontSize: 23,
    fontWeight: '300',
    lineHeight: 24,
  },

  /* ==========================================================
     PROFESSIONAL FOOTER
  ========================================================== */

  footer: {
    marginTop: 24,
    paddingTop: 18,
    paddingBottom: 8,
  },

  footerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 18,
  },

  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerLogo: {
    width: 34,
    height: 34,
    borderRadius: 10,

    backgroundColor: COLORS.primaryLight,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 9,
  },

  footerLogoImage: {
    width: 27,
    height: 27,
  },

  footerBrandText: {
    alignItems: 'flex-start',
  },

  footerProject: {
    fontSize: 11,
    color: COLORS.lightText,
    fontWeight: '500',
  },

  footerProjectName: {
    color: COLORS.secondaryText,
    fontWeight: '800',
  },

  footerAppName: {
    marginTop: 2,
    fontSize: 9,
    color: COLORS.lightText,
    fontWeight: '500',
  },

  footerSecurity: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 13,

    paddingHorizontal: 20,
  },

  footerSecurityIcon: {
    fontSize: 9,
    marginRight: 5,
  },

  footerSecurityText: {
    fontSize: 9,
    lineHeight: 14,
    color: COLORS.lightText,
    textAlign: 'center',
  },
});



















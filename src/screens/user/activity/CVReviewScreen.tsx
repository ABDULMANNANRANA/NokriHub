import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import LOGO from '../../../../assets/images/Logo.png';

import { supabase } from '../../services/supabase';
import type { CV } from '../../types/cv';

const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primarySoft: '#EFF6FF',

  background: '#F8FAFC',
  white: '#FFFFFF',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textLight: '#94A3B8',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  success: '#16A34A',
  successSoft: '#F0FDF4',

  danger: '#DC2626',
  dangerSoft: '#FEF2F2',

  slateSoft: '#F1F5F9',
};

export default function CVReviewScreen({ route }: any) {
  const { cvId } = route.params ?? {};

  const [cv, setCv] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCV = async (isRefresh = false) => {
    if (!cvId) {
      setError('CV information is missing.');
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const { data, error: fetchError } = await supabase
        .from('cvs')
        .select('*')
        .eq('id', cvId)
        .single();

      if (fetchError) {
        console.error('CV Review Error:', fetchError);

        setCv(null);
        setError('This CV is no longer available.');
        return;
      }

      if (!data) {
        setCv(null);
        setError('This CV is no longer available.');
        return;
      }

      setCv(data as CV);
    } catch (err) {
      console.error('Unexpected CV Review Error:', err);

      setCv(null);
      setError('Unable to load this CV. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCV();
  }, [cvId]);

  /* ====================================================================== */
  /* Loading State                                                          */
  /* ====================================================================== */

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <AppHeader />

        <View style={styles.centerContent}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingIcon}>
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.loadingTitle}>
              Loading CV
            </Text>

            <Text style={styles.loadingSubtitle}>
              Preparing the candidate profile for review...
            </Text>
          </View>
        </View>

        <AppFooter />
      </View>
    );
  }

  /* ====================================================================== */
  /* Error State                                                            */
  /* ====================================================================== */

  if (error || !cv) {
    return (
      <View style={styles.centerContainer}>
        <AppHeader />

        <View style={styles.centerContent}>
          <View style={styles.errorCard}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>
                !
              </Text>
            </View>

            <Text style={styles.errorTitle}>
              CV Unavailable
            </Text>

            <Text style={styles.errorMessage}>
              {error || 'This CV is no longer available.'}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.retryButton}
              onPress={() => loadCV()}
            >
              <Text style={styles.retryButtonText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <AppFooter />
      </View>
    );
  }

  /* ====================================================================== */
  /* CV Data                                                                */
  /* ====================================================================== */

  const data = cv.data;

  const personalInfo = data?.personalInfo ?? {
    fullName: '',
    email: '',
    location: '',
  };

  const experience = Array.isArray(data?.experience)
    ? data.experience
    : [];

  const education = Array.isArray(data?.education)
    ? data.education
    : [];

  const skills = Array.isArray(data?.skills)
    ? data.skills.filter(Boolean)
    : [];

  const fullName =
    personalInfo.fullName?.trim() || 'Untitled CV';

  const email =
    personalInfo.email?.trim() || '';

  const location =
    personalInfo.location?.trim() || '';

  return (
    <View style={styles.container}>
      {/* ================================================================== */}
      {/* Professional Fixed Header                                         */}
      {/* ================================================================== */}

      <AppHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadCV(true)}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* ================================================================ */}
        {/* Page Header                                                       */}
        {/* ================================================================ */}

        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderIcon}>
            <Text style={styles.pageHeaderIconText}>
              CV
            </Text>
          </View>

          <View style={styles.pageHeaderContent}>
            <Text style={styles.pageEyebrow}>
              NOKRIHUB
            </Text>

            <Text style={styles.pageTitle}>
              Candidate Review
            </Text>

            <Text style={styles.pageSubtitle}>
              Review the candidate's professional profile before making a recommendation.
            </Text>
          </View>
        </View>

        {/* ================================================================ */}
        {/* Recommendation Banner                                             */}
        {/* ================================================================ */}

        <View style={styles.reviewBanner}>
          <View style={styles.reviewBannerIcon}>
            <Text style={styles.reviewBannerIconText}>
              ✓
            </Text>
          </View>

          <View style={styles.reviewBannerContent}>
            <Text style={styles.reviewBannerTitle}>
              Recommendation Review
            </Text>

            <Text style={styles.reviewBannerText}>
              You are reviewing this CV on behalf of a recommendation request.
            </Text>
          </View>
        </View>

        {/* ================================================================ */}
        {/* Candidate Profile                                                 */}
        {/* ================================================================ */}

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(fullName)}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text
              style={styles.name}
              numberOfLines={2}
            >
              {fullName}
            </Text>

            {email ? (
              <View style={styles.contactRow}>
                <View style={styles.contactDot} />

                <Text
                  style={styles.contactText}
                  numberOfLines={1}
                >
                  {email}
                </Text>
              </View>
            ) : null}

            {location ? (
              <View style={styles.contactRow}>
                <View style={styles.contactDot} />

                <Text
                  style={styles.contactText}
                  numberOfLines={1}
                >
                  {location}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ================================================================ */}
        {/* Quick Stats                                                        */}
        {/* ================================================================ */}

        <View style={styles.statsRow}>
          <StatCard
            value={experience.length}
            label="Experience"
          />

          <StatCard
            value={education.length}
            label="Education"
          />

          <StatCard
            value={skills.length}
            label="Skills"
          />
        </View>

        {/* ================================================================ */}
        {/* Experience                                                        */}
        {/* ================================================================ */}

        <SectionCard
          title="Experience"
          subtitle="Professional background"
          count={experience.length}
        >
          {experience.length === 0 ? (
            <EmptySection text="No work experience listed." />
          ) : (
            experience.map((item, index) => (
              <View
                key={
                  item?.id ||
                  `experience-${index}`
                }
                style={[
                  styles.timelineItem,
                  index === experience.length - 1 &&
                    styles.lastTimelineItem,
                ]}
              >
                <View style={styles.timelineIndicator}>
                  <View style={styles.timelineDot} />

                  {index !== experience.length - 1 ? (
                    <View style={styles.timelineLine} />
                  ) : null}
                </View>

                <View style={styles.timelineContent}>
                  <Text style={styles.itemTitle}>
                    {item?.role ||
                      'Position not specified'}
                  </Text>

                  <Text style={styles.companyText}>
                    {item?.company ||
                      'Company not specified'}
                  </Text>

                  {item?.startDate ||
                  item?.endDate ? (
                    <View style={styles.dateBadge}>
                      <Text style={styles.dateText}>
                        {item?.startDate ||
                          'Start date'}
                        {'  —  '}
                        {item?.endDate ||
                          'Present'}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </SectionCard>

        {/* ================================================================ */}
        {/* Education                                                          */}
        {/* ================================================================ */}

        <SectionCard
          title="Education"
          subtitle="Academic background"
          count={education.length}
        >
          {education.length === 0 ? (
            <EmptySection text="No education details listed." />
          ) : (
            education.map((item, index) => (
              <View
                key={
                  item?.id ||
                  `education-${index}`
                }
                style={[
                  styles.educationItem,
                  index === education.length - 1 &&
                    styles.lastItem,
                ]}
              >
                <View style={styles.educationIcon}>
                  <Text style={styles.educationIconText}>
                    🎓
                  </Text>
                </View>

                <View style={styles.educationContent}>
                  <Text style={styles.itemTitle}>
                    {item?.degree ||
                      'Degree not specified'}
                  </Text>

                  <Text style={styles.schoolText}>
                    {item?.school ||
                      'Institution not specified'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </SectionCard>

        {/* ================================================================ */}
        {/* Skills                                                             */}
        {/* ================================================================ */}

        <SectionCard
          title="Skills"
          subtitle="Professional capabilities"
          count={skills.length}
        >
          {skills.length === 0 ? (
            <EmptySection text="No skills listed." />
          ) : (
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
          )}
        </SectionCard>

        {/* ================================================================ */}
        {/* Review Information                                                */}
        {/* ================================================================ */}

        <View style={styles.reviewInfoCard}>
          <View style={styles.reviewInfoIcon}>
            <Text style={styles.reviewInfoIconText}>
              i
            </Text>
          </View>

          <View style={styles.reviewInfoContent}>
            <Text style={styles.reviewInfoTitle}>
              Review carefully
            </Text>

            <Text style={styles.reviewInfoText}>
              Consider the candidate's experience,
              education, and skills before making
              a recommendation.
            </Text>
          </View>
        </View>

        {/* ================================================================ */}
        {/* Footer                                                             */}
        {/* ================================================================ */}

        <AppFooter />

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

/* ========================================================================== */
/* Professional Header                                                        */
/* ========================================================================== */

function AppHeader() {
  return (
    <View style={styles.appHeader}>
      <View style={styles.headerSide}>
        <View style={styles.headerStatusDot} />
      </View>

      <View style={styles.headerLogoContainer}>
        <Image
          source={LOGO}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.headerSide}>
        <View style={styles.headerSecureBadge}>
          <Text style={styles.headerSecureText}>
            CV
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ========================================================================== */
/* Stat Card                                                                  */
/* ========================================================================== */

function StatCard({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

/* ========================================================================== */
/* Section Card                                                               */
/* ========================================================================== */

function SectionCard({
  title,
  subtitle,
  count,
  children,
}: {
  title: string;
  subtitle?: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderContent}>
          <Text style={styles.sectionTitle}>
            {title}
          </Text>

          {subtitle ? (
            <Text style={styles.sectionSubtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {typeof count === 'number' ? (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {count}
            </Text>
          </View>
        ) : null}
      </View>

      {children}
    </View>
  );
}

/* ========================================================================== */
/* Empty Section                                                              */
/* ========================================================================== */

function EmptySection({
  text,
}: {
  text: string;
}) {
  return (
    <View style={styles.emptySection}>
      <View style={styles.emptySectionIcon}>
        <Text style={styles.emptySectionIconText}>
          —
        </Text>
      </View>

      <Text style={styles.emptyText}>
        {text}
      </Text>
    </View>
  );
}

/* ========================================================================== */
/* Professional Footer                                                        */
/* ========================================================================== */

function AppFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerLine} />

      <Text style={styles.footerText}>
        Project By{' '}
        <Text style={styles.footerName}>
          SYED MESAM ABBAS & ABDUL MANNAN RANA
        </Text>
      </Text>

      <Text style={styles.footerSubtext}>
        NokriHub • Professional Referral Platform
      </Text>
    </View>
  );
}

/* ========================================================================== */
/* Get Initials                                                               */
/* ========================================================================== */

function getInitials(name: string) {
  const cleanName = name.trim();

  if (!cleanName) {
    return 'CV';
  }

  const parts = cleanName.split(/\s+/);

  if (parts.length === 1) {
    return parts[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

/* ========================================================================== */
/* Styles                                                                     */
/* ========================================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* ====================================================================== */
  /* Professional Header                                                    */
  /* ====================================================================== */

  appHeader: {
    height: 72,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,

    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 5,

    zIndex: 10,
  },

  headerSide: {
    width: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },

  headerLogoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerLogo: {
    width: 145,
    height: 48,
  },

  headerSecureBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerSecureText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  /* ====================================================================== */
  /* Center Content                                                         */
  /* ====================================================================== */

  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  /* ====================================================================== */
  /* Page Header                                                             */
  /* ====================================================================== */

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  pageHeaderIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },

  pageHeaderIconText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  pageHeaderContent: {
    flex: 1,
  },

  pageEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: 2,
  },

  pageTitle: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
    color: COLORS.text,
  },

  pageSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textMuted,
    marginTop: 3,
  },

  /* ====================================================================== */
  /* Loading                                                                 */
  /* ====================================================================== */

  loadingCard: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 30,
    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },

  loadingIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    marginBottom: 17,
  },

  loadingTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 6,
  },

  loadingSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  /* ====================================================================== */
  /* Error                                                                   */
  /* ====================================================================== */

  errorCard: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 30,
    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },

  errorIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.dangerSoft,
    marginBottom: 17,
  },

  errorIconText: {
    fontSize: 29,
    fontWeight: '900',
    color: COLORS.danger,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 8,
  },

  errorMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },

  retryButton: {
    minWidth: 120,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.16,
    shadowRadius: 7,
    elevation: 3,
  },

  retryButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },

  /* ====================================================================== */
  /* Recommendation Banner                                                  */
  /* ====================================================================== */

  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 17,
    padding: 14,
    marginBottom: 14,
  },

  reviewBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginRight: 12,
  },

  reviewBannerIconText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
  },

  reviewBannerContent: {
    flex: 1,
  },

  reviewBannerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1E3A8A',
    marginBottom: 3,
  },

  reviewBannerText: {
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },

  /* ====================================================================== */
  /* Profile                                                                 */
  /* ====================================================================== */

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 9,
    elevation: 2,
  },

  avatar: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  avatarText: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: '900',
  },

  profileInfo: {
    flex: 1,
  },

  name: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 6,
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },

  contactDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 7,
  },

  contactText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
  },

  /* ====================================================================== */
  /* Stats                                                                   */
  /* ====================================================================== */

  statsRow: {
    flexDirection: 'row',
    marginBottom: 14,
    marginHorizontal: -3,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 3,
  },

  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 2,
  },

  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  /* ====================================================================== */
  /* Sections                                                                */
  /* ====================================================================== */

  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.035,
    shadowRadius: 9,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
  },

  sectionHeaderContent: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.text,
  },

  sectionSubtitle: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },

  countBadge: {
    minWidth: 29,
    height: 29,
    paddingHorizontal: 8,
    borderRadius: 15,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  countText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
  },

  /* ====================================================================== */
  /* Experience                                                              */
  /* ====================================================================== */

  timelineItem: {
    flexDirection: 'row',
    minHeight: 91,
  },

  lastTimelineItem: {
    minHeight: 70,
  },

  timelineIndicator: {
    width: 27,
    alignItems: 'center',
    marginRight: 10,
  },

  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    marginTop: 4,
    borderWidth: 3,
    borderColor: '#DBEAFE',
  },

  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#DBEAFE',
    marginTop: 4,
  },

  timelineContent: {
    flex: 1,
    paddingBottom: 19,
  },

  itemTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 4,
  },

  companyText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 7,
  },

  dateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.slateSoft,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  dateText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  /* ====================================================================== */
  /* Education                                                               */
  /* ====================================================================== */

  educationItem: {
    flexDirection: 'row',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  lastItem: {
    paddingBottom: 0,
    marginBottom: 0,
    borderBottomWidth: 0,
  },

  educationIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  educationIconText: {
    fontSize: 19,
  },

  educationContent: {
    flex: 1,
    justifyContent: 'center',
  },

  schoolText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  /* ====================================================================== */
  /* Skills                                                                  */
  /* ====================================================================== */

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 7,
    marginBottom: 7,
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
    fontWeight: '800',
    color: '#1D4ED8',
  },

  /* ====================================================================== */
  /* Empty State                                                             */
  /* ====================================================================== */

  emptySection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.slateSoft,
    borderRadius: 12,
    padding: 11,
  },

  emptySectionIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  emptySectionIconText: {
    color: COLORS.textLight,
    fontSize: 15,
    fontWeight: '900',
  },

  emptyText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
  },

  /* ====================================================================== */
  /* Review Information                                                     */
  /* ====================================================================== */

  reviewInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.successSoft,
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 1,
  },

  reviewInfoIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    marginRight: 10,
  },

  reviewInfoIconText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.success,
  },

  reviewInfoContent: {
    flex: 1,
  },

  reviewInfoTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#166534',
    marginBottom: 3,
  },

  reviewInfoText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#475569',
  },

  /* ====================================================================== */
  /* Professional Footer                                                    */
  /* ====================================================================== */

  footer: {
    alignItems: 'center',
    paddingTop: 22,
    paddingBottom: 4,
    paddingHorizontal: 16,
  },

  footerLine: {
    width: 42,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    marginBottom: 9,
  },

  footerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  footerName: {
    fontWeight: '900',
    color: COLORS.textSecondary,
  },

  footerSubtext: {
    fontSize: 9,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: 'center',
  },

  bottomSpacing: {
    height: 18,
  },
});



















import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getCompanyRecommendations } from '../../services/recommendations.service';
import { useAuthStore } from '../../store/authStore';
import ErrorState from '../../components/shared/ErrorState';
// Import image asset via ESModule import
import LOGO from '../../../../assets/images/Logo.png';

/* ========================================================================== */
/* Status Configuration                                                       */
/* ========================================================================== */

const statusColors: Record<string, string> = {
  new: '#2563EB',
  reviewed: '#D97706',
  hired: '#16A34A',
  rejected: '#DC2626',
};

const statusBackgrounds: Record<string, string> = {
  new: '#EFF6FF',
  reviewed: '#FFFBEB',
  hired: '#F0FDF4',
  rejected: '#FEF2F2',
};

const statusLabels: Record<string, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  hired: 'Hired',
  rejected: 'Rejected',
};

/* ========================================================================== */
/* Types                                                                      */
/* ========================================================================== */

type Recommendation = {
  id: string;
  status?: string | null;
  cv_id?: string | null;

  candidate?: {
    name?: string | null;
    full_name?: string | null;
    email?: string | null;
    location?: string | null;
  } | null;

  job?: {
    title?: string | null;
  } | null;

  recommender?: {
    name?: string | null;
    full_name?: string | null;
  } | null;
};

/* ========================================================================== */
/* Screen                                                                     */
/* ========================================================================== */

export default function CandidatePoolOverviewScreen({
  navigation,
}: any) {
  const session = useAuthStore((s) => s.session);

  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const loadRecommendations = useCallback(
    async (isRefresh = false) => {
      if (!session?.user?.id) {
        setRecs([]);
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(false);

        const result = await getCompanyRecommendations(
          session.user.id,
        );

        setRecs(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error('Failed to load candidate pool:', err);
        setError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session?.user?.id],
  );

  useFocusEffect(
    useCallback(() => {
      loadRecommendations();

      return undefined;
    }, [loadRecommendations]),
  );

  /* ---------------------------------------------------------------------- */
  /* Loading State                                                           */
  /* ---------------------------------------------------------------------- */

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingCard}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator
              size="large"
              color="#2563EB"
            />
          </View>

          <Text style={styles.loadingTitle}>
            Loading Candidate Pool
          </Text>

          <Text style={styles.loadingSubtitle}>
            Gathering recommendations for your jobs...
          </Text>
        </View>
      </View>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Error State                                                             */
  /* ---------------------------------------------------------------------- */

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <ErrorState
          message="Couldn't load candidates."
          onRetry={() => loadRecommendations()}
        />
      </View>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Statistics                                                              */
  /* ---------------------------------------------------------------------- */

  const total = recs.length;

  const newCount = recs.filter(
    (item) => item.status === 'new',
  ).length;

  const reviewedCount = recs.filter(
    (item) => item.status === 'reviewed',
  ).length;

  const hiredCount = recs.filter(
    (item) => item.status === 'hired',
  ).length;

  const rejectedCount = recs.filter(
    (item) => item.status === 'rejected',
  ).length;

  const cvCount = recs.filter(
    (item) => Boolean(item.cv_id),
  ).length;

  return (
    <View style={styles.container}>
      <FlatList
        data={recs}
        keyExtractor={(item, index) =>
          item?.id || `recommendation-${index}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          recs.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadRecommendations(true)}
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
        ListHeaderComponent={
          <View>
            {/* ------------------------------------------------------------ */}
            {/* Professional NokriHub Header                                 */}
            {/* ------------------------------------------------------------ */}

            <View style={styles.logoHeader}>
              <View style={styles.logoGlow}>
                <View style={styles.logoContainer}>
                  <Image
                    source={LOGO}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <View style={styles.headerDivider} />

              <View style={styles.headerTitleRow}>
                <View style={styles.headerAccent} />

                <View style={styles.headerTitleContent}>
                  <Text style={styles.headerEyebrow}>
                    TALENT MANAGEMENT
                  </Text>

                  <Text style={styles.headerTitle}>
                    Candidate Pool
                  </Text>

                  <Text style={styles.headerSubtitle}>
                    Review talented candidates recommended for
                    your company's job openings.
                  </Text>
                </View>
              </View>
            </View>

            {/* ------------------------------------------------------------ */}
            {/* Statistics                                                     */}
            {/* ------------------------------------------------------------ */}

            <View style={styles.statsGrid}>
              <StatCard
                value={total}
                label="Total"
                icon="👥"
                background="#EFF6FF"
                textColor="#2563EB"
              />

              <StatCard
                value={newCount}
                label="New"
                icon="✦"
                background="#EFF6FF"
                textColor="#2563EB"
              />

              <StatCard
                value={reviewedCount}
                label="Reviewed"
                icon="✓"
                background="#FFFBEB"
                textColor="#D97706"
              />

              <StatCard
                value={hiredCount}
                label="Hired"
                icon="★"
                background="#F0FDF4"
                textColor="#16A34A"
              />
            </View>

            {/* ------------------------------------------------------------ */}
            {/* Overview Banner                                                */}
            {/* ------------------------------------------------------------ */}

            {total > 0 ? (
              <View style={styles.overviewCard}>
                <View style={styles.overviewIcon}>
                  <Text style={styles.overviewIconText}>
                    📄
                  </Text>
                </View>

                <View style={styles.overviewContent}>
                  <Text style={styles.overviewTitle}>
                    {cvCount} of {total} candidates have CVs
                  </Text>

                  <Text style={styles.overviewText}>
                    Candidates with attached CVs can be reviewed
                    directly from the candidate pool.
                  </Text>
                </View>

                <View style={styles.overviewCount}>
                  <Text style={styles.overviewCountText}>
                    {cvCount}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* ------------------------------------------------------------ */}
            {/* Section Heading                                                */}
            {/* ------------------------------------------------------------ */}

            {total > 0 ? (
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>
                    Recommended Candidates
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    {total}{' '}
                    {total === 1
                      ? 'candidate'
                      : 'candidates'}{' '}
                    in your talent pool
                  </Text>
                </View>

                <View style={styles.sectionCount}>
                  <Text style={styles.sectionCountText}>
                    {total}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>
                👥
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              No Candidates Yet
            </Text>

            <Text style={styles.emptyMessage}>
              No candidates have been recommended for your
              jobs yet. Once someone recommends a candidate,
              they will appear here.
            </Text>

            <View style={styles.emptyHint}>
              <Text style={styles.emptyHintIcon}>
                ✦
              </Text>

              <Text style={styles.emptyHintText}>
                Recommended candidates will appear automatically.
              </Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
          const candidateName =
            item?.candidate?.name ||
            item?.candidate?.full_name ||
            'Unnamed Candidate';

          const recommenderName =
            item?.recommender?.name ||
            item?.recommender?.full_name ||
            'Unknown User';

          const jobTitle =
            item?.job?.title ||
            'Job position not specified';

          const status =
            item?.status?.toLowerCase() || 'new';

          const statusColor =
            statusColors[status] || '#64748B';

          const statusBackground =
            statusBackgrounds[status] || '#F1F5F9';

          const statusLabel =
            statusLabels[status] ||
            capitalize(status);

          return (
            <View style={styles.candidateCard}>
              {/* Candidate Header */}
              <View style={styles.candidateHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(candidateName)}
                  </Text>
                </View>

                <View style={styles.candidateInfo}>
                  <Text
                    style={styles.candidateName}
                    numberOfLines={2}
                  >
                    {candidateName}
                  </Text>

                  <View style={styles.jobRow}>
                    <Text style={styles.jobIconSmall}>
                      💼
                    </Text>

                    <Text
                      style={styles.jobText}
                      numberOfLines={1}
                    >
                      {jobTitle}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        statusBackground,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          statusColor,
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: statusColor,
                      },
                    ]}
                  >
                    {statusLabel}
                  </Text>
                </View>
              </View>

              {/* Recommendation Information */}
              <View style={styles.recommendationRow}>
                <View style={styles.recommendationIcon}>
                  <Text style={styles.recommendationIconText}>
                    ✓
                  </Text>
                </View>

                <View style={styles.recommendationContent}>
                  <Text style={styles.recommendationLabel}>
                    RECOMMENDED BY
                  </Text>

                  <Text
                    style={styles.recommenderName}
                    numberOfLines={1}
                  >
                    {recommenderName}
                  </Text>
                </View>

                <View style={styles.recommendationBadge}>
                  <Text style={styles.recommendationBadgeText}>
                    Referral
                  </Text>
                </View>
              </View>

              {/* Candidate Details */}
              {item?.candidate?.email ||
              item?.candidate?.location ? (
                <View style={styles.detailsContainer}>
                  {item?.candidate?.email ? (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailIcon}>
                        ✉
                      </Text>

                      <Text
                        style={styles.detailText}
                        numberOfLines={1}
                      >
                        {item.candidate.email}
                      </Text>
                    </View>
                  ) : null}

                  {item?.candidate?.location ? (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailIcon}>
                        📍
                      </Text>

                      <Text
                        style={styles.detailText}
                        numberOfLines={1}
                      >
                        {item.candidate.location}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {/* CV Action */}
              {item?.cv_id ? (
                <TouchableOpacity
                  style={styles.viewCvButton}
                  activeOpacity={0.82}
                  onPress={() =>
                    navigation.navigate(
                      'CVReview',
                      {
                        cvId: item.cv_id,
                      },
                    )
                  }
                >
                  <View style={styles.cvIcon}>
                    <Text style={styles.cvIconText}>
                      📄
                    </Text>
                  </View>

                  <View style={styles.cvContent}>
                    <Text style={styles.viewCvTitle}>
                      View Candidate CV
                    </Text>

                    <Text style={styles.viewCvSubtitle}>
                      Review experience, education & skills
                    </Text>
                  </View>

                  <View style={styles.arrowCircle}>
                    <Text style={styles.arrow}>
                      ›
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.noCvContainer}>
                  <View style={styles.noCvIcon}>
                    <Text style={styles.noCvIconText}>
                      —
                    </Text>
                  </View>

                  <View style={styles.noCvContent}>
                    <Text style={styles.noCvTitle}>
                      No CV Attached
                    </Text>

                    <Text style={styles.noCvText}>
                      This recommendation does not include a CV.
                    </Text>
                  </View>
                </View>
              )}

              {/* Candidate Number */}
              <View style={styles.candidateFooter}>
                <Text style={styles.candidateNumber}>
                  CANDIDATE #{String(index + 1).padStart(2, '0')}
                </Text>

                <View style={styles.candidateFooterLine} />
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          total > 0 ? (
            <View style={styles.footer}>
              <View style={styles.footerDivider} />

              <View style={styles.footerBrand}>
                <View style={styles.footerBrandIcon}>
                  <Text style={styles.footerBrandIconText}>
                    N
                  </Text>
                </View>

                <View style={styles.footerBrandContent}>
                  <Text style={styles.footerProjectName}>
                    NokriHub
                  </Text>

                  <Text style={styles.footerCredit}>
                    Project By SYED MESAM ABBAS & ABDUL MANNAN RANA
                  </Text>
                </View>
              </View>

              <View style={styles.footerSummary}>
                <View style={styles.footerSummaryDot} />

                <Text style={styles.footerSummaryText}>
                  {rejectedCount > 0
                    ? `${rejectedCount} candidate${
                        rejectedCount === 1 ? '' : 's'
                      } rejected`
                    : 'Keep reviewing your recommended candidates'}
                </Text>
              </View>

              <Text style={styles.footerCopyright}>
                Talent management made simple
              </Text>
            </View>
          ) : undefined
        }
      />
    </View>
  );
}

/* ========================================================================== */
/* Statistics Card                                                            */
/* ========================================================================== */

function StatCard({
  value,
  label,
  icon,
  background,
  textColor,
}: {
  value: number;
  label: string;
  icon: string;
  background: string;
  textColor: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statCardInner}>
        <View
          style={[
            styles.statIcon,
            {
              backgroundColor: background,
            },
          ]}
        >
          <Text
            style={[
              styles.statIconText,
              {
                color: textColor,
              },
            ]}
          >
            {icon}
          </Text>
        </View>

        <Text style={styles.statValue}>
          {value}
        </Text>

        <Text style={styles.statLabel}>
          {label}
        </Text>
      </View>
    </View>
  );
}

/* ========================================================================== */
/* Helpers                                                                    */
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

function capitalize(value: string) {
  if (!value) {
    return 'New';
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

/* ========================================================================== */
/* Styles                                                                     */
/* ========================================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  /* ---------------------------------------------------------------------- */
  /* Loading                                                                 */
  /* ---------------------------------------------------------------------- */

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },

  loadingCard: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },

  loadingIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginBottom: 18,
  },

  loadingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },

  loadingSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
  },

  /* ---------------------------------------------------------------------- */
  /* Error                                                                   */
  /* ---------------------------------------------------------------------- */

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
  },

  /* ---------------------------------------------------------------------- */
  /* Professional Logo Header                                                */
  /* ---------------------------------------------------------------------- */

  logoHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.055,
    shadowRadius: 16,
    elevation: 3,
  },

  logoGlow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  logoContainer: {
    width: 104,
    height: 76,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },

  logo: {
    width: 88,
    height: 60,
  },

  headerDivider: {
    height: 1,
    width: '100%',
    backgroundColor: '#EEF2F7',
    marginBottom: 16,
  },

  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  headerAccent: {
    width: 4,
    minHeight: 67,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginRight: 12,
  },

  headerTitleContent: {
    flex: 1,
  },

  headerEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.35,
    color: '#2563EB',
    marginBottom: 3,
  },

  headerTitle: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    marginTop: 5,
  },

  /* ---------------------------------------------------------------------- */
  /* Statistics                                                              */
  /* ---------------------------------------------------------------------- */

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
    marginBottom: 12,
  },

  statCard: {
    width: '50%',
    paddingHorizontal: 5,
    marginBottom: 10,
  },

  statCardInner: {
    minHeight: 102,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 1,
  },

  statIcon: {
    position: 'absolute',
    right: 13,
    top: 13,
    width: 34,
    height: 34,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statIconText: {
    fontSize: 14,
    fontWeight: '800',
  },

  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },

  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },

  /* ---------------------------------------------------------------------- */
  /* Overview                                                                */
  /* ---------------------------------------------------------------------- */

  overviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 17,
    padding: 13,
    marginBottom: 21,
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.025,
    shadowRadius: 8,
    elevation: 1,
  },

  overviewIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginRight: 11,
  },

  overviewIconText: {
    fontSize: 18,
  },

  overviewContent: {
    flex: 1,
  },

  overviewTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 3,
  },

  overviewText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#64748B',
  },

  overviewCount: {
    minWidth: 35,
    height: 35,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginLeft: 8,
  },

  overviewCountText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },

  /* ---------------------------------------------------------------------- */
  /* Section Header                                                          */
  /* ---------------------------------------------------------------------- */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitleContainer: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  sectionCount: {
    minWidth: 35,
    height: 35,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sectionCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },

  /* ---------------------------------------------------------------------- */
  /* Candidate Card                                                          */
  /* ---------------------------------------------------------------------- */

  candidateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },

  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  candidateInfo: {
    flex: 1,
    paddingRight: 7,
  },

  candidateName: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 5,
  },

  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  jobIconSmall: {
    fontSize: 11,
    marginRight: 5,
  },

  jobText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },

  /* ---------------------------------------------------------------------- */
  /* Status                                                                  */
  /* ---------------------------------------------------------------------- */

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  /* ---------------------------------------------------------------------- */
  /* Recommendation                                                          */
  /* ---------------------------------------------------------------------- */

  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 13,
    padding: 10,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  recommendationIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    marginRight: 10,
  },

  recommendationIconText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '800',
  },

  recommendationContent: {
    flex: 1,
  },

  recommendationLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#94A3B8',
    marginBottom: 2,
  },

  recommenderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },

  recommendationBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    marginLeft: 8,
  },

  recommendationBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },

  /* ---------------------------------------------------------------------- */
  /* Candidate Details                                                       */
  /* ---------------------------------------------------------------------- */

  detailsContainer: {
    marginBottom: 11,
    paddingHorizontal: 2,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  detailIcon: {
    width: 20,
    fontSize: 11,
    color: '#64748B',
  },

  detailText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
  },

  /* ---------------------------------------------------------------------- */
  /* CV Button                                                               */
  /* ---------------------------------------------------------------------- */

  viewCvButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 14,
    padding: 11,
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },

  cvIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginRight: 10,
  },

  cvIconText: {
    fontSize: 17,
  },

  cvContent: {
    flex: 1,
  },

  viewCvTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },

  viewCvSubtitle: {
    fontSize: 9,
    color: '#DBEAFE',
  },

  arrowCircle: {
    width: 29,
    height: 29,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginLeft: 8,
  },

  arrow: {
    fontSize: 23,
    lineHeight: 24,
    color: '#FFFFFF',
    marginTop: -2,
  },

  /* ---------------------------------------------------------------------- */
  /* No CV                                                                   */
  /* ---------------------------------------------------------------------- */

  noCvContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 11,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  noCvIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    marginRight: 10,
  },

  noCvIconText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#94A3B8',
  },

  noCvContent: {
    flex: 1,
  },

  noCvTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 2,
  },

  noCvText: {
    fontSize: 9,
    color: '#94A3B8',
  },

  /* ---------------------------------------------------------------------- */
  /* Candidate Number                                                        */
  /* ---------------------------------------------------------------------- */

  candidateFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  candidateNumber: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: '#CBD5E1',
  },

  candidateFooterLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 8,
  },

  /* ---------------------------------------------------------------------- */
  /* Empty State                                                             */
  /* ---------------------------------------------------------------------- */

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.035,
    shadowRadius: 12,
    elevation: 2,
  },

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginBottom: 17,
  },

  emptyIconText: {
    fontSize: 31,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 7,
  },

  emptyMessage: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 18,
  },

  emptyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    width: '100%',
  },

  emptyHintIcon: {
    fontSize: 13,
    color: '#2563EB',
    marginRight: 7,
  },

  emptyHintText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 15,
    color: '#64748B',
    textAlign: 'center',
  },

  /* ---------------------------------------------------------------------- */
  /* Footer                                                                  */
  /* ---------------------------------------------------------------------- */

  footer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },

  footerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 18,
  },

  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  footerBrandIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    marginRight: 9,
  },

  footerBrandIconText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  footerBrandContent: {
    alignItems: 'flex-start',
  },

  footerProjectName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.2,
  },

  footerCredit: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },

  footerSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  footerSummaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginRight: 7,
  },

  footerSummaryText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },

  footerCopyright: {
    fontSize: 9,
    color: '#CBD5E1',
    marginTop: 9,
  },
});




















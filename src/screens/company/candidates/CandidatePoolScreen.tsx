import React, { useCallback, useEffect, useState } from 'react';
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

import { getRecommendationsForJob } from '../../services/recommendations.service';
// Import image asset via ESModule import
import LOGO from '../../../../assets/images/Logo.png';

/* ========================================================================== */
/* Types                                                                      */
/* ========================================================================== */

type Recommendation = {
  id: string;
  cv_id?: string | null;

  candidate?: {
    name?: string | null;
    full_name?: string | null;
    email?: string | null;
    location?: string | null;
  } | null;

  recommender?: {
    name?: string | null;
    full_name?: string | null;
    email?: string | null;
  } | null;
};

/* ========================================================================== */
/* Screen                                                                     */
/* ========================================================================== */

export default function CandidatePoolScreen({
  route,
  navigation,
}: any) {
  const { jobId, jobTitle } = route.params ?? {};

  const [recommendations, setRecommendations] = useState<
    Recommendation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = useCallback(
    async (isRefresh = false) => {
      if (!jobId) {
        setError('Job information is missing.');
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

        const result = await getRecommendationsForJob(jobId);

        setRecommendations(
          Array.isArray(result) ? result : [],
        );
      } catch (err) {
        console.error('Candidate Pool Error:', err);

        setRecommendations([]);

        setError(
          'Unable to load recommendations. Please try again.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [jobId],
  );

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const cvCount = recommendations.filter(
    (item) => Boolean(item?.cv_id),
  ).length;

  /* ---------------------------------------------------------------------- */
  /* Loading                                                                 */
  /* ---------------------------------------------------------------------- */

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.loadingCard}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator
              size="large"
              color="#2563EB"
            />
          </View>

          <Text style={styles.loadingTitle}>
            Loading Candidates
          </Text>

          <Text style={styles.loadingSubtitle}>
            Finding candidates recommended for this position...
          </Text>
        </View>
      </View>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Error                                                                   */
  /* ---------------------------------------------------------------------- */

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorCard}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>
              !
            </Text>
          </View>

          <Text style={styles.errorTitle}>
            Unable to Load
          </Text>

          <Text style={styles.errorMessage}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            activeOpacity={0.82}
            onPress={() => loadRecommendations()}
          >
            <Text style={styles.retryButtonText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <View style={styles.container}>
      <FlatList
        data={recommendations}
        keyExtractor={(item, index) =>
          item?.id || `recommendation-${index}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          recommendations.length === 0 &&
            styles.emptyListContent,
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
            {/* ---------------------------------------------------------- */}
            {/* Professional NokriHub Header                                */}
            {/* ---------------------------------------------------------- */}

            <View style={styles.brandHeaderCard}>
              {/* Logo */}
              <View style={styles.logoSection}>
                <View style={styles.logoOuter}>
                  <View style={styles.logoInner}>
                    <Image
                      source={LOGO}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  </View>
                </View>

                <Text style={styles.brandName}>
                  NokriHub
                </Text>

                <Text style={styles.brandTagline}>
                  Connect • Recommend • Grow
                </Text>
              </View>

              {/* Divider */}
              <View style={styles.brandDivider} />

              {/* Job Information */}
              <View style={styles.jobInfoSection}>
                <View style={styles.jobInfoAccent} />

                <View style={styles.jobHeaderContent}>
                  <View style={styles.headerLabelRow}>
                    <View style={styles.headerLabelDot} />

                    <Text style={styles.headerLabel}>
                      CANDIDATE POOL
                    </Text>
                  </View>

                  <Text
                    style={styles.jobTitle}
                    numberOfLines={2}
                  >
                    {jobTitle || 'Job Position'}
                  </Text>

                  <Text style={styles.jobDescription}>
                    Review candidates recommended for this
                    position.
                  </Text>
                </View>
              </View>

              {/* Statistics */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <Text style={styles.statIconText}>
                      👥
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.statNumber}>
                      {recommendations.length}
                    </Text>

                    <Text style={styles.statLabel}>
                      {recommendations.length === 1
                        ? 'Recommendation'
                        : 'Recommendations'}
                    </Text>
                  </View>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <Text style={styles.statIconText}>
                      📄
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.statNumber}>
                      {cvCount}
                    </Text>

                    <Text style={styles.statLabel}>
                      CVs Available
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ---------------------------------------------------------- */}
            {/* Section Heading                                             */}
            {/* ---------------------------------------------------------- */}

            {recommendations.length > 0 ? (
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderContent}>
                  <Text style={styles.sectionTitle}>
                    Recommended Candidates
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Review candidates recommended for this job.
                  </Text>
                </View>

                <View style={styles.sectionCount}>
                  <Text style={styles.sectionCountText}>
                    {recommendations.length}
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
              No Recommendations Yet
            </Text>

            <Text style={styles.emptyMessage}>
              There are currently no candidates recommended
              for this job. Check back later for new
              recommendations.
            </Text>

            <View style={styles.emptyHint}>
              <Text style={styles.emptyHintIcon}>
                ✦
              </Text>

              <Text style={styles.emptyHintText}>
                New recommendations will appear here automatically.
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

          const candidateEmail =
            item?.candidate?.email || '';

          const candidateLocation =
            item?.candidate?.location || '';

          return (
            <View style={styles.candidateCard}>
              {/* -------------------------------------------------------- */}
              {/* Candidate Header                                          */}
              {/* -------------------------------------------------------- */}

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

                  {candidateEmail ? (
                    <View style={styles.metaRow}>
                      <Text style={styles.metaIcon}>
                        ✉
                      </Text>

                      <Text
                        style={styles.candidateMeta}
                        numberOfLines={1}
                      >
                        {candidateEmail}
                      </Text>
                    </View>
                  ) : null}

                  {candidateLocation ? (
                    <View style={styles.metaRow}>
                      <Text style={styles.metaIcon}>
                        📍
                      </Text>

                      <Text
                        style={styles.candidateMeta}
                        numberOfLines={1}
                      >
                        {candidateLocation}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>
                    #{String(index + 1).padStart(2, '0')}
                  </Text>
                </View>
              </View>

              {/* -------------------------------------------------------- */}
              {/* Recommendation Info                                      */}
              {/* -------------------------------------------------------- */}

              <View style={styles.recommendationBox}>
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

                <View style={styles.referralBadge}>
                  <Text style={styles.referralBadgeText}>
                    Referral
                  </Text>
                </View>
              </View>

              {/* -------------------------------------------------------- */}
              {/* CV Action                                                  */}
              {/* -------------------------------------------------------- */}

              {item?.cv_id ? (
                <TouchableOpacity
                  style={styles.viewCvButton}
                  activeOpacity={0.82}
                  onPress={() =>
                    navigation.navigate('CVReview', {
                      cvId: item.cv_id,
                    })
                  }
                >
                  <View style={styles.cvButtonIcon}>
                    <Text style={styles.cvButtonIconText}>
                      📄
                    </Text>
                  </View>

                  <View style={styles.cvButtonContent}>
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

              {/* -------------------------------------------------------- */}
              {/* Candidate Number                                          */}
              {/* -------------------------------------------------------- */}

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
          recommendations.length > 0 ? (
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

              <View style={styles.footerBadge}>
                <View style={styles.footerBadgeDot} />

                <Text style={styles.footerBadgeText}>
                  Candidate recommendations
                </Text>
              </View>

              <Text style={styles.footerTagline}>
                Connecting talent with opportunity
              </Text>
            </View>
          ) : undefined
        }
      />
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

/* ========================================================================== */
/* Styles                                                                     */
/* ========================================================================== */

const styles = StyleSheet.create({
  /* ---------------------------------------------------------------------- */
  /* Main                                                                    */
  /* ---------------------------------------------------------------------- */

  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  /* ---------------------------------------------------------------------- */
  /* Loading                                                                 */
  /* ---------------------------------------------------------------------- */

  centerContainer: {
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
    padding: 30,
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

  errorCard: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },

  errorIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    marginBottom: 16,
  },

  errorIconText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#DC2626',
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },

  errorMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },

  retryButton: {
    minWidth: 130,
    backgroundColor: '#2563EB',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 13,
    alignItems: 'center',
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* ---------------------------------------------------------------------- */
  /* Professional NokriHub Header                                            */
  /* ---------------------------------------------------------------------- */

  brandHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.055,
    shadowRadius: 18,
    elevation: 3,
  },

  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
    paddingBottom: 15,
  },

  logoOuter: {
    width: 112,
    height: 82,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.10,
    shadowRadius: 13,
    elevation: 3,
  },

  logoInner: {
    width: 102,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 92,
    height: 62,
  },

  brandName: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 10,
    letterSpacing: 0.2,
  },

  brandTagline: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 1,
    marginTop: 3,
  },

  brandDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#EEF2F7',
    marginBottom: 16,
  },

  jobInfoSection: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  jobInfoAccent: {
    width: 4,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginRight: 12,
  },

  jobHeaderContent: {
    flex: 1,
  },

  headerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  headerLabelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginRight: 6,
  },

  headerLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: '#2563EB',
  },

  jobTitle: {
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 5,
  },

  jobDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: '#64748B',
  },

  /* ---------------------------------------------------------------------- */
  /* Header Statistics                                                       */
  /* ---------------------------------------------------------------------- */

  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  statIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  statIconText: {
    fontSize: 14,
  },

  statNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },

  statLabel: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },

  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
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

  sectionHeaderContent: {
    flex: 1,
    paddingRight: 10,
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
    minWidth: 37,
    height: 37,
    paddingHorizontal: 9,
    borderRadius: 12,
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
    marginBottom: 15,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
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
    marginBottom: 4,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },

  metaIcon: {
    width: 18,
    fontSize: 10,
    color: '#94A3B8',
  },

  candidateMeta: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
  },

  rankBadge: {
    minWidth: 40,
    height: 29,
    paddingHorizontal: 8,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },

  rankText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },

  /* ---------------------------------------------------------------------- */
  /* Recommendation                                                         */
  /* ---------------------------------------------------------------------- */

  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 11,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  recommendationIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  recommendationIconText: {
    color: '#16A34A',
    fontSize: 15,
    fontWeight: '800',
  },

  recommendationContent: {
    flex: 1,
  },

  recommendationLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#94A3B8',
    marginBottom: 2,
  },

  recommenderName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },

  referralBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginLeft: 8,
  },

  referralBadgeText: {
    fontSize: 9,
    fontWeight: '700',
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

  cvButtonIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginRight: 10,
  },

  cvButtonIconText: {
    fontSize: 17,
  },

  cvButtonContent: {
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
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
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
  /* Candidate Footer                                                       */
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
    width: 74,
    height: 74,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginBottom: 17,
  },

  emptyIconText: {
    fontSize: 30,
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
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
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
    paddingTop: 7,
    paddingBottom: 14,
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
    marginBottom: 11,
  },

  footerBrandIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },

  footerBrandIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  footerBrandContent: {
    alignItems: 'flex-start',
  },

  footerProjectName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.2,
  },

  footerCredit: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },

  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  footerBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginRight: 7,
  },

  footerBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },

  footerTagline: {
    fontSize: 9,
    color: '#CBD5E1',
    marginTop: 9,
  },
});






























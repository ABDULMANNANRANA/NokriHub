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

import { listCompanyJobs } from '../../services/jobs.service';
import { getRecommendationsForJob } from '../../services/recommendations.service';
import { useAuthStore } from '../../store/authStore';
import ErrorState from '../../components/shared/ErrorState';
import type { Job } from '../../types/job';

// Import image asset via ESModule import
import LOGO from '../../../../assets/images/Logo.png';

interface JobWithCount extends Job {
  recommendationCount: number;
}

export default function CompanyDashboardScreen({ navigation }: any) {
  const session = useAuthStore((s) => s.session);

  const [jobs, setJobs] = useState<JobWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!session?.user?.id) {
        setJobs([]);
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
        const companyJobs = await listCompanyJobs(session.user.id);

        const withCounts: JobWithCount[] = await Promise.all(
          companyJobs.map(async (job) => {
            try {
              const recommendations =
                await getRecommendationsForJob(job.id);

              return {
                ...job,
                recommendationCount: Array.isArray(recommendations)
                  ? recommendations.length
                  : 0,
              };
            } catch (recommendationError) {
              console.log(
                `Failed to load recommendations for job ${job.id}:`,
                recommendationError,
              );

              return {
                ...job,
                recommendationCount: 0,
              };
            }
          }),
        );

        setJobs(withCounts);
      } catch (err) {
        console.log('Failed to load company dashboard:', err);
        setJobs([]);
        setError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleRefresh = useCallback(() => {
    load(true);
  }, [load]);

  const handleJobPress = useCallback(
    (job: JobWithCount) => {
      navigation.navigate('CandidatePool', {
        jobId: job.id,
        jobTitle: job.title,
      });
    },
    [navigation],
  );

  /* ====================================================================== */
  /* Loading                                                                */
  /* ====================================================================== */

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <View style={styles.loadingLogoContainer}>
            <Image
              source={LOGO}
              style={styles.loadingLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.loadingIconContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>

          <Text style={styles.loadingTitle}>
            Loading dashboard
          </Text>

          <Text style={styles.loadingText}>
            Getting your job postings and recommendations...
          </Text>
        </View>
      </View>
    );
  }

  /* ====================================================================== */
  /* Error                                                                  */
  /* ====================================================================== */

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorLogoHeader}>
          <Image
            source={LOGO}
            style={styles.errorLogo}
            resizeMode="contain"
          />
        </View>

        <ErrorState
          message="Couldn't load your dashboard."
          onRetry={() => load()}
        />
      </View>
    );
  }

  const totalRecommendations = jobs.reduce(
    (total, job) => total + job.recommendationCount,
    0,
  );

  return (
    <View style={styles.container}>
      <FlatList<JobWithCount>
        data={jobs}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          jobs.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
        ListHeaderComponent={
          <View>
            {/* ========================================================== */}
            {/* Professional NokriHub Header                              */}
            {/* ========================================================== */}

            <View style={styles.logoHeader}>
              <View style={styles.logoHeaderGlow} />

              <View style={styles.logoWrapper}>
                <Image
                  source={LOGO}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* ========================================================== */}
            {/* Dashboard Introduction                                    */}
            {/* ========================================================== */}

            <View style={styles.headerSection}>
              <View style={styles.headerTextContainer}>
                <View style={styles.headerLabelRow}>
                  <View style={styles.headerLabelDot} />

                  <Text style={styles.welcomeText}>
                    COMPANY DASHBOARD
                  </Text>
                </View>

                <Text style={styles.headerTitle}>
                  Your job postings
                </Text>

                <Text style={styles.headerSubtitle}>
                  Manage your jobs and discover recommended candidates.
                </Text>
              </View>

              <View style={styles.headerIcon}>
                <Text style={styles.headerIconText}>💼</Text>
              </View>
            </View>

            {/* ========================================================== */}
            {/* Statistics                                                 */}
            {/* ========================================================== */}

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Text style={styles.statIcon}>📋</Text>
                </View>

                <View style={styles.statContent}>
                  <Text style={styles.statValue}>
                    {jobs.length}
                  </Text>

                  <Text style={styles.statLabel}>
                    {jobs.length === 1
                      ? 'Active Job'
                      : 'Job Postings'}
                  </Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    styles.recommendationIconContainer,
                  ]}
                >
                  <Text style={styles.statIcon}>⭐</Text>
                </View>

                <View style={styles.statContent}>
                  <Text style={styles.statValue}>
                    {totalRecommendations}
                  </Text>

                  <Text style={styles.statLabel}>
                    {totalRecommendations === 1
                      ? 'Recommendation'
                      : 'Recommendations'}
                  </Text>
                </View>
              </View>
            </View>

            {/* ========================================================== */}
            {/* Section Header                                             */}
            {/* ========================================================== */}

            {jobs.length > 0 ? (
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>
                    Posted Jobs
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Select a job to review recommended candidates
                  </Text>
                </View>

                <View style={styles.sectionCountBadge}>
                  <Text style={styles.sectionCount}>
                    {jobs.length}
                  </Text>

                  <Text style={styles.sectionCountLabel}>
                    {jobs.length === 1 ? 'JOB' : 'JOBS'}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
            </View>

            <Text style={styles.emptyTitle}>
              No jobs posted yet
            </Text>

            <Text style={styles.emptyText}>
              You haven't posted any jobs yet. Create your first
              job posting to start receiving candidate
              recommendations.
            </Text>

            <TouchableOpacity
              style={styles.postJobButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('PostJob')}
            >
              <Text style={styles.postJobButtonPlus}>＋</Text>

              <Text style={styles.postJobButtonText}>
                Post a Job
              </Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const recommendationText =
            item.recommendationCount === 1
              ? '1 Recommendation'
              : `${item.recommendationCount} Recommendations`;

          const location =
            item.location?.trim() || 'Location not specified';

          const employmentType =
            item.employment_type?.trim() ||
            'Employment type not specified';

          const status =
            (item as Job & { status?: string }).status?.toLowerCase() ||
            'active';

          const isActive =
            status === 'active' ||
            status === 'open' ||
            status === 'published';

          return (
            <TouchableOpacity
              style={styles.jobCard}
              activeOpacity={0.88}
              onPress={() => handleJobPress(item)}
            >
              {/* ====================================================== */}
              {/* Job Top Row                                             */}
              {/* ====================================================== */}

              <View style={styles.jobTopRow}>
                <View style={styles.jobIconContainer}>
                  <Text style={styles.jobIcon}>💼</Text>
                </View>

                <View style={styles.jobTitleContainer}>
                  <Text
                    style={styles.jobTitle}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,
                      isActive
                        ? styles.activeStatusBadge
                        : styles.inactiveStatusBadge,
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        isActive
                          ? styles.activeStatusDot
                          : styles.inactiveStatusDot,
                      ]}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        isActive
                          ? styles.activeStatusText
                          : styles.inactiveStatusText,
                      ]}
                    >
                      {isActive ? 'Active' : 'Closed'}
                    </Text>
                  </View>
                </View>

                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>›</Text>
                </View>
              </View>

              {/* ====================================================== */}
              {/* Job Details                                             */}
              {/* ====================================================== */}

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Text style={styles.detailIcon}>📍</Text>
                  </View>

                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>
                      LOCATION
                    </Text>

                    <Text
                      style={styles.detailText}
                      numberOfLines={1}
                    >
                      {location}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.detailRow,
                    styles.detailRowLast,
                  ]}
                >
                  <View style={styles.detailIconContainer}>
                    <Text style={styles.detailIcon}>⏱</Text>
                  </View>

                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>
                      EMPLOYMENT TYPE
                    </Text>

                    <Text
                      style={styles.detailText}
                      numberOfLines={1}
                    >
                      {employmentType}
                    </Text>
                  </View>
                </View>
              </View>

              {/* ====================================================== */}
              {/* Divider                                                  */}
              {/* ====================================================== */}

              <View style={styles.divider} />

              {/* ====================================================== */}
              {/* Bottom Row                                               */}
              {/* ====================================================== */}

              <View style={styles.jobBottomRow}>
                <View style={styles.recommendationContainer}>
                  <View style={styles.recommendationIcon}>
                    <Text style={styles.recommendationIconText}>
                      ★
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.recommendationText}>
                      {recommendationText}
                    </Text>

                    <Text style={styles.recommendationSubtext}>
                      Candidate pool
                    </Text>
                  </View>
                </View>

                <View style={styles.viewCandidatesContainer}>
                  <Text style={styles.viewCandidatesText}>
                    View candidates
                  </Text>

                  <Text style={styles.viewCandidatesArrow}>
                    →
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={JobSeparator}
        ListFooterComponent={DashboardFooter}
      />
    </View>
  );
}

/* ========================================================================== */
/* List Components                                                            */
/* ========================================================================== */

function JobSeparator() {
  return <View style={styles.cardSeparator} />;
}

function DashboardFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerLine} />

      <View style={styles.footerBrand}>
        <View style={styles.footerIcon}>
          <Text style={styles.footerIconText}>N</Text>
        </View>

        <View style={styles.footerTextContainer}>
          <Text style={styles.footerProject}>
            NokriHub
          </Text>

          <Text style={styles.footerCredit}>
            Project By SYED MESAM ABBAS & ABDUL MANNAN RANA
          </Text>
        </View>
      </View>

      <Text style={styles.footerTagline}>
        Connecting talent with opportunity
      </Text>
    </View>
  );
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
    backgroundColor: '#F5F7FB',
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  /* ---------------------------------------------------------------------- */
  /* Loading                                                                 */
  /* ---------------------------------------------------------------------- */

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  loadingCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingVertical: 30,
    paddingHorizontal: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },

  loadingLogoContainer: {
    width: 190,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  loadingLogo: {
    width: 180,
    height: 58,
  },

  loadingIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  loadingTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },

  loadingText: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
    textAlign: 'center',
  },

  /* ---------------------------------------------------------------------- */
  /* Error                                                                   */
  /* ---------------------------------------------------------------------- */

  errorContainer: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    padding: 20,
    justifyContent: 'center',
  },

  errorLogoHeader: {
    position: 'absolute',
    top: 35,
    left: 0,
    right: 0,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorLogo: {
    width: 175,
    height: 55,
  },

  /* ---------------------------------------------------------------------- */
  /* Professional Logo Header                                               */
  /* ---------------------------------------------------------------------- */

  logoHeader: {
    height: 92,
    marginBottom: 22,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.055,
    shadowRadius: 14,
    elevation: 3,
  },

  logoHeaderGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#EFF6FF',
    opacity: 0.75,
  },

  logoWrapper: {
    width: 210,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderRadius: 18,
  },

  logo: {
    width: 190,
    height: 64,
  },

  /* ---------------------------------------------------------------------- */
  /* Dashboard Header                                                       */
  /* ---------------------------------------------------------------------- */

  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 16,
  },

  headerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  headerLabelDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginRight: 7,
  },

  welcomeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 1,
  },

  headerTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#111827',
  },

  headerSubtitle: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
  },

  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 19,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  headerIconText: {
    fontSize: 27,
  },

  /* ---------------------------------------------------------------------- */
  /* Statistics                                                              */
  /* ---------------------------------------------------------------------- */

  statsContainer: {
    flexDirection: 'row',
    marginBottom: 26,
    marginHorizontal: -4,
  },

  statCard: {
    flex: 1,
    minHeight: 90,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginHorizontal: 4,
  },

  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  recommendationIconContainer: {
    backgroundColor: '#FEF3C7',
  },

  statIcon: {
    fontSize: 20,
  },

  statContent: {
    flex: 1,
  },

  statValue: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
  },

  statLabel: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 15,
    color: '#6B7280',
  },

  /* ---------------------------------------------------------------------- */
  /* Section Header                                                          */
  /* ---------------------------------------------------------------------- */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  sectionHeaderText: {
    flex: 1,
    paddingRight: 10,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#94A3B8',
  },

  sectionCountBadge: {
    minWidth: 48,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionCount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },

  sectionCountLabel: {
    marginTop: 1,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#60A5FA',
  },

  /* ---------------------------------------------------------------------- */
  /* Separator                                                               */
  /* ---------------------------------------------------------------------- */

  cardSeparator: {
    height: 12,
  },

  /* ---------------------------------------------------------------------- */
  /* Job Card                                                                */
  /* ---------------------------------------------------------------------- */

  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.055,
    shadowRadius: 12,
    elevation: 3,
  },

  jobTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  jobIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  jobIcon: {
    fontSize: 22,
  },

  jobTitleContainer: {
    flex: 1,
    paddingRight: 8,
  },

  jobTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '800',
    color: '#111827',
  },

  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 7,
  },

  activeStatusBadge: {
    backgroundColor: '#ECFDF5',
  },

  inactiveStatusBadge: {
    backgroundColor: '#F3F4F6',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  activeStatusDot: {
    backgroundColor: '#10B981',
  },

  inactiveStatusDot: {
    backgroundColor: '#9CA3AF',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  activeStatusText: {
    color: '#047857',
  },

  inactiveStatusText: {
    color: '#6B7280',
  },

  arrowContainer: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  arrow: {
    fontSize: 25,
    lineHeight: 27,
    color: '#64748B',
    fontWeight: '400',
  },

  /* ---------------------------------------------------------------------- */
  /* Job Details                                                             */
  /* ---------------------------------------------------------------------- */

  detailsContainer: {
    marginTop: 17,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  detailRowLast: {
    marginBottom: 0,
  },

  detailIconContainer: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  detailIcon: {
    fontSize: 13,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 2,
  },

  detailText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },

  /* ---------------------------------------------------------------------- */
  /* Divider                                                                 */
  /* ---------------------------------------------------------------------- */

  divider: {
    height: 1,
    backgroundColor: '#EEF0F4',
    marginVertical: 14,
  },

  /* ---------------------------------------------------------------------- */
  /* Job Bottom                                                              */
  /* ---------------------------------------------------------------------- */

  jobBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  recommendationIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  recommendationIconText: {
    fontSize: 13,
    color: '#D97706',
  },

  recommendationText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
  },

  recommendationSubtext: {
    marginTop: 1,
    fontSize: 9,
    color: '#94A3B8',
  },

  viewCandidatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },

  viewCandidatesText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },

  viewCandidatesArrow: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },

  /* ---------------------------------------------------------------------- */
  /* Empty State                                                             */
  /* ---------------------------------------------------------------------- */

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    minHeight: 430,
  },

  emptyIconContainer: {
    width: 86,
    height: 86,
    borderRadius: 26,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  emptyIcon: {
    fontSize: 36,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },

  emptyText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 21,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 340,
  },

  postJobButton: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 23,
    paddingVertical: 13,
    borderRadius: 13,
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  postJobButtonPlus: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '500',
    marginRight: 5,
  },

  postJobButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  /* ---------------------------------------------------------------------- */
  /* Footer                                                                  */
  /* ---------------------------------------------------------------------- */

  footer: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },

  footerLine: {
    width: 55,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#DBEAFE',
    marginBottom: 18,
  },

  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  footerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  footerIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  footerTextContainer: {
    alignItems: 'flex-start',
  },

  footerProject: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },

  footerCredit: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },

  footerTagline: {
    marginTop: 9,
    fontSize: 9,
    color: '#CBD5E1',
    fontWeight: '600',
  },
});


















// import React, { useCallback, useState } from 'react';
// import {
//   ActivityIndicator,
//   FlatList,
//   RefreshControl,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';

// import { listCompanyJobs } from '../../services/jobs.service';
// import { getRecommendationsForJob } from '../../services/recommendations.service';
// import { useAuthStore } from '../../store/authStore';
// import ErrorState from '../../components/shared/ErrorState';
// import type { Job } from '../../types/job';

// interface JobWithCount extends Job {
//   recommendationCount: number;
// }

// export default function CompanyDashboardScreen({ navigation }: any) {
//   const session = useAuthStore((s) => s.session);

//   const [jobs, setJobs] = useState<JobWithCount[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(false);

//   const load = useCallback(
//     async (isRefresh = false) => {
//       if (!session?.user?.id) {
//         setJobs([]);
//         setLoading(false);
//         return;
//       }

//       if (isRefresh) {
//         setRefreshing(true);
//       } else {
//         setLoading(true);
//       }

//       setError(false);

//       try {
//         const companyJobs = await listCompanyJobs(session.user.id);

//         const withCounts: JobWithCount[] = await Promise.all(
//           companyJobs.map(async (job) => {
//             try {
//               const recommendations = await getRecommendationsForJob(job.id);

//               return {
//                 ...job,
//                 recommendationCount: Array.isArray(recommendations)
//                   ? recommendations.length
//                   : 0,
//               };
//             } catch (recommendationError) {
//               console.log(
//                 `Failed to load recommendations for job ${job.id}:`,
//                 recommendationError,
//               );

//               return {
//                 ...job,
//                 recommendationCount: 0,
//               };
//             }
//           }),
//         );

//         setJobs(withCounts);
//       } catch (err) {
//         console.log('Failed to load company dashboard:', err);
//         setJobs([]);
//         setError(true);
//       } finally {
//         setLoading(false);
//         setRefreshing(false);
//       }
//     },
//     [session],
//   );

//   useFocusEffect(
//     useCallback(() => {
//       load();
//     }, [load]),
//   );

//   const handleRefresh = useCallback(() => {
//     load(true);
//   }, [load]);

//   const handleJobPress = useCallback(
//     (job: JobWithCount) => {
//       navigation.navigate('CandidatePool', {
//         jobId: job.id,
//         jobTitle: job.title,
//       });
//     },
//     [navigation],
//   );

//   /* ---------------------------------------------------------------------- */
//   /* Loading                                                                */
//   /* ---------------------------------------------------------------------- */

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <View style={styles.loadingCard}>
//           <View style={styles.loadingIconContainer}>
//             <ActivityIndicator size="large" color="#2563EB" />
//           </View>

//           <Text style={styles.loadingTitle}>Loading dashboard</Text>

//           <Text style={styles.loadingText}>
//             Getting your job postings and recommendations...
//           </Text>
//         </View>
//       </View>
//     );
//   }

//   /* ---------------------------------------------------------------------- */
//   /* Error                                                                  */
//   /* ---------------------------------------------------------------------- */

//   if (error) {
//     return (
//       <View style={styles.errorContainer}>
//         <ErrorState
//           message="Couldn't load your dashboard."
//           onRetry={() => load()}
//         />
//       </View>
//     );
//   }

//   const totalRecommendations = jobs.reduce(
//     (total, job) => total + job.recommendationCount,
//     0,
//   );

//   return (
//     <View style={styles.container}>
//       <FlatList<JobWithCount>
//         data={jobs}
//         keyExtractor={(item) => item.id}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={[
//           styles.listContent,
//           jobs.length === 0 && styles.emptyListContent,
//         ]}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//             colors={['#2563EB']}
//             tintColor="#2563EB"
//           />
//         }
//         ListHeaderComponent={
//           <View>
//             {/* ============================================================ */}
//             {/* Header                                                       */}
//             {/* ============================================================ */}

//             <View style={styles.headerSection}>
//               <View style={styles.headerTextContainer}>
//                 <View style={styles.headerLabelRow}>
//                   <View style={styles.headerLabelDot} />

//                   <Text style={styles.welcomeText}>
//                     COMPANY DASHBOARD
//                   </Text>
//                 </View>

//                 <Text style={styles.headerTitle}>
//                   Your job postings
//                 </Text>

//                 <Text style={styles.headerSubtitle}>
//                   Manage your jobs and discover recommended candidates.
//                 </Text>
//               </View>

//               <View style={styles.headerIcon}>
//                 <Text style={styles.headerIconText}>💼</Text>
//               </View>
//             </View>

//             {/* ============================================================ */}
//             {/* Statistics                                                   */}
//             {/* ============================================================ */}

//             <View style={styles.statsContainer}>
//               <View style={styles.statCard}>
//                 <View style={styles.statIconContainer}>
//                   <Text style={styles.statIcon}>📋</Text>
//                 </View>

//                 <View style={styles.statContent}>
//                   <Text style={styles.statValue}>
//                     {jobs.length}
//                   </Text>

//                   <Text style={styles.statLabel}>
//                     {jobs.length === 1
//                       ? 'Active Job'
//                       : 'Job Postings'}
//                   </Text>
//                 </View>
//               </View>

//               <View style={styles.statCard}>
//                 <View
//                   style={[
//                     styles.statIconContainer,
//                     styles.recommendationIconContainer,
//                   ]}
//                 >
//                   <Text style={styles.statIcon}>⭐</Text>
//                 </View>

//                 <View style={styles.statContent}>
//                   <Text style={styles.statValue}>
//                     {totalRecommendations}
//                   </Text>

//                   <Text style={styles.statLabel}>
//                     {totalRecommendations === 1
//                       ? 'Recommendation'
//                       : 'Recommendations'}
//                   </Text>
//                 </View>
//               </View>
//             </View>

//             {/* ============================================================ */}
//             {/* Section Header                                               */}
//             {/* ============================================================ */}

//             {jobs.length > 0 ? (
//               <View style={styles.sectionHeader}>
//                 <View>
//                   <Text style={styles.sectionTitle}>
//                     Posted Jobs
//                   </Text>

//                   <Text style={styles.sectionSubtitle}>
//                     Select a job to review recommended candidates
//                   </Text>
//                 </View>

//                 <View style={styles.sectionCountBadge}>
//                   <Text style={styles.sectionCount}>
//                     {jobs.length}
//                   </Text>

//                   <Text style={styles.sectionCountLabel}>
//                     {jobs.length === 1 ? 'JOB' : 'JOBS'}
//                   </Text>
//                 </View>
//               </View>
//             ) : null}
//           </View>
//         }
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <View style={styles.emptyIconContainer}>
//               <Text style={styles.emptyIcon}>📋</Text>
//             </View>

//             <Text style={styles.emptyTitle}>
//               No jobs posted yet
//             </Text>

//             <Text style={styles.emptyText}>
//               You haven't posted any jobs yet. Create your first
//               job posting to start receiving candidate
//               recommendations.
//             </Text>

//             <TouchableOpacity
//               style={styles.postJobButton}
//               activeOpacity={0.85}
//               onPress={() => navigation.navigate('PostJob')}
//             >
//               <Text style={styles.postJobButtonPlus}>＋</Text>

//               <Text style={styles.postJobButtonText}>
//                 Post a Job
//               </Text>
//             </TouchableOpacity>
//           </View>
//         }
//         renderItem={({ item }) => {
//           const recommendationText =
//             item.recommendationCount === 1
//               ? '1 Recommendation'
//               : `${item.recommendationCount} Recommendations`;

//           const location =
//             item.location?.trim() || 'Location not specified';

//           const employmentType =
//             item.employment_type?.trim() ||
//             'Employment type not specified';

//           const status =
//             (item as Job & { status?: string }).status?.toLowerCase() ||
//             'active';

//           const isActive =
//             status === 'active' ||
//             status === 'open' ||
//             status === 'published';

//           return (
//             <TouchableOpacity
//               style={styles.jobCard}
//               activeOpacity={0.88}
//               onPress={() => handleJobPress(item)}
//             >
//               {/* ======================================================== */}
//               {/* Job Top Row                                               */}
//               {/* ======================================================== */}

//               <View style={styles.jobTopRow}>
//                 <View style={styles.jobIconContainer}>
//                   <Text style={styles.jobIcon}>💼</Text>
//                 </View>

//                 <View style={styles.jobTitleContainer}>
//                   <Text
//                     style={styles.jobTitle}
//                     numberOfLines={2}
//                   >
//                     {item.title}
//                   </Text>

//                   <View
//                     style={[
//                       styles.statusBadge,
//                       isActive
//                         ? styles.activeStatusBadge
//                         : styles.inactiveStatusBadge,
//                     ]}
//                   >
//                     <View
//                       style={[
//                         styles.statusDot,
//                         isActive
//                           ? styles.activeStatusDot
//                           : styles.inactiveStatusDot,
//                       ]}
//                     />

//                     <Text
//                       style={[
//                         styles.statusText,
//                         isActive
//                           ? styles.activeStatusText
//                           : styles.inactiveStatusText,
//                       ]}
//                     >
//                       {isActive ? 'Active' : 'Closed'}
//                     </Text>
//                   </View>
//                 </View>

//                 <View style={styles.arrowContainer}>
//                   <Text style={styles.arrow}>›</Text>
//                 </View>
//               </View>

//               {/* ======================================================== */}
//               {/* Job Details                                               */}
//               {/* ======================================================== */}

//               <View style={styles.detailsContainer}>
//                 <View style={styles.detailRow}>
//                   <View style={styles.detailIconContainer}>
//                     <Text style={styles.detailIcon}>📍</Text>
//                   </View>

//                   <View style={styles.detailContent}>
//                     <Text style={styles.detailLabel}>
//                       LOCATION
//                     </Text>

//                     <Text
//                       style={styles.detailText}
//                       numberOfLines={1}
//                     >
//                       {location}
//                     </Text>
//                   </View>
//                 </View>

//                 <View style={styles.detailRow}>
//                   <View style={styles.detailIconContainer}>
//                     <Text style={styles.detailIcon}>⏱</Text>
//                   </View>

//                   <View style={styles.detailContent}>
//                     <Text style={styles.detailLabel}>
//                       EMPLOYMENT TYPE
//                     </Text>

//                     <Text
//                       style={styles.detailText}
//                       numberOfLines={1}
//                     >
//                       {employmentType}
//                     </Text>
//                   </View>
//                 </View>
//               </View>

//               {/* ======================================================== */}
//               {/* Divider                                                    */}
//               {/* ======================================================== */}

//               <View style={styles.divider} />

//               {/* ======================================================== */}
//               {/* Bottom Row                                                 */}
//               {/* ======================================================== */}

//               <View style={styles.jobBottomRow}>
//                 <View style={styles.recommendationContainer}>
//                   <View style={styles.recommendationIcon}>
//                     <Text style={styles.recommendationIconText}>
//                       ★
//                     </Text>
//                   </View>

//                   <View>
//                     <Text style={styles.recommendationText}>
//                       {recommendationText}
//                     </Text>

//                     <Text style={styles.recommendationSubtext}>
//                       Candidate pool
//                     </Text>
//                   </View>
//                 </View>

//                 <View style={styles.viewCandidatesContainer}>
//                   <Text style={styles.viewCandidatesText}>
//                     View candidates
//                   </Text>

//                   <Text style={styles.viewCandidatesArrow}>
//                     →
//                   </Text>
//                 </View>
//               </View>
//             </TouchableOpacity>
//           );
//         }}
//         ItemSeparatorComponent={JobSeparator}
//         ListFooterComponent={DashboardFooter}
//       />
//     </View>
//   );
// }

// /* ========================================================================== */
// /* List Components                                                            */
// /* ========================================================================== */

// /**
//  * Defined outside the main component so FlatList receives a valid
//  * React component instead of an Element | null expression.
//  *
//  * This fixes:
//  *
//  * Type 'Element | null' is not assignable to type
//  * 'Element | ComponentType<any> | undefined'
//  */
// function JobSeparator() {
//   return <View style={styles.cardSeparator} />;
// }

// function DashboardFooter() {
//   return (
//     <View style={styles.footer}>
//       <View style={styles.footerLine} />

//       <View style={styles.footerBrand}>
//         <View style={styles.footerIcon}>
//           <Text style={styles.footerIconText}>N</Text>
//         </View>

//         <View style={styles.footerTextContainer}>
//           <Text style={styles.footerProject}>
//             NokriHub
//           </Text>

//           <Text style={styles.footerCredit}>
//             Project By Syed Mesam Abbas
//           </Text>
//         </View>
//       </View>

//       <Text style={styles.footerTagline}>
//         Connecting talent with opportunity
//       </Text>
//     </View>
//   );
// }

// /* ========================================================================== */
// /* Styles                                                                     */
// /* ========================================================================== */

// const styles = StyleSheet.create({
//   /* ---------------------------------------------------------------------- */
//   /* Main                                                                    */
//   /* ---------------------------------------------------------------------- */

//   container: {
//     flex: 1,
//     backgroundColor: '#F5F7FB',
//   },

//   listContent: {
//     paddingHorizontal: 18,
//     paddingTop: 20,
//     paddingBottom: 12,
//   },

//   emptyListContent: {
//     flexGrow: 1,
//   },

//   /* ---------------------------------------------------------------------- */
//   /* Loading                                                                 */
//   /* ---------------------------------------------------------------------- */

//   loadingContainer: {
//     flex: 1,
//     backgroundColor: '#F5F7FB',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//   },

//   loadingCard: {
//     width: '100%',
//     maxWidth: 360,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 24,
//     paddingVertical: 34,
//     paddingHorizontal: 26,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     shadowColor: '#0F172A',
//     shadowOffset: {
//       width: 0,
//       height: 10,
//     },
//     shadowOpacity: 0.08,
//     shadowRadius: 24,
//     elevation: 5,
//   },

//   loadingIconContainer: {
//     width: 68,
//     height: 68,
//     borderRadius: 22,
//     backgroundColor: '#EFF6FF',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 18,
//   },

//   loadingTitle: {
//     fontSize: 19,
//     fontWeight: '800',
//     color: '#111827',
//   },

//   loadingText: {
//     marginTop: 7,
//     fontSize: 13,
//     lineHeight: 20,
//     color: '#6B7280',
//     textAlign: 'center',
//   },

//   /* ---------------------------------------------------------------------- */
//   /* Error                                                                   */
//   /* ---------------------------------------------------------------------- */

//   errorContainer: {
//     flex: 1,
//     backgroundColor: '#F5F7FB',
//     padding: 20,
//     justifyContent: 'center',
//   },

//   /* ---------------------------------------------------------------------- */
//   /* Header                                                                  */
//   /* ---------------------------------------------------------------------- */

//   headerSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 22,
//   },

//   headerTextContainer: {
//     flex: 1,
//     paddingRight: 16,
//   },

//   headerLabelRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6,
//   },

//   headerLabelDot: {
//     width: 7,
//     height: 7,
//     borderRadius: 4,
//     backgroundColor: '#2563EB',
//     marginRight: 7,
//   },

//   welcomeText: {
//     fontSize: 11,
//     fontWeight: '800',
//     color: '#2563EB',
//     letterSpacing: 1,
//   },

//   headerTitle: {
//     fontSize: 28,
//     lineHeight: 34,
//     fontWeight: '800',
//     color: '#111827',
//   },

//   headerSubtitle: {
//     marginTop: 7,
//     fontSize: 13,
//     lineHeight: 20,
//     color: '#6B7280',
//   },

//   headerIcon: {
//     width: 60,
//     height: 60,
//     borderRadius: 19,
//     backgroundColor: '#DBEAFE',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//     borderColor: '#BFDBFE',
//   },

//   headerIconText: {
//     fontSize: 27,
//   },

//   /* ---------------------------------------------------------------------- */
//   /* Statistics                                                              */
//   /* ---------------------------------------------------------------------- */

//   statsContainer: {
//     flexDirection: 'row',
//     marginBottom: 26,
//   },

//   statCard: {
//     flex: 1,
//     minHeight: 90,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 17,
//     padding: 14,
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     shadowColor: '#0F172A',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.05,
//     shadowRadius: 10,
//     elevation: 2,
//     marginHorizontal: 4,
//   },

//   statIconContainer: {
//     width: 44,
//     height: 44,
//     borderRadius: 13,
//     backgroundColor: '#DBEAFE',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//   },

//   recommendationIconContainer: {
//     backgroundColor: '#FEF3C7',
//   },

//   statIcon: {
//     fontSize: 20,
//   },

//   statContent: {
//     flex: 1,
//   },

//   statValue: {
//     fontSize: 21,
//     fontWeight: '800',
//     color: '#111827',
//   },

//   statLabel: {
//     marginTop: 2,
//     fontSize: 10,
//     lineHeight: 15,
//     color: '#6B7280',
//   },

//   /* ---------------------------------------------------------------------- */
//   /* Section Header                                                          */
//   /* ---------------------------------------------------------------------- */

//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 13,
//   },

//   sectionTitle: {
//     fontSize: 19,
//     fontWeight: '800',
//     color: '#111827',
//   },

//   sectionSubtitle: {
//     marginTop: 3,
//     fontSize: 11,
//     color: '#94A3B8',
//   },

//   sectionCountBadge: {
//     minWidth: 48,
//     paddingHorizontal: 9,
//     paddingVertical: 6,
//     borderRadius: 11,
//     backgroundColor: '#EFF6FF',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   sectionCount: {
//     fontSize: 14,
//     fontWeight: '800',
//     color: '#2563EB',
//   },

//   sectionCountLabel: {
//     marginTop: 1,
//     fontSize: 7,
//     fontWeight: '800',
//     letterSpacing: 0.5,
//     color: '#60A5FA',
//   },

//   /* ---------------------------------------------------------------------- */
//   /* Separator                                                               */
//   /* ---------------------------------------------------------------------- */

//   cardSeparator: {
//     height: 12,
//   },

//   /* ---------------------------------------------------------------------- */
//   /* Job Card                                                                */
//   /* ---------------------------------------------------------------------- */

//   jobCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 19,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     shadowColor: '#0F172A',
//     shadowOffset: {
//       width: 0,
//       height: 5,
//     },
//     shadowOpacity: 0.055,
//     shadowRadius: 12,
//     elevation: 3,
//   },

//   jobTopRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },

//   jobIconContainer: {
//     width: 50,
//     height: 50,
//     borderRadius: 15,
//     backgroundColor: '#EFF6FF',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//     borderWidth: 1,
//     borderColor: '#DBEAFE',
//   },

//   jobIcon: {
//     fontSize: 22,
//   },

//   jobTitleContainer: {
//     flex: 1,
//     paddingRight: 8,
//   },

//   jobTitle: {
//     fontSize: 17,
//     lineHeight: 23,
//     fontWeight: '800',
//     color: '#111827',
//   },

//   statusBadge: {
//     alignSelf: 'flex-start',
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 20,
//     paddingHorizontal: 9,
//     paddingVertical: 5,
//     marginTop: 7,
//   },

//   activeStatusBadge: {
//     backgroundColor: '#ECFDF5',
//   },

//   inactiveStatusBadge: {
//     backgroundColor: '#F3F4F6',
//   },

//   statusDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     marginRight: 5,
//   },

//   activeStatusDot: {
//     backgroundColor: '#10B981',
//   },

//   inactiveStatusDot: {
//     backgroundColor: '#9CA3AF',
//   },

//   statusText: {
//     fontSize: 10,
//     fontWeight: '800',
//   },

//   activeStatusText: {
//     color: '#047857',
//   },

//   inactiveStatusText: {
//     color: '#6B7280',
//   },

//   arrowContainer: {
//     width: 31,
//     height: 31,
//     borderRadius: 10,
//     backgroundColor: '#F8FAFC',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   arrow: {
//     fontSize: 25,
//     lineHeight: 27,
//     color: '#64748B',
//     fontWeight: '400',
//   },

//   /* ---------------------------------------------------------------------- */
//   /* Job Details                                                             */
//   /* ---------------------------------------------------------------------- */

//   detailsContainer: {
//     marginTop: 17,
//   },

//   detailRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },

//   detailRowLast: {
//     marginBottom: 0,
//   },

//   detailIconContainer: {
//     width: 31,
//     height: 31,
//     borderRadius: 9,
//     backgroundColor: '#F8FAFC',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 9,
//   },

//   detailIcon: {
//     fontSize: 13,
//   },

//   detailContent: {
//     flex: 1,
//   },

//   detailLabel: {
//     fontSize: 8,
//     fontWeight: '800',
//     color: '#94A3B8',
//     letterSpacing: 0.6,
//     marginBottom: 2,
//   },

//   detailText: {
//     fontSize: 12,
//     color: '#475569',
//     fontWeight: '600',
//   },

//   /* ---------------------------------------------------------------------- */
//   /* Divider                                                                 */
//   /* ---------------------------------------------------------------------- */

//   divider: {
//     height: 1,
//     backgroundColor: '#EEF0F4',
//     marginVertical: 14,
//   },

//   /* ---------------------------------------------------------------------- */
//   /* Job Bottom                                                              */
//   /* ---------------------------------------------------------------------- */

//   jobBottomRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },

//   recommendationContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },

//   recommendationIcon: {
//     width: 31,
//     height: 31,
//     borderRadius: 10,
//     backgroundColor: '#FEF3C7',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 8,
//   },

//   recommendationIconText: {
//     fontSize: 13,
//     color: '#D97706',
//   },

//   recommendationText: {
//     fontSize: 11,
//     fontWeight: '800',
//     color: '#374151',
//   },

//   recommendationSubtext: {
//     marginTop: 1,
//     fontSize: 9,
//     color: '#94A3B8',
//   },

//   viewCandidatesContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingLeft: 8,
//   },

//   viewCandidatesText: {
//     fontSize: 10,
//     fontWeight: '800',
//     color: '#2563EB',
//   },

//   viewCandidatesArrow: {
//     marginLeft: 4,
//     fontSize: 14,
//     fontWeight: '800',
//     color: '#2563EB',
//   },

//   /* ---------------------------------------------------------------------- */
//   /* Empty State                                                             */
//   /* ---------------------------------------------------------------------- */

//   emptyContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 24,
//     minHeight: 430,
//   },

//   emptyIconContainer: {
//     width: 86,
//     height: 86,
//     borderRadius: 26,
//     backgroundColor: '#DBEAFE',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 18,
//     borderWidth: 1,
//     borderColor: '#BFDBFE',
//   },

//   emptyIcon: {
//     fontSize: 36,
//   },

//   emptyTitle: {
//     fontSize: 21,
//     fontWeight: '800',
//     color: '#111827',
//     textAlign: 'center',
//   },

//   emptyText: {
//     marginTop: 8,
//     fontSize: 13,
//     lineHeight: 21,
//     color: '#6B7280',
//     textAlign: 'center',
//     maxWidth: 340,
//   },

//   postJobButton: {
//     marginTop: 22,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#2563EB',
//     paddingHorizontal: 23,
//     paddingVertical: 13,
//     borderRadius: 13,
//     shadowColor: '#2563EB',
//     shadowOffset: {
//       width: 0,
//       height: 5,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 4,
//   },

//   postJobButtonPlus: {
//     color: '#FFFFFF',
//     fontSize: 19,
//     fontWeight: '500',
//     marginRight: 5,
//   },

//   postJobButtonText: {
//     color: '#FFFFFF',
//     fontSize: 13,
//     fontWeight: '800',
//   },

//   /* ---------------------------------------------------------------------- */
//   /* Footer                                                                  */
//   /* ---------------------------------------------------------------------- */

//   footer: {
//     alignItems: 'center',
//     paddingTop: 30,
//     paddingBottom: 12,
//     paddingHorizontal: 20,
//   },

//   footerLine: {
//     width: 55,
//     height: 3,
//     borderRadius: 2,
//     backgroundColor: '#DBEAFE',
//     marginBottom: 18,
//   },

//   footerBrand: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },

//   footerIcon: {
//     width: 32,
//     height: 32,
//     borderRadius: 10,
//     backgroundColor: '#2563EB',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 9,
//   },

//   footerIconText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '900',
//   },

//   footerTextContainer: {
//     alignItems: 'flex-start',
//   },

//   footerProject: {
//     fontSize: 12,
//     fontWeight: '800',
//     color: '#334155',
//   },

//   footerCredit: {
//     marginTop: 2,
//     fontSize: 10,
//     fontWeight: '600',
//     color: '#94A3B8',
//   },

//   footerTagline: {
//     marginTop: 9,
//     fontSize: 9,
//     color: '#CBD5E1',
//     fontWeight: '600',
//   },
// });


















// // import React, { useCallback, useState } from 'react';
// // import {
// //   ActivityIndicator,
// //   FlatList,
// //   RefreshControl,
// //   StyleSheet,
// //   Text,
// //   TouchableOpacity,
// //   View,
// // } from 'react-native';
// // import { useFocusEffect } from '@react-navigation/native';

// // import { listCompanyJobs } from '../../services/jobs.service';
// // import { getRecommendationsForJob } from '../../services/recommendations.service';
// // import { useAuthStore } from '../../store/authStore';
// // import ErrorState from '../../components/shared/ErrorState';
// // import type { Job } from '../../types/job';

// // interface JobWithCount extends Job {
// //   recommendationCount: number;
// // }

// // export default function CompanyDashboardScreen({ navigation }: any) {
// //   const session = useAuthStore((s) => s.session);

// //   const [jobs, setJobs] = useState<JobWithCount[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [error, setError] = useState(false);

// //   const load = useCallback(
// //     async (isRefresh = false) => {
// //       if (!session?.user?.id) {
// //         setJobs([]);
// //         setLoading(false);
// //         return;
// //       }

// //       if (isRefresh) {
// //         setRefreshing(true);
// //       } else {
// //         setLoading(true);
// //       }

// //       setError(false);

// //       try {
// //         const companyJobs = await listCompanyJobs(session.user.id);

// //         const withCounts: JobWithCount[] = await Promise.all(
// //           companyJobs.map(async (job) => {
// //             try {
// //               const recommendations = await getRecommendationsForJob(job.id);

// //               return {
// //                 ...job,
// //                 recommendationCount: recommendations?.length ?? 0,
// //               };
// //             } catch (recommendationError) {
// //               console.log(
// //                 `Failed to load recommendations for job ${job.id}:`,
// //                 recommendationError,
// //               );

// //               return {
// //                 ...job,
// //                 recommendationCount: 0,
// //               };
// //             }
// //           }),
// //         );

// //         setJobs(withCounts);
// //       } catch (err) {
// //         console.log('Failed to load company dashboard:', err);
// //         setError(true);
// //       } finally {
// //         setLoading(false);
// //         setRefreshing(false);
// //       }
// //     },
// //     [session],
// //   );

// //   useFocusEffect(
// //     useCallback(() => {
// //       load();
// //     }, [load]),
// //   );

// //   const handleRefresh = useCallback(() => {
// //     load(true);
// //   }, [load]);

// //   const handleJobPress = useCallback(
// //     (job: JobWithCount) => {
// //       navigation.navigate('CandidatePool', {
// //         jobId: job.id,
// //         jobTitle: job.title,
// //       });
// //     },
// //     [navigation],
// //   );

// //   if (loading) {
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <View style={styles.loadingCard}>
// //           <ActivityIndicator size="large" color="#2563EB" />

// //           <Text style={styles.loadingTitle}>Loading dashboard</Text>

// //           <Text style={styles.loadingText}>
// //             Getting your job postings and recommendations...
// //           </Text>
// //         </View>
// //       </View>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <View style={styles.errorContainer}>
// //         <ErrorState
// //           message="Couldn't load your dashboard."
// //           onRetry={() => load()}
// //         />
// //       </View>
// //     );
// //   }

// //   const totalRecommendations = jobs.reduce(
// //     (total, job) => total + job.recommendationCount,
// //     0,
// //   );

// //   return (
// //     <View style={styles.container}>
// //       <FlatList
// //         data={jobs}
// //         keyExtractor={(item) => item.id}
// //         showsVerticalScrollIndicator={false}
// //         contentContainerStyle={[
// //           styles.listContent,
// //           jobs.length === 0 && styles.emptyListContent,
// //         ]}
// //         refreshControl={
// //           <RefreshControl
// //             refreshing={refreshing}
// //             onRefresh={handleRefresh}
// //             colors={['#2563EB']}
// //             tintColor="#2563EB"
// //           />
// //         }
// //         ListHeaderComponent={
// //           <View>
// //             {/* Header */}
// //             <View style={styles.headerSection}>
// //               <View style={styles.headerTextContainer}>
// //                 <Text style={styles.welcomeText}>Company Dashboard</Text>

// //                 <Text style={styles.headerTitle}>Your job postings</Text>

// //                 <Text style={styles.headerSubtitle}>
// //                   Manage your jobs and discover recommended candidates.
// //                 </Text>
// //               </View>

// //               <View style={styles.headerIcon}>
// //                 <Text style={styles.headerIconText}>💼</Text>
// //               </View>
// //             </View>

// //             {/* Statistics */}
// //             <View style={styles.statsContainer}>
// //               <View style={styles.statCard}>
// //                 <View style={styles.statIconContainer}>
// //                   <Text style={styles.statIcon}>📋</Text>
// //                 </View>

// //                 <View style={styles.statContent}>
// //                   <Text style={styles.statValue}>{jobs.length}</Text>
// //                   <Text style={styles.statLabel}>
// //                     {jobs.length === 1 ? 'Active Job' : 'Job Postings'}
// //                   </Text>
// //                 </View>
// //               </View>

// //               <View style={styles.statCard}>
// //                 <View
// //                   style={[
// //                     styles.statIconContainer,
// //                     styles.recommendationIconContainer,
// //                   ]}
// //                 >
// //                   <Text style={styles.statIcon}>⭐</Text>
// //                 </View>

// //                 <View style={styles.statContent}>
// //                   <Text style={styles.statValue}>
// //                     {totalRecommendations}
// //                   </Text>

// //                   <Text style={styles.statLabel}>
// //                     {totalRecommendations === 1
// //                       ? 'Recommendation'
// //                       : 'Recommendations'}
// //                   </Text>
// //                 </View>
// //               </View>
// //             </View>

// //             {/* Section title */}
// //             {jobs.length > 0 && (
// //               <View style={styles.sectionHeader}>
// //                 <Text style={styles.sectionTitle}>Posted Jobs</Text>

// //                 <Text style={styles.sectionCount}>
// //                   {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
// //                 </Text>
// //               </View>
// //             )}
          
// //           </View>
// //         }
// //         ListEmptyComponent={
// //           <View style={styles.emptyContainer}>
// //             <View style={styles.emptyIconContainer}>
// //               <Text style={styles.emptyIcon}>📋</Text>
// //             </View>

// //             <Text style={styles.emptyTitle}>No jobs posted yet</Text>

// //             <Text style={styles.emptyText}>
// //               You haven't posted any jobs yet. Create your first job posting
// //               to start receiving candidate recommendations.
// //             </Text>

// //             <TouchableOpacity
// //               style={styles.postJobButton}
// //               activeOpacity={0.85}
// //               onPress={() => navigation.navigate('PostJob')}
// //             >
// //               <Text style={styles.postJobButtonText}>+ Post a Job</Text>
// //             </TouchableOpacity>
// //           </View>
// //         }
// //         renderItem={({ item }) => {
// //           const recommendationText =
// //             item.recommendationCount === 1
// //               ? '1 Recommendation'
// //               : `${item.recommendationCount} Recommendations`;

// //           const location = item.location?.trim() || 'Location not specified';

// //           const employmentType =
// //             item.employment_type?.trim() || 'Employment type not specified';

// //           const status =
// //             (item as Job & { status?: string }).status?.toLowerCase() ||
// //             'active';

// //           const isActive =
// //             status === 'active' ||
// //             status === 'open' ||
// //             status === 'published';

// //           return (
// //             <TouchableOpacity
// //               style={styles.jobCard}
// //               activeOpacity={0.88}
// //               onPress={() => handleJobPress(item)}
// //             >
// //               {/* Top row */}
// //               <View style={styles.jobTopRow}>
// //                 <View style={styles.jobIconContainer}>
// //                   <Text style={styles.jobIcon}>💼</Text>
// //                 </View>

// //                 <View style={styles.jobTitleContainer}>
// //                   <Text style={[styles.jobTitle, { fontWeight: '700' }]} numberOfLines={2}>
// //                     {item.title}
// //                   </Text>

// //                   <View
// //                     style={[
// //                       styles.statusBadge,
// //                       isActive
// //                         ? styles.activeStatusBadge
// //                         : styles.inactiveStatusBadge,
// //                     ]}
// //                   >
// //                     <View
// //                       style={[
// //                         styles.statusDot,
// //                         isActive
// //                           ? styles.activeStatusDot
// //                           : styles.inactiveStatusDot,
// //                       ]}
// //                     />

// //                     <Text
// //                       style={[
// //                         styles.statusText,
// //                         isActive
// //                           ? styles.activeStatusText
// //                           : styles.inactiveStatusText,
// //                       ]}
// //                     >
// //                       {isActive ? 'Active' : 'Closed'}
// //                     </Text>
// //                   </View>
// //                 </View>

// //                 <View style={styles.arrowContainer}>
// //                   <Text style={styles.arrow}>›</Text>
// //                 </View>
// //               </View>

// //               {/* Job details */}
// //               <View style={styles.detailsContainer}>
// //                 <View style={styles.detailRow}>
// //                   <Text style={styles.detailIcon}>📍</Text>

// //                   <Text style={styles.detailText} numberOfLines={1}>
// //                     {location}
// //                   </Text>
// //                 </View>

// //                 <View style={styles.detailRow}>
// //                   <Text style={styles.detailIcon}>⏱</Text>

// //                   <Text style={styles.detailText} numberOfLines={1}>
// //                     {employmentType}
// //                   </Text>
// //                 </View>
// //               </View>
                      
// //               {/* Divider */}
// //               <View style={styles.divider} />

// //               {/* Bottom row */}
// //               <View style={styles.jobBottomRow}>
// //                 <View style={styles.recommendationContainer}>
// //                   <View style={styles.recommendationIcon}>
// //                     <Text style={styles.recommendationIconText}>★</Text>
// //                   </View>

// //                   <Text style={styles.recommendationText}>
// //                     {recommendationText}
// //                   </Text>
// //                 </View>

// //                 <Text style={styles.viewCandidatesText}>
// //                   View candidates →
// //                 </Text>
// //               </View>
// //             </TouchableOpacity>
// //           );
          
// //         }}
        
// //         ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
        
// //       />
      
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#F5F7FB',
// //   },

// //   loadingContainer: {
// //     flex: 1,
// //     backgroundColor: '#F5F7FB',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     paddingHorizontal: 24,
// //   },

// //   loadingCard: {
// //     width: '100%',
// //     maxWidth: 360,
// //     backgroundColor: '#FFFFFF',
// //     borderRadius: 20,
// //     paddingVertical: 32,
// //     paddingHorizontal: 24,
// //     alignItems: 'center',
// //     shadowColor: '#0F172A',
// //     shadowOffset: {
// //       width: 0,
// //       height: 8,
// //     },
// //     shadowOpacity: 0.08,
// //     shadowRadius: 20,
// //     elevation: 5,
// //   },

// //   loadingTitle: {
// //     marginTop: 18,
// //     fontSize: 18,
// //     fontWeight: '700',
// //     color: '#111827',
// //   },

// //   loadingText: {
// //     marginTop: 7,
// //     fontSize: 14,
// //     lineHeight: 20,
// //     color: '#6B7280',
// //     textAlign: 'center',
// //   },

// //   errorContainer: {
// //     flex: 1,
// //     backgroundColor: '#F5F7FB',
// //     padding: 20,
// //     justifyContent: 'center',
// //   },

// //   listContent: {
// //     paddingHorizontal: 18,
// //     paddingTop: 20,
// //     paddingBottom: 30,
// //   },

// //   emptyListContent: {
// //     flexGrow: 1,
// //   },

// //   headerSection: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     marginBottom: 20,
// //   },

// //   headerTextContainer: {
// //     flex: 1,
// //     paddingRight: 16,
// //   },

// //   welcomeText: {
// //     fontSize: 13,
// //     fontWeight: '700',
// //     color: '#2563EB',
// //     textTransform: 'uppercase',
// //     letterSpacing: 0.8,
// //     marginBottom: 5,
// //   },

// //   headerTitle: {
// //     fontSize: 28,
// //     lineHeight: 34,
// //     fontWeight: '800',
// //     color: '#111827',
// //   },

// //   headerSubtitle: {
// //     marginTop: 7,
// //     fontSize: 14,
// //     lineHeight: 21,
// //     color: '#6B7280',
// //   },

// //   headerIcon: {
// //     width: 58,
// //     height: 58,
// //     borderRadius: 18,
// //     backgroundColor: '#DBEAFE',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },

// //   headerIconText: {
// //     fontSize: 27,
// //   },

// //   statsContainer: {
// //     flexDirection: 'row',
// //     gap: 12,
// //     marginBottom: 26,
// //   },

// //   statCard: {
// //     flex: 1,
// //     minHeight: 88,
// //     backgroundColor: '#FFFFFF',
// //     borderRadius: 16,
// //     padding: 14,
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     borderWidth: 1,
// //     borderColor: '#E5E7EB',
// //     shadowColor: '#0F172A',
// //     shadowOffset: {
// //       width: 0,
// //       height: 3,
// //     },
// //     shadowOpacity: 0.04,
// //     shadowRadius: 8,
// //     elevation: 2,
// //   },

// //   statIconContainer: {
// //     width: 44,
// //     height: 44,
// //     borderRadius: 13,
// //     backgroundColor: '#DBEAFE',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginRight: 10,
// //   },

// //   recommendationIconContainer: {
// //     backgroundColor: '#FEF3C7',
// //   },

// //   statIcon: {
// //     fontSize: 20,
// //   },

// //   statContent: {
// //     flex: 1,
// //   },

// //   statValue: {
// //     fontSize: 21,
// //     fontWeight: '800',
// //     color: '#111827',
// //   },

// //   statLabel: {
// //     marginTop: 2,
// //     fontSize: 11,
// //     lineHeight: 15,
// //     color: '#6B7280',
// //   },

// //   sectionHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     marginBottom: 12,
// //   },

// //   sectionTitle: {
// //     fontSize: 19,
// //     fontWeight: '800',
// //     color: '#111827',
// //   },

// //   sectionCount: {
// //     fontSize: 13,
// //     fontWeight: '600',
// //     color: '#6B7280',
// //   },

// //   cardSeparator: {
// //     height: 12,
// //   },

// //   jobCard: {
// //     backgroundColor: '#FFFFFF',
// //     borderRadius: 18,
// //     padding: 16,
// //     borderWidth: 1,
// //     borderColor: '#E5E7EB',
// //     shadowColor: '#0F172A',
// //     shadowOffset: {
// //       width: 0,
// //       height: 5,
// //     },
// //     shadowOpacity: 0.06,
// //     shadowRadius: 12,
// //     elevation: 3,
// //   },

// //   jobTopRow: {
// //     flexDirection: 'row',
// //     alignItems: 'flex-start',
// //   },

// //   jobIconContainer: {
// //     width: 48,
// //     height: 48,
// //     borderRadius: 14,
// //     backgroundColor: '#EFF6FF',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginRight: 12,
// //   },

// //   jobIcon: {
// //     fontSize: 22,
// //   },

// //   jobTitleContainer: {
// //     flex: 1,
// //     paddingRight: 8,
// //   },

// //   jobTitle: {
// //     fontSize: 17,
// //     lineHeight: 23,
// //     color: '#111827',
// //   },

// //   statusBadge: {
// //     alignSelf: 'flex-start',
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     borderRadius: 20,
// //     paddingHorizontal: 8,
// //     paddingVertical: 4,
// //     marginTop: 7,
// //   },

// //   activeStatusBadge: {
// //     backgroundColor: '#ECFDF5',
// //   },

// //   inactiveStatusBadge: {
// //     backgroundColor: '#F3F4F6',
// //   },

// //   statusDot: {
// //     width: 6,
// //     height: 6,
// //     borderRadius: 3,
// //     marginRight: 5,
// //   },

// //   activeStatusDot: {
// //     backgroundColor: '#10B981',
// //   },

// //   inactiveStatusDot: {
// //     backgroundColor: '#9CA3AF',
// //   },

// //   statusText: {
// //     fontSize: 10,
// //     fontWeight: '700',
// //   },

// //   activeStatusText: {
// //     color: '#047857',
// //   },

// //   inactiveStatusText: {
// //     color: '#6B7280',
// //   },

// //   arrowContainer: {
// //     width: 30,
// //     height: 30,
// //     borderRadius: 10,
// //     backgroundColor: '#F9FAFB',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },

// //   arrow: {
// //     fontSize: 25,
// //     lineHeight: 27,
// //     color: '#6B7280',
// //     fontWeight: '400',
// //   },

// //   detailsContainer: {
// //     marginTop: 16,
// //     gap: 9,
// //   },

// //   detailRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },

// //   detailIcon: {
// //     width: 24,
// //     fontSize: 15,
// //     textAlign: 'center',
// //     marginRight: 7,
// //   },

// //   detailText: {
// //     flex: 1,
// //     fontSize: 13,
// //     color: '#6B7280',
// //     fontWeight: '500',
// //   },

// //   divider: {
// //     height: 1,
// //     backgroundColor: '#EEF0F4',
// //     marginVertical: 14,
// //   },

// //   jobBottomRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //   },

// //   recommendationContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     flex: 1,
// //   },

// //   recommendationIcon: {
// //     width: 28,
// //     height: 28,
// //     borderRadius: 9,
// //     backgroundColor: '#FEF3C7',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginRight: 8,
// //   },

// //   recommendationIconText: {
// //     fontSize: 13,
// //     color: '#D97706',
// //   },

// //   recommendationText: {
// //     fontSize: 12,
// //     fontWeight: '700',
// //     color: '#374151',
// //   },

// //   viewCandidatesText: {
// //     fontSize: 11,
// //     fontWeight: '700',
// //     color: '#2563EB',
// //   },

// //   emptyContainer: {
// //     flex: 1,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     paddingHorizontal: 24,
// //     minHeight: 400,
// //   },

// //   emptyIconContainer: {
// //     width: 82,
// //     height: 82,
// //     borderRadius: 25,
// //     backgroundColor: '#DBEAFE',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginBottom: 18,
// //   },

// //   emptyIcon: {
// //     fontSize: 36,
// //   },

// //   emptyTitle: {
// //     fontSize: 21,
// //     fontWeight: '800',
// //     color: '#111827',
// //     textAlign: 'center',
// //   },

// //   emptyText: {
// //     marginTop: 8,
// //     fontSize: 14,
// //     lineHeight: 21,
// //     color: '#6B7280',
// //     textAlign: 'center',
// //     maxWidth: 340,
// //   },

// //   postJobButton: {
// //     marginTop: 22,
// //     backgroundColor: '#2563EB',
// //     paddingHorizontal: 24,
// //     paddingVertical: 13,
// //     borderRadius: 12,
// //     shadowColor: '#2563EB',
// //     shadowOffset: {
// //       width: 0,
// //       height: 5,
// //     },
// //     shadowOpacity: 0.2,
// //     shadowRadius: 8,
// //     elevation: 4,
// //   },

// //   postJobButtonText: {
// //     color: '#FFFFFF',
// //     fontSize: 14,
// //     fontWeight: '800',
// //   },
// // });




























// // // import React, { useCallback, useState } from 'react';
// // // import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
// // // import { useFocusEffect } from '@react-navigation/native';
// // // import { listCompanyJobs } from '../../services/jobs.service';
// // // import { getRecommendationsForJob } from '../../services/recommendations.service';
// // // import { useAuthStore } from '../../store/authStore';
// // // import ErrorState from '../../components/shared/ErrorState';
// // // import type { Job } from '../../types/job';

// // // interface JobWithCount extends Job {
// // //   recommendationCount: number;
// // // }

// // // export default function CompanyDashboardScreen({ navigation }: any) {
// // //   const session = useAuthStore((s) => s.session);
// // //   const [jobs, setJobs] = useState<JobWithCount[]>([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState(false);

// // //   const load = useCallback(async () => {
// // //     if (!session?.user) return;
// // //     setLoading(true);
// // //     setError(false);
// // //     try {
// // //       const companyJobs = await listCompanyJobs(session.user.id);
// // //       const withCounts = await Promise.all(
// // //         companyJobs.map(async (job) => {
// // //           const recs = await getRecommendationsForJob(job.id);
// // //           return { ...job, recommendationCount: recs.length };
// // //         })
// // //       );
// // //       setJobs(withCounts);
// // //     } catch (err) {
// // //       console.log('Failed to load dashboard:', err);
// // //       setError(true);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }, [session]);

// // //   useFocusEffect(
// // //     useCallback(() => {
// // //       load();
// // //     }, [load])
// // //   );

// // //   if (loading) {
// // //     return (
// // //       <View style={styles.center}>
// // //         <ActivityIndicator />
// // //       </View>
// // //     );
// // //   }

// // //   if (error) {
// // //     return (
// // //       <View style={styles.container}>
// // //         <ErrorState message="Couldn't load your dashboard." onRetry={load} />
// // //       </View>
// // //     );
// // //   }

// // //   return (
// // //     <View style={styles.container}>
// // //       <Text style={styles.header}>Your job postings</Text>
// // //       <FlatList
// // //         data={jobs}
// // //         keyExtractor={(item) => item.id}
// // //         ListEmptyComponent={
// // //           <Text style={styles.empty}>No jobs posted yet — head to Post Job.</Text>
// // //         }
// // //         renderItem={({ item }) => (
// // //           <TouchableOpacity
// // //             style={styles.card}
// // //             onPress={() => navigation.navigate('CandidatePool', { jobId: item.id, jobTitle: item.title })}
// // //           >
// // //             <Text style={styles.title}>{item.title}</Text>
// // //             <Text style={styles.meta}>
// // //               {item.location} • {item.employment_type}
// // //             </Text>
// // //             <Text style={styles.count}>
// // //               {item.recommendationCount} recommendation{item.recommendationCount === 1 ? '' : 's'}
// // //             </Text>
// // //           </TouchableOpacity>
// // //         )}
// // //       />
// // //     </View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, padding: 16 },
// // //   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// // //   header: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
// // //   empty: { color: '#999', textAlign: 'center', marginTop: 40 },
// // //   card: {
// // //     borderWidth: 1,
// // //     borderColor: '#ddd',
// // //     borderRadius: 10,
// // //     padding: 14,
// // //     marginBottom: 10,
// // //   },
// // //   title: { fontSize: 16, fontWeight: '700' },
// // //   meta: { color: '#666', marginTop: 4 },
// // //   count: { color: '#2563eb', marginTop: 6, fontWeight: '600' },
// // // });












// // // // import React, { useCallback, useState } from 'react';
// // // // import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
// // // // import { useFocusEffect } from '@react-navigation/native';
// // // // import { listCompanyJobs } from '../../services/jobs.service';
// // // // import { getRecommendationsForJob } from '../../services/recommendations.service';
// // // // import { useAuthStore } from '../../store/authStore';
// // // // import type { Job } from '../../types/job';

// // // // interface JobWithCount extends Job {
// // // //   recommendationCount: number;
// // // // }

// // // // export default function CompanyDashboardScreen({ navigation }: any) {
// // // //   const session = useAuthStore((s) => s.session);
// // // //   const [jobs, setJobs] = useState<JobWithCount[]>([]);
// // // //   const [loading, setLoading] = useState(true);

// // // //   const load = useCallback(async () => {
// // // //     if (!session?.user) return;
// // // //     setLoading(true);
// // // //     const companyJobs = await listCompanyJobs(session.user.id);

// // // //     // fetch recommendation counts per job in parallel
// // // //     const withCounts = await Promise.all(
// // // //       companyJobs.map(async (job) => {
// // // //         const recs = await getRecommendationsForJob(job.id);
// // // //         return { ...job, recommendationCount: recs.length };
// // // //       })
// // // //     );
// // // //     setJobs(withCounts);
// // // //     setLoading(false);
// // // //   }, [session]);

// // // //   useFocusEffect(
// // // //     useCallback(() => {
// // // //       load();
// // // //     }, [load])
// // // //   );

// // // //   if (loading) {
// // // //     return (
// // // //       <View style={styles.center}>
// // // //         <ActivityIndicator />
// // // //       </View>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <View style={styles.container}>
// // // //       <Text style={styles.header}>Your job postings</Text>
// // // //       <FlatList
// // // //         data={jobs}
// // // //         keyExtractor={(item) => item.id}
// // // //         ListEmptyComponent={
// // // //           <Text style={styles.empty}>No jobs posted yet — head to Post Job.</Text>
// // // //         }
// // // //         renderItem={({ item }) => (
// // // //           <TouchableOpacity
// // // //             style={styles.card}
// // // //             onPress={() => navigation.navigate('CandidatePool', { jobId: item.id, jobTitle: item.title })}
// // // //           >
// // // //             <Text style={styles.title}>{item.title}</Text>
// // // //             <Text style={styles.meta}>
// // // //               {item.location} • {item.employment_type}
// // // //             </Text>
// // // //             <Text style={styles.count}>
// // // //               {item.recommendationCount} recommendation{item.recommendationCount === 1 ? '' : 's'}
// // // //             </Text>
// // // //           </TouchableOpacity>
// // // //         )}
// // // //       />
// // // //     </View>
// // // //   );
// // // // }

// // // // const styles = StyleSheet.create({
// // // //   container: { flex: 1, padding: 16 },
// // // //   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// // // //   header: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
// // // //   empty: { color: '#999', textAlign: 'center', marginTop: 40 },
// // // //   card: {
// // // //     borderWidth: 1,
// // // //     borderColor: '#ddd',
// // // //     borderRadius: 10,
// // // //     padding: 14,
// // // //     marginBottom: 10,
// // // //   },
// // // //   title: { fontSize: 16, fontWeight: '700' },
// // // //   meta: { color: '#666', marginTop: 4 },
// // // //   count: { color: '#2563eb', marginTop: 6, fontWeight: '600' },
// // // // });
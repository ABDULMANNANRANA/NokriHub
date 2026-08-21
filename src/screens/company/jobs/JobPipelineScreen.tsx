import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  getCompanyRecommendations,
  updateRecommendationStatus,
  markRecommendationHired,
  PipelineStatus,
} from '../../services/recommendations.service';

import { useAuthStore } from '../../store/authStore';
import ErrorState from '../../components/shared/ErrorState';
// Import image asset via ESModule import
import LOGO from '../../../../assets/images/Logo.png';

type Recommendation = {
  id: string;
  status: PipelineStatus;
  job_id: string;
  recommender_id: string;
  candidate?: {
    name?: string;
    email?: string;
  };
  job?: {
    title?: string;
  };
  recommender?: {
    name?: string;
  };
};

const columns: {
  status: PipelineStatus;
  label: string;
  icon: string;
}[] = [
  {
    status: 'new',
    label: 'New',
    icon: '✨',
  },
  {
    status: 'reviewed',
    label: 'Reviewed',
    icon: '👀',
  },
  {
    status: 'hired',
    label: 'Hired',
    icon: '🎉',
  },
];

export default function JobPipelineScreen() {
  const session = useAuthStore((s) => s.session);

  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!session?.user?.id) {
        setRecs([]);
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
        const data = await getCompanyRecommendations(session.user.id);

        setRecs((data || []) as Recommendation[]);
      } catch (err) {
        console.error('Failed to load recommendation pipeline:', err);
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

  const handleReview = async (id: string) => {
    try {
      setProcessingId(id);

      await updateRecommendationStatus(id, 'reviewed');
      await load();
    } catch (err) {
      console.error('Failed to mark recommendation as reviewed:', err);

      Alert.alert(
        'Action Failed',
        'Unable to mark this recommendation as reviewed. Please try again.',
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (id: string) => {
    Alert.alert(
      'Reject Recommendation',
      'Are you sure you want to reject this recommendation?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingId(id);

              await updateRecommendationStatus(id, 'rejected');
              await load();
            } catch (err) {
              console.error('Failed to reject recommendation:', err);

              Alert.alert(
                'Action Failed',
                'Unable to reject this recommendation. Please try again.',
              );
            } finally {
              setProcessingId(null);
            }
          },
        },
      ],
    );
  };

  const handleHire = (
    id: string,
    jobId: string,
    recommenderId: string,
  ) => {
    Alert.alert(
      'Confirm Hiring',
      'Are you sure you want to mark this candidate as hired?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Mark Hired',
          onPress: async () => {
            try {
              setProcessingId(id);

              await markRecommendationHired(
                id,
                jobId,
                recommenderId,
              );

              await load();
            } catch (err) {
              console.error('Failed to mark candidate as hired:', err);

              Alert.alert(
                'Action Failed',
                'Unable to mark this candidate as hired. Please try again.',
              );
            } finally {
              setProcessingId(null);
            }
          },
        },
      ],
    );
  };

  const getInitials = (name?: string) => {
    if (!name?.trim()) {
      return 'UC';
    }

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const getStatusStyle = (status: PipelineStatus) => {
    switch (status) {
      case 'new':
        return {
          backgroundColor: '#EEF2FF',
          textColor: '#4F46E5',
        };

      case 'reviewed':
        return {
          backgroundColor: '#FFF7ED',
          textColor: '#EA580C',
        };

      case 'hired':
        return {
          backgroundColor: '#ECFDF5',
          textColor: '#059669',
        };

      default:
        return {
          backgroundColor: '#F3F4F6',
          textColor: '#6B7280',
        };
    }
  };

  const totalCount = recs.length;

  const newCount = recs.filter(
    (r) => r.status === 'new',
  ).length;

  const reviewedCount = recs.filter(
    (r) => r.status === 'reviewed',
  ).length;

  const hiredCount = recs.filter(
    (r) => r.status === 'hired',
  ).length;

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingCard}>
          <View style={styles.loadingLogoContainer}>
            <Image
              source={LOGO}
              style={styles.loadingLogo}
              resizeMode="contain"
            />
          </View>

          <ActivityIndicator
            size="small"
            color="#4F46E5"
            style={styles.loadingIndicator}
          />

          <Text style={styles.loadingTitle}>
            Loading Pipeline
          </Text>

          <Text style={styles.loadingSubtitle}>
            Fetching your recommendations...
          </Text>
        </View>
      </View>
    );
  }

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
          message="Couldn't load the recommendation pipeline."
          onRetry={() => load()}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => load(true)}
          tintColor="#4F46E5"
          colors={['#4F46E5']}
        />
      }
    >
      {/* ============================================================= */}
      {/* PROFESSIONAL NOKRIHUB HEADER                                  */}
      {/* ============================================================= */}

      <View style={styles.brandHeader}>
        <View style={styles.brandHeaderGlow} />

        <View style={styles.logoContainer}>
          <Image
            source={LOGO}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.brandName}>
          NOKRIHUB
        </Text>

        <View style={styles.brandTaglineRow}>
          <View style={styles.brandLine} />

          <Text style={styles.brandTagline}>
            SMART HIRING PLATFORM
          </Text>

          <View style={styles.brandLine} />
        </View>
      </View>

      {/* ============================================================= */}
      {/* PAGE HEADER                                                    */}
      {/* ============================================================= */}

      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <View style={styles.eyebrowContainer}>
            <View style={styles.eyebrowDot} />

            <Text style={styles.eyebrow}>
              COMPANY HIRING
            </Text>
          </View>

          <Text style={styles.pageTitle}>
            Job Pipeline
          </Text>

          <Text style={styles.pageSubtitle}>
            Manage candidates recommended for your jobs.
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>📋</Text>
        </View>
      </View>

      {/* ============================================================= */}
      {/* SUMMARY CARD                                                   */}
      {/* ============================================================= */}

      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.summaryLabel}>
              Total Recommendations
            </Text>

            <Text style={styles.summaryValue}>
              {totalCount}
            </Text>
          </View>

          <View style={styles.summaryIcon}>
            <Text style={styles.summaryIconText}>👥</Text>
          </View>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View
              style={[
                styles.statDot,
                styles.newDot,
              ]}
            />

            <View>
              <Text style={styles.statValue}>
                {newCount}
              </Text>

              <Text style={styles.statLabel}>
                New
              </Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View
              style={[
                styles.statDot,
                styles.reviewedDot,
              ]}
            />

            <View>
              <Text style={styles.statValue}>
                {reviewedCount}
              </Text>

              <Text style={styles.statLabel}>
                Reviewed
              </Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View
              style={[
                styles.statDot,
                styles.hiredDot,
              ]}
            />

            <View>
              <Text style={styles.statValue}>
                {hiredCount}
              </Text>

              <Text style={styles.statLabel}>
                Hired
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ============================================================= */}
      {/* PIPELINE                                                       */}
      {/* ============================================================= */}

      {columns.map((column) => {
        const items = recs.filter(
          (recommendation) =>
            recommendation.status === column.status,
        );

        const statusStyle = getStatusStyle(column.status);

        return (
          <View
            key={column.status}
            style={styles.section}
          >
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View
                  style={[
                    styles.sectionIcon,
                    {
                      backgroundColor:
                        statusStyle.backgroundColor,
                    },
                  ]}
                >
                  <Text style={styles.sectionIconText}>
                    {column.icon}
                  </Text>
                </View>

                <View>
                  <Text style={styles.sectionTitle}>
                    {column.label}
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    {items.length === 1
                      ? '1 candidate'
                      : `${items.length} candidates`}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor:
                      statusStyle.backgroundColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    {
                      color: statusStyle.textColor,
                    },
                  ]}
                >
                  {items.length}
                </Text>
              </View>
            </View>

            {/* Empty State */}
            {items.length === 0 && (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Text style={styles.emptyIconText}>
                    📭
                  </Text>
                </View>

                <Text style={styles.emptyTitle}>
                  No candidates here
                </Text>

                <Text style={styles.emptyText}>
                  Recommendations will appear here when
                  available.
                </Text>
              </View>
            )}

            {/* Candidate Cards */}
            {items.map((item) => {
              const isProcessing =
                processingId === item.id;

              const candidateName =
                item.candidate?.name?.trim() ||
                'Unnamed Candidate';

              const jobTitle =
                item.job?.title?.trim() ||
                'Untitled Position';

              const recommenderName =
                item.recommender?.name?.trim() ||
                'Unknown';

              return (
                <View
                  key={item.id}
                  style={styles.candidateCard}
                >
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
                        numberOfLines={1}
                      >
                        {candidateName}
                      </Text>

                      <View style={styles.jobRow}>
                        <Text style={styles.briefcaseIcon}>
                          💼
                        </Text>

                        <Text
                          style={styles.jobTitle}
                          numberOfLines={1}
                        >
                          {jobTitle}
                        </Text>
                      </View>

                      {item.candidate?.email ? (
                        <Text
                          style={styles.emailText}
                          numberOfLines={1}
                        >
                          {item.candidate.email}
                        </Text>
                      ) : null}
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            statusStyle.backgroundColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          {
                            color:
                              statusStyle.textColor,
                          },
                        ]}
                      >
                        {column.label}
                      </Text>
                    </View>
                  </View>

                  {/* Divider */}
                  <View style={styles.cardDivider} />

                  {/* Recommendation Info */}
                  <View style={styles.recommendedRow}>
                    <View style={styles.recommendedIcon}>
                      <Text style={styles.recommendedIconText}>
                        🤝
                      </Text>
                    </View>

                    <View style={styles.recommendedInfo}>
                      <Text style={styles.recommendedLabel}>
                        Recommended by
                      </Text>

                      <Text
                        style={styles.recommenderName}
                        numberOfLines={1}
                      >
                        {recommenderName}
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  {column.status === 'new' && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        activeOpacity={0.82}
                        disabled={isProcessing}
                        style={[
                          styles.primaryButton,
                          isProcessing &&
                            styles.disabledButton,
                        ]}
                        onPress={() =>
                          handleReview(item.id)
                        }
                      >
                        {isProcessing ? (
                          <ActivityIndicator
                            size="small"
                            color="#FFFFFF"
                          />
                        ) : (
                          <>
                            <Text style={styles.buttonIcon}>
                              ✓
                            </Text>

                            <Text
                              style={
                                styles.primaryButtonText
                              }
                            >
                              Mark Reviewed
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.82}
                        disabled={isProcessing}
                        style={[
                          styles.rejectButton,
                          isProcessing &&
                            styles.disabledRejectButton,
                        ]}
                        onPress={() =>
                          handleReject(item.id)
                        }
                      >
                        <Text style={styles.rejectButtonText}>
                          Reject
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {column.status === 'reviewed' && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        activeOpacity={0.82}
                        disabled={isProcessing}
                        style={[
                          styles.hireButton,
                          isProcessing &&
                            styles.disabledButton,
                        ]}
                        onPress={() =>
                          handleHire(
                            item.id,
                            item.job_id,
                            item.recommender_id,
                          )
                        }
                      >
                        {isProcessing ? (
                          <ActivityIndicator
                            size="small"
                            color="#FFFFFF"
                          />
                        ) : (
                          <>
                            <Text style={styles.buttonIcon}>
                              ✓
                            </Text>

                            <Text
                              style={
                                styles.primaryButtonText
                              }
                            >
                              Mark Hired
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.82}
                        disabled={isProcessing}
                        style={[
                          styles.rejectButton,
                          isProcessing &&
                            styles.disabledRejectButton,
                        ]}
                        onPress={() =>
                          handleReject(item.id)
                        }
                      >
                        <Text style={styles.rejectButtonText}>
                          Reject
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {column.status === 'hired' && (
                    <View style={styles.hiredMessage}>
                      <View style={styles.hiredIconContainer}>
                        <Text style={styles.hiredIcon}>
                          ✓
                        </Text>
                      </View>

                      <View style={styles.hiredContent}>
                        <Text style={styles.hiredTitle}>
                          Successfully Hired
                        </Text>

                        <Text style={styles.hiredText}>
                          This candidate has been marked as
                          hired.
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}

      {/* ============================================================= */}
      {/* PROFESSIONAL FOOTER                                            */}
      {/* ============================================================= */}

      <View style={styles.footer}>
        <View style={styles.footerLine} />

        <View style={styles.footerBrand}>
          <View style={styles.footerDot} />

          <Text style={styles.footerText}>
            Project By{' '}
            <Text style={styles.footerName}>
              SYED MESAM ABBAS & ABDUL MANNAN RANA
            </Text>
          </Text>

          <View style={styles.footerDot} />
        </View>

        <Text style={styles.footerSubtext}>
          NokriHub • Smart Hiring Platform
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  /* ============================================================= */
  /* Main                                                          */
  /* ============================================================= */

  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
  },

  /* ============================================================= */
  /* Loading                                                        */
  /* ============================================================= */

  loadingScreen: {
    flex: 1,
    backgroundColor: '#F7F8FC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  loadingCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EAF0',
    shadowColor: '#111827',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 5,
  },

  loadingLogoContainer: {
    width: 92,
    height: 92,
    borderRadius: 28,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  loadingLogo: {
    width: 72,
    height: 72,
  },

  loadingIndicator: {
    marginBottom: 12,
  },

  loadingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 7,
  },

  loadingSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    textAlign: 'center',
  },

  /* ============================================================= */
  /* Error                                                          */
  /* ============================================================= */

  errorContainer: {
    flex: 1,
    backgroundColor: '#F7F8FC',
    padding: 18,
    justifyContent: 'center',
  },

  errorLogoHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },

  errorLogo: {
    width: 105,
    height: 55,
  },

  /* ============================================================= */
  /* NokriHub Brand Header                                          */
  /* ============================================================= */

  brandHeader: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 17,
    paddingBottom: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8EAF2',
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.055,
    shadowRadius: 15,
    elevation: 3,
  },

  brandHeaderGlow: {
    position: 'absolute',
    width: 155,
    height: 155,
    borderRadius: 78,
    backgroundColor: '#EEF2FF',
    top: -95,
    opacity: 0.8,
  },

  logoContainer: {
    width: 86,
    height: 86,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  logo: {
    width: 70,
    height: 70,
  },

  brandName: {
    marginTop: 9,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 2.2,
  },

  brandTaglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    paddingHorizontal: 18,
  },

  brandLine: {
    width: 24,
    height: 1,
    backgroundColor: '#D9DDF0',
    marginHorizontal: 7,
  },

  brandTagline: {
    fontSize: 7,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 1.15,
  },

  /* ============================================================= */
  /* Page Header                                                    */
  /* ============================================================= */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 15,
  },

  eyebrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  eyebrowDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4F46E5',
    marginRight: 6,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 1.3,
  },

  pageTitle: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.7,
  },

  pageSubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
  },

  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },

  headerIconText: {
    fontSize: 25,
  },

  /* ============================================================= */
  /* Summary                                                        */
  /* ============================================================= */

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E8EAF0',
    shadowColor: '#111827',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.055,
    shadowRadius: 16,
    elevation: 3,
  },

  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
  },

  summaryValue: {
    marginTop: 4,
    fontSize: 34,
    lineHeight: 40,
    color: '#111827',
    fontWeight: '800',
  },

  summaryIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: '#F3F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  summaryIconText: {
    fontSize: 24,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: '#EEF0F4',
    marginVertical: 18,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
  },

  statDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 9,
  },

  newDot: {
    backgroundColor: '#4F46E5',
  },

  reviewedDot: {
    backgroundColor: '#EA580C',
  },

  hiredDot: {
    backgroundColor: '#059669',
  },

  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },

  /* ============================================================= */
  /* Sections                                                       */
  /* ============================================================= */

  section: {
    marginBottom: 28,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  sectionIconText: {
    fontSize: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  sectionSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },

  countBadge: {
    minWidth: 32,
    height: 30,
    paddingHorizontal: 9,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  countBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },

  /* ============================================================= */
  /* Empty State                                                    */
  /* ============================================================= */

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8EAF0',
    borderStyle: 'dashed',
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 11,
  },

  emptyIconText: {
    fontSize: 21,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#374151',
  },

  emptyText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 18,
  },

  /* ============================================================= */
  /* Candidate Card                                                 */
  /* ============================================================= */

  candidateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9EBF1',
    shadowColor: '#111827',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.045,
    shadowRadius: 14,
    elevation: 2,
  },

  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 53,
    height: 53,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '800',
  },

  candidateInfo: {
    flex: 1,
    minWidth: 0,
  },

  candidateName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  briefcaseIcon: {
    fontSize: 11,
    marginRight: 5,
  },

  jobTitle: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },

  emailText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 3,
  },

  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginLeft: 7,
  },

  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#F0F1F4',
    marginVertical: 15,
  },

  /* ============================================================= */
  /* Recommendation Info                                            */
  /* ============================================================= */

  recommendedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  recommendedIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  recommendedIconText: {
    fontSize: 16,
  },

  recommendedInfo: {
    flex: 1,
  },

  recommendedLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },

  recommenderName: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '700',
    marginTop: 2,
  },

  /* ============================================================= */
  /* Actions                                                        */
  /* ============================================================= */

  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 9,
  },

  primaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 13,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 3,
  },

  hireButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 13,
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    shadowColor: '#059669',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 3,
  },

  rejectButton: {
    minHeight: 46,
    borderRadius: 13,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  buttonIcon: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginRight: 6,
  },

  rejectButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '800',
  },

  disabledButton: {
    opacity: 0.6,
  },

  disabledRejectButton: {
    opacity: 0.45,
  },

  /* ============================================================= */
  /* Hired                                                         */
  /* ============================================================= */

  hiredMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 13,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },

  hiredIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  hiredIcon: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '900',
  },

  hiredContent: {
    flex: 1,
  },

  hiredTitle: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '800',
  },

  hiredText: {
    color: '#059669',
    fontSize: 10,
    marginTop: 2,
  },

  /* ============================================================= */
  /* Professional Footer                                             */
  /* ============================================================= */

  footer: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 12,
  },

  footerLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },

  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4F46E5',
    marginHorizontal: 8,
  },

  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },

  footerName: {
    color: '#4F46E5',
    fontWeight: '800',
  },

  footerSubtext: {
    marginTop: 5,
    fontSize: 9,
    color: '#C0C4CC',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});



















import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { listCompanyJobs } from '../../services/jobs.service';
import { useAuthStore } from '../../store/authStore';
import ErrorState from '../../components/shared/ErrorState';
import type { Job } from '../../types/job';
// Import image asset via ESModule import
import LOGO from '../../../../assets/images/Logo.png';

export default function JobListScreen({ navigation }: any) {
  const session = useAuthStore((s) => s.session);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!session?.user?.id) {
      setJobs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const companyJobs = await listCompanyJobs(session.user.id);
      setJobs(Array.isArray(companyJobs) ? companyJobs : []);
    } catch (err) {
      console.log('Failed to load company jobs:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleRefresh = useCallback(async () => {
    if (!session?.user?.id) {
      return;
    }

    setRefreshing(true);
    setError(false);

    try {
      const companyJobs = await listCompanyJobs(session.user.id);
      setJobs(Array.isArray(companyJobs) ? companyJobs : []);
    } catch (err) {
      console.log('Failed to refresh company jobs:', err);
      setError(true);
    } finally {
      setRefreshing(false);
    }
  }, [session]);

  const openPostJob = useCallback(() => {
    navigation.navigate('PostJob');
  }, [navigation]);

  const openJob = useCallback(
    (job: Job) => {
      navigation.navigate('PostJob', {
        job,
      });
    },
    [navigation],
  );

  const activeJobs = jobs.filter(
    (job) => job.status === 'open',
  ).length;

  const renderJob = ({ item }: { item: Job }) => {
    const isOpen = item.status === 'open';
    const skills = Array.isArray(item.skills) ? item.skills : [];

    return (
      <Pressable
        onPress={() => openJob(item)}
        style={({ pressed }) => [
          styles.jobCard,
          pressed && styles.jobCardPressed,
        ]}
      >
        {/* Accent line */}
        <View
          style={[
            styles.cardAccent,
            isOpen
              ? styles.cardAccentOpen
              : styles.cardAccentClosed,
          ]}
        />

        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <View style={styles.jobIcon}>
              <Text style={styles.jobIconText}>💼</Text>
            </View>

            <View style={styles.titleContent}>
              <Text
                style={styles.jobTitle}
                numberOfLines={2}
              >
                {item.title || 'Untitled Job'}
              </Text>

              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    isOpen
                      ? styles.statusDotOpen
                      : styles.statusDotClosed,
                  ]}
                />

                <Text
                  style={[
                    styles.statusText,
                    isOpen
                      ? styles.statusTextOpen
                      : styles.statusTextClosed,
                  ]}
                >
                  {isOpen
                    ? 'Currently hiring'
                    : 'Not accepting applications'}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              isOpen
                ? styles.statusBadgeOpen
                : styles.statusBadgeClosed,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                isOpen
                  ? styles.statusBadgeTextOpen
                  : styles.statusBadgeTextClosed,
              ]}
            >
              {isOpen ? 'OPEN' : 'CLOSED'}
            </Text>
          </View>
        </View>

        {/* Job Meta */}
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <View style={styles.metaIconContainer}>
              <Text style={styles.metaIcon}>⌖</Text>
            </View>

            <View style={styles.metaContent}>
              <Text style={styles.metaLabel}>LOCATION</Text>

              <Text
                style={styles.metaText}
                numberOfLines={1}
              >
                {item.location?.trim() ||
                  'Location not specified'}
              </Text>
            </View>
          </View>

          <View style={styles.metaItem}>
            <View style={styles.metaIconContainer}>
              <Text style={styles.metaIcon}>◷</Text>
            </View>

            <View style={styles.metaContent}>
              <Text style={styles.metaLabel}>EMPLOYMENT</Text>

              <Text
                style={styles.metaText}
                numberOfLines={1}
              >
                {item.employment_type?.trim() ||
                  'Not specified'}
              </Text>
            </View>
          </View>
        </View>

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.skillsSection}>
            <View style={styles.skillsHeader}>
              <Text style={styles.skillsLabel}>
                KEY SKILLS
              </Text>

              {skills.length > 5 && (
                <Text style={styles.skillsCount}>
                  {skills.length} skills
                </Text>
              )}
            </View>

            <View style={styles.skillsContainer}>
              {skills.slice(0, 5).map((skill, index) => (
                <View
                  key={`${String(skill)}-${index}`}
                  style={styles.skillChip}
                >
                  <Text
                    style={styles.skillText}
                    numberOfLines={1}
                  >
                    {String(skill)}
                  </Text>
                </View>
              ))}

              {skills.length > 5 && (
                <View style={styles.moreSkillChip}>
                  <Text style={styles.moreSkillText}>
                    +{skills.length - 5}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.manageContainer}>
            <View style={styles.manageIcon}>
              <Text style={styles.manageIconText}>✎</Text>
            </View>

            <Text style={styles.editHint}>
              Tap to manage posting
            </Text>
          </View>

          <View style={styles.arrowContainer}>
            <Text style={styles.arrow}>›</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>💼</Text>
      </View>

      <View style={styles.emptyBadge}>
        <Text style={styles.emptyBadgeText}>
          GET STARTED
        </Text>
      </View>

      <Text style={styles.emptyTitle}>
        No Jobs Posted Yet
      </Text>

      <Text style={styles.emptyDescription}>
        Create your first job posting and start discovering
        talented candidates for your company.
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.emptyButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={openPostJob}
      >
        <View style={styles.emptyButtonIconContainer}>
          <Text style={styles.emptyButtonIcon}>+</Text>
        </View>

        <Text style={styles.emptyButtonText}>
          Post Your First Job
        </Text>

        <Text style={styles.emptyButtonArrow}>›</Text>
      </Pressable>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <View style={styles.footerLine} />

      <View style={styles.footerContent}>
        <View style={styles.footerLogo}>
          <Text style={styles.footerLogoText}>N</Text>
        </View>

        <View style={styles.footerTextContainer}>
          <Text style={styles.footerProjectText}>
            Project By
          </Text>

          <Text style={styles.footerName}>
            SYED MESAM ABBAS & ABDUL MANNAN RANA
          </Text>
        </View>
      </View>

      <Text style={styles.footerTagline}>
        Professional Job & Referral Platform
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <View style={styles.loadingIconContainer}>
            <Text style={styles.loadingIcon}>💼</Text>
          </View>

          <ActivityIndicator
            size="small"
            color="#2563EB"
            style={styles.loader}
          />

          <Text style={styles.loadingTitle}>
            Loading your jobs
          </Text>

          <Text style={styles.loadingSubtitle}>
            Preparing your job postings...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <ErrorState
          message="Couldn't load your jobs."
          onRetry={load}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={jobs}
        keyExtractor={(item, index) =>
          item.id || `job-${index}`
        }
        renderItem={renderJob}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
        contentContainerStyle={[
          styles.listContent,
          jobs.length === 0 && styles.emptyListContent,
        ]}
        ListHeaderComponent={
          <View>
            {/* ========================================================== */}
            {/* NOKRIHUB PROFESSIONAL CENTERED HEADER                     */}
            {/* ========================================================== */}

            <View style={styles.brandHeader}>
              <View style={styles.brandHeaderGlow} />

              <View style={styles.logoContainer}>
                <Image
                  source={LOGO}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.brandDivider} />

              <Text style={styles.brandLabel}>
                COMPANY PORTAL
              </Text>

              <Text style={styles.brandWelcome}>
                Manage your hiring with confidence
              </Text>
            </View>

            {/* ========================================================== */}
            {/* JOB MANAGEMENT HEADER                                     */}
            {/* ========================================================== */}

            <View style={styles.header}>
              <View style={styles.headerTextContainer}>
                <View style={styles.eyebrowContainer}>
                  <View style={styles.eyebrowDot} />

                  <Text style={styles.eyebrow}>
                    JOB MANAGEMENT
                  </Text>
                </View>

                <Text style={styles.headerTitle}>
                  Your Job Postings
                </Text>

                <Text style={styles.headerSubtitle}>
                  Manage your company's hiring opportunities
                  and connect with talented candidates.
                </Text>
              </View>

              <View style={styles.jobCountBadge}>
                <Text style={styles.jobCount}>
                  {jobs.length}
                </Text>

                <Text style={styles.jobCountLabel}>
                  {jobs.length === 1 ? 'JOB' : 'JOBS'}
                </Text>
              </View>
            </View>

            {/* ========================================================== */}
            {/* SUMMARY                                                    */}
            {/* ========================================================== */}

            {jobs.length > 0 && (
              <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                  <View style={styles.summaryIcon}>
                    <Text style={styles.summaryIconText}>▣</Text>
                  </View>

                  <View>
                    <Text style={styles.summaryValue}>
                      {jobs.length}
                    </Text>

                    <Text style={styles.summaryLabel}>
                      Total Postings
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryItem}>
                  <View style={styles.summaryIconOpen}>
                    <Text style={styles.summaryIconTextOpen}>
                      ✓
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.summaryValue}>
                      {activeJobs}
                    </Text>

                    <Text style={styles.summaryLabel}>
                      Active Jobs
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* ========================================================== */}
            {/* POST JOB BUTTON                                           */}
            {/* ========================================================== */}

            <Pressable
              style={({ pressed }) => [
                styles.postButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={openPostJob}
            >
              <View style={styles.postButtonIconContainer}>
                <Text style={styles.postButtonIcon}>+</Text>
              </View>

              <View style={styles.postButtonContent}>
                <Text style={styles.postButtonTitle}>
                  Post a New Job
                </Text>

                <Text style={styles.postButtonSubtitle}>
                  Create a new hiring opportunity
                </Text>
              </View>

              <View style={styles.postButtonArrowContainer}>
                <Text style={styles.postButtonArrow}>›</Text>
              </View>
            </Pressable>

            {/* ========================================================== */}
            {/* SECTION HEADER                                            */}
            {/* ========================================================== */}

            {jobs.length > 0 && (
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    Your Postings
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    {jobs.length}{' '}
                    {jobs.length === 1
                      ? 'job'
                      : 'jobs'}{' '}
                    available
                  </Text>
                </View>

                <View style={styles.activeIndicator}>
                  <View style={styles.activeIndicatorDot} />

                  <Text style={styles.activeIndicatorText}>
                    {activeJobs} Active
                  </Text>
                </View>
              </View>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  /* ====================================================================== */
  /* Loading                                                                */
  /* ====================================================================== */

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FB',
    paddingHorizontal: 24,
  },

  loadingCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },

  loadingIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  loadingIcon: {
    fontSize: 30,
  },

  loader: {
    marginBottom: 12,
  },

  loadingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  loadingSubtitle: {
    marginTop: 5,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  /* ====================================================================== */
  /* Professional NokriHub Header                                          */
  /* ====================================================================== */

  brandHeader: {
    position: 'relative',
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 4,
    paddingTop: 18,
    paddingBottom: 17,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },

  brandHeaderGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#EFF6FF',
    top: -105,
    alignSelf: 'center',
    opacity: 0.9,
  },

  logoContainer: {
    width: 190,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  logo: {
    width: 185,
    height: 64,
  },

  brandDivider: {
    width: 42,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#2563EB',
    marginTop: 6,
    marginBottom: 8,
  },

  brandLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.8,
    color: '#2563EB',
  },

  brandWelcome: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
  },

  /* ====================================================================== */
  /* Header                                                                 */
  /* ====================================================================== */

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 14,
  },

  eyebrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  eyebrowDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginRight: 6,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#2563EB',
  },

  headerTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    color: '#111827',
  },

  headerSubtitle: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
  },

  jobCountBadge: {
    width: 64,
    height: 64,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  jobCount: {
    fontSize: 21,
    lineHeight: 24,
    fontWeight: '800',
    color: '#2563EB',
  },

  jobCountLabel: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.6,
  },

  /* ====================================================================== */
  /* Summary                                                                */
  /* ====================================================================== */

  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 14,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  summaryIconOpen: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  summaryIconText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
  },

  summaryIconTextOpen: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16A34A',
  },

  summaryValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  summaryLabel: {
    marginTop: 1,
    fontSize: 9,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  summaryDivider: {
    width: 1,
    height: 35,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },

  /* ====================================================================== */
  /* Post Button                                                            */
  /* ====================================================================== */

  postButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    minHeight: 72,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,

    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 5,
  },

  postButtonIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.17)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  postButtonIcon: {
    fontSize: 27,
    lineHeight: 30,
    color: '#FFFFFF',
  },

  postButtonContent: {
    flex: 1,
  },

  postButtonTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  postButtonSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: '#DBEAFE',
  },

  postButtonArrowContainer: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  postButtonArrow: {
    fontSize: 24,
    lineHeight: 26,
    color: '#FFFFFF',
  },

  /* ====================================================================== */
  /* Section                                                                */
  /* ====================================================================== */

  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: '#9CA3AF',
  },

  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  activeIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },

  activeIndicatorText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },

  /* ====================================================================== */
  /* List                                                                   */
  /* ====================================================================== */

  listContent: {
    paddingBottom: 0,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  /* ====================================================================== */
  /* Job Card                                                               */
  /* ====================================================================== */

  jobCard: {
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 18,
    bottom: 18,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },

  cardAccentOpen: {
    backgroundColor: '#16A34A',
  },

  cardAccentClosed: {
    backgroundColor: '#CBD5E1',
  },

  jobCardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },

  /* ====================================================================== */
  /* Card Header                                                            */
  /* ====================================================================== */

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: 8,
  },

  jobIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  jobIconText: {
    fontSize: 21,
  },

  titleContent: {
    flex: 1,
  },

  jobTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    color: '#111827',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },

  statusDotOpen: {
    backgroundColor: '#16A34A',
  },

  statusDotClosed: {
    backgroundColor: '#9CA3AF',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },

  statusTextOpen: {
    color: '#15803D',
  },

  statusTextClosed: {
    color: '#6B7280',
  },

  /* ====================================================================== */
  /* Status Badge                                                           */
  /* ====================================================================== */

  statusBadge: {
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
  },

  statusBadgeOpen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#BBF7D0',
  },

  statusBadgeClosed: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },

  statusBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  statusBadgeTextOpen: {
    color: '#15803D',
  },

  statusBadgeTextClosed: {
    color: '#6B7280',
  },

  /* ====================================================================== */
  /* Meta                                                                   */
  /* ====================================================================== */

  metaContainer: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
  },

  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },

  metaIconContainer: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  metaIcon: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },

  metaContent: {
    flex: 1,
  },

  metaLabel: {
    fontSize: 7,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 2,
  },

  metaText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },

  /* ====================================================================== */
  /* Skills                                                                 */
  /* ====================================================================== */

  skillsSection: {
    marginTop: 14,
  },

  skillsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },

  skillsLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.8,
  },

  skillsCount: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
  },

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  skillChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 5,
    maxWidth: '70%',
  },

  skillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },

  moreSkillChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 5,
  },

  moreSkillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },

  /* ====================================================================== */
  /* Card Footer                                                            */
  /* ====================================================================== */

  cardFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  manageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  manageIcon: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  manageIconText: {
    fontSize: 12,
    color: '#64748B',
  },

  editHint: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },

  arrowContainer: {
    width: 27,
    height: 27,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrow: {
    fontSize: 21,
    lineHeight: 23,
    color: '#2563EB',
    fontWeight: '500',
  },

  /* ====================================================================== */
  /* Empty                                                                  */
  /* ====================================================================== */

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    minHeight: 430,
  },

  emptyIconContainer: {
    width: 84,
    height: 84,
    borderRadius: 27,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyIcon: {
    fontSize: 38,
  },

  emptyBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 9,
  },

  emptyBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.8,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },

  emptyDescription: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 19,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 315,
  },

  emptyButton: {
    marginTop: 21,
    minHeight: 50,
    borderRadius: 14,
    paddingLeft: 7,
    paddingRight: 15,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 9,
    elevation: 4,
  },

  emptyButtonIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  emptyButtonIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 24,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  emptyButtonArrow: {
    color: '#FFFFFF',
    fontSize: 23,
    marginLeft: 10,
  },

  /* ====================================================================== */
  /* Footer                                                                 */
  /* ====================================================================== */

  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 30,
  },

  footerLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 18,
  },

  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerLogo: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  footerLogoText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  footerTextContainer: {
    alignItems: 'flex-start',
  },

  footerProjectText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  footerName: {
    marginTop: 1,
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },

  footerTagline: {
    marginTop: 7,
    fontSize: 9,
    color: '#A1AAB8',
    textAlign: 'center',
  },

  /* ====================================================================== */
  /* Error                                                                  */
  /* ====================================================================== */

  errorContainer: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    padding: 20,
    justifyContent: 'center',
  },

  /* ====================================================================== */
  /* Interaction                                                            */
  /* ====================================================================== */

  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});



















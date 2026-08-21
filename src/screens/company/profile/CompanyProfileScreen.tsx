import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

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

import { supabase } from '../../services/supabase';
import { deleteMyAccount } from '../../services/auth.service';
import { listCompanyJobs } from '../../services/jobs.service';
import { useAuthStore } from '../../store/authStore';
// Import image asset via ESModule import
import LOGO from '../../../../assets/images/Logo.png';

type CompanyProfile = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  role?: string;
  created_at?: string;
};

export default function CompanyProfileScreen() {
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);

  const [profile, setProfile] =
    useState<CompanyProfile | null>(null);

  const [jobCount, setJobCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load company profile and jobs.
   */
  const loadProfile = useCallback(
    async (isRefresh = false) => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const userId = session.user.id;

        const [
          profileResult,
          jobsResult,
        ] = await Promise.all([
          supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single(),

          listCompanyJobs(userId),
        ]);

        if (profileResult.error) {
          throw profileResult.error;
        }

        setProfile(profileResult.data);

        setJobCount(
          Array.isArray(jobsResult)
            ? jobsResult.length
            : 0,
        );
      } catch (err: any) {
        console.error(
          'Failed to load company profile:',
          err,
        );

        setError(
          err?.message ||
            'Could not load your company profile.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session],
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /**
   * Get company initials.
   */
  const getInitials = (name?: string) => {
    if (!name?.trim()) {
      return 'C';
    }

    const words = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return `${words[0][0]}${
      words[words.length - 1][0]
    }`.toUpperCase();
  };

  /**
   * Format account creation date.
   */
  const formatDate = (date?: string) => {
    if (!date) {
      return 'Recently';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Recently';
    }

    return parsedDate.toLocaleDateString(
      undefined,
      {
        month: 'short',
        year: 'numeric',
      },
    );
  };

  /**
   * Delete account.
   */
  const handleDeleteAccount = () => {
    if (deleting) {
      return;
    }

    Alert.alert(
      'Delete Company Account?',
      'This permanently deletes your company profile and all job postings, including recommendations and hires connected to them. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            if (!session?.user?.id) {
              Alert.alert(
                'Error',
                'Your session has expired. Please log in again.',
              );
              return;
            }

            setDeleting(true);

            try {
              await deleteMyAccount(
                session.user.id,
              );

              /*
               * deleteMyAccount should normally
               * handle the Supabase auth/session
               * cleanup.
               */
            } catch (err: any) {
              console.error(
                'Failed to delete company account:',
                err,
              );

              Alert.alert(
                'Unable to Delete Account',
                err?.message ||
                  'Could not delete your account. Please try again.',
              );

              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  /**
   * Loading screen.
   */
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
            style={styles.loadingSpinner}
          />

          <Text style={styles.loadingTitle}>
            Loading Profile
          </Text>

          <Text style={styles.loadingSubtitle}>
            Fetching your company information...
          </Text>
        </View>
      </View>
    );
  }

  /**
   * Error screen.
   */
  if (error || !profile) {
    return (
      <View style={styles.errorScreen}>
        <View style={styles.errorCard}>
          <View style={styles.errorLogoContainer}>
            <Image
              source={LOGO}
              style={styles.errorLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>
              !
            </Text>
          </View>

          <Text style={styles.errorTitle}>
            Unable to Load Profile
          </Text>

          <Text style={styles.errorMessage}>
            {error ||
              'Your company profile could not be found.'}
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.retryButton}
            onPress={() => loadProfile()}
          >
            <Text style={styles.retryButtonText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const companyName =
    profile.name?.trim() ||
    'Unnamed Company';

  const companyEmail =
    profile.email?.trim() ||
    session?.user?.email ||
    'No email available';

  const initials = getInitials(
    companyName,
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              loadProfile(true)
            }
            tintColor="#4F46E5"
            colors={['#4F46E5']}
          />
        }
      >

        {/* ==================================================
            PROFESSIONAL NOKRIHUB HEADER
        ================================================== */}

        <View style={styles.header}>
          {/* Top Accent */}
          <View style={styles.headerAccent} />

          {/* Centered Logo */}
          <View style={styles.headerLogoWrapper}>
            <View style={styles.headerLogoGlow}>
              <Image
                source={LOGO}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Brand */}
          <Text style={styles.headerBrand}>
            NokriHub
          </Text>

          <Text style={styles.headerBrandSubtitle}>
            SMART HIRING & REFERRALS
          </Text>

          {/* Divider */}
          <View style={styles.headerDivider} />

          {/* Page Information */}
          <Text style={styles.headerTitle}>
            Company Profile
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage your company account
          </Text>
        </View>

        {/* -----------------------------------------
            PROFILE CARD
        ------------------------------------------ */}

        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {initials}
              </Text>

              <View
                style={styles.onlineIndicator}
              />
            </View>

            <View style={styles.profileInfo}>
              <Text
                style={styles.companyName}
                numberOfLines={2}
              >
                {companyName}
              </Text>

              <View style={styles.companyType}>
                <View style={styles.companyDot} />

                <Text style={styles.companyTypeText}>
                  Company Account
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.profileDivider} />

          {/* Email */}

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.detailIconText}>
                ✉
              </Text>
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>
                Email Address
              </Text>

              <Text
                style={styles.detailValue}
                numberOfLines={1}
              >
                {companyEmail}
              </Text>
            </View>
          </View>

          {/* Location */}

          {profile.city ? (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Text style={styles.detailIconText}>
                  📍
                </Text>
              </View>

              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>
                  Location
                </Text>

                <Text
                  style={styles.detailValue}
                  numberOfLines={1}
                >
                  {profile.city}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Member Since */}

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.detailIconText}>
                📅
              </Text>
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>
                Member Since
              </Text>

              <Text style={styles.detailValue}>
                {formatDate(
                  profile.created_at,
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* -----------------------------------------
            STATISTICS
        ------------------------------------------ */}

        <Text style={styles.sectionTitle}>
          Account Overview
        </Text>

        <View style={styles.statsRow}>

          {/* Jobs */}

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.jobsIcon,
              ]}
            >
              <Text style={styles.statIconText}>
                💼
              </Text>
            </View>

            <Text style={styles.statValue}>
              {jobCount}
            </Text>

            <Text style={styles.statLabel}>
              Jobs Posted
            </Text>
          </View>

          {/* Plan */}

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.planIcon,
              ]}
            >
              <Text style={styles.statIconText}>
                ✦
              </Text>
            </View>

            <Text style={styles.statValue}>
              Free
            </Text>

            <Text style={styles.statLabel}>
              Current Plan
            </Text>
          </View>
        </View>

        {/* -----------------------------------------
            PLAN CARD
        ------------------------------------------ */}

        <View style={styles.planCard}>
          <View style={styles.planTop}>
            <View style={styles.planTitleRow}>
              <View style={styles.planSmallIcon}>
                <Text
                  style={styles.planSmallIconText}
                >
                  ✦
                </Text>
              </View>

              <View>
                <Text style={styles.planTitle}>
                  Free Plan
                </Text>

                <Text style={styles.planSubtitle}>
                  Your current account tier
                </Text>
              </View>
            </View>

            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />

              <Text style={styles.activeText}>
                Active
              </Text>
            </View>
          </View>

          <View style={styles.planDivider} />

          <View style={styles.featureRow}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkText}>
                ✓
              </Text>
            </View>

            <Text style={styles.featureText}>
              Create and manage job postings
            </Text>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkText}>
                ✓
              </Text>
            </View>

            <Text style={styles.featureText}>
              Receive candidate recommendations
            </Text>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkText}>
                ✓
              </Text>
            </View>

            <Text style={styles.featureText}>
              Manage your hiring pipeline
            </Text>
          </View>

          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>
              Premium analytics and priority
              support are coming soon.
            </Text>
          </View>
        </View>

        {/* -----------------------------------------
            ACCOUNT ACTIONS
        ------------------------------------------ */}

        <Text style={styles.sectionTitle}>
          Account
        </Text>

        {/* Logout */}

        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Log Out',
              'Are you sure you want to log out of your company account?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Log Out',
                  style: 'destructive',
                  onPress: logout,
                },
              ],
            );
          }}
        >
          <View style={styles.logoutIcon}>
            <Text style={styles.logoutIconText}>
              ↪
            </Text>
          </View>

          <View style={styles.actionContent}>
            <Text style={styles.logoutTitle}>
              Log Out
            </Text>

            <Text style={styles.logoutSubtitle}>
              Sign out of your account
            </Text>
          </View>

          <Text style={styles.actionArrow}>
            ›
          </Text>
        </TouchableOpacity>

        {/* Delete */}

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={deleting}
          style={[
            styles.deleteButton,
            deleting &&
              styles.deleteButtonDisabled,
          ]}
          onPress={handleDeleteAccount}
        >
          <View style={styles.deleteIcon}>
            {deleting ? (
              <ActivityIndicator
                size="small"
                color="#DC2626"
              />
            ) : (
              <Text style={styles.deleteIconText}>
                🗑
              </Text>
            )}
          </View>

          <View style={styles.actionContent}>
            <Text style={styles.deleteTitle}>
              {deleting
                ? 'Deleting Account...'
                : 'Delete Company Account'}
            </Text>

            <Text style={styles.deleteSubtitle}>
              Permanently remove your account
            </Text>
          </View>

          {!deleting && (
            <Text style={styles.deleteArrow}>
              ›
            </Text>
          )}
        </TouchableOpacity>

        {/* Warning */}

        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>
            ⚠
          </Text>

          <Text style={styles.warningText}>
            Deleting your account is permanent.
            Your company profile, job postings,
            recommendations, and related hiring
            data may also be removed.
          </Text>
        </View>

        {/* -----------------------------------------
            PROFESSIONAL FOOTER
        ------------------------------------------ */}

        <View style={styles.footer}>
          <View style={styles.footerLine} />

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
                Project By SYED MESAM ABBAS & ABDUL MANNAN RANA
              </Text>

              <Text style={styles.footerText}>
                NokriHub • Company Account
              </Text>
            </View>
          </View>

          <Text style={styles.footerCopyright}>
            © {new Date().getFullYear()} NokriHub.
            All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* ==================================================
   STYLES
================================================== */

const styles = StyleSheet.create({
  /* -----------------------------------------------
     SCREEN
  ------------------------------------------------ */

  screen: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40,
  },

  /* -----------------------------------------------
     PROFESSIONAL HEADER
  ------------------------------------------------ */

  header: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 18,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EAF0',
    shadowColor: '#111827',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 4,
  },

  headerAccent: {
    width: 54,
    height: 4,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    marginBottom: 17,
  },

  headerLogoWrapper: {
    width: 92,
    height: 92,
    borderRadius: 28,
    backgroundColor: '#F5F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
  },

  headerLogoGlow: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerLogo: {
    width: 68,
    height: 68,
  },

  headerBrand: {
    marginTop: 12,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.4,
  },

  headerBrandSubtitle: {
    marginTop: 3,
    fontSize: 8,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 1.4,
  },

  headerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#EEF0F4',
    marginTop: 15,
    marginBottom: 15,
  },

  headerTitle: {
    fontSize: 25,
    lineHeight: 31,
    color: '#111827',
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* -----------------------------------------------
     PROFILE
  ------------------------------------------------ */

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 19,
    borderWidth: 1,
    borderColor: '#EEF0F4',
    shadowColor: '#111827',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },

  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 21,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  avatarText: {
    color: '#4F46E5',
    fontSize: 24,
    fontWeight: '900',
  },

  onlineIndicator: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },

  companyName: {
    fontSize: 20,
    lineHeight: 25,
    color: '#111827',
    fontWeight: '800',
  },

  companyType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  companyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },

  companyTypeText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },

  profileDivider: {
    height: 1,
    backgroundColor: '#F0F1F4',
    marginVertical: 18,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  detailIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  detailIconText: {
    fontSize: 15,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    fontWeight: '700',
    marginBottom: 2,
  },

  detailValue: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '700',
  },

  /* -----------------------------------------------
     SECTION
  ------------------------------------------------ */

  sectionTitle: {
    fontSize: 17,
    color: '#111827',
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 11,
  },

  /* -----------------------------------------------
     STATS
  ------------------------------------------------ */

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: -5,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#EEF0F4',
    shadowColor: '#111827',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  jobsIcon: {
    backgroundColor: '#EEF2FF',
  },

  planIcon: {
    backgroundColor: '#ECFDF5',
  },

  statIconText: {
    fontSize: 17,
  },

  statValue: {
    fontSize: 24,
    lineHeight: 29,
    color: '#111827',
    fontWeight: '900',
  },

  statLabel: {
    marginTop: 3,
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },

  /* -----------------------------------------------
     PLAN
  ------------------------------------------------ */

  planCard: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  planTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  planSmallIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  planSmallIconText: {
    color: '#4F46E5',
    fontSize: 19,
    fontWeight: '900',
  },

  planTitle: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '800',
  },

  planSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: '#9CA3AF',
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },

  activeText: {
    fontSize: 9,
    color: '#059669',
    fontWeight: '800',
  },

  planDivider: {
    height: 1,
    backgroundColor: '#F0F1F4',
    marginVertical: 16,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },

  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  checkText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '900',
  },

  featureText: {
    flex: 1,
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },

  comingSoon: {
    marginTop: 4,
    padding: 11,
    borderRadius: 11,
    backgroundColor: '#F9FAFB',
  },

  comingSoonText: {
    fontSize: 10,
    lineHeight: 15,
    color: '#9CA3AF',
  },

  /* -----------------------------------------------
     ACTIONS
  ------------------------------------------------ */

  logoutButton: {
    minHeight: 68,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutIconText: {
    color: '#4F46E5',
    fontSize: 22,
    fontWeight: '700',
  },

  actionContent: {
    flex: 1,
    marginLeft: 11,
  },

  logoutTitle: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '800',
  },

  logoutSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: '#9CA3AF',
  },

  actionArrow: {
    fontSize: 26,
    color: '#9CA3AF',
    fontWeight: '300',
    marginLeft: 8,
  },

  deleteButton: {
    minHeight: 68,
    backgroundColor: '#FFF7F7',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingHorizontal: 14,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  deleteButtonDisabled: {
    opacity: 0.7,
  },

  deleteIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteIconText: {
    fontSize: 17,
  },

  deleteTitle: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '800',
  },

  deleteSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: '#B91C1C',
  },

  deleteArrow: {
    fontSize: 26,
    color: '#F87171',
    fontWeight: '300',
    marginLeft: 8,
  },

  /* -----------------------------------------------
     WARNING
  ------------------------------------------------ */

  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 15,
    padding: 13,
    marginTop: 13,
  },

  warningIcon: {
    fontSize: 15,
    marginRight: 9,
  },

  warningText: {
    flex: 1,
    color: '#92400E',
    fontSize: 10,
    lineHeight: 15,
  },

  /* -----------------------------------------------
     LOADING
  ------------------------------------------------ */

  loadingScreen: {
    flex: 1,
    backgroundColor: '#F7F8FC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  loadingCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 4,
  },

  loadingLogoContainer: {
    width: 78,
    height: 78,
    borderRadius: 23,
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  loadingLogo: {
    width: 58,
    height: 58,
  },

  loadingSpinner: {
    marginBottom: 12,
  },

  loadingTitle: {
    fontSize: 19,
    color: '#111827',
    fontWeight: '800',
  },

  loadingSubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  /* -----------------------------------------------
     ERROR
  ------------------------------------------------ */

  errorScreen: {
    flex: 1,
    backgroundColor: '#F7F8FC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },

  errorCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },

  errorLogoContainer: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  errorLogo: {
    width: 56,
    height: 56,
  },

  errorIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  errorIconText: {
    color: '#DC2626',
    fontSize: 27,
    fontWeight: '900',
  },

  errorTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },

  errorMessage: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
  },

  retryButton: {
    backgroundColor: '#4F46E5',
    minWidth: 120,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingHorizontal: 20,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  /* -----------------------------------------------
     PROFESSIONAL FOOTER
  ------------------------------------------------ */

  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 4,
    paddingBottom: 10,
  },

  footerLine: {
    width: 55,
    height: 3,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    marginBottom: 18,
  },

  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerLogo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },

  footerLogoImage: {
    width: 30,
    height: 30,
  },

  footerBrandText: {
    alignItems: 'flex-start',
  },

  footerProject: {
    color: '#374151',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.1,
  },

  footerText: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 3,
  },

  footerCopyright: {
    color: '#C4C7CE',
    fontSize: 9,
    fontWeight: '500',
    marginTop: 10,
    textAlign: 'center',
  },
});



















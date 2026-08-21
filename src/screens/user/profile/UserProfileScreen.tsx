import React, { useCallback, useEffect, useState } from 'react';
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

import LOGO from '../../../../assets/images/Logo.png';

import { supabase } from '../../services/supabase';
import { deleteMyAccount } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';

type Profile = {
  id: string;
  name?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  role?: string | null;
  linkedin_id?: string | null;
  linkedin_headline?: string | null;
  headline?: string | null;
  profile_photo_url?: string | null;
  photo_url?: string | null;
  star_count?: number | null;
  created_at?: string | null;
};

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
  dangerLight: '#FEF3F2',

  grayLight: '#F2F4F7',
};

export default function UserProfileScreen() {
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ============================================================
     DISPLAY HELPERS
  ============================================================ */

  const getDisplayName = useCallback(() => {
    if (profile) {
      return (
        profile.full_name ||
        profile.name ||
        session?.user?.user_metadata?.full_name ||
        session?.user?.user_metadata?.name ||
        'NokriHub User'
      );
    }

    return (
      session?.user?.user_metadata?.full_name ||
      session?.user?.user_metadata?.name ||
      'NokriHub User'
    );
  }, [profile, session]);

  const getEmail = useCallback(() => {
    return (
      profile?.email ||
      session?.user?.email ||
      'No email available'
    );
  }, [profile, session]);

  const getHeadline = useCallback(() => {
    return (
      profile?.linkedin_headline ||
      profile?.headline ||
      'NokriHub member'
    );
  }, [profile]);

  const getPhotoUrl = useCallback(() => {
    return (
      profile?.profile_photo_url ||
      profile?.photo_url ||
      session?.user?.user_metadata?.avatar_url ||
      session?.user?.user_metadata?.picture ||
      null
    );
  }, [profile, session]);

  const getInitials = useCallback(() => {
    const name = getDisplayName().trim();

    if (!name) {
      return 'U';
    }

    const parts = name
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }, [getDisplayName]);

  /* ============================================================
     LOAD PROFILE
  ============================================================ */

  const loadProfile = useCallback(
    async (showLoader = true) => {
      const user = session?.user;

      if (!user?.id) {
        setProfile(null);
        setLoading(false);
        return;
      }

      if (showLoader) {
        setLoading(true);
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select(
            `
              id,
              name,
              email,
              role
            `,
          )
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.log(
            'Failed to load user profile:',
            error,
          );

          throw error;
        }

        if (!data) {
          setProfile({
            id: user.id,
            name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              null,
            email: user.email || null,
            role: 'candidate',
            profile_photo_url:
              user.user_metadata?.avatar_url ||
              user.user_metadata?.picture ||
              null,
            star_count: 0,
          });

          return;
        }

        setProfile({
          id: data.id,
          name: data.name || null,
          email:
            data.email ||
            user.email ||
            null,
          role: data.role || 'candidate',

          profile_photo_url:
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            null,

          full_name:
            user.user_metadata?.full_name ||
            null,

          headline:
            user.user_metadata?.headline ||
            null,

          linkedin_headline:
            user.user_metadata?.linkedin_headline ||
            null,

          city:
            user.user_metadata?.city ||
            null,

          phone:
            user.user_metadata?.phone ||
            null,

          star_count: 0,
        });
      } catch (error: any) {
        console.log(
          'Profile loading error:',
          error,
        );

        setProfile({
          id: user.id,
          name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            null,
          email: user.email || null,
          role: 'candidate',
          profile_photo_url:
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            null,
          star_count: 0,
        });

        if (!user.email) {
          Alert.alert(
            'Unable to load profile',
            error?.message ||
              'Something went wrong while loading your profile.',
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [session],
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /* ============================================================
     REFRESH
  ============================================================ */

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await loadProfile(false);
    } finally {
      setRefreshing(false);
    }
  };

  /* ============================================================
     LOGOUT
  ============================================================ */

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out of your NokriHub account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error: any) {
              Alert.alert(
                'Logout failed',
                error?.message ||
                  'Could not log out. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  /* ============================================================
     DELETE ACCOUNT
  ============================================================ */

  const handleDeleteAccount = () => {
    if (!session?.user?.id || deleting) {
      return;
    }

    Alert.alert(
      'Delete your account?',
      'This permanently deletes your profile, CVs, connections, applications, and recommendation history. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);

            try {
              await deleteMyAccount(session.user.id);
            } catch (error: any) {
              console.log(
                'Delete account error:',
                error,
              );

              Alert.alert(
                'Deletion failed',
                error?.message ||
                  'Could not delete your account. Please try again.',
              );

              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingIcon}>
          <Text style={styles.loadingIconText}>
            N
          </Text>
        </View>

        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingTitle}>
          Loading your profile
        </Text>

        <Text style={styles.loadingSubtitle}>
          Please wait a moment...
        </Text>
      </View>
    );
  }

  /* ============================================================
     NO SESSION
  ============================================================ */

  if (!session?.user) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>
            !
          </Text>
        </View>

        <Text style={styles.loadingTitle}>
          Profile unavailable
        </Text>

        <Text style={styles.loadingSubtitle}>
          Please sign in again to continue.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={logout}
        >
          <Text style={styles.primaryButtonText}>
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ============================================================
     PROFILE VALUES
  ============================================================ */

  const displayName = getDisplayName();
  const email = getEmail();
  const headline = getHeadline();
  const photoUrl = getPhotoUrl();

  const role =
    profile?.role === 'company-admin'
      ? 'Company Admin'
      : profile?.role === 'recommender'
      ? 'Recommender'
      : 'Candidate';

  const starCount =
    typeof profile?.star_count === 'number'
      ? profile.star_count
      : 0;

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <View style={styles.topHeader}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.brandSmall}>
              NOKRIHUB
            </Text>

            <Text style={styles.pageTitle}>
              My Profile
            </Text>

            <Text style={styles.pageSubtitle}>
              Manage your professional identity
            </Text>
          </View>

          <View style={styles.headerLogoContainer}>
            <Image
              source={LOGO}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ======================================================
            PROFILE HERO
        ====================================================== */}

        <View style={styles.profileCard}>
          <View style={styles.profileGlow} />

          <View style={styles.avatarWrapper}>
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  styles.avatarPlaceholder,
                ]}
              >
                <Text style={styles.avatarInitial}>
                  {getInitials()}
                </Text>
              </View>
            )}

            <View style={styles.onlineIndicator} />
          </View>

          <Text
            style={styles.name}
            numberOfLines={2}
          >
            {displayName}
          </Text>

          <View style={styles.roleBadge}>
            <View style={styles.roleDot} />

            <Text style={styles.roleText}>
              {role}
            </Text>
          </View>

          <Text
            style={styles.email}
            numberOfLines={1}
          >
            {email}
          </Text>

          <Text
            style={styles.headline}
            numberOfLines={3}
          >
            {headline}
          </Text>

          {profile?.city ? (
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>
                📍
              </Text>

              <Text style={styles.locationText}>
                {profile.city}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ======================================================
            QUICK STATS
        ====================================================== */}

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor:
                    COLORS.primaryLight,
                },
              ]}
            >
              <Text style={styles.statIconText}>
                ⭐
              </Text>
            </View>

            <Text style={styles.statValue}>
              {starCount}
            </Text>

            <Text style={styles.statLabel}>
              Stars Earned
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor:
                    COLORS.successLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.statIconText,
                  styles.successIcon,
                ]}
              >
                ✓
              </Text>
            </View>

            <Text style={styles.statValue}>
              Active
            </Text>

            <Text style={styles.statLabel}>
              Account Status
            </Text>
          </View>
        </View>

        {/* ======================================================
            PROFESSIONAL PROFILE
        ====================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Professional Profile
          </Text>

          <Text style={styles.sectionSubtitle}>
            Your information on NokriHub
          </Text>
        </View>

        <View style={styles.infoCard}>
          <InfoRow
            icon="✉"
            label="Email"
            value={email}
          />

          <InfoRow
            icon="👤"
            label="Account Type"
            value={role}
          />

          {profile?.city ? (
            <InfoRow
              icon="📍"
              label="Location"
              value={profile.city}
            />
          ) : null}

          {profile?.phone ? (
            <InfoRow
              icon="📱"
              label="Phone"
              value={profile.phone}
            />
          ) : null}

          <InfoRow
            icon="💼"
            label="Professional Headline"
            value={headline}
            isLast
          />
        </View>

        {/* ======================================================
            RECOMMENDATION REWARDS
        ====================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Recommendation Rewards
          </Text>

          <Text style={styles.sectionSubtitle}>
            Build your reputation through referrals
          </Text>
        </View>

        <View style={styles.rewardCard}>
          <View style={styles.rewardGlow} />

          <View style={styles.rewardIcon}>
            <Text style={styles.rewardIconText}>
              ⭐
            </Text>
          </View>

          <View style={styles.rewardContent}>
            <Text style={styles.rewardTitle}>
              {starCount} Stars
            </Text>

            <Text style={styles.rewardDescription}>
              Earn stars when your successful
              recommendations lead to hires.
            </Text>
          </View>
        </View>

        {/* ======================================================
            ACCOUNT ACTIONS
        ====================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Account
          </Text>

          <Text style={styles.sectionSubtitle}>
            Manage your NokriHub account
          </Text>
        </View>

        <View style={styles.actionsCard}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.actionRow}
            onPress={handleLogout}
            disabled={deleting}
          >
            <View
              style={[
                styles.actionIcon,
                {
                  backgroundColor:
                    COLORS.primaryLight,
                },
              ]}
            >
              <Text style={styles.actionIconText}>
                ⇥
              </Text>
            </View>

            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>
                Log Out
              </Text>

              <Text style={styles.actionDescription}>
                Sign out of your NokriHub account
              </Text>
            </View>

            <Text style={styles.actionArrow}>
              ›
            </Text>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.actionRow}
            onPress={handleDeleteAccount}
            disabled={deleting}
          >
            <View
              style={[
                styles.actionIcon,
                {
                  backgroundColor:
                    COLORS.dangerLight,
                },
              ]}
            >
              {deleting ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.danger}
                />
              ) : (
                <Text
                  style={[
                    styles.actionIconText,
                    {
                      color: COLORS.danger,
                    },
                  ]}
                >
                  ×
                </Text>
              )}
            </View>

            <View style={styles.actionContent}>
              <Text style={styles.deleteTitle}>
                {deleting
                  ? 'Deleting Account...'
                  : 'Delete Account'}
              </Text>

              <Text style={styles.actionDescription}>
                Permanently remove your account
              </Text>
            </View>

            {!deleting && (
              <Text
                style={[
                  styles.actionArrow,
                  {
                    color: COLORS.danger,
                  },
                ]}
              >
                ›
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ======================================================
            PROFESSIONAL FOOTER
        ====================================================== */}

        <View style={styles.footer}>
          <View style={styles.footerDivider} />

          <View style={styles.footerLogo}>
            <Text style={styles.footerLogoText}>
              N
            </Text>
          </View>

          <Text style={styles.footerNokriHub}>
            NokriHub
          </Text>

          <Text style={styles.footerTagline}>
            Connect. Recommend. Get Hired.
          </Text>

          <View style={styles.creatorCredit}>
            <Text style={styles.projectBy}>
              Project by
            </Text>

            <Text style={styles.creatorName}>
              SYED MESAM ABBAS & ABDUL MANNAN RANA
            </Text>
          </View>

          <Text style={styles.footerVersion}>
            Professional Referral Platform
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* ==============================================================
   INFO ROW
============================================================== */

type InfoRowProps = {
  icon: string;
  label: string;
  value: string;
  isLast?: boolean;
};

function InfoRow({
  icon,
  label,
  value,
  isLast = false,
}: InfoRowProps) {
  return (
    <View
      style={[
        styles.infoRow,
        !isLast && styles.infoRowBorder,
      ]}
    >
      <View style={styles.infoIcon}>
        <Text style={styles.infoIconText}>
          {icon}
        </Text>
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text
          style={styles.infoValue}
          numberOfLines={3}
        >
          {value || 'Not provided'}
        </Text>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

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

  /* ============================================================
     LOADING
  ============================================================ */

  loadingScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },

  loadingIconText: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: '900',
  },

  loadingTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 14,
  },

  loadingSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },

  errorIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: COLORS.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },

  errorIconText: {
    color: COLORS.danger,
    fontSize: 32,
    fontWeight: '900',
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 25,
    paddingVertical: 13,
    marginTop: 20,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 3,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },

  /* ============================================================
     HEADER
  ============================================================ */

  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  headerTextContainer: {
    flex: 1,
  },

  brandSmall: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.6,
  },

  pageTitle: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.6,
    marginTop: 2,
  },

  pageSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 10,
    marginTop: 3,
  },

  headerLogoContainer: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  headerLogo: {
    width: 46,
    height: 46,
  },

  /* ============================================================
     PROFILE HERO
  ============================================================ */

  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 25,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },

  profileGlow: {
    position: 'absolute',
    width: 250,
    height: 130,
    borderRadius: 100,
    backgroundColor: COLORS.primaryLight,
    top: -80,
    opacity: 0.8,
  },

  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },

  avatar: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 4,
    borderColor: COLORS.white,
  },

  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarInitial: {
    color: COLORS.white,
    fontSize: 31,
    fontWeight: '900',
  },

  onlineIndicator: {
    position: 'absolute',
    right: 3,
    bottom: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 3,
    borderColor: COLORS.white,
  },

  name: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },

  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 5,
  },

  roleText: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: '900',
  },

  email: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 10,
    textAlign: 'center',
  },

  headline: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
    maxWidth: 300,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },

  locationIcon: {
    fontSize: 11,
    marginRight: 4,
  },

  locationText: {
    color: COLORS.secondaryText,
    fontSize: 10,
    fontWeight: '600',
  },

  /* ============================================================
     STATS
  ============================================================ */

  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    marginTop: 12,
    paddingVertical: 17,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 2,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },

  statIconText: {
    fontSize: 15,
  },

  successIcon: {
    color: COLORS.success,
    fontWeight: '900',
  },

  statValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },

  statLabel: {
    color: COLORS.lightText,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },

  /* ============================================================
     SECTIONS
  ============================================================ */

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
    marginTop: 3,
  },

  /* ============================================================
     INFO CARD
  ============================================================ */

  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.025,
    shadowRadius: 7,
    elevation: 1,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },

  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  infoIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: COLORS.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  infoIconText: {
    fontSize: 14,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    color: COLORS.lightText,
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },

  infoValue: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 17,
  },

  /* ============================================================
     REWARDS
  ============================================================ */

  rewardCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },

  rewardGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    right: -45,
    top: -55,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  rewardIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  rewardIconText: {
    fontSize: 24,
  },

  rewardContent: {
    flex: 1,
  },

  rewardTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },

  rewardDescription: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 3,
  },

  /* ============================================================
     ACCOUNT ACTIONS
  ============================================================ */

  actionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 13,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.025,
    shadowRadius: 7,
    elevation: 1,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },

  actionIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  actionIconText: {
    color: COLORS.primary,
    fontSize: 21,
    fontWeight: '900',
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },

  deleteTitle: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '800',
  },

  actionDescription: {
    color: COLORS.secondaryText,
    fontSize: 9,
    marginTop: 3,
  },

  actionArrow: {
    color: COLORS.primary,
    fontSize: 26,
    fontWeight: '300',
    marginLeft: 8,
  },

  actionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  /* ============================================================
     PROFESSIONAL FOOTER
  ============================================================ */

  footer: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 14,
  },

  footerDivider: {
    width: 55,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginBottom: 18,
    opacity: 0.9,
  },

  footerLogo: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: '#D5E8F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  footerLogoText: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '900',
  },

  footerNokriHub: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  footerTagline: {
    color: COLORS.secondaryText,
    fontSize: 10,
    marginTop: 4,
  },

  creatorCredit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  projectBy: {
    color: COLORS.lightText,
    fontSize: 9,
    fontWeight: '600',
    marginRight: 4,
  },

  creatorName: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '800',
  },

  footerVersion: {
    color: COLORS.lightText,
    fontSize: 8,
    marginTop: 8,
  },
});



















import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  getPendingActionItems,
  getMyRecommendationHistory,
  respondToRequest,
} from '../../services/recommendations.service';

import { useAuthStore } from '../../store/authStore';
import ErrorState from '../../components/shared/ErrorState';
// Import image asset via ESModule import
import LOGO from '../../../../assets/images/Logo.png';

type Tab = 'pending' | 'history';

type ActivityItem = {
  id: string;
  job?: {
    title?: string;
  };
  requested_by?: 'candidate' | 'recommender';
  candidate?: {
    name?: string;
    full_name?: string;
    email?: string;
  };
  recommender?: {
    name?: string;
    full_name?: string;
    email?: string;
  };
  note?: string;
  cv_id?: string;
};

type HistoryItem = {
  id: string;
  candidate_id?: string;
  job?: {
    title?: string;
  };
  status?: string;
};


const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',
  primarySoft: '#DBEAFE',

  background: '#F6F8FC',
  white: '#FFFFFF',

  text: '#111827',
  secondaryText: '#667085',
  lightText: '#98A2B3',

  border: '#E5E7EB',

  success: '#16A34A',
  successLight: '#ECFDF3',

  danger: '#DC2626',
  dangerLight: '#FEF2F2',

  warning: '#D97706',
  warningLight: '#FFFBEB',

  purple: '#7C3AED',
  purpleLight: '#F5F3FF',

  grayLight: '#F3F4F6',
  grayMedium: '#E5E7EB',
};

const STATUS_CONFIG: Record<
  string,
  {
    background: string;
    text: string;
    label: string;
  }
> = {
  new: {
    background: COLORS.primaryLight,
    text: COLORS.primary,
    label: 'New',
  },

  reviewed: {
    background: COLORS.warningLight,
    text: COLORS.warning,
    label: 'Reviewed',
  },

  hired: {
    background: COLORS.successLight,
    text: COLORS.success,
    label: 'Hired',
  },

  rejected: {
    background: COLORS.dangerLight,
    text: COLORS.danger,
    label: 'Rejected',
  },

  accepted: {
    background: COLORS.successLight,
    text: COLORS.success,
    label: 'Accepted',
  },
};

export default function ActivityScreen({
  navigation,
}: any) {
  const session = useAuthStore((s) => s.session);

  const [tab, setTab] = useState<Tab>('pending');

  const [pending, setPending] = useState<ActivityItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [pendingLoading, setPendingLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [pendingError, setPendingError] = useState(false);
  const [historyError, setHistoryError] = useState(false);

  const [respondingId, setRespondingId] =
    useState<string | null>(null);

  /* ============================================================
     HELPERS
  ============================================================ */

  const getDisplayName = (user: any) => {
    if (!user) {
      return 'Someone';
    }

    return (
      user.name ||
      user.full_name ||
      user.email?.split('@')[0] ||
      'Someone'
    );
  };

  const getInitials = (user: any) => {
    const name = getDisplayName(user);

    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return 'U';
    }

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const getStatusConfig = (status?: string) => {
    const normalized =
      status?.toLowerCase() || 'new';

    return (
      STATUS_CONFIG[normalized] || {
        background: COLORS.grayLight,
        text: COLORS.secondaryText,
        label:
          normalized.charAt(0).toUpperCase() +
          normalized.slice(1),
      }
    );
  };

  /* ============================================================
     LOAD PENDING
  ============================================================ */

  const loadPending = useCallback(async () => {
    if (!session?.user?.id) {
      setPending([]);
      return;
    }

    setPendingLoading(true);
    setPendingError(false);

    try {
      const data = await getPendingActionItems(
        session.user.id,
      );

      setPending(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(
        'Failed to load pending items:',
        err,
      );

      setPendingError(true);
    } finally {
      setPendingLoading(false);
    }
  }, [session?.user?.id]);

  /* ============================================================
     LOAD HISTORY
  ============================================================ */

  const loadHistory = useCallback(async () => {
    if (!session?.user?.id) {
      setHistory([]);
      return;
    }

    setHistoryLoading(true);
    setHistoryError(false);

    try {
      const data =
        await getMyRecommendationHistory(
          session.user.id,
        );

      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(
        'Failed to load recommendation history:',
        err,
      );

      setHistoryError(true);
    } finally {
      setHistoryLoading(false);
    }
  }, [session?.user?.id]);

  /* ============================================================
     LOAD EVERYTHING
  ============================================================ */

  const loadActivity = useCallback(async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        loadPending(),
        loadHistory(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [loadPending, loadHistory]);

  useFocusEffect(
    useCallback(() => {
      loadActivity();
    }, [loadActivity]),
  );

  /* ============================================================
     RESPOND TO REQUEST
  ============================================================ */

  const handleRespond = async (
    id: string,
    status: 'accepted' | 'declined',
  ) => {
    if (respondingId) {
      return;
    }

    setRespondingId(id);

    try {
      await respondToRequest(id, status);

      if (status === 'accepted') {
        Alert.alert(
          'Request Accepted',
          'The recommendation request has been accepted successfully.',
        );
      } else {
        Alert.alert(
          'Request Declined',
          'The recommendation request has been declined.',
        );
      }

      await Promise.all([
        loadPending(),
        loadHistory(),
      ]);
    } catch (err: any) {
      console.log(
        'Failed to respond to request:',
        err,
      );

      Alert.alert(
        'Action Failed',
        err?.message ||
          'Could not update this recommendation request. Please try again.',
      );
    } finally {
      setRespondingId(null);
    }
  };

  /* ============================================================
     PENDING EMPTY
  ============================================================ */

  const renderPendingEmpty = () => {
    if (pendingLoading) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            Loading activity
          </Text>

          <Text style={styles.emptyDescription}>
            Checking your recommendation requests...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View
          style={[
            styles.emptyIconContainer,
            styles.emptySuccessIcon,
          ]}
        >
          <Text style={styles.emptyIcon}>✓</Text>
        </View>

        <Text style={styles.emptyTitle}>
          You're all caught up
        </Text>

        <Text style={styles.emptyDescription}>
          There are no recommendation requests
          waiting for your action right now.
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.emptyButton}
          onPress={() => setTab('history')}
        >
          <Text style={styles.emptyButtonText}>
            View History
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  /* ============================================================
     HISTORY EMPTY
  ============================================================ */

  const renderHistoryEmpty = () => {
    if (historyLoading) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            Loading history
          </Text>

          <Text style={styles.emptyDescription}>
            Fetching your recommendation activity...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Text style={styles.emptyIcon}>★</Text>
        </View>

        <Text style={styles.emptyTitle}>
          No recommendation history
        </Text>

        <Text style={styles.emptyDescription}>
          Your recommendation activity will appear
          here when requests are accepted or processed.
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.emptyButton}
          onPress={() => setTab('pending')}
        >
          <Text style={styles.emptyButtonText}>
            View Pending
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  /* ============================================================
     PENDING CARD
  ============================================================ */

  const renderPendingItem = ({
    item,
  }: {
    item: ActivityItem;
  }) => {
    const isCandidateRequest =
      item.requested_by === 'candidate';

    const person = isCandidateRequest
      ? item.candidate
      : item.recommender;

    const personName = getDisplayName(person);

    const isResponding =
      respondingId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardAccent} />

        {/* Job Header */}
        <View style={styles.cardHeader}>
          <View style={styles.jobIcon}>
            <Text style={styles.jobIconText}>
              💼
            </Text>
          </View>

          <View style={styles.jobHeaderContent}>
            <Text
              style={styles.jobTitle}
              numberOfLines={2}
            >
              {item.job?.title ||
                'Recommendation Request'}
            </Text>

            <View style={styles.actionRequiredBadge}>
              <View style={styles.actionRequiredDot} />

              <Text style={styles.pendingLabel}>
                ACTION REQUIRED
              </Text>
            </View>
          </View>
        </View>

        {/* Person */}
        <View style={styles.personContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(person)}
            </Text>
          </View>

          <View style={styles.personInfo}>
            <Text style={styles.personName}>
              {personName}
            </Text>

            <Text style={styles.personDescription}>
              {isCandidateRequest
                ? 'is asking you to recommend them'
                : 'wants to recommend you'}
            </Text>
          </View>
        </View>

        {/* Note */}
        {item.note ? (
          <View style={styles.noteContainer}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteIcon}>
                “
              </Text>

              <Text style={styles.noteLabel}>
                MESSAGE
              </Text>
            </View>

            <Text style={styles.noteText}>
              {item.note}
            </Text>
          </View>
        ) : null}

        {/* CV */}
        {isCandidateRequest && item.cv_id ? (
          <TouchableOpacity
            activeOpacity={0.78}
            style={styles.cvButton}
            onPress={() =>
              navigation.navigate(
                'CVReview',
                {
                  cvId: item.cv_id,
                },
              )
            }
          >
            <View style={styles.cvIconContainer}>
              <Text style={styles.cvIcon}>
                📄
              </Text>
            </View>

            <View style={styles.cvContent}>
              <Text style={styles.cvTitle}>
                Attached CV
              </Text>

              <Text style={styles.cvSubtitle}>
                Review candidate's CV
              </Text>
            </View>

            <View style={styles.cvArrowContainer}>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isResponding}
            style={[
              styles.acceptButton,
              isResponding &&
                styles.disabledButton,
            ]}
            onPress={() => {
              if (
                item.requested_by ===
                'recommender'
              ) {
                navigation.navigate(
                  'AcceptOffer',
                  {
                    requestId: item.id,
                  },
                );
              } else {
                handleRespond(
                  item.id,
                  'accepted',
                );
              }
            }}
          >
            {isResponding ? (
              <ActivityIndicator
                size="small"
                color={COLORS.white}
              />
            ) : (
              <>
                <Text style={styles.acceptIcon}>
                  ✓
                </Text>

                <Text style={styles.acceptText}>
                  {item.requested_by ===
                  'recommender'
                    ? 'Review Offer'
                    : 'Accept'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isResponding}
            style={[
              styles.declineButton,
              isResponding &&
                styles.disabledButton,
            ]}
            onPress={() =>
              handleRespond(
                item.id,
                'declined',
              )
            }
          >
            <Text style={styles.declineText}>
              Decline
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ============================================================
     HISTORY CARD
  ============================================================ */

  const renderHistoryItem = ({
    item,
  }: {
    item: HistoryItem;
  }) => {
    const iAmCandidate =
      item.candidate_id ===
      session?.user?.id;

    const statusConfig =
      getStatusConfig(item.status);

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyIcon}>
          <Text style={styles.historyIconText}>
            {iAmCandidate ? '🎯' : '🤝'}
          </Text>
        </View>

        <View style={styles.historyContent}>
          <View style={styles.historyTitleRow}>
            <Text
              style={styles.historyJobTitle}
              numberOfLines={2}
            >
              {item.job?.title ||
                'Recommendation'}
            </Text>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    statusConfig.background,
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      statusConfig.text,
                  },
                ]}
              />

              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      statusConfig.text,
                  },
                ]}
              >
                {statusConfig.label}
              </Text>
            </View>
          </View>

          <Text style={styles.historyDescription}>
            {iAmCandidate
              ? 'You were recommended for this role.'
              : 'You recommended someone for this role.'}
          </Text>
        </View>
      </View>
    );
  };

  /* ============================================================
     PROFESSIONAL NOKRIHUB HEADER
  ============================================================ */

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Top accent */}
        <View style={styles.headerAccent} />

        {/* Centered Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoInner}>
            <Image
              source={LOGO}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="NokriHub Logo"
            />
          </View>
        </View>

        {/* Brand */}
        <Text style={styles.headerBrand}>
          NOKRIHUB
        </Text>

        {/* Title */}
        <Text style={styles.headerTitle}>
          Activity
        </Text>

        {/* Subtitle */}
        <Text style={styles.headerSubtitle}>
          Manage recommendations and track your
          professional activity.
        </Text>

        {/* Pending indicator */}
        {pending.length > 0 && (
          <View style={styles.pendingIndicator}>
            <View style={styles.pendingIndicatorDot} />

            <Text style={styles.pendingIndicatorText}>
              {pending.length > 99
                ? '99+'
                : pending.length}{' '}
              pending{' '}
              {pending.length === 1
                ? 'request'
                : 'requests'}
            </Text>
          </View>
        )}
      </View>

      {/* ========================================================
          TABS
      ======================================================== */}

      <View style={styles.tabContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.tab,
            tab === 'pending' &&
              styles.activeTab,
          ]}
          onPress={() => setTab('pending')}
        >
          <Text style={styles.tabIcon}>
            ⚡
          </Text>

          <Text
            style={[
              styles.tabText,
              tab === 'pending' &&
                styles.activeTabText,
            ]}
          >
            Pending
          </Text>

          {pending.length > 0 && (
            <View
              style={[
                styles.tabBadge,
                tab === 'pending' &&
                  styles.activeTabBadge,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  tab === 'pending' &&
                    styles.activeTabBadgeText,
                ]}
              >
                {pending.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.tab,
            tab === 'history' &&
              styles.activeTab,
          ]}
          onPress={() => setTab('history')}
        >
          <Text style={styles.tabIcon}>
            🕘
          </Text>

          <Text
            style={[
              styles.tabText,
              tab === 'history' &&
                styles.activeTabText,
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* ========================================================
          PENDING
      ======================================================== */}

      {tab === 'pending' &&
        (pendingError ? (
          <View style={styles.errorContainer}>
            <ErrorState
              message="Couldn't load your pending activity."
              onRetry={loadPending}
            />
          </View>
        ) : (
          <FlatList
            data={pending}
            keyExtractor={(item) => item.id}
            renderItem={renderPendingItem}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={loadActivity}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
            contentContainerStyle={[
              styles.listContent,
              pending.length === 0 &&
                styles.emptyList,
            ]}
            ListEmptyComponent={
              renderPendingEmpty
            }
            ListFooterComponent={
              <Footer />
            }
          />
        ))}

      {/* ========================================================
          HISTORY
      ======================================================== */}

      {tab === 'history' &&
        (historyError ? (
          <View style={styles.errorContainer}>
            <ErrorState
              message="Couldn't load your recommendation history."
              onRetry={loadHistory}
            />
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderHistoryItem}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={loadActivity}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
            contentContainerStyle={[
              styles.listContent,
              history.length === 0 &&
                styles.emptyList,
            ]}
            ListEmptyComponent={
              renderHistoryEmpty
            }
            ListFooterComponent={
              <Footer />
            }
          />
        ))}
    </View>
  );
}

/* ==============================================================
   FOOTER
============================================================== */

function Footer() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerDivider} />

      <View style={styles.footerBrand}>
        <View style={styles.footerDot} />

        <Text style={styles.footerProject}>
          NokriHub
        </Text>
      </View>

      <Text style={styles.footerText}>
        Project By{' '}
        <Text style={styles.footerName}>
          SYED MESAM ABBAS & ABDUL MANNAN RANA
        </Text>
      </Text>

      <Text style={styles.footerCaption}>
        Professional job & recommendation platform
      </Text>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  /* ============================================================
     SCREEN
  ============================================================ */

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  /* ============================================================
     PROFESSIONAL CENTERED HEADER
  ============================================================ */

  header: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingTop: 12,
    paddingBottom: 18,
    paddingHorizontal: 18,
    marginBottom: 15,

    borderWidth: 1,
    borderColor: '#E7EBF2',

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 13,
    elevation: 3,
  },

  headerAccent: {
    width: 48,
    height: 4,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    marginBottom: 13,
  },

  logoContainer: {
    width: 82,
    height: 82,
    borderRadius: 23,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#DDE5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.09,
    shadowRadius: 11,
    elevation: 3,
  },

  logoInner: {
    width: 70,
    height: 70,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 64,
    height: 64,
  },

  headerBrand: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2.2,
    marginBottom: 2,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.7,
    textAlign: 'center',
  },

  headerSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 310,
  },

  pendingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
  },

  pendingIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.warning,
    marginRight: 6,
  },

  pendingIndicatorText: {
    color: COLORS.warning,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  /* ============================================================
     TABS
  ============================================================ */

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    padding: 4,
    marginBottom: 14,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 2,
  },

  tab: {
    flex: 1,
    minHeight: 45,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  activeTab: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },

  tabIcon: {
    fontSize: 12,
    marginRight: 6,
  },

  tabText: {
    color: COLORS.secondaryText,
    fontSize: 11,
    fontWeight: '800',
  },

  activeTabText: {
    color: COLORS.white,
    fontWeight: '900',
  },

  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    paddingHorizontal: 5,
  },

  activeTabBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  tabBadgeText: {
    color: COLORS.secondaryText,
    fontSize: 8,
    fontWeight: '900',
  },

  activeTabBadgeText: {
    color: COLORS.white,
  },

  /* ============================================================
     LIST
  ============================================================ */

  listContent: {
    paddingTop: 1,
    paddingBottom: 10,
  },

  emptyList: {
    flexGrow: 1,
  },

  /* ============================================================
     PENDING CARD
  ============================================================ */

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 13,
    overflow: 'hidden',

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.055,
    shadowRadius: 12,
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
    backgroundColor: COLORS.primary,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 3,
  },

  jobIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  jobIconText: {
    fontSize: 21,
  },

  jobHeaderContent: {
    flex: 1,
  },

  jobTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },

  actionRequiredBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    backgroundColor: COLORS.warningLight,
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  actionRequiredDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.warning,
    marginRight: 5,
  },

  pendingLabel: {
    color: COLORS.warning,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  /* ============================================================
     PERSON
  ============================================================ */

  personContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 17,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },

  avatarText: {
    color: COLORS.purple,
    fontSize: 13,
    fontWeight: '900',
  },

  personInfo: {
    flex: 1,
  },

  personName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },

  personDescription: {
    color: COLORS.secondaryText,
    fontSize: 10,
    marginTop: 3,
    lineHeight: 15,
  },

  /* ============================================================
     NOTE
  ============================================================ */

  noteContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    padding: 12,
    marginTop: 14,
  },

  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  noteIcon: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '900',
    marginRight: 4,
    lineHeight: 18,
  },

  noteLabel: {
    color: COLORS.lightText,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  noteText: {
    color: COLORS.secondaryText,
    fontSize: 11,
    lineHeight: 17,
    fontStyle: 'italic',
  },

  /* ============================================================
     CV
  ============================================================ */

  cvButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
    borderRadius: 14,
    padding: 10,
    marginTop: 12,
  },

  cvIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  cvIcon: {
    fontSize: 17,
  },

  cvContent: {
    flex: 1,
  },

  cvTitle: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '900',
  },

  cvSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 9,
    marginTop: 2,
  },

  cvArrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrow: {
    color: COLORS.primary,
    fontSize: 23,
    fontWeight: '400',
  },

  /* ============================================================
     ACTIONS
  ============================================================ */

  actionsContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },

  acceptButton: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.success,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,

    shadowColor: COLORS.success,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 2,
  },

  acceptIcon: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
    marginRight: 5,
  },

  acceptText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },

  declineButton: {
    height: 44,
    paddingHorizontal: 20,
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  declineText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: '900',
  },

  disabledButton: {
    opacity: 0.6,
  },

  /* ============================================================
     HISTORY
  ============================================================ */

  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  historyIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  historyIconText: {
    fontSize: 20,
  },

  historyContent: {
    flex: 1,
  },

  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  historyJobTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
    marginRight: 7,
  },

  historyDescription: {
    color: COLORS.secondaryText,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },

  /* ============================================================
     STATUS
  ============================================================ */

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },

  statusText: {
    fontSize: 8,
    fontWeight: '900',
  },

  /* ============================================================
     EMPTY STATE
  ============================================================ */

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 45,
  },

  emptyIconContainer: {
    width: 78,
    height: 78,
    borderRadius: 25,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },

  emptySuccessIcon: {
    backgroundColor: COLORS.successLight,
    borderColor: '#BBF7D0',
  },

  emptyIcon: {
    color: COLORS.primary,
    fontSize: 30,
    fontWeight: '900',
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
  },

  emptyDescription: {
    color: COLORS.secondaryText,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 7,
    maxWidth: 320,
  },

  emptyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 21,
    paddingVertical: 12,
    marginTop: 18,

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 3,
  },

  emptyButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },

  /* ============================================================
     ERROR
  ============================================================ */

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },

  /* ============================================================
     FOOTER
  ============================================================ */

  footer: {
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 12,
  },

  footerDivider: {
    width: 42,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primarySoft,
    marginBottom: 11,
  },

  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  footerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 5,
  },

  footerProject: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  footerText: {
    color: COLORS.lightText,
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.15,
  },

  footerName: {
    color: COLORS.secondaryText,
    fontWeight: '800',
  },

  footerCaption: {
    color: '#B0B7C3',
    fontSize: 8,
    marginTop: 4,
    textAlign: 'center',
  },
});



















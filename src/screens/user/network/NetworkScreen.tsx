import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import LOGO from '../../../../assets/images/Logo.png';

import {
  searchUsersByEmail,
  sendConnectionRequest,
  respondToConnectionRequest,
  getAcceptedConnections,
  getPendingRequests,
} from '../../services/connections.service';

import { useAuthStore } from '../../store/authStore';
import ErrorState from '../../components/shared/ErrorState';

type Tab = 'search' | 'requests' | 'connections';

type User = {
  id: string;
  name?: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  profile_photo_url?: string;
};

type ConnectionRequest = {
  id: string;
  requester?: User;
  addressee?: User;
};

type Connection = {
  id: string;
  requester: User;
  addressee: User;
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
  borderLight: '#EEF1F5',

  success: '#12B76A',
  successLight: '#ECFDF3',

  danger: '#D92D20',
  dangerLight: '#FEF3F2',

  warning: '#F79009',
  warningLight: '#FFFAEB',

  chipBackground: '#F2F4F7',
};

export default function NetworkScreen() {
  const session = useAuthStore((s) => s.session);

  const [tab, setTab] = useState<Tab>('search');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [pending, setPending] = useState<ConnectionRequest[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const [searchError, setSearchError] = useState(false);
  const [pendingError, setPendingError] = useState(false);
  const [connectionsError, setConnectionsError] = useState(false);

  /* ============================================================
     LOAD PENDING REQUESTS
  ============================================================ */

  const loadPending = useCallback(async () => {
    if (!session?.user?.id) {
      setPending([]);
      return;
    }

    try {
      const data = await getPendingRequests(session.user.id);

      setPending(Array.isArray(data) ? data : []);
      setPendingError(false);
    } catch (err) {
      console.log('Failed to load pending requests:', err);
      setPendingError(true);
    }
  }, [session?.user?.id]);

  /* ============================================================
     LOAD CONNECTIONS
  ============================================================ */

  const loadConnections = useCallback(async () => {
    if (!session?.user?.id) {
      setConnections([]);
      return;
    }

    try {
      const data = await getAcceptedConnections(session.user.id);

      setConnections(Array.isArray(data) ? data : []);
      setConnectionsError(false);
    } catch (err) {
      console.log('Failed to load connections:', err);
      setConnectionsError(true);
    }
  }, [session?.user?.id]);

  /* ============================================================
     LOAD ALL NETWORK DATA
  ============================================================ */

  const loadNetwork = useCallback(async () => {
    setRefreshing(true);

    try {
      await Promise.all([loadPending(), loadConnections()]);
    } finally {
      setRefreshing(false);
    }
  }, [loadPending, loadConnections]);

  useFocusEffect(
    useCallback(() => {
      loadNetwork();
    }, [loadNetwork]),
  );

  /* ============================================================
     SEARCH
  ============================================================ */

  const handleSearch = async () => {
    const email = query.trim().toLowerCase();

    if (!email) {
      Alert.alert(
        'Search',
        'Please enter an email address to search.',
      );
      return;
    }

    if (!email.includes('@')) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address.',
      );
      return;
    }

    setSearching(true);
    setSearchError(false);

    try {
      const users = await searchUsersByEmail(email);

      const filteredUsers = (users || []).filter(
        (user: User) => user.id !== session?.user?.id,
      );

      setResults(filteredUsers);
    } catch (err: any) {
      console.log('Search failed:', err);

      setSearchError(true);

      Alert.alert(
        'Search Failed',
        err?.message ||
          'Could not search for users. Please try again.',
      );
    } finally {
      setSearching(false);
    }
  };

  /* ============================================================
     SEND CONNECTION REQUEST
  ============================================================ */

  const handleInvite = async (targetId: string) => {
    if (!session?.user?.id) {
      Alert.alert(
        'Sign In Required',
        'Please sign in before sending a connection request.',
      );
      return;
    }

    setInvitingId(targetId);

    try {
      await sendConnectionRequest(session.user.id, targetId);

      Alert.alert(
        'Request Sent',
        'Your connection request has been sent successfully.',
      );

      setResults((prev) =>
        prev.filter((user) => user.id !== targetId),
      );
    } catch (err: any) {
      console.log('Failed to send connection request:', err);

      Alert.alert(
        'Request Failed',
        err?.message ||
          'Could not send the connection request.',
      );
    } finally {
      setInvitingId(null);
    }
  };

  /* ============================================================
     RESPOND TO REQUEST
  ============================================================ */

  const handleRespond = async (
    id: string,
    status: 'accepted' | 'declined',
  ) => {
    setRespondingId(id);

    try {
      await respondToConnectionRequest(id, status);

      if (status === 'accepted') {
        Alert.alert(
          'Connected',
          'You are now connected with this person.',
        );
      } else {
        Alert.alert(
          'Request Declined',
          'The connection request has been declined.',
        );
      }

      await Promise.all([loadPending(), loadConnections()]);
    } catch (err: any) {
      console.log(
        'Failed to respond to connection request:',
        err,
      );

      Alert.alert(
        'Action Failed',
        err?.message ||
          'Could not update the connection request.',
      );
    } finally {
      setRespondingId(null);
    }
  };

  /* ============================================================
     USER DISPLAY HELPERS
  ============================================================ */

  const getUserName = (user?: User) => {
    if (!user) {
      return 'Unnamed User';
    }

    return (
      user.name ||
      user.full_name ||
      user.email?.split('@')[0] ||
      'Unnamed User'
    );
  };

  const getUserInitials = (user?: User) => {
    const name = getUserName(user);

    if (!name.trim()) {
      return 'U';
    }

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  /* ============================================================
     SEARCH RESULT CARD
  ============================================================ */

  const renderSearchResult = ({
    item,
  }: {
    item: User;
  }) => {
    const isInviting = invitingId === item.id;

    return (
      <View style={styles.userCard}>
        <View style={styles.avatarWrapper}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {getUserInitials(item)}
            </Text>
          </View>

          <View style={styles.onlineDot} />
        </View>

        <View style={styles.userInfo}>
          <Text
            style={styles.userName}
            numberOfLines={1}
          >
            {getUserName(item)}
          </Text>

          {item.email ? (
            <Text
              style={styles.userEmail}
              numberOfLines={1}
            >
              {item.email}
            </Text>
          ) : (
            <Text style={styles.userRole}>
              NokriHub Member
            </Text>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={isInviting}
          style={[
            styles.inviteButton,
            isInviting && styles.disabledButton,
          ]}
          onPress={() => handleInvite(item.id)}
        >
          {isInviting ? (
            <ActivityIndicator
              size="small"
              color={COLORS.white}
            />
          ) : (
            <>
              <Text style={styles.inviteIcon}>+</Text>

              <Text style={styles.inviteText}>
                Connect
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  /* ============================================================
     REQUEST CARD
  ============================================================ */

  const renderRequest = ({
    item,
  }: {
    item: ConnectionRequest;
  }) => {
    const user = item.requester;
    const isResponding = respondingId === item.id;

    return (
      <View style={styles.requestCard}>
        <View style={styles.avatarWrapper}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {getUserInitials(user)}
            </Text>
          </View>
        </View>

        <View style={styles.requestContent}>
          <Text
            style={styles.userName}
            numberOfLines={1}
          >
            {getUserName(user)}
          </Text>

          <Text style={styles.requestMessage}>
            Wants to connect with you
          </Text>

          <View style={styles.requestActions}>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isResponding}
              style={[
                styles.acceptButton,
                isResponding && styles.disabledButton,
              ]}
              onPress={() =>
                handleRespond(item.id, 'accepted')
              }
            >
              {isResponding ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.white}
                />
              ) : (
                <>
                  <Text style={styles.acceptIcon}>✓</Text>

                  <Text style={styles.acceptText}>
                    Accept
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isResponding}
              style={[
                styles.declineButton,
                isResponding && styles.disabledButton,
              ]}
              onPress={() =>
                handleRespond(item.id, 'declined')
              }
            >
              <Text style={styles.declineText}>
                Decline
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  /* ============================================================
     CONNECTION CARD
  ============================================================ */

  const renderConnection = ({
    item,
  }: {
    item: Connection;
  }) => {
    const currentUserId = session?.user?.id;

    const isRequester =
      item.requester?.id === currentUserId;

    const otherUser = isRequester
      ? item.addressee
      : item.requester;

    return (
      <View style={styles.connectionCard}>
        <View style={styles.avatarWrapper}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {getUserInitials(otherUser)}
            </Text>
          </View>

          <View style={styles.connectedDot} />
        </View>

        <View style={styles.connectionInfo}>
          <Text
            style={styles.userName}
            numberOfLines={1}
          >
            {getUserName(otherUser)}
          </Text>

          {otherUser?.email ? (
            <Text
              style={styles.userEmail}
              numberOfLines={1}
            >
              {otherUser.email}
            </Text>
          ) : (
            <Text style={styles.userRole}>
              NokriHub Member
            </Text>
          )}
        </View>

        <View style={styles.connectedBadge}>
          <Text style={styles.connectedIcon}>✓</Text>

          <Text style={styles.connectedText}>
            Connected
          </Text>
        </View>
      </View>
    );
  };

  /* ============================================================
     EMPTY STATES
  ============================================================ */

  const renderEmpty = () => {
    if (tab === 'search') {
      if (searching) {
        return (
          <View style={styles.emptyContainer}>
            <View style={styles.loadingCircle}>
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              Searching...
            </Text>

            <Text style={styles.emptyText}>
              Looking for NokriHub members.
            </Text>
          </View>
        );
      }

      if (searchError) {
        return (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconContainer,
                styles.errorEmptyIcon,
              ]}
            >
              <Text style={styles.emptyIcon}>!</Text>
            </View>

            <Text style={styles.emptyTitle}>
              Search unavailable
            </Text>

            <Text style={styles.emptyText}>
              We couldn't complete your search.
              Please try again.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.emptyActionButton}
              onPress={handleSearch}
            >
              <Text style={styles.emptyActionText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        );
      }

      if (query.trim()) {
        return (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>⌕</Text>
            </View>

            <Text style={styles.emptyTitle}>
              No members found
            </Text>

            <Text style={styles.emptyText}>
              No NokriHub member was found with
              this email address.
            </Text>
          </View>
        );
      }

      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
          </View>

          <Text style={styles.emptyTitle}>
            Grow your network
          </Text>

          <Text style={styles.emptyText}>
            Search for professionals by email and
            build meaningful connections on NokriHub.
          </Text>

          <View style={styles.emptyHint}>
            <Text style={styles.emptyHintIcon}>💡</Text>

            <Text style={styles.emptyHintText}>
              Tip: Search using the professional's
              registered email address.
            </Text>
          </View>
        </View>
      );
    }

    if (tab === 'requests') {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>🤝</Text>
          </View>

          <Text style={styles.emptyTitle}>
            No pending requests
          </Text>

          <Text style={styles.emptyText}>
            You're all caught up. New connection
            requests will appear here.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Text style={styles.emptyIcon}>⭐</Text>
        </View>

        <Text style={styles.emptyTitle}>
          Build your network
        </Text>

        <Text style={styles.emptyText}>
          Your accepted professional connections
          will appear here.
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.emptyActionButton}
          onPress={() => setTab('search')}
        >
          <Text style={styles.emptyActionText}>
            Find People
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  /* ============================================================
     TAB BUTTON
  ============================================================ */

  const renderTab = (
    value: Tab,
    icon: string,
    label: string,
    badge?: number,
  ) => {
    const active = tab === value;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.tab,
          active && styles.tabActive,
        ]}
        onPress={() => setTab(value)}
      >
        <Text style={styles.tabIcon}>{icon}</Text>

        <Text
          style={[
            styles.tabText,
            active && styles.tabTextActive,
          ]}
        >
          {label}
        </Text>

        {badge && badge > 0 ? (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  /* ============================================================
     MAIN UI
  ============================================================ */

  return (
    <View style={styles.container}>
      {/* ========================================================
          PROFESSIONAL LOGO HEADER
      ======================================================== */}

      <View style={styles.header}>
        <View style={styles.headerGlow} />

        <View style={styles.headerLogoWrapper}>
          <Image
            source={LOGO}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* ========================================================
          TABS
      ======================================================== */}

      <View style={styles.tabContainer}>
        {renderTab('search', '⌕', 'Search')}
        {renderTab(
          'requests',
          '🤝',
          'Requests',
          pending.length,
        )}
        {renderTab(
          'connections',
          '👤',
          'Connections',
        )}
      </View>

      {/* ========================================================
          SEARCH TAB
      ======================================================== */}

      {tab === 'search' && (
        <View style={styles.flex}>
          <View style={styles.searchSection}>
            <View style={styles.searchTitleRow}>
              <View>
                <Text style={styles.searchLabel}>
                  Find a professional
                </Text>

                <Text style={styles.searchDescription}>
                  Search by registered email address
                </Text>
              </View>

              <View style={styles.memberPill}>
                <Text style={styles.memberPillText}>
                  NokriHub
                </Text>
              </View>
            </View>

            <View style={styles.searchRow}>
              <View style={styles.searchInputContainer}>
                <View style={styles.searchIconContainer}>
                  <Text style={styles.searchIcon}>
                    @
                  </Text>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Enter email address"
                  placeholderTextColor={COLORS.lightText}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={query}
                  onChangeText={setQuery}
                  returnKeyType="search"
                  onSubmitEditing={handleSearch}
                />

                {query.length > 0 && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setQuery('');
                      setResults([]);
                      setSearchError(false);
                    }}
                  >
                    <Text style={styles.clearIcon}>
                      ×
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                disabled={searching}
                style={[
                  styles.searchButton,
                  searching &&
                    styles.disabledSearchButton,
                ]}
                onPress={handleSearch}
              >
                {searching ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.white}
                  />
                ) : (
                  <>
                    <Text style={styles.searchButtonIcon}>
                      ⌕
                    </Text>

                    <Text style={styles.searchButtonText}>
                      Search
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={renderSearchResult}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              results.length === 0 &&
                styles.emptyListContent,
            ]}
            ListEmptyComponent={renderEmpty}
          />
        </View>
      )}

      {/* ========================================================
          REQUESTS TAB
      ======================================================== */}

      {tab === 'requests' &&
        (pendingError ? (
          <View style={styles.errorWrapper}>
            <ErrorState
              message="Couldn't load connection requests."
              onRetry={loadPending}
            />
          </View>
        ) : (
          <FlatList
            data={pending}
            keyExtractor={(item) => item.id}
            renderItem={renderRequest}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={loadNetwork}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
            contentContainerStyle={[
              styles.listContent,
              pending.length === 0 &&
                styles.emptyListContent,
            ]}
            ListEmptyComponent={renderEmpty}
          />
        ))}

      {/* ========================================================
          CONNECTIONS TAB
      ======================================================== */}

      {tab === 'connections' &&
        (connectionsError ? (
          <View style={styles.errorWrapper}>
            <ErrorState
              message="Couldn't load your connections."
              onRetry={loadConnections}
            />
          </View>
        ) : (
          <FlatList
            data={connections}
            keyExtractor={(item) => item.id}
            renderItem={renderConnection}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={loadNetwork}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
              />
            }
            contentContainerStyle={[
              styles.listContent,
              connections.length === 0 &&
                styles.emptyListContent,
            ]}
            ListEmptyComponent={renderEmpty}
          />
        ))}

      {/* ========================================================
          PROFESSIONAL FOOTER
      ======================================================== */}

      <View style={styles.footer}>
        <View style={styles.footerDivider} />

        <View style={styles.footerContent}>
          <View style={styles.footerBrand}>
            <View style={styles.footerLogo}>
              <Text style={styles.footerLogoText}>
                N
              </Text>
            </View>

            <View>
              <Text style={styles.footerProject}>
                Project By{' '}
                <Text style={styles.footerName}>
                  SYED MESAM ABBAS & ABDUL MANNAN RANA
                </Text>
              </Text>

              <Text style={styles.footerSubtext}>
                Professional networking powered by NokriHub
              </Text>
            </View>
          </View>

          <View style={styles.footerSecure}>
            <Text style={styles.footerLock}>
              🔒
            </Text>

            <Text style={styles.footerSecureText}>
              Secure
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  flex: {
    flex: 1,
  },

  /* ==========================================================
     PROFESSIONAL LOGO HEADER
  ========================================================== */

  header: {
    height: 82,
    width: '100%',

    backgroundColor: COLORS.white,

    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 15,

    overflow: 'hidden',

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,

    position: 'relative',
  },

  headerGlow: {
    position: 'absolute',
    top: -45,
    left: '50%',
    marginLeft: -75,

    width: 150,
    height: 90,
    borderRadius: 75,

    backgroundColor: COLORS.primaryLight,

    opacity: 0.8,
  },

  headerLogoWrapper: {
    width: 150,
    height: 58,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: COLORS.white,

    borderRadius: 14,

    zIndex: 2,
  },

  headerLogo: {
    width: 140,
    height: 52,
  },

  /* ==========================================================
     TABS
  ========================================================== */

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,

    padding: 4,
    marginBottom: 15,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },

  tab: {
    flex: 1,
    minHeight: 44,

    borderRadius: 12,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 4,
  },

  tabActive: {
    backgroundColor: COLORS.primaryLight,
  },

  tabIcon: {
    fontSize: 12,
    marginRight: 4,
  },

  tabText: {
    color: COLORS.secondaryText,
    fontSize: 10,
    fontWeight: '700',
  },

  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '900',
  },

  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,

    backgroundColor: COLORS.danger,

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 4,
    paddingHorizontal: 4,
  },

  countBadgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '900',
  },

  /* ==========================================================
     SEARCH
  ========================================================== */

  searchSection: {
    backgroundColor: COLORS.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,

    padding: 13,
    marginBottom: 11,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 7,
    elevation: 2,
  },

  searchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  searchLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.text,
  },

  searchDescription: {
    fontSize: 10,
    color: COLORS.secondaryText,
    marginTop: 2,
  },

  memberPill: {
    backgroundColor: COLORS.successLight,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  memberPillText: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: '900',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInputContainer: {
    flex: 1,
    height: 50,

    backgroundColor: '#FAFBFC',

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 9,

    marginRight: 8,
  },

  searchIconContainer: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  searchIcon: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '900',
  },

  input: {
    flex: 1,
    height: '100%',

    fontSize: 13,
    color: COLORS.text,

    paddingVertical: 0,
  },

  clearIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,

    backgroundColor: COLORS.chipBackground,

    color: COLORS.secondaryText,

    textAlign: 'center',
    textAlignVertical: 'center',

    fontSize: 19,
  },

  searchButton: {
    height: 50,
    minWidth: 82,

    borderRadius: 13,

    backgroundColor: COLORS.primary,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 3,
  },

  disabledSearchButton: {
    opacity: 0.7,
  },

  searchButtonIcon: {
    color: COLORS.white,
    fontSize: 15,
    marginRight: 4,
    fontWeight: '900',
  },

  searchButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },

  /* ==========================================================
     LIST
  ========================================================== */

  listContent: {
    paddingTop: 3,
    paddingBottom: 18,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  /* ==========================================================
     AVATARS
  ========================================================== */

  avatarWrapper: {
    position: 'relative',
    width: 48,
    height: 48,
    marginRight: 11,
  },

  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 15,

    backgroundColor: COLORS.primaryLight,

    borderWidth: 1,
    borderColor: '#D7E9FA',

    alignItems: 'center',
    justifyContent: 'center',
  },

  userAvatarText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '900',
  },

  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,

    width: 11,
    height: 11,
    borderRadius: 6,

    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  connectedDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,

    width: 11,
    height: 11,
    borderRadius: 6,

    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  /* ==========================================================
     USER CARD
  ========================================================== */

  userCard: {
    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,

    padding: 13,

    marginBottom: 10,

    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 7,
    elevation: 2,
  },

  userInfo: {
    flex: 1,
    minWidth: 0,
  },

  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },

  userEmail: {
    fontSize: 11,
    color: COLORS.secondaryText,
    marginTop: 3,
  },

  userRole: {
    fontSize: 10,
    color: COLORS.lightText,
    marginTop: 3,
  },

  inviteButton: {
    height: 38,

    paddingHorizontal: 11,

    backgroundColor: COLORS.primary,
    borderRadius: 11,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 8,
  },

  inviteIcon: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '500',
    marginRight: 3,
  },

  inviteText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '900',
  },

  /* ==========================================================
     REQUEST CARD
  ========================================================== */

  requestCard: {
    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,

    padding: 14,

    marginBottom: 10,

    flexDirection: 'row',

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 7,
    elevation: 2,
  },

  requestContent: {
    flex: 1,
    minWidth: 0,
  },

  requestMessage: {
    marginTop: 3,
    fontSize: 11,
    color: COLORS.secondaryText,
  },

  requestActions: {
    flexDirection: 'row',
    marginTop: 11,
  },

  acceptButton: {
    height: 35,

    backgroundColor: COLORS.success,
    borderRadius: 9,

    paddingHorizontal: 13,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 7,
  },

  acceptIcon: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    marginRight: 4,
  },

  acceptText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '900',
  },

  declineButton: {
    height: 35,

    backgroundColor: COLORS.dangerLight,
    borderRadius: 9,

    paddingHorizontal: 13,

    alignItems: 'center',
    justifyContent: 'center',
  },

  declineText: {
    color: COLORS.danger,
    fontSize: 10,
    fontWeight: '800',
  },

  /* ==========================================================
     CONNECTION CARD
  ========================================================== */

  connectionCard: {
    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,

    padding: 13,

    marginBottom: 10,

    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 7,
    elevation: 2,
  },

  connectionInfo: {
    flex: 1,
    minWidth: 0,
  },

  connectedBadge: {
    backgroundColor: COLORS.successLight,

    borderRadius: 20,

    paddingHorizontal: 8,
    paddingVertical: 6,

    flexDirection: 'row',
    alignItems: 'center',

    marginLeft: 6,
  },

  connectedIcon: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '900',
    marginRight: 3,
  },

  connectedText: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: '800',
  },

  /* ==========================================================
     EMPTY STATE
  ========================================================== */

  emptyContainer: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 28,
    paddingBottom: 35,
  },

  emptyIconContainer: {
    width: 78,
    height: 78,

    borderRadius: 25,

    backgroundColor: COLORS.primaryLight,

    borderWidth: 1,
    borderColor: '#D7E9FA',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 16,
  },

  errorEmptyIcon: {
    backgroundColor: COLORS.dangerLight,
    borderColor: '#FECACA',
  },

  emptyIcon: {
    fontSize: 31,
    color: COLORS.primary,
    fontWeight: '900',
  },

  loadingCircle: {
    width: 78,
    height: 78,
    borderRadius: 25,

    backgroundColor: COLORS.primaryLight,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.secondaryText,

    textAlign: 'center',

    marginTop: 7,

    maxWidth: 320,
  },

  emptyHint: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: 12,

    paddingHorizontal: 11,
    paddingVertical: 9,

    marginTop: 18,

    maxWidth: 320,
  },

  emptyHintIcon: {
    fontSize: 14,
    marginRight: 7,
  },

  emptyHintText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.secondaryText,
  },

  emptyActionButton: {
    backgroundColor: COLORS.primary,

    borderRadius: 11,

    paddingHorizontal: 20,
    paddingVertical: 11,

    marginTop: 18,

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },

  emptyActionText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },

  /* ==========================================================
     DISABLED
  ========================================================== */

  disabledButton: {
    opacity: 0.6,
  },

  /* ==========================================================
     ERROR
  ========================================================== */

  errorWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },

  /* ==========================================================
     FOOTER
  ========================================================== */

  footer: {
    backgroundColor: COLORS.background,
    paddingTop: 7,
    paddingBottom: 8,
  },

  footerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 8,
  },

  footerContent: {
    minHeight: 42,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  footerLogo: {
    width: 30,
    height: 30,
    borderRadius: 9,

    backgroundColor: COLORS.primary,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 8,
  },

  footerLogoText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  },

  footerProject: {
    fontSize: 9,
    color: COLORS.secondaryText,
    fontWeight: '600',
  },

  footerName: {
    color: COLORS.primary,
    fontWeight: '900',
  },

  footerSubtext: {
    marginTop: 2,
    fontSize: 8,
    color: COLORS.lightText,
  },

  footerSecure: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: COLORS.successLight,

    borderRadius: 20,

    paddingHorizontal: 8,
    paddingVertical: 5,

    marginLeft: 8,
  },

  footerLock: {
    fontSize: 9,
    marginRight: 3,
  },

  footerSecureText: {
    color: COLORS.success,
    fontSize: 8,
    fontWeight: '800',
  },
});





























import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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

import { listAllJobs } from '../../services/jobs.service';
import { listUserCVs } from '../../services/cv.service';
import { useAuthStore } from '../../store/authStore';
import ErrorState from '../../components/shared/ErrorState';

import type { Job } from '../../types/job';

type JobWithMatch = Job & {
  matchCount: number;
};

const COLORS = {
  primary: '#0A66C2',
  primaryDark: '#084F96',
  primaryLight: '#EAF3FC',
  primarySoft: '#F3F8FE',

  background: '#F6F8FC',
  white: '#FFFFFF',

  text: '#172033',
  secondaryText: '#667085',
  lightText: '#98A2B3',

  border: '#E4E7EC',
  divider: '#EEF1F5',
  inputBackground: '#FFFFFF',

  success: '#12B76A',
  successLight: '#ECFDF3',

  chipBackground: '#F2F4F7',
  chipText: '#475467',

  warning: '#F79009',
};

export default function FeedScreen({ navigation }: any) {
  const session = useAuthStore((s) => s.session);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [mySkills, setMySkills] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);

    listAllJobs()
      .then((data) => {
        setJobs(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.log('Failed to load jobs:', err);
        setError(true);
        setJobs([]);
      })
      .finally(() => {
        setLoading(false);
      });

    if (session?.user?.id) {
      listUserCVs(session.user.id)
        .then((cvs) => {
          const skillSet = new Set<string>();

          cvs.forEach((cv) => {
            const skills = cv?.data?.skills;

            if (Array.isArray(skills)) {
              skills.forEach((skill) => {
                if (typeof skill === 'string' && skill.trim()) {
                  skillSet.add(skill.trim().toLowerCase());
                }
              });
            }
          });

          setMySkills(Array.from(skillSet));
        })
        .catch((err) => {
          console.log(
            'Failed to load CV skills for matching:',
            err,
          );

          // CV matching is non-critical.
          setMySkills([]);
        });
    } else {
      setMySkills([]);
    }
  }, [session?.user?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const visibleJobs = useMemo<JobWithMatch[]>(() => {
    const query = search.trim().toLowerCase();

    return jobs
      .filter((job) => {
        const title = job.title?.toLowerCase() ?? '';
        const location = job.location?.toLowerCase() ?? '';

        const skills = Array.isArray(job.skills)
          ? job.skills
          : [];

        if (!query) {
          return true;
        }

        return (
          title.includes(query) ||
          location.includes(query) ||
          skills.some((skill) =>
            skill.toLowerCase().includes(query),
          )
        );
      })
      .map((job) => {
        const skills = Array.isArray(job.skills)
          ? job.skills
          : [];

        const matchCount = skills.filter((skill) =>
          mySkills.includes(skill.toLowerCase()),
        ).length;

        return {
          ...job,
          matchCount,
        };
      })
      .sort((a, b) => b.matchCount - a.matchCount);
  }, [jobs, search, mySkills]);

  const renderJob = ({
    item,
  }: {
    item: JobWithMatch;
  }) => {
    const skills = Array.isArray(item.skills)
      ? item.skills
      : [];

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.jobCard}
        onPress={() =>
          navigation.navigate('JobDetail', {
            jobId: item.id,
          })
        }
      >
        {/* Top Accent */}
        <View
          style={[
            styles.jobAccent,
            item.matchCount > 0 && styles.jobAccentMatched,
          ]}
        />

        <View style={styles.jobCardInner}>
          {/* ==================================================
              JOB HEADER
          ================================================== */}

          <View style={styles.jobHeader}>
            <View style={styles.companyLogo}>
              <Text style={styles.companyLogoText}>
                {getInitials(item.title)}
              </Text>
            </View>

            <View style={styles.jobHeaderContent}>
              <Text
                style={styles.jobTitle}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>⌖</Text>

                <Text
                  style={styles.locationText}
                  numberOfLines={1}
                >
                  {item.location || 'Location not specified'}
                </Text>
              </View>
            </View>

            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>›</Text>
            </View>
          </View>

          {/* ==================================================
              JOB INFORMATION
          ================================================== */}

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Text style={styles.infoIcon}>◆</Text>
              </View>

              <Text
                style={styles.infoText}
                numberOfLines={1}
              >
                {formatEmploymentType(item.employment_type)}
              </Text>
            </View>

            {item.salary_band ? (
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Text style={styles.infoIcon}>$</Text>
                </View>

                <Text
                  style={styles.salaryText}
                  numberOfLines={1}
                >
                  {item.salary_band}
                </Text>
              </View>
            ) : null}
          </View>

          {/* ==================================================
              SKILLS
          ================================================== */}

          {skills.length > 0 && (
            <View style={styles.skillsSection}>
              <View style={styles.skillsHeader}>
                <Text style={styles.skillsLabel}>
                  Required Skills
                </Text>

                {item.matchCount > 0 && (
                  <Text style={styles.skillsMatchLabel}>
                    {item.matchCount} matched
                  </Text>
                )}
              </View>

              <View style={styles.skillsContainer}>
                {skills.slice(0, 4).map((skill, index) => {
                  const matched = mySkills.includes(
                    skill.toLowerCase(),
                  );

                  return (
                    <View
                      key={`${skill}-${index}`}
                      style={[
                        styles.skillChip,
                        matched && styles.skillChipMatched,
                      ]}
                    >
                      {matched && (
                        <Text style={styles.skillCheck}>
                          ✓
                        </Text>
                      )}

                      <Text
                        style={[
                          styles.skillText,
                          matched && styles.skillTextMatched,
                        ]}
                      >
                        {skill}
                      </Text>
                    </View>
                  );
                })}

                {skills.length > 4 && (
                  <View style={styles.moreChip}>
                    <Text style={styles.moreChipText}>
                      +{skills.length - 4}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ==================================================
              MATCH BANNER
          ================================================== */}

          {item.matchCount > 0 && (
            <View style={styles.matchContainer}>
              <View style={styles.matchLeft}>
                <View style={styles.matchIcon}>
                  <Text style={styles.matchIconText}>
                    ✓
                  </Text>
                </View>

                <View style={styles.matchTextContainer}>
                  <Text style={styles.matchTitle}>
                    Great match for you
                  </Text>

                  <Text style={styles.matchSubtitle}>
                    {item.matchCount}{' '}
                    {item.matchCount === 1
                      ? 'skill matches'
                      : 'skills match'}{' '}
                    your CV
                  </Text>
                </View>
              </View>

              <Text style={styles.matchArrow}>›</Text>
            </View>
          )}

          {/* Open Job */}
          <View style={styles.openJobRow}>
            <Text style={styles.openJobText}>
              View opportunity
            </Text>

            <Text style={styles.openJobArrow}>→</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.loadingIconContainer}>
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.loadingTitle}>
            Finding opportunities
          </Text>

          <Text style={styles.loadingText}>
            We're loading the latest jobs for you.
          </Text>
        </View>
      );
    }

    if (search.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>⌕</Text>
          </View>

          <Text style={styles.emptyTitle}>
            No jobs found
          </Text>

          <Text style={styles.emptyText}>
            We couldn't find jobs matching "{search}".
            Try another title, skill, or location.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.clearButton}
            onPress={() => setSearch('')}
          >
            <Text style={styles.clearButtonText}>
              Clear Search
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Text style={styles.emptyIcon}>+</Text>
        </View>

        <Text style={styles.emptyTitle}>
          No jobs available yet
        </Text>

        <Text style={styles.emptyText}>
          There are currently no jobs posted. Check back
          soon for new career opportunities.
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.clearButton}
          onPress={load}
        >
          <Text style={styles.clearButtonText}>
            Refresh Jobs
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (error && !loading) {
    return (
      <View style={styles.errorContainer}>
        <ErrorState
          message="Couldn't load jobs right now."
          onRetry={load}
        />

        <Text style={styles.errorFooter}>
          Project By SYED MESAM ABBAS & ABDUL MANNAN RANA
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ====================================================
          PROFESSIONAL LOGO HEADER
      ==================================================== */}

      <View style={styles.logoHeader}>
        <View style={styles.logoHeaderSide}>
          <View style={styles.logoHeaderDot} />
        </View>

        <View style={styles.logoWrapper}>
          <Image
            source={LOGO}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="NokriHub Logo"
          />
        </View>

        <View style={styles.logoHeaderSide}>
          <View style={styles.logoHeaderDot} />
        </View>
      </View>

      {/* ====================================================
          HEADER
      ==================================================== */}

      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>
            CAREER OPPORTUNITIES
          </Text>

          <Text style={styles.headerTitle}>
            Find your next job
          </Text>

          <Text style={styles.headerSubtitle}>
            Discover opportunities that match your skills.
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>
            CV
          </Text>
        </View>
      </View>

      {/* ====================================================
          SEARCH
      ==================================================== */}

      <View style={styles.searchContainer}>
        <View style={styles.searchIconContainer}>
          <Text style={styles.searchIcon}>⌕</Text>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs, skills, or location"
          placeholderTextColor={COLORS.lightText}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          autoCorrect={false}
          clearButtonMode="never"
        />

        {search.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSearch('')}
            style={styles.clearSearch}
          >
            <Text style={styles.clearSearchText}>
              ×
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ====================================================
          RESULTS HEADER
      ==================================================== */}

      <View style={styles.resultsHeader}>
        <View>
          <Text style={styles.resultsTitle}>
            Recommended Jobs
          </Text>

          <Text style={styles.resultsSubtitle}>
            {visibleJobs.length}{' '}
            {visibleJobs.length === 1
              ? 'opportunity'
              : 'opportunities'}{' '}
            available
          </Text>
        </View>

        {mySkills.length > 0 && (
          <View style={styles.profileMatchBadge}>
            <View style={styles.profileMatchDot} />

            <Text style={styles.profileMatchText}>
              CV matched
            </Text>
          </View>
        )}
      </View>

      {/* ====================================================
          JOB LIST
      ==================================================== */}

      <FlatList
        data={visibleJobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJob}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          visibleJobs.length === 0 &&
            styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={load}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={renderEmpty}
      />

      {/* ====================================================
          FOOTER
      ==================================================== */}

      <View style={styles.footer}>
        <View style={styles.footerLine} />

        <Text style={styles.footerText}>
          Project By{' '}
          <Text style={styles.footerName}>
            Syed Mesam Abbas
          </Text>
        </Text>

        <View style={styles.footerLine} />
      </View>
    </View>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function getInitials(title?: string): string {
  if (!title || !title.trim()) {
    return 'J';
  }

  const words = title.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[1].charAt(0)
  ).toUpperCase();
}

function formatEmploymentType(
  type?: string,
): string {
  if (!type) {
    return 'Employment type not specified';
  }

  return type
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
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
    paddingTop: 10,
  },

  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  /* ==========================================================
     PROFESSIONAL LOGO HEADER
  ========================================================== */

  logoHeader: {
    height: 76,
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 15,
    paddingHorizontal: 14,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  logoHeaderSide: {
    flex: 1,
    height: 1,
    backgroundColor: '#E9EEF5',
    justifyContent: 'center',
  },

  logoHeaderDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },

  logoWrapper: {
    width: 150,
    height: 62,
    marginHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFFFFF',
    borderRadius: 15,

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },

  logoImage: {
    width: 138,
    height: 52,
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  greeting: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 5,
  },

  headerTitle: {
    fontSize: 26,
    color: COLORS.text,
    fontWeight: '900',
    letterSpacing: -0.7,
  },

  headerSubtitle: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 5,
    lineHeight: 18,
  },

  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,

    elevation: 4,
  },

  headerIconText: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  /* ==========================================================
     SEARCH
  ========================================================== */

  searchContainer: {
    height: 56,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 12,
    marginBottom: 20,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,

    elevation: 2,
  },

  searchIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  searchIcon: {
    fontSize: 22,
    color: COLORS.primary,
    fontWeight: '700',
    transform: [{ rotate: '-20deg' }],
  },

  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    color: COLORS.text,
    paddingVertical: 0,
  },

  clearSearch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.chipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearSearchText: {
    color: COLORS.secondaryText,
    fontSize: 20,
    lineHeight: 21,
  },

  /* ==========================================================
     RESULTS HEADER
  ========================================================== */

  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  resultsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },

  resultsSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: COLORS.secondaryText,
  },

  profileMatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  profileMatchDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },

  profileMatchText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '800',
  },

  /* ==========================================================
     LIST
  ========================================================== */

  listContent: {
    paddingTop: 2,
    paddingBottom: 18,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  /* ==========================================================
     JOB CARD
  ========================================================== */

  jobCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    marginBottom: 13,
    overflow: 'hidden',

    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.055,
    shadowRadius: 9,

    elevation: 2,
  },

  jobAccent: {
    height: 3,
    width: '100%',
    backgroundColor: COLORS.primary,
  },

  jobAccentMatched: {
    backgroundColor: COLORS.success,
  },

  jobCardInner: {
    padding: 16,
  },

  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  companyLogo: {
    width: 49,
    height: 49,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  companyLogoText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  jobHeaderContent: {
    flex: 1,
    paddingRight: 5,
  },

  jobTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: COLORS.text,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  locationIcon: {
    fontSize: 15,
    color: COLORS.primary,
    marginRight: 5,
    fontWeight: '700',
  },

  locationText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.secondaryText,
  },

  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrow: {
    fontSize: 23,
    lineHeight: 24,
    color: COLORS.secondaryText,
    fontWeight: '400',
  },

  /* ==========================================================
     JOB INFO
  ========================================================== */

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',

    marginTop: 15,
    paddingTop: 13,

    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
    marginBottom: 3,
  },

  infoIconContainer: {
    width: 23,
    height: 23,
    borderRadius: 7,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },

  infoIcon: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: '900',
  },

  infoText: {
    fontSize: 11,
    color: COLORS.secondaryText,
    fontWeight: '600',
    maxWidth: 145,
  },

  salaryText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '800',
    maxWidth: 150,
  },

  /* ==========================================================
     SKILLS
  ========================================================== */

  skillsSection: {
    marginTop: 15,
  },

  skillsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  skillsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },

  skillsMatchLabel: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: '800',
  },

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.chipBackground,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },

  skillChipMatched: {
    backgroundColor: COLORS.successLight,
  },

  skillCheck: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '900',
    marginRight: 4,
  },

  skillText: {
    fontSize: 10,
    color: COLORS.chipText,
    fontWeight: '600',
  },

  skillTextMatched: {
    color: COLORS.success,
    fontWeight: '800',
  },

  moreChip: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginBottom: 6,
  },

  moreChipText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '800',
  },

  /* ==========================================================
     MATCH
  ========================================================== */

  matchContainer: {
    marginTop: 8,
    backgroundColor: COLORS.successLight,
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  matchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  matchIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  matchIconText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  },

  matchTextContainer: {
    flex: 1,
  },

  matchTitle: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '800',
  },

  matchSubtitle: {
    fontSize: 10,
    color: '#4B946D',
    marginTop: 2,
  },

  matchArrow: {
    color: COLORS.success,
    fontSize: 23,
    fontWeight: '500',
  },

  /* ==========================================================
     OPEN JOB
  ========================================================== */

  openJobRow: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  openJobText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '800',
  },

  openJobArrow: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '800',
    marginLeft: 5,
  },

  /* ==========================================================
     EMPTY / LOADING
  ========================================================== */

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingBottom: 50,
  },

  loadingIconContainer: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyIconContainer: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyIcon: {
    fontSize: 31,
    color: COLORS.primary,
    fontWeight: '700',
  },

  loadingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },

  loadingText: {
    fontSize: 12,
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginTop: 7,
    maxWidth: 320,
  },

  clearButton: {
    marginTop: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 11,
    paddingHorizontal: 20,
    paddingVertical: 12,

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,

    elevation: 3,
  },

  clearButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },

  /* ==========================================================
     ERROR
  ========================================================== */

  errorFooter: {
    textAlign: 'center',
    color: COLORS.lightText,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 25,
    marginBottom: 15,
  },

  /* ==========================================================
     FOOTER
  ========================================================== */

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
    paddingBottom: 9,
    paddingHorizontal: 8,
  },

  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E6EAF0',
    maxWidth: 45,
  },

  footerText: {
    color: '#98A2B3',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginHorizontal: 9,
  },

  footerName: {
    color: '#667085',
    fontWeight: '800',
  },
});





























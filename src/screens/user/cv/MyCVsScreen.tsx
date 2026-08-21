import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import LOGO from '../../../../assets/images/Logo.png';

import { listUserCVs } from '../../services/cv.service';
import { useAuthStore } from '../../store/authStore';
import ErrorState from '../../components/shared/ErrorState';

import type { CV } from '../../types/cv';

// ============================================================
// TEMPLATE NAMES
// ============================================================

const TEMPLATE_NAMES: Record<string, string> = {
  classic: 'Classic',
  modern: 'Modern',
  classic_professional: 'Classic Professional',
  modern_dark: 'Modern Dark',
  minimalist_clean: 'Minimalist Clean',
  executive: 'Executive',
  creative: 'Creative',
  two_column: 'Two Column',
  tech: 'Tech',
  corporate: 'Corporate',
  elegant: 'Elegant',
  student: 'Student',
};

// ============================================================
// TEMPLATE COLORS
// ============================================================

const TEMPLATE_COLORS: Record<string, string> = {
  classic: '#334155',
  modern: '#2563EB',
  classic_professional: '#1D4ED8',
  modern_dark: '#B88918',
  minimalist_clean: '#059669',
  executive: '#172033',
  creative: '#7C3AED',
  two_column: '#37474F',
  tech: '#059669',
  corporate: '#0F766E',
  elegant: '#A67C32',
  student: '#2563EB',
};

// ============================================================
// TEMPLATE DESCRIPTIONS
// ============================================================

const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  classic: 'Traditional professional layout',
  modern: 'Bold and contemporary design',
  classic_professional: 'Professional corporate style',
  modern_dark: 'Premium dark design',
  minimalist_clean: 'Clean minimalist layout',
  executive: 'Executive professional design',
  creative: 'Creative and modern layout',
  two_column: 'Professional sidebar design',
  tech: 'Developer and technology focused',
  corporate: 'ATS-friendly corporate design',
  elegant: 'Premium elegant layout',
  student: 'Perfect for students and graduates',
};

// ============================================================
// HELPERS
// ============================================================

function formatTemplateName(templateId: string): string {
  return templateId
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getTemplateName(templateId?: string): string {
  if (!templateId) {
    return 'Classic';
  }

  return TEMPLATE_NAMES[templateId] || formatTemplateName(templateId);
}

function getTemplateColor(templateId?: string): string {
  if (!templateId) {
    return '#2563EB';
  }

  return TEMPLATE_COLORS[templateId] || '#2563EB';
}

function getTemplateDescription(templateId?: string): string {
  if (!templateId) {
    return 'Traditional professional layout';
  }

  return (
    TEMPLATE_DESCRIPTIONS[templateId] ||
    'Professional CV template'
  );
}

// ============================================================
// COMPONENT
// ============================================================

export default function MyCVsScreen({ navigation }: any) {
  const session = useAuthStore((s) => s.session);

  const [cvs, setCvs] = useState<CV[]>([]);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id;

  // ============================================================
  // LOAD CVS
  // ============================================================

  const load = useCallback(async () => {
    if (!userId) {
      setCvs([]);
      setLoading(false);
      return;
    }

    try {
      setError(false);
      setLoading(true);

      const result = await listUserCVs(userId);

      setCvs(result || []);
    } catch (err) {
      console.log('Failed to load CVs:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      setRefreshing(true);
      setError(false);

      const result = await listUserCVs(userId);

      setCvs(result || []);
    } catch (err) {
      console.log('Failed to refresh CVs:', err);
      setError(true);
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

  // ============================================================
  // REFRESH WHEN SCREEN OPENS
  // ============================================================

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // ============================================================
  // CREATE CV
  // ============================================================

  const handleCreateCV = useCallback(() => {
    navigation.navigate('CVTemplatePicker');
  }, [navigation]);

  // ============================================================
  // OPEN CV
  // ============================================================

  const handleOpenCV = useCallback(
    (cvId: string) => {
      navigation.navigate('CVPreview', {
        cvId,
      });
    },
    [navigation],
  );

  // ============================================================
  // STATISTICS
  // ============================================================

  const exportedCount = cvs.filter((cv) => Boolean(cv.pdf_url)).length;
  const draftCount = cvs.length - exportedCount;

  // ============================================================
  // CV CARD
  // ============================================================

  const renderCV = useCallback(
    ({ item }: { item: CV }) => {
      const templateId = item.template_id;

      const templateName = getTemplateName(templateId);
      const templateColor = getTemplateColor(templateId);
      const templateDescription =
        getTemplateDescription(templateId);

      const fullName =
        item?.data?.personalInfo?.fullName?.trim() ||
        'Untitled CV';

      const email =
        item?.data?.personalInfo?.email?.trim() || '';

      const isExported = Boolean(item.pdf_url);

      return (
        <TouchableOpacity
          style={styles.cvCard}
          activeOpacity={0.92}
          onPress={() => handleOpenCV(item.id)}
        >
          {/* Accent */}
          <View
            style={[
              styles.templateStrip,
              { backgroundColor: templateColor },
            ]}
          />

          <View style={styles.cardContent}>
            {/* ==================================================
                CARD HEADER
            ================================================== */}

            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.templateIcon,
                  {
                    backgroundColor: `${templateColor}12`,
                    borderColor: `${templateColor}22`,
                  },
                ]}
              >
                <View
                  style={[
                    styles.templateIconDocument,
                    {
                      borderColor: templateColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.templateIconText,
                      { color: templateColor },
                    ]}
                  >
                    CV
                  </Text>
                </View>
              </View>

              <View style={styles.cardTitleContainer}>
                <Text
                  style={styles.cardTitle}
                  numberOfLines={1}
                >
                  {fullName}
                </Text>

                <View style={styles.templateRow}>
                  <View
                    style={[
                      styles.templateDot,
                      {
                        backgroundColor: templateColor,
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.templateName,
                      {
                        color: templateColor,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {templateName}
                  </Text>
                </View>
              </View>

              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>›</Text>
              </View>
            </View>

            {/* ==================================================
                EMAIL
            ================================================== */}

            {email ? (
              <View style={styles.emailRow}>
                <Text style={styles.emailIcon}>✉</Text>

                <Text
                  style={styles.emailText}
                  numberOfLines={1}
                >
                  {email}
                </Text>
              </View>
            ) : null}

            {/* ==================================================
                DESCRIPTION
            ================================================== */}

            <Text
              style={styles.description}
              numberOfLines={2}
            >
              {templateDescription}
            </Text>

            {/* ==================================================
                BOTTOM
            ================================================== */}

            <View style={styles.cardBottomRow}>
              <View
                style={[
                  styles.statusBadge,
                  isExported
                    ? styles.exportedBadge
                    : styles.draftBadge,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    isExported
                      ? styles.exportedDot
                      : styles.draftDot,
                  ]}
                />

                <Text
                  style={[
                    styles.statusText,
                    isExported
                      ? styles.exportedText
                      : styles.draftText,
                  ]}
                >
                  {isExported ? 'PDF Ready' : 'Draft'}
                </Text>
              </View>

              <View style={styles.openContainer}>
                <Text style={styles.openText}>
                  View CV
                </Text>

                <Text style={styles.openArrow}>
                  →
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [handleOpenCV],
  );

  // ============================================================
  // EMPTY STATE
  // ============================================================

  const renderEmptyState = useCallback(() => {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconOuter}>
          <View style={styles.emptyDocument}>
            <View style={styles.documentFold} />

            <Text style={styles.emptyDocumentText}>
              CV
            </Text>

            <View style={styles.documentLine} />
            <View style={styles.documentLineShort} />
          </View>
        </View>

        <Text style={styles.emptyTitle}>
          Build your professional CV
        </Text>

        <Text style={styles.emptyDescription}>
          Create a polished resume using our professional
          templates and showcase your skills, experience,
          and education.
        </Text>

        <TouchableOpacity
          style={styles.emptyButton}
          activeOpacity={0.88}
          onPress={handleCreateCV}
        >
          <View style={styles.emptyButtonIcon}>
            <Text style={styles.emptyButtonPlus}>
              +
            </Text>
          </View>

          <Text style={styles.emptyButtonText}>
            Create Your First CV
          </Text>

          <Text style={styles.emptyButtonArrow}>
            →
          </Text>
        </TouchableOpacity>

        <Text style={styles.emptyHint}>
          Choose a template • Add your details • Export PDF
        </Text>
      </View>
    );
  }, [handleCreateCV]);

  // ============================================================
  // LIST HEADER
  // ============================================================

  const renderListHeader = useCallback(() => {
    return (
      <>
        {/* ====================================================
            PROFESSIONAL LOGO HEADER
        ==================================================== */}

        <View style={styles.logoHeader}>
          <View style={styles.logoHeaderGlow} />

          <View style={styles.logoContainer}>
            <Image
              source={LOGO}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="NokriHub Logo"
            />
          </View>

          <View style={styles.logoHeaderBottom}>
            <View style={styles.logoHeaderDot} />

            <Text style={styles.logoHeaderText}>
              PROFESSIONAL CV BUILDER
            </Text>

            <View style={styles.logoHeaderDot} />
          </View>
        </View>

        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>
                CV
              </Text>
            </View>

            <View style={styles.headerTitleContainer}>
              <Text style={styles.title}>
                My CVs
              </Text>

              <Text style={styles.subtitle}>
                Manage your professional resumes
              </Text>
            </View>
          </View>

          {/* ==================================================
              STATS
          ================================================== */}

          {cvs.length > 0 ? (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {cvs.length}
                </Text>

                <Text style={styles.statLabel}>
                  Total CVs
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statCard}>
                <Text
                  style={[
                    styles.statNumber,
                    styles.exportedStatNumber,
                  ]}
                >
                  {exportedCount}
                </Text>

                <Text style={styles.statLabel}>
                  Exported
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statCard}>
                <Text
                  style={[
                    styles.statNumber,
                    styles.draftStatNumber,
                  ]}
                >
                  {draftCount}
                </Text>

                <Text style={styles.statLabel}>
                  Drafts
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* ====================================================
            CREATE BUTTON
        ==================================================== */}

        <TouchableOpacity
          style={styles.createButton}
          activeOpacity={0.9}
          onPress={handleCreateCV}
        >
          <View style={styles.createIconContainer}>
            <Text style={styles.createIcon}>
              +
            </Text>
          </View>

          <View style={styles.createTextContainer}>
            <Text style={styles.createTitle}>
              Create New CV
            </Text>

            <Text style={styles.createSubtitle}>
              Start with a professional template
            </Text>
          </View>

          <View style={styles.createArrowContainer}>
            <Text style={styles.createArrow}>
              →
            </Text>
          </View>
        </TouchableOpacity>

        {/* ====================================================
            SECTION HEADER
        ==================================================== */}

        {cvs.length > 0 ? (
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Your Resumes
              </Text>

              <Text style={styles.sectionSubtitle}>
                Tap any CV to preview or export
              </Text>
            </View>

            <View style={styles.sectionCountBadge}>
              <Text style={styles.sectionCount}>
                {cvs.length}{' '}
                {cvs.length === 1 ? 'CV' : 'CVs'}
              </Text>
            </View>
          </View>
        ) : null}
      </>
    );
  }, [
    cvs.length,
    exportedCount,
    draftCount,
    handleCreateCV,
  ]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading && cvs.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
        />

        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingLogoContainer}>
              <Image
                source={LOGO}
                style={styles.loadingLogo}
                resizeMode="contain"
                accessibilityLabel="NokriHub Logo"
              />
            </View>

            <ActivityIndicator
              size="small"
              color="#2563EB"
              style={styles.loadingSpinner}
            />

            <Text style={styles.loadingTitle}>
              Loading your CVs
            </Text>

            <Text style={styles.loadingText}>
              Preparing your professional resumes...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error && cvs.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
        />

        <View style={styles.errorContainer}>
          <ErrorState
            message="Couldn't load your CVs."
            onRetry={load}
          />
        </View>

        <ProjectFooter />
      </SafeAreaView>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
      />

      <View style={styles.container}>
        <FlatList
          data={cvs}
          keyExtractor={(item) => item.id}
          renderItem={renderCV}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.listContent,
            cvs.length === 0 &&
              styles.emptyListContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#2563EB"
              colors={['#2563EB']}
            />
          }
        />

        {/* ====================================================
            FLOATING CREATE BUTTON
        ==================================================== */}

        {cvs.length > 0 ? (
          <TouchableOpacity
            style={styles.floatingButton}
            activeOpacity={0.9}
            onPress={handleCreateCV}
          >
            <Text style={styles.floatingPlus}>
              +
            </Text>

            <Text style={styles.floatingLabel}>
              New
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ProjectFooter />
    </SafeAreaView>
  );
}

// ============================================================
// PROJECT FOOTER
// ============================================================

function ProjectFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerLine} />

      <Text style={styles.footerText}>
        Project By{' '}
        <Text style={styles.footerName}>
          SYED MESAM ABBAS & ABDUL MANNAN RANA
        </Text>
      </Text>

      <Text style={styles.footerSubtext}>
        NokriHub • Professional CV Builder
      </Text>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  // ==========================================================
  // SCREEN
  // ==========================================================

  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 18,
  },

  // ==========================================================
  // PROFESSIONAL LOGO HEADER
  // ==========================================================

  logoHeader: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFFFFF',

    borderRadius: 20,

    marginTop: 10,
    marginBottom: 4,

    paddingTop: 14,
    paddingBottom: 12,

    borderWidth: 1,
    borderColor: '#E2E8F0',

    overflow: 'hidden',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.055,
    shadowRadius: 10,
    elevation: 3,
  },

  logoHeaderGlow: {
    position: 'absolute',
    top: -48,
    width: 170,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EFF6FF',
    opacity: 0.9,
  },

  logoContainer: {
    width: 190,
    height: 54,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFFFFF',

    borderRadius: 14,

    paddingHorizontal: 18,
    paddingVertical: 7,

    borderWidth: 1,
    borderColor: '#F1F5F9',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.045,
    shadowRadius: 6,
    elevation: 2,
  },

  logo: {
    width: 165,
    height: 42,
  },

  logoHeaderBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 9,
  },

  logoHeaderDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2563EB',
    marginHorizontal: 7,
  },

  logoHeaderText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.6,
    color: '#64748B',
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  loadingCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  loadingLogoContainer: {
    width: 190,
    height: 62,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },

  loadingLogo: {
    width: 165,
    height: 44,
  },

  loadingSpinner: {
    marginTop: 20,
    marginBottom: 12,
  },

  loadingTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },

  loadingText: {
    marginTop: 6,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    paddingTop: 14,
    paddingBottom: 16,
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: '#2563EB',
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

  headerIconText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 14,
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748B',
  },

  // ==========================================================
  // STATS
  // ==========================================================

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 16,
    paddingVertical: 12,
  },

  statCard: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2563EB',
  },

  exportedStatNumber: {
    color: '#059669',
  },

  draftStatNumber: {
    color: '#D97706',
  },

  statLabel: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  statDivider: {
    width: 1,
    height: 27,
    backgroundColor: '#E2E8F0',
  },

  // ==========================================================
  // CREATE BUTTON
  // ==========================================================

  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 20,

    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },

  createIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  createIcon: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '300',
    lineHeight: 32,
  },

  createTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  createTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  createSubtitle: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 10,
    marginTop: 4,
  },

  createArrowContainer: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  createArrow: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '600',
  },

  // ==========================================================
  // SECTION
  // ==========================================================

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: '#94A3B8',
  },

  sectionCountBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  sectionCount: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },

  // ==========================================================
  // LIST
  // ==========================================================

  listContent: {
    paddingBottom: 100,
  },

  emptyListContent: {
    flexGrow: 1,
    paddingBottom: 25,
  },

  // ==========================================================
  // CV CARD
  // ==========================================================

  cvCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 13,
    overflow: 'hidden',

    borderWidth: 1,
    borderColor: '#E2E8F0',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.055,
    shadowRadius: 10,
    elevation: 3,
  },

  templateStrip: {
    height: 4,
  },

  cardContent: {
    padding: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  templateIcon: {
    width: 51,
    height: 51,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  templateIconDocument: {
    width: 31,
    height: 36,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  templateIconText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  cardTitleContainer: {
    flex: 1,
    marginLeft: 13,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },

  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  templateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  templateName: {
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
  },

  arrowContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  arrow: {
    fontSize: 23,
    color: '#64748B',
    fontWeight: '400',
  },

  // ==========================================================
  // EMAIL
  // ==========================================================

  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  emailIcon: {
    fontSize: 11,
    color: '#94A3B8',
    marginRight: 6,
  },

  emailText: {
    flex: 1,
    fontSize: 10,
    color: '#64748B',
  },

  // ==========================================================
  // DESCRIPTION
  // ==========================================================

  description: {
    fontSize: 11,
    lineHeight: 17,
    color: '#64748B',
    marginTop: 11,
    marginBottom: 14,
  },

  // ==========================================================
  // CARD BOTTOM
  // ==========================================================

  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },

  // ==========================================================
  // STATUS
  // ==========================================================

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  exportedBadge: {
    backgroundColor: '#ECFDF5',
  },

  draftBadge: {
    backgroundColor: '#FFF7ED',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  exportedDot: {
    backgroundColor: '#10B981',
  },

  draftDot: {
    backgroundColor: '#F59E0B',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  exportedText: {
    color: '#047857',
  },

  draftText: {
    color: '#B45309',
  },

  openContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  openText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },

  openArrow: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
    marginLeft: 5,
  },

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 35,
  },

  emptyIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  emptyDocument: {
    width: 55,
    height: 67,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  documentFold: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    backgroundColor: '#93C5FD',
    borderBottomLeftRadius: 6,
  },

  emptyDocumentText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },

  documentLine: {
    width: 27,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },

  documentLineShort: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginTop: 4,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },

  emptyDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: 22,
  },

  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingLeft: 7,
    paddingRight: 15,
    paddingVertical: 7,

    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 9,
    elevation: 4,
  },

  emptyButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  emptyButtonPlus: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '300',
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  emptyButtonArrow: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },

  emptyHint: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 13,
    textAlign: 'center',
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  // ==========================================================
  // FLOATING BUTTON
  // ==========================================================

  floatingButton: {
    position: 'absolute',
    right: 18,
    bottom: 20,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.28,
    shadowRadius: 11,
    elevation: 8,
  },

  floatingPlus: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '300',
    lineHeight: 26,
  },

  floatingLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 8,
    fontWeight: '800',
    marginTop: 1,
  },

  // ==========================================================
  // FOOTER
  // ==========================================================

  footer: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingTop: 4,
    paddingBottom: 10,
  },

  footerLine: {
    width: 42,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 7,
  },

  footerText: {
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
  },

  footerName: {
    color: '#64748B',
    fontWeight: '800',
  },

  footerSubtext: {
    fontSize: 8,
    color: '#CBD5E1',
    marginTop: 2,
    textAlign: 'center',
  },
});

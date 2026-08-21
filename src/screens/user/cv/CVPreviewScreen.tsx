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
import { updateCV, uploadCVPdf } from '../../services/cv.service';
import { generateCVPdf } from '../../services/pdf.service';
import ErrorState from '../../components/shared/ErrorState';
import type { CV } from '../../types/cv';

export default function CVPreviewScreen({
  route,
  navigation,
}: any) {
  const { cvId } = route.params ?? {};

  const [cv, setCv] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(false);

  // ============================================================
  // LOAD CV
  // ============================================================

  const loadCv = useCallback(
    async (isRefresh = false) => {
      if (!cvId) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(false);

        const { data, error: err } = await supabase
          .from('cvs')
          .select('*')
          .eq('id', cvId)
          .single();

        if (err) {
          console.error('Failed to load CV:', err);
          setCv(null);
          setError(true);
          return;
        }

        if (!data) {
          setCv(null);
          setError(true);
          return;
        }

        setCv(data as CV);
      } catch (err) {
        console.error('CV Preview Error:', err);
        setCv(null);
        setError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [cvId],
  );

  useEffect(() => {
    loadCv();
  }, [loadCv]);

  // ============================================================
  // EXPORT CV
  // ============================================================

  const handleExport = async () => {
    if (!cv || exporting) {
      return;
    }

    setExporting(true);

    try {
      const localPath = await generateCVPdf(
        cv.data,
        `cv_${cv.id}`,
        cv.template_id,
      );

      const publicUrl = await uploadCVPdf(
        cv.user_id,
        cv.id,
        localPath,
      );

      await updateCV(cv.id, {
        pdf_url: publicUrl,
      });

      Alert.alert(
        'CV Exported Successfully',
        'Your CV has been exported as a PDF and saved successfully.',
        [
          {
            text: 'View My CVs',
            onPress: () => navigation.navigate('MyCVsList'),
          },
        ],
      );
    } catch (err: any) {
      console.error('CV Export Error:', err);

      Alert.alert(
        'Export Failed',
        err?.message ||
          'Something went wrong while exporting your CV. Please try again.',
      );
    } finally {
      setExporting(false);
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingCard}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator
              size="large"
              color="#2563EB"
            />
          </View>

          <Text style={styles.loadingTitle}>
            Preparing Your CV
          </Text>

          <Text style={styles.loadingText}>
            Loading your professional CV preview...
          </Text>
        </View>
      </View>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error || !cv) {
    return (
      <View style={styles.center}>
        <View style={styles.errorWrapper}>
          <ErrorState
            message="Couldn't load this CV."
            onRetry={() => loadCv()}
          />
        </View>
      </View>
    );
  }

  // ============================================================
  // SAFE DATA
  // ============================================================

  const personalInfo = cv.data?.personalInfo ?? {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
  };

  const experience = Array.isArray(cv.data?.experience)
    ? cv.data.experience
    : [];

  const education = Array.isArray(cv.data?.education)
    ? cv.data.education
    : [];

  const skills = Array.isArray(cv.data?.skills)
    ? cv.data.skills.filter(Boolean)
    : [];

  const fullName =
    personalInfo.fullName?.trim() || 'Untitled CV';

  const email =
    personalInfo.email?.trim() || '';

  const phone =
    personalInfo.phone?.trim() || '';

  const location =
    personalInfo.location?.trim() || '';

  const summary =
    personalInfo.summary?.trim() || '';

  const isModern = cv.template_id === 'modern';

  const accentColor = isModern
    ? '#2563EB'
    : '#111827';

  const initials = getInitials(fullName);

  // ============================================================
  // CONTACT DETAILS
  // ============================================================

  const contactItems = [
    email,
    phone,
    location,
  ].filter(Boolean);

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <View style={styles.screen}>
      {/* ======================================================
          NOKRIHUB LOGO HEADER
      ====================================================== */}

      <View style={styles.logoHeader}>
        <View style={styles.logoContainer}>
          <Image
            source={LOGO}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadCv(true)}
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
      >
        {/* ====================================================
            TOP BAR
        ==================================================== */}

        <View style={styles.topBar}>
          <View style={styles.topBarContent}>
            <Text style={styles.topBarTitle}>
              CV Preview
            </Text>

            <Text style={styles.topBarSubtitle}>
              Review your resume before exporting
            </Text>
          </View>

          <View
            style={[
              styles.templateBadge,
              {
                backgroundColor: isModern
                  ? '#EFF6FF'
                  : '#F1F5F9',
              },
            ]}
          >
            <Text
              style={[
                styles.templateBadgeText,
                {
                  color: accentColor,
                },
              ]}
            >
              {isModern ? 'MODERN' : 'CLASSIC'}
            </Text>
          </View>
        </View>

        {/* ====================================================
            CV PAPER
        ==================================================== */}

        <View style={styles.cvPaper}>
          {/* ==================================================
              HEADER
          ================================================== */}

          {isModern ? (
            <View style={styles.modernHeader}>
              <View style={styles.modernAvatar}>
                <Text style={styles.modernAvatarText}>
                  {initials}
                </Text>
              </View>

              <View style={styles.modernHeaderContent}>
                <Text
                  style={styles.modernName}
                  numberOfLines={3}
                >
                  {fullName}
                </Text>

                <Text style={styles.modernRole}>
                  PROFESSIONAL PROFILE
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.classicHeader}>
              <View style={styles.classicAvatar}>
                <Text style={styles.classicAvatarText}>
                  {initials}
                </Text>
              </View>

              <Text
                style={styles.classicName}
                numberOfLines={3}
              >
                {fullName}
              </Text>

              <Text style={styles.classicRole}>
                PROFESSIONAL PROFILE
              </Text>
            </View>
          )}

          {/* ==================================================
              CONTACT INFORMATION
          ================================================== */}

          {contactItems.length > 0 ? (
            <View
              style={[
                styles.contactContainer,
                isModern
                  ? styles.modernContactContainer
                  : styles.classicContactContainer,
              ]}
            >
              {email ? (
                <ContactItem
                  icon="✉"
                  text={email}
                  modern={isModern}
                />
              ) : null}

              {phone ? (
                <ContactItem
                  icon="☎"
                  text={phone}
                  modern={isModern}
                />
              ) : null}

              {location ? (
                <ContactItem
                  icon="⌖"
                  text={location}
                  modern={isModern}
                />
              ) : null}
            </View>
          ) : null}

          {/* ==================================================
              SUMMARY
          ================================================== */}

          {summary ? (
            <CVSection
              title="Professional Summary"
              modern={isModern}
              accentColor={accentColor}
            >
              <Text style={styles.summaryText}>
                {summary}
              </Text>
            </CVSection>
          ) : null}

          {/* ==================================================
              EXPERIENCE
          ================================================== */}

          <CVSection
            title="Experience"
            modern={isModern}
            accentColor={accentColor}
            count={experience.length}
          >
            {experience.length === 0 ? (
              <EmptyCVSection text="No work experience added." />
            ) : (
              experience.map((item, index) => (
                <View
                  key={
                    item?.id ||
                    `experience-${index}`
                  }
                  style={[
                    styles.experienceItem,
                    index === experience.length - 1 &&
                      styles.lastExperienceItem,
                  ]}
                >
                  <View style={styles.timelineColumn}>
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor: accentColor,
                        },
                      ]}
                    />

                    {index !==
                    experience.length - 1 ? (
                      <View
                        style={[
                          styles.timelineLine,
                          {
                            backgroundColor: isModern
                              ? '#DBEAFE'
                              : '#E5E7EB',
                          },
                        ]}
                      />
                    ) : null}
                  </View>

                  <View style={styles.experienceContent}>
                    <Text
                      style={[
                        styles.itemTitle,
                        isModern &&
                          styles.modernItemTitle,
                      ]}
                    >
                      {item?.role ||
                        'Position not specified'}
                    </Text>

                    <Text
                      style={[
                        styles.companyText,
                        {
                          color: accentColor,
                        },
                      ]}
                    >
                      {item?.company ||
                        'Company not specified'}
                    </Text>

                    {(item?.startDate ||
                      item?.endDate) ? (
                      <View
                        style={[
                          styles.dateBadge,
                          {
                            backgroundColor: isModern
                              ? '#EFF6FF'
                              : '#F1F5F9',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dateText,
                            {
                              color: accentColor,
                            },
                          ]}
                        >
                          {item?.startDate ||
                            'Start date'}
                          {'  —  '}
                          {item?.endDate ||
                            'Present'}
                        </Text>
                      </View>
                    ) : null}

                    {item?.description ? (
                      <Text style={styles.itemDesc}>
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </CVSection>

          {/* ==================================================
              EDUCATION
          ================================================== */}

          <CVSection
            title="Education"
            modern={isModern}
            accentColor={accentColor}
            count={education.length}
          >
            {education.length === 0 ? (
              <EmptyCVSection text="No education details added." />
            ) : (
              education.map((item, index) => (
                <View
                  key={
                    item?.id ||
                    `education-${index}`
                  }
                  style={[
                    styles.educationItem,
                    index === education.length - 1 &&
                      styles.lastEducationItem,
                  ]}
                >
                  <View
                    style={[
                      styles.educationIcon,
                      {
                        backgroundColor: isModern
                          ? '#EFF6FF'
                          : '#F1F5F9',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.educationIconText,
                        {
                          color: accentColor,
                        },
                      ]}
                    >
                      🎓
                    </Text>
                  </View>

                  <View style={styles.educationContent}>
                    <Text
                      style={[
                        styles.itemTitle,
                        isModern &&
                          styles.modernItemTitle,
                      ]}
                    >
                      {item?.degree ||
                        'Degree not specified'}
                    </Text>

                    <Text
                      style={[
                        styles.schoolText,
                        {
                          color: accentColor,
                        },
                      ]}
                    >
                      {item?.school ||
                        'Institution not specified'}
                    </Text>

                    {(item?.startDate ||
                      item?.endDate) ? (
                      <Text style={styles.itemSub}>
                        {item?.startDate ||
                          'Start date'}
                        {'  —  '}
                        {item?.endDate ||
                          'Present'}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </CVSection>

          {/* ==================================================
              SKILLS
          ================================================== */}

          <CVSection
            title="Skills"
            modern={isModern}
            accentColor={accentColor}
            count={skills.length}
          >
            {skills.length === 0 ? (
              <EmptyCVSection text="No skills added." />
            ) : (
              <View style={styles.skillContainer}>
                {skills.map((skill, index) => (
                  <View
                    key={`${skill}-${index}`}
                    style={[
                      styles.skillChip,
                      {
                        backgroundColor: isModern
                          ? '#EFF6FF'
                          : '#F8FAFC',
                        borderColor: isModern
                          ? '#BFDBFE'
                          : '#E2E8F0',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.skillDot,
                        {
                          backgroundColor:
                            accentColor,
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.skillText,
                        {
                          color: accentColor,
                        },
                      ]}
                    >
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </CVSection>

          {/* ==================================================
              CV FOOTER
          ================================================== */}

          <View
            style={[
              styles.cvFooter,
              {
                borderTopColor: isModern
                  ? '#DBEAFE'
                  : '#E5E7EB',
              },
            ]}
          >
            <Text style={styles.cvFooterText}>
              Professional CV • Created with NokriHub
            </Text>
          </View>
        </View>

        {/* ====================================================
            EXPORT CARD
        ==================================================== */}

        <View style={styles.exportCard}>
          <View style={styles.exportIcon}>
            <Text style={styles.exportIconText}>
              PDF
            </Text>
          </View>

          <View style={styles.exportContent}>
            <Text style={styles.exportTitle}>
              Ready to export?
            </Text>

            <Text style={styles.exportSubtitle}>
              Save your completed CV as a professional PDF.
            </Text>
          </View>
        </View>

        {/* ====================================================
            EXPORT BUTTON
        ==================================================== */}

        <TouchableOpacity
          style={[
            styles.exportButton,
            {
              opacity: exporting ? 0.75 : 1,
            },
          ]}
          activeOpacity={0.85}
          onPress={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text style={styles.exportButtonText}>
                Exporting CV...
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.exportButtonIcon}>
                ↓
              </Text>

              <Text style={styles.exportButtonText}>
                Export as PDF & Save
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.reviewHint}>
          Review your information carefully before exporting.
        </Text>

        {/* ====================================================
            PROJECT FOOTER
        ==================================================== */}

        <View style={styles.projectFooter}>
          <View style={styles.projectDivider} />

          <Text style={styles.projectFooterText}>
            Project By
          </Text>

          <Text style={styles.projectFooterName}>
            SYED MESAM ABBAS & ABDUL MANNAN RANA
          </Text>

          <Text style={styles.projectFooterSubtext}>
            NokriHub • Professional Job & CV Platform
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

// ============================================================
// CONTACT ITEM
// ============================================================

function ContactItem({
  icon,
  text,
  modern,
}: {
  icon: string;
  text: string;
  modern: boolean;
}) {
  return (
    <View style={styles.contactItem}>
      <Text
        style={[
          styles.contactIcon,
          {
            color: modern
              ? '#2563EB'
              : '#475569',
          },
        ]}
      >
        {icon}
      </Text>

      <Text
        style={styles.contactText}
        numberOfLines={2}
      >
        {text}
      </Text>
    </View>
  );
}

// ============================================================
// CV SECTION
// ============================================================

function CVSection({
  title,
  count,
  modern,
  accentColor,
  children,
}: {
  title: string;
  count?: number;
  modern: boolean;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <View
            style={[
              styles.sectionAccent,
              {
                backgroundColor: accentColor,
              },
            ]}
          />

          <Text
            style={[
              styles.sectionTitle,
              modern &&
                styles.modernSectionTitle,
            ]}
          >
            {title}
          </Text>
        </View>

        {typeof count === 'number' ? (
          <View
            style={[
              styles.countBadge,
              {
                backgroundColor: modern
                  ? '#EFF6FF'
                  : '#F1F5F9',
              },
            ]}
          >
            <Text
              style={[
                styles.countText,
                {
                  color: accentColor,
                },
              ]}
            >
              {count}
            </Text>
          </View>
        ) : null}
      </View>

      {children}
    </View>
  );
}

// ============================================================
// EMPTY SECTION
// ============================================================

function EmptyCVSection({
  text,
}: {
  text: string;
}) {
  return (
    <View style={styles.emptySection}>
      <Text style={styles.emptyIcon}>+</Text>

      <Text style={styles.emptyText}>
        {text}
      </Text>
    </View>
  );
}

// ============================================================
// GET INITIALS
// ============================================================

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

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  // ==========================================================
  // SCREEN
  // ==========================================================

  screen: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 20,
  },

  errorWrapper: {
    width: '100%',
    maxWidth: 380,
  },

  // ==========================================================
  // LOGO HEADER
  // ==========================================================

  logoHeader: {
    width: '100%',
    height: 78,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },

  logoContainer: {
    width: 180,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 155,
    height: 55,
  },

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#E2E8F0',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  loadingIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  loadingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },

  loadingText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
  },

  // ==========================================================
  // TOP BAR
  // ==========================================================

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 2,
  },

  topBarContent: {
    flex: 1,
    paddingRight: 10,
  },

  topBarTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },

  topBarSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },

  templateBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
  },

  templateBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
  },

  // ==========================================================
  // CV PAPER
  // ==========================================================

  cvPaper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',

    borderWidth: 1,
    borderColor: '#E2E8F0',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },

  // ==========================================================
  // MODERN HEADER
  // ==========================================================

  modernHeader: {
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },

  modernAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },

  modernAvatarText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },

  modernHeaderContent: {
    flex: 1,
  },

  modernName: {
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },

  modernRole: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#DBEAFE',
    marginTop: 7,
  },

  // ==========================================================
  // CLASSIC HEADER
  // ==========================================================

  classicHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#111827',
  },

  classicAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },

  classicAvatarText: {
    color: '#334155',
    fontSize: 20,
    fontWeight: '800',
  },

  classicName: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  classicRole: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#64748B',
    marginTop: 6,
  },

  // ==========================================================
  // CONTACT
  // ==========================================================

  contactContainer: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  modernContactContainer: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  classicContactContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginVertical: 3,
    maxWidth: '100%',
  },

  contactIcon: {
    fontSize: 13,
    fontWeight: '800',
    marginRight: 5,
  },

  contactText: {
    fontSize: 11,
    color: '#475569',
    flexShrink: 1,
  },

  // ==========================================================
  // SECTIONS
  // ==========================================================

  section: {
    paddingHorizontal: 18,
    marginTop: 20,
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
    flex: 1,
  },

  sectionAccent: {
    width: 4,
    height: 19,
    borderRadius: 3,
    marginRight: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  modernSectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 13,
  },

  countBadge: {
    minWidth: 25,
    height: 25,
    paddingHorizontal: 7,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    fontSize: 10,
    fontWeight: '800',
  },

  // ==========================================================
  // SUMMARY
  // ==========================================================

  summaryText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
  },

  // ==========================================================
  // EXPERIENCE
  // ==========================================================

  experienceItem: {
    flexDirection: 'row',
    minHeight: 86,
  },

  lastExperienceItem: {
    minHeight: 65,
  },

  timelineColumn: {
    width: 22,
    alignItems: 'center',
    marginRight: 9,
  },

  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },

  experienceContent: {
    flex: 1,
    paddingBottom: 17,
  },

  itemTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    color: '#1E293B',
  },

  modernItemTitle: {
    color: '#1D4ED8',
  },

  companyText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
    marginBottom: 6,
  },

  dateBadge: {
    alignSelf: 'flex-start',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 7,
  },

  dateText: {
    fontSize: 10,
    fontWeight: '700',
  },

  itemSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },

  itemDesc: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  // ==========================================================
  // EDUCATION
  // ==========================================================

  educationItem: {
    flexDirection: 'row',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  lastEducationItem: {
    borderBottomWidth: 0,
    paddingBottom: 0,
    marginBottom: 0,
  },

  educationIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  educationIconText: {
    fontSize: 17,
  },

  educationContent: {
    flex: 1,
  },

  schoolText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },

  // ==========================================================
  // SKILLS
  // ==========================================================

  skillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  skillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  skillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptySection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },

  emptyIcon: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 25,
    fontSize: 16,
    color: '#64748B',
    marginRight: 8,
  },

  emptyText: {
    color: '#94A3B8',
    fontSize: 11,
  },

  // ==========================================================
  // CV FOOTER
  // ==========================================================

  cvFooter: {
    marginTop: 24,
    marginHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 17,
    borderTopWidth: 1,
    alignItems: 'center',
  },

  cvFooterText: {
    fontSize: 9,
    color: '#94A3B8',
    letterSpacing: 0.3,
  },

  // ==========================================================
  // EXPORT CARD
  // ==========================================================

  exportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginTop: 16,

    borderWidth: 1,
    borderColor: '#E2E8F0',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  exportIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  exportIconText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#2563EB',
  },

  exportContent: {
    flex: 1,
  },

  exportTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },

  exportSubtitle: {
    fontSize: 11,
    lineHeight: 17,
    color: '#64748B',
    marginTop: 3,
  },

  // ==========================================================
  // EXPORT BUTTON
  // ==========================================================

  exportButton: {
    minHeight: 56,
    borderRadius: 15,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,

    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },

  exportButtonIcon: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
    marginRight: 9,
  },

  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  reviewHint: {
    textAlign: 'center',
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 9,
  },

  // ==========================================================
  // PROJECT FOOTER
  // ==========================================================

  projectFooter: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
  },

  projectDivider: {
    width: 45,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 13,
  },

  projectFooterText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  projectFooterName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginTop: 3,
  },

  projectFooterSubtext: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 4,
  },

  bottomSpacing: {
    height: 15,
  },
});



















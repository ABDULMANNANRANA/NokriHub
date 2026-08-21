import React, { useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  createJob,
  updateJob,
  deleteJob,
  setJobStatus,
} from '../../services/jobs.service';

import { getRecommendationsForJob } from '../../services/recommendations.service';
import { useAuthStore } from '../../store/authStore';
import { emptyJobInput, JobInput } from '../../types/job';
// Import image asset via ESModule import
import LOGO from '../../../../assets/images/Logo.png';

const employmentTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
];

export default function PostJobScreen({ route, navigation }: any) {
  const session = useAuthStore((s) => s.session);

  const existingJob = route.params?.job;
  const isEditing = !!existingJob;

  const [job, setJob] = useState<JobInput>(
    isEditing
      ? {
          title: existingJob.title ?? '',
          description: existingJob.description ?? '',
          skills: Array.isArray(existingJob.skills)
            ? existingJob.skills
            : [],
          location: existingJob.location ?? '',
          employment_type: existingJob.employment_type ?? '',
          salary_band: existingJob.salary_band ?? '',
        }
      : {
          ...emptyJobInput,
          skills: [...(emptyJobInput.skills ?? [])],
        },
  );

  const [status, setStatus] = useState<'open' | 'closed'>(
    existingJob?.status === 'closed' ? 'closed' : 'open',
  );

  const [saving, setSaving] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const updateField = (field: keyof JobInput, value: string) => {
    setJob((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!session?.user?.id) {
      Alert.alert(
        'Authentication Required',
        'Please sign in again before posting a job.',
      );
      return;
    }

    const title = job.title?.trim() ?? '';
    const description = job.description?.trim() ?? '';
    const location = job.location?.trim() ?? '';
    const salaryBand = job.salary_band?.trim() ?? '';

    if (!title) {
      Alert.alert(
        'Job Title Required',
        'Please enter a title for the job.',
      );
      return;
    }

    if (title.length < 3) {
      Alert.alert(
        'Invalid Job Title',
        'The job title should contain at least 3 characters.',
      );
      return;
    }

    if (!description) {
      Alert.alert(
        'Description Required',
        'Please provide a description for this job.',
      );
      return;
    }

    if (description.length < 20) {
      Alert.alert(
        'Description Too Short',
        'Please provide a more detailed job description.',
      );
      return;
    }

    if (!job.employment_type) {
      Alert.alert(
        'Employment Type Required',
        'Please select an employment type.',
      );
      return;
    }

    setSaving(true);

    try {
      const cleanedJob: JobInput = {
        ...job,
        title,
        description,
        location,
        salary_band: salaryBand,
        skills: (job.skills ?? [])
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      if (isEditing) {
        await updateJob(existingJob.id, cleanedJob);

        Alert.alert(
          'Job Updated',
          'Your job posting has been updated successfully.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('JobList'),
            },
          ],
        );
      } else {
        await createJob(session.user.id, cleanedJob);

        Alert.alert(
          'Job Posted Successfully',
          'Your job posting is now live and candidates can discover it.',
          [
            {
              text: 'OK',
              onPress: () => {
                setJob({
                  ...emptyJobInput,
                  skills: [...(emptyJobInput.skills ?? [])],
                });

                navigation.navigate('JobList');
              },
            },
          ],
        );
      }
    } catch (err: any) {
      console.log('Job save error:', err);

      Alert.alert(
        'Unable to Save',
        err?.message ??
          'Something went wrong while saving the job.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!existingJob?.id || changingStatus) {
      return;
    }

    const newStatus: 'open' | 'closed' =
      status === 'open' ? 'closed' : 'open';

    Alert.alert(
      newStatus === 'closed' ? 'Close Job?' : 'Reopen Job?',
      newStatus === 'closed'
        ? 'Candidates will no longer see this job as an active opportunity.'
        : 'This job will become available to candidates again.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: newStatus === 'closed' ? 'Close Job' : 'Reopen',
          onPress: async () => {
            setChangingStatus(true);

            try {
              await setJobStatus(existingJob.id, newStatus);
              setStatus(newStatus);

              Alert.alert(
                'Success',
                newStatus === 'closed'
                  ? 'The job has been closed successfully.'
                  : 'The job has been reopened successfully.',
              );
            } catch (err: any) {
              console.log('Status update error:', err);

              Alert.alert(
                'Unable to Update Status',
                err?.message ??
                  'Could not update the job status.',
              );
            } finally {
              setChangingStatus(false);
            }
          },
        },
      ],
    );
  };

  const handleDelete = async () => {
    if (!existingJob?.id || deleting) {
      return;
    }

    setDeleting(true);

    try {
      const recs = await getRecommendationsForJob(
        existingJob.id,
      );

      const recommendationCount = recs?.length ?? 0;

      setDeleting(false);

      if (recommendationCount > 0) {
        Alert.alert(
          'Job Cannot Be Deleted',
          `${recommendationCount} ${
            recommendationCount === 1
              ? 'recommendation is'
              : 'recommendations are'
          } linked to this job. To preserve recommendation history, close the job instead of deleting it.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Close Job Instead',
              onPress: async () => {
                try {
                  setChangingStatus(true);

                  await setJobStatus(
                    existingJob.id,
                    'closed',
                  );

                  setStatus('closed');

                  Alert.alert(
                    'Job Closed',
                    'The job has been closed successfully.',
                    [
                      {
                        text: 'OK',
                        onPress: () =>
                          navigation.navigate('JobList'),
                      },
                    ],
                  );
                } catch (err: any) {
                  console.log('Close job error:', err);

                  Alert.alert(
                    'Unable to Close Job',
                    err?.message ??
                      'Could not close this job.',
                  );
                } finally {
                  setChangingStatus(false);
                }
              },
            },
          ],
        );

        return;
      }

      Alert.alert(
        'Delete Job?',
        'This action cannot be undone. The job posting will be permanently removed.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                setDeleting(true);

                await deleteJob(existingJob.id);

                Alert.alert(
                  'Job Deleted',
                  'The job posting has been permanently removed.',
                  [
                    {
                      text: 'OK',
                      onPress: () =>
                        navigation.navigate('JobList'),
                    },
                  ],
                );
              } catch (err: any) {
                console.log('Delete job error:', err);

                Alert.alert(
                  'Unable to Delete',
                  err?.message ??
                    'Could not delete this job.',
                );
              } finally {
                setDeleting(false);
              }
            },
          },
        ],
      );
    } catch (err: any) {
      setDeleting(false);

      console.log('Recommendation check error:', err);

      Alert.alert(
        'Unable to Check Job',
        err?.message ??
          'Could not check recommendation history.',
      );
    }
  };

  const removeSkill = (index: number) => {
    setJob((previous) => ({
      ...previous,
      skills: (previous.skills ?? []).filter(
        (_, skillIndex) => skillIndex !== index,
      ),
    }));
  };

  const handleSkillsChange = (value: string) => {
    const skills = value
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    setJob((previous) => ({
      ...previous,
      skills,
    }));
  };

  const skillsText = (job.skills ?? []).join(', ');

  const isBusy = saving || changingStatus || deleting;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ============================================================
          PROFESSIONAL NOKRIHUB HEADER
      ============================================================ */}

      <View style={styles.topHeader}>
        <View style={styles.headerSide}>
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.headerButtonPressed,
            ]}
            onPress={() => navigation.goBack()}
            hitSlop={8}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
        </View>

        <View style={styles.logoWrapper}>
          <Image
            source={LOGO}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerSide}>
          <View style={styles.headerBadge}>
            <View style={styles.headerStatusDot} />
            <Text style={styles.headerBadgeText}>
              {isEditing ? 'EDIT' : 'POST'}
            </Text>
          </View>
        </View>
      </View>

      {/* Header bottom accent */}
      <View style={styles.headerAccent}>
        <View style={styles.headerAccentBlue} />
        <View style={styles.headerAccentLight} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroIconText}>💼</Text>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.eyebrow}>
              {isEditing ? 'JOB MANAGEMENT' : 'HIRING'}
            </Text>

            <Text style={styles.pageTitle}>
              {isEditing ? 'Edit Job Posting' : 'Post a New Job'}
            </Text>

            <Text style={styles.pageSubtitle}>
              {isEditing
                ? 'Update your job details and manage its availability.'
                : 'Create a professional job posting and find the right candidate.'}
            </Text>
          </View>
        </View>

        {/* Status */}
        {isEditing && (
          <View style={styles.statusCard}>
            <View style={styles.statusInfo}>
              <View
                style={[
                  styles.statusIcon,
                  status === 'open'
                    ? styles.statusIconOpen
                    : styles.statusIconClosed,
                ]}
              >
                <Text
                  style={[
                    styles.statusIconText,
                    status === 'open'
                      ? styles.statusIconTextOpen
                      : styles.statusIconTextClosed,
                  ]}
                >
                  {status === 'open' ? '✓' : '×'}
                </Text>
              </View>

              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>
                  Job Status
                </Text>

                <Text style={styles.statusDescription}>
                  {status === 'open'
                    ? 'Your job is visible to candidates.'
                    : 'Your job is currently hidden from candidates.'}
                </Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.statusButton,
                status === 'open'
                  ? styles.closeButton
                  : styles.reopenButton,
                pressed && styles.pressed,
              ]}
              disabled={isBusy}
              onPress={handleToggleStatus}
            >
              {changingStatus ? (
                <ActivityIndicator
                  size="small"
                  color={
                    status === 'open'
                      ? '#DC2626'
                      : '#2563EB'
                  }
                />
              ) : (
                <Text
                  style={[
                    styles.statusButtonText,
                    status === 'open'
                      ? styles.closeButtonText
                      : styles.reopenButtonText,
                  ]}
                >
                  {status === 'open' ? 'Close' : 'Reopen'}
                </Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Basic Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Text style={styles.cardHeaderIconText}>📝</Text>
            </View>

            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>
                Basic Information
              </Text>

              <Text style={styles.cardSubtitle}>
                Tell candidates about the opportunity.
              </Text>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Job Title <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Senior React Native Developer"
              placeholderTextColor="#9CA3AF"
              value={job.title}
              onChangeText={(value) =>
                updateField('title', value)
              }
              maxLength={100}
              editable={!isBusy}
            />

            <Text style={styles.characterCount}>
              {(job.title ?? '').length}/100
            </Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Job Description{' '}
              <Text style={styles.required}>*</Text>
            </Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity exciting..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              value={job.description}
              onChangeText={(value) =>
                updateField('description', value)
              }
              maxLength={3000}
              editable={!isBusy}
            />

            <Text style={styles.characterCount}>
              {(job.description ?? '').length}/3000
            </Text>
          </View>
        </View>

        {/* Requirements */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Text style={styles.cardHeaderIconText}>🎯</Text>
            </View>

            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>
                Requirements
              </Text>

              <Text style={styles.cardSubtitle}>
                Help candidates understand what you need.
              </Text>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Required Skills</Text>

            <TextInput
              style={styles.input}
              placeholder="React Native, TypeScript, Supabase"
              placeholderTextColor="#9CA3AF"
              value={skillsText}
              onChangeText={handleSkillsChange}
              editable={!isBusy}
            />

            <Text style={styles.helperText}>
              Separate skills with commas.
            </Text>

            {(job.skills ?? []).length > 0 && (
              <View style={styles.skillsContainer}>
                {(job.skills ?? []).map((skill, index) => (
                  <View
                    key={`${skill}-${index}`}
                    style={styles.skillChip}
                  >
                    <Text style={styles.skillChipText}>
                      {skill}
                    </Text>

                    <Pressable
                      hitSlop={8}
                      onPress={() => removeSkill(index)}
                      disabled={isBusy}
                    >
                      <Text style={styles.skillRemove}>
                        ×
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Location</Text>

            <View style={styles.inputWithIcon}>
              <Text style={styles.inputIcon}>📍</Text>

              <TextInput
                style={styles.iconInput}
                placeholder="e.g. Islamabad, Pakistan"
                placeholderTextColor="#9CA3AF"
                value={job.location}
                onChangeText={(value) =>
                  updateField('location', value)
                }
                editable={!isBusy}
              />
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Employment Type{' '}
              <Text style={styles.required}>*</Text>
            </Text>

            <View style={styles.typeGrid}>
              {employmentTypes.map((type) => {
                const selected =
                  job.employment_type === type;

                return (
                  <Pressable
                    key={type}
                    style={({ pressed }) => [
                      styles.typeChip,
                      selected &&
                        styles.typeChipSelected,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => {
                      if (!isBusy) {
                        updateField(
                          'employment_type',
                          type,
                        );
                      }
                    }}
                    disabled={isBusy}
                  >
                    <View
                      style={[
                        styles.radio,
                        selected &&
                          styles.radioSelected,
                      ]}
                    >
                      {selected && (
                        <View style={styles.radioInner} />
                      )}
                    </View>

                    <Text
                      style={[
                        styles.typeChipText,
                        selected &&
                          styles.typeChipTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.fieldContainerLast}>
            <Text style={styles.label}>Salary Range</Text>

            <View style={styles.inputWithIcon}>
              <Text style={styles.inputIcon}>💰</Text>

              <TextInput
                style={styles.iconInput}
                placeholder="e.g. $60k – $80k per year"
                placeholderTextColor="#9CA3AF"
                value={job.salary_band}
                onChangeText={(value) =>
                  updateField('salary_band', value)
                }
                editable={!isBusy}
              />
            </View>

            <Text style={styles.helperText}>
              Optional — adding a salary range can attract
              more candidates.
            </Text>
          </View>
        </View>

        {/* Tips */}
        {!isEditing && (
          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Text style={styles.tipIcon}>💡</Text>
            </View>

            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>
                Make your posting stand out
              </Text>

              <Text style={styles.tipText}>
                Use a clear title, detailed description,
                relevant skills, and salary information to
                attract better candidates.
              </Text>
            </View>
          </View>
        )}

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            isBusy && styles.buttonDisabled,
            pressed &&
              !isBusy &&
              styles.buttonPressed,
          ]}
          onPress={handleSave}
          disabled={isBusy}
        >
          {saving ? (
            <>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text style={styles.primaryButtonText}>
                {isEditing
                  ? 'Saving Changes...'
                  : 'Posting Job...'}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.primaryButtonIcon}>
                {isEditing ? '✓' : '+'}
              </Text>

              <Text style={styles.primaryButtonText}>
                {isEditing
                  ? 'Save Changes'
                  : 'Post Job'}
              </Text>
            </>
          )}
        </Pressable>

        {/* Delete */}
        {isEditing && (
          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              pressed &&
                styles.deleteButtonPressed,
            ]}
            onPress={handleDelete}
            disabled={isBusy}
          >
            {deleting ? (
              <ActivityIndicator
                size="small"
                color="#DC2626"
              />
            ) : (
              <>
                <Text style={styles.deleteIcon}>🗑</Text>

                <Text style={styles.deleteButtonText}>
                  Delete Job
                </Text>
              </>
            )}
          </Pressable>
        )}

        {/* Bottom Information */}
        <View style={styles.bottomInfo}>
          <View style={styles.bottomInfoIcon}>
            <Text style={styles.bottomInfoIconText}>
              🔒
            </Text>
          </View>

          <Text style={styles.bottomNote}>
            {isEditing
              ? 'Changes are saved securely to your job posting.'
              : 'Your job posting will be visible to candidates after publishing.'}
          </Text>
        </View>

        {/* Professional Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLine} />

          <View style={styles.footerBrand}>
            <View style={styles.footerDot} />

            <Text style={styles.footerProject}>
              Project By{' '}
              <Text style={styles.footerName}>
                SYED MESAM ABBAS & ABDUL MANNAN RANA
              </Text>
            </Text>

            <View style={styles.footerDot} />
          </View>

          <Text style={styles.footerTagline}>
            NokriHub • Smart Hiring &amp; Referrals
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  container: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 30,
  },

  /* ============================================================
     NOKRIHUB HEADER
  ============================================================ */

  topHeader: {
    height: 76,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF4',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 10,
  },

  headerSide: {
    width: 82,
    height: 48,
    justifyContent: 'center',
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F5F7FB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerButtonPressed: {
    backgroundColor: '#EEF2FF',
    transform: [{ scale: 0.96 }],
  },

  backIcon: {
    fontSize: 34,
    lineHeight: 34,
    fontWeight: '300',
    color: '#1F2937',
    marginTop: -3,
  },

  logoWrapper: {
    flex: 1,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 145,
    height: 52,
  },

  headerBadge: {
    alignSelf: 'flex-end',
    minWidth: 64,
    height: 30,
    paddingHorizontal: 9,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginRight: 5,
  },

  headerBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: 0.7,
  },

  headerAccent: {
    height: 3,
    width: '100%',
    flexDirection: 'row',
  },

  headerAccentBlue: {
    flex: 0.35,
    backgroundColor: '#2563EB',
  },

  headerAccentLight: {
    flex: 0.65,
    backgroundColor: '#DBEAFE',
  },

  /* =========================
     HERO
  ========================= */

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  heroIconText: {
    fontSize: 27,
  },

  heroContent: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: '#2563EB',
    marginBottom: 3,
  },

  pageTitle: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },

  pageSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
  },

  /* =========================
     STATUS
  ========================= */

  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  statusInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },

  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  statusIconOpen: {
    backgroundColor: '#DCFCE7',
  },

  statusIconClosed: {
    backgroundColor: '#F3F4F6',
  },

  statusIconText: {
    fontSize: 20,
    fontWeight: '800',
  },

  statusIconTextOpen: {
    color: '#16A34A',
  },

  statusIconTextClosed: {
    color: '#6B7280',
  },

  statusTextContainer: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },

  statusDescription: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    color: '#6B7280',
  },

  statusButton: {
    minWidth: 72,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  closeButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },

  reopenButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },

  statusButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },

  closeButtonText: {
    color: '#DC2626',
  },

  reopenButtonText: {
    color: '#2563EB',
  },

  /* =========================
     CARDS
  ========================= */

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 21,
  },

  cardHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  cardHeaderIconText: {
    fontSize: 19,
  },

  cardHeaderText: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  cardSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: '#9CA3AF',
  },

  /* =========================
     FIELDS
  ========================= */

  fieldContainer: {
    marginBottom: 18,
  },

  fieldContainerLast: {
    marginBottom: 0,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },

  required: {
    color: '#DC2626',
  },

  input: {
    minHeight: 49,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },

  textArea: {
    minHeight: 135,
    paddingTop: 13,
  },

  characterCount: {
    alignSelf: 'flex-end',
    marginTop: 5,
    fontSize: 10,
    color: '#9CA3AF',
  },

  helperText: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 16,
    color: '#9CA3AF',
  },

  inputWithIcon: {
    minHeight: 49,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 13,
  },

  inputIcon: {
    fontSize: 16,
    marginRight: 9,
  },

  iconInput: {
    flex: 1,
    minHeight: 47,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },

  /* =========================
     SKILLS
  ========================= */

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 7,
  },

  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 20,
    paddingLeft: 10,
    paddingRight: 7,
    paddingVertical: 6,
  },

  skillChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
    marginRight: 6,
  },

  skillRemove: {
    fontSize: 17,
    lineHeight: 17,
    fontWeight: '500',
    color: '#2563EB',
  },

  /* =========================
     EMPLOYMENT TYPES
  ========================= */

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  typeChip: {
    width: '48%',
    minHeight: 47,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 11,
  },

  typeChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  radioSelected: {
    borderColor: '#2563EB',
  },

  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#2563EB',
  },

  typeChipText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },

  typeChipTextSelected: {
    color: '#1D4ED8',
    fontWeight: '800',
  },

  /* =========================
     TIP
  ========================= */

  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },

  tipIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  tipIcon: {
    fontSize: 18,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },

  tipText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 17,
    color: '#A16207',
  },

  /* =========================
     PRIMARY BUTTON
  ========================= */

  primaryButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },

  primaryButtonIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '500',
    marginRight: 8,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },

  pressed: {
    opacity: 0.75,
  },

  /* =========================
     DELETE
  ========================= */

  deleteButton: {
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  deleteButtonPressed: {
    backgroundColor: '#FEE2E2',
  },

  deleteIcon: {
    fontSize: 15,
    marginRight: 7,
  },

  deleteButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },

  /* =========================
     BOTTOM INFORMATION
  ========================= */

  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingHorizontal: 16,
  },

  bottomInfoIcon: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  bottomInfoIconText: {
    fontSize: 12,
  },

  bottomNote: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 15,
    color: '#9CA3AF',
  },

  /* =========================
     PROFESSIONAL FOOTER
  ========================= */

  footer: {
    alignItems: 'center',
    marginTop: 28,
    paddingTop: 18,
    paddingBottom: 8,
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
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginHorizontal: 9,
  },

  footerProject: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  footerName: {
    color: '#2563EB',
    fontWeight: '800',
  },

  footerTagline: {
    marginTop: 6,
    fontSize: 9,
    color: '#C0C4CC',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

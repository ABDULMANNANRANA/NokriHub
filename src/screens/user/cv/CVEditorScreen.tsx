import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

import LOGO from '../../../../assets/images/Logo.png';

import {
  emptyCVData,
  CVData,
  CVExperience,
  CVEducation,
} from '../../types/cv';

import { createCV } from '../../services/cv.service';
import { useAuthStore } from '../../store/authStore';

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
  classic: '#374151',
  modern: '#2563EB',
  classic_professional: '#1A3C6E',
  modern_dark: '#B8953F',
  minimalist_clean: '#27AE60',
  executive: '#172033',
  creative: '#6C2BD9',
  two_column: '#263238',
  tech: '#00A884',
  corporate: '#0F766E',
  elegant: '#B08D57',
  student: '#2563EB',
};

// ============================================================
// HELPERS
// ============================================================

function getTemplateName(templateId?: string): string {
  if (!templateId) {
    return 'Classic';
  }

  return (
    TEMPLATE_NAMES[templateId] ||
    templateId
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
  );
}

function getTemplateColor(templateId?: string): string {
  if (!templateId) {
    return '#2563EB';
  }

  return TEMPLATE_COLORS[templateId] || '#2563EB';
}

// ============================================================
// COMPONENT
// ============================================================

export default function CVEditorScreen({
  route,
  navigation,
}: any) {
  const templateId = route?.params?.templateId || 'classic';

  const session = useAuthStore(state => state.session);

  const [cvData, setCvData] = useState<CVData>(() => ({
    ...emptyCVData,
    personalInfo: {
      ...emptyCVData.personalInfo,
    },
    experience: [...(emptyCVData.experience || [])],
    education: [...(emptyCVData.education || [])],
    skills: [...(emptyCVData.skills || [])],
  }));

  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const templateName = useMemo(
    () => getTemplateName(templateId),
    [templateId],
  );

  const templateColor = useMemo(
    () => getTemplateColor(templateId),
    [templateId],
  );

  // ============================================================
  // PERSONAL INFORMATION
  // ============================================================

  const updatePersonal = (
    field: keyof CVData['personalInfo'],
    value: string,
  ) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  // ============================================================
  // EXPERIENCE
  // ============================================================

  const addExperience = () => {
    const newExperience: CVExperience = {
      id: uuidv4(),
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
    };

    setCvData(prev => ({
      ...prev,
      experience: [
        ...(prev.experience || []),
        newExperience,
      ],
    }));
  };

  const updateExperience = (
    id: string,
    field: keyof CVExperience,
    value: string,
  ) => {
    setCvData(prev => ({
      ...prev,
      experience: (prev.experience || []).map(experience =>
        experience.id === id
          ? {
              ...experience,
              [field]: value,
            }
          : experience,
      ),
    }));
  };

  const removeExperience = (id: string) => {
    setCvData(prev => ({
      ...prev,
      experience: (prev.experience || []).filter(
        experience => experience.id !== id,
      ),
    }));
  };

  // ============================================================
  // EDUCATION
  // ============================================================

  const addEducation = () => {
    const newEducation: CVEducation = {
      id: uuidv4(),
      school: '',
      degree: '',
      startDate: '',
      endDate: '',
    };

    setCvData(prev => ({
      ...prev,
      education: [
        ...(prev.education || []),
        newEducation,
      ],
    }));
  };

  const updateEducation = (
    id: string,
    field: keyof CVEducation,
    value: string,
  ) => {
    setCvData(prev => ({
      ...prev,
      education: (prev.education || []).map(education =>
        education.id === id
          ? {
              ...education,
              [field]: value,
            }
          : education,
      ),
    }));
  };

  const removeEducation = (id: string) => {
    setCvData(prev => ({
      ...prev,
      education: (prev.education || []).filter(
        education => education.id !== id,
      ),
    }));
  };

  // ============================================================
  // SKILLS
  // ============================================================

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) {
      return;
    }

    const alreadyExists = (cvData.skills || []).some(
      existingSkill =>
        existingSkill.toLowerCase() === skill.toLowerCase(),
    );

    if (alreadyExists) {
      Alert.alert(
        'Skill already added',
        `"${skill}" is already in your skills list.`,
      );

      setSkillInput('');
      return;
    }

    setCvData(prev => ({
      ...prev,
      skills: [
        ...(prev.skills || []),
        skill,
      ],
    }));

    setSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    setCvData(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(
        skill => skill !== skillToRemove,
      ),
    }));
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateCV = (): boolean => {
    const fullName =
      cvData.personalInfo?.fullName?.trim();

    const email =
      cvData.personalInfo?.email?.trim();

    if (!fullName) {
      Alert.alert(
        'Full name required',
        'Please enter your full name before saving your CV.',
      );

      return false;
    }

    if (!email) {
      Alert.alert(
        'Email required',
        'Please enter your email address.',
      );

      return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert(
        'Invalid email',
        'Please enter a valid email address.',
      );

      return false;
    }

    return true;
  };

  // ============================================================
  // SAVE CV
  // ============================================================

  const handleContinue = async () => {
    if (!session?.user?.id) {
      Alert.alert(
        'Not signed in',
        'Please sign in before creating a CV.',
      );

      return;
    }

    if (!validateCV()) {
      return;
    }

    setSaving(true);

    try {
      const cv = await createCV(
        session.user.id,
        templateId,
        cvData,
      );

      if (!cv?.id) {
        throw new Error(
          'CV was created but no CV ID was returned.',
        );
      }

      navigation.navigate('CVPreview', {
        cvId: cv.id,
      });
    } catch (error: any) {
      console.log('Failed to create CV:', error);

      Alert.alert(
        'Unable to save CV',
        error?.message ||
          'Something went wrong while saving your CV. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // INPUT COMPONENT
  // ============================================================

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    placeholder: string,
    options?: {
      multiline?: boolean;
      maxLength?: number;
      keyboardType?: any;
      autoCapitalize?: any;
    },
  ) => {
    const maxLength = options?.maxLength;

    return (
      <View style={styles.fieldContainer}>
        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>
            {label}
          </Text>

          {maxLength ? (
            <Text style={styles.characterCount}>
              {value.length}/{maxLength}
            </Text>
          ) : null}
        </View>

        <TextInput
          style={[
            styles.input,
            options?.multiline && styles.multilineInput,
          ]}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          multiline={options?.multiline}
          maxLength={maxLength}
          keyboardType={
            options?.keyboardType || 'default'
          }
          autoCapitalize={
            options?.autoCapitalize || 'sentences'
          }
          textAlignVertical={
            options?.multiline ? 'top' : 'center'
          }
        />
      </View>
    );
  };

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ====================================================
            PROFESSIONAL HEADER WITH CENTER LOGO
        ==================================================== */}

        <View
          style={[
            styles.header,
            {
              borderTopColor: templateColor,
            },
          ]}
        >
          {/* Centered Logo */}
          <View style={styles.logoWrapper}>
            <View
              style={[
                styles.logoContainer,
                {
                  borderColor: `${templateColor}25`,
                  shadowColor: templateColor,
                },
              ]}
            >
              <Image
                source={LOGO}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Header Title */}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.pageTitle}>
              Build Your CV
            </Text>

            <Text style={styles.pageSubtitle}>
              Create a professional resume that showcases
              your strengths.
            </Text>
          </View>

          {/* Template Badge */}
          <View style={styles.headerBadgeRow}>
            <View
              style={[
                styles.templateBadge,
                {
                  backgroundColor: `${templateColor}10`,
                  borderColor: `${templateColor}25`,
                },
              ]}
            >
              <Text
                style={[
                  styles.templateBadgeLabel,
                  {
                    color: templateColor,
                  },
                ]}
              >
                SELECTED TEMPLATE
              </Text>

              <Text
                style={[
                  styles.templateBadgeText,
                  {
                    color: templateColor,
                  },
                ]}
                numberOfLines={2}
              >
                {templateName}
              </Text>
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressHeader}>
            <View style={styles.progressTitleGroup}>
              <View
                style={[
                  styles.progressStatusDot,
                  {
                    backgroundColor: templateColor,
                  },
                ]}
              />

              <Text style={styles.progressLabel}>
                CV completion
              </Text>
            </View>

            <Text
              style={[
                styles.progressValue,
                {
                  color: templateColor,
                },
              ]}
            >
              25%
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor: templateColor,
                },
              ]}
            />
          </View>
        </View>

        {/* ====================================================
            PERSONAL INFORMATION
        ==================================================== */}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionNumber,
                {
                  backgroundColor: templateColor,
                },
              ]}
            >
              <Text style={styles.sectionNumberText}>
                1
              </Text>
            </View>

            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Personal Information
              </Text>

              <Text style={styles.sectionSubtitle}>
                Tell employers who you are
              </Text>
            </View>
          </View>

          {renderInput(
            'Full Name',
            cvData.personalInfo.fullName,
            value =>
              updatePersonal('fullName', value),
            'e.g. Zaryab Babar',
          )}

          {renderInput(
            'Email Address',
            cvData.personalInfo.email,
            value =>
              updatePersonal('email', value),
            'e.g. zaryab@example.com',
            {
              keyboardType: 'email-address',
              autoCapitalize: 'none',
            },
          )}

          {renderInput(
            'Phone Number',
            cvData.personalInfo.phone,
            value =>
              updatePersonal('phone', value),
            'e.g. +92 300 1234567',
            {
              keyboardType: 'phone-pad',
            },
          )}

          {renderInput(
            'Location',
            cvData.personalInfo.location,
            value =>
              updatePersonal('location', value),
            'e.g. Islamabad, Pakistan',
          )}

          {renderInput(
            'Professional Summary',
            cvData.personalInfo.summary || '',
            value =>
              updatePersonal('summary', value),
            'Write 2–4 sentences about your experience, skills and career goals...',
            {
              multiline: true,
              maxLength: 600,
            },
          )}

          <View style={styles.helperBox}>
            <Text style={styles.helperIcon}>
              i
            </Text>

            <Text style={styles.helperText}>
              Keep your summary concise and focus on
              your strongest professional qualities.
            </Text>
          </View>
        </View>

        {/* ====================================================
            EXPERIENCE
        ==================================================== */}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionNumber,
                {
                  backgroundColor: templateColor,
                },
              ]}
            >
              <Text style={styles.sectionNumberText}>
                2
              </Text>
            </View>

            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Work Experience
              </Text>

              <Text style={styles.sectionSubtitle}>
                Add your professional experience
              </Text>
            </View>

            {(cvData.experience || []).length > 0 ? (
              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: `${templateColor}12`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    {
                      color: templateColor,
                    },
                  ]}
                >
                  {cvData.experience.length}
                </Text>
              </View>
            ) : null}
          </View>

          {(cvData.experience || []).length === 0 && (
            <View style={styles.emptySection}>
              <View
                style={[
                  styles.emptySectionIcon,
                  {
                    backgroundColor: `${templateColor}12`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.emptySectionIconText,
                    {
                      color: templateColor,
                    },
                  ]}
                >
                  +
                </Text>
              </View>

              <Text style={styles.emptySectionTitle}>
                No experience added
              </Text>

              <Text style={styles.emptySectionText}>
                Add your jobs, internships or
                professional experience.
              </Text>
            </View>
          )}

          {(cvData.experience || []).map(
            (experience, index) => (
              <View
                key={experience.id}
                style={[
                  styles.entryCard,
                  {
                    borderLeftColor: templateColor,
                  },
                ]}
              >
                <View style={styles.entryHeader}>
                  <View style={styles.entryHeaderLeft}>
                    <View
                      style={[
                        styles.entryNumber,
                        {
                          backgroundColor: `${templateColor}12`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.entryNumberText,
                          {
                            color: templateColor,
                          },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>

                    <View>
                      <Text style={styles.entryTitle}>
                        Experience {index + 1}
                      </Text>

                      <Text style={styles.entrySubtitle}>
                        Professional position
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      removeExperience(
                        experience.id,
                      )
                    }
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeText}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>

                {renderInput(
                  'Job Title / Role',
                  experience.role,
                  value =>
                    updateExperience(
                      experience.id,
                      'role',
                      value,
                    ),
                  'e.g. Software Developer',
                )}

                {renderInput(
                  'Company',
                  experience.company,
                  value =>
                    updateExperience(
                      experience.id,
                      'company',
                      value,
                    ),
                  'e.g. ABC Technologies',
                )}

                <View style={styles.row}>
                  <View style={styles.halfField}>
                    {renderInput(
                      'Start Date',
                      experience.startDate,
                      value =>
                        updateExperience(
                          experience.id,
                          'startDate',
                          value,
                        ),
                      'Jan 2024',
                    )}
                  </View>

                  <View style={styles.halfField}>
                    {renderInput(
                      'End Date',
                      experience.endDate,
                      value =>
                        updateExperience(
                          experience.id,
                          'endDate',
                          value,
                        ),
                      'Present',
                    )}
                  </View>
                </View>

                {renderInput(
                  'Description',
                  experience.description,
                  value =>
                    updateExperience(
                      experience.id,
                      'description',
                      value,
                    ),
                  'Describe your responsibilities and achievements...',
                  {
                    multiline: true,
                    maxLength: 500,
                  },
                )}
              </View>
            ),
          )}

          <TouchableOpacity
            style={[
              styles.outlineButton,
              {
                borderColor: templateColor,
                backgroundColor: `${templateColor}05`,
              },
            ]}
            activeOpacity={0.8}
            onPress={addExperience}
          >
            <Text
              style={[
                styles.outlineButtonPlus,
                {
                  color: templateColor,
                },
              ]}
            >
              +
            </Text>

            <Text
              style={[
                styles.outlineButtonText,
                {
                  color: templateColor,
                },
              ]}
            >
              Add Experience
            </Text>
          </TouchableOpacity>
        </View>

        {/* ====================================================
            EDUCATION
        ==================================================== */}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionNumber,
                {
                  backgroundColor: templateColor,
                },
              ]}
            >
              <Text style={styles.sectionNumberText}>
                3
              </Text>
            </View>

            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Education
              </Text>

              <Text style={styles.sectionSubtitle}>
                Add your academic qualifications
              </Text>
            </View>

            {(cvData.education || []).length > 0 ? (
              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: `${templateColor}12`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    {
                      color: templateColor,
                    },
                  ]}
                >
                  {cvData.education.length}
                </Text>
              </View>
            ) : null}
          </View>

          {(cvData.education || []).length === 0 && (
            <View style={styles.emptySection}>
              <View
                style={[
                  styles.emptySectionIcon,
                  {
                    backgroundColor: `${templateColor}12`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.emptySectionIconText,
                    {
                      color: templateColor,
                    },
                  ]}
                >
                  +
                </Text>
              </View>

              <Text style={styles.emptySectionTitle}>
                No education added
              </Text>

              <Text style={styles.emptySectionText}>
                Add your degrees, diplomas or
                certifications.
              </Text>
            </View>
          )}

          {(cvData.education || []).map(
            (education, index) => (
              <View
                key={education.id}
                style={[
                  styles.entryCard,
                  {
                    borderLeftColor: templateColor,
                  },
                ]}
              >
                <View style={styles.entryHeader}>
                  <View style={styles.entryHeaderLeft}>
                    <View
                      style={[
                        styles.entryNumber,
                        {
                          backgroundColor: `${templateColor}12`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.entryNumberText,
                          {
                            color: templateColor,
                          },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>

                    <View>
                      <Text style={styles.entryTitle}>
                        Education {index + 1}
                      </Text>

                      <Text style={styles.entrySubtitle}>
                        Academic qualification
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      removeEducation(
                        education.id,
                      )
                    }
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeText}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>

                {renderInput(
                  'Degree / Qualification',
                  education.degree,
                  value =>
                    updateEducation(
                      education.id,
                      'degree',
                      value,
                    ),
                  'e.g. BS Computer Science',
                )}

                {renderInput(
                  'Institution',
                  education.school,
                  value =>
                    updateEducation(
                      education.id,
                      'school',
                      value,
                    ),
                  'e.g. Arid Agriculture University',
                )}

                <View style={styles.row}>
                  <View style={styles.halfField}>
                    {renderInput(
                      'Start Date',
                      education.startDate,
                      value =>
                        updateEducation(
                          education.id,
                          'startDate',
                          value,
                        ),
                      '2022',
                    )}
                  </View>

                  <View style={styles.halfField}>
                    {renderInput(
                      'End Date',
                      education.endDate,
                      value =>
                        updateEducation(
                          education.id,
                          'endDate',
                          value,
                        ),
                      '2026',
                    )}
                  </View>
                </View>
              </View>
            ),
          )}

          <TouchableOpacity
            style={[
              styles.outlineButton,
              {
                borderColor: templateColor,
                backgroundColor: `${templateColor}05`,
              },
            ]}
            activeOpacity={0.8}
            onPress={addEducation}
          >
            <Text
              style={[
                styles.outlineButtonPlus,
                {
                  color: templateColor,
                },
              ]}
            >
              +
            </Text>

            <Text
              style={[
                styles.outlineButtonText,
                {
                  color: templateColor,
                },
              ]}
            >
              Add Education
            </Text>
          </TouchableOpacity>
        </View>

        {/* ====================================================
            SKILLS
        ==================================================== */}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionNumber,
                {
                  backgroundColor: templateColor,
                },
              ]}
            >
              <Text style={styles.sectionNumberText}>
                4
              </Text>
            </View>

            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>
                Skills
              </Text>

              <Text style={styles.sectionSubtitle}>
                Add your strongest professional skills
              </Text>
            </View>

            {(cvData.skills || []).length > 0 ? (
              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: `${templateColor}12`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    {
                      color: templateColor,
                    },
                  ]}
                >
                  {cvData.skills.length}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.skillInputRow}>
            <TextInput
              style={styles.skillInput}
              placeholder="e.g. React Native"
              placeholderTextColor="#94A3B8"
              value={skillInput}
              onChangeText={setSkillInput}
              autoCapitalize="words"
              onSubmitEditing={addSkill}
              returnKeyType="done"
            />

            <TouchableOpacity
              style={[
                styles.addSkillButton,
                {
                  backgroundColor: templateColor,
                },
              ]}
              activeOpacity={0.8}
              onPress={addSkill}
            >
              <Text style={styles.addSkillButtonPlus}>
                +
              </Text>

              <Text style={styles.addSkillButtonText}>
                Add
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.skillHint}>
            Add skills one at a time. Press Enter or tap Add.
          </Text>

          {(cvData.skills || []).length > 0 ? (
            <View style={styles.skillsContainer}>
              {(cvData.skills || []).map(skill => (
                <View
                  key={skill}
                  style={[
                    styles.skillChip,
                    {
                      backgroundColor: `${templateColor}10`,
                      borderColor: `${templateColor}30`,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.skillDot,
                      {
                        backgroundColor: templateColor,
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.skillChipText,
                      {
                        color: templateColor,
                      },
                    ]}
                  >
                    {skill}
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      removeSkill(skill)
                    }
                    style={styles.removeSkillButton}
                  >
                    <Text
                      style={[
                        styles.removeSkillText,
                        {
                          color: templateColor,
                        },
                      ]}
                    >
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noSkillsContainer}>
              <Text style={styles.noSkillsIcon}>
                ✦
              </Text>

              <Text style={styles.noSkillsText}>
                No skills added yet
              </Text>
            </View>
          )}
        </View>

        {/* ====================================================
            TIP
        ==================================================== */}

        <View
          style={[
            styles.tipCard,
            {
              borderLeftColor: templateColor,
            },
          ]}
        >
          <View
            style={[
              styles.tipIcon,
              {
                backgroundColor: `${templateColor}12`,
              },
            ]}
          >
            <Text
              style={[
                styles.tipIconText,
                {
                  color: templateColor,
                },
              ]}
            >
              ✓
            </Text>
          </View>

          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>
              Make your CV stand out
            </Text>

            <Text style={styles.tipText}>
              Use clear job titles, measurable
              achievements and relevant skills. Keep
              your summary short and professional.
            </Text>
          </View>
        </View>

        {/* ====================================================
            SAVE BUTTON
        ==================================================== */}

        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: templateColor,
              opacity: saving ? 0.75 : 1,
            },
          ]}
          activeOpacity={0.85}
          onPress={handleContinue}
          disabled={saving}
        >
          {saving ? (
            <>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text style={styles.saveButtonText}>
                Saving CV...
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.saveButtonIcon}>
                ✓
              </Text>

              <Text style={styles.saveButtonText}>
                Save & Preview
              </Text>

              <Text style={styles.saveArrow}>
                →
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.reviewText}>
          You can review your CV before exporting it as a PDF.
        </Text>

        {/* ====================================================
            PROFESSIONAL FOOTER
        ==================================================== */}

        <View style={styles.footerDivider} />

        <View style={styles.appFooter}>
          <View
            style={[
              styles.footerMark,
              {
                backgroundColor: `${templateColor}12`,
                borderColor: `${templateColor}25`,
              },
            ]}
          >
            <Text
              style={[
                styles.footerMarkText,
                {
                  color: templateColor,
                },
              ]}
            >
              N
            </Text>
          </View>

          <View style={styles.footerInfo}>
            <Text style={styles.footerCaption}>
              NOKRIHUB
            </Text>

            <Text style={styles.footerProject}>
              Project By{' '}
              <Text
                style={[
                  styles.footerAuthor,
                  {
                    color: templateColor,
                  },
                ]}
              >
                SYED MESAM ABBAS & ABDUL MANNAN RANA
              </Text>
            </Text>
          </View>
        </View>

        <Text style={styles.footerCopyright}>
          Professional CV Builder
        </Text>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
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
    backgroundColor: '#F4F7FB',
  },

  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },

  // ==========================================================
  // PROFESSIONAL HEADER
  // ==========================================================

  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderTopWidth: 4,

    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 17,

    marginBottom: 16,

    borderWidth: 1,
    borderColor: '#E8EDF4',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  logoWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  logoContainer: {
    width: 92,
    height: 70,

    backgroundColor: '#FFFFFF',

    borderRadius: 18,
    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 9,
    paddingVertical: 7,

    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 3,
  },

  logo: {
    width: 76,
    height: 56,
  },

  headerTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  pageTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.6,
    textAlign: 'center',
  },

  pageSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },

  headerBadgeRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
  },

  templateBadge: {
    minWidth: 130,
    maxWidth: 190,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  templateBadgeLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },

  templateBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 7,
  },

  progressTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  progressLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },

  progressValue: {
    fontSize: 10,
    fontWeight: '800',
  },

  progressContainer: {
    height: 5,
    backgroundColor: '#EEF2F7',
    borderRadius: 5,
    overflow: 'hidden',
  },

  progressBar: {
    width: '25%',
    height: '100%',
    borderRadius: 5,
  },

  // ==========================================================
  // SECTION CARD
  // ==========================================================

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    marginBottom: 15,

    borderWidth: 1,
    borderColor: '#E5EAF0',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.045,
    shadowRadius: 10,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  sectionNumber: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionNumberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  sectionHeaderText: {
    flex: 1,
    marginLeft: 11,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },

  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },

  countBadge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  // ==========================================================
  // INPUTS
  // ==========================================================

  fieldContainer: {
    marginBottom: 13,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },

  characterCount: {
    fontSize: 10,
    color: '#94A3B8',
  },

  input: {
    minHeight: 49,
    backgroundColor: '#F8FAFC',

    borderWidth: 1,
    borderColor: '#E2E8F0',

    borderRadius: 12,

    paddingHorizontal: 13,
    paddingVertical: 11,

    color: '#0F172A',
    fontSize: 14,
  },

  multilineInput: {
    minHeight: 112,
    paddingTop: 13,
    lineHeight: 20,
  },

  helperBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: -2,
  },

  helperIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#CBD5E1',
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 18,
    marginRight: 8,
  },

  helperText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 16,
    color: '#64748B',
  },

  // ==========================================================
  // ROW
  // ==========================================================

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  halfField: {
    flex: 1,
  },

  // ==========================================================
  // ENTRY CARD
  // ==========================================================

  entryCard: {
    borderLeftWidth: 3,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 13,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EDF1F5',
  },

  entryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  entryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  entryNumber: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  entryNumberText: {
    fontSize: 11,
    fontWeight: '800',
  },

  entryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },

  entrySubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 3,
  },

  removeButton: {
    paddingVertical: 5,
    paddingHorizontal: 5,
  },

  removeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },

  // ==========================================================
  // BUTTONS
  // ==========================================================

  outlineButton: {
    minHeight: 47,
    borderWidth: 1.5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  outlineButtonPlus: {
    fontSize: 19,
    fontWeight: '500',
    marginRight: 6,
    marginTop: -1,
  },

  outlineButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },

  // ==========================================================
  // EMPTY SECTION
  // ==========================================================

  emptySection: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 22,
    paddingHorizontal: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },

  emptySectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  emptySectionIconText: {
    fontSize: 25,
    fontWeight: '300',
  },

  emptySectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },

  emptySectionText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },

  // ==========================================================
  // SKILLS
  // ==========================================================

  skillInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  skillInput: {
    flex: 1,
    height: 49,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 13,
    color: '#0F172A',
    fontSize: 14,
  },

  addSkillButton: {
    height: 49,
    minWidth: 75,
    paddingHorizontal: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginLeft: 8,
  },

  addSkillButtonPlus: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    marginRight: 4,
  },

  addSkillButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  skillHint: {
    fontSize: 10,
    lineHeight: 16,
    color: '#94A3B8',
    marginBottom: 13,
  },

  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 10,
    paddingRight: 5,
    paddingVertical: 7,
  },

  skillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  skillChipText: {
    fontSize: 12,
    fontWeight: '700',
  },

  removeSkillButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },

  removeSkillText: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 20,
  },

  noSkillsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 17,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },

  noSkillsIcon: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 3,
  },

  noSkillsText: {
    fontSize: 11,
    color: '#94A3B8',
  },

  // ==========================================================
  // TIP
  // ==========================================================

  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EAF0',
    borderLeftWidth: 3,
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
  },

  tipIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tipIconText: {
    fontSize: 16,
    fontWeight: '800',
  },

  tipContent: {
    flex: 1,
    marginLeft: 11,
  },

  tipTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  tipText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#64748B',
  },

  // ==========================================================
  // SAVE
  // ==========================================================

  saveButton: {
    minHeight: 56,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    elevation: 5,
  },

  saveButtonIcon: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginRight: 7,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  saveArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    marginLeft: 9,
    fontWeight: '400',
  },

  reviewText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 16,
  },

  // ==========================================================
  // PROFESSIONAL FOOTER
  // ==========================================================

  footerDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 24,
    marginBottom: 18,
  },

  appFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerMark: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  footerMarkText: {
    fontSize: 17,
    fontWeight: '900',
  },

  footerInfo: {
    alignItems: 'flex-start',
  },

  footerCaption: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: '#64748B',
    marginBottom: 2,
  },

  footerProject: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 15,
  },

  footerAuthor: {
    fontWeight: '800',
  },

  footerCopyright: {
    fontSize: 9,
    color: '#CBD5E1',
    textAlign: 'center',
    marginTop: 8,
  },

  bottomSpace: {
    height: 30,
  },
});



















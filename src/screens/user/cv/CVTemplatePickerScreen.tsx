import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import LOGO from '../../../../assets/images/Logo.png';

// ============================================================
// TEMPLATE DATA
// ============================================================

const templates = [
  {
    id: 'classic',
    label: 'Classic',
    desc: 'Clean, traditional layout designed for professional applications.',
    color: '#374151',
    tag: 'Professional',
  },
  {
    id: 'modern',
    label: 'Modern',
    desc: 'Bold blue accents with a clean and contemporary structure.',
    color: '#2563EB',
    tag: 'Popular',
  },
  {
    id: 'classic_professional',
    label: 'Classic Professional',
    desc: 'Professional navy styling with elegant section dividers.',
    color: '#1A3C6E',
    tag: 'Professional',
  },
  {
    id: 'modern_dark',
    label: 'Modern Dark',
    desc: 'Premium dark appearance with sophisticated gold accents.',
    color: '#B08D3E',
    tag: 'Premium',
  },
  {
    id: 'minimalist_clean',
    label: 'Minimalist Clean',
    desc: 'Simple and spacious design with subtle green accents.',
    color: '#27AE60',
    tag: 'Minimal',
  },
  {
    id: 'executive',
    label: 'Executive',
    desc: 'Polished executive design suitable for managers and senior professionals.',
    color: '#172033',
    tag: 'Executive',
  },
  {
    id: 'creative',
    label: 'Creative',
    desc: 'Expressive purple design with modern skill tags and visual details.',
    color: '#6C2BD9',
    tag: 'Creative',
  },
  {
    id: 'two_column',
    label: 'Two Column',
    desc: 'Organized sidebar layout separating contact information and skills.',
    color: '#263238',
    tag: 'Two Column',
  },
  {
    id: 'tech',
    label: 'Tech',
    desc: 'Developer-focused CV design with modern technical styling.',
    color: '#00A884',
    tag: 'Tech',
  },
  {
    id: 'corporate',
    label: 'Corporate',
    desc: 'Clean ATS-friendly layout designed for corporate applications.',
    color: '#0F766E',
    tag: 'ATS Friendly',
  },
  {
    id: 'elegant',
    label: 'Elegant',
    desc: 'Premium minimalist design with sophisticated typography.',
    color: '#B08D57',
    tag: 'Elegant',
  },
  {
    id: 'student',
    label: 'Student',
    desc: 'Simple professional CV designed for students and fresh graduates.',
    color: '#2563EB',
    tag: 'Students',
  },
] as const;

// ============================================================
// SCREEN
// ============================================================

export default function CVTemplatePickerScreen({
  navigation,
}: any) {
  const handleSelectTemplate = (templateId: string) => {
    navigation.navigate('CVEditor', {
      templateId,
    });
  };

  return (
    <View style={styles.screen}>
      {/* ======================================================
          PROFESSIONAL NOKRIHUB LOGO HEADER
      ====================================================== */}

      <View style={styles.logoHeader}>
        <View style={styles.logoHeaderInner}>
          <Image
            source={LOGO}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================== */}
        {/* HERO HEADER                                        */}
        {/* ================================================== */}

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroIconText}>CV</Text>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.eyebrow}>
              RESUME BUILDER
            </Text>

            <Text style={styles.title}>
              Choose Your CV Template
            </Text>

            <Text style={styles.subtitle}>
              Select a professional design that matches
              your career and personality.
            </Text>
          </View>
        </View>

        {/* ================================================== */}
        {/* QUICK INFO                                         */}
        {/* ================================================== */}

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>✓</Text>
            </View>

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>
                Professional
              </Text>

              <Text style={styles.infoText}>
                Ready-to-use designs
              </Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>12</Text>
            </View>

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>
                Templates
              </Text>

              <Text style={styles.infoText}>
                Multiple styles
              </Text>
            </View>
          </View>
        </View>

        {/* ================================================== */}
        {/* SECTION HEADER                                     */}
        {/* ================================================== */}

        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderTextContainer}>
            <Text style={styles.sectionTitle}>
              Available Templates
            </Text>

            <Text style={styles.sectionSubtitle}>
              Tap any template to start building your CV
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {templates.length}
            </Text>
          </View>
        </View>

        {/* ================================================== */}
        {/* TEMPLATE LIST                                      */}
        {/* ================================================== */}

        {templates.map((template, index) => (
          <TouchableOpacity
            key={template.id}
            style={styles.card}
            activeOpacity={0.82}
            onPress={() =>
              handleSelectTemplate(template.id)
            }
          >
            {/* Template Accent */}
            <View
              style={[
                styles.accentBar,
                {
                  backgroundColor: template.color,
                },
              ]}
            />

            <View style={styles.cardInner}>
              {/* Number */}
              <View
                style={[
                  styles.numberContainer,
                  {
                    backgroundColor: `${template.color}12`,
                    borderColor: `${template.color}25`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.number,
                    {
                      color: template.color,
                    },
                  ]}
                >
                  {String(index + 1).padStart(2, '0')}
                </Text>
              </View>

              {/* Main Content */}
              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <Text
                    style={styles.cardTitle}
                    numberOfLines={2}
                  >
                    {template.label}
                  </Text>

                  <View
                    style={[
                      styles.tag,
                      {
                        backgroundColor: `${template.color}12`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        {
                          color: template.color,
                        },
                      ]}
                    >
                      {template.tag}
                    </Text>
                  </View>
                </View>

                <Text
                  style={styles.cardDesc}
                  numberOfLines={3}
                >
                  {template.desc}
                </Text>

                <View style={styles.chooseRow}>
                  <Text
                    style={[
                      styles.chooseText,
                      {
                        color: template.color,
                      },
                    ]}
                  >
                    Use this template
                  </Text>

                  <Text
                    style={[
                      styles.chooseArrow,
                      {
                        color: template.color,
                      },
                    ]}
                  >
                    →
                  </Text>
                </View>
              </View>

              {/* Arrow */}
              <View
                style={[
                  styles.arrowContainer,
                  {
                    backgroundColor: `${template.color}10`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.arrow,
                    {
                      color: template.color,
                    },
                  ]}
                >
                  ›
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* ================================================== */}
        {/* BOTTOM TIP                                         */}
        {/* ================================================== */}

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Text style={styles.tipIconText}>i</Text>
          </View>

          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>
              Choose the right style
            </Text>

            <Text style={styles.tipText}>
              For corporate jobs, consider Classic,
              Executive or Corporate. For technology
              roles, Tech or Modern can make your CV
              stand out.
            </Text>
          </View>
        </View>

        {/* ================================================== */}
        {/* FOOTER                                             */}
        {/* ================================================== */}

        <View style={styles.footer}>
          <View style={styles.footerLine} />

          <Text style={styles.footerBrand}>
            NOKRIHUB
          </Text>

          <Text style={styles.footerProject}>
            Project By SYED MESAM ABBAS & ABDUL MANNAN RANA
          </Text>

          <Text style={styles.footerSubtext}>
            Professional CV & Career Platform
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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

  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 30,
  },

  // ==========================================================
  // PROFESSIONAL LOGO HEADER
  // ==========================================================

  logoHeader: {
    width: '100%',
    height: 82,

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
    shadowRadius: 9,

    elevation: 3,

    zIndex: 10,
  },

  logoHeaderInner: {
    width: 190,
    height: 70,

    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 160,
    height: 58,
  },

  // ==========================================================
  // HERO
  // ==========================================================

  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderRadius: 22,

    padding: 19,

    borderWidth: 1,
    borderColor: '#E2E8F0',

    marginBottom: 14,

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,

    elevation: 3,
  },

  heroIcon: {
    width: 58,
    height: 58,

    borderRadius: 17,

    backgroundColor: '#2563EB',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  heroIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  heroContent: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: 1.4,
    marginBottom: 4,
  },

  title: {
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    marginTop: 5,
  },

  // ==========================================================
  // INFO ROW
  // ==========================================================

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    borderWidth: 1,
    borderColor: '#E2E8F0',

    paddingVertical: 13,
    paddingHorizontal: 14,

    marginBottom: 22,
  },

  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  infoTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  infoDivider: {
    width: 1,
    height: 34,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },

  infoIcon: {
    width: 34,
    height: 34,

    borderRadius: 11,

    backgroundColor: '#EFF6FF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 9,
  },

  infoIconText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#2563EB',
  },

  infoTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
  },

  infoText: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },

  // ==========================================================
  // SECTION HEADER
  // ==========================================================

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 12,

    paddingHorizontal: 2,
  },

  sectionHeaderTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },

  sectionSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
  },

  countBadge: {
    minWidth: 32,
    height: 30,

    paddingHorizontal: 9,

    borderRadius: 15,

    backgroundColor: '#EFF6FF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  countBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#2563EB',
  },

  // ==========================================================
  // TEMPLATE CARD
  // ==========================================================

  card: {
    flexDirection: 'row',

    backgroundColor: '#FFFFFF',

    borderRadius: 17,

    borderWidth: 1,
    borderColor: '#E2E8F0',

    marginBottom: 11,

    overflow: 'hidden',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 8,

    elevation: 2,
  },

  accentBar: {
    width: 4,
  },

  cardInner: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 14,
    paddingLeft: 13,
    paddingRight: 12,
  },

  // ==========================================================
  // NUMBER
  // ==========================================================

  numberContainer: {
    width: 43,
    height: 43,

    borderRadius: 13,

    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  number: {
    fontSize: 11,
    fontWeight: '900',
  },

  // ==========================================================
  // CARD CONTENT
  // ==========================================================

  textContainer: {
    flex: 1,
    minWidth: 0,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 4,
  },

  cardTitle: {
    flex: 1,

    fontSize: 15,
    fontWeight: '800',

    color: '#0F172A',

    marginRight: 7,
  },

  tag: {
    paddingHorizontal: 7,
    paddingVertical: 4,

    borderRadius: 7,

    alignSelf: 'flex-start',
  },

  tagText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  cardDesc: {
    fontSize: 11,
    lineHeight: 17,

    color: '#64748B',

    paddingRight: 4,
  },

  // ==========================================================
  // CHOOSE ROW
  // ==========================================================

  chooseRow: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: 8,
  },

  chooseText: {
    fontSize: 10,
    fontWeight: '800',
  },

  chooseArrow: {
    fontSize: 15,
    fontWeight: '700',

    marginLeft: 5,
  },

  // ==========================================================
  // ARROW
  // ==========================================================

  arrowContainer: {
    width: 32,
    height: 32,

    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 8,
  },

  arrow: {
    fontSize: 23,
    fontWeight: '300',

    lineHeight: 25,
  },

  // ==========================================================
  // TIP
  // ==========================================================

  tipCard: {
    flexDirection: 'row',

    backgroundColor: '#F1F5F9',

    borderRadius: 16,

    padding: 14,

    marginTop: 6,
  },

  tipIcon: {
    width: 32,
    height: 32,

    borderRadius: 10,

    backgroundColor: '#E2E8F0',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  tipIconText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#475569',
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#334155',

    marginBottom: 3,
  },

  tipText: {
    fontSize: 10,
    lineHeight: 16,
    color: '#64748B',
  },

  // ==========================================================
  // FOOTER
  // ==========================================================

  footer: {
    alignItems: 'center',

    marginTop: 28,

    paddingTop: 20,
  },

  footerLine: {
    width: 45,
    height: 3,

    borderRadius: 2,

    backgroundColor: '#2563EB',

    marginBottom: 14,
  },

  footerBrand: {
    fontSize: 11,
    fontWeight: '900',

    letterSpacing: 2,

    color: '#1E3A8A',

    marginBottom: 5,
  },

  footerProject: {
    fontSize: 11,
    fontWeight: '700',

    color: '#475569',

    textAlign: 'center',
  },

  footerSubtext: {
    fontSize: 9,

    color: '#94A3B8',

    marginTop: 4,

    textAlign: 'center',
  },

  bottomSpacing: {
    height: 15,
  },
});



















import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { CampaignCategory, CampaignDraft, AdCreative } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useCampaigns, DEFAULT_EMPTY_DRAFT } from '../context/CampaignContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { VoiceCreateModal } from './VoiceCreateModal';
import { calculateReachEstimate, formatCurrency, formatCompactNumber } from '../utils/reachCalculator';
import { Radius, Shadows, Spacing } from '../theme';

interface CreateScreenProps {
  onCampaignSubmitted?: (id: string) => void;
  onNavigateHome?: () => void;
}

const CATEGORIES: CampaignCategory[] = [
  'Environment',
  'Health',
  'Science',
  'Education',
  'Public Policy',
  'Economic Policy',
  'Community',
  'Arts & Culture',
  'Business',
  'Other',
];

const PRESET_COVER_IMAGES = [
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1000&auto=format&fit=crop&q=80',
];

export const CreateScreen: React.FC<CreateScreenProps> = ({
  onCampaignSubmitted,
  onNavigateHome,
}) => {
  const { colors, isDark } = useTheme();
  const { currentDraft, saveDraft, clearDraft, submitCampaign } = useCampaigns();

  // Local draft state initialized from context
  const [draft, setDraft] = useState<CampaignDraft>(currentDraft || DEFAULT_EMPTY_DRAFT);
  const [activeStep, setActiveStep] = useState<number>(currentDraft?.step || 1);
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedCampaignId, setSubmittedCampaignId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedPlacement, setSelectedPlacement] = useState<'feed' | 'story' | 'banner'>('feed');

  // Auto-save draft on changes
  useEffect(() => {
    saveDraft({ ...draft, step: activeStep });
  }, [draft, activeStep]);

  const updateDraft = (fields: Partial<CampaignDraft>) => {
    setDraft((prev) => ({ ...prev, ...fields }));
  };

  const handleStepPress = (targetStep: number) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
    }
    setActiveStep(targetStep);
  };

  // AI Propose helper for Step 1
  const handleAiPropose = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
    }
    updateDraft({
      title: 'Protecting Urban Wetlands from Commercial Rezoning',
      category: 'Environment',
      creatorName: 'Dr. Sarah Al-Mansoor',
      creatorOrg: 'Wetland Ecology Trust',
      shortSummary: 'Amplifying peer-reviewed hydrological assessments to demonstrate how local wetlands absorb 4M gallons of stormwater annually.',
      storyHeadline: 'Before Concrete Covers Our City’s Natural Sponge',
      storyIntro: 'An upcoming city council vote could rezone 45 acres of vital catchment basins. Here is what independent soil scientists found.',
      customAdHeadline: 'Our City’s Natural Flood Sponge is Under Threat',
      customAdDescription: 'See the verified hydrological data on how urban wetlands stop neighborhood flash flooding.',
    });
  };

  // Step 1 Validation & Next
  const handleNextStep1 = () => {
    const errors: Record<string, string> = {};
    if (!draft.title.trim()) {
      errors.title = 'Campaign title is required (max 60 characters).';
    } else if (draft.title.length > 60) {
      errors.title = 'Title must be 60 characters or fewer.';
    }
    if (!draft.creatorName.trim()) {
      errors.creatorName = 'Creator or organization name is required.';
    }
    if (!draft.shortSummary.trim()) {
      errors.shortSummary = 'Please provide a short summary of the message.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    setActiveStep(2);
  };

  // Step 2: Story Section Management
  const addStorySection = () => {
    const newSec = {
      id: 'sec-' + Date.now(),
      title: 'New Section',
      body: '',
    };
    updateDraft({ storySections: [...draft.storySections, newSec] });
  };

  const removeStorySection = (id: string) => {
    updateDraft({ storySections: draft.storySections.filter((s) => s.id !== id) });
  };

  const addSource = () => {
    const newSrc = {
      id: 'src-' + Date.now(),
      title: '',
      url: 'https://',
      publisher: '',
    };
    updateDraft({ supportingSources: [...draft.supportingSources, newSrc] });
  };

  const removeSource = (id: string) => {
    updateDraft({ supportingSources: draft.supportingSources.filter((s) => s.id !== id) });
  };

  // Step 5: Final Submission
  const handleSubmit = async () => {
    if (!draft.termsAccepted || !draft.rulesConfirmed) {
      Alert.alert('Rules Confirmation Required', 'Please confirm adherence to campaign amplification and truth-in-advertising guidelines.');
      return;
    }
    if (!draft.fundingGoal || draft.fundingGoal < 200) {
      Alert.alert('Funding Goal Required', 'Please set a minimum funding goal of at least $200 for digital ad distribution.');
      return;
    }

    setIsSubmitting(true);
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
    }

    try {
      const created = await submitCampaign(draft);
      setIsSubmitting(false);
      setSubmittedCampaignId(created.id);
    } catch (e) {
      setIsSubmitting(false);
      Alert.alert('Submission Error', 'Failed to submit campaign for review.');
    }
  };

  const reachEstimate = calculateReachEstimate(draft.fundingGoal || 3500, draft.channels);

  // POST SUBMISSION CONFIRMATION & TIMELINE
  if (submittedCampaignId) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ padding: Spacing.xl, alignItems: 'center' }}>
        <View style={[styles.successBadge, { backgroundColor: colors.successLight }]}>
          <Ionicons name="shield-checkmark" size={48} color={colors.success} />
        </View>

        <Text style={[styles.successTitle, { color: colors.text }]}>Campaign Submitted for Review!</Text>
        <Text style={[styles.successSub, { color: colors.textMuted }]}>
          Your campaign <Text style={{ fontWeight: '700', color: colors.text }}>"{draft.title}"</Text> has entered the verification queue.
        </Text>

        {/* Status Timeline (Notion Requirement) */}
        <View style={[styles.timelineCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.timelineTitle, { color: colors.text }]}>Campaign Review & Launch Timeline</Text>

          {[
            { step: '1', title: 'Submission Received', desc: 'Campaign details, sources, and ad creatives recorded in escrow.', done: true },
            { step: '2', title: 'Fact-Check & Citation Audit', desc: 'Platform reviewers evaluate supporting sources and claims.', current: true },
            { step: '3', title: 'Creative & Policy Approval', desc: 'Targeting parameters and ad headlines cleared for launch.', done: false },
            { step: '4', title: 'Public Backing Opens', desc: 'Community members can pool funds toward message distribution.', done: false },
            { step: '5', title: 'Ad Amplification Flights', desc: 'Targeted impressions delivered across social feeds and web.', done: false },
          ].map((item, idx) => (
            <View key={item.step} style={styles.timelineRow}>
              <View style={[styles.timelineDot, { backgroundColor: item.done ? colors.success : item.current ? colors.primary : colors.surfaceSubtle }]}>
                {item.done ? (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                ) : (
                  <Text style={{ fontSize: 11, fontWeight: '700', color: item.current ? '#FFFFFF' : colors.textSubtle }}>{item.step}</Text>
                )}
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.md, paddingBottom: idx < 4 ? Spacing.md : 0 }}>
                <Text style={[styles.timelineStepTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.timelineStepDesc, { color: colors.textMuted }]}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <Button
          title="Return to Home Feed"
          onPress={() => {
            setSubmittedCampaignId(null);
            onNavigateHome?.();
          }}
          style={{ width: '100%', marginTop: Spacing.lg }}
        />
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceBorder }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Create Campaign</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>
            Step {activeStep} of 5 · {activeStep === 1 ? 'Basics' : activeStep === 2 ? 'Story' : activeStep === 3 ? 'Visuals & Ads' : activeStep === 4 ? 'Reach' : 'Submit'}
          </Text>
        </View>

        {/* Voice Creation Action */}
        <TouchableOpacity
          onPress={() => setVoiceModalOpen(true)}
          style={[styles.voiceTopBtn, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF' }]}
        >
          <Ionicons name="mic" size={15} color={colors.primary} />
          <Text style={[styles.voiceTopBtnText, { color: colors.primary }]}>Use Voice</Text>
        </TouchableOpacity>
      </View>

      {/* Persistent 5-Step Progress Indicator (Strict Hackathon Requirement) */}
      <View style={[styles.progressTrackContainer, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceBorder }]}>
        {[
          { num: 1, label: 'Basics' },
          { num: 2, label: 'Story' },
          { num: 3, label: 'Visuals' },
          { num: 4, label: 'Reach' },
          { num: 5, label: 'Submit' },
        ].map((s) => {
          const isCurrent = activeStep === s.num;
          const isDone = activeStep > s.num;
          return (
            <TouchableOpacity
              key={s.num}
              onPress={() => handleStepPress(s.num)}
              style={styles.stepTab}
            >
              <View
                style={[
                  styles.stepBadge,
                  {
                    backgroundColor: isCurrent ? colors.primary : isDone ? colors.success : colors.surfaceSubtle,
                  },
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                ) : (
                  <Text style={[styles.stepNumText, { color: isCurrent ? '#FFFFFF' : colors.textSubtle }]}>{s.num}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabelText,
                  { color: isCurrent ? colors.primary : colors.textMuted, fontWeight: isCurrent ? '700' : '500' },
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}
      >
        {/* ================= STEP 1: BASICS ================= */}
        {activeStep === 1 && (
          <View>
            <View style={styles.stepTitleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Step 1: Campaign Basics</Text>
                <Text style={[styles.stepExplainer, { color: colors.textMuted }]}>
                  Describe what your campaign is about and who it should reach.
                </Text>
              </View>
              <TouchableOpacity onPress={handleAiPropose} style={[styles.aiPill, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF' }]}>
                <Ionicons name="sparkles" size={13} color={colors.primary} />
                <Text style={[styles.aiPillText, { color: colors.primary }]}>AI Propose</Text>
              </TouchableOpacity>
            </View>

            {/* Campaign Title (Max 60 chars, counter) */}
            <Input
              label="Campaign Title"
              required
              maxLength={60}
              showCharCount
              placeholder="e.g. Protecting Coastal Mangroves from Commercial Seawalls"
              value={draft.title}
              onChangeText={(text) => updateDraft({ title: text })}
              error={validationErrors.title}
              helperText="The beginning of the title may be used as an advertising headline if a custom headline is not supplied."
            />

            {/* Category Selection */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
              {CATEGORIES.map((cat) => {
                const isSelected = draft.category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => updateDraft({ category: cat })}
                    style={[
                      styles.categoryChoice,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                        borderColor: isSelected ? colors.primary : colors.surfaceBorder,
                      },
                    ]}
                  >
                    <Text style={{ color: isSelected ? '#FFFFFF' : colors.text, fontSize: 12, fontWeight: isSelected ? '700' : '500' }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Creator / Org Name */}
            <Input
              label="Creator or Organization Name"
              required
              placeholder="Your name, nonprofit, or coalition"
              value={draft.creatorName}
              onChangeText={(text) => updateDraft({ creatorName: text })}
              error={validationErrors.creatorName}
            />

            {/* Short Summary */}
            <Input
              label="Short Summary"
              required
              multiline
              numberOfLines={3}
              placeholder="A concise overview of the problem, message, and audience impact..."
              value={draft.shortSummary}
              onChangeText={(text) => updateDraft({ shortSummary: text })}
              error={validationErrors.shortSummary}
            />

            {/* Optional Cover Image */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Cover Image</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
              {PRESET_COVER_IMAGES.map((imgUrl, idx) => {
                const isSelected = draft.coverImage === imgUrl;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => updateDraft({ coverImage: imgUrl })}
                    style={[
                      styles.coverThumbnail,
                      { borderColor: isSelected ? colors.primary : colors.surfaceBorder, borderWidth: isSelected ? 2.5 : 1 },
                    ]}
                  >
                    <Image source={{ uri: imgUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.actionRow}>
              <Button
                title="Continue to Story"
                onPress={handleNextStep1}
                iconRight={<Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />}
              />
            </View>
          </View>
        )}

        {/* ================= STEP 2: STORY ================= */}
        {activeStep === 2 && (
          <View>
            <View style={styles.stepTitleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Step 2: Editorial Story Composer</Text>
                <Text style={[styles.stepExplainer, { color: colors.textMuted }]}>
                  Write an article-style story. Supporting sources must remain visible to audiences.
                </Text>
              </View>
            </View>

            <Input
              label="Story Article Headline"
              placeholder="Main article headline for reader detail view"
              value={draft.storyHeadline}
              onChangeText={(text) => updateDraft({ storyHeadline: text })}
            />

            <Input
              label="Introduction / Abstract"
              multiline
              numberOfLines={3}
              placeholder="Lead paragraph setting the stage..."
              value={draft.storyIntro}
              onChangeText={(text) => updateDraft({ storyIntro: text })}
            />

            {/* Content Sections */}
            <View style={{ marginVertical: Spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm }}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Story Sections ({draft.storySections.length})</Text>
                <TouchableOpacity onPress={addStorySection} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="add-circle" size={16} color={colors.primary} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary, marginLeft: 4 }}>Add Section</Text>
                </TouchableOpacity>
              </View>

              {draft.storySections.map((sec, idx) => (
                <View key={sec.id} style={[styles.sectionEditorCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={[styles.sectionNum, { color: colors.primary }]}>Section {idx + 1}</Text>
                    {draft.storySections.length > 1 && (
                      <TouchableOpacity onPress={() => removeStorySection(sec.id)}>
                        <Ionicons name="trash-outline" size={16} color={colors.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Input
                    placeholder="Section sub-heading"
                    value={sec.title || ''}
                    onChangeText={(val) => {
                      const updated = draft.storySections.map((s) => (s.id === sec.id ? { ...s, title: val } : s));
                      updateDraft({ storySections: updated });
                    }}
                  />
                  <Input
                    placeholder="Section body text..."
                    multiline
                    numberOfLines={4}
                    value={sec.body}
                    onChangeText={(val) => {
                      const updated = draft.storySections.map((s) => (s.id === sec.id ? { ...s, body: val } : s));
                      updateDraft({ storySections: updated });
                    }}
                  />
                </View>
              ))}
            </View>

            {/* Supporting Sources & Evidence (Crucial Hackathon Requirement) */}
            <View style={[styles.sourcesBox, { backgroundColor: colors.surfaceSubtle, borderColor: colors.surfaceBorder }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
                  <Text style={[styles.fieldLabel, { color: colors.text, marginLeft: 6 }]}>
                    Supporting Evidence & Sources *
                  </Text>
                </View>
                <TouchableOpacity onPress={addSource} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="add" size={16} color={colors.primary} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary, marginLeft: 2 }}>Add Source</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: Spacing.sm }}>
                Sources are public on the campaign page so audience members can verify claims.
              </Text>

              {draft.supportingSources.map((source, idx) => (
                <View key={source.id} style={[styles.sourceEditRow, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
                  <View style={{ flex: 1 }}>
                    <Input
                      placeholder="Source Title / Journal Article"
                      value={source.title}
                      onChangeText={(val) => {
                        const updated = draft.supportingSources.map((s) => (s.id === source.id ? { ...s, title: val } : s));
                        updateDraft({ supportingSources: updated });
                      }}
                      containerStyle={{ marginBottom: 4 }}
                    />
                    <Input
                      placeholder="https://..."
                      value={source.url}
                      onChangeText={(val) => {
                        const updated = draft.supportingSources.map((s) => (s.id === source.id ? { ...s, url: val } : s));
                        updateDraft({ supportingSources: updated });
                      }}
                      containerStyle={{ marginBottom: 4 }}
                    />
                    <Input
                      placeholder="Publisher / Research Institution"
                      value={source.publisher}
                      onChangeText={(val) => {
                        const updated = draft.supportingSources.map((s) => (s.id === source.id ? { ...s, publisher: val } : s));
                        updateDraft({ supportingSources: updated });
                      }}
                      containerStyle={{ marginBottom: 0 }}
                    />
                  </View>
                  {draft.supportingSources.length > 1 && (
                    <TouchableOpacity onPress={() => removeSource(source.id)} style={{ padding: 6, marginLeft: 6 }}>
                      <Ionicons name="close-circle" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.navRow}>
              <Button title="Back" variant="outline" onPress={() => setActiveStep(1)} style={{ flex: 1, marginRight: Spacing.sm }} />
              <Button title="Continue to Visuals" onPress={() => setActiveStep(3)} style={{ flex: 2 }} />
            </View>
          </View>
        )}

        {/* ================= STEP 3: CAMPAIGN & AD VISUALS ================= */}
        {activeStep === 3 && (
          <View>
            <View style={styles.stepTitleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Step 3: Campaign & Ad Visuals</Text>
                <Text style={[styles.stepExplainer, { color: colors.textMuted }]}>
                  Separate the editorial story from advertising creative assets.
                </Text>
              </View>
            </View>

            <Input
              label="Custom Ad Headline"
              placeholder="e.g. Why are 18 coastal towns restoring mangroves?"
              value={draft.customAdHeadline}
              onChangeText={(text) => updateDraft({ customAdHeadline: text })}
              helperText="If blank, the beginning of your campaign title will be used."
            />

            <Input
              label="Custom Ad Description / Body"
              placeholder="Short punchy ad copy for social feed cards..."
              multiline
              numberOfLines={2}
              value={draft.customAdDescription}
              onChangeText={(text) => updateDraft({ customAdDescription: text })}
            />

            {/* Placement Switcher & Live Ad Preview */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Interactive Advertising Placement Previews
            </Text>
            <View style={styles.placementTabs}>
              {(['feed', 'story', 'banner'] as const).map((fmt) => {
                const active = selectedPlacement === fmt;
                return (
                  <TouchableOpacity
                    key={fmt}
                    onPress={() => setSelectedPlacement(fmt)}
                    style={[
                      styles.placementTab,
                      {
                        backgroundColor: active ? colors.primary : colors.surfaceSubtle,
                        borderColor: active ? colors.primary : colors.surfaceBorder,
                      },
                    ]}
                  >
                    <Text style={{ color: active ? '#FFFFFF' : colors.text, fontSize: 12, fontWeight: active ? '700' : '500', textTransform: 'capitalize' }}>
                      {fmt === 'feed' ? 'Social Feed' : fmt === 'story' ? '9:16 Vertical' : 'Web Banner'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Visual Placement Preview Box */}
            <View style={[styles.adPreviewContainer, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              {selectedPlacement === 'feed' && (
                <View style={styles.feedPreview}>
                  <View style={styles.adSponsorHeader}>
                    <View style={[styles.adAvatar, { backgroundColor: colors.primary }]}>
                      <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>AD</Text>
                    </View>
                    <View style={{ marginLeft: 6 }}>
                      <Text style={[styles.adSponsorName, { color: colors.text }]}>{draft.creatorName || 'Campaign Sponsor'}</Text>
                      <Text style={[styles.adSponsoredTag, { color: colors.textSubtle }]}>Sponsored · Community Amplified</Text>
                    </View>
                  </View>
                  <Text style={[styles.adCopyText, { color: colors.text }]}>
                    {draft.customAdDescription || draft.shortSummary || 'Discover how community-funded ads spread verified research.'}
                  </Text>
                  <Image source={{ uri: draft.coverImage }} style={styles.feedImage} resizeMode="cover" />
                  <View style={[styles.adBottomBar, { backgroundColor: colors.surfaceSubtle }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.adHeadlinePreview, { color: colors.text }]} numberOfLines={1}>
                        {draft.customAdHeadline || draft.title || 'Campaign Title'}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textMuted }}>fact-checked.org</Text>
                    </View>
                    <View style={[styles.ctaPreviewBtn, { backgroundColor: colors.primary }]}>
                      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>{draft.ctaText || 'Learn More'}</Text>
                    </View>
                  </View>
                </View>
              )}

              {selectedPlacement === 'story' && (
                <View style={styles.storyPreview}>
                  <Image source={{ uri: draft.coverImage }} style={styles.storyImage} resizeMode="cover" />
                  <View style={styles.storyOverlay}>
                    <Text style={styles.storyHeadlineText}>{draft.customAdHeadline || draft.title}</Text>
                    <View style={[styles.ctaPreviewBtn, { backgroundColor: colors.primary, marginTop: 8 }]}>
                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>Swipe Up / Learn More</Text>
                    </View>
                  </View>
                </View>
              )}

              {selectedPlacement === 'banner' && (
                <View style={styles.bannerPreview}>
                  <Image source={{ uri: draft.coverImage }} style={{ width: 80, height: 60, borderRadius: 6 }} resizeMode="cover" />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[styles.adHeadlinePreview, { color: colors.text }]} numberOfLines={2}>
                      {draft.customAdHeadline || draft.title}
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.textSubtle }}>Sponsored by Community Backers</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.navRow}>
              <Button title="Back" variant="outline" onPress={() => setActiveStep(2)} style={{ flex: 1, marginRight: Spacing.sm }} />
              <Button title="Continue to Reach" onPress={() => setActiveStep(4)} style={{ flex: 2 }} />
            </View>
          </View>
        )}

        {/* ================= STEP 4: REACH ================= */}
        {activeStep === 4 && (
          <View>
            <View style={styles.stepTitleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Step 4: Reach & Distribution</Text>
                <Text style={[styles.stepExplainer, { color: colors.textMuted }]}>
                  Specify geographic locations, channels, and duration.
                </Text>
              </View>
            </View>

            {/* Target Locations */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Target Geographic Locations</Text>
            <View style={styles.tagWrap}>
              {['National (US)', 'Midwest States', 'Coastal Counties', 'Metro Areas', 'European Union'].map((geo) => {
                const isSelected = draft.targetLocations.includes(geo);
                return (
                  <TouchableOpacity
                    key={geo}
                    onPress={() => {
                      const updated = isSelected
                        ? draft.targetLocations.filter((g) => g !== geo)
                        : [...draft.targetLocations, geo];
                      updateDraft({ targetLocations: updated.length ? updated : ['National (US)'] });
                    }}
                    style={[
                      styles.geoChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                        borderColor: isSelected ? colors.primary : colors.surfaceBorder,
                      },
                    ]}
                  >
                    <Text style={{ color: isSelected ? '#FFFFFF' : colors.text, fontSize: 12, fontWeight: '600' }}>
                      {geo}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Channels Switchers */}
            <View style={[styles.channelsCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              <Text style={[styles.fieldLabel, { color: colors.text, marginBottom: Spacing.sm }]}>
                Distribution Channels
              </Text>

              {[
                { key: 'meta', label: 'Meta (Instagram & Facebook Newsfeed)', icon: 'logo-instagram' },
                { key: 'google', label: 'Google Search & YouTube Pre-roll', icon: 'logo-youtube' },
                { key: 'x', label: 'X (Twitter) Feed Amplification', icon: 'logo-twitter' },
                { key: 'webDisplay', label: 'Independent News & Web Display', icon: 'globe-outline' },
              ].map((ch) => (
                <View key={ch.key} style={styles.channelRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons name={ch.icon as any} size={18} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={[styles.channelLabel, { color: colors.text }]}>{ch.label}</Text>
                  </View>
                  <Switch
                    value={(draft.channels as any)[ch.key]}
                    onValueChange={(val) => {
                      updateDraft({
                        channels: {
                          ...draft.channels,
                          [ch.key]: val,
                        },
                      });
                    }}
                    trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
                  />
                </View>
              ))}
            </View>

            {/* Duration */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Campaign Duration: {draft.durationDays} Days
            </Text>
            <View style={styles.durationRow}>
              {[7, 14, 21, 30, 45].map((d) => {
                const isSelected = draft.durationDays === d;
                return (
                  <TouchableOpacity
                    key={d}
                    onPress={() => updateDraft({ durationDays: d })}
                    style={[
                      styles.durationChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                        borderColor: isSelected ? colors.primary : colors.surfaceBorder,
                      },
                    ]}
                  >
                    <Text style={{ color: isSelected ? '#FFFFFF' : colors.text, fontSize: 13, fontWeight: '700' }}>
                      {d}d
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Review Finalization Note */}
            <View style={[styles.noteBox, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FFFBEB', borderColor: colors.warning }]}>
              <Ionicons name="information-circle-outline" size={16} color={colors.warning} />
              <Text style={[styles.noteText, { color: isDark ? '#FBBF24' : '#92400E' }]}>
                Note: Distribution settings represent creator preferences. The platform review team may adjust bids or inventory pacing to maximize verified audience reach.
              </Text>
            </View>

            <View style={styles.navRow}>
              <Button title="Back" variant="outline" onPress={() => setActiveStep(3)} style={{ flex: 1, marginRight: Spacing.sm }} />
              <Button title="Continue to Review & Submit" onPress={() => setActiveStep(5)} style={{ flex: 2 }} />
            </View>
          </View>
        )}

        {/* ================= STEP 5: SUBMIT ================= */}
        {activeStep === 5 && (
          <View>
            <View style={styles.stepTitleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Step 5: Review & Submit</Text>
                <Text style={[styles.stepExplainer, { color: colors.textMuted }]}>
                  Set your funding goal, verify campaign policies, and submit for platform review.
                </Text>
              </View>
            </View>

            {/* Creator Sets Funding Goal Here (Explicit Notion Requirement) */}
            <View style={[styles.goalBox, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              <Text style={[styles.goalHeader, { color: colors.text }]}>
                Set Target Funding Goal *
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: Spacing.sm }}>
                Must be set manually by creator. Determines the size of the initial advertising flight.
              </Text>

              <View style={styles.goalPresets}>
                {[1500, 2500, 3500, 5000, 10000].map((amt) => {
                  const isSelected = draft.fundingGoal === amt;
                  return (
                    <TouchableOpacity
                      key={amt}
                      onPress={() => updateDraft({ fundingGoal: amt })}
                      style={[
                        styles.goalPresetChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                          borderColor: isSelected ? colors.primary : colors.surfaceBorder,
                        },
                      ]}
                    >
                      <Text style={{ color: isSelected ? '#FFFFFF' : colors.text, fontWeight: '700', fontSize: 13 }}>
                        ${amt.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Dynamic Reach Preview at this Goal */}
              <View style={[styles.reachHighlightBox, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#EEF2FF' }]}>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>Estimated Target Reach at Goal:</Text>
                <Text style={{ fontSize: 20, fontWeight: '800', color: colors.primary, marginTop: 2 }}>
                  {reachEstimate.formattedRange}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textSubtle, marginTop: 2 }}>
                  ~{reachEstimate.expectedImpressions.toLocaleString()} ad impressions across {draft.targetLocations.join(', ')}
                </Text>
              </View>
            </View>

            {/* Campaign Summary Review Card */}
            <View style={[styles.reviewSummaryCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              <Text style={[styles.fieldLabel, { color: colors.text, marginBottom: 8 }]}>Submission Summary</Text>
              <View style={styles.reviewItem}>
                <Text style={[styles.revKey, { color: colors.textMuted }]}>Title:</Text>
                <Text style={[styles.revVal, { color: colors.text }]}>{draft.title}</Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={[styles.revKey, { color: colors.textMuted }]}>Category:</Text>
                <Text style={[styles.revVal, { color: colors.primary }]}>{draft.category}</Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={[styles.revKey, { color: colors.textMuted }]}>Creator:</Text>
                <Text style={[styles.revVal, { color: colors.text }]}>{draft.creatorName}</Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={[styles.revKey, { color: colors.textMuted }]}>Sources Attached:</Text>
                <Text style={[styles.revVal, { color: colors.success }]}>{draft.supportingSources.length} verified sources</Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={[styles.revKey, { color: colors.textMuted }]}>Duration:</Text>
                <Text style={[styles.revVal, { color: colors.text }]}>{draft.durationDays} days</Text>
              </View>
            </View>

            {/* Rules & Confirmation Checkboxes */}
            <View style={styles.rulesContainer}>
              <TouchableOpacity
                onPress={() => updateDraft({ termsAccepted: !draft.termsAccepted })}
                style={styles.ruleCheckboxRow}
              >
                <Ionicons
                  name={draft.termsAccepted ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={draft.termsAccepted ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.ruleText, { color: colors.text }]}>
                  I confirm all supporting sources represent legitimate research and factual evidence.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => updateDraft({ rulesConfirmed: !draft.rulesConfirmed })}
                style={styles.ruleCheckboxRow}
              >
                <Ionicons
                  name={draft.rulesConfirmed ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={draft.rulesConfirmed ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.ruleText, { color: colors.text }]}>
                  I acknowledge that contributions fund message amplification ads, not direct charitable donations.
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.navRow}>
              <Button title="Back" variant="outline" onPress={() => setActiveStep(4)} style={{ flex: 1, marginRight: Spacing.sm }} />
              <Button
                title="Submit for Review"
                loading={isSubmitting}
                onPress={handleSubmit}
                style={{ flex: 2 }}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Voice Assistant Modal */}
      <VoiceCreateModal
        visible={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onDraftGenerated={(fields) => {
          updateDraft(fields);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  voiceTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  voiceTopBtnText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  progressTrackContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    justifyContent: 'space-between',
  },
  stepTab: {
    alignItems: 'center',
    flex: 1,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stepLabelText: {
    fontSize: 11,
  },
  scroll: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  stepExplainer: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  aiPillText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  categoryChoice: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: 6,
  },
  coverThumbnail: {
    width: 80,
    height: 60,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginRight: 8,
  },
  actionRow: {
    marginTop: Spacing.lg,
  },
  navRow: {
    flexDirection: 'row',
    marginTop: Spacing.xl,
  },
  sectionEditorCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  sectionNum: {
    fontSize: 12,
    fontWeight: '700',
  },
  sourcesBox: {
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  sourceEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  placementTabs: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  placementTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    marginRight: 6,
  },
  adPreviewContainer: {
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  feedPreview: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  adSponsorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  adAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adSponsorName: {
    fontSize: 12,
    fontWeight: '700',
  },
  adSponsoredTag: {
    fontSize: 10,
  },
  adCopyText: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  feedImage: {
    width: '100%',
    height: 160,
    borderRadius: Radius.md,
  },
  adBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    marginTop: 4,
    borderRadius: Radius.md,
  },
  adHeadlinePreview: {
    fontSize: 13,
    fontWeight: '700',
  },
  ctaPreviewBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  storyPreview: {
    height: 220,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  storyImage: {
    ...StyleSheet.absoluteFill,
  },
  storyOverlay: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: Spacing.md,
    alignItems: 'center',
  },
  storyHeadlineText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  bannerPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  geoChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  channelsCard: {
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  channelLabel: {
    fontSize: 13,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  durationChip: {
    flex: 1,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginHorizontal: 3,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  noteText: {
    fontSize: 11,
    lineHeight: 16,
    marginLeft: 6,
    flex: 1,
  },
  goalBox: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  goalHeader: {
    fontSize: 15,
    fontWeight: '700',
  },
  goalPresets: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  goalPresetChip: {
    flex: 1,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginHorizontal: 2,
  },
  reachHighlightBox: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  reviewSummaryCard: {
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  revKey: {
    fontSize: 12,
  },
  revVal: {
    fontSize: 12,
    fontWeight: '600',
  },
  rulesContainer: {
    marginBottom: Spacing.md,
  },
  ruleCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  ruleText: {
    fontSize: 12,
    lineHeight: 17,
    marginLeft: 8,
    flex: 1,
  },
  successBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.lg,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  successSub: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  timelineCard: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineStepTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  timelineStepDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
});

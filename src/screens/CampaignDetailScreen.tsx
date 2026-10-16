import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Share,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Campaign } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useCampaigns } from '../context/CampaignContext';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Button } from '../components/common/Button';
import { ContributionModal } from '../components/backing/ContributionModal';
import { Radius, Shadows, Spacing } from '../theme';
import { formatCompactNumber, formatCurrency } from '../utils/reachCalculator';

interface CampaignDetailScreenProps {
  campaign: Campaign;
  onBack: () => void;
}

export const CampaignDetailScreen: React.FC<CampaignDetailScreenProps> = ({
  campaign,
  onBack,
}) => {
  const { colors, isDark } = useTheme();
  const {
    savedCampaignIds,
    toggleSaveCampaign,
    recordReaderFeedback,
    addComment,
  } = useCampaigns();

  const [contributionModalVisible, setContributionModalVisible] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('review_process');
  const [newCommentText, setNewCommentText] = useState('');
  const [userVotedEncouraged, setUserVotedEncouraged] = useState<string | null>(null);
  const [userVotedChangedMind, setUserVotedChangedMind] = useState<string | null>(null);

  const isSaved = savedCampaignIds.includes(campaign.id);
  const progressRatio = campaign.fundingGoal > 0 ? campaign.amountRaised / campaign.fundingGoal : 0;
  const progressPercent = Math.round(progressRatio * 100);

  const handleShare = async () => {
    try {
      await Share.share({
        title: campaign.title,
        message: `Read and help amplify "${campaign.title}" to reach people who need to see it: https://campaign-one-pearl.vercel.app/campaign/${campaign.id}`,
      });
    } catch (_) {}
  };

  const handleVoteFeedback = (type: 'encouragedToRead' | 'changedMind', choice: 'yes' | 'somewhat' | 'no') => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
    }
    if (type === 'encouragedToRead') {
      setUserVotedEncouraged(choice);
    } else {
      setUserVotedChangedMind(choice);
    }
    recordReaderFeedback(campaign.id, type, choice);
  };

  const handlePostComment = () => {
    if (!newCommentText.trim()) return;
    addComment(campaign.id, newCommentText.trim());
    setNewCommentText('');
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
    }
  };

  const toggleAccordion = (key: string) => {
    setExpandedSection(expandedSection === key ? null : key);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sticky Top Navigation Bar */}
      <View style={[styles.navBar, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceBorder }]}>
        <TouchableOpacity onPress={onBack} style={styles.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.text }]} numberOfLines={1}>
          {campaign.title}
        </Text>
        <View style={styles.navRight}>
          <TouchableOpacity onPress={() => toggleSaveCampaign(campaign.id)} style={styles.navIconBtn}>
            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={isSaved ? colors.primary : colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.navIconBtn}>
            <Ionicons name="share-social-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Cover Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: campaign.coverImage }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlay}>
            <Badge category={campaign.category} />
            <Badge status={campaign.status} />
          </View>
        </View>

        <View style={styles.mainContent}>
          {/* Campaign Title & Meta */}
          <Text style={[styles.title, { color: colors.text }]}>{campaign.title}</Text>

          {/* Creator Profile Header */}
          <View style={[styles.creatorCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Image
              source={{ uri: campaign.creatorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80' }}
              style={styles.creatorAvatar}
            />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.creatorName, { color: colors.text }]}>{campaign.creatorName}</Text>
                {campaign.isVerifiedCreator && (
                  <Ionicons name="checkmark-circle" size={15} color={colors.primary} style={{ marginLeft: 4 }} />
                )}
              </View>
              {campaign.creatorOrg && (
                <Text style={[styles.creatorOrg, { color: colors.textMuted }]}>{campaign.creatorOrg}</Text>
              )}
              {campaign.creatorBio && (
                <Text style={[styles.creatorBio, { color: colors.textSubtle }]} numberOfLines={2}>
                  {campaign.creatorBio}
                </Text>
              )}
            </View>
          </View>

          {/* Funding & Reach Progress Box */}
          <View style={[styles.fundingCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder, ...Shadows.sm }]}>
            <View style={styles.fundingTopRow}>
              <View>
                <Text style={[styles.fundingRaised, { color: colors.text }]}>
                  {formatCurrency(campaign.amountRaised)}
                </Text>
                <Text style={[styles.fundingGoalText, { color: colors.textMuted }]}>
                  raised of {formatCurrency(campaign.fundingGoal)} goal
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.fundingPercent, { color: colors.primary }]}>{progressPercent}%</Text>
                <Text style={[styles.backersLabel, { color: colors.textMuted }]}>{campaign.backersCount} backers</Text>
              </View>
            </View>

            <ProgressBar progress={progressRatio} height={8} style={{ marginVertical: 10 }} />

            {/* Reach Projection Banner */}
            <View style={[styles.reachBar, { backgroundColor: colors.surfaceSubtle }]}>
              <Ionicons name="megaphone-outline" size={18} color={colors.primary} />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={[styles.reachBarTitle, { color: colors.text }]}>
                  Estimated Audience Reach
                </Text>
                <Text style={[styles.reachBarNumbers, { color: colors.primary }]}>
                  {formatCompactNumber(campaign.distribution.estimatedReachMin)} - {formatCompactNumber(campaign.distribution.estimatedReachMax)} targeted people
                </Text>
              </View>
            </View>
          </View>

          {/* Editorial Story */}
          <View style={styles.editorialSection}>
            <Text style={[styles.storyHeadline, { color: colors.text }]}>
              {campaign.storyHeadline || campaign.title}
            </Text>
            <Text style={[styles.storyIntro, { color: colors.textMuted }]}>
              {campaign.storyIntro || campaign.shortSummary}
            </Text>

            {/* Story Sections */}
            {campaign.storySections.map((sec, idx) => (
              <View key={sec.id || idx} style={styles.storyBlock}>
                {sec.title && (
                  <Text style={[styles.sectionHeading, { color: colors.text }]}>
                    {sec.title}
                  </Text>
                )}
                <Text style={[styles.sectionBody, { color: colors.text }]}>
                  {sec.body}
                </Text>

                {sec.calloutStat && (
                  <View style={[styles.statCallout, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.12)' : '#EEF2FF', borderColor: colors.primary }]}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                      {sec.calloutStat.value}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.text }]}>
                      {sec.calloutStat.label}
                    </Text>
                  </View>
                )}

                {sec.imageUrl && (
                  <View style={styles.inlineImageContainer}>
                    <Image source={{ uri: sec.imageUrl }} style={styles.inlineImage} resizeMode="cover" />
                    {sec.imageCaption && (
                      <Text style={[styles.imageCaption, { color: colors.textMuted }]}>
                        {sec.imageCaption}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* CRITICAL REQUIREMENT: Supporting Evidence & Sources (Visible to Audience!) */}
          <View style={[styles.sourcesContainer, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <View style={styles.sourcesHeader}>
              <Ionicons name="document-text-outline" size={18} color={colors.primary} />
              <Text style={[styles.sourcesTitle, { color: colors.text }]}>
                Supporting Evidence & Sources
              </Text>
            </View>
            <Text style={[styles.sourcesExplainer, { color: colors.textMuted }]}>
              Every campaign undergoes source fact-checking before approval. Backers and audiences can verify cited evidence directly:
            </Text>

            {campaign.supportingSources.map((source, index) => (
              <TouchableOpacity
                key={source.id || index}
                onPress={() => Linking.openURL(source.url).catch(() => {})}
                style={[styles.sourceItem, { borderBottomColor: colors.surfaceBorder }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sourceTitle, { color: colors.primary }]}>
                    {source.title} <Ionicons name="open-outline" size={12} color={colors.primary} />
                  </Text>
                  <Text style={[styles.sourcePublisher, { color: colors.textMuted }]}>
                    {source.publisher} {source.publishedDate ? `· ${source.publishedDate}` : ''}
                  </Text>
                  {source.keyFinding && (
                    <Text style={[styles.sourceKeyFinding, { color: colors.textSubtle }]}>
                      Finding: "{source.keyFinding}"
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Distribution Report (if promoting or completed) */}
          {campaign.distributionReport && (
            <View style={[styles.reportContainer, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              <View style={styles.reportHeader}>
                <Ionicons name="bar-chart-outline" size={20} color={colors.accent} />
                <Text style={[styles.reportTitle, { color: colors.text }]}>
                  Verified Distribution Audit Report
                </Text>
              </View>
              <Text style={[styles.reportSubtitle, { color: colors.textMuted }]}>
                Transparent metrics showing real ad impressions delivered with pooled funds:
              </Text>

              <View style={styles.reportMetricsGrid}>
                <View style={[styles.reportMetricBox, { backgroundColor: colors.surfaceSubtle }]}>
                  <Text style={[styles.repMetricLabel, { color: colors.textMuted }]}>Ad Impressions</Text>
                  <Text style={[styles.repMetricVal, { color: colors.text }]}>
                    {campaign.distributionReport.impressionsDelivered.toLocaleString()}
                  </Text>
                </View>
                <View style={[styles.reportMetricBox, { backgroundColor: colors.surfaceSubtle }]}>
                  <Text style={[styles.repMetricLabel, { color: colors.textMuted }]}>Verified Reach</Text>
                  <Text style={[styles.repMetricVal, { color: colors.accent }]}>
                    {campaign.distributionReport.verifiedReach.toLocaleString()}
                  </Text>
                </View>
                <View style={[styles.reportMetricBox, { backgroundColor: colors.surfaceSubtle }]}>
                  <Text style={[styles.repMetricLabel, { color: colors.textMuted }]}>Ad Spend</Text>
                  <Text style={[styles.repMetricVal, { color: colors.success }]}>
                    {formatCurrency(campaign.distributionReport.adSpend)}
                  </Text>
                </View>
                <View style={[styles.reportMetricBox, { backgroundColor: colors.surfaceSubtle }]}>
                  <Text style={[styles.repMetricLabel, { color: colors.textMuted }]}>Clicks Generated</Text>
                  <Text style={[styles.repMetricVal, { color: colors.primary }]}>
                    {campaign.distributionReport.clicksGenerated.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Review, Trust & Feedback Accordions */}
          <View style={styles.accordionContainer}>
            <Text style={[styles.trustHeading, { color: colors.text }]}>
              Review, Trust & Transparency
            </Text>

            {/* Accordion 1: Review Process */}
            <View style={[styles.accordionItem, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              <TouchableOpacity onPress={() => toggleAccordion('review_process')} style={styles.accordionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
                  <Text style={[styles.accordionTitle, { color: colors.text }]}>
                    The Platform Review Process
                  </Text>
                </View>
                <Ionicons name={expandedSection === 'review_process' ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
              </TouchableOpacity>
              {expandedSection === 'review_process' && (
                <View style={styles.accordionBody}>
                  <Text style={[styles.accordionText, { color: colors.textMuted }]}>
                    All campaigns undergo manual and automated review prior to launch. Reviewers audit claims against peer-reviewed citations, evaluate creative honesty, verify targeted geographic parameters, and ensure full adherence to political and public advocacy transparency regulations.
                  </Text>
                </View>
              )}
            </View>

            {/* Accordion 2: Distribution Partners & Targeting */}
            <View style={[styles.accordionItem, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              <TouchableOpacity onPress={() => toggleAccordion('partners')} style={styles.accordionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="globe-outline" size={18} color={colors.accent} />
                  <Text style={[styles.accordionTitle, { color: colors.text }]}>
                    Audience Targeting & Distribution Partners
                  </Text>
                </View>
                <Ionicons name={expandedSection === 'partners' ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
              </TouchableOpacity>
              {expandedSection === 'partners' && (
                <View style={styles.accordionBody}>
                  <Text style={[styles.accordionText, { color: colors.textMuted }]}>
                    Distribution channels: Meta Newsfeed, Google Display Network, YouTube pre-roll, and independent local publications. Targeting focuses on key demographic regions ({campaign.distribution.targetLocations.join(', ')}) interested in {campaign.distribution.audienceInterests.join(', ')}.
                  </Text>
                </View>
              )}
            </View>

            {/* Accordion 3: Treatment of Funds */}
            <View style={[styles.accordionItem, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              <TouchableOpacity onPress={() => toggleAccordion('funds')} style={styles.accordionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="wallet-outline" size={18} color={colors.success} />
                  <Text style={[styles.accordionTitle, { color: colors.text }]}>
                    Treatment of Unspent Funds & Refunds
                  </Text>
                </View>
                <Ionicons name={expandedSection === 'funds' ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
              </TouchableOpacity>
              {expandedSection === 'funds' && (
                <View style={styles.accordionBody}>
                  <Text style={[styles.accordionText, { color: colors.textMuted }]}>
                    This is NOT a charitable donation. Contributions are held in escrow for wholesale digital ad inventory purchase. If a flight underperforms or unspent surplus remains upon campaign completion, funds are credited or returned pursuant to our refund policy.
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Reader Feedback Poll (Notion requirement) */}
          <View style={[styles.feedbackPollCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Text style={[styles.pollHeader, { color: colors.text }]}>
              Reader Impact Survey
            </Text>
            <Text style={[styles.pollSubtitle, { color: colors.textMuted }]}>
              Anonymous feedback helps measure whether message visuals and facts resonate:
            </Text>

            {/* Question 1 */}
            <View style={styles.pollQuestionBlock}>
              <Text style={[styles.pollQuestion, { color: colors.text }]}>
                1. Did the visuals encourage you to read the full story?
              </Text>
              <View style={styles.pollOptionsRow}>
                {(['yes', 'somewhat', 'no'] as const).map((opt) => {
                  const isSelected = userVotedEncouraged === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => handleVoteFeedback('encouragedToRead', opt)}
                      style={[
                        styles.pollButton,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                          borderColor: isSelected ? colors.primary : colors.surfaceBorder,
                        },
                      ]}
                    >
                      <Text style={[styles.pollBtnText, { color: isSelected ? '#FFFFFF' : colors.text, textTransform: 'capitalize' }]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Question 2 */}
            <View style={styles.pollQuestionBlock}>
              <Text style={[styles.pollQuestion, { color: colors.text }]}>
                2. Did this message change your perspective or increase concern?
              </Text>
              <View style={styles.pollOptionsRow}>
                {(['yes', 'somewhat', 'no'] as const).map((opt) => {
                  const isSelected = userVotedChangedMind === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => handleVoteFeedback('changedMind', opt)}
                      style={[
                        styles.pollButton,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                          borderColor: isSelected ? colors.primary : colors.surfaceBorder,
                        },
                      ]}
                    >
                      <Text style={[styles.pollBtnText, { color: isSelected ? '#FFFFFF' : colors.text, textTransform: 'capitalize' }]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Discussion & Community Comments */}
          <View style={[styles.commentsSection, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <View style={styles.commentsHeader}>
              <Ionicons name="chatbubbles-outline" size={18} color={colors.primary} />
              <Text style={[styles.commentsTitle, { color: colors.text }]}>
                Backer & Community Discussion ({campaign.comments.length})
              </Text>
            </View>

            {/* Comment input */}
            <View style={styles.commentInputRow}>
              <TextInput
                placeholder="Share perspective or question for the creator..."
                placeholderTextColor={colors.textSubtle}
                value={newCommentText}
                onChangeText={setNewCommentText}
                style={[styles.commentInput, { color: colors.text, backgroundColor: colors.surfaceSubtle, borderColor: colors.surfaceBorder }]}
              />
              <Button
                title="Post"
                size="sm"
                onPress={handlePostComment}
                style={{ marginLeft: 8 }}
              />
            </View>

            {campaign.comments.map((comm) => (
              <View key={comm.id} style={[styles.commentItem, { borderBottomColor: colors.surfaceBorder }]}>
                <View style={styles.commentTopRow}>
                  <Text style={[styles.commentAuthor, { color: colors.text }]}>{comm.authorName}</Text>
                  {comm.isBacker && (
                    <Badge label={`Backer · $${comm.backedAmount || 25}`} variant="success" size="sm" style={{ marginLeft: 6 }} />
                  )}
                  <Text style={[styles.commentTime, { color: colors.textSubtle }]}>{comm.timestamp}</Text>
                </View>
                <Text style={[styles.commentText, { color: colors.textMuted }]}>{comm.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.stickyBottom, { backgroundColor: colors.surface, borderTopColor: colors.surfaceBorder, ...Shadows.lg }]}>
        <View style={styles.stickyCol}>
          <Text style={[styles.stickyGoal, { color: colors.textMuted }]}>
            {progressPercent}% of {formatCurrency(campaign.fundingGoal)}
          </Text>
          <Text style={[styles.stickyReach, { color: colors.primary }]}>
            ~{formatCompactNumber(campaign.distribution.estimatedReachMin)} reach
          </Text>
        </View>
        <Button
          title="Back This Campaign"
          icon={<Ionicons name="flash" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />}
          onPress={() => setContributionModalVisible(true)}
          style={{ flex: 1, marginLeft: Spacing.md }}
        />
      </View>

      {/* Contribution Modal */}
      <ContributionModal
        visible={contributionModalVisible}
        campaign={campaign}
        onClose={() => setContributionModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  navBtn: {
    padding: Spacing.xs,
  },
  navTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    marginHorizontal: Spacing.sm,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navIconBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  heroContainer: {
    height: 230,
    width: '100%',
    position: 'relative',
    backgroundColor: '#94A3B8',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mainContent: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    letterSpacing: -0.4,
    marginBottom: Spacing.md,
  },
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  creatorOrg: {
    fontSize: 12,
  },
  creatorBio: {
    fontSize: 11,
    marginTop: 2,
  },
  fundingCard: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  fundingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  fundingRaised: {
    fontSize: 22,
    fontWeight: '800',
  },
  fundingGoalText: {
    fontSize: 12,
  },
  fundingPercent: {
    fontSize: 18,
    fontWeight: '800',
  },
  backersLabel: {
    fontSize: 12,
  },
  reachBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.xs,
  },
  reachBarTitle: {
    fontSize: 11,
    fontWeight: '600',
  },
  reachBarNumbers: {
    fontSize: 13,
    fontWeight: '700',
  },
  editorialSection: {
    marginBottom: Spacing.xl,
  },
  storyHeadline: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: Spacing.sm,
  },
  storyIntro: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  storyBlock: {
    marginBottom: Spacing.lg,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  statCallout: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginVertical: Spacing.md,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  inlineImageContainer: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginVertical: Spacing.md,
  },
  inlineImage: {
    width: '100%',
    height: 180,
  },
  imageCaption: {
    fontSize: 11,
    fontStyle: 'italic',
    padding: 6,
    textAlign: 'center',
  },
  sourcesContainer: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  sourcesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sourcesTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  sourcesExplainer: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: Spacing.md,
  },
  sourceItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  sourceTitle: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  sourcePublisher: {
    fontSize: 11,
    marginTop: 2,
  },
  sourceKeyFinding: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  reportContainer: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  reportSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.md,
  },
  reportMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reportMetricBox: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
  },
  repMetricLabel: {
    fontSize: 11,
  },
  repMetricVal: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  accordionContainer: {
    marginBottom: Spacing.xl,
  },
  trustHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  accordionItem: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  accordionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  accordionBody: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  accordionText: {
    fontSize: 12,
    lineHeight: 18,
  },
  feedbackPollCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  pollHeader: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  pollSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.md,
  },
  pollQuestionBlock: {
    marginBottom: Spacing.md,
  },
  pollQuestion: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  pollOptionsRow: {
    flexDirection: 'row',
  },
  pollButton: {
    flex: 1,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    borderWidth: 1,
  },
  pollBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  commentsSection: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  commentsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  commentInput: {
    flex: 1,
    height: 38,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 13,
    borderWidth: 1,
  },
  commentItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  commentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '700',
  },
  commentTime: {
    fontSize: 10,
    marginLeft: 'auto',
  },
  commentText: {
    fontSize: 12,
    lineHeight: 16,
  },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
  },
  stickyCol: {
    justifyContent: 'center',
  },
  stickyGoal: {
    fontSize: 11,
  },
  stickyReach: {
    fontSize: 14,
    fontWeight: '700',
  },
});


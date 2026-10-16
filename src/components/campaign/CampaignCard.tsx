import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Campaign } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useCampaigns } from '../../context/CampaignContext';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Radius, Shadows, Spacing } from '../../theme';
import { formatCompactNumber, formatCurrency } from '../../utils/reachCalculator';

interface CampaignCardProps {
  campaign: Campaign;
  onPress: () => void;
  onBackPress?: () => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onPress,
  onBackPress,
}) => {
  const { colors, isDark } = useTheme();
  const { savedCampaignIds, toggleSaveCampaign } = useCampaigns();

  const isSaved = savedCampaignIds.includes(campaign.id);
  const progressRatio = campaign.fundingGoal > 0 ? campaign.amountRaised / campaign.fundingGoal : 0;
  const progressPercent = Math.round(progressRatio * 100);

  const handleBookmark = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
    }
    toggleSaveCampaign(campaign.id);
  };

  const handleBackAction = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (_) {}
    }
    if (onBackPress) {
      onBackPress();
    } else {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.surfaceBorder,
          ...Shadows.md,
        },
      ]}
    >
      {/* Cover Image & Overlays */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: campaign.coverImage }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <View style={styles.topOverlay}>
          <Badge category={campaign.category} size="sm" />
          <TouchableOpacity
            style={[
              styles.bookmarkButton,
              {
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.9)',
              },
            ]}
            onPress={handleBookmark}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isSaved ? colors.primary : colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Status Pill on bottom of image */}
        <View style={styles.statusOverlay}>
          <Badge status={campaign.status} size="sm" />
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {/* Creator Info */}
        <View style={styles.creatorRow}>
          <Text style={[styles.creatorText, { color: colors.textMuted }]} numberOfLines={1}>
            By <Text style={{ fontWeight: '600', color: colors.text }}>{campaign.creatorName}</Text>
            {campaign.creatorOrg ? ` · ${campaign.creatorOrg}` : ''}
          </Text>
          {campaign.isVerifiedCreator && (
            <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
          )}
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {campaign.title}
        </Text>

        {/* Summary */}
        <Text style={[styles.summary, { color: colors.textMuted }]} numberOfLines={2}>
          {campaign.shortSummary}
        </Text>

        {/* Funding & Reach Progress Box */}
        <View style={[styles.metricsBox, { backgroundColor: colors.surfaceSubtle }]}>
          <View style={styles.metricsTopRow}>
            <View>
              <Text style={[styles.metricMain, { color: colors.text }]}>
                {formatCurrency(campaign.amountRaised)}
                <Text style={[styles.metricSub, { color: colors.textMuted }]}>
                  {' '}raised of {formatCurrency(campaign.fundingGoal)}
                </Text>
              </Text>
            </View>
            <Text style={[styles.percentText, { color: colors.primary }]}>
              {progressPercent}%
            </Text>
          </View>

          <ProgressBar progress={progressRatio} height={6} style={{ marginVertical: 6 }} />

          <View style={styles.metricsBottomRow}>
            <View style={styles.reachPill}>
              <Ionicons name="megaphone-outline" size={13} color={colors.primary} />
              <Text style={[styles.reachText, { color: colors.text }]}>
                Est. reach: <Text style={{ fontWeight: '700' }}>{formatCompactNumber(campaign.distribution.estimatedReachMin)} - {formatCompactNumber(campaign.distribution.estimatedReachMax)}</Text>
              </Text>
            </View>
            <Text style={[styles.backersText, { color: colors.textMuted }]}>
              {campaign.backersCount} {campaign.backersCount === 1 ? 'backer' : 'backers'}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={handleBackAction}
            activeOpacity={0.85}
          >
            <Ionicons name="flash" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.backButtonText}>Back This Campaign</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: '#CBD5E1',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  topOverlay: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookmarkButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOverlay: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.md,
  },
  content: {
    padding: Spacing.lg,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  creatorText: {
    fontSize: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  summary: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  metricsBox: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  metricsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricMain: {
    fontSize: 15,
    fontWeight: '700',
  },
  metricSub: {
    fontSize: 12,
    fontWeight: '400',
  },
  percentText: {
    fontSize: 14,
    fontWeight: '700',
  },
  metricsBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  reachPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reachText: {
    fontSize: 11,
    marginLeft: 4,
  },
  backersText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flex: 1,
    height: 42,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});


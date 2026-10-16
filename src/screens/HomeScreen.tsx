import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCampaigns } from '../context/CampaignContext';
import { CampaignCard } from '../components/campaign/CampaignCard';
import { ReachEstimatorWidget } from '../components/campaign/ReachEstimatorWidget';
import { Button } from '../components/common/Button';
import { Radius, Shadows, Spacing } from '../theme';

interface HomeScreenProps {
  onNavigateTab: (tab: 'explore' | 'create' | 'activity' | 'profile') => void;
  onSelectCampaign: (id: string) => void;
  onBackCampaign: (id: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateTab,
  onSelectCampaign,
  onBackCampaign,
}) => {
  const { colors, isDark } = useTheme();
  const { campaigns } = useCampaigns();

  const featuredCampaigns = campaigns.filter((c) => c.featured || c.status === 'published' || c.status === 'promoting');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceBorder }]}>
        <View style={styles.brandRow}>
          <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
            <Ionicons name="megaphone" size={16} color="#FFFFFF" />
          </View>
          <View>
            <Text style={[styles.brandName, { color: colors.text }]}>Campaigns</Text>
            <Text style={[styles.brandTagline, { color: colors.textMuted }]}>Community-Funded Amplification</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => onNavigateTab('activity')}
          style={[styles.bellBtn, { backgroundColor: colors.surfaceSubtle }]}
        >
          <Ionicons name="notifications-outline" size={18} color={colors.text} />
          <View style={styles.notifBadge} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Hero Section */}
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder, ...Shadows.sm }]}>
          <View style={[styles.pillTag, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF' }]}>
            <Text style={[styles.pillTagText, { color: colors.primary }]}>Not A Donation Platform</Text>
          </View>

          <Text style={[styles.heroHeadline, { color: colors.text }]}>
            Help Crucial Messages Travel Beyond Follower Networks
          </Text>

          <Text style={[styles.heroDescription, { color: colors.textMuted }]}>
            Individuals and creators pool advertising funds to promote fact-checked stories to targeted audiences across social and open web channels.
          </Text>

          {/* Primary CTA Buttons */}
          <View style={styles.heroActionRow}>
            <Button
              title="Explore Campaigns"
              variant="primary"
              icon={<Ionicons name="compass-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />}
              onPress={() => onNavigateTab('explore')}
              style={{ flex: 1, marginRight: Spacing.sm }}
            />
            <Button
              title="Start Campaign"
              variant="outline"
              icon={<Ionicons name="add-circle-outline" size={16} color={colors.text} style={{ marginRight: 6 }} />}
              onPress={() => onNavigateTab('create')}
              style={{ flex: 1 }}
            />
          </View>

          {/* Illustrative Reach Estimator Widget */}
          <ReachEstimatorWidget />
        </View>

        {/* How It Works Visual Flow */}
        <View style={[styles.howItWorksCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            How Community Amplification Works
          </Text>

          <View style={styles.stepsRow}>
            {/* Step 1 */}
            <View style={styles.stepItem}>
              <View style={[styles.stepIconWrap, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF' }]}>
                <Ionicons name="create-outline" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.stepName, { color: colors.text }]}>1. Create</Text>
              <Text style={[styles.stepDesc, { color: colors.textMuted }]}>
                Write story & attach verified sources
              </Text>
            </View>

            <Ionicons name="arrow-forward" size={14} color={colors.textSubtle} style={{ marginTop: 14 }} />

            {/* Step 2 */}
            <View style={styles.stepItem}>
              <View style={[styles.stepIconWrap, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FFFBEB' }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.warning} />
              </View>
              <Text style={[styles.stepName, { color: colors.text }]}>2. Review</Text>
              <Text style={[styles.stepDesc, { color: colors.textMuted }]}>
                Platform audits citations & ad creatives
              </Text>
            </View>

            <Ionicons name="arrow-forward" size={14} color={colors.textSubtle} style={{ marginTop: 14 }} />

            {/* Step 3 */}
            <View style={styles.stepItem}>
              <View style={[styles.stepIconWrap, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5' }]}>
                <Ionicons name="megaphone-outline" size={18} color={colors.success} />
              </View>
              <Text style={[styles.stepName, { color: colors.text }]}>3. Amplify</Text>
              <Text style={[styles.stepDesc, { color: colors.textMuted }]}>
                Backers fund ads reaching target readers
              </Text>
            </View>
          </View>
        </View>

        {/* Featured Campaigns Feed */}
        <View style={styles.feedHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Featured Campaigns
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              Active campaigns currently raising distribution reach
            </Text>
          </View>
          <TouchableOpacity onPress={() => onNavigateTab('explore')}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>View all</Text>
          </TouchableOpacity>
        </View>

        {/* Campaign Feed Cards */}
        {featuredCampaigns.map((camp) => (
          <CampaignCard
            key={camp.id}
            campaign={camp}
            onPress={() => onSelectCampaign(camp.id)}
            onBackPress={() => onBackCampaign(camp.id)}
          />
        ))}
      </View>
    </ScrollView>
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: '500',
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  content: {
    padding: Spacing.lg,
  },
  heroCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  pillTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
  },
  pillTagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  heroHeadline: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    letterSpacing: -0.4,
    marginBottom: Spacing.sm,
  },
  heroDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  heroActionRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  howItWorksCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.md,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: Spacing.md,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  stepIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
});


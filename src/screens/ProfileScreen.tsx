import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useCampaigns, UserRole } from '../context/CampaignContext';
import { CampaignStatus, Campaign } from '../types';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Button } from '../components/common/Button';
import { Radius, Shadows, Spacing } from '../theme';
import { formatCompactNumber, formatCurrency } from '../utils/reachCalculator';

interface ProfileScreenProps {
  onSelectCampaign: (id: string) => void;
  onEditDraft?: () => void;
  onStartCampaign?: () => void;
}

type ProfileMainTab = 'creator_dashboard' | 'backed' | 'saved' | 'admin_reviewer';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onSelectCampaign,
  onEditDraft,
  onStartCampaign,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const {
    campaigns,
    contributions,
    savedCampaignIds,
    currentDraft,
    adminApproveCampaign,
    adminRequestChanges,
    adminRejectCampaign,
    resetToInitialDemo,
  } = useCampaigns();

  const [activeMainTab, setActiveMainTab] = useState<ProfileMainTab>('creator_dashboard');
  const [creatorStatusFilter, setCreatorStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  // Creator's campaigns
  const myCampaigns = campaigns.filter((c) => {
    if (c.isUserCreated || c.creatorName === 'Dr. Elena Rostova' || c.creatorName === 'Alex Mercer') {
      if (creatorStatusFilter === 'all') return true;
      return c.status === creatorStatusFilter;
    }
    return false;
  });

  // Saved campaigns
  const savedCampaigns = campaigns.filter((c) => savedCampaignIds.includes(c.id));

  // Pending review campaigns for Admin mode
  const pendingCampaigns = campaigns.filter((c) => c.status === 'under_review' || c.status === 'requires_action');

  // Overall analytics
  const totalRaised = campaigns.reduce((acc, c) => acc + c.amountRaised, 0);
  const totalBackers = campaigns.reduce((acc, c) => acc + c.backersCount, 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + (c.distributionReport?.impressionsDelivered || 0), 0);

  const handleAdminApprove = (campId: string) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
    }
    adminApproveCampaign(campId);
    Alert.alert('Campaign Approved!', 'Status updated to Published/Funding. The campaign is now live on the public feed.');
  };

  const handleAdminRequestEdits = (campId: string) => {
    adminRequestChanges(campId, 'Please supply an additional peer-reviewed source for the secondary statistic in section 2.');
    Alert.alert('Changes Requested', 'Sent moderation feedback to creator dashboard.');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Profile Card */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceBorder }]}>
        <View style={styles.profileRow}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80' }}
            style={styles.avatar}
          />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.userName, { color: colors.text }]}>Alex Mercer</Text>
              <Badge label="Verified Creator" variant="primary" size="sm" style={{ marginLeft: 6 }} />
            </View>
            <Text style={[styles.userRoleText, { color: colors.textMuted }]}>
              Civic Advocate & Community Organizer
            </Text>
          </View>

          {/* Dark / Light Toggle */}
          <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: colors.surfaceSubtle }]}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Main Section Navigation Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mainTabsTrack}>
          {[
            { id: 'creator_dashboard', label: 'Creator Dashboard', icon: 'grid-outline' },
            { id: 'backed', label: `Backed (${contributions.length})`, icon: 'wallet-outline' },
            { id: 'saved', label: `Saved (${savedCampaigns.length})`, icon: 'bookmark-outline' },
            { id: 'admin_reviewer', label: `Reviewer Mode (${pendingCampaigns.length})`, icon: 'shield-outline' },
          ].map((tab) => {
            const active = activeMainTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveMainTab(tab.id as ProfileMainTab)}
                style={[
                  styles.mainTabBtn,
                  {
                    backgroundColor: active ? colors.primary : colors.surfaceSubtle,
                    borderColor: active ? colors.primary : colors.surfaceBorder,
                  },
                ]}
              >
                <Ionicons name={tab.icon as any} size={14} color={active ? '#FFFFFF' : colors.text} style={{ marginRight: 5 }} />
                <Text style={{ color: active ? '#FFFFFF' : colors.text, fontSize: 12, fontWeight: active ? '700' : '500' }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}
      >
        {/* ================= VIEW 1: CREATOR DASHBOARD ================= */}
        {activeMainTab === 'creator_dashboard' && (
          <View>
            {/* Live Analytics Bar */}
            <View style={[styles.analyticsCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder, ...Shadows.sm }]}>
              <Text style={[styles.analyticsTitle, { color: colors.text }]}>Platform Impact & Analytics</Text>
              <View style={styles.analyticsRow}>
                <View style={styles.analyticsCol}>
                  <Text style={[styles.anaVal, { color: colors.primary }]}>{formatCurrency(totalRaised)}</Text>
                  <Text style={[styles.anaLabel, { color: colors.textMuted }]}>Funds Pooled</Text>
                </View>
                <View style={styles.analyticsCol}>
                  <Text style={[styles.anaVal, { color: colors.accent }]}>{formatCompactNumber(totalImpressions || 740000)}</Text>
                  <Text style={[styles.anaLabel, { color: colors.textMuted }]}>Delivered Impressions</Text>
                </View>
                <View style={styles.analyticsCol}>
                  <Text style={[styles.anaVal, { color: colors.success }]}>{totalBackers}</Text>
                  <Text style={[styles.anaLabel, { color: colors.textMuted }]}>Total Backers</Text>
                </View>
              </View>
            </View>

            {/* Incomplete Draft Alert (If draft exists) */}
            {currentDraft && currentDraft.title && (
              <View style={[styles.draftAlert, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#EEF2FF', borderColor: colors.primary }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.draftAlertTitle, { color: colors.primary }]}>In-Progress Draft</Text>
                  <Text style={[styles.draftAlertName, { color: colors.text }]} numberOfLines={1}>"{currentDraft.title}"</Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>Step {currentDraft.step} of 5</Text>
                </View>
                <Button title="Resume Draft" size="sm" onPress={onEditDraft || (() => {})} />
              </View>
            )}

            {/* Status Filter Tabs (Notion Requirement: Drafts, Under Review, Published, Promoting, Completed, Requires Action) */}
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Your Campaigns</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
              {(['all', 'published', 'promoting', 'under_review', 'completed', 'requires_action'] as const).map((st) => {
                const active = creatorStatusFilter === st;
                return (
                  <TouchableOpacity
                    key={st}
                    onPress={() => setCreatorStatusFilter(st)}
                    style={[
                      styles.statusFilterChip,
                      {
                        backgroundColor: active ? colors.primary : colors.surface,
                        borderColor: active ? colors.primary : colors.surfaceBorder,
                      },
                    ]}
                  >
                    <Text style={{ color: active ? '#FFFFFF' : colors.text, fontSize: 11, fontWeight: active ? '700' : '500', textTransform: 'capitalize' }}>
                      {st === 'all' ? 'All Campaigns' : st.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Campaign Management List */}
            {myCampaigns.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
                <Ionicons name="folder-open-outline" size={32} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Campaigns in this Status</Text>
                <Button title="Start a New Campaign" size="sm" onPress={onStartCampaign || (() => {})} style={{ marginTop: Spacing.md }} />
              </View>
            ) : (
              myCampaigns.map((camp) => (
                <View key={camp.id} style={[styles.manageCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
                  <View style={styles.manageCardTop}>
                    <Image source={{ uri: camp.coverImage }} style={styles.manageThumb} resizeMode="cover" />
                    <View style={{ flex: 1, marginLeft: Spacing.md }}>
                      <Badge status={camp.status} size="sm" />
                      <Text style={[styles.manageTitle, { color: colors.text }]} numberOfLines={2}>{camp.title}</Text>
                      <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '700', marginTop: 2 }}>
                        {formatCurrency(camp.amountRaised)} / {formatCurrency(camp.fundingGoal)}
                      </Text>
                    </View>
                  </View>

                  <ProgressBar progress={camp.fundingGoal > 0 ? camp.amountRaised / camp.fundingGoal : 0} height={5} style={{ marginVertical: 8 }} />

                  {/* Moderation Feedback if requested changes */}
                  {camp.status === 'requires_action' && camp.moderationFeedback && (
                    <View style={[styles.feedbackBanner, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}>
                      <Ionicons name="alert-circle" size={15} color={colors.danger} />
                      <Text style={[styles.feedbackText, { color: colors.danger }]}>
                        Reviewer Feedback: "{camp.moderationFeedback}"
                      </Text>
                    </View>
                  )}

                  {/* Quick Action Buttons */}
                  <View style={styles.manageBtnRow}>
                    <Button
                      title="View Public Page"
                      variant="outline"
                      size="sm"
                      onPress={() => onSelectCampaign(camp.id)}
                      style={{ flex: 1, marginRight: 6 }}
                    />
                    {camp.distributionReport && (
                      <Button
                        title="Audit Report"
                        variant="secondary"
                        size="sm"
                        onPress={() => onSelectCampaign(camp.id)}
                        style={{ flex: 1 }}
                      />
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ================= VIEW 2: BACKED CAMPAIGNS ================= */}
        {activeMainTab === 'backed' && (
          <View>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Campaigns You Funded</Text>
            {contributions.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
                <Ionicons name="wallet-outline" size={36} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Contributions Yet</Text>
                <Text style={[styles.emptySub, { color: colors.textMuted }]}>
                  When you contribute to amplify a campaign message, your transparent receipts and reach tracking will appear here.
                </Text>
              </View>
            ) : (
              contributions.map((c) => (
                <View key={c.id} style={[styles.contribCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
                  <View style={styles.contribTop}>
                    <View>
                      <Text style={[styles.contribAmount, { color: colors.primary }]}>${c.amount}</Text>
                      <Text style={{ fontSize: 10, color: colors.textSubtle }}>Receipt: {c.receiptNumber}</Text>
                    </View>
                    <Badge label="Confirmed" variant="success" size="sm" />
                  </View>
                  <Text style={[styles.contribCampTitle, { color: colors.text }]}>{c.campaignTitle}</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                    Amplified to ~{c.estimatedReach.toLocaleString()} targeted viewers
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* ================= VIEW 3: SAVED CAMPAIGNS ================= */}
        {activeMainTab === 'saved' && (
          <View>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Bookmarked Campaigns</Text>
            {savedCampaigns.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
                <Ionicons name="bookmark-outline" size={36} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Saved Campaigns</Text>
              </View>
            ) : (
              savedCampaigns.map((camp) => (
                <TouchableOpacity
                  key={camp.id}
                  onPress={() => onSelectCampaign(camp.id)}
                  style={[styles.savedCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
                >
                  <Image source={{ uri: camp.coverImage }} style={{ width: 64, height: 64, borderRadius: Radius.md }} resizeMode="cover" />
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <Badge category={camp.category} size="sm" />
                    <Text style={[styles.savedTitle, { color: colors.text }]} numberOfLines={2}>{camp.title}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* ================= VIEW 4: ADMIN / REVIEWER MODE (BONUS REQUIREMENT) ================= */}
        {activeMainTab === 'admin_reviewer' && (
          <View>
            <View style={[styles.adminBanner, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB', borderColor: colors.warning }]}>
              <Ionicons name="shield-checkmark" size={20} color={colors.warning} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.adminBannerTitle, { color: isDark ? '#FBBF24' : '#92400E' }]}>
                  Platform Reviewer & Fact-Check Audit Console
                </Text>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                  Demonstrating assignment review logic: Review pending campaigns, inspect cited sources, and approve or request edits.
                </Text>
              </View>
            </View>

            {pendingCampaigns.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
                <Ionicons name="checkmark-circle-outline" size={36} color={colors.success} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Review Queue is Clear</Text>
                <Text style={[styles.emptySub, { color: colors.textMuted }]}>
                  Submit a new campaign via the Create tab to test the fact-checking approval workflow!
                </Text>
              </View>
            ) : (
              pendingCampaigns.map((camp) => (
                <View key={camp.id} style={[styles.reviewConsoleCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Badge status={camp.status} />
                    <Text style={{ fontSize: 11, color: colors.textSubtle }}>Goal: {formatCurrency(camp.fundingGoal)}</Text>
                  </View>

                  <Text style={[styles.reviewTitle, { color: colors.text }]}>{camp.title}</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>Creator: {camp.creatorName} ({camp.creatorOrg || 'Independent'})</Text>

                  {/* Sources Preview */}
                  <View style={[styles.reviewSourcesBox, { backgroundColor: colors.surfaceSubtle }]}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                      Citations to Verify ({camp.supportingSources.length}):
                    </Text>
                    {camp.supportingSources.map((s, i) => (
                      <Text key={s.id || i} style={{ fontSize: 11, color: colors.primary, marginBottom: 2 }}>
                        • {s.title} ({s.publisher})
                      </Text>
                    ))}
                  </View>

                  {/* Review Action Buttons */}
                  <View style={styles.reviewBtnRow}>
                    <Button
                      title="Approve & Open Backing"
                      variant="primary"
                      size="sm"
                      icon={<Ionicons name="checkmark-circle" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />}
                      onPress={() => handleAdminApprove(camp.id)}
                      style={{ flex: 1, marginRight: 6 }}
                    />
                    <Button
                      title="Request Edits"
                      variant="outline"
                      size="sm"
                      onPress={() => handleAdminRequestEdits(camp.id)}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Reset Demo State Button */}
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Reset Demo Data', 'Restore original seeded sample campaigns and clear local edits?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reset', style: 'destructive', onPress: resetToInitialDemo },
            ]);
          }}
          style={styles.resetBtn}
        >
          <Ionicons name="refresh" size={14} color={colors.textSubtle} style={{ marginRight: 4 }} />
          <Text style={{ color: colors.textSubtle, fontSize: 12 }}>Reset Sample Demo Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
  },
  userRoleText: {
    fontSize: 12,
    marginTop: 2,
  },
  themeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTabsTrack: {
    paddingVertical: 4,
  },
  mainTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: 6,
  },
  scroll: {
    flex: 1,
  },
  analyticsCard: {
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  analyticsTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analyticsCol: {
    flex: 1,
    alignItems: 'center',
  },
  anaVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  anaLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  draftAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  draftAlertTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  draftAlertName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  statusFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: 6,
  },
  manageCard: {
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  manageCardTop: {
    flexDirection: 'row',
  },
  manageThumb: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
  },
  manageTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 4,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginVertical: 4,
  },
  feedbackText: {
    fontSize: 11,
    marginLeft: 6,
    flex: 1,
  },
  manageBtnRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
  contribCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  contribTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contribAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  contribCampTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  savedTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  adminBanner: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  adminBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  reviewConsoleCard: {
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  reviewSourcesBox: {
    padding: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  reviewBtnRow: {
    flexDirection: 'row',
  },
  emptyBox: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginVertical: Spacing.md,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
});


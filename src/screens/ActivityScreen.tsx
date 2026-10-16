import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useCampaigns } from '../context/CampaignContext';
import { NotificationItem } from '../types';
import { Radius, Spacing } from '../theme';

interface ActivityScreenProps {
  onSelectCampaign: (id: string) => void;
}

type NotifFilter = 'all' | 'milestones' | 'status' | 'updates';

export const ActivityScreen: React.FC<ActivityScreenProps> = ({
  onSelectCampaign,
}) => {
  const { colors, isDark } = useTheme();
  const { notifications, markNotificationRead } = useCampaigns();
  const [filter, setFilter] = useState<NotifFilter>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'milestones') return n.type === 'milestone_reached';
    if (filter === 'status') {
      return (
        n.type === 'campaign_approved' ||
        n.type === 'submission_received' ||
        n.type === 'promotion_begun' ||
        n.type === 'edits_requested'
      );
    }
    if (filter === 'updates') {
      return (
        n.type === 'distribution_progress' ||
        n.type === 'report_available' ||
        n.type === 'contribution_success'
      );
    }
    return true;
  });

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'milestone_reached':
        return { name: 'trophy', color: colors.warning };
      case 'campaign_approved':
      case 'promotion_begun':
        return { name: 'megaphone', color: colors.success };
      case 'distribution_progress':
        return { name: 'stats-chart', color: colors.accent };
      case 'report_available':
        return { name: 'document-text', color: colors.primary };
      case 'edits_requested':
        return { name: 'alert-circle', color: colors.danger };
      case 'contribution_success':
        return { name: 'wallet', color: colors.success };
      default:
        return { name: 'notifications', color: colors.primary };
    }
  };

  const handlePressNotif = (notif: NotificationItem) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
    }
    markNotificationRead(notif.id);
    if (notif.campaignId) {
      onSelectCampaign(notif.campaignId);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Activity & Updates</Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>
          Real-time milestones, fact-check reviews, and ad distribution alerts
        </Text>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'milestones', label: 'Milestones' },
            { id: 'status', label: 'Review & Status' },
            { id: 'updates', label: 'Distribution & Spend' },
          ].map((f) => {
            const active = filter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => setFilter(f.id as NotifFilter)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: active ? colors.primary : colors.surfaceSubtle,
                    borderColor: active ? colors.primary : colors.surfaceBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: active ? '#FFFFFF' : colors.text,
                      fontWeight: active ? '700' : '500',
                    },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 80 }}
      >
        {filteredNotifs.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Ionicons name="notifications-off-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Activity in This Category</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              New campaign updates, reviewer decisions, and backer milestones will appear here.
            </Text>
          </View>
        ) : (
          filteredNotifs.map((item) => {
            const iconConfig = getIconForType(item.type);
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.88}
                onPress={() => handlePressNotif(item)}
                style={[
                  styles.notifCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: item.read ? colors.surfaceBorder : colors.primary,
                    borderWidth: item.read ? 1 : 1.5,
                  },
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#EEF2FF' }]}>
                  <Ionicons name={iconConfig.name as any} size={20} color={iconConfig.color} />
                </View>

                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={[styles.itemTitle, { color: colors.text, fontWeight: item.read ? '600' : '800' }]} numberOfLines={2}>
                      {item.title}
                    </Text>
                    {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                  </View>
                  <Text style={[styles.itemMsg, { color: colors.textMuted }]}>
                    {item.message}
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <Text style={[styles.itemTime, { color: colors.textSubtle }]}>{item.timestamp}</Text>
                    {item.campaignId && (
                      <Text style={[styles.viewLink, { color: colors.primary }]}>View Campaign →</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
    marginBottom: Spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 4,
  },
  filterText: {
    fontSize: 11,
  },
  scroll: {
    flex: 1,
  },
  notifCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radius.xl,
    marginBottom: Spacing.md,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 14,
    lineHeight: 18,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
    marginTop: 4,
  },
  itemMsg: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  itemTime: {
    fontSize: 11,
  },
  viewLink: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    padding: Spacing.xxl,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
  },
});


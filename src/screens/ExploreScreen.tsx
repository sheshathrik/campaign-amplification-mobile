import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { CampaignCategory, CampaignStatus } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useCampaigns } from '../context/CampaignContext';
import { CampaignCard } from '../components/campaign/CampaignCard';
import { Skeleton } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import { Radius, Spacing } from '../theme';

const ALL_CATEGORIES: (CampaignCategory | 'All')[] = [
  'All',
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

type SortOption = 'trending' | 'funded' | 'closest' | 'reach';

interface ExploreScreenProps {
  onSelectCampaign: (id: string) => void;
  onBackCampaign: (id: string) => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  onSelectCampaign,
  onBackCampaign,
}) => {
  const { colors, isDark } = useTheme();
  const { campaigns } = useCampaigns();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CampaignCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [isSimulatingLoad, setIsSimulatingLoad] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleCategorySelect = (cat: CampaignCategory | 'All') => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
    }
    setSelectedCategory(cat);
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((camp) => {
      // Category filter
      if (selectedCategory !== 'All' && camp.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (selectedStatus === 'funding' && camp.status !== 'published') return false;
      if (selectedStatus === 'promoting' && camp.status !== 'promoting') return false;
      if (selectedStatus === 'completed' && camp.status !== 'completed') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = camp.title.toLowerCase().includes(q);
        const matchesSummary = camp.shortSummary.toLowerCase().includes(q);
        const matchesCreator = camp.creatorName.toLowerCase().includes(q);
        const matchesOrg = camp.creatorOrg?.toLowerCase().includes(q);
        return matchesTitle || matchesSummary || matchesCreator || matchesOrg;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'funded') {
        return b.amountRaised - a.amountRaised;
      }
      if (sortBy === 'closest') {
        const ratioA = a.amountRaised / a.fundingGoal;
        const ratioB = b.amountRaised / b.fundingGoal;
        return ratioB - ratioA;
      }
      if (sortBy === 'reach') {
        return b.distribution.estimatedReachMax - a.distribution.estimatedReachMax;
      }
      // Default trending
      return (b.backersCount || 0) - (a.backersCount || 0);
    });
  }, [campaigns, selectedCategory, selectedStatus, searchQuery, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('all');
    setSortBy('trending');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Explore Campaigns
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          Discover fact-checked messages eligible for community amplification
        </Text>

        {/* Search Bar */}
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.surfaceBorder,
              borderWidth: 1,
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.textMuted}
          />
          <TextInput
            placeholder="Search campaigns, causes, or creators..."
            placeholderTextColor={colors.textSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={[
              styles.searchInput,
              {
                color: colors.text,
                ...(Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : {}),
              },
            ]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Categories Horizontal Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesTrack}
        >
          {ALL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => handleCategorySelect(cat)}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                    borderColor: isSelected ? colors.primary : colors.surfaceBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.text,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Filter and Sorting Row */}
      <View style={[styles.filterBar, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceBorder }]}>
        <View style={styles.sortGroup}>
          <Text style={[styles.filterLabel, { color: colors.textSubtle }]}>Sort:</Text>
          {(['trending', 'funded', 'reach'] as const).map((s) => {
            const active = sortBy === s;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => setSortBy(s)}
                style={[
                  styles.sortBtn,
                  active && { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF' },
                ]}
              >
                <Text
                  style={[
                    styles.sortBtnText,
                    { color: active ? colors.primary : colors.textMuted, fontWeight: active ? '700' : '500' },
                  ]}
                >
                  {s === 'trending' ? 'Trending' : s === 'funded' ? 'Most Funded' : 'Max Reach'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[styles.resultCount, { color: colors.textMuted }]}>
          {filteredCampaigns.length} {filteredCampaigns.length === 1 ? 'result' : 'results'}
        </Text>
      </View>

      {/* Main Campaign List with States */}
      <ScrollView
        style={styles.listScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 80 }}
      >
        {isSimulatingLoad ? (
          <View>
            <Skeleton height={200} borderRadius={Radius.xl} style={{ marginBottom: Spacing.lg }} />
            <Skeleton height={200} borderRadius={Radius.xl} style={{ marginBottom: Spacing.lg }} />
          </View>
        ) : filteredCampaigns.length === 0 ? (
          /* Empty / No Results State (Notion Requirement) */
          <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
              <Ionicons name="search-outline" size={32} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Campaigns Match Your Search</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              We couldn't find any campaigns matching "{searchQuery || selectedCategory}". Try adjusting your keywords or clearing active filters.
            </Text>
            <Button
              title="Reset All Filters"
              variant="outline"
              onPress={handleClearFilters}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        ) : (
          filteredCampaigns.map((camp) => (
            <CampaignCard
              key={camp.id}
              campaign={camp}
              onPress={() => onSelectCampaign(camp.id)}
              onBackPress={() => onBackCampaign(camp.id)}
            />
          ))
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
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.md,
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: Spacing.sm,
    backgroundColor: 'transparent',
    paddingVertical: 0,
    borderWidth: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : {}),
  },
  categoriesTrack: {
    paddingVertical: 4,
    paddingRight: Spacing.lg,
  },
  categoryPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: 6,
  },
  categoryPillText: {
    fontSize: 12,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  sortGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginRight: 6,
  },
  sortBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.md,
    marginRight: 4,
  },
  sortBtnText: {
    fontSize: 11,
  },
  resultCount: {
    fontSize: 11,
    fontWeight: '500',
  },
  listScroll: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.xxl,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginTop: Spacing.xl,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
});


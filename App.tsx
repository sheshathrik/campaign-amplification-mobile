import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { CampaignProvider, useCampaigns } from './src/context/CampaignContext';

import { HomeScreen } from './src/screens/HomeScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { CreateScreen } from './src/screens/CreateScreen';
import { ActivityScreen } from './src/screens/ActivityScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { CampaignDetailScreen } from './src/screens/CampaignDetailScreen';
import { ContributionModal } from './src/components/backing/ContributionModal';

import { Radius, Spacing, Shadows } from './src/theme';

type TabRoute = 'home' | 'explore' | 'create' | 'activity' | 'profile';

function MainApp() {
  const { colors, isDark } = useTheme();
  const { campaigns, notifications } = useCampaigns();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabRoute>('home');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [backingModalCampaignId, setBackingModalCampaignId] = useState<string | null>(null);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const handleTabPress = (tab: TabRoute) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
    }
    // If viewing detail, pressing a tab takes you back to root tabs
    setSelectedCampaignId(null);
    setActiveTab(tab);
  };

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);
  const backingCampaign = campaigns.find((c) => c.id === backingModalCampaignId);

  return (
    <View style={[styles.rootContainer, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Screen Area with Safe Area Handling */}
      <View style={[styles.screenArea, { paddingTop: insets.top }]}>
        {selectedCampaign ? (
          <CampaignDetailScreen
            campaign={selectedCampaign}
            onBack={() => setSelectedCampaignId(null)}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeScreen
                onNavigateTab={(tab) => setActiveTab(tab)}
                onSelectCampaign={(id) => setSelectedCampaignId(id)}
                onBackCampaign={(id) => setBackingModalCampaignId(id)}
              />
            )}
            {activeTab === 'explore' && (
              <ExploreScreen
                onSelectCampaign={(id) => setSelectedCampaignId(id)}
                onBackCampaign={(id) => setBackingModalCampaignId(id)}
              />
            )}
            {activeTab === 'create' && (
              <CreateScreen
                onCampaignSubmitted={(id) => {
                  setSelectedCampaignId(id);
                }}
                onNavigateHome={() => setActiveTab('home')}
              />
            )}
            {activeTab === 'activity' && (
              <ActivityScreen
                onSelectCampaign={(id) => setSelectedCampaignId(id)}
              />
            )}
            {activeTab === 'profile' && (
              <ProfileScreen
                onSelectCampaign={(id) => setSelectedCampaignId(id)}
                onEditDraft={() => setActiveTab('create')}
                onStartCampaign={() => setActiveTab('create')}
              />
            )}
          </>
        )}
      </View>

      {/* Stable 5-Destination Bottom Navigation Bar */}
      {!selectedCampaign && (
        <View
          style={[
            styles.bottomNavBar,
            {
              backgroundColor: colors.tabBarBackground,
              borderTopColor: colors.tabBarBorder,
              paddingTop: 8,
              paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 14 : 8),
              ...Shadows.md,
            },
          ]}
        >
          {[
            { id: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
            { id: 'explore', label: 'Explore', icon: 'compass-outline', activeIcon: 'compass' },
            { id: 'create', label: 'Create', icon: 'add-circle-outline', activeIcon: 'add-circle' },
            { id: 'activity', label: 'Activity', icon: 'notifications-outline', activeIcon: 'notifications', badge: unreadNotifsCount },
            { id: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
          ].map((item) => {
            const isActive = activeTab === item.id;
            const isCreate = item.id === 'create';
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleTabPress(item.id as TabRoute)}
                activeOpacity={0.75}
                style={styles.navTabItem}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <View style={styles.navIconContainer}>
                  {isCreate ? (
                    <View
                      style={[
                        styles.createIconPill,
                        {
                          backgroundColor: isActive ? colors.primary : (isDark ? 'rgba(99, 102, 241, 0.25)' : colors.primaryLight),
                        },
                      ]}
                    >
                      <Ionicons
                        name="add"
                        size={18}
                        color={isActive ? '#FFFFFF' : colors.primary}
                      />
                    </View>
                  ) : (
                    <Ionicons
                      name={(isActive ? item.activeIcon : item.icon) as any}
                      size={22}
                      color={isActive ? colors.tabBarActive : colors.tabBarInactive}
                    />
                  )}
                  {item.badge ? (
                    <View style={styles.badgeIndicator}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  ) : null}
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.navTabLabel,
                    {
                      color: isActive ? colors.tabBarActive : colors.tabBarInactive,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Direct Backing Modal trigger from card quick action */}
      {backingCampaign && (
        <ContributionModal
          visible={!!backingCampaign}
          campaign={backingCampaign}
          onClose={() => setBackingModalCampaignId(null)}
        />
      )}
    </View>
  );
}

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleTag = document.createElement('style');
      styleTag.textContent = `
        input, textarea, select {
          outline: none !important;
          outline-style: none !important;
          outline-width: 0 !important;
          box-shadow: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        input:focus, textarea:focus, select:focus {
          outline: none !important;
          outline-style: none !important;
          outline-width: 0 !important;
          box-shadow: none !important;
        }
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `;
      document.head.appendChild(styleTag);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CampaignProvider>
          <MainApp />
        </CampaignProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  screenArea: {
    flex: 1,
  },
  bottomNavBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },
  navTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  navIconContainer: {
    position: 'relative',
    height: 28,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createIconPill: {
    width: 34,
    height: 24,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTabLabel: {
    fontSize: 11,
    marginTop: 3,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  badgeIndicator: {
    position: 'absolute',
    top: -2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});

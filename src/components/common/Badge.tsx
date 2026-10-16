import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { CampaignCategory, CampaignStatus } from '../../types';
import { Radius, Spacing } from '../../theme';

interface BadgeProps {
  label?: string;
  category?: CampaignCategory;
  status?: CampaignStatus;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'accent';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  category,
  status,
  variant,
  size = 'md',
  style,
  textStyle,
  icon,
}) => {
  const { colors, isDark } = useTheme();

  let text = label || '';
  let bgColor = colors.surfaceSubtle;
  let textColor = colors.text;

  if (category) {
    text = category;
    bgColor = isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF';
    textColor = colors.primary;
  } else if (status) {
    switch (status) {
      case 'published':
        text = 'Active / Backing';
        bgColor = isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5';
        textColor = isDark ? '#34D399' : '#065F46';
        break;
      case 'promoting':
        text = 'Ad Campaign Live';
        bgColor = isDark ? 'rgba(6, 182, 212, 0.2)' : '#ECFEFF';
        textColor = isDark ? '#22D3EE' : '#0E7490';
        break;
      case 'under_review':
        text = 'In Fact-Check Review';
        bgColor = isDark ? 'rgba(245, 158, 11, 0.2)' : '#FFFBEB';
        textColor = isDark ? '#FBBF24' : '#B45309';
        break;
      case 'requires_action':
        text = 'Edits Requested';
        bgColor = isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2';
        textColor = isDark ? '#F87171' : '#B91C1C';
        break;
      case 'completed':
        text = 'Completed & Audited';
        bgColor = isDark ? 'rgba(148, 163, 184, 0.2)' : '#F1F5F9';
        textColor = colors.textMuted;
        break;
      case 'draft':
        text = 'Saved Draft';
        bgColor = isDark ? 'rgba(100, 116, 139, 0.2)' : '#F1F5F9';
        textColor = colors.textMuted;
        break;
    }
  } else if (variant) {
    switch (variant) {
      case 'primary':
        bgColor = isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF';
        textColor = colors.primary;
        break;
      case 'success':
        bgColor = isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5';
        textColor = isDark ? '#34D399' : '#065F46';
        break;
      case 'warning':
        bgColor = isDark ? 'rgba(245, 158, 11, 0.2)' : '#FFFBEB';
        textColor = isDark ? '#FBBF24' : '#B45309';
        break;
      case 'danger':
        bgColor = isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2';
        textColor = isDark ? '#F87171' : '#B91C1C';
        break;
      case 'accent':
        bgColor = isDark ? 'rgba(6, 182, 212, 0.2)' : '#ECFEFF';
        textColor = isDark ? '#22D3EE' : '#0E7490';
        break;
      case 'neutral':
      default:
        bgColor = colors.surfaceSubtle;
        textColor = colors.textMuted;
        break;
    }
  }

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          paddingHorizontal: isSmall ? Spacing.sm : Spacing.md,
          paddingVertical: isSmall ? 2 : 4,
        },
        style,
      ]}
    >
      {icon && <View style={{ marginRight: 4 }}>{icon}</View>}
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: isSmall ? 11 : 12,
          },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});


import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Radius } from '../../theme';

interface ProgressBarProps {
  progress: number; // 0 to 1 (or > 1 for overfunded)
  height?: number;
  style?: ViewStyle;
  customColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 7,
  style,
  customColor,
}) => {
  const { colors } = useTheme();

  // Clamp percentage for bar width, but allow display of 100%
  const clampedPercentage = Math.min(Math.max(progress * 100, 0), 100);

  const getFillColor = () => {
    if (customColor) return customColor;
    if (progress >= 1.0) return colors.success;
    if (progress >= 0.75) return colors.primary;
    return colors.primary;
  };

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: colors.surfaceSubtle,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clampedPercentage}%`,
            height,
            backgroundColor: getFillColor(),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radius.full,
  },
});


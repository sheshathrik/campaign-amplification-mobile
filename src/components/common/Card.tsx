import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Shadows, Spacing } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevated?: boolean;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  elevated = true,
  bordered = true,
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (!onPress) return;
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
    }
    onPress();
  };

  const containerStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderColor: bordered ? colors.surfaceBorder : 'transparent',
    borderWidth: bordered ? 1 : 0,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...(elevated ? Shadows.sm : {}),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handlePress}
        style={[containerStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[containerStyle, style]}>{children}</View>;
};


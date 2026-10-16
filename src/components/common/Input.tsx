import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  helperText?: string;
  error?: string;
  maxLength?: number;
  showCharCount?: boolean;
  prefix?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  maxLength,
  showCharCount = false,
  prefix,
  containerStyle,
  inputStyle,
  value = '',
  required = false,
  ...props
}) => {
  const { colors } = useTheme();

  const currentLength = (value as string).length;
  const isNearLimit = maxLength ? currentLength >= maxLength * 0.9 : false;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.text }]}>
            {label}
            {required && <Text style={{ color: colors.danger }}> *</Text>}
          </Text>
          {showCharCount && maxLength && (
            <Text
              style={[
                styles.charCount,
                {
                  color: isNearLimit ? colors.warning : colors.textSubtle,
                  fontWeight: isNearLimit ? '700' : '500',
                },
              ]}
            >
              {currentLength}/{maxLength}
            </Text>
          )}
        </View>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.surfaceBorder,
            minHeight: props.multiline ? 90 : 48,
          },
        ]}
      >
        {prefix && (
          <Text style={[styles.prefix, { color: colors.textMuted }]}>
            {prefix}
          </Text>
        )}
        <TextInput
          placeholderTextColor={colors.textSubtle}
          value={value}
          maxLength={maxLength}
          style={[
            styles.input,
            {
              color: colors.text,
              textAlignVertical: props.multiline ? 'top' : 'center',
            },
            inputStyle,
          ]}
          {...props}
        />
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: colors.danger }]}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={[styles.helperText, { color: colors.textMuted }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  charCount: {
    fontSize: 11,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1.2,
    paddingHorizontal: Spacing.md,
  },
  prefix: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: Spacing.sm,
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : {}),
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});


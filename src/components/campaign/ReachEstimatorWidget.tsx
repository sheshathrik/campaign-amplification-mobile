import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { calculateReachEstimate, formatCurrency } from '../../utils/reachCalculator';
import { Radius, Spacing } from '../../theme';

export const ReachEstimatorWidget: React.FC = () => {
  const { colors, isDark } = useTheme();
  const [selectedAmount, setSelectedAmount] = useState<number>(50);

  const presets = [25, 50, 100, 250, 500];
  const estimate = calculateReachEstimate(selectedAmount);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(99, 102, 241, 0.08)' : '#EEF2FF',
          borderColor: isDark ? 'rgba(99, 102, 241, 0.25)' : '#C7D2FE',
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="calculator-outline" size={16} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            Community Reach Calculator
          </Text>
        </View>
        <Text style={[styles.disclaimerBadge, { color: colors.textMuted }]}>
          Illustrative Estimate
        </Text>
      </View>

      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        See how small pooled contributions translate into verified ad distribution:
      </Text>

      {/* Preset Buttons */}
      <View style={styles.presetRow}>
        {presets.map((amt) => {
          const isSelected = selectedAmount === amt;
          return (
            <TouchableOpacity
              key={amt}
              onPress={() => setSelectedAmount(amt)}
              activeOpacity={0.8}
              style={[
                styles.presetButton,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.surfaceBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.presetText,
                  {
                    color: isSelected ? '#FFFFFF' : colors.text,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                ${amt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Dynamic Result Box */}
      <View
        style={[
          styles.resultCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.surfaceBorder,
          },
        ]}
      >
        <View style={styles.resultCol}>
          <Text style={[styles.resultLabel, { color: colors.textMuted }]}>
            Estimated Targeted Reach
          </Text>
          <Text style={[styles.resultValue, { color: colors.primary }]}>
            {estimate.formattedRange}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.resultCol}>
          <Text style={[styles.resultLabel, { color: colors.textMuted }]}>
            Est. Ad Impressions
          </Text>
          <Text style={[styles.resultValue, { color: colors.text }]}>
            ~{estimate.expectedImpressions.toLocaleString()}
          </Text>
        </View>
      </View>

      <Text style={[styles.footerNote, { color: colors.textSubtle }]}>
        * Reach is an illustrative estimate based on a standard $10.50 CPM model across social and web channels. Not a guarantee.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1.2,
    marginVertical: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  disclaimerBadge: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.md,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  presetButton: {
    flex: 1,
    marginHorizontal: 3,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  presetText: {
    fontSize: 13,
  },
  resultCard: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  resultCol: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  resultLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  footerNote: {
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 14,
  },
});


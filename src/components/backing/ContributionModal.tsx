import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Campaign, Contribution } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useCampaigns } from '../../context/CampaignContext';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { calculateReachEstimate, formatCurrency } from '../../utils/reachCalculator';
import { Radius, Shadows, Spacing } from '../../theme';

interface ContributionModalProps {
  visible: boolean;
  campaign: Campaign;
  onClose: () => void;
  onViewReport?: () => void;
}

type BackingStep = 'amount' | 'review' | 'payment' | 'confirmation';

export const ContributionModal: React.FC<ContributionModalProps> = ({
  visible,
  campaign,
  onClose,
  onViewReport,
}) => {
  const { colors, isDark } = useTheme();
  const { backCampaign } = useCampaigns();

  const [step, setStep] = useState<BackingStep>('amount');
  const [selectedPreset, setSelectedPreset] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [backerName, setBackerName] = useState<string>('Alex Mercer');
  const [isGuest, setIsGuest] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'google_pay' | 'instant_demo'>('instant_demo');
  const [simulateState, setSimulateState] = useState<'success' | 'pending' | 'failed'>('success');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedContribution, setCompletedContribution] = useState<Contribution | null>(null);
  const [paymentError, setPaymentError] = useState<string>('');

  const activeAmount = customAmount ? parseFloat(customAmount) || 0 : selectedPreset;
  const reachEstimate = calculateReachEstimate(activeAmount, campaign.distribution.channels);
  const fee = parseFloat((activeAmount * 0.05).toFixed(2));
  const total = parseFloat((activeAmount + fee).toFixed(2));

  const presets = [10, 25, 50, 100, 250];

  const handleSelectPreset = (amount: number) => {
    setSelectedPreset(amount);
    setCustomAmount('');
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
    }
  };

  const handleCustomChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setCustomAmount(cleaned);
  };

  const handleProceedToReview = () => {
    if (activeAmount < 5) {
      alert('Minimum contribution is $5 to cover ad impression processing.');
      return;
    }
    setStep('review');
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    setPaymentError('');

    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
    }

    // Simulate network round-trip to dummy payment gateway
    setTimeout(async () => {
      setIsProcessing(false);

      if (simulateState === 'failed') {
        setPaymentError('Simulated checkout failure: Card declined or authorization expired. Please try another method.');
        return;
      }

      try {
        const contrib = await backCampaign(
          campaign.id,
          activeAmount,
          isAnonymous ? 'Anonymous' : backerName,
          isAnonymous,
          paymentMethod
        );
        setCompletedContribution(contrib);
        setStep('confirmation');
      } catch (e) {
        setPaymentError('An error occurred while recording the contribution.');
      }
    }, 1200);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just contributed to amplify "${campaign.title}" to reach ${reachEstimate.formattedRange}! Join in at: https://campaign-one-pearl.vercel.app/campaign/${campaign.id}`,
      });
    } catch (_) {}
  };

  const resetAndClose = () => {
    setStep('amount');
    setCompletedContribution(null);
    setPaymentError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={resetAndClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            },
          ]}
        >
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerSubtitle, { color: colors.primary }]}>
                {step === 'confirmation' ? 'Contribution Confirmed' : 'Community-Funded Amplification'}
              </Text>
              <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                {campaign.title}
              </Text>
            </View>
            <TouchableOpacity onPress={resetAndClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* STEP 1 & 2: SELECT AMOUNT */}
            {step === 'amount' && (
              <View>
                {/* Important Platform Distinction Notice */}
                <View style={[styles.noticeBox, { backgroundColor: isDark ? 'rgba(79, 70, 229, 0.12)' : '#EEF2FF', borderColor: colors.primary }]}>
                  <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
                  <Text style={[styles.noticeText, { color: colors.text }]}>
                    <Text style={{ fontWeight: '700' }}>Not a direct donation.</Text> Your funds pool toward verified advertising spend to deliver this story to key audiences.
                  </Text>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  1. Choose a Contribution Amount
                </Text>

                <View style={styles.presetGrid}>
                  {presets.map((amt) => {
                    const isSelected = selectedPreset === amt && !customAmount;
                    return (
                      <TouchableOpacity
                        key={amt}
                        onPress={() => handleSelectPreset(amt)}
                        style={[
                          styles.presetCard,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                            borderColor: isSelected ? colors.primary : colors.surfaceBorder,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetCardText,
                            {
                              color: isSelected ? '#FFFFFF' : colors.text,
                              fontWeight: isSelected ? '700' : '600',
                            },
                          ]}
                        >
                          ${amt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Custom Amount */}
                <View style={[styles.customRow, { borderColor: customAmount ? colors.primary : colors.surfaceBorder }]}>
                  <Text style={[styles.dollarSign, { color: colors.text }]}>$</Text>
                  <TextInput
                    placeholder="Enter custom amount"
                    placeholderTextColor={colors.textSubtle}
                    keyboardType="number-pad"
                    value={customAmount}
                    onChangeText={handleCustomChange}
                    style={[styles.customInput, { color: colors.text }]}
                  />
                </View>

                {/* Dynamic Reach Preview Box */}
                <View style={[styles.reachCard, { backgroundColor: colors.surfaceSubtle, borderColor: colors.surfaceBorder }]}>
                  <View style={styles.reachCardHeader}>
                    <Ionicons name="megaphone" size={18} color={colors.primary} />
                    <Text style={[styles.reachCardTitle, { color: colors.text }]}>
                      Your Contribution's Impact
                    </Text>
                  </View>
                  <Text style={[styles.reachHighlight, { color: colors.primary }]}>
                    {reachEstimate.formattedRange}
                  </Text>
                  <Text style={[styles.reachExplainer, { color: colors.textMuted }]}>
                    At ${activeAmount || 0}, an estimated {reachEstimate.expectedImpressions.toLocaleString()} ad impressions will be purchased across targeted regions.
                  </Text>
                </View>

                {/* Guest / Anonymity Preferences */}
                <View style={styles.preferenceRow}>
                  <TouchableOpacity
                    onPress={() => setIsAnonymous(!isAnonymous)}
                    style={styles.checkboxRow}
                  >
                    <Ionicons
                      name={isAnonymous ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={isAnonymous ? colors.primary : colors.textMuted}
                    />
                    <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                      Keep my name private on public backer list
                    </Text>
                  </TouchableOpacity>
                </View>

                <Button
                  title={`Continue to Review ($${activeAmount})`}
                  onPress={handleProceedToReview}
                  style={{ marginTop: Spacing.lg }}
                />
              </View>
            )}

            {/* STEP 3: REVIEW CONTRIBUTION */}
            {step === 'review' && (
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  2. Review Contribution & Fees
                </Text>

                <View style={[styles.summaryCard, { backgroundColor: colors.surfaceSubtle, borderColor: colors.surfaceBorder }]}>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                      Message Amplification:
                    </Text>
                    <Text style={[styles.summaryVal, { color: colors.text }]}>
                      {formatCurrency(activeAmount)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                      Transparent Platform Fee (5%):
                    </Text>
                    <Text style={[styles.summaryVal, { color: colors.text }]}>
                      ${fee.toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.summaryDivider, { backgroundColor: colors.surfaceBorder }]} />
                  <View style={styles.summaryRow}>
                    <Text style={[styles.totalLabel, { color: colors.text }]}>
                      Total Payment:
                    </Text>
                    <Text style={[styles.totalVal, { color: colors.primary }]}>
                      ${total.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Impact Summary */}
                <View style={[styles.impactBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5', borderColor: colors.success }]}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                  <Text style={[styles.impactText, { color: isDark ? '#34D399' : '#065F46' }]}>
                    Adds an estimated <Text style={{ fontWeight: '700' }}>{reachEstimate.formattedRange}</Text> to this campaign's audience!
                  </Text>
                </View>

                {/* Refund & Unspent Funds Policy */}
                <Text style={[styles.policyText, { color: colors.textSubtle }]}>
                  * Terms & Refund Policy: If a campaign does not reach minimum flight threshold by deadline, unspent advertising funds are returned or creditable to future campaigns per community guidelines.
                </Text>

                <View style={styles.buttonRow}>
                  <Button
                    title="Back"
                    variant="outline"
                    onPress={() => setStep('amount')}
                    style={{ flex: 1, marginRight: Spacing.sm }}
                  />
                  <Button
                    title="Choose Payment"
                    onPress={() => setStep('payment')}
                    style={{ flex: 2 }}
                  />
                </View>
              </View>
            )}

            {/* STEP 4: SIMULATED PAYMENT PROVIDER */}
            {step === 'payment' && (
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  3. Complete Payment (Simulated Checkout)
                </Text>

                <Text style={[styles.subText, { color: colors.textMuted }]}>
                  For this hackathon prototype, choose a simulated payment channel:
                </Text>

                {/* Payment Options */}
                {[
                  { id: 'instant_demo', name: 'Instant Demo Checkout', icon: 'flash' },
                  { id: 'card', name: 'Credit / Debit Card (Simulated)', icon: 'card' },
                  { id: 'apple_pay', name: 'Apple Pay / Google Pay', icon: 'wallet' },
                ].map((item) => {
                  const isChosen = paymentMethod === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => setPaymentMethod(item.id as any)}
                      style={[
                        styles.payMethodCard,
                        {
                          backgroundColor: isChosen ? (isDark ? 'rgba(99, 102, 241, 0.15)' : '#EEF2FF') : colors.surfaceSubtle,
                          borderColor: isChosen ? colors.primary : colors.surfaceBorder,
                        },
                      ]}
                    >
                      <Ionicons name={item.icon as any} size={20} color={isChosen ? colors.primary : colors.textMuted} />
                      <Text style={[styles.payMethodText, { color: colors.text, fontWeight: isChosen ? '700' : '500' }]}>
                        {item.name}
                      </Text>
                      {isChosen && <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={{ marginLeft: 'auto' }} />}
                    </TouchableOpacity>
                  );
                })}

                {/* Prototype State Simulator (For Hackathon Reviewers!) */}
                <View style={[styles.demoTesterBox, { backgroundColor: colors.surfaceSubtle, borderColor: colors.surfaceBorder }]}>
                  <Text style={[styles.demoTesterTitle, { color: colors.textMuted }]}>
                    Reviewer Control: Simulate Gateway Response
                  </Text>
                  <View style={styles.simulateToggleRow}>
                    {(['success', 'pending', 'failed'] as const).map((st) => (
                      <TouchableOpacity
                        key={st}
                        onPress={() => setSimulateState(st)}
                        style={[
                          styles.simulateChip,
                          {
                            backgroundColor: simulateState === st ? (st === 'failed' ? colors.danger : colors.primary) : colors.surface,
                          },
                        ]}
                      >
                        <Text style={{ color: simulateState === st ? '#FFFFFF' : colors.text, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }}>
                          {st}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {paymentError ? (
                  <View style={[styles.errorBox, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}>
                    <Ionicons name="alert-circle" size={16} color={colors.danger} />
                    <Text style={[styles.errorText, { color: colors.danger }]}>{paymentError}</Text>
                  </View>
                ) : null}

                <View style={styles.buttonRow}>
                  <Button
                    title="Back"
                    variant="outline"
                    onPress={() => setStep('review')}
                    style={{ flex: 1, marginRight: Spacing.sm }}
                  />
                  <Button
                    title={`Pay $${total.toFixed(2)}`}
                    loading={isProcessing}
                    onPress={handleProcessPayment}
                    style={{ flex: 2 }}
                  />
                </View>
              </View>
            )}

            {/* STEP 5 & 6: CONFIRMATION & TRACKING */}
            {step === 'confirmation' && completedContribution && (
              <View style={styles.confirmContainer}>
                <View style={[styles.successCircle, { backgroundColor: colors.successLight }]}>
                  <Ionicons name="checkmark-done" size={40} color={colors.success} />
                </View>

                <Text style={[styles.confirmTitle, { color: colors.text }]}>
                  Thank You for Amplifying!
                </Text>

                <Text style={[styles.confirmSubtitle, { color: colors.textMuted }]}>
                  Your contribution of <Text style={{ fontWeight: '700', color: colors.text }}>${completedContribution.amount}</Text> is confirmed.
                </Text>

                {/* Receipt Card */}
                <View style={[styles.receiptCard, { backgroundColor: colors.surfaceSubtle, borderColor: colors.surfaceBorder }]}>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: colors.textMuted }]}>Receipt Number:</Text>
                    <Text style={[styles.receiptVal, { color: colors.text }]}>{completedContribution.receiptNumber}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: colors.textMuted }]}>Campaign:</Text>
                    <Text style={[styles.receiptVal, { color: colors.text }]} numberOfLines={1}>{completedContribution.campaignTitle}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: colors.textMuted }]}>Estimated Reach:</Text>
                    <Text style={[styles.receiptVal, { color: colors.primary, fontWeight: '700' }]}>~{completedContribution.estimatedReach.toLocaleString()} people</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: colors.textMuted }]}>Date:</Text>
                    <Text style={[styles.receiptVal, { color: colors.text }]}>{new Date().toLocaleDateString()}</Text>
                  </View>
                </View>

                {/* Updated Campaign Progress preview */}
                <View style={{ marginVertical: Spacing.md }}>
                  <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                    Updated Campaign Funding Progress:
                  </Text>
                  <ProgressBar
                    progress={(campaign.amountRaised + completedContribution.amount) / campaign.fundingGoal}
                    height={8}
                    style={{ marginVertical: 6 }}
                  />
                  <Text style={[styles.progressNumbers, { color: colors.text }]}>
                    {formatCurrency(campaign.amountRaised + completedContribution.amount)} raised of {formatCurrency(campaign.fundingGoal)}
                  </Text>
                </View>

                {/* Share action */}
                <Button
                  title="Share Campaign to Amplify Further"
                  variant="outline"
                  icon={<Ionicons name="share-social-outline" size={16} color={colors.text} style={{ marginRight: 6 }} />}
                  onPress={handleShare}
                  style={{ marginBottom: Spacing.sm }}
                />

                {/* Done button */}
                <Button
                  title="Done & View Live Campaign"
                  onPress={resetAndClose}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: Radius.xl * 1.5,
    borderTopRightRadius: Radius.xl * 1.5,
    maxHeight: '90%',
    paddingBottom: Spacing.xxl,
    borderTopWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  scrollBody: {
    padding: Spacing.xl,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 16,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.md,
    letterSpacing: -0.2,
  },
  presetGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  presetCard: {
    flex: 1,
    marginHorizontal: 3,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
  },
  presetCardText: {
    fontSize: 15,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1.2,
    paddingHorizontal: Spacing.md,
    height: 48,
    marginBottom: Spacing.lg,
  },
  dollarSign: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 6,
  },
  customInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  reachCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  reachCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reachCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  reachHighlight: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  reachExplainer: {
    fontSize: 12,
    lineHeight: 16,
  },
  preferenceRow: {
    marginBottom: Spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 13,
    marginLeft: 8,
  },
  summaryCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  impactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  impactText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  policyText: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: Spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
  subText: {
    fontSize: 13,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  payMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.2,
    marginBottom: Spacing.sm,
  },
  payMethodText: {
    fontSize: 14,
    marginLeft: Spacing.md,
  },
  demoTesterBox: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginVertical: Spacing.md,
  },
  demoTesterTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  simulateToggleRow: {
    flexDirection: 'row',
  },
  simulateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginRight: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  confirmContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  confirmSubtitle: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  receiptCard: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  receiptLabel: {
    fontSize: 12,
  },
  receiptVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  progressNumbers: {
    fontSize: 13,
    fontWeight: '600',
  },
});


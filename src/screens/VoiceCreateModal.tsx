import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useCampaigns } from '../context/CampaignContext';
import { CampaignDraft } from '../types';
import { Button } from '../components/common/Button';
import { Radius, Spacing } from '../theme';

interface VoiceCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onDraftGenerated: (draft: Partial<CampaignDraft>) => void;
}

export const VoiceCreateModal: React.FC<VoiceCreateModalProps> = ({
  visible,
  onClose,
  onDraftGenerated,
}) => {
  const { colors, isDark } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedStep, setRecordedStep] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [waveAnim] = useState(new Animated.Value(1));

  // Voice wave animation
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (isRecording) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, { toValue: 1.4, duration: 450, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 0.9, duration: 450, useNativeDriver: true }),
        ])
      );
      loop.start();
    } else {
      waveAnim.setValue(1);
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [isRecording]);

  const guidedPrompts = [
    'What important message or cause do you want to amplify?',
    'Who is your target audience and which communities need to hear this?',
    'What verified facts, research, or sources back up your story?',
  ];

  const sampleVoiceDemos = [
    {
      title: 'Protecting Urban Tree Canopies in Heat Islands',
      category: 'Environment' as const,
      summary: 'Educating city council districts on how planting native shade trees reduces summer ambient pavement temperatures by 12 degrees.',
      locations: ['Phoenix', 'Dallas', 'Las Vegas', 'Atlanta'],
      transcript:
        'I want to launch a campaign about urban heat islands. In neighborhoods without mature tree shade, summer temperatures reach deadly highs. We have peer-reviewed studies from the Forest Service proving a 12-degree temperature drop with canopy restoration. We want to run targeted ads to municipal voters before next month’s urban planning vote.',
    },
    {
      title: 'Banning Predatory Hidden Junk Fees on Rental Leases',
      category: 'Economic Policy' as const,
      summary: 'Informing tenants about upcoming state truth-in-leasing statutes that eliminate surprise application and mandatory utility markups.',
      locations: ['California', 'New York', 'Illinois', 'Washington'],
      transcript:
        'Tenants across our state are paying $300 a month in arbitrary move-in fees and trash convenience fees. The Consumer Financial Protection Bureau published guidance that these violate consumer credit laws. Our coalition wants to place social and search ads alerting renters to their rights.',
    },
  ];

  const handleToggleRecord = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (_) {}
    }

    if (!isRecording) {
      setIsRecording(true);
      // Simulate live speech recognition
      const demo = sampleVoiceDemos[recordedStep % sampleVoiceDemos.length];
      setTranscript('Listening... "I want to launch a campaign about..."');
      setTimeout(() => {
        setTranscript(demo.transcript);
        setIsRecording(false);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const handleApplyVoiceToDraft = (demoIndex = 0) => {
    const demo = sampleVoiceDemos[demoIndex];
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
    }

    onDraftGenerated({
      title: demo.title,
      category: demo.category,
      shortSummary: demo.summary,
      storyHeadline: demo.title,
      storyIntro: demo.summary,
      targetLocations: demo.locations,
      customAdHeadline: demo.title.substring(0, 50),
      customAdDescription: demo.summary,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="mic-circle" size={24} color={colors.primary} />
              <Text style={[styles.headerTitle, { color: colors.text }]}>Voice Campaign Assistant</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
            <Text style={[styles.explainer, { color: colors.textMuted }]}>
              Speak your concept aloud. Our AI assistant will extract your key message, suggest an ad headline, find relevant categories, and draft an editable form.
            </Text>

            {/* Guided Prompt Box */}
            <View style={[styles.promptBox, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.promptLabel, { color: colors.primary }]}>Guided Interview Question:</Text>
              <Text style={[styles.promptQuestion, { color: colors.text }]}>
                "{guidedPrompts[recordedStep]}"
              </Text>
            </View>

            {/* Mic Button & Wave Animation */}
            <View style={styles.micSection}>
              <Animated.View
                style={[
                  styles.waveOuter,
                  {
                    backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF',
                    transform: [{ scale: waveAnim }],
                  },
                ]}
              />
              <TouchableOpacity
                onPress={handleToggleRecord}
                style={[
                  styles.micButton,
                  {
                    backgroundColor: isRecording ? colors.danger : colors.primary,
                  },
                ]}
              >
                <Ionicons name={isRecording ? 'stop' : 'mic'} size={32} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={[styles.micStatus, { color: isRecording ? colors.danger : colors.textMuted }]}>
                {isRecording ? 'Listening & Transcribing...' : 'Tap to Speak Your Idea'}
              </Text>
            </View>

            {/* Live Transcript / Speech Preview */}
            {transcript ? (
              <View style={[styles.transcriptCard, { backgroundColor: colors.surfaceSubtle, borderColor: colors.surfaceBorder }]}>
                <Text style={[styles.transcriptHeader, { color: colors.textMuted }]}>
                  Live Speech-to-Text Transcription:
                </Text>
                <Text style={[styles.transcriptBody, { color: colors.text }]}>
                  {transcript}
                </Text>
                <Button
                  title="Generate Editable Draft From Speech"
                  icon={<Ionicons name="sparkles" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />}
                  onPress={() => handleApplyVoiceToDraft(0)}
                  style={{ marginTop: Spacing.md }}
                />
              </View>
            ) : null}

            {/* Demo Mode / One-Tap Shortcuts (Notion requirement for offline/demo reliability) */}
            <View style={styles.presetsSection}>
              <Text style={[styles.presetsTitle, { color: colors.text }]}>
                Or Select a One-Tap Simulated Voice Idea:
              </Text>
              {sampleVoiceDemos.map((demo, idx) => (
                <TouchableOpacity
                  key={demo.title}
                  onPress={() => handleApplyVoiceToDraft(idx)}
                  style={[styles.demoCard, { backgroundColor: colors.surfaceSubtle, borderColor: colors.surfaceBorder }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.demoTitle, { color: colors.text }]}>{demo.title}</Text>
                    <Text style={[styles.demoCategory, { color: colors.primary }]}>{demo.category}</Text>
                    <Text style={[styles.demoDesc, { color: colors.textMuted }]} numberOfLines={2}>
                      {demo.summary}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward-circle" size={24} color={colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: Radius.xl * 1.5,
    borderTopRightRadius: Radius.xl * 1.5,
    padding: Spacing.xl,
    maxHeight: '92%',
    borderTopWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 6,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  explainer: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  promptBox: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
  },
  promptLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  promptQuestion: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  micSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.lg,
  },
  waveOuter: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  micButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  micStatus: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  transcriptCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  transcriptHeader: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  transcriptBody: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  presetsSection: {
    marginTop: Spacing.sm,
  },
  presetsTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  demoCategory: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  demoDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
});


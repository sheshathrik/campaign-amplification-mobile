import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Campaign,
  CampaignDraft,
  Contribution,
  NotificationItem,
} from '../types';
import { INITIAL_CAMPAIGNS } from '../data/initialCampaigns';
import { INITIAL_NOTIFICATIONS } from '../data/initialNotifications';
import { calculateReachEstimate } from '../utils/reachCalculator';

const CAMPAIGNS_KEY = '@campaigns_storage_v1';
const DRAFT_KEY = '@campaign_draft_v1';
const CONTRIBUTIONS_KEY = '@contributions_storage_v1';
const SAVED_IDS_KEY = '@saved_campaign_ids_v1';
const NOTIFICATIONS_KEY = '@notifications_storage_v1';

export type UserRole = 'audience' | 'creator' | 'backer' | 'admin';

interface CampaignContextType {
  campaigns: Campaign[];
  contributions: Contribution[];
  savedCampaignIds: string[];
  notifications: NotificationItem[];
  currentDraft: CampaignDraft | null;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isLoading: boolean;
  
  // Actions
  saveDraft: (updates: Partial<CampaignDraft>) => Promise<void>;
  clearDraft: () => Promise<void>;
  submitCampaign: (draft: CampaignDraft) => Promise<Campaign>;
  backCampaign: (
    campaignId: string,
    amount: number,
    backerName: string,
    isAnonymous: boolean,
    paymentMethod: 'card' | 'apple_pay' | 'google_pay' | 'instant_demo'
  ) => Promise<Contribution>;
  toggleSaveCampaign: (campaignId: string) => void;
  recordReaderFeedback: (
    campaignId: string,
    type: 'encouragedToRead' | 'changedMind',
    choice: 'yes' | 'somewhat' | 'no'
  ) => void;
  addComment: (campaignId: string, text: string, authorName?: string) => void;
  markNotificationRead: (id: string) => void;
  
  // Admin / Reviewer Actions (Core Flow demonstration requirement)
  adminApproveCampaign: (campaignId: string) => void;
  adminRequestChanges: (campaignId: string, feedback: string) => void;
  adminRejectCampaign: (campaignId: string, feedback: string) => void;
  
  // Refresh & Reset
  resetToInitialDemo: () => Promise<void>;
}

export const DEFAULT_EMPTY_DRAFT: CampaignDraft = {
  id: 'draft-' + Date.now(),
  step: 1,
  lastSaved: new Date().toISOString(),
  title: '',
  category: 'Environment',
  creatorName: 'Alex Mercer',
  creatorOrg: 'Community Action Lab',
  shortSummary: '',
  coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000&auto=format&fit=crop&q=80',
  storyHeadline: '',
  storyIntro: '',
  storySections: [
    {
      id: 'section-1',
      title: 'The Challenge',
      body: 'Describe the critical issue and why broader public awareness is urgently needed.',
    },
  ],
  supportingSources: [
    {
      id: 'source-1',
      title: 'Peer-Reviewed Study / Public Dataset',
      url: 'https://example.org/research-source',
      publisher: 'Research Foundation or Verified Authority',
    },
  ],
  suggestedActions: [
    'Share this message with your local community',
    'Read the complete research report',
  ],
  adCreatives: [
    {
      id: 'ad-c-1',
      format: 'feed',
      headline: '',
      description: '',
      callToAction: 'Learn More',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    },
  ],
  customAdHeadline: '',
  customAdDescription: '',
  ctaText: 'Learn More',
  targetLocations: ['National (US)'],
  audienceInterests: ['Public Policy', 'Community Action', 'Civic Tech'],
  channels: {
    meta: true,
    google: true,
    x: false,
    webDisplay: true,
  },
  durationDays: 21,
  budgetAllocation: {
    socialFeed: 60,
    searchAndVideo: 25,
    openWeb: 15,
  },
  fundingGoal: 3500,
  termsAccepted: false,
  rulesConfirmed: false,
};

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [savedCampaignIds, setSavedCampaignIds] = useState<string[]>(['camp-1']);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [currentDraft, setCurrentDraft] = useState<CampaignDraft | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('audience');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load persisted state on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const storedCampaigns = await AsyncStorage.getItem(CAMPAIGNS_KEY);
        if (storedCampaigns) {
          setCampaigns(JSON.parse(storedCampaigns));
        }

        const storedDraft = await AsyncStorage.getItem(DRAFT_KEY);
        if (storedDraft) {
          setCurrentDraft(JSON.parse(storedDraft));
        }

        const storedContribs = await AsyncStorage.getItem(CONTRIBUTIONS_KEY);
        if (storedContribs) {
          setContributions(JSON.parse(storedContribs));
        }

        const storedSavedIds = await AsyncStorage.getItem(SAVED_IDS_KEY);
        if (storedSavedIds) {
          setSavedCampaignIds(JSON.parse(storedSavedIds));
        }

        const storedNotifs = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
        if (storedNotifs) {
          setNotifications(JSON.parse(storedNotifs));
        }
      } catch (e) {
        console.error('Failed to load local state', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, []);

  // Sync helpers
  const persistCampaigns = (newCampaigns: Campaign[]) => {
    setCampaigns(newCampaigns);
    AsyncStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(newCampaigns));
  };

  const persistNotifications = (newNotifs: NotificationItem[]) => {
    setNotifications(newNotifs);
    AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(newNotifs));
  };

  // Draft saving
  const saveDraft = async (updates: Partial<CampaignDraft>) => {
    const base = currentDraft || DEFAULT_EMPTY_DRAFT;
    const updated: CampaignDraft = {
      ...base,
      ...updates,
      lastSaved: new Date().toISOString(),
    };
    setCurrentDraft(updated);
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
  };

  const clearDraft = async () => {
    setCurrentDraft(null);
    await AsyncStorage.removeItem(DRAFT_KEY);
  };

  // Submit campaign for review
  const submitCampaign = async (draft: CampaignDraft): Promise<Campaign> => {
    const reachEstimate = calculateReachEstimate(draft.fundingGoal, draft.channels);

    const newCampaign: Campaign = {
      id: 'camp-' + Date.now(),
      title: draft.title || 'Untitled Campaign',
      category: draft.category,
      creatorName: draft.creatorName || 'Campaign Creator',
      creatorOrg: draft.creatorOrg,
      creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      shortSummary: draft.shortSummary,
      coverImage: draft.coverImage,
      storyHeadline: draft.storyHeadline || draft.title,
      storyIntro: draft.storyIntro || draft.shortSummary,
      storySections: draft.storySections,
      supportingSources: draft.supportingSources,
      suggestedActions: draft.suggestedActions,
      adCreatives: [
        {
          id: 'ad-' + Date.now(),
          format: 'feed',
          headline: draft.customAdHeadline || draft.title,
          description: draft.customAdDescription || draft.shortSummary,
          callToAction: draft.ctaText || 'Learn More',
          imageUrl: draft.coverImage,
        },
      ],
      customAdHeadline: draft.customAdHeadline,
      customAdDescription: draft.customAdDescription,
      distribution: {
        targetLocations: draft.targetLocations,
        audienceInterests: draft.audienceInterests,
        channels: draft.channels,
        budgetAllocation: draft.budgetAllocation,
        durationDays: draft.durationDays,
        estimatedReachMin: reachEstimate.minReach,
        estimatedReachMax: reachEstimate.maxReach,
      },
      fundingGoal: draft.fundingGoal,
      amountRaised: 0,
      backersCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + draft.durationDays * 86400000).toISOString().split('T')[0],
      status: 'under_review',
      reviewSubmissionDate: new Date().toISOString(),
      comments: [],
      isUserCreated: true,
    };

    const updated = [newCampaign, ...campaigns];
    persistCampaigns(updated);
    await clearDraft();

    // Trigger notification
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      campaignId: newCampaign.id,
      type: 'submission_received',
      title: 'Campaign Submitted for Fact-Check & Review',
      message: `"${newCampaign.title}" is in the review queue. Platform admins verify sources, creatives, and budget parameters.`,
      timestamp: 'Just now',
      read: false,
    };
    persistNotifications([newNotif, ...notifications]);

    return newCampaign;
  };

  // Back campaign
  const backCampaign = async (
    campaignId: string,
    amount: number,
    backerName: string,
    isAnonymous: boolean,
    paymentMethod: 'card' | 'apple_pay' | 'google_pay' | 'instant_demo'
  ): Promise<Contribution> => {
    const fee = parseFloat((amount * 0.05).toFixed(2));
    const total = parseFloat((amount + fee).toFixed(2));
    const reach = calculateReachEstimate(amount);

    const targetCampaign = campaigns.find((c) => c.id === campaignId);
    const campaignTitle = targetCampaign?.title || 'Community Campaign';

    const newContrib: Contribution = {
      id: 'contrib-' + Date.now(),
      campaignId,
      campaignTitle,
      campaignCoverImage: targetCampaign?.coverImage || '',
      amount,
      fee,
      total,
      backerName: isAnonymous ? 'Anonymous Backer' : backerName || 'Supporter',
      isAnonymous,
      paymentMethod,
      status: 'succeeded',
      estimatedReach: reach.expectedImpressions,
      timestamp: new Date().toISOString(),
      receiptNumber: 'REC-' + Math.floor(100000 + Math.random() * 900000),
    };

    // Update campaign raised and backers count
    const updatedCampaigns = campaigns.map((camp) => {
      if (camp.id === campaignId) {
        const newRaised = camp.amountRaised + amount;
        const newBackers = camp.backersCount + 1;
        let newStatus = camp.status;
        if (newRaised >= camp.fundingGoal && camp.status === 'published') {
          newStatus = 'promoting'; // Goal met, automatic progression to ad promotion!
        }
        return {
          ...camp,
          amountRaised: newRaised,
          backersCount: newBackers,
          status: newStatus,
        };
      }
      return camp;
    });

    persistCampaigns(updatedCampaigns);

    const newContribList = [newContrib, ...contributions];
    setContributions(newContribList);
    AsyncStorage.setItem(CONTRIBUTIONS_KEY, JSON.stringify(newContribList));

    // Notification
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      campaignId,
      type: 'contribution_success',
      title: 'Contribution Confirmed ($' + amount + ')',
      message: `You funded ~${reach.minReach.toLocaleString()} people in reach for "${campaignTitle}". Receipt ${newContrib.receiptNumber} generated.`,
      timestamp: 'Just now',
      read: false,
    };
    persistNotifications([notif, ...notifications]);

    return newContrib;
  };

  // Bookmark toggle
  const toggleSaveCampaign = (campaignId: string) => {
    let updated: string[];
    if (savedCampaignIds.includes(campaignId)) {
      updated = savedCampaignIds.filter((id) => id !== campaignId);
    } else {
      updated = [...savedCampaignIds, campaignId];
    }
    setSavedCampaignIds(updated);
    AsyncStorage.setItem(SAVED_IDS_KEY, JSON.stringify(updated));
  };

  // Feedback poll
  const recordReaderFeedback = (
    campaignId: string,
    type: 'encouragedToRead' | 'changedMind',
    choice: 'yes' | 'somewhat' | 'no'
  ) => {
    const updated = campaigns.map((c) => {
      if (c.id === campaignId) {
        const feedback = c.readerFeedback || {
          encouragedToRead: { yes: 0, somewhat: 0, no: 0 },
          changedMind: { yes: 0, somewhat: 0, no: 0 },
        };
        const currentCategory = feedback[type];
        return {
          ...c,
          readerFeedback: {
            ...feedback,
            [type]: {
              ...currentCategory,
              [choice]: (currentCategory[choice] || 0) + 1,
            },
          },
        };
      }
      return c;
    });
    persistCampaigns(updated);
  };

  // Add comment
  const addComment = (campaignId: string, text: string, authorName = 'You') => {
    const updated = campaigns.map((c) => {
      if (c.id === campaignId) {
        const newComm = {
          id: 'comm-' + Date.now(),
          authorName,
          isBacker: true,
          text,
          timestamp: 'Just now',
          likes: 1,
        };
        return {
          ...c,
          comments: [newComm, ...c.comments],
        };
      }
      return c;
    });
    persistCampaigns(updated);
  };

  // Notification mark read
  const markNotificationRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    persistNotifications(updated);
  };

  // Admin Actions
  const adminApproveCampaign = (campaignId: string) => {
    const updated = campaigns.map((c) => {
      if (c.id === campaignId) {
        return {
          ...c,
          status: 'published' as const,
          reviewedDate: new Date().toISOString(),
          reviewNotes: 'Verified: Sources cited match peer-reviewed standards. Ad copy complies with truth-in-advertising guidelines.',
        };
      }
      return c;
    });
    persistCampaigns(updated);

    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      campaignId,
      type: 'campaign_approved',
      title: 'Campaign Approved by Reviewer',
      message: 'Your campaign passed platform review and is now open for public funding!',
      timestamp: 'Just now',
      read: false,
    };
    persistNotifications([notif, ...notifications]);
  };

  const adminRequestChanges = (campaignId: string, feedback: string) => {
    const updated = campaigns.map((c) => {
      if (c.id === campaignId) {
        return {
          ...c,
          status: 'requires_action' as const,
          moderationFeedback: feedback,
        };
      }
      return c;
    });
    persistCampaigns(updated);

    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      campaignId,
      type: 'edits_requested',
      title: 'Changes Requested by Platform Reviewer',
      message: feedback || 'Please review your supporting sources and ad headlines before approval.',
      timestamp: 'Just now',
      read: false,
    };
    persistNotifications([notif, ...notifications]);
  };

  const adminRejectCampaign = (campaignId: string, feedback: string) => {
    const updated = campaigns.map((c) => {
      if (c.id === campaignId) {
        return {
          ...c,
          status: 'draft' as const,
          moderationFeedback: feedback,
        };
      }
      return c;
    });
    persistCampaigns(updated);
  };

  const resetToInitialDemo = async () => {
    setCampaigns(INITIAL_CAMPAIGNS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setContributions([]);
    setCurrentDraft(null);
    await AsyncStorage.clear();
  };

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        contributions,
        savedCampaignIds,
        notifications,
        currentDraft,
        userRole,
        setUserRole,
        isLoading,
        saveDraft,
        clearDraft,
        submitCampaign,
        backCampaign,
        toggleSaveCampaign,
        recordReaderFeedback,
        addComment,
        markNotificationRead,
        adminApproveCampaign,
        adminRequestChanges,
        adminRejectCampaign,
        resetToInitialDemo,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
};


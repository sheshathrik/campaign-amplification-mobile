export type CampaignCategory =
  | 'Environment'
  | 'Health'
  | 'Science'
  | 'Education'
  | 'Public Policy'
  | 'Economic Policy'
  | 'Community'
  | 'Arts & Culture'
  | 'Business'
  | 'Other';

export type CampaignStatus =
  | 'draft'
  | 'under_review'
  | 'published'
  | 'promoting'
  | 'completed'
  | 'requires_action';

export interface SupportingSource {
  id: string;
  title: string;
  url: string;
  publisher: string;
  publishedDate?: string;
  keyFinding?: string;
}

export interface StorySection {
  id: string;
  title?: string;
  body: string;
  calloutStat?: {
    value: string;
    label: string;
  };
  imageUrl?: string;
  imageCaption?: string;
}

export interface AdCreative {
  id: string;
  format: 'feed' | 'story' | 'banner';
  headline: string;
  description: string;
  callToAction: string;
  imageUrl: string;
}

export interface DistributionSettings {
  targetLocations: string[];
  audienceInterests: string[];
  channels: {
    meta: boolean;
    google: boolean;
    x: boolean;
    webDisplay: boolean;
  };
  budgetAllocation: {
    socialFeed: number; // percentage
    searchAndVideo: number;
    openWeb: number;
  };
  durationDays: number;
  estimatedReachMin: number;
  estimatedReachMax: number;
}

export interface DistributionReport {
  fundsRaised: number;
  adSpend: number;
  impressionsDelivered: number;
  clicksGenerated: number;
  verifiedReach: number;
  costPerThousand: number;
  topGeos: { location: string; reach: number }[];
  channelPerformance: { channel: string; impressions: number; spend: number }[];
  completionPercentage: number;
}

export interface ReaderFeedback {
  encouragedToRead: {
    yes: number;
    somewhat: number;
    no: number;
  };
  changedMind: {
    yes: number;
    somewhat: number;
    no: number;
  };
}

export interface Comment {
  id: string;
  authorName: string;
  avatarUrl?: string;
  isBacker: boolean;
  backedAmount?: number;
  text: string;
  timestamp: string;
  likes: number;
}

export interface Campaign {
  id: string;
  title: string; // max 60 chars
  category: CampaignCategory;
  creatorName: string;
  creatorOrg?: string;
  creatorAvatar?: string;
  creatorBio?: string;
  isVerifiedCreator?: boolean;
  shortSummary: string;
  coverImage: string;
  
  // Editorial Story
  storyHeadline: string;
  storyIntro: string;
  storySections: StorySection[];
  supportingSources: SupportingSource[];
  suggestedActions: string[];
  
  // Visuals & Ads
  adCreatives: AdCreative[];
  customAdHeadline?: string;
  customAdDescription?: string;
  
  // Reach & Distribution
  distribution: DistributionSettings;
  
  // Funding & Progress
  fundingGoal: number;
  amountRaised: number;
  backersCount: number;
  createdAt: string;
  deadline: string;
  status: CampaignStatus;
  
  // Review & Trust
  reviewNotes?: string;
  moderationFeedback?: string;
  reviewSubmissionDate?: string;
  reviewedDate?: string;
  
  // Feedback & Reports
  readerFeedback?: ReaderFeedback;
  distributionReport?: DistributionReport;
  comments: Comment[];
  
  // Flags
  featured?: boolean;
  isUserCreated?: boolean;
}

export interface Contribution {
  id: string;
  campaignId: string;
  campaignTitle: string;
  campaignCoverImage: string;
  amount: number;
  fee: number;
  total: number;
  backerName: string;
  isAnonymous: boolean;
  backerEmail?: string;
  paymentMethod: 'card' | 'apple_pay' | 'google_pay' | 'instant_demo';
  status: 'succeeded' | 'pending' | 'failed';
  estimatedReach: number;
  timestamp: string;
  receiptNumber: string;
}

export interface NotificationItem {
  id: string;
  campaignId?: string;
  type:
    | 'submission_received'
    | 'campaign_approved'
    | 'campaign_rejected'
    | 'edits_requested'
    | 'backing_live'
    | 'milestone_reached'
    | 'promotion_begun'
    | 'distribution_progress'
    | 'campaign_completed'
    | 'report_available'
    | 'contribution_success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRoute?: string;
}

export interface CampaignDraft {
  id: string;
  step: number; // 1 to 5
  lastSaved: string;
  
  // Step 1: Basics
  title: string;
  category: CampaignCategory;
  creatorName: string;
  creatorOrg: string;
  shortSummary: string;
  coverImage: string;
  
  // Step 2: Story
  storyHeadline: string;
  storyIntro: string;
  storySections: StorySection[];
  supportingSources: SupportingSource[];
  suggestedActions: string[];
  
  // Step 3: Visuals
  adCreatives: AdCreative[];
  customAdHeadline: string;
  customAdDescription: string;
  ctaText: string;
  
  // Step 4: Reach
  targetLocations: string[];
  audienceInterests: string[];
  channels: {
    meta: boolean;
    google: boolean;
    x: boolean;
    webDisplay: boolean;
  };
  durationDays: number;
  budgetAllocation: {
    socialFeed: number;
    searchAndVideo: number;
    openWeb: number;
  };
  
  // Step 5: Submit
  fundingGoal: number;
  termsAccepted: boolean;
  rulesConfirmed: boolean;
}


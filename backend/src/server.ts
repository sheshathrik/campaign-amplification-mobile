/**
 * Campaign Amplification Platform - Backend API Service
 * Built with Node.js & TypeScript
 * Architecture: Clean controllers, service layers, and validation.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// 1. Campaign Endpoints Design
export const API_ROUTES = {
  // Discovery & Feeds
  GET_CAMPAIGNS: 'GET /api/v1/campaigns',
  GET_CAMPAIGN_BY_ID: 'GET /api/v1/campaigns/:id',
  
  // Creator Flows
  SAVE_DRAFT: 'POST /api/v1/drafts',
  GET_DRAFT: 'GET /api/v1/drafts/:id',
  SUBMIT_CAMPAIGN: 'POST /api/v1/campaigns/submit',
  
  // Backer Flow
  CALCULATE_REACH: 'POST /api/v1/calculator/reach',
  CREATE_CONTRIBUTION: 'POST /api/v1/contributions',
  GET_RECEIPT: 'GET /api/v1/contributions/:id/receipt',
  
  // Reviewer / Moderation Console
  GET_REVIEW_QUEUE: 'GET /api/v1/admin/review-queue',
  APPROVE_CAMPAIGN: 'POST /api/v1/admin/campaigns/:id/approve',
  REQUEST_CHANGES: 'POST /api/v1/admin/campaigns/:id/request-changes',
  REJECT_CAMPAIGN: 'POST /api/v1/admin/campaigns/:id/reject',
  
  // Distribution Reports
  GET_DISTRIBUTION_REPORT: 'GET /api/v1/campaigns/:id/report',
  SYNC_AD_DELIVERY: 'POST /api/v1/webhooks/ad-network-delivery',
};

/**
 * Controller Architecture Example:
 * Validates 60-character title, ensures sources are supplied, and generates reach model.
 */
export function validateCampaignSubmission(payload: any) {
  const errors: string[] = [];

  if (!payload.title || payload.title.length > 60) {
    errors.push('Campaign title must be between 1 and 60 characters.');
  }

  if (!payload.category) {
    errors.push('Category selection is required.');
  }

  if (!payload.creatorName) {
    errors.push('Creator or organization name is mandatory.');
  }

  if (!payload.supportingSources || payload.supportingSources.length === 0) {
    errors.push('At least one verified supporting citation or source is required.');
  }

  if (!payload.fundingGoal || payload.fundingGoal < 200) {
    errors.push('Funding goal must be at least $200 for digital ad distribution flights.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

import { NotificationItem } from '../types';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    campaignId: 'camp-2',
    type: 'distribution_progress',
    title: 'Distribution Update: 362,000 People Reached',
    message: 'Your campaign "Open Source Medicine: The Reality of Generic Biosimilars" has delivered 428,000 ad impressions across 4 key states.',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 'notif-2',
    campaignId: 'camp-1',
    type: 'milestone_reached',
    title: 'Funding Milestone: 80% Reached!',
    message: '"Protecting Coastal Mangroves" just crossed $4,120 raised from 148 backers. Only $880 left to fully fund the ad distribution!',
    timestamp: '5 hours ago',
    read: false,
  },
  {
    id: 'notif-3',
    campaignId: 'camp-4',
    type: 'report_available',
    title: 'Final Distribution Report Ready',
    message: '"Classroom Air Quality" finished its 25-day ad flight with 248,000 verified viewers in Michigan, Wisconsin, and Illinois. View the transparent audit report.',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'notif-4',
    campaignId: 'camp-1',
    type: 'contribution_success',
    title: 'New Backer Contribution',
    message: 'An anonymous backer contributed $100 to amplify "Protecting Coastal Mangroves" to an estimated 11,000 additional coastal residents.',
    timestamp: '1 day ago',
    read: true,
  },
  {
    id: 'notif-5',
    campaignId: 'camp-2',
    type: 'promotion_begun',
    title: 'Campaign Approved & Ad Flight Activated',
    message: 'Platform reviewers approved the fact-checked sources and ad creative assets. Message amplification is now officially live!',
    timestamp: '3 days ago',
    read: true,
  },
];


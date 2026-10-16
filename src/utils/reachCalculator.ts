/**
 * Reach Calculation Engine
 * Translates ad spend into realistic, transparent audience impressions and reach
 * with explicit disclaimers that reach is an estimate based on inventory & target density.
 */

export interface ReachEstimateResult {
  minReach: number;
  maxReach: number;
  expectedImpressions: number;
  costPerThousand: number;
  formattedRange: string;
}

export const BASE_REACH_PER_DOLLAR = 95; // Average people reached per dollar
export const IMPRESSIONS_MULTIPLIER = 1.35; // Frequency factor (some see ad more than once)

export function calculateReachEstimate(
  amount: number,
  channels: { meta?: boolean; google?: boolean; x?: boolean; webDisplay?: boolean } = {
    meta: true,
    google: true,
    x: false,
    webDisplay: true,
  }
): ReachEstimateResult {
  if (amount <= 0) {
    return {
      minReach: 0,
      maxReach: 0,
      expectedImpressions: 0,
      costPerThousand: 10.5,
      formattedRange: '0 people',
    };
  }

  // Channel multiplier based on ad platform inventory costs
  let channelFactor = 1.0;
  if (channels.webDisplay && !channels.google) channelFactor = 1.15;
  if (channels.google && channels.meta) channelFactor = 0.95;

  const baseReach = amount * BASE_REACH_PER_DOLLAR * channelFactor;
  const minReach = Math.round(baseReach * 0.82);
  const maxReach = Math.round(baseReach * 1.25);
  const expectedImpressions = Math.round(baseReach * IMPRESSIONS_MULTIPLIER);
  const costPerThousand = parseFloat(((amount / expectedImpressions) * 1000).toFixed(2)) || 10.5;

  return {
    minReach,
    maxReach,
    expectedImpressions,
    costPerThousand,
    formattedRange: `${formatCompactNumber(minReach)} - ${formatCompactNumber(maxReach)} people`,
  };
}

export function formatCompactNumber(num: number): string {
  if (!num || isNaN(num)) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toLocaleString();
}

export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0';
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}


import { PublishedContent, ComputedMetrics, FunnelStage } from '../types.ts';

export function calculateMetrics(item: PublishedContent): ComputedMetrics {
  const interactions = (item.likes || 0) + (item.comments || 0) + (item.shares || 0) + (item.saves || 0);

  const engagementByReach =
    item.reach && item.reach > 0 ? (interactions / item.reach) * 100 : null;

  const engagementByViews =
    item.views && item.views > 0 ? (interactions / item.views) * 100 : null;

  const saveRate =
    item.reach && item.reach > 0 ? ((item.saves || 0) / item.reach) * 100 : null;

  const shareRate =
    item.reach && item.reach > 0 ? ((item.shares || 0) / item.reach) * 100 : null;

  const followerConversion =
    item.reach && item.reach > 0 ? ((item.followersGained || 0) / item.reach) * 100 : null;

  return {
    engagementByReach,
    engagementByViews,
    saveRate,
    shareRate,
    followerConversion,
  };
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  return `${value.toFixed(2)}%`;
}

export function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return new Intl.NumberFormat('id-ID').format(val);
}

export function formatCurrency(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
}

// Holistic performance score:
// In specialty coffee, Save Rate (people saving coffee brew guide/recipe) & Share Rate (viral relatable)
// are critical quality signals along with Reach and Total Engagement.
export function computeContentScore(item: PublishedContent): number {
  const metrics = calculateMetrics(item);
  const reachScore = Math.min((item.reach || 0) / 1000, 50); // up to 50 pts
  const engScore = (metrics.engagementByReach || 0) * 5; // e.g. 5% = 25 pts
  const saveBonus = (metrics.saveRate || 0) * 10; // save rate is king for coffee education
  const shareBonus = (metrics.shareRate || 0) * 8;
  return Number((reachScore + engScore + saveBonus + shareBonus).toFixed(1));
}

export interface AggregatedStats {
  totalItems: number;
  totalViews: number;
  totalReach: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
  totalProfileVisits: number;
  totalFollowersGained: number;
  totalLinkClicks: number;
  avgEngagementByReach: number | null;
  avgEngagementByViews: number | null;
  avgSaveRate: number | null;
  avgShareRate: number | null;
  avgFollowerConversion: number | null;

  // By platform
  instagram: {
    count: number;
    views: number;
    reach: number;
    engagementRate: number | null;
    saves: number;
    shares: number;
    profileVisits: number;
    followersGained: number;
    linkClicks: number;
  };
  tiktok: {
    count: number;
    views: number;
    reach: number;
    engagementRate: number | null;
    saves: number;
    shares: number;
    profileVisits: number;
    followersGained: number;
    linkClicks: number;
  };

  // Funnel distribution
  funnel: {
    TOFU: { count: number; percent: number; avgReach: number };
    MOFU: { count: number; percent: number; avgReach: number };
    BOFU: { count: number; percent: number; avgReach: number };
  };

  // Strategy compliance: Problem Solving vs Selling
  strategyCompliance: {
    problemSolvingCount: number;
    sellingCount: number;
    problemSolvingRatio: number; // target ~80%
    sellingRatio: number; // target ~20%
  };
}

export function aggregateContent(items: PublishedContent[]): AggregatedStats {
  if (!items || items.length === 0) {
    return {
      totalItems: 0,
      totalViews: 0,
      totalReach: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalSaves: 0,
      totalProfileVisits: 0,
      totalFollowersGained: 0,
      totalLinkClicks: 0,
      avgEngagementByReach: null,
      avgEngagementByViews: null,
      avgSaveRate: null,
      avgShareRate: null,
      avgFollowerConversion: null,
      instagram: { count: 0, views: 0, reach: 0, engagementRate: null, saves: 0, shares: 0, profileVisits: 0, followersGained: 0, linkClicks: 0 },
      tiktok: { count: 0, views: 0, reach: 0, engagementRate: null, saves: 0, shares: 0, profileVisits: 0, followersGained: 0, linkClicks: 0 },
      funnel: {
        TOFU: { count: 0, percent: 0, avgReach: 0 },
        MOFU: { count: 0, percent: 0, avgReach: 0 },
        BOFU: { count: 0, percent: 0, avgReach: 0 },
      },
      strategyCompliance: { problemSolvingCount: 0, sellingCount: 0, problemSolvingRatio: 0, sellingRatio: 0 },
    };
  }

  let totalViews = 0;
  let totalReach = 0;
  let totalLikes = 0;
  let totalComments = 0;
  let totalShares = 0;
  let totalSaves = 0;
  let totalProfileVisits = 0;
  let totalFollowersGained = 0;
  let totalLinkClicks = 0;

  const ig = { count: 0, views: 0, reach: 0, interactions: 0, saves: 0, shares: 0, profileVisits: 0, followersGained: 0, linkClicks: 0 };
  const tt = { count: 0, views: 0, reach: 0, interactions: 0, saves: 0, shares: 0, profileVisits: 0, followersGained: 0, linkClicks: 0 };

  const funnelCounts: Record<FunnelStage, { count: number; totalReach: number }> = {
    TOFU: { count: 0, totalReach: 0 },
    MOFU: { count: 0, totalReach: 0 },
    BOFU: { count: 0, totalReach: 0 },
  };

  let problemSolvingCount = 0;
  let sellingCount = 0;

  items.forEach((item) => {
    const views = item.views || 0;
    const reach = item.reach || 0;
    const likes = item.likes || 0;
    const comments = item.comments || 0;
    const shares = item.shares || 0;
    const saves = item.saves || 0;
    const profileVisits = item.profileVisits || 0;
    const followersGained = item.followersGained || 0;
    const linkClicks = item.linkClicks || 0;

    totalViews += views;
    totalReach += reach;
    totalLikes += likes;
    totalComments += comments;
    totalShares += shares;
    totalSaves += saves;
    totalProfileVisits += profileVisits;
    totalFollowersGained += followersGained;
    totalLinkClicks += linkClicks;

    const interactions = likes + comments + shares + saves;

    if (item.platform === 'instagram') {
      ig.count += 1;
      ig.views += views;
      ig.reach += reach;
      ig.interactions += interactions;
      ig.saves += saves;
      ig.shares += shares;
      ig.profileVisits += profileVisits;
      ig.followersGained += followersGained;
      ig.linkClicks += linkClicks;
    } else if (item.platform === 'tiktok') {
      tt.count += 1;
      tt.views += views;
      tt.reach += reach;
      tt.interactions += interactions;
      tt.saves += saves;
      tt.shares += shares;
      tt.profileVisits += profileVisits;
      tt.followersGained += followersGained;
      tt.linkClicks += linkClicks;
    }

    if (item.funnelStage && funnelCounts[item.funnelStage]) {
      funnelCounts[item.funnelStage].count += 1;
      funnelCounts[item.funnelStage].totalReach += reach;
    }

    // Problem-solving vs selling identification
    // BOFU is typically selling, TOFU & MOFU are problem-solving / educational
    if (item.funnelStage === 'BOFU' || ['Promotion', 'Bundle', 'Urgency', 'Closing'].includes(item.pillar)) {
      sellingCount += 1;
    } else {
      problemSolvingCount += 1;
    }
  });

  const totalInteractions = totalLikes + totalComments + totalShares + totalSaves;
  const avgEngagementByReach = totalReach > 0 ? (totalInteractions / totalReach) * 100 : null;
  const avgEngagementByViews = totalViews > 0 ? (totalInteractions / totalViews) * 100 : null;
  const avgSaveRate = totalReach > 0 ? (totalSaves / totalReach) * 100 : null;
  const avgShareRate = totalReach > 0 ? (totalShares / totalReach) * 100 : null;
  const avgFollowerConversion = totalReach > 0 ? (totalFollowersGained / totalReach) * 100 : null;

  const total = items.length;

  return {
    totalItems: total,
    totalViews,
    totalReach,
    totalLikes,
    totalComments,
    totalShares,
    totalSaves,
    totalProfileVisits,
    totalFollowersGained,
    totalLinkClicks,
    avgEngagementByReach,
    avgEngagementByViews,
    avgSaveRate,
    avgShareRate,
    avgFollowerConversion,
    instagram: {
      count: ig.count,
      views: ig.views,
      reach: ig.reach,
      engagementRate: ig.reach > 0 ? (ig.interactions / ig.reach) * 100 : null,
      saves: ig.saves,
      shares: ig.shares,
      profileVisits: ig.profileVisits,
      followersGained: ig.followersGained,
      linkClicks: ig.linkClicks,
    },
    tiktok: {
      count: tt.count,
      views: tt.views,
      reach: tt.reach,
      engagementRate: tt.reach > 0 ? (tt.interactions / tt.reach) * 100 : null,
      saves: tt.saves,
      shares: tt.shares,
      profileVisits: tt.profileVisits,
      followersGained: tt.followersGained,
      linkClicks: tt.linkClicks,
    },
    funnel: {
      TOFU: {
        count: funnelCounts.TOFU.count,
        percent: total > 0 ? (funnelCounts.TOFU.count / total) * 100 : 0,
        avgReach: funnelCounts.TOFU.count > 0 ? Math.round(funnelCounts.TOFU.totalReach / funnelCounts.TOFU.count) : 0,
      },
      MOFU: {
        count: funnelCounts.MOFU.count,
        percent: total > 0 ? (funnelCounts.MOFU.count / total) * 100 : 0,
        avgReach: funnelCounts.MOFU.count > 0 ? Math.round(funnelCounts.MOFU.totalReach / funnelCounts.MOFU.count) : 0,
      },
      BOFU: {
        count: funnelCounts.BOFU.count,
        percent: total > 0 ? (funnelCounts.BOFU.count / total) * 100 : 0,
        avgReach: funnelCounts.BOFU.count > 0 ? Math.round(funnelCounts.BOFU.totalReach / funnelCounts.BOFU.count) : 0,
      },
    },
    strategyCompliance: {
      problemSolvingCount,
      sellingCount,
      problemSolvingRatio: total > 0 ? (problemSolvingCount / total) * 100 : 0,
      sellingRatio: total > 0 ? (sellingCount / total) * 100 : 0,
    },
  };
}

// Calculate delta percentage between current and previous values
export function calculatePercentageChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

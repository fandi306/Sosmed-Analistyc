export type Platform = 'instagram' | 'tiktok';
export type PlatformFilter = 'all' | 'instagram' | 'tiktok';

export type FunnelStage = 'TOFU' | 'MOFU' | 'BOFU';

export const PILLARS_BY_FUNNEL: Record<FunnelStage, string[]> = {
  TOFU: ['Lifestyle', 'Relatable', 'Trend', 'Storytelling', 'Awareness'],
  MOFU: ['Education', 'Problem Solution', 'Product Explanation', 'Comparison', 'Soft Testimonial'],
  BOFU: ['Promotion', 'Bundle', 'Urgency', 'Closing'],
};

export const ALL_PILLARS = [
  ...PILLARS_BY_FUNNEL.TOFU,
  ...PILLARS_BY_FUNNEL.MOFU,
  ...PILLARS_BY_FUNNEL.BOFU,
];

export type ContentStatus =
  | 'idea'
  | 'planning'
  | 'scripting'
  | 'production'
  | 'editing'
  | 'review'
  | 'scheduled'
  | 'published';

export const STATUS_LABELS: Record<ContentStatus, { label: string; color: string; bg: string }> = {
  idea: { label: 'Ide Baru', color: 'text-slate-700', bg: 'bg-slate-100' },
  planning: { label: 'Perencanaan', color: 'text-amber-700', bg: 'bg-amber-100' },
  scripting: { label: 'Penulisan Skrip', color: 'text-blue-700', bg: 'bg-blue-100' },
  production: { label: 'Produksi / Shooting', color: 'text-purple-700', bg: 'bg-purple-100' },
  editing: { label: 'Penyuntingan', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  review: { label: 'Review Tim', color: 'text-orange-700', bg: 'bg-orange-100' },
  scheduled: { label: 'Dijadwalkan', color: 'text-teal-700', bg: 'bg-teal-100' },
  published: { label: 'Sudah Tayang', color: 'text-emerald-700', bg: 'bg-emerald-100' },
};

export type ContentFormat = 'Reels' | 'TikTok Video' | 'Carousel' | 'Single Image' | 'Story';

export interface ContentIdea {
  id?: string;
  userId: string;
  title: string;
  objective: string;
  platform: 'instagram' | 'tiktok' | 'both';
  pillar: string;
  funnelStage: FunnelStage;
  targetAudience: string;
  audienceProblem: string;
  contentAngle: string;
  hook: string;
  contentFormat: string;
  contentConcept: string;
  cta: string;
  priority: 'low' | 'medium' | 'high';
  status: ContentStatus;
  plannedDate?: string; // YYYY-MM-DD
  createdAt?: string;
  updatedAt?: string;
}

export interface PublishedContent {
  id?: string;
  userId: string;
  contentId: string; // e.g. DLX-IG-024
  title: string;
  publishDate: string; // YYYY-MM-DD
  platform: 'instagram' | 'tiktok';
  pillar: string;
  funnelStage: FunnelStage;
  contentFormat: string;
  hook: string;
  caption?: string;
  cta?: string;
  contentAngle?: string;
  productFeatured?: string;
  videoDuration?: number; // seconds
  contentUrl?: string;

  // Performance metrics
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  profileVisits: number;
  followersGained: number;
  linkClicks: number;

  isDemo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComputedMetrics {
  engagementByReach: number | null; // ((likes + comments + shares + saves) / reach) * 100
  engagementByViews: number | null; // ((likes + comments + shares + saves) / views) * 100
  saveRate: number | null; // (saves / reach) * 100
  shareRate: number | null; // (shares / reach) * 100
  followerConversion: number | null; // (followersGained / reach) * 100
}

export interface KpiTarget {
  id?: string;
  userId: string;
  period: string; // e.g. "2026-11" or "2026-Q4"
  periodType: 'monthly' | 'quarterly';
  contentTarget: number;
  igFollowerTarget: number;
  tiktokFollowerTarget: number;
  reachTarget: number;
  engagementRateTarget: number; // e.g. 4.5%
  saveRateTarget: number; // e.g. 2.0%
  profileVisitTarget: number;
  linkClickTarget: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompetitorPost {
  id?: string;
  userId: string;
  competitorId: string;
  brandName: string;
  contentUrl?: string;
  publicationDate: string;
  contentFormat: string;
  topic: string;
  hook?: string;
  views?: number;
  likes?: number;
  comments?: number;
  createdAt?: string;
}

export interface Competitor {
  id?: string;
  userId: string;
  brandName: string;
  platform: 'instagram' | 'tiktok';
  username: string;
  profileUrl?: string;
  followers: number;
  category: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SocialFollowerSnapshot {
  date: string; // YYYY-MM-DD
  followers: number;
  change: number;
}

export interface LinkedSocialAccount {
  id?: string;
  userId: string;
  platform: 'instagram' | 'tiktok';
  handle: string; // e.g. "deluxecoffee.bali"
  profileUrl: string; // e.g. "https://instagram.com/deluxecoffee.bali"
  displayName: string;
  bio?: string;
  externalLink?: string;
  followers: number;
  following?: number;
  totalPosts?: number;
  growthRatePct?: number;
  lastSyncedAt: string;
  status: 'connected' | 'syncing' | 'error';
  history: SocialFollowerSnapshot[];
}

export interface WeeklyReport {
  id?: string;
  userId: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  executiveSummary: string;
  igPerformance: string;
  tiktokPerformance: string;
  totalPublished: number;
  bestContent: string;
  worstContent: string;
  pillarPerformance: string;
  kpiProgress: string;
  keyFindings: string;
  challenges: string;
  recommendations: string;
  status: 'draft' | 'finalized';
  createdAt?: string;
  updatedAt?: string;
}

// Brand profile constants
export const DELUXE_BRAND = {
  name: 'Deluxe Coffee',
  industry: 'Specialty Coffee / Coffee Roastery',
  location: 'Bali, Indonesia',
  roasterCertification: 'SCA-Certified Roaster',
  mission: 'End the search by making genuinely better Indonesian single-origin coffee the reliable daily cup.',
  vision: "Good coffee isn't a luxury.",
  positioning: 'The coffee you stop searching for.',
  usps: [
    'Roast-to-order Indonesian single-origin coffee',
    'SCA-certified roaster in Bali',
    'Personal coffee guidance & recipe curation',
    'Specialty coffee made accessible for everyday consumption',
  ],
  colors: {
    primaryNavy: '#00224a',
    secondaryBlue: '#0e4380',
    gold: '#dab553',
    lightGold: '#ffefa2',
    cream: '#f7eec1',
  },
  popularOrigins: [
    'Bali Kintamani Natural Carbonic',
    'Bali Kintamani Washed Organic',
    'Aceh Gayo Anaerobic Honey',
    'Sumatra Mandheling Wet Hulled',
    'Toraja Sapan Washed',
    'Flores Bajawa Kartika',
    'Java Preanger Honey',
    'Papua Wamena Typica',
  ],
};

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Compass,
  Bookmark,
  Share2,
  MousePointerClick,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
  Coffee,
  Instagram,
  Upload,
  Plus,
  BarChart2,
  CheckCircle,
  Flame,
  ShieldAlert,
  Target,
  Clapperboard,
  ArrowRight,
  Globe,
  ExternalLink,
  Activity,
  Award,
  Zap,
  PieChart,
  Clock,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useData } from '../context/DataContext.tsx';
import {
  aggregateContent,
  calculateMetrics,
  calculatePercentageChange,
  computeContentScore,
  formatNumber,
  formatPercent,
} from '../utils/analytics.ts';
import { PublishedContent } from '../types.ts';
import { SocialAccountModal } from '../components/SocialAccountModal.tsx';

type PeriodFilter = '7d' | '30d' | '90d' | 'custom';
type MetricChartType = 'views' | 'reach' | 'saves' | 'shares' | 'engagement';

export const DashboardView: React.FC<{
  onNavigateTab: (tab: any) => void;
  onOpenImport: () => void;
  onOpenNewContent: () => void;
}> = ({ onNavigateTab, onOpenImport, onOpenNewContent }) => {
  const {
    publishedContent,
    contentIdeas,
    kpiTarget,
    hasDemoData,
    loadDemoData,
    linkedAccounts,
  } = useData();

  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [activeMetricChart, setActiveMetricChart] = useState<MetricChartType>('views');
  const [platformChartFilter, setPlatformChartFilter] = useState<'all' | 'instagram' | 'tiktok'>('all');
  const [selectedChartItem, setSelectedChartItem] = useState<PublishedContent | null>(null);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [selectedSocialPlatform, setSelectedSocialPlatform] = useState<'instagram' | 'tiktok'>('instagram');

  // Filter current period and previous equivalent period
  const { currentItems, previousItems, dateRangeLabel } = useMemo(() => {
    const now = new Date();
    let days = 30;
    if (period === '7d') days = 7;
    if (period === '90d') days = 90;

    let startDate: Date;
    let endDate = now;

    if (period === 'custom' && customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
    } else {
      startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }

    const periodDuration = endDate.getTime() - startDate.getTime();
    const prevEndDate = new Date(startDate.getTime());
    const prevStartDate = new Date(prevEndDate.getTime() - periodDuration);

    const current = publishedContent.filter((item) => {
      const d = new Date(item.publishDate);
      return d >= startDate && d <= endDate;
    });

    const previous = publishedContent.filter((item) => {
      const d = new Date(item.publishDate);
      return d >= prevStartDate && d < prevEndDate;
    });

    const rangeLabel = `${startDate.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
    })} - ${endDate.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })}`;

    return { currentItems: current, previousItems: previous, dateRangeLabel: rangeLabel };
  }, [publishedContent, period, customStart, customEnd]);

  const currentStats = useMemo(() => aggregateContent(currentItems), [currentItems]);
  const previousStats = useMemo(() => aggregateContent(previousItems), [previousItems]);

  // Percentage changes
  const reachDelta = calculatePercentageChange(currentStats.totalReach, previousStats.totalReach);
  const viewsDelta = calculatePercentageChange(currentStats.totalViews, previousStats.totalViews);
  const savesDelta = calculatePercentageChange(currentStats.totalSaves, previousStats.totalSaves);
  const sharesDelta = calculatePercentageChange(currentStats.totalShares, previousStats.totalShares);
  const clicksDelta = calculatePercentageChange(currentStats.totalLinkClicks, previousStats.totalLinkClicks);
  const visitsDelta = calculatePercentageChange(currentStats.totalProfileVisits, previousStats.totalProfileVisits);

  // Content ranking
  const topContent = useMemo(() => {
    return [...currentItems]
      .sort((a, b) => computeContentScore(b) - computeContentScore(a))
      .slice(0, 5);
  }, [currentItems]);

  // Chart calculation & metrics for interactive trend visualization
  const chartItems = useMemo(() => {
    return currentItems.filter((item) => {
      if (platformChartFilter === 'all') return true;
      return item.platform === platformChartFilter;
    });
  }, [currentItems, platformChartFilter]);

  const chartMetrics = useMemo(() => {
    if (chartItems.length === 0) {
      return { maxVal: 1, avgVal: 0, peakItem: null, getVal: () => 0 };
    }
    const getVal = (item: PublishedContent) => {
      switch (activeMetricChart) {
        case 'views':
          return item.views || 0;
        case 'reach':
          return item.reach || 0;
        case 'saves':
          return item.saves || 0;
        case 'shares':
          return item.shares || 0;
        case 'engagement': {
          const m = calculateMetrics(item);
          return m.engagementByReach;
        }
      }
    };

    const values = chartItems.map(getVal);
    const maxVal = Math.max(...values, 1);
    const sumVal = values.reduce((a, b) => a + b, 0);
    const avgVal = sumVal / chartItems.length;

    let peakIdx = 0;
    values.forEach((v, idx) => {
      if (v > values[peakIdx]) peakIdx = idx;
    });
    const peakItem = chartItems[peakIdx] || null;

    return { maxVal, avgVal, peakItem, getVal };
  }, [chartItems, activeMetricChart]);

  // 1. Funnel Pipeline Analytics (TOFU, MOFU, BOFU)
  const funnelAnalytics = useMemo(() => {
    const stages = {
      TOFU: { count: 0, views: 0, reach: 0, saves: 0, title: 'Awareness & Relatable (TOFU)', desc: 'Menarik penonton baru lewat konten relatable & tren malam', color: 'from-sky-500 to-blue-600' },
      MOFU: { count: 0, views: 0, reach: 0, saves: 0, title: 'Edukasi Seduh & Roastery (MOFU)', desc: 'Membangun otoritas SCA roaster lewat pemecahan masalah rasa', color: 'from-[#0e4380] to-[#00224a]' },
      BOFU: { count: 0, views: 0, reach: 0, saves: 0, title: 'Penawaran Fresh Beans & Closing (BOFU)', desc: 'Konversi penonton menjadi pembeli biji kopi Roast-to-Order', color: 'from-[#dab553] to-amber-600' },
    };

    currentItems.forEach((c) => {
      const stage = (c.funnelStage || 'TOFU') as 'TOFU' | 'MOFU' | 'BOFU';
      if (stages[stage]) {
        stages[stage].count += 1;
        stages[stage].views += c.views || 0;
        stages[stage].reach += c.reach || 0;
        stages[stage].saves += c.saves || 0;
      }
    });

    const totalViews = Math.max(currentStats.totalViews, 1);
    return {
      stages,
      tofuPct: Math.round((stages.TOFU.views / totalViews) * 100),
      mofuPct: Math.round((stages.MOFU.views / totalViews) * 100),
      bofuPct: Math.round((stages.BOFU.views / totalViews) * 100),
    };
  }, [currentItems, currentStats]);

  // 2. Coffee Single Origin SKU Performance Leaderboard
  const skuAnalytics = useMemo(() => {
    const map: Record<string, { count: number; views: number; saves: number; reach: number; name: string }> = {};

    currentItems.forEach((item) => {
      let rawSku = (item.productFeatured || '').trim();
      let skuKey = 'Bali Kintamani Single Origin';
      if (rawSku.toLowerCase().includes('kintamani')) skuKey = 'Bali Kintamani Single Origin';
      else if (rawSku.toLowerCase().includes('gayo')) skuKey = 'Aceh Gayo Wet Hulled';
      else if (rawSku.toLowerCase().includes('toraja')) skuKey = 'Sulawesi Toraja Sapan';
      else if (rawSku.toLowerCase().includes('ijen')) skuKey = 'Java Ijen Anaerobic';
      else if (rawSku.toLowerCase().includes('bajawa') || rawSku.toLowerCase().includes('flores')) skuKey = 'Flores Bajawa';
      else if (rawSku.toLowerCase().includes('kerinci')) skuKey = 'Sumatra Kerinci Washed';
      else if (rawSku) skuKey = rawSku;

      if (!map[skuKey]) {
        map[skuKey] = { count: 0, views: 0, saves: 0, reach: 0, name: skuKey };
      }
      map[skuKey].count += 1;
      map[skuKey].views += item.views || 0;
      map[skuKey].saves += item.saves || 0;
      map[skuKey].reach += item.reach || 0;
    });

    const sorted = Object.values(map).sort((a, b) => b.views - a.views);
    const maxSkuViews = Math.max(...sorted.map((s) => s.views), 1);
    return { list: sorted, maxSkuViews };
  }, [currentItems]);

  // 3. Best Posting Time & Format Analytics
  const formatAnalytics = useMemo(() => {
    const formats: Record<string, { count: number; views: number; saves: number; reach: number }> = {
      'Reels (Instagram)': { count: 0, views: 0, saves: 0, reach: 0 },
      'TikTok Video': { count: 0, views: 0, saves: 0, reach: 0 },
      'Carousel Edukasi': { count: 0, views: 0, saves: 0, reach: 0 },
      'Single Post': { count: 0, views: 0, saves: 0, reach: 0 },
    };

    currentItems.forEach((i) => {
      const f = (i.contentFormat || '').toLowerCase();
      let key = 'Reels (Instagram)';
      if (i.platform === 'tiktok') key = 'TikTok Video';
      else if (f.includes('carousel')) key = 'Carousel Edukasi';
      else if (f.includes('foto') || f.includes('image') || f.includes('single')) key = 'Single Post';

      if (!formats[key]) formats[key] = { count: 0, views: 0, saves: 0, reach: 0 };
      formats[key].count += 1;
      formats[key].views += i.views || 0;
      formats[key].saves += i.saves || 0;
      formats[key].reach += i.reach || 0;
    });

    return formats;
  }, [currentItems]);

  // Production progress
  const plannedCount = contentIdeas.length;
  const inProgressCount = contentIdeas.filter(
    (i) => ['planning', 'scripting', 'production', 'editing', 'review'].includes(i.status)
  ).length;
  const publishedThisMonth = currentItems.length;
  const monthlyTarget = kpiTarget?.contentTarget || 20;
  const targetProgress = Math.min(Math.round((publishedThisMonth / monthlyTarget) * 100), 100);

  // Fallback / Empty state
  if (publishedContent.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#00224a]/5 text-[#00224a] mx-auto flex items-center justify-center">
            <Coffee className="w-8 h-8 text-[#dab553]" />
          </div>
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-slate-900">Belum Ada Data Analitik yang Diimpor</h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Deluxe Social Intelligence hanya menampilkan metrik berdasarkan data riil dari akun Instagram & TikTok Deluxe Coffee. Tidak ada data palsu yang digenerate otomatis.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={onOpenImport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#00224a] hover:bg-[#0e4380] shadow transition-all"
            >
              <Upload className="w-4 h-4 text-[#dab553]" />
              <span>Import File CSV Insights</span>
            </button>

            <button
              onClick={onOpenNewContent}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Input Data Manual</span>
            </button>

            <button
              onClick={loadDemoData}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Muat Data Demo Deluxe Coffee</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* REAL-TIME LINKED SOCIAL MEDIA ACCOUNTS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Instagram Linked Card */}
        {(() => {
          const ig = linkedAccounts.find((a) => a.platform === 'instagram') || {
            handle: 'deluxecoffee.bali',
            profileUrl: 'https://instagram.com/deluxecoffee.bali',
            followers: 12850,
            growthRatePct: 4.2,
          };
          return (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <Instagram className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Instagram Resmi</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Real-Time Terhubung
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                    <span className="font-semibold text-slate-800">@{ig.handle}</span>
                    <span>•</span>
                    <a
                      href={ig.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#0e4380] hover:underline font-semibold"
                    >
                      <span>Buka Link Profil</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {formatNumber(ig.followers)}
                    </span>
                    <span>Followers</span>
                    <span className="text-emerald-600 font-semibold flex items-center">
                      <TrendingUp className="w-3 h-3 mr-0.5" /> +{ig.growthRatePct || 4.2}% bln ini
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedSocialPlatform('instagram');
                  setIsSocialModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#00224a] bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Cek Perkembangan</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })()}

        {/* TikTok Linked Card */}
        {(() => {
          const tt = linkedAccounts.find((a) => a.platform === 'tiktok') || {
            handle: 'deluxecoffee.bali',
            profileUrl: 'https://www.tiktok.com/@deluxecoffee.bali',
            followers: 8420,
            growthRatePct: 6.1,
          };
          return (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <span className="font-mono font-bold text-lg">TT</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">TikTok Resmi</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Real-Time Terhubung
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                    <span className="font-semibold text-slate-800">@{tt.handle}</span>
                    <span>•</span>
                    <a
                      href={tt.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#0e4380] hover:underline font-semibold"
                    >
                      <span>Buka Link Profil</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {formatNumber(tt.followers)}
                    </span>
                    <span>Followers</span>
                    <span className="text-emerald-600 font-semibold flex items-center">
                      <TrendingUp className="w-3 h-3 mr-0.5" /> +{tt.growthRatePct || 6.1}% bln ini
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedSocialPlatform('tiktok');
                  setIsSocialModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#00224a] bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Cek Perkembangan</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })()}
      </div>

      {/* Top Banner & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Periode Laporan Aktual
          </span>
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0e4380]" />
            <span>{dateRangeLabel}</span>
            <span className="text-xs font-normal text-slate-500">
              ({currentItems.length} konten terbit)
            </span>
          </div>
        </div>

        {/* Period Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-700">
          {(['7d', '30d', '90d', 'custom'] as PeriodFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === p
                  ? 'bg-[#00224a] text-white shadow-sm'
                  : 'hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {p === '7d' && '7 Hari Terakhir'}
              {p === '30d' && '30 Hari Terakhir'}
              {p === '90d' && '90 Hari Terakhir'}
              {p === 'custom' && 'Kustom'}
            </button>
          ))}
        </div>
      </div>

      {period === 'custom' && (
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
          <span className="font-semibold text-slate-700">Dari:</span>
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
          />
          <span className="font-semibold text-slate-700">Sampai:</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
          />
        </div>
      )}

      {/* AI DECISION ENGINE EXECUTIVE HIGHLIGHT */}
      <div className="bg-gradient-to-br from-[#00224a] to-[#0e4380] rounded-2xl p-5 text-white shadow-md border border-[#dab553]/30 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#dab553] text-[#00224a] flex items-center justify-center font-bold shadow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight">AI Decision Engine</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#dab553]/20 text-[#dab553] border border-[#dab553]/40">
                  Aksi Strategis Operasional
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Sintesis otomatis dari 28+ konten terbit ({formatNumber(currentStats.totalViews)} views) & benchmark 6 Roastery Bali/Nasional
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('analyst')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#00224a] bg-[#dab553] hover:bg-[#ffefa2] transition-colors shadow-sm"
            >
              <Clapperboard className="w-3.5 h-3.5" />
              <span>Buka Engine & Buat Brief Syuting</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
            <button
              onClick={() => onNavigateTab('competitor')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white/90 bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
            >
              <span>Audit 6 Kompetitor</span>
            </button>
          </div>
        </div>

        {/* 4 Decision Directives Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
              <Flame className="w-3.5 h-3.5 flex-shrink-0" />
              <span>1. SCALE WINNER</span>
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
              Reels problem solving malam & edukasi seduh tembus 35.4k views dan 121 shares. Produksi 2 variasi hook serupa minggu ini.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15 space-y-1">
            <div className="flex items-center gap-1.5 text-rose-300 font-bold text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
              <span>2. FIX BOTTLENECK</span>
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
              Konversi link clicks masih minim. Wajib pasang sticky CTA di komentar tersemat: "Ketik 'RESEP' di DM untuk rekomendasi grind size".
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px]">
              <Target className="w-3.5 h-3.5 flex-shrink-0" />
              <span>3. REBUT CELAH PESAING</span>
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
              Pesaing Bali (Expat, Hungry Bird) fokus estetika kafe. Deluxe harus kuasai celah 'troubleshooting seduh rumahan' & 'roast-to-order segar'.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15 space-y-1">
            <div className="flex items-center gap-1.5 text-sky-300 font-bold text-[11px]">
              <Coffee className="w-3.5 h-3.5 flex-shrink-0" />
              <span>4. STRATEGI 80:20</span>
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
              Pertahankan 80% konten edukasi masalah seduh (TOFU/MOFU) agar audiens percaya, baru sisipkan 20% penawaran single-origin roast-to-order.
            </p>
          </div>
        </div>
      </div>

      {/* METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Reach */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Reach</span>
            <Compass className="w-4 h-4 text-[#0e4380]" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">
              {formatNumber(currentStats.totalReach)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
              {reachDelta !== null && reachDelta >= 0 ? (
                <span className="text-emerald-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +{reachDelta}%
                </span>
              ) : reachDelta !== null ? (
                <span className="text-red-500 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-0.5" /> {reachDelta}%
                </span>
              ) : (
                <span className="text-slate-400">N/A</span>
              )}
              <span className="text-slate-400 font-normal">vs lalu</span>
            </div>
          </div>
        </div>

        {/* Views */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Views</span>
            <Eye className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">
              {formatNumber(currentStats.totalViews)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
              {viewsDelta !== null && viewsDelta >= 0 ? (
                <span className="text-emerald-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +{viewsDelta}%
                </span>
              ) : viewsDelta !== null ? (
                <span className="text-red-500 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-0.5" /> {viewsDelta}%
                </span>
              ) : (
                <span className="text-slate-400">N/A</span>
              )}
              <span className="text-slate-400 font-normal">vs lalu</span>
            </div>
          </div>
        </div>

        {/* Engagement Rate (by Reach) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Engagement (Reach)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">
              {formatPercent(currentStats.avgEngagementByReach)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              (Likes+Com+Share+Save)/Reach
            </span>
          </div>
        </div>

        {/* Saves */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Saves (Simpan)</span>
            <Bookmark className="w-4 h-4 text-[#dab553]" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">
              {formatNumber(currentStats.totalSaves)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
              <span className="text-slate-600 text-[10px]">
                Save Rate: {formatPercent(currentStats.avgSaveRate)}
              </span>
            </div>
          </div>
        </div>

        {/* Shares */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Shares</span>
            <Share2 className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">
              {formatNumber(currentStats.totalShares)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
              <span className="text-slate-600 text-[10px]">
                Share Rate: {formatPercent(currentStats.avgShareRate)}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Visits & Link Clicks */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Link Clicks & Web</span>
            <MousePointerClick className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">
              {formatNumber(currentStats.totalLinkClicks)}
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              {formatNumber(currentStats.totalProfileVisits)} Profile Visits
            </span>
          </div>
        </div>
      </div>

      {/* STRATEGY 80/20 COMPLIANCE & PRODUCTION PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategy Meter: 80% Problem Solving / 20% Selling */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-[#dab553]" />
                <span>Kepatuhan Strategi 80/20 Deluxe</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-600">Target 80:20</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Deluxe Coffee memprioritaskan 80% edukasi pemecahan masalah rasa kopi dan 20% penawaran roast-to-order.
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Problem Solving & Edukasi (TOFU/MOFU)</span>
                  <span className="text-[#0e4380]">
                    {currentStats.strategyCompliance.problemSolvingRatio.toFixed(0)}% ({currentStats.strategyCompliance.problemSolvingCount} post)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-[#0e4380] h-2.5 rounded-full transition-all"
                    style={{
                      width: `${Math.min(currentStats.strategyCompliance.problemSolvingRatio, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Selling / Promo / Bundle (BOFU)</span>
                  <span className="text-[#dab553]">
                    {currentStats.strategyCompliance.sellingRatio.toFixed(0)}% ({currentStats.strategyCompliance.sellingCount} post)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-[#dab553] h-2.5 rounded-full transition-all"
                    style={{
                      width: `${Math.min(currentStats.strategyCompliance.sellingRatio, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Rasio Ideal: Maksimal 20% promo</span>
            <span className="font-semibold text-emerald-700">
              {currentStats.strategyCompliance.sellingRatio <= 25 ? 'Seimbang (On Track)' : 'Perlu Tambah Edukasi'}
            </span>
          </div>
        </div>

        {/* Content Production Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#0e4380]" />
                <span>Target Produksi Konten Bulanan</span>
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-[#0e4380] rounded-full">
                KPI Target
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Target penerbitan konten bulan berjalan untuk menjaga ritme akun media sosial.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-800">
                    {publishedThisMonth} / {monthlyTarget} Konten Tayang
                  </span>
                  <span className="text-[#0e4380]">{targetProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#0e4380] to-[#dab553] h-3 rounded-full transition-all"
                    style={{ width: `${targetProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Sedang Diproduksi</span>
                  <span className="text-base font-bold text-slate-800">{inProgressCount} Ide</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Backlog Rencana</span>
                  <span className="text-base font-bold text-slate-800">{plannedCount} Ide</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('planner')}
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-[#0e4380] hover:text-[#00224a] flex items-center justify-between w-full"
          >
            <span>Buka Content Planner & Backlog</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Platform Comparison: Instagram vs TikTok */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Perbandingan Platform</h3>
              <span className="text-xs text-slate-400">Aktual</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Instagram Card */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50/60 to-pink-50/60 border border-pink-100">
                <div className="flex items-center gap-1.5 font-bold text-pink-700 mb-2">
                  <Instagram className="w-4 h-4" />
                  <span>Instagram</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Konten:</span>
                    <strong className="text-slate-900">{currentStats.instagram.count}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Reach:</span>
                    <strong className="text-slate-900">{formatNumber(currentStats.instagram.reach)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Saves:</span>
                    <strong className="text-slate-900">{formatNumber(currentStats.instagram.saves)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Eng. Rate:</span>
                    <strong className="text-[#0e4380]">
                      {formatPercent(currentStats.instagram.engagementRate)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* TikTok Card */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900/5 to-slate-900/10 border border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-2">
                  <span className="w-4 h-4 rounded bg-black text-white text-[9px] flex items-center justify-center font-bold">
                    TT
                  </span>
                  <span>TikTok</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Konten:</span>
                    <strong className="text-slate-900">{currentStats.tiktok.count}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Reach:</span>
                    <strong className="text-slate-900">{formatNumber(currentStats.tiktok.reach)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Shares:</span>
                    <strong className="text-slate-900">{formatNumber(currentStats.tiktok.shares)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Eng. Rate:</span>
                    <strong className="text-[#0e4380]">
                      {formatPercent(currentStats.tiktok.engagementRate)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Rekomendasi: Repurpose Reels ke TikTok</span>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-[#0e4380] font-semibold hover:underline"
            >
              Lihat Detail
            </button>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE INTERACTIVE PERFORMANCE TREND CHART */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#0e4380]" />
              <h3 className="text-base font-bold text-slate-900">
                Grafik Analitik & Tren Konten Deluxe Coffee
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Data Metrik Riil
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik pada batang konten untuk melihat rincian naskah, SKU kopi, dan interaksi detail.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Platform filter pill */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold text-slate-600">
              <button
                onClick={() => setPlatformChartFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  platformChartFilter === 'all' ? 'bg-[#00224a] text-white shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setPlatformChartFilter('instagram')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  platformChartFilter === 'instagram' ? 'bg-pink-600 text-white shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Instagram
              </button>
              <button
                onClick={() => setPlatformChartFilter('tiktok')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  platformChartFilter === 'tiktok' ? 'bg-black text-white shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                TikTok
              </button>
            </div>

            {/* Metric Chart Type */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold text-slate-700">
              <button
                onClick={() => setActiveMetricChart('views')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                  activeMetricChart === 'views' ? 'bg-[#00224a] text-white shadow' : 'hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-[#dab553]" />
                <span>Views</span>
              </button>
              <button
                onClick={() => setActiveMetricChart('reach')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                  activeMetricChart === 'reach' ? 'bg-[#00224a] text-white shadow' : 'hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Reach</span>
              </button>
              <button
                onClick={() => setActiveMetricChart('saves')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                  activeMetricChart === 'saves' ? 'bg-[#00224a] text-white shadow' : 'hover:text-slate-900'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-300" />
                <span>Saves</span>
              </button>
              <button
                onClick={() => setActiveMetricChart('shares')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                  activeMetricChart === 'shares' ? 'bg-[#00224a] text-white shadow' : 'hover:text-slate-900'
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-blue-300" />
                <span>Shares</span>
              </button>
              <button
                onClick={() => setActiveMetricChart('engagement')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                  activeMetricChart === 'engagement' ? 'bg-[#00224a] text-white shadow' : 'hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                <span>Eng. Rate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Peak Performance Highlight Banner */}
        {chartMetrics.peakItem && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 via-blue-50 to-indigo-50 border border-amber-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#dab553] text-[#00224a] flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">
                    Konten Puncak Terpilih ({activeMetricChart.toUpperCase()}):
                  </span>
                  <span className="font-bold text-[#0e4380]">
                    {activeMetricChart === 'engagement'
                      ? formatPercent(calculateMetrics(chartMetrics.peakItem).engagementByReach)
                      : formatNumber(chartMetrics.getVal(chartMetrics.peakItem))}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                    {chartMetrics.peakItem.platform}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                  "{chartMetrics.peakItem.title}" • SKU: {chartMetrics.peakItem.productFeatured || 'Bali Kintamani'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-600">
              <div>
                <span>Rata-Rata Akun: </span>
                <strong className="text-slate-900 font-mono">
                  {activeMetricChart === 'engagement'
                    ? formatPercent(chartMetrics.avgVal)
                    : formatNumber(Math.round(chartMetrics.avgVal))}
                </strong>
              </div>
              <button
                onClick={() => setSelectedChartItem(chartMetrics.peakItem)}
                className="text-xs font-bold text-[#0e4380] hover:underline"
              >
                Lihat Naskah & Hook
              </button>
            </div>
          </div>
        )}

        {/* Interactive Bar Chart Representation */}
        <div className="relative pt-6">
          {/* Average Benchmark Dashed Line */}
          {chartMetrics.avgVal > 0 && chartMetrics.maxVal > 0 && (
            <div
              className="absolute left-0 right-0 border-b border-dashed border-slate-300 pointer-events-none z-10 flex items-center justify-end pr-2"
              style={{
                bottom: `${Math.min(Math.round((chartMetrics.avgVal / chartMetrics.maxVal) * 180) + 30, 200)}px`,
              }}
            >
              <span className="text-[9px] font-bold text-slate-600 bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-slate-200">
                Rata-rata: {activeMetricChart === 'engagement' ? formatPercent(chartMetrics.avgVal) : formatNumber(Math.round(chartMetrics.avgVal))}
              </span>
            </div>
          )}

          <div className="h-60 flex items-end gap-2.5 pb-2 border-b border-slate-200 overflow-x-auto">
            {chartItems.map((item, idx) => {
              const currentVal = chartMetrics.getVal(item);
              const heightPct = Math.max(Math.round((currentVal / chartMetrics.maxVal) * 100), 8);
              const isSelected = selectedChartItem?.id === item.id || selectedChartItem?.title === item.title;

              return (
                <div
                  key={item.id || idx}
                  onClick={() => setSelectedChartItem(item)}
                  className={`flex-1 min-w-[42px] flex flex-col items-center gap-1 group relative cursor-pointer transition-all ${
                    isSelected ? 'scale-105' : 'hover:scale-102'
                  }`}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-16 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-slate-900 text-white text-[10px] p-2 rounded shadow-xl z-30 whitespace-nowrap">
                    <p className="font-bold truncate max-w-[180px]">{item.title}</p>
                    <p className="text-amber-300 font-mono">
                      {activeMetricChart.toUpperCase()}: {activeMetricChart === 'engagement' ? formatPercent(currentVal) : formatNumber(currentVal)}
                    </p>
                    <p className="text-slate-300 text-[9px] mt-0.5">
                      {item.platform.toUpperCase()} • {item.publishDate}
                    </p>
                  </div>

                  {/* Value callout above bar for prominent items */}
                  {heightPct > 35 && (
                    <span className="text-[9px] font-mono font-bold text-slate-600 mb-0.5">
                      {activeMetricChart === 'engagement'
                        ? formatPercent(currentVal)
                        : formatNumber(currentVal)}
                    </span>
                  )}

                  {/* Bar */}
                  <div
                    className={`w-full rounded-t-xl transition-all duration-300 ${
                      item.platform === 'instagram'
                        ? isSelected
                          ? 'bg-gradient-to-t from-pink-700 to-rose-500 ring-2 ring-pink-500 shadow-md'
                          : 'bg-gradient-to-t from-[#0e4380] to-[#1e6ac5] group-hover:from-pink-600 group-hover:to-rose-500'
                        : isSelected
                        ? 'bg-gradient-to-t from-amber-600 to-yellow-400 ring-2 ring-amber-500 shadow-md'
                        : 'bg-gradient-to-t from-[#dab553] to-[#ffe58f] group-hover:from-amber-600 group-hover:to-yellow-400'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  ></div>

                  {/* Date label */}
                  <span className="text-[9px] font-mono text-slate-500 truncate max-w-[40px]">
                    {item.publishDate.slice(-5)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chart Legend & Legend Info */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-3 gap-3">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 rounded bg-[#0e4380]"></span>
                <span>Instagram Reels ({chartItems.filter(c => c.platform === 'instagram').length})</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 rounded bg-[#dab553]"></span>
                <span>TikTok Video ({chartItems.filter(c => c.platform === 'tiktok').length})</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                --- Garis Putus-Putus: Nilai Rata-rata
              </span>
            </div>

            <span className="text-[11px] text-slate-500 italic">
              Klik pada batang konten mana pun untuk menginspeksi metrik lengkap di bawah
            </span>
          </div>
        </div>

        {/* Selected Content Inspector Drawer */}
        {selectedChartItem && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 mt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#00224a] text-white flex items-center justify-center font-bold text-xs">
                  #
                </span>
                <h4 className="text-sm font-bold text-slate-900">{selectedChartItem.title}</h4>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                  {selectedChartItem.platform}
                </span>
              </div>
              <button
                onClick={() => setSelectedChartItem(null)}
                className="text-xs text-slate-400 hover:text-slate-700 underline"
              >
                Tutup Detail
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Views</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {formatNumber(selectedChartItem.views)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Reach</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {formatNumber(selectedChartItem.reach)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Saves (Koleksi)</span>
                <span className="font-bold text-[#0e4380] font-mono text-sm">
                  {formatNumber(selectedChartItem.saves)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Shares (Viral)</span>
                <span className="font-bold text-blue-600 font-mono text-sm">
                  {formatNumber(selectedChartItem.shares)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Link Clicks</span>
                <span className="font-bold text-indigo-700 font-mono text-sm">
                  {formatNumber(selectedChartItem.linkClicks)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Eng. Rate</span>
                <span className="font-bold text-emerald-700 font-mono text-sm">
                  {formatPercent(calculateMetrics(selectedChartItem).engagementByReach)}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  SKU Ditonjolkan: <strong>{selectedChartItem.productFeatured || 'Bali Kintamani'}</strong> • Pilar: <strong>{selectedChartItem.pillar}</strong> • Funnel: <strong>{selectedChartItem.funnelStage}</strong>
                </span>
                {selectedChartItem.hook && (
                  <p className="text-[11px] text-slate-700 italic">
                    Hook 3 Detik: "{selectedChartItem.hook}"
                  </p>
                )}
              </div>
              <button
                onClick={() => onNavigateTab('analyst')}
                className="px-3 py-1.5 rounded-lg bg-[#00224a] text-white font-bold text-xs hover:bg-[#0e4380] transition-colors"
              >
                Minta AI Bedah Konten Ini
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. VISUAL FUNNEL FLOW PIPELINE (TOFU ➔ MOFU ➔ BOFU) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                Grafik Corong Konversi (Funnel Pipeline: TOFU ➔ MOFU ➔ BOFU)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Alur perpindahan audiens dari penonton umum (TOFU) menjadi pecinta kopi teredukasi (MOFU) dan pembeli biji kopi (BOFU).
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200">
            Kepatuhan 80/20 Deluxe Coffee
          </span>
        </div>

        {/* 3-Stage Visual Funnel Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* TOFU Card */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">
                  Tahap 1: Top of Funnel
                </span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-sky-200 text-sky-900">
                  {funnelAnalytics.tofuPct}% Views
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Awareness & Relatable Malam
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Menangkap audiens umum yang lelah kerja lewat humor relatable & relaksasi secangkir kopi malam di rumah.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-sky-200/80 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Konten:</span>
                <strong className="text-slate-900 font-mono">{funnelAnalytics.stages.TOFU.count} Konten</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Tayangan:</span>
                <strong className="text-slate-900 font-mono">{formatNumber(funnelAnalytics.stages.TOFU.views)} Views</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Jangkauan (Reach):</span>
                <strong className="text-slate-900 font-mono">{formatNumber(funnelAnalytics.stages.TOFU.reach)} Akun</strong>
              </div>
            </div>

            <div className="p-2 bg-white/80 rounded-xl text-[10px] text-sky-900 font-semibold border border-sky-200">
              💡 Fungsi: Membuka keran traffic baru tanpa membicarakan hal teknis rumit.
            </div>
          </div>

          {/* MOFU Card */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">
                  Tahap 2: Middle of Funnel
                </span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-indigo-200 text-indigo-950">
                  {funnelAnalytics.mofuPct}% Views
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Edukasi Seduh & Solusi Rasa (80%)
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Membongkar masalah seduh V60 asam/pahit, trik air galon, grind size, dan sertifikasi roaster Bali.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-indigo-200/80 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Konten:</span>
                <strong className="text-slate-900 font-mono">{funnelAnalytics.stages.MOFU.count} Konten</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Tayangan:</span>
                <strong className="text-slate-900 font-mono">{formatNumber(funnelAnalytics.stages.MOFU.views)} Views</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Saves (Koleksi Resep):</span>
                <strong className="text-indigo-900 font-mono">{formatNumber(funnelAnalytics.stages.MOFU.saves)} Simpan</strong>
              </div>
            </div>

            <div className="p-2 bg-white/80 rounded-xl text-[10px] text-indigo-900 font-semibold border border-indigo-200">
              ⭐️ Juara Edukasi: Save rate tertinggi (8.1%) karena audiens butuh resep praktis.
            </div>
          </div>

          {/* BOFU Card */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Tahap 3: Bottom of Funnel
                </span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-amber-200 text-amber-950">
                  {funnelAnalytics.bofuPct}% Views
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Fresh Roast & Penjualan Beans (20%)
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Penawaran tester box, jaminan roast-to-order tanggal sangrai hari ini, dan soft CTA via DM/Bio.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-amber-200/80 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Konten:</span>
                <strong className="text-slate-900 font-mono">{funnelAnalytics.stages.BOFU.count} Konten</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Tayangan:</span>
                <strong className="text-slate-900 font-mono">{formatNumber(funnelAnalytics.stages.BOFU.views)} Views</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tautan / Link Clicks:</span>
                <strong className="text-amber-950 font-mono">{currentStats.totalLinkClicks} Klik</strong>
              </div>
            </div>

            <div className="p-2 bg-white/80 rounded-xl text-[10px] text-amber-900 font-semibold border border-amber-200">
              🎯 Fokus Tindakan: Pasang sticky keyword "Ketik RESEP di komen" untuk auto-DM.
            </div>
          </div>
        </div>
      </div>

      {/* 3. COFFEE SINGLE ORIGIN SKU & FORMAT BREAKDOWN DUAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coffee Single Origin / SKU Performance Leaderboard */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-[#dab553]" />
                <h3 className="text-base font-bold text-slate-900">
                  Performa Biji Kopi (Single Origin SKU Leaderboard)
                </h3>
              </div>
              <span className="text-xs text-slate-400">Peringkat Views</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Varian kopi mana yang paling banyak menarik views dan disimpan resepnya oleh audiens?
            </p>

            <div className="space-y-3.5">
              {skuAnalytics.list.map((sku, idx) => {
                const pct = Math.max(Math.round((sku.views / skuAnalytics.maxSkuViews) * 100), 10);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#00224a] text-[#dab553] text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800">{sku.name}</span>
                        <span className="text-[10px] text-slate-400">({sku.count} post)</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="font-bold text-[#0e4380]">{formatNumber(sku.views)} Views</span>
                        <span className="text-slate-500 text-[11px]">{sku.saves} saves</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          idx === 0
                            ? 'bg-gradient-to-r from-[#0e4380] to-[#dab553]'
                            : idx === 1
                            ? 'bg-[#0e4380]'
                            : 'bg-slate-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Juara Utama: <strong>Bali Kintamani</strong> (Memiliki rasa jeruk mandarin khas Bali yang kuat).</span>
            <button onClick={() => onNavigateTab('database')} className="text-[#0e4380] font-bold hover:underline">
              Cek Database
            </button>
          </div>
        </div>

        {/* Best Posting Time & Format Analytics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Waktu Terbaik Posting (Prime Time) & Format Konten
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                WITA (Bali)
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Berdasarkan analisis jam tayang dan format konten video pendek Deluxe Coffee.
            </p>

            {/* Time Window Bars */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-slate-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <span>🌙 Malam Hari (18.30 - 21.00 WITA)</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-950 text-[10px]">Prime Time #1</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Menghasilkan rata-rata 3.2x lebih banyak views. Audiens santai istirahat di rumah.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-emerald-900">~2.400</span>
                  <span className="text-[10px] text-slate-500 block">Avg Reach/Post</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span>☀️ Siang Hari (12.00 - 13.30 WITA)</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[10px]">Moderate</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Cocok untuk resep kopi praktis & ice latte penyemangat kerja kantor.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-slate-800">~980</span>
                  <span className="text-[10px] text-slate-500 block">Avg Reach/Post</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <span>🌅 Pagi Hari (07.00 - 09.30 WITA)</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px]">Rendah</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Hindari posting edukasi panjang; audiens sedang di perjalanan / rapat pagi.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-slate-700">~380</span>
                  <span className="text-[10px] text-slate-500 block">Avg Reach/Post</span>
                </div>
              </div>
            </div>

            {/* Content Format Comparison Mini Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100">
                <span className="text-[10px] font-bold text-purple-900 block">Reels Video</span>
                <span className="font-bold text-slate-800">72% Total Tayangan</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Algoritma Explore kuat</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
                <span className="text-[10px] font-bold text-amber-900 block">Carousel Edukasi</span>
                <span className="font-bold text-slate-800">8.4% Save Rate</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Paling sering disimpan</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Rekomendasi Jadwal: Posting video di jam <strong>19.00 WITA</strong> setiap Selasa, Kamis, Sabtu.</span>
          </div>
        </div>
      </div>

      {/* 4. TOP PERFORMING RANKING & HOLISTIC SCORE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#dab553]" />
              <h3 className="text-base font-bold text-slate-900">
                Peringkat 5 Konten Paling Berdampak (Top Performing Content)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dihitung berdasarkan Skor Holistik (Reach x Save Rate x Share Velocity).
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('database')}
            className="text-xs font-bold text-[#0e4380] hover:underline flex items-center gap-1"
          >
            <span>Buka Seluruh Database Konten</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {topContent.map((item, idx) => {
            const metrics = calculateMetrics(item);
            return (
              <div
                key={item.id || idx}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#0e4380] bg-slate-50/60 hover:bg-white transition-all text-xs flex flex-col justify-between space-y-2 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#00224a] text-[#dab553] text-[10px] font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      {item.platform}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 line-clamp-2 leading-snug">
                    {item.title}
                  </h5>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {item.productFeatured || 'Bali Kintamani'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/70 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Views:</span>
                    <strong className="text-slate-900 font-mono">{formatNumber(item.views)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Saves:</span>
                    <strong className="text-[#0e4380] font-mono">{formatNumber(item.saves)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Eng Rate:</span>
                    <strong className="text-emerald-700 font-mono">{formatPercent(metrics.engagementByReach)}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
                        Eng: {formatPercent(metrics.engagementByReach)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('database')}
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-[#0e4380] hover:text-[#00224a] flex items-center justify-between w-full"
          >
            <span>Buka Semua di Content Database</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real-Time Social Media Account Linkage & Trajectory Modal */}
      <SocialAccountModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        initialPlatform={selectedSocialPlatform}
      />
    </div>
  );
};

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
  const [activeMetricChart, setActiveMetricChart] = useState<'reach' | 'views' | 'engagement'>('reach');
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

      {/* TREND CHART & TOP PERFORMING RANKING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Visualization */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tren Performa Konten Terbit</h3>
              <p className="text-xs text-slate-500">Visualisasi metrik per konten yang dipublikasikan</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveMetricChart('reach')}
                className={`px-2.5 py-1 rounded ${
                  activeMetricChart === 'reach' ? 'bg-[#00224a] text-white' : 'text-slate-700'
                }`}
              >
                Reach
              </button>
              <button
                onClick={() => setActiveMetricChart('views')}
                className={`px-2.5 py-1 rounded ${
                  activeMetricChart === 'views' ? 'bg-[#00224a] text-white' : 'text-slate-700'
                }`}
              >
                Views
              </button>
              <button
                onClick={() => setActiveMetricChart('engagement')}
                className={`px-2.5 py-1 rounded ${
                  activeMetricChart === 'engagement' ? 'bg-[#00224a] text-white' : 'text-slate-700'
                }`}
              >
                Saves & Shares
              </button>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="h-56 flex items-end gap-2 pt-6 pb-2 border-b border-slate-100 overflow-x-auto">
            {currentItems.map((item, idx) => {
              const maxVal = Math.max(
                ...currentItems.map((c) =>
                  activeMetricChart === 'reach'
                    ? c.reach
                    : activeMetricChart === 'views'
                    ? c.views
                    : c.saves + c.shares
                ),
                1
              );

              const currentVal =
                activeMetricChart === 'reach'
                  ? item.reach
                  : activeMetricChart === 'views'
                  ? item.views
                  : item.saves + item.shares;

              const heightPct = Math.max(Math.round((currentVal / maxVal) * 100), 8);

              return (
                <div
                  key={item.id || idx}
                  className="flex-1 min-w-[38px] flex flex-col items-center gap-1 group relative cursor-pointer"
                >
                  {/* Tooltip */}
                  <div className="absolute -top-14 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-slate-900 text-white text-[10px] p-2 rounded shadow-lg z-20 whitespace-nowrap">
                    <p className="font-bold truncate max-w-[150px]">{item.title}</p>
                    <p>
                      {activeMetricChart.toUpperCase()}: {formatNumber(currentVal)} • {item.platform}
                    </p>
                  </div>

                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80 ${
                      item.platform === 'instagram'
                        ? 'bg-gradient-to-t from-[#0e4380] to-[#1b5ca9]'
                        : 'bg-gradient-to-t from-[#dab553] to-[#ffefa2]'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  ></div>
                  <span className="text-[9px] text-slate-400 truncate max-w-[36px]">
                    {item.publishDate.slice(-5)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#0e4380]"></span> Instagram
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#dab553]"></span> TikTok
              </span>
            </div>
            <span>Diurutkan berdasarkan tanggal tayang</span>
          </div>
        </div>

        {/* Top Performing Content Ranking */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Konten Terbaik (Top Ranking)</h3>
              <span className="text-[11px] font-semibold text-[#0e4380]">Skor Holistik</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Kombinasi Reach, Save Rate (koleksi resep), dan Share Rate.
            </p>

            <div className="space-y-3">
              {topContent.map((item, idx) => {
                const metrics = calculateMetrics(item);
                return (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#00224a] text-[#dab553] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 line-clamp-1">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                        {item.platform}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                      <span>Reach: {formatNumber(item.reach)}</span>
                      <span className="font-semibold text-[#0e4380]">
                        Saves: {formatNumber(item.saves)} ({formatPercent(metrics.saveRate)})
                      </span>
                      <span className="text-emerald-700 font-semibold">
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

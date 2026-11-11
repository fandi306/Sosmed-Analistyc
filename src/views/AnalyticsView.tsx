import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  Layers,
  Compass,
  Eye,
  Bookmark,
  Share2,
  Users,
  Coffee,
  CheckCircle2,
  HelpCircle,
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
import { PublishedContent, ALL_PILLARS, FunnelStage } from '../types.ts';

export const AnalyticsView: React.FC = () => {
  const { publishedContent } = useData();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'best-worst' | 'pillars' | 'funnel' | 'platforms' | 'formats'
  >('overview');

  const stats = useMemo(() => aggregateContent(publishedContent), [publishedContent]);

  // Rankings
  const rankedItems = useMemo(() => {
    return [...publishedContent].sort(
      (a, b) => computeContentScore(b) - computeContentScore(a)
    );
  }, [publishedContent]);

  const bestItems = rankedItems.slice(0, 4);
  const worstItems = [...rankedItems].reverse().slice(0, 4);

  // Pillar performance breakdown
  const pillarPerformance = useMemo(() => {
    const map = new Map<
      string,
      { count: number; totalReach: number; totalInteractions: number; totalSaves: number; totalViews: number }
    >();

    publishedContent.forEach((item) => {
      const p = item.pillar || 'Uncategorized';
      const prev = map.get(p) || { count: 0, totalReach: 0, totalInteractions: 0, totalSaves: 0, totalViews: 0 };
      const interactions = item.likes + item.comments + item.shares + item.saves;
      map.set(p, {
        count: prev.count + 1,
        totalReach: prev.totalReach + item.reach,
        totalInteractions: prev.totalInteractions + interactions,
        totalSaves: prev.totalSaves + item.saves,
        totalViews: prev.totalViews + item.views,
      });
    });

    return Array.from(map.entries()).map(([pillar, data]) => {
      const avgReach = data.count > 0 ? Math.round(data.totalReach / data.count) : 0;
      const engRate = data.totalReach > 0 ? (data.totalInteractions / data.totalReach) * 100 : null;
      const saveRate = data.totalReach > 0 ? (data.totalSaves / data.totalReach) * 100 : null;
      return { pillar, ...data, avgReach, engRate, saveRate };
    }).sort((a, b) => (b.engRate || 0) - (a.engRate || 0));
  }, [publishedContent]);

  // Format breakdown
  const formatPerformance = useMemo(() => {
    const map = new Map<
      string,
      { count: number; totalReach: number; totalInteractions: number; totalSaves: number; totalViews: number }
    >();

    publishedContent.forEach((item) => {
      const fmt = item.contentFormat || 'Other';
      const prev = map.get(fmt) || { count: 0, totalReach: 0, totalInteractions: 0, totalSaves: 0, totalViews: 0 };
      const interactions = item.likes + item.comments + item.shares + item.saves;
      map.set(fmt, {
        count: prev.count + 1,
        totalReach: prev.totalReach + item.reach,
        totalInteractions: prev.totalInteractions + interactions,
        totalSaves: prev.totalSaves + item.saves,
        totalViews: prev.totalViews + item.views,
      });
    });

    return Array.from(map.entries()).map(([format, data]) => {
      const avgReach = data.count > 0 ? Math.round(data.totalReach / data.count) : 0;
      const engRate = data.totalReach > 0 ? (data.totalInteractions / data.totalReach) * 100 : null;
      const saveRate = data.totalReach > 0 ? (data.totalSaves / data.totalReach) * 100 : null;
      return { format, ...data, avgReach, engRate, saveRate };
    }).sort((a, b) => (b.avgReach || 0) - (a.avgReach || 0));
  }, [publishedContent]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Metric Definitions Header Guide */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#0e4380]" />
          <span className="font-bold text-slate-800">
            Standar Rumus Metrik Deluxe Intelligence:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-slate-600 text-[11px]">
          <span>
            <strong>Eng. by Reach:</strong> ((Likes+Com+Share+Save)/Reach)×100
          </span>
          <span>
            <strong>Eng. by Views:</strong> ((Likes+Com+Share+Save)/Views)×100
          </span>
          <span>
            <strong>Save Rate:</strong> (Saves/Reach)×100
          </span>
          <span>
            <strong>Share Rate:</strong> (Shares/Reach)×100
          </span>
          <span className="text-emerald-700 font-semibold">
            Denominator Nol = Ditampilkan N/A
          </span>
        </div>
      </div>

      {/* Analytics Sub Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Ringkasan & Formulasi' },
          { id: 'best-worst', label: 'Best vs Worst Content' },
          { id: 'pillars', label: 'Analisis Content Pillar' },
          { id: 'funnel', label: 'Analisis Corong (Funnel)' },
          { id: 'platforms', label: 'Instagram vs TikTok' },
          { id: 'formats', label: 'Format Konten (Reels, Carousel, Video)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-3.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#00224a] text-[#00224a] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & FORMULAS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Engagement by Reach</span>
              <div className="text-2xl font-bold text-[#0e4380]">
                {formatPercent(stats.avgEngagementByReach)}
              </div>
              <p className="text-[10px] text-slate-400">Denominator: Total Reach</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Engagement by Views</span>
              <div className="text-2xl font-bold text-purple-700">
                {formatPercent(stats.avgEngagementByViews)}
              </div>
              <p className="text-[10px] text-slate-400">Denominator: Total Views</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Average Save Rate</span>
              <div className="text-2xl font-bold text-[#dab553]">
                {formatPercent(stats.avgSaveRate)}
              </div>
              <p className="text-[10px] text-slate-400">(Saves / Reach) • Kualitas Edukasi</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Average Share Rate</span>
              <div className="text-2xl font-bold text-blue-600">
                {formatPercent(stats.avgShareRate)}
              </div>
              <p className="text-[10px] text-slate-400">(Shares / Reach) • Relatabilitas</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Follower Conversion</span>
              <div className="text-2xl font-bold text-emerald-600">
                {formatPercent(stats.avgFollowerConversion)}
              </div>
              <p className="text-[10px] text-slate-400">Followers Baru / Reach</p>
            </div>
          </div>

          {/* Core Insight Callout */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-xs text-blue-950 space-y-2">
            <h4 className="font-bold text-sm text-[#00224a] flex items-center gap-2">
              <Coffee className="w-4 h-4 text-[#dab553]" />
              <span>Prinsip Analisis Specialty Coffee Roastery</span>
            </h4>
            <p className="leading-relaxed">
              "Views tinggi belum tentu mencerminkan keberhasilan konten. Bagi Deluxe Coffee, Save Rate yang tinggi membuktikan bahwa audiens menganggap panduan seduh dan edukasi origin kami bernilai tinggi untuk disimpan dan dipraktikkan di rumah. Ini adalah bibit loyalitas konsumen roast-to-order."
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: BEST VS WORST CONTENT */}
      {activeTab === 'best-worst' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Best Performing */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#dab553]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Konten Performa Terbaik (Best Performing)
                </h3>
              </div>
              <span className="text-xs font-semibold text-emerald-600">Evaluasi Multi-Metrik</span>
            </div>

            <div className="space-y-3">
              {bestItems.map((item, idx) => {
                const m = calculateMetrics(item);
                return (
                  <div key={item.id} className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 line-clamp-1">
                        #{idx + 1}. {item.title}
                      </span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 flex-shrink-0">
                        {item.platform}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                      "{item.hook || item.caption}"
                    </p>

                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-emerald-100 text-[10px]">
                      <div>
                        <span className="text-slate-500 block">Reach</span>
                        <strong className="text-slate-800">{formatNumber(item.reach)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Saves</span>
                        <strong className="text-[#0e4380]">{formatNumber(item.saves)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Save Rate</span>
                        <strong className="text-[#dab553]">{formatPercent(m.saveRate)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Eng. Rate</span>
                        <strong className="text-emerald-700">{formatPercent(m.engagementByReach)}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Worst Performing */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Konten Perlu Evaluasi (Underperforming)
                </h3>
              </div>
              <span className="text-xs font-semibold text-amber-600">Diagnosa Masalah</span>
            </div>

            <div className="space-y-3">
              {worstItems.map((item, idx) => {
                const m = calculateMetrics(item);
                return (
                  <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 line-clamp-1">
                        {item.title}
                      </span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 flex-shrink-0">
                        {item.platform}
                      </span>
                    </div>

                    <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                      <strong>Diagnosa:</strong>{' '}
                      {item.reach < 10000
                        ? 'Hook kurang kuat di 3 detik awal atau cover/thumbnail kurang provokatif.'
                        : (m.saveRate || 0) < 1.0
                        ? 'Save rate rendah. Konten terlalu generik atau tidak memberi resep/tips spesifik.'
                        : 'Interaksi rendah. CTA tidak secara spesifik memicu komentar atau simpanan.'}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] text-slate-600">
                      <div>Reach: {formatNumber(item.reach)}</div>
                      <div>Saves: {formatNumber(item.saves)}</div>
                      <div>Eng: {formatPercent(m.engagementByReach)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONTENT PILLARS */}
      {activeTab === 'pillars' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Performa per Content Pillar</h3>
          <p className="text-xs text-slate-500">
            Perbandingan tingkat keterlibatan dan jangkauan antar pilar konten Deluxe Coffee.
          </p>

          <div className="space-y-3">
            {pillarPerformance.map((p) => (
              <div key={p.pillar} className="p-4 rounded-xl border border-slate-200 hover:border-[#0e4380] transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{p.pillar}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {p.count} Postingan
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#0e4380]">
                    Eng. Rate: {formatPercent(p.engRate)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Rata-rata Reach</span>
                    <strong>{formatNumber(p.avgReach)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Rata-rata Save Rate</span>
                    <strong className="text-[#dab553]">{formatPercent(p.saveRate)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Simpanan</span>
                    <strong>{formatNumber(p.totalSaves)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FUNNEL ANALYSIS */}
      {activeTab === 'funnel' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* TOFU */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase text-purple-700">TOFU (Top of Funnel)</span>
              <span className="text-xs text-slate-500">{stats.funnel.TOFU.percent.toFixed(0)}% Distribusi</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.funnel.TOFU.count} Konten</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fokus: Lifestyle roastery Bali, relatable coffee memes, awareness kopi Indonesia.
            </p>
            <div className="text-xs pt-2 border-t border-slate-100 text-slate-700">
              Rata-rata Reach: <strong>{formatNumber(stats.funnel.TOFU.avgReach)}</strong>
            </div>
          </div>

          {/* MOFU */}
          <div className="p-5 rounded-2xl bg-white border border-[#0e4380] shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase text-[#0e4380]">MOFU (Problem Solving - 80%)</span>
              <span className="text-xs font-bold text-[#0e4380]">{stats.funnel.MOFU.percent.toFixed(0)}% Distribusi</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.funnel.MOFU.count} Konten</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fokus: Resep V60, troubleshooting asam/pahit, grind size, edukasi varietas & proses pasca panen.
            </p>
            <div className="text-xs pt-2 border-t border-slate-100 text-slate-700">
              Rata-rata Reach: <strong>{formatNumber(stats.funnel.MOFU.avgReach)}</strong>
            </div>
          </div>

          {/* BOFU */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase text-[#dab553]">BOFU (Selling & Promo - 20%)</span>
              <span className="text-xs text-slate-500">{stats.funnel.BOFU.percent.toFixed(0)}% Distribusi</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.funnel.BOFU.count} Konten</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fokus: Batch roasting mingguan, bundle discovery pack, trial pack, closing pesan harian.
            </p>
            <div className="text-xs pt-2 border-t border-slate-100 text-slate-700">
              Rata-rata Reach: <strong>{formatNumber(stats.funnel.BOFU.avgReach)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PLATFORMS */}
      {activeTab === 'platforms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instagram Deep Dive */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Performa Instagram Deluxe</h4>
              <span className="text-xs text-pink-600 font-semibold">{stats.instagram.count} Postingan</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Total Reach</span>
                <strong className="text-base text-slate-900">{formatNumber(stats.instagram.reach)}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Engagement Rate</span>
                <strong className="text-base text-[#0e4380]">{formatPercent(stats.instagram.engagementRate)}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Total Saves (Simpan)</span>
                <strong className="text-base text-[#dab553]">{formatNumber(stats.instagram.saves)}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Link Clicks</span>
                <strong className="text-base text-slate-900">{formatNumber(stats.instagram.linkClicks)}</strong>
              </div>
            </div>
          </div>

          {/* TikTok Deep Dive */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Performa TikTok Deluxe</h4>
              <span className="text-xs text-slate-900 font-semibold">{stats.tiktok.count} Video</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Total Reach</span>
                <strong className="text-base text-slate-900">{formatNumber(stats.tiktok.reach)}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Engagement Rate</span>
                <strong className="text-base text-[#0e4380]">{formatPercent(stats.tiktok.engagementRate)}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Total Shares (Bagikan)</span>
                <strong className="text-base text-blue-600">{formatNumber(stats.tiktok.shares)}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Followers Baru</span>
                <strong className="text-base text-emerald-600">{formatNumber(stats.tiktok.followersGained)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CONTENT FORMATS */}
      {activeTab === 'formats' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Analisis Berdasarkan Format Konten</h3>
          <p className="text-xs text-slate-500">
            Perbandingan efektivitas Reels, TikTok Video, Carousel panduan, dan Single Image.
          </p>

          <div className="space-y-3">
            {formatPerformance.map((fmt) => (
              <div key={fmt.format} className="p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm">{fmt.format}</span>
                  <span className="text-slate-500 ml-2">({fmt.count} Postingan)</span>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Rata-rata Reach</span>
                    <strong className="text-slate-800">{formatNumber(fmt.avgReach)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Eng. Rate</span>
                    <strong className="text-emerald-700">{formatPercent(fmt.engRate)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Save Rate</span>
                    <strong className="text-[#dab553]">{formatPercent(fmt.saveRate)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

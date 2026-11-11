import React, { useState } from 'react';
import {
  Target,
  Edit,
  Save,
  CheckCircle2,
  TrendingUp,
  Compass,
  Bookmark,
  MousePointerClick,
  Users,
  Video,
  BarChart3,
  Coffee,
} from 'lucide-react';
import { useData } from '../context/DataContext.tsx';
import { KpiTarget } from '../types.ts';
import { aggregateContent, formatNumber, formatPercent } from '../utils/analytics.ts';

export const KpiTrackerView: React.FC = () => {
  const { kpiTarget, updateKpiTarget, publishedContent } = useData();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<KpiTarget>>({
    period: kpiTarget?.period || '2026-11',
    periodType: kpiTarget?.periodType || 'monthly',
    contentTarget: kpiTarget?.contentTarget || 20,
    igFollowerTarget: kpiTarget?.igFollowerTarget || 15000,
    tiktokFollowerTarget: kpiTarget?.tiktokFollowerTarget || 25000,
    reachTarget: kpiTarget?.reachTarget || 250000,
    engagementRateTarget: kpiTarget?.engagementRateTarget || 5.5,
    saveRateTarget: kpiTarget?.saveRateTarget || 3.0,
    profileVisitTarget: kpiTarget?.profileVisitTarget || 5000,
    linkClickTarget: kpiTarget?.linkClickTarget || 800,
  });

  const stats = aggregateContent(publishedContent);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateKpiTarget(formData);
    setIsEditing(false);
  };

  const currentAchieved = {
    content: publishedContent.length,
    reach: stats.totalReach,
    engagementRate: stats.avgEngagementByReach || 0,
    saveRate: stats.avgSaveRate || 0,
    profileVisits: stats.totalProfileVisits,
    linkClicks: stats.totalLinkClicks,
  };

  const cards = [
    {
      title: 'Target Produksi Konten',
      icon: Video,
      target: kpiTarget?.contentTarget || 20,
      achieved: currentAchieved.content,
      unit: 'Konten',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      title: 'Total Reach (Jangkauan)',
      icon: Compass,
      target: kpiTarget?.reachTarget || 250000,
      achieved: currentAchieved.reach,
      unit: 'Akun',
      color: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Engagement Rate (by Reach)',
      icon: TrendingUp,
      target: kpiTarget?.engagementRateTarget || 5.5,
      achieved: Number(currentAchieved.engagementRate.toFixed(2)),
      unit: '%',
      color: 'from-emerald-600 to-teal-600',
      isPercent: true,
    },
    {
      title: 'Save Rate (Simpan Resep)',
      icon: Bookmark,
      target: kpiTarget?.saveRateTarget || 3.0,
      achieved: Number(currentAchieved.saveRate.toFixed(2)),
      unit: '%',
      color: 'from-amber-600 to-yellow-600',
      isPercent: true,
    },
    {
      title: 'Kunjungan Profil (Visits)',
      icon: Users,
      target: kpiTarget?.profileVisitTarget || 5000,
      achieved: currentAchieved.profileVisits,
      unit: 'Kunjungan',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Klik Link Website & Bio',
      icon: MousePointerClick,
      target: kpiTarget?.linkClickTarget || 800,
      achieved: currentAchieved.linkClicks,
      unit: 'Klik',
      color: 'from-rose-600 to-orange-500',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* KPI Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#0e4380]" />
            <span>KPI Tracker Deluxe Coffee Media Sosial</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pelacakan target bulanan & kuartalan terukur untuk memastikan efektivitas operasional content marketing.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#00224a] hover:bg-[#0e4380] rounded-xl shadow transition-colors"
        >
          <Edit className="w-3.5 h-3.5 text-[#dab553]" />
          <span>{isEditing ? 'Tutup Form Edit' : 'Ubah Target KPI'}</span>
        </button>
      </div>

      {/* EDIT MODAL / FORM */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="bg-white p-6 rounded-2xl border-2 border-[#0e4380] shadow-md space-y-4"
        >
          <h3 className="text-sm font-bold text-slate-900">Konfigurasi Target KPI</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Periode</label>
              <input
                type="text"
                value={formData.period || ''}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                placeholder="e.g. 2026-11"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipe Periode</label>
              <select
                value={formData.periodType}
                onChange={(e) =>
                  setFormData({ ...formData, periodType: e.target.value as any })
                }
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
              >
                <option value="monthly">Bulanan (Monthly)</option>
                <option value="quarterly">Kuartalan (Quarterly)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Konten</label>
              <input
                type="number"
                value={formData.contentTarget}
                onChange={(e) => setFormData({ ...formData, contentTarget: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Reach</label>
              <input
                type="number"
                value={formData.reachTarget}
                onChange={(e) => setFormData({ ...formData, reachTarget: Number(e.target.value) })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Eng. Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.engagementRateTarget}
                onChange={(e) =>
                  setFormData({ ...formData, engagementRateTarget: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Save Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.saveRateTarget}
                onChange={(e) =>
                  setFormData({ ...formData, saveRateTarget: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Kunjungan Profil</label>
              <input
                type="number"
                value={formData.profileVisitTarget}
                onChange={(e) =>
                  setFormData({ ...formData, profileVisitTarget: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Link Clicks</label>
              <input
                type="number"
                value={formData.linkClickTarget}
                onChange={(e) =>
                  setFormData({ ...formData, linkClickTarget: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 text-xs font-bold text-white bg-[#00224a] rounded-xl shadow"
            >
              Simpan Target Baru
            </button>
          </div>
        </form>
      )}

      {/* KPI PROGRESS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          const pct = Math.min(Math.round((c.achieved / (c.target || 1)) * 100), 100);
          const remaining = Math.max(c.target - c.achieved, 0);

          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-slate-600 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#00224a]/5 text-[#00224a]">
                      <Icon className="w-4 h-4 text-[#dab553]" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">{c.title}</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      pct >= 100
                        ? 'bg-emerald-100 text-emerald-800'
                        : pct >= 60
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {pct}% Tercapai
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Capaian Aktual</span>
                      <span className="text-xl font-bold text-slate-900">
                        {c.isPercent ? `${c.achieved}%` : formatNumber(c.achieved)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Target KPI</span>
                      <span className="text-sm font-semibold text-slate-600">
                        {c.isPercent ? `${c.target}%` : formatNumber(c.target)} {c.unit}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full bg-gradient-to-r ${c.color} transition-all`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Sisa Target:</span>
                <span className="font-semibold text-slate-700">
                  {remaining > 0
                    ? `${c.isPercent ? remaining.toFixed(1) + '%' : formatNumber(remaining)} ${c.unit}`
                    : 'Target Terlampaui!'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

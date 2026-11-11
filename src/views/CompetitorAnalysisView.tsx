import React, { useState } from 'react';
import {
  Users2,
  Plus,
  Trash2,
  ExternalLink,
  Instagram,
  Eye,
  Heart,
  MessageCircle,
  Sparkles,
  Lightbulb,
  Search,
  RefreshCw,
  Clapperboard,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Database,
} from 'lucide-react';
import { useData } from '../context/DataContext.tsx';
import { Competitor, CompetitorPost } from '../types.ts';
import { formatNumber } from '../utils/analytics.ts';
import { ProductionBriefModal, ProductionBriefData } from '../components/ProductionBriefModal.tsx';

export const CompetitorAnalysisView: React.FC = () => {
  const {
    competitors,
    addCompetitor,
    deleteCompetitor,
    competitorPosts,
    addCompetitorPost,
    deleteCompetitorPost,
    seedCuratedCompetitors,
  } = useData();

  const [isAddCompOpen, setIsAddCompOpen] = useState(false);
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);

  // AI Gap Analysis State
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiGaps, setAiGaps] = useState<any>(null);
  const [selectedBrief, setSelectedBrief] = useState<ProductionBriefData | null>(null);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);

  // New Competitor Form
  const [newComp, setNewComp] = useState({
    brandName: '',
    platform: 'instagram' as 'instagram' | 'tiktok',
    username: '',
    profileUrl: '',
    followers: 10000,
    category: 'Specialty Roastery Bali',
    notes: '',
  });

  // New Competitor Post Form
  const [newPost, setNewPost] = useState({
    competitorId: '',
    brandName: '',
    topic: '',
    hook: '',
    publicationDate: new Date().toISOString().split('T')[0],
    contentFormat: 'Reels',
    contentUrl: '',
    views: 0,
    likes: 0,
    comments: 0,
  });

  const handleRunAiGapAnalysis = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/gemini/competitor-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitors }),
      });
      const data = await res.json();
      if (data.success) {
        setAiGaps(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleGenerateBriefFromGap = async (gap: any) => {
    setIsGeneratingBrief(true);
    try {
      const res = await fetch('/api/gemini/production-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: gap.suggestedContentTopic,
          angle: gap.deluxeAdvantage,
          objective: 'Eksploitasi Celah Pasar Kompetitor Roastery',
          sku: 'Bali Kintamani Roast-to-Order',
          funnelStage: 'MOFU',
        }),
      });
      const data = await res.json();
      if (data.success && data.brief) {
        setSelectedBrief(data.brief);
        setIsBriefModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const handleSaveCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComp.brandName.trim() || !newComp.username.trim()) return;
    await addCompetitor(newComp);
    setIsAddCompOpen(false);
    setNewComp({
      brandName: '',
      platform: 'instagram',
      username: '',
      profileUrl: '',
      followers: 10000,
      category: 'Specialty Roastery Bali',
      notes: '',
    });
  };

  const handleSaveCompetitorPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.topic.trim()) return;

    const matchedComp = competitors.find((c) => c.id === newPost.competitorId);
    await addCompetitorPost({
      ...newPost,
      brandName: matchedComp?.brandName || newPost.brandName || 'Kompetitor',
    });
    setIsAddPostOpen(false);
    setNewPost({
      competitorId: '',
      brandName: '',
      topic: '',
      hook: '',
      publicationDate: new Date().toISOString().split('T')[0],
      contentFormat: 'Reels',
      contentUrl: '',
      views: 0,
      likes: 0,
      comments: 0,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users2 className="w-5 h-5 text-[#0e4380]" />
              <span>Pemantauan & Intelijen Kompetitor Roastery</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#00224a]">
              Bali & Nasional
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Menganalisis pergerakan Hungry Bird, Seniman, Revolver, Expat, Tanamera, dan Anomali untuk menemukan celah konten (Content Gap).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {competitors.length < 6 && (
            <button
              onClick={() => seedCuratedCompetitors()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#00224a] bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-all"
              title="Muat 6 benchmark roastery Bali & nasional secara instan"
            >
              <Database className="w-3.5 h-3.5 text-amber-700" />
              <span>Muat 6 Benchmark Roastery</span>
            </button>
          )}

          <button
            onClick={handleRunAiGapAnalysis}
            disabled={isLoadingAi || competitors.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#00224a] bg-gradient-to-r from-[#ffefa2] to-[#dab553] hover:opacity-90 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {isLoadingAi ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00224a]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#00224a]" />
            )}
            <span>{isLoadingAi ? 'Menganalisis Gap...' : 'Analisis Gap Kompetitor (AI)'}</span>
          </button>

          <button
            onClick={() => setIsAddPostOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Konten</span>
          </button>

          <button
            onClick={() => setIsAddCompOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#00224a] hover:bg-[#0e4380] rounded-xl shadow transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[#dab553]" />
            <span>Tambah Akun</span>
          </button>
        </div>
      </div>

      {/* AI Content Gap Opportunities Ribbon */}
      {aiGaps && (
        <div className="bg-gradient-to-br from-[#00224a] to-[#0e4380] text-white p-5 rounded-2xl shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#dab553]" />
              <h3 className="text-sm font-bold text-white">
                3 Celah Konten Terbesar (Content Gap Opportunities) Minggu Ini
              </h3>
            </div>
            <span className="text-[11px] text-slate-200">
              Dianalisis dari kelemahan roastery kompetitor Bali & Nasional
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiGaps.competitorGaps?.map((gap: any, idx: number) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm border border-white/15 p-4 rounded-xl flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffefa2]">
                      Celah #{idx + 1}: {gap.gapName}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Potensi {gap.potentialReach}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 mt-1">
                    <strong className="text-white">Kelemahan Kompetitor:</strong> {gap.competitorWeakness}
                  </p>
                  <p className="text-xs text-amber-200 mt-1">
                    <strong className="text-[#ffefa2]">Keunggulan Deluxe:</strong> {gap.deluxeAdvantage}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <span className="text-[10px] text-slate-300 block mb-1">Topik Usulan:</span>
                  <p className="text-xs font-semibold text-white leading-snug">
                    "{gap.suggestedContentTopic}"
                  </p>
                  <button
                    onClick={() => handleGenerateBriefFromGap(gap)}
                    disabled={isGeneratingBrief}
                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#dab553] hover:bg-[#ffefa2] text-[#00224a] text-xs font-bold transition-all shadow-sm"
                  >
                    <Clapperboard className="w-3.5 h-3.5" />
                    <span>Buat Brief Siap Syuting</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitor Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {competitors.map((comp) => (
          <div
            key={comp.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{comp.brandName}</h3>
                  <span className="text-xs text-slate-500">@{comp.username}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      comp.platform === 'instagram'
                        ? 'bg-pink-100 text-pink-700'
                        : 'bg-black text-white'
                    }`}
                  >
                    {comp.platform}
                  </span>
                  {comp.profileUrl && (
                    <a
                      href={comp.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-[#0e4380]"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={() => comp.id && deleteCompetitor(comp.id)}
                    className="p-1 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Kategori & Followers
                </span>
                <span className="font-bold text-slate-800">
                  {formatNumber(comp.followers)} Pengikut
                </span>
                <span className="text-slate-400 mx-1">•</span>
                <span className="text-slate-600">{comp.category}</span>
              </div>

              {comp.notes && (
                <p className="text-xs text-slate-600 mt-2 leading-relaxed italic">
                  "{comp.notes}"
                </p>
              )}
            </div>

            {/* Opportunity Tip */}
            <div className="pt-3 border-t border-slate-100 text-[11px] text-[#0e4380] flex items-center gap-1 font-semibold">
              <Lightbulb className="w-3.5 h-3.5 text-[#dab553] flex-shrink-0" />
              <span>Peluang: Deluxe unggul di transparansi roast-date & edukasi single-origin</span>
            </div>
          </div>
        ))}

        {competitors.length === 0 && (
          <div className="col-span-3 bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            Belum ada akun kompetitor yang ditambahkan. Klik "Tambah Akun Kompetitor" untuk mulai memantau.
          </div>
        )}
      </div>

      {/* Tracked Competitor Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Konten Kompetitor yang Sedang Dipantau
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Brand Kompetitor</th>
                <th className="p-3">Topik & Format</th>
                <th className="p-3">Hook yang Digunakan</th>
                <th className="p-3 text-right">Views</th>
                <th className="p-3 text-right">Likes</th>
                <th className="p-3 text-right">Komentar</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {competitorPosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                    {post.brandName}
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-800">{post.topic}</span>
                    <span className="text-[10px] text-slate-400 block">{post.contentFormat}</span>
                  </td>
                  <td className="p-3 italic text-slate-600 max-w-xs truncate">
                    "{post.hook || '-'}"
                  </td>
                  <td className="p-3 text-right">{formatNumber(post.views || 0)}</td>
                  <td className="p-3 text-right">{formatNumber(post.likes || 0)}</td>
                  <td className="p-3 text-right">{formatNumber(post.comments || 0)}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => post.id && deleteCompetitorPost(post.id)}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {competitorPosts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    Belum ada konten kompetitor yang dicatat. Klik "Catat Konten Kompetitor" untuk menambahkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Competitor */}
      {isAddCompOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Tambah Akun Kompetitor</h3>
            <form onSubmit={handleSaveCompetitor} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Brand</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Expat Roasters"
                  value={newComp.brandName}
                  onChange={(e) => setNewComp({ ...newComp, brandName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Platform</label>
                  <select
                    value={newComp.platform}
                    onChange={(e) =>
                      setNewComp({ ...newComp, platform: e.target.value as 'instagram' | 'tiktok' })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="expatroasters"
                    value={newComp.username}
                    onChange={(e) => setNewComp({ ...newComp, username: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Followers</label>
                <input
                  type="number"
                  value={newComp.followers}
                  onChange={(e) => setNewComp({ ...newComp, followers: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori / Segmen</label>
                <input
                  type="text"
                  placeholder="e.g. Specialty Roaster Canggu"
                  value={newComp.category}
                  onChange={(e) => setNewComp({ ...newComp, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Analisis</label>
                <textarea
                  rows={2}
                  placeholder="Kelemahan atau kelebihan strategi mereka..."
                  value={newComp.notes}
                  onChange={(e) => setNewComp({ ...newComp, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCompOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00224a] text-white font-semibold rounded-xl"
                >
                  Simpan Kompetitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Competitor Post */}
      {isAddPostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Catat Konten Kompetitor</h3>
            <form onSubmit={handleSaveCompetitorPost} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Kompetitor</label>
                <select
                  value={newPost.competitorId}
                  onChange={(e) => setNewPost({ ...newPost, competitorId: e.target.value })}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">-- Pilih Brand --</option>
                  {competitors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.brandName} (@{c.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Topik Konten</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Edukasi Cupping Kopi Baru"
                  value={newPost.topic}
                  onChange={(e) => setNewPost({ ...newPost, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Opening Hook yang Mereka Pakai</label>
                <input
                  type="text"
                  placeholder="e.g. Ini alasan kami tidak pakai robusta..."
                  value={newPost.hook}
                  onChange={(e) => setNewPost({ ...newPost, hook: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Views</label>
                  <input
                    type="number"
                    value={newPost.views}
                    onChange={(e) => setNewPost({ ...newPost, views: Number(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Likes</label>
                  <input
                    type="number"
                    value={newPost.likes}
                    onChange={(e) => setNewPost({ ...newPost, likes: Number(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Comments</label>
                  <input
                    type="number"
                    value={newPost.comments}
                    onChange={(e) => setNewPost({ ...newPost, comments: Number(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPostOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00224a] text-white font-semibold rounded-xl"
                >
                  Simpan Konten
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Production Brief Modal */}
      <ProductionBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        brief={selectedBrief}
      />
    </div>
  );
};

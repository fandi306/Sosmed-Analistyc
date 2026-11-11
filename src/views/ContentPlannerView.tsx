import React, { useState, useMemo } from 'react';
import {
  Plus,
  Filter,
  Search,
  Sparkles,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  ArrowRight,
  Coffee,
  AlertCircle,
  BarChart,
  Tag,
  Download,
} from 'lucide-react';
import { useData } from '../context/DataContext.tsx';
import { generateNotionExportCsv } from '../utils/notionParser.ts';
import {
  ContentIdea,
  ALL_PILLARS,
  FunnelStage,
  ContentStatus,
  STATUS_LABELS,
  PlatformFilter,
} from '../types.ts';

export const ContentPlannerView: React.FC<{
  onOpenNewIdea: (date?: string) => void;
  onEditIdea: (idea: ContentIdea) => void;
  onNavigateStudio: () => void;
}> = ({ onOpenNewIdea, onEditIdea, onNavigateStudio }) => {
  const { contentIdeas, publishedContent, deleteContentIdea, updateContentIdea } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [funnelFilter, setFunnelFilter] = useState<'all' | FunnelStage>('all');
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Filtered ideas
  const filteredIdeas = useMemo(() => {
    return contentIdeas.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.audienceProblem?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.hook?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchPlatform =
        platformFilter === 'all' || item.platform === platformFilter || item.platform === 'both';

      const matchFunnel = funnelFilter === 'all' || item.funnelStage === funnelFilter;
      const matchPillar = pillarFilter === 'all' || item.pillar === pillarFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchSearch && matchPlatform && matchFunnel && matchPillar && matchStatus;
    });
  }, [contentIdeas, searchQuery, platformFilter, funnelFilter, pillarFilter, statusFilter]);

  // Strategy ratio 80% problem-solving vs 20% selling in ideas
  const { problemSolvingCount, sellingCount, ratioProblem } = useMemo(() => {
    let ps = 0;
    let sl = 0;
    contentIdeas.forEach((i) => {
      if (i.funnelStage === 'BOFU' || ['Promotion', 'Bundle', 'Urgency', 'Closing'].includes(i.pillar)) {
        sl++;
      } else {
        ps++;
      }
    });
    const total = ps + sl;
    return {
      problemSolvingCount: ps,
      sellingCount: sl,
      ratioProblem: total > 0 ? Math.round((ps / total) * 100) : 80,
    };
  }, [contentIdeas]);

  const kanbanColumns: { status: ContentStatus; title: string }[] = [
    { status: 'idea', title: 'Ide Backlog' },
    { status: 'planning', title: 'Perencanaan' },
    { status: 'scripting', title: 'Penulisan Skrip' },
    { status: 'production', title: 'Produksi / Shooting' },
    { status: 'editing', title: 'Penyuntingan' },
    { status: 'review', title: 'Review Tim' },
    { status: 'scheduled', title: 'Dijadwalkan' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Strategy Indicator Card */}
      <div className="bg-gradient-to-r from-[#00224a] via-[#0e4380] to-[#00224a] text-white p-5 rounded-2xl shadow-md border border-[#dab553]/30 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-[#dab553]" />
            <h2 className="text-base font-bold font-serif">
              Strategi Konten Deluxe Coffee (80% Problem Solving • 20% Selling)
            </h2>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            Menjaga reputasi sebagai specialty roaster terpercaya di Bali. Konten didominasi solusi masalah seduh kopi rumahan (80%), diselingi penawaran katalog roast-to-order (20%).
          </p>
        </div>

        <div className="flex items-center gap-6 bg-[#001733]/60 px-4 py-3 rounded-xl border border-white/10">
          <div>
            <span className="text-[10px] text-slate-300 block uppercase font-semibold">
              Rasio Saat Ini
            </span>
            <div className="text-lg font-bold text-[#dab553]">
              {ratioProblem}% Solusi : {100 - ratioProblem}% Jual
            </div>
          </div>

          <button
            onClick={onNavigateStudio}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#dab553] hover:bg-[#b89333] text-[#00224a] text-xs font-bold transition-all shadow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Ide AI</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari judul, masalah audiens, hook..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0e4380]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Platform */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as PlatformFilter)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-700"
          >
            <option value="all">Semua Platform</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
          </select>

          {/* Funnel Stage */}
          <select
            value={funnelFilter}
            onChange={(e) => setFunnelFilter(e.target.value as any)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-700"
          >
            <option value="all">Semua Funnel</option>
            <option value="TOFU">TOFU (Awareness)</option>
            <option value="MOFU">MOFU (Education/Solusi)</option>
            <option value="BOFU">BOFU (Selling/Bundle)</option>
          </select>

          {/* Content Pillar */}
          <select
            value={pillarFilter}
            onChange={(e) => setPillarFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-700"
          >
            <option value="all">Semua Pillar</option>
            {ALL_PILLARS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* View toggle */}
          <div className="flex border border-slate-200 rounded-xl overflow-hidden p-0.5 bg-slate-100">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'kanban' ? 'bg-[#00224a] text-white shadow' : 'text-slate-600'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-[#00224a] text-white shadow' : 'text-slate-600'
              }`}
            >
              Tabel
            </button>
          </div>

          <button
            onClick={() => {
              const csv = generateNotionExportCsv(contentIdeas, publishedContent);
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Deluxe_Planner_Notion_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl shadow-sm transition-colors"
            title="Ekspor seluruh rencana dan brief konten ke CSV Notion"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ekspor Notion</span>
          </button>

          <button
            onClick={() => onOpenNewIdea()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0e4380] hover:bg-[#00224a] rounded-xl shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#dab553]" />
            <span>Tambah Ide</span>
          </button>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5 items-start overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const columnIdeas = filteredIdeas.filter((i) => i.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-slate-100/80 rounded-2xl p-3 border border-slate-200 flex flex-col gap-2.5 min-w-[200px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">{col.title}</span>
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                      {columnIdeas.length}
                    </span>
                  </div>
                  <button
                    onClick={() => onOpenNewIdea()}
                    className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800"
                    title="Tambah ide di kolom ini"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Ideas list in Column */}
                <div className="space-y-2.5 min-h-[120px]">
                  {columnIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      className="bg-white p-3 rounded-xl border border-slate-200 hover:border-[#0e4380] shadow-sm hover:shadow transition-all space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            idea.funnelStage === 'BOFU'
                              ? 'bg-amber-100 text-amber-800'
                              : idea.funnelStage === 'MOFU'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {idea.funnelStage} • {idea.pillar}
                        </span>

                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            idea.priority === 'high'
                              ? 'bg-red-50 text-red-700'
                              : idea.priority === 'medium'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-slate-50 text-slate-500'
                          }`}
                        >
                          {idea.priority}
                        </span>
                      </div>

                      <h4
                        onClick={() => onEditIdea(idea)}
                        className="text-xs font-bold text-slate-900 line-clamp-2 hover:text-[#0e4380] cursor-pointer"
                      >
                        {idea.title}
                      </h4>

                      {idea.hook && (
                        <p className="text-[10px] text-slate-500 line-clamp-2 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                          "{idea.hook}"
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                        <span className="uppercase font-semibold text-[#0e4380]">
                          {idea.platform}
                        </span>
                        {idea.plannedDate && (
                          <span className="flex items-center gap-1 text-slate-600">
                            <Clock className="w-2.5 h-2.5" />
                            {idea.plannedDate}
                          </span>
                        )}
                      </div>

                      {/* Quick Move & Actions */}
                      <div className="flex items-center justify-between pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onEditIdea(idea)}
                            className="p-1 text-slate-500 hover:text-[#0e4380]"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => idea.id && deleteContentIdea(idea.id)}
                            className="p-1 text-slate-500 hover:text-red-600"
                            title="Hapus"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Status advance button */}
                        {col.status !== 'scheduled' && (
                          <button
                            onClick={() => {
                              const currentIndex = kanbanColumns.findIndex((c) => c.status === col.status);
                              if (currentIndex >= 0 && currentIndex < kanbanColumns.length - 1) {
                                const nextStatus = kanbanColumns[currentIndex + 1].status;
                                if (idea.id) updateContentIdea(idea.id, { status: nextStatus });
                              }
                            }}
                            className="text-[10px] font-semibold text-[#0e4380] hover:underline flex items-center gap-0.5"
                          >
                            <span>Lanjut</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {columnIdeas.length === 0 && (
                    <div className="h-20 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-400">
                      Kosong
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST / TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Judul Konten</th>
                  <th className="p-3">Platform</th>
                  <th className="p-3">Funnel & Pillar</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Prioritas</th>
                  <th className="p-3">Rencana Tanggal</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIdeas.map((idea) => (
                  <tr key={idea.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 max-w-sm">
                      <div
                        onClick={() => onEditIdea(idea)}
                        className="hover:text-[#0e4380] cursor-pointer"
                      >
                        {idea.title}
                      </div>
                      {idea.audienceProblem && (
                        <div className="text-[10px] text-slate-500 font-normal line-clamp-1">
                          Masalah: {idea.audienceProblem}
                        </div>
                      )}
                    </td>
                    <td className="p-3 uppercase font-bold text-[10px] text-[#0e4380]">
                      {idea.platform}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">{idea.funnelStage}</span>
                      <span className="text-slate-400 mx-1">•</span>
                      <span className="text-slate-600">{idea.pillar}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          STATUS_LABELS[idea.status]?.bg || 'bg-slate-100'
                        } ${STATUS_LABELS[idea.status]?.color || 'text-slate-700'}`}
                      >
                        {STATUS_LABELS[idea.status]?.label || idea.status}
                      </span>
                    </td>
                    <td className="p-3 capitalize font-medium">{idea.priority}</td>
                    <td className="p-3 text-slate-600 whitespace-nowrap">
                      {idea.plannedDate || '-'}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onEditIdea(idea)}
                        className="p-1 text-slate-500 hover:text-[#0e4380] mr-1"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => idea.id && deleteContentIdea(idea.id)}
                        className="p-1 text-slate-500 hover:text-red-600"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredIdeas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                      Tidak ada ide konten yang cocok dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

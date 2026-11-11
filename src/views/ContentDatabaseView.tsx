import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Layers,
  ArrowUpDown,
  Coffee,
  Bookmark,
  Share2,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useData } from '../context/DataContext.tsx';
import {
  PublishedContent,
  PlatformFilter,
  FunnelStage,
  ALL_PILLARS,
} from '../types.ts';
import {
  calculateMetrics,
  formatNumber,
  formatPercent,
import {
  calculateMetrics,
  formatNumber,
  formatPercent,
  computeContentScore,
} from '../utils/analytics.ts';
import { generateNotionExportCsv } from '../utils/notionParser.ts';

type SortField = 'publishDate' | 'reach' | 'views' | 'saves' | 'shares' | 'engagement';
type SortOrder = 'asc' | 'desc';

export const ContentDatabaseView: React.FC<{
  onOpenNewContent: () => void;
  onEditContent: (item: PublishedContent) => void;
  onOpenImport: () => void;
}> = ({ onOpenNewContent, onEditContent, onOpenImport }) => {
  const { publishedContent, contentIdeas, deletePublishedContent } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [funnelFilter, setFunnelFilter] = useState<'all' | FunnelStage>('all');
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('publishDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const filteredItems = useMemo(() => {
    return publishedContent
      .filter((item) => {
        const matchSearch =
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.contentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.productFeatured && item.productFeatured.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.hook && item.hook.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchPlatform = platformFilter === 'all' || item.platform === platformFilter;
        const matchFunnel = funnelFilter === 'all' || item.funnelStage === funnelFilter;
        const matchPillar = pillarFilter === 'all' || item.pillar === pillarFilter;

        return matchSearch && matchPlatform && matchFunnel && matchPillar;
      })
      .sort((a, b) => {
        let valA: number = 0;
        let valB: number = 0;

        if (sortField === 'publishDate') {
          valA = new Date(a.publishDate).getTime();
          valB = new Date(b.publishDate).getTime();
        } else if (sortField === 'reach') {
          valA = a.reach || 0;
          valB = b.reach || 0;
        } else if (sortField === 'views') {
          valA = a.views || 0;
          valB = b.views || 0;
        } else if (sortField === 'saves') {
          valA = a.saves || 0;
          valB = b.saves || 0;
        } else if (sortField === 'shares') {
          valA = a.shares || 0;
          valB = b.shares || 0;
        } else if (sortField === 'engagement') {
          valA = calculateMetrics(a).engagementByReach || 0;
          valB = calculateMetrics(b).engagementByReach || 0;
        }

        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [publishedContent, searchQuery, platformFilter, funnelFilter, pillarFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    if (filteredItems.length === 0) return;

    const headers = [
      'Content ID',
      'Judul',
      'Platform',
      'Tanggal Tayang',
      'Funnel Stage',
      'Pillar',
      'Format',
      'Produk Single Origin',
      'Views',
      'Reach',
      'Likes',
      'Comments',
      'Shares',
      'Saves',
      'Engagement by Reach (%)',
      'Save Rate (%)',
      'Share Rate (%)',
      'Profile Visits',
      'Followers Gained',
      'Link Clicks',
      'URL',
    ];

    const rows = filteredItems.map((item) => {
      const m = calculateMetrics(item);
      return [
        `"${item.contentId}"`,
        `"${item.title.replace(/"/g, '""')}"`,
        item.platform,
        item.publishDate,
        item.funnelStage,
        `"${item.pillar}"`,
        item.contentFormat,
        `"${item.productFeatured || ''}"`,
        item.views,
        item.reach,
        item.likes,
        item.comments,
        item.shares,
        item.saves,
        m.engagementByReach !== null ? m.engagementByReach.toFixed(2) : 'N/A',
        m.saveRate !== null ? m.saveRate.toFixed(2) : 'N/A',
        m.shareRate !== null ? m.shareRate.toFixed(2) : 'N/A',
        item.profileVisits,
        item.followersGained,
        item.linkClicks,
        `"${item.contentUrl || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `deluxe_coffee_content_database_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari ID, judul, single origin, hook..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0e4380]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as PlatformFilter)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-700"
          >
            <option value="all">Semua Platform</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
          </select>

          <select
            value={funnelFilter}
            onChange={(e) => setFunnelFilter(e.target.value as any)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-700"
          >
            <option value="all">Semua Funnel</option>
            <option value="TOFU">TOFU (Awareness)</option>
            <option value="MOFU">MOFU (Education / 80%)</option>
            <option value="BOFU">BOFU (Selling / 20%)</option>
          </select>

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

          {/* Action buttons */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => {
              const csv = generateNotionExportCsv(contentIdeas, publishedContent);
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Deluxe_Database_Notion_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl border border-indigo-200 transition-colors"
            title="Download database dalam format CSV Notion"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ekspor Notion</span>
          </button>

          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Impor Data</span>
          </button>

          <button
            onClick={onOpenNewContent}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#00224a] hover:bg-[#0e4380] rounded-xl shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#dab553]" />
            <span>Input Konten</span>
          </button>
        </div>
      </div>

      {/* Database Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#00224a] text-white font-semibold">
              <tr>
                <th className="p-3">ID & Judul Konten</th>
                <th
                  onClick={() => toggleSort('publishDate')}
                  className="p-3 cursor-pointer hover:bg-white/10 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Tanggal</span>
                    <ArrowUpDown className="w-3 h-3 text-[#dab553]" />
                  </div>
                </th>
                <th className="p-3">Platform</th>
                <th className="p-3">Funnel & Pillar</th>
                <th
                  onClick={() => toggleSort('reach')}
                  className="p-3 text-right cursor-pointer hover:bg-white/10"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Reach</span>
                    <ArrowUpDown className="w-3 h-3 text-[#dab553]" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('views')}
                  className="p-3 text-right cursor-pointer hover:bg-white/10"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Views</span>
                    <ArrowUpDown className="w-3 h-3 text-[#dab553]" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('engagement')}
                  className="p-3 text-right cursor-pointer hover:bg-white/10"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Eng. (Reach)</span>
                    <ArrowUpDown className="w-3 h-3 text-[#dab553]" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('saves')}
                  className="p-3 text-right cursor-pointer hover:bg-white/10"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Saves (Rate)</span>
                    <ArrowUpDown className="w-3 h-3 text-[#dab553]" />
                  </div>
                </th>
                <th className="p-3">Single Origin / Produk</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const metrics = calculateMetrics(item);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Title & ID */}
                    <td className="p-3 max-w-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.contentId}
                        </span>
                        {item.contentUrl && (
                          <a
                            href={item.contentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0e4380] hover:text-[#00224a]"
                            title="Buka URL asli"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div
                        onClick={() => onEditContent(item)}
                        className="font-bold text-slate-900 mt-1 hover:text-[#0e4380] cursor-pointer line-clamp-2"
                      >
                        {item.title}
                      </div>
                      {item.hook && (
                        <div className="text-[10px] text-slate-500 italic line-clamp-1 mt-0.5">
                          "{item.hook}"
                        </div>
                      )}
                    </td>

                    {/* Publish date */}
                    <td className="p-3 text-slate-600 whitespace-nowrap font-medium">
                      {item.publishDate}
                    </td>

                    {/* Platform */}
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          item.platform === 'instagram'
                            ? 'bg-pink-100 text-pink-700'
                            : 'bg-slate-900 text-white'
                        }`}
                      >
                        {item.platform}
                      </span>
                    </td>

                    {/* Funnel & Pillar */}
                    <td className="p-3 whitespace-nowrap">
                      <span className="font-bold text-slate-800">{item.funnelStage}</span>
                      <span className="text-slate-400 mx-1">•</span>
                      <span className="text-slate-600">{item.pillar}</span>
                      <div className="text-[10px] text-slate-400">{item.contentFormat}</div>
                    </td>

                    {/* Reach */}
                    <td className="p-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                      {formatNumber(item.reach)}
                    </td>

                    {/* Views */}
                    <td className="p-3 text-right text-slate-700 whitespace-nowrap">
                      {formatNumber(item.views)}
                    </td>

                    {/* Engagement by Reach */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <span className="font-bold text-emerald-700">
                        {formatPercent(metrics.engagementByReach)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {(item.likes + item.comments + item.shares + item.saves).toLocaleString(
                          'id-ID'
                        )}{' '}
                        interaksi
                      </span>
                    </td>

                    {/* Saves & Save Rate */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <span className="font-bold text-[#0e4380]">
                        {formatNumber(item.saves)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {formatPercent(metrics.saveRate)}
                      </span>
                    </td>

                    {/* Product Featured */}
                    <td className="p-3 text-slate-700 max-w-xs truncate">
                      {item.productFeatured || '-'}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onEditContent(item)}
                        className="p-1.5 text-slate-500 hover:text-[#0e4380] rounded hover:bg-slate-100 transition-colors mr-1"
                        title="Edit Data"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => item.id && deletePublishedContent(item.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                        title="Hapus Data"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-500 text-xs">
                    Tidak ada catatan konten yang ditemukan. Coba ubah pencarian atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

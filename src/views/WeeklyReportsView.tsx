import React, { useState, useMemo } from 'react';
import {
  FileText,
  Calendar,
  Sparkles,
  Download,
  Printer,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Coffee,
} from 'lucide-react';
import { useData } from '../context/DataContext.tsx';
import { WeeklyReport } from '../types.ts';
import { aggregateContent } from '../utils/analytics.ts';

export const WeeklyReportsView: React.FC = () => {
  const {
    publishedContent,
    kpiTarget,
    weeklyReports,
    saveWeeklyReport,
    updateWeeklyReport,
    deleteWeeklyReport,
  } = useData();

  // Helper to compute default Monday to Sunday of previous week
  const defaultDates = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1) - 7;
    const monday = new Date(d.setDate(diffToMonday));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0],
    };
  }, []);

  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState<WeeklyReport | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Filter actual content in the selected reporting period
  const periodData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return publishedContent.filter((item) => {
      const d = new Date(item.publishDate);
      return d >= start && d <= end;
    });
  }, [publishedContent, startDate, endDate]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const stats = aggregateContent(periodData);
      const res = await fetch('/api/gemini/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          periodData: periodData.map((p) => ({
            id: p.contentId,
            title: p.title,
            platform: p.platform,
            pillar: p.pillar,
            reach: p.reach,
            views: p.views,
            saves: p.saves,
            shares: p.shares,
            likes: p.likes,
            comments: p.comments,
          })),
          kpiData: kpiTarget || {},
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const generated = data.report;
      const newReport: Omit<WeeklyReport, 'id' | 'userId'> = {
        title: generated.title || `Laporan Mingguan (${startDate} - ${endDate})`,
        startDate,
        endDate,
        executiveSummary: generated.executiveSummary || '',
        igPerformance: generated.igPerformance || '',
        tiktokPerformance: generated.tiktokPerformance || '',
        totalPublished: generated.totalPublished || periodData.length,
        bestContent: generated.bestContent || '',
        worstContent: generated.worstContent || '',
        pillarPerformance: generated.pillarPerformance || '',
        kpiProgress: generated.kpiProgress || '',
        keyFindings: generated.keyFindings || '',
        challenges: generated.challenges || '',
        recommendations: generated.recommendations || '',
        status: 'draft',
      };

      const savedId = await saveWeeklyReport(newReport);
      setActiveReport({ ...newReport, id: savedId, userId: 'current' });
      setIsEditing(false);
    } catch (err: any) {
      alert('Gagal menghasilkan laporan: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!activeReport?.id) return;
    await updateWeeklyReport(activeReport.id, activeReport);
    setIsEditing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Report Generator Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0e4380]" />
            <span>Laporan Intelijen Media Sosial Mingguan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dibuat secara otomatis berbasis data riil periode terpilih (Senin - Minggu).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="font-semibold text-slate-700">Periode:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 border border-slate-300 rounded text-xs bg-white"
            />
            <span>s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 border border-slate-300 rounded text-xs bg-white"
            />
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#00224a] hover:bg-[#0e4380] rounded-xl shadow transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#dab553]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#dab553]" />
            )}
            <span>
              {isGenerating
                ? 'Menyusun Laporan...'
                : `Generate Laporan (${periodData.length} Data)`}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Saved Reports History Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Riwayat Laporan Tersimpan
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {weeklyReports.map((report) => (
              <div
                key={report.id}
                onClick={() => {
                  setActiveReport(report);
                  setIsEditing(false);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all text-xs space-y-1 ${
                  activeReport?.id === report.id
                    ? 'border-[#0e4380] bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 line-clamp-1">{report.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (report.id) deleteWeeklyReport(report.id);
                    }}
                    className="p-1 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-[10px] text-slate-500">
                  {report.startDate} - {report.endDate} • {report.totalPublished} Konten
                </div>
              </div>
            ))}

            {weeklyReports.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                Belum ada laporan yang disimpan.
              </div>
            )}
          </div>
        </div>

        {/* Active Report Viewer / Editor */}
        <div className="lg:col-span-3">
          {activeReport ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6 print:shadow-none print:border-none print:p-0">
              {/* Report Header */}
              <div className="flex flex-wrap items-center justify-between pb-6 border-b border-slate-200 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-[#dab553]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0e4380]">
                      DELUXE COFFEE BALI • SOCIAL MEDIA REPORT
                    </span>
                  </div>
                  <h1 className="text-xl font-bold text-slate-900 font-serif">
                    {activeReport.title}
                  </h1>
                  <p className="text-xs text-slate-500">
                    Periode: {activeReport.startDate} s/d {activeReport.endDate} • Total Konten:{' '}
                    {activeReport.totalPublished}
                  </p>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Selesai Edit' : 'Edit Laporan'}</span>
                  </button>

                  {isEditing && (
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00224a] text-white text-xs font-semibold"
                    >
                      <Save className="w-3.5 h-3.5 text-[#dab553]" />
                      <span>Simpan Perubahan</span>
                    </button>
                  )}

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0e4380] text-white text-xs font-semibold shadow hover:bg-[#00224a]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak / Simpan PDF</span>
                  </button>
                </div>
              </div>

              {/* 11 Report Sections */}
              <div className="space-y-6 text-xs text-slate-800 leading-relaxed">
                {/* 1. Executive Summary */}
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-[#00224a] uppercase tracking-wide border-l-4 border-[#dab553] pl-2">
                    1. Executive Summary
                  </h3>
                  {isEditing ? (
                    <textarea
                      rows={4}
                      value={activeReport.executiveSummary}
                      onChange={(e) =>
                        setActiveReport({ ...activeReport, executiveSummary: e.target.value })
                      }
                      className="w-full p-2.5 border rounded-lg"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{activeReport.executiveSummary}</p>
                  )}
                </div>

                {/* 2 & 3. Platform Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <h4 className="font-bold text-xs text-pink-700 uppercase">
                      2. Performa Akun Instagram
                    </h4>
                    {isEditing ? (
                      <textarea
                        rows={4}
                        value={activeReport.igPerformance}
                        onChange={(e) =>
                          setActiveReport({ ...activeReport, igPerformance: e.target.value })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap text-[11px]">{activeReport.igPerformance}</p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <h4 className="font-bold text-xs text-slate-900 uppercase">
                      3. Performa Akun TikTok
                    </h4>
                    {isEditing ? (
                      <textarea
                        rows={4}
                        value={activeReport.tiktokPerformance}
                        onChange={(e) =>
                          setActiveReport({ ...activeReport, tiktokPerformance: e.target.value })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap text-[11px]">{activeReport.tiktokPerformance}</p>
                    )}
                  </div>
                </div>

                {/* 4 & 5. Best & Worst */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-xs text-emerald-800 uppercase tracking-wide border-l-4 border-emerald-500 pl-2">
                      4. Best Performing Content
                    </h3>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={activeReport.bestContent}
                        onChange={(e) =>
                          setActiveReport({ ...activeReport, bestContent: e.target.value })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{activeReport.bestContent}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-xs text-amber-800 uppercase tracking-wide border-l-4 border-amber-500 pl-2">
                      5. Worst Performing Content (Perlu Evaluasi)
                    </h3>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={activeReport.worstContent}
                        onChange={(e) =>
                          setActiveReport({ ...activeReport, worstContent: e.target.value })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{activeReport.worstContent}</p>
                    )}
                  </div>
                </div>

                {/* 6. Content Pillar & 7. KPI Progress */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-xs text-[#00224a] uppercase tracking-wide border-l-4 border-[#0e4380] pl-2">
                      6. Evaluasi Content Pillar
                    </h3>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={activeReport.pillarPerformance}
                        onChange={(e) =>
                          setActiveReport({ ...activeReport, pillarPerformance: e.target.value })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{activeReport.pillarPerformance}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-xs text-[#00224a] uppercase tracking-wide border-l-4 border-[#0e4380] pl-2">
                      7. Pencapaian Target KPI
                    </h3>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={activeReport.kpiProgress}
                        onChange={(e) =>
                          setActiveReport({ ...activeReport, kpiProgress: e.target.value })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{activeReport.kpiProgress}</p>
                    )}
                  </div>
                </div>

                {/* 8. Key Findings & 9. Challenges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide border-l-4 border-slate-500 pl-2">
                      8. Temuan Kunci Berbasis Data
                    </h3>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={activeReport.keyFindings}
                        onChange={(e) =>
                          setActiveReport({ ...activeReport, keyFindings: e.target.value })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{activeReport.keyFindings}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-xs text-red-800 uppercase tracking-wide border-l-4 border-red-500 pl-2">
                      9. Masalah & Tantangan
                    </h3>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={activeReport.challenges}
                        onChange={(e) =>
                          setActiveReport({ ...activeReport, challenges: e.target.value })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{activeReport.challenges}</p>
                    )}
                  </div>
                </div>

                {/* 10. Recommendations */}
                <div className="space-y-2 p-4 rounded-xl bg-amber-50/50 border border-amber-200">
                  <h3 className="font-bold text-sm text-[#00224a] uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#dab553]" />
                    <span>10. Rekomendasi Tindakan Minggu Depan (Actionable)</span>
                  </h3>
                  {isEditing ? (
                    <textarea
                      rows={4}
                      value={activeReport.recommendations}
                      onChange={(e) =>
                        setActiveReport({ ...activeReport, recommendations: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap font-medium">{activeReport.recommendations}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              Pilih tanggal periode di atas lalu klik "Generate Laporan" untuk membuat laporan analitik otomatis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

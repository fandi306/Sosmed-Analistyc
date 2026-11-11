import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  RefreshCw,
  HelpCircle,
  FileText,
  AlertCircle,
  Coffee,
  CheckCircle2,
  TrendingUp,
  Clapperboard,
  ShieldAlert,
  ArrowRight,
  Flame,
  Check,
  Target,
} from 'lucide-react';
import { useData } from '../context/DataContext.tsx';
import { aggregateContent } from '../utils/analytics.ts';
import { ProductionBriefModal, ProductionBriefData } from '../components/ProductionBriefModal.tsx';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AiAnalystView: React.FC = () => {
  const { publishedContent, contentIdeas, kpiTarget, competitors } = useData();

  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [overallAnalysis, setOverallAnalysis] = useState<string | null>(null);
  const [isGeneratingOverall, setIsGeneratingOverall] = useState(false);

  // AI Decision Engine State
  const [isDecisionLoading, setIsDecisionLoading] = useState(false);
  const [decisionData, setDecisionData] = useState<any>(null);
  const [selectedBrief, setSelectedBrief] = useState<ProductionBriefData | null>(null);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);

  const suggestedQuestions = [
    'Mengapa performa konten minggu ini menurun?',
    'Content pillar apa yang paling efektif?',
    'Apa kesalahan strategi konten bulan ini?',
    'Konten seperti apa yang harus diperbanyak?',
    'Apa rekomendasi strategi minggu depan?',
    'Bagaimana perkembangan akun Instagram Deluxe Coffee?',
    'Bandingkan performa Instagram dan TikTok.',
  ];

  const prepareAnalyticsContext = () => {
    const stats = aggregateContent(publishedContent);
    return {
      totalPublishedCount: publishedContent.length,
      overviewStats: {
        totalReach: stats.totalReach,
        totalViews: stats.totalViews,
        avgEngagementByReach: stats.avgEngagementByReach,
        avgSaveRate: stats.avgSaveRate,
        avgShareRate: stats.avgShareRate,
        instagram: stats.instagram,
        tiktok: stats.tiktok,
        strategy8020Compliance: stats.strategyCompliance,
      },
      kpiTargets: kpiTarget || {},
      recentPublishedSample: publishedContent.slice(0, 10).map((p) => ({
        id: p.contentId,
        title: p.title,
        platform: p.platform,
        pillar: p.pillar,
        funnelStage: p.funnelStage,
        reach: p.reach,
        views: p.views,
        saves: p.saves,
        shares: p.shares,
        likes: p.likes,
        comments: p.comments,
        hook: p.hook,
      })),
    };
  };

  const handleRunDecisionEngine = async () => {
    setIsDecisionLoading(true);
    try {
      const stats = aggregateContent(publishedContent);
      const res = await fetch('/api/gemini/decision-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postsSummary: {
            totalPosts: publishedContent.length,
            totalViews: stats.totalViews,
            totalReach: stats.totalReach,
            avgEngagement: stats.avgEngagementByReach,
          },
          competitorSummary: competitors,
          kpiSummary: kpiTarget,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDecisionData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDecisionLoading(false);
    }
  };

  const handleGenerateBriefFromMandate = async (mandate: any) => {
    setIsGeneratingBrief(true);
    try {
      const briefReq = mandate.recommendedBrief || {};
      const res = await fetch('/api/gemini/production-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: briefReq.title || mandate.title,
          angle: mandate.rationale,
          objective: mandate.type === 'FIX_LEAK' ? 'Konversi & Link Bio' : 'Problem Solving & Skalasi Konten',
          sku: briefReq.sku || 'Sulawesi Toraja Roast-to-Order',
          funnelStage: briefReq.funnelStage || 'MOFU',
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

  const handleGenerateFullAudit = async () => {
    setIsGeneratingOverall(true);
    try {
      const payload = {
        question: null,
        analyticsData: prepareAnalyticsContext(),
      };
      const res = await fetch('/api/gemini/analyst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setOverallAnalysis(data.text);
    } catch (err: any) {
      console.error(err);
      alert('Gagal membuat evaluasi analitik: ' + err.message);
    } finally {
      setIsGeneratingOverall(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const q = textToSend || inputQuestion;
    if (!q.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const payload = {
        question: q,
        analyticsData: prepareAnalyticsContext(),
      };
      const res = await fetch('/api/gemini/analyst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.text,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'Maaf, terjadi kesalahan saat menganalisis data: ' + err.message,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* AI Decision Engine Header & Trigger Card */}
      <div className="bg-gradient-to-r from-[#00224a] via-[#0e4380] to-[#00224a] text-white p-6 rounded-2xl shadow-md border border-[#dab553]/40 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#dab553] text-[#00224a]">
              <Sparkles className="w-5 h-5 font-bold" />
            </span>
            <h2 className="text-lg font-bold font-serif text-white">
              AI Decision Engine: Mesin Pengambil Keputusan Eksekutif
            </h2>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            Bukan sekadar grafik pasif. Mesin ini mengolah fakta metrik riil Deluxe Coffee ({publishedContent.length} postingan) & gap kompetitor, lalu mengeluarkan mandat aksi nyata dan brief konten siap syuting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunDecisionEngine}
            disabled={isDecisionLoading || publishedContent.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#ffefa2] to-[#dab553] hover:opacity-95 text-[#00224a] shadow-md transition-all disabled:opacity-50"
          >
            {isDecisionLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#00224a]" />
            ) : (
              <Target className="w-4 h-4 text-[#00224a]" />
            )}
            <span>{isDecisionLoading ? 'Mengolah Keputusan...' : 'Jalankan AI Decision Engine'}</span>
          </button>

          <button
            onClick={handleGenerateFullAudit}
            disabled={isGeneratingOverall || publishedContent.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all disabled:opacity-50"
          >
            {isGeneratingOverall ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            <span>Audit Analitik</span>
          </button>
        </div>
      </div>

      {/* DECISION ENGINE ACTIVE MANDATES */}
      {decisionData && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900">
                  4 Mandat Keputusan Strategis Deluxe Coffee
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                {decisionData.executiveDiagnosis}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Tingkat Kesehatan Akun</span>
                <span className="text-base font-bold font-mono text-[#00224a]">
                  {decisionData.overallHealthScore || 85} / 100
                </span>
              </div>
            </div>
          </div>

          {/* 4 Mandates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {decisionData.mandates?.map((m: any, idx: number) => {
              const isUrgent = m.priority === 'URGENT';
              const isWinner = m.type === 'SCALE_WINNER';
              const isLeak = m.type === 'FIX_LEAK';

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                    isWinner
                      ? 'bg-amber-50/60 border-amber-300'
                      : isLeak
                      ? 'bg-red-50/50 border-red-300'
                      : 'bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isUrgent
                            ? 'bg-red-600 text-white'
                            : isWinner
                            ? 'bg-amber-600 text-white'
                            : 'bg-[#00224a] text-white'
                        }`}
                      >
                        {m.priority} • {m.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-600">
                        Mandat #{idx + 1}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {m.title}
                    </h4>

                    {/* Data Evidence */}
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                        Fakta Metrik Aktual:
                      </span>
                      <p className="font-mono text-slate-900 font-semibold">{m.dataEvidence}</p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {m.rationale}
                    </p>

                    {/* Action Steps */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        Langkah Aksi Taktis:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-800">
                        {m.actionSteps?.map((step: string, sIdx: number) => (
                          <li key={sIdx} className="flex items-start gap-1.5">
                            <span className="text-[#0e4380] font-bold mt-0.5">›</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommended Action / Brief Trigger */}
                  <div className="pt-3 border-t border-slate-200/70">
                    {m.recommendedBrief && (
                      <div className="mb-3 text-xs">
                        <span className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Usulan Konten:</span>
                        <p className="font-semibold text-[#00224a] leading-tight">
                          "{m.recommendedBrief.title}"
                        </p>
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          Hook: "{m.recommendedBrief.hook}"
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => handleGenerateBriefFromMandate(m)}
                      disabled={isGeneratingBrief}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#00224a] hover:bg-[#0e4380] text-white text-xs font-bold transition-all shadow-sm"
                    >
                      <Clapperboard className="w-3.5 h-3.5 text-[#dab553]" />
                      <span>Buat Brief Siap Syuting dari Mandat Ini</span>
                      <ArrowRight className="w-3 h-3 text-[#dab553]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Audit Trigger Banner */}
      <div className="bg-gradient-to-r from-[#00224a] to-[#0e4380] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#dab553]" />
            <h2 className="text-base font-bold font-serif">
              AI Content Analyst Deluxe Coffee (Google Gemini)
            </h2>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            Terhubung langsung dengan data performa aktual di database Anda. AI ini membedakan fakta analitik riil dari hipotesis dan rekomendasi taktis, menjaga pilar 80% problem-solving & 20% selling.
          </p>
        </div>

        <button
          onClick={handleGenerateFullAudit}
          disabled={isGeneratingOverall || publishedContent.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#dab553] hover:bg-[#b89333] text-[#00224a] shadow-md transition-all disabled:opacity-50"
        >
          {isGeneratingOverall ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          <span>{isGeneratingOverall ? 'Menganalisis Data...' : 'Jalankan Evaluasi Komprehensif'}</span>
        </button>
      </div>

      {/* COMPREHENSIVE AUDIT REPORT (IF GENERATED) */}
      {overallAnalysis && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Laporan Evaluasi Menyeluruh Deluxe Coffee</span>
            </div>
            <button
              onClick={() => setOverallAnalysis(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Tutup Ringkasan
            </button>
          </div>

          <div className="prose prose-sm max-w-none text-slate-800 text-xs leading-relaxed whitespace-pre-wrap font-sans">
            {overallAnalysis}
          </div>
        </div>
      )}

      {/* CONVERSATIONAL ANALYST INTERFACE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Chat Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00224a] text-[#dab553] flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Konsultasi Analitik Media Sosial</h3>
              <p className="text-[10px] text-slate-500">
                Data real-time: {publishedContent.length} konten terbit dianalisis
              </p>
            </div>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            Gemini 3.8 Flash • Telemetri Roastery Aktif
          </span>
        </div>

        {/* Chat Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="py-12 text-center space-y-3 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#0e4380]/10 text-[#0e4380] mx-auto flex items-center justify-center">
                <Coffee className="w-6 h-6 text-[#dab553]" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Tanyakan apa saja seputar performa akun Instagram & TikTok Deluxe Coffee
              </p>
              <p className="text-[11px] text-slate-500">
                Pilih salah satu pertanyaan siap pakai di bawah ini atau ketik pertanyaan kustom Anda.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-[#00224a] text-[#dab553] flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  AI
                </div>
              )}

              <div
                className={`max-w-2xl p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-[#00224a] text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-none shadow-sm'
                }`}
              >
                {msg.text}
                <div
                  className={`text-[9px] mt-1.5 ${
                    msg.sender === 'user' ? 'text-slate-300 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 text-xs">
              <div className="w-7 h-7 rounded-full bg-[#00224a] text-[#dab553] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                AI
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center gap-2 text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0e4380]" />
                <span>AI Analyst sedang memeriksa basis data Deluxe Coffee...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Chips */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] text-slate-400 font-semibold uppercase flex-shrink-0">
            Saran:
          </span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-[#0e4380] hover:text-[#0e4380] transition-colors whitespace-nowrap flex-shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ketik pertanyaan untuk AI Analyst (cth: Kenapa save rate minggu ini naik?)..."
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 px-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0e4380]"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuestion.trim() || isLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#00224a] hover:bg-[#0e4380] shadow disabled:opacity-40 transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-[#dab553]" />
            <span>Kirim</span>
          </button>
        </div>
      </div>

      {/* Production Brief Modal */}
      <ProductionBriefModal
        isOpen={isBriefModalOpen}
        onClose={() => setIsBriefModalOpen(false)}
        brief={selectedBrief}
      />
    </div>
  );
};

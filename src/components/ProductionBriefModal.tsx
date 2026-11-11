import React, { useState } from 'react';
import {
  X,
  Clapperboard,
  CheckCircle2,
  Copy,
  Check,
  CalendarPlus,
  Sparkles,
  Coffee,
  Volume2,
  Film,
  Target,
  ArrowRight,
} from 'lucide-react';
import { useData } from '../context/DataContext.tsx';

export interface ProductionBriefData {
  briefTitle: string;
  objective: string;
  targetAudience: string;
  audienceProblem: string;
  singleOriginFeatured: string;
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU';
  pillar: string;
  contentFormat: string;
  estimatedDuration: string;
  hooks: {
    type: string;
    onScreenText: string;
    spokenHook: string;
  }[];
  fullScript: string;
  scenes: {
    sceneNumber: number;
    timeRange: string;
    cameraAngle: string;
    visualAction: string;
    onScreenText: string;
    audioNarration: string;
  }[];
  soundAndMood: string;
  ctaDirective: string;
  pinnedCommentCopy: string;
}

interface ProductionBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  brief: ProductionBriefData | null;
}

export const ProductionBriefModal: React.FC<ProductionBriefModalProps> = ({
  isOpen,
  onClose,
  brief,
}) => {
  const { addContentIdea } = useData();
  const [copiedScript, setCopiedScript] = useState(false);
  const [savedToPlanner, setSavedToPlanner] = useState(false);
  const [activeHookIndex, setActiveHookIndex] = useState(0);

  if (!isOpen || !brief) return null;

  const handleCopyScript = () => {
    const text = `PRODUKSI BRIEF KONTEN DELUXE COFFEE
Judul: ${brief.briefTitle}
SKU Origin: ${brief.singleOriginFeatured}
Format: ${brief.contentFormat} (${brief.estimatedDuration})
Pilar: ${brief.pillar} | Funnel: ${brief.funnelStage}

HOOK PILIHAN:
${brief.hooks?.[activeHookIndex]?.spokenHook || ''}

NASKAH LENGKAP:
${brief.fullScript}

CTA:
${brief.ctaDirective}
Pinned Comment:
${brief.pinnedCommentCopy}
`;
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleSaveToPlanner = async () => {
    try {
      await addContentIdea({
        title: brief.briefTitle,
        objective: brief.objective,
        platform: 'both',
        pillar: brief.pillar,
        funnelStage: brief.funnelStage,
        targetAudience: brief.targetAudience,
        audienceProblem: brief.audienceProblem,
        contentAngle: `Penonjolan ${brief.singleOriginFeatured} & Solusi Masalah`,
        hook: brief.hooks?.[activeHookIndex]?.spokenHook || brief.briefTitle,
        contentFormat: brief.contentFormat,
        contentConcept: brief.fullScript,
        cta: brief.ctaDirective,
        priority: 'high',
        status: 'scripting',
        plannedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      setSavedToPlanner(true);
      setTimeout(() => setSavedToPlanner(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#00224a] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#dab553] to-[#ffefa2] flex items-center justify-center text-[#00224a] font-bold">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#dab553]/20 text-[#ffefa2] border border-[#dab553]/40">
                  Ready-to-Shoot Production Brief
                </span>
                <span className="text-[10px] font-mono text-slate-300">
                  {brief.estimatedDuration || '45-60 Detik'}
                </span>
              </div>
              <h2 className="text-base font-bold mt-0.5 text-white">{brief.briefTitle}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Ribbon */}
        <div className="flex flex-wrap items-center justify-between px-6 py-2.5 bg-slate-50 border-b border-slate-200 text-xs gap-3">
          <div className="flex items-center gap-3 text-slate-600">
            <span className="flex items-center gap-1 font-semibold text-slate-800">
              <Coffee className="w-3.5 h-3.5 text-[#dab553]" />
              <span>SKU: {brief.singleOriginFeatured}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {brief.funnelStage} ({brief.pillar})
            </span>
            <span className="text-slate-300">•</span>
            <span>Format: {brief.contentFormat}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyScript}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 font-semibold text-slate-700 transition-all shadow-sm"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? 'Tersalin!' : 'Salin Naskah'}</span>
            </button>

            <button
              onClick={handleSaveToPlanner}
              disabled={savedToPlanner}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#00224a] hover:bg-[#0e4380] text-white font-bold transition-all shadow-sm disabled:bg-emerald-700"
            >
              {savedToPlanner ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <CalendarPlus className="w-3.5 h-3.5 text-[#dab553]" />
              )}
              <span>{savedToPlanner ? 'Tersimpan di Planner!' : 'Kirim ke Content Planner'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Target Audience & Problem Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-[#0e4380]" /> Target Audiens
              </span>
              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                {brief.targetAudience}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <Coffee className="w-3.5 h-3.5 text-amber-700" /> Masalah Nyata yang Diselesaikan
              </span>
              <p className="text-xs text-amber-950 font-medium leading-relaxed">
                {brief.audienceProblem}
              </p>
            </div>
          </div>

          {/* Hook 3 Detik Pertama */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#dab553]" />
                <span>Pilihan Hook 3 Detik Pertama (Thumb-Stopper)</span>
              </h3>
              <span className="text-[11px] text-slate-500">Pilih hook yang paling sesuai untuk syuting</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {brief.hooks?.map((h, i) => (
                <div
                  key={i}
                  onClick={() => setActiveHookIndex(i)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    activeHookIndex === i
                      ? 'bg-blue-50/80 border-[#0e4380] shadow-sm ring-1 ring-[#0e4380]'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Tipe: {h.type}
                    </span>
                    {activeHookIndex === i && (
                      <span className="text-[10px] font-bold text-[#0e4380] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Dipilih
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-900 leading-snug">
                    "{h.spokenHook}"
                  </p>
                  <div className="mt-2 text-[11px] text-slate-500 font-mono">
                    Text on Screen: {h.onScreenText}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Storyboard Adegan per Adegan */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Film className="w-4 h-4 text-[#00224a]" />
              <span>Storyboard & Panduan Kamera Adegan per Adegan</span>
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#00224a] text-white font-semibold">
                  <tr>
                    <th className="p-2.5 w-16">Scene</th>
                    <th className="p-2.5 w-24">Durasi</th>
                    <th className="p-2.5 w-40">Angle Kamera</th>
                    <th className="p-2.5">Aksi Visual & Setting</th>
                    <th className="p-2.5">Teks di Layar</th>
                    <th className="p-2.5">Narasi Suara Barista</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {brief.scenes?.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 align-top">
                      <td className="p-2.5 font-bold font-mono text-[#00224a]">#{s.sceneNumber}</td>
                      <td className="p-2.5 font-mono text-slate-600 text-[11px]">{s.timeRange}</td>
                      <td className="p-2.5 font-semibold text-slate-800">{s.cameraAngle}</td>
                      <td className="p-2.5 text-slate-700 leading-relaxed">{s.visualAction}</td>
                      <td className="p-2.5 font-mono text-blue-900 bg-blue-50/30 text-[11px]">{s.onScreenText || '-'}</td>
                      <td className="p-2.5 text-slate-900 font-medium leading-relaxed italic">"{s.audioNarration}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sound, Mood & Conversion CTA Directives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-slate-700" />
                <span>Audio, Sound FX & Mood Visual</span>
              </span>
              <p className="text-xs text-slate-800 leading-relaxed">
                {brief.soundAndMood || 'ASMR gemercik air V60, suara tuangan beans ke grinder hopper, musik latar lo-fi akustik hangat.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                <span>Instruksi CTA & Copy Pinned Comment (Mengatasi Masalah 0 Clicks)</span>
              </span>
              <p className="text-xs font-bold text-emerald-950">
                "{brief.ctaDirective}"
              </p>
              {brief.pinnedCommentCopy && (
                <div className="mt-2 p-2 bg-white/80 rounded border border-emerald-200 text-[11px] text-emerald-900 font-mono">
                  <strong>Pinned Comment:</strong> {brief.pinnedCommentCopy}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

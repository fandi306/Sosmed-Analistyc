import React, { useState } from 'react';
import {
  Sparkles,
  Lightbulb,
  Anchor,
  FileVideo,
  Layout,
  MessageSquare,
  Compass,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Coffee,
  Clock,
  Layers,
} from 'lucide-react';
import { useData } from '../context/DataContext.tsx';
import { DELUXE_BRAND, ALL_PILLARS, FunnelStage } from '../types.ts';

type StudioTool = 'ideas' | 'hooks' | 'script' | 'caption';

export const AiStudioView: React.FC<{
  onOpenNewIdeaWithPrefill: (data: any) => void;
}> = ({ onOpenNewIdeaWithPrefill }) => {
  const { addContentIdea } = useData();

  const [activeTool, setActiveTool] = useState<StudioTool>('ideas');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Idea Generator State
  const [ideaTopic, setIdeaTopic] = useState('Edukasi cara seduh single origin Kintamani & Gayo di rumah');
  const [ideaPillar, setIdeaPillar] = useState('Education');
  const [ideaFunnel, setIdeaFunnel] = useState<FunnelStage>('MOFU');
  const [ideaProblem, setIdeaProblem] = useState('Rasa kopi terlalu asam atau pahit gosong karena grinder salah');
  const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  // Hook Generator State
  const [hookTopic, setHookTopic] = useState('Kenapa jangan simpan biji kopi di kulkas dapur Bali');
  const [hookProblem, setHookProblem] = useState('Kelembapan udara tropis merusak aroma volatil specialty coffee');
  const [generatedHooks, setGeneratedHooks] = useState<any[]>([]);
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false);

  // Script & Storyboard Generator State
  const [scriptTitle, setScriptTitle] = useState('Troubleshooting V60: Kenapa Kopi Terasa Seperti Cuka?');
  const [scriptHook, setScriptHook] = useState('Kopi single origin kamu bukan rusak, kamu cuma under-extract!');
  const [scriptOrigin, setScriptOrigin] = useState('Bali Kintamani Washed Organic');
  const [scriptDuration, setScriptDuration] = useState(60);
  const [generatedScript, setGeneratedScript] = useState<any | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // Caption Generator State
  const [captionTitle, setCaptionTitle] = useState('Rahasia Degassing Biji Kopi Roast-to-Order');
  const [captionTopic, setCaptionTopic] = useState('Mengapa tidak boleh langsung diseduh begitu selesai roasting');
  const [captionPlatform, setCaptionPlatform] = useState('both');
  const [generatedCaptions, setGeneratedCaptions] = useState<any[]>([]);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // 1. Generate Ideas
  const handleGenerateIdeas = async () => {
    setIsGeneratingIdeas(true);
    try {
      const res = await fetch('/api/gemini/studio/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: ideaTopic,
          pillar: ideaPillar,
          funnelStage: ideaFunnel,
          audienceProblem: ideaProblem,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setGeneratedIdeas(data.ideas || []);
    } catch (err: any) {
      alert('Gagal menghasilkan ide: ' + err.message);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  // 2. Generate Hooks
  const handleGenerateHooks = async () => {
    setIsGeneratingHooks(true);
    try {
      const res = await fetch('/api/gemini/studio/hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: hookTopic,
          audienceProblem: hookProblem,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setGeneratedHooks(data.hooks || []);
    } catch (err: any) {
      alert('Gagal menghasilkan hooks: ' + err.message);
    } finally {
      setIsGeneratingHooks(false);
    }
  };

  // 3. Generate Script & Storyboard
  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    try {
      const res = await fetch('/api/gemini/studio/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: scriptTitle,
          hook: scriptHook,
          singleOriginFeatured: scriptOrigin,
          durationSeconds: scriptDuration,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setGeneratedScript(data.script || null);
    } catch (err: any) {
      alert('Gagal menghasilkan script: ' + err.message);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // 4. Generate Captions
  const handleGenerateCaptions = async () => {
    setIsGeneratingCaption(true);
    try {
      const res = await fetch('/api/gemini/studio/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: captionTitle,
          topic: captionTopic,
          platform: captionPlatform,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setGeneratedCaptions(data.result?.captions || []);
    } catch (err: any) {
      alert('Gagal menghasilkan caption: ' + err.message);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Studio Header */}
      <div className="bg-gradient-to-r from-[#00224a] via-[#0e4380] to-[#00224a] text-white p-6 rounded-2xl shadow-md border border-[#dab553]/30 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#dab553]" />
            <h2 className="text-lg font-bold font-serif">
              Deluxe AI Content Studio
            </h2>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            Workspace kreasi konten spesifik untuk Deluxe Coffee Bali. Dilatih dengan aturan 80% problem-solving, bebas sapaan klise, dan fokus pada keunggulan roast-to-order single origin Indonesia.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-[#001733]/60 px-3.5 py-2 rounded-xl border border-white/10 text-[#dab553]">
          <Coffee className="w-4 h-4" />
          <span>SCA Certified Roaster Tone Active</span>
        </div>
      </div>

      {/* Studio Tool Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'ideas', label: 'Ide Konten & Konsep', icon: Lightbulb, desc: 'Berdasarkan masalah seduh' },
          { id: 'hooks', label: 'Hook 3 Detik Generator', icon: Anchor, desc: '7 variasi hook pembuka' },
          { id: 'script', label: 'Script & Storyboard', icon: FileVideo, desc: 'Naskah & scene per detik' },
          { id: 'caption', label: 'Caption & CTA Studio', icon: MessageSquare, desc: '3 gaya caption IG/TikTok' },
        ].map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as StudioTool)}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-[#0e4380] shadow-md ring-2 ring-[#0e4380]/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">{tool.label}</span>
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-[#0e4380]' : 'text-slate-400'}`}
                />
              </div>
              <span className="text-[10px] text-slate-500">{tool.desc}</span>
            </button>
          );
        })}
      </div>

      {/* TOOL 1: CONTENT IDEA GENERATOR */}
      {activeTool === 'ideas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#dab553]" />
              <span>Parameter Ide Konten</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Topik / Fokus Bahasan
              </label>
              <input
                type="text"
                value={ideaTopic}
                onChange={(e) => setIdeaTopic(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Masalah Audiens yang Dipecahkan (80% Rule)
              </label>
              <textarea
                rows={2}
                value={ideaProblem}
                onChange={(e) => setIdeaProblem(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Funnel</label>
                <select
                  value={ideaFunnel}
                  onChange={(e) => setIdeaFunnel(e.target.value as FunnelStage)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                >
                  <option value="TOFU">TOFU (Awareness)</option>
                  <option value="MOFU">MOFU (Education)</option>
                  <option value="BOFU">BOFU (Selling)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pillar</label>
                <select
                  value={ideaPillar}
                  onChange={(e) => setIdeaPillar(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                >
                  {ALL_PILLARS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateIdeas}
              disabled={isGeneratingIdeas}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#00224a] hover:bg-[#0e4380] rounded-xl shadow transition-all disabled:opacity-50"
            >
              {isGeneratingIdeas ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#dab553]" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#dab553]" />
              )}
              <span>{isGeneratingIdeas ? 'Menghasilkan Ide...' : 'Hasilkan 5 Ide Segar'}</span>
            </button>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-3">
            {generatedIdeas.map((idea, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#0e4380] shadow-sm space-y-2.5 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-[#0e4380]">
                      {idea.funnelStage} • {idea.pillar}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">{idea.format}</span>
                  </div>

                  <button
                    onClick={() => {
                      addContentIdea({
                        title: idea.title,
                        objective: `Penyelesaian masalah: ${idea.audienceProblem}`,
                        platform: 'both',
                        pillar: idea.pillar || 'Education',
                        funnelStage: idea.funnelStage || 'MOFU',
                        targetAudience: 'Penikmat kopi specialty rumahan',
                        audienceProblem: idea.audienceProblem || '',
                        contentAngle: idea.contentAngle || '',
                        hook: idea.hook || '',
                        contentFormat: idea.format || 'Reels',
                        contentConcept: idea.concept || '',
                        cta: idea.cta || '',
                        priority: 'high',
                        status: 'idea',
                      });
                      alert(`"${idea.title}" berhasil disimpan ke Content Planner!`);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#00224a] bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Simpan ke Planner</span>
                  </button>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{idea.title}</h4>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <p className="font-semibold text-slate-800">
                    Hook:{' '}
                    <span className="font-normal italic text-slate-600">"{idea.hook}"</span>
                  </p>
                  <p className="text-slate-600">Konsep: {idea.concept}</p>
                  <p className="text-[#0e4380] font-semibold">CTA: {idea.cta}</p>
                </div>
              </div>
            ))}

            {generatedIdeas.length === 0 && !isGeneratingIdeas && (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                Klik tombol "Hasilkan 5 Ide Segar" untuk mulai mendapatkan rekomendasi konten roastery.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOOL 2: HOOK GENERATOR */}
      {activeTool === 'hooks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Anchor className="w-4 h-4 text-[#dab553]" />
              <span>Generator Hook 3 Detik</span>
            </h3>
            <p className="text-xs text-slate-500">
              Hook yang tajam dan menghentikan scrolling (stopping power). Tanpa sapaan klise seperti "Halo sobat ngopi".
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Topik Video</label>
              <input
                type="text"
                value={hookTopic}
                onChange={(e) => setHookTopic(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Masalah / Frustrasi Audiens
              </label>
              <textarea
                rows={2}
                value={hookProblem}
                onChange={(e) => setHookProblem(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <button
              onClick={handleGenerateHooks}
              disabled={isGeneratingHooks}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#00224a] hover:bg-[#0e4380] rounded-xl shadow transition-all disabled:opacity-50"
            >
              {isGeneratingHooks ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#dab553]" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#dab553]" />
              )}
              <span>{isGeneratingHooks ? 'Merumuskan Hook...' : 'Buat 7 Variasi Hook'}</span>
            </button>
          </div>

          <div className="lg:col-span-2 space-y-3">
            {generatedHooks.map((h, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {h.type}
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-1">"{h.hook}"</p>
                  {h.visualDirection && (
                    <p className="text-[11px] text-slate-500 italic">
                      Visual: {h.visualDirection}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => copyToClipboard(h.hook, `hook-${idx}`)}
                  className="p-2 text-slate-400 hover:text-[#0e4380] rounded-lg hover:bg-slate-50"
                  title="Salin Hook"
                >
                  {copiedIndex === `hook-${idx}` ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}

            {generatedHooks.length === 0 && !isGeneratingHooks && (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                Masukkan topik dan klik "Buat 7 Variasi Hook" untuk mendapatkan kalimat pembuka video berdaya pikat tinggi.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOOL 3: SCRIPT & STORYBOARD */}
      {activeTool === 'script' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileVideo className="w-4 h-4 text-[#dab553]" />
              <span>Naskah & Storyboard Video</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Video</label>
              <input
                type="text"
                value={scriptTitle}
                onChange={(e) => setScriptTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hook Awal (Opsional)
              </label>
              <input
                type="text"
                value={scriptHook}
                onChange={(e) => setScriptHook(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Single Origin / Produk Featured
              </label>
              <input
                type="text"
                value={scriptOrigin}
                onChange={(e) => setScriptOrigin(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <button
              onClick={handleGenerateScript}
              disabled={isGeneratingScript}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#00224a] hover:bg-[#0e4380] rounded-xl shadow transition-all disabled:opacity-50"
            >
              {isGeneratingScript ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#dab553]" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#dab553]" />
              )}
              <span>{isGeneratingScript ? 'Menulis Script...' : 'Generate Naskah & Storyboard'}</span>
            </button>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {generatedScript ? (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{generatedScript.title}</h4>
                    <span className="text-xs text-slate-500">
                      Durasi Total: {generatedScript.totalDuration || '60 detik'}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      copyToClipboard(generatedScript.fullScript, 'fullscript')
                    }
                    className="flex items-center gap-1 text-xs font-semibold text-[#0e4380] hover:underline"
                  >
                    {copiedIndex === 'fullscript' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Salin Naskah Utuh</span>
                  </button>
                </div>

                {/* Scene-by-scene Storyboard */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Storyboard Adegan per Adegan
                  </h5>

                  {(generatedScript.scenes || []).map((sc: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-bold text-[#0e4380]">
                          Adegan #{sc.sceneNumber || idx + 1} ({sc.timeRange || sc.duration})
                        </span>
                        <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          Kamera: {sc.cameraDirection}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <strong className="text-slate-800 block">Visual Direction:</strong>
                          <span className="text-slate-600">{sc.visualDirection}</span>
                        </div>
                        <div>
                          <strong className="text-slate-800 block">On-Screen Text:</strong>
                          <span className="text-purple-700 font-semibold">{sc.onScreenText}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 text-[11px]">
                        <strong className="text-slate-800">Voice Over (Narasi Roaster):</strong>
                        <p className="italic text-slate-700 mt-0.5">"{sc.voiceOver}"</p>
                      </div>
                    </div>
                  ))}
                </div>

                {generatedScript.caption && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <strong className="text-slate-800 block mb-1">Rekomendasi Caption:</strong>
                    <p className="text-slate-600 whitespace-pre-wrap">{generatedScript.caption}</p>
                  </div>
                )}
              </div>
            ) : (
              !isGeneratingScript && (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                  Generate naskah video lengkap beserta arahan kamera, teks di layar, dan visual scene per detik.
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* TOOL 4: CAPTIONS */}
      {activeTool === 'caption' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#dab553]" />
              <span>Studio Caption & CTA</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Konten</label>
              <input
                type="text"
                value={captionTitle}
                onChange={(e) => setCaptionTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Topik Inti</label>
              <textarea
                rows={2}
                value={captionTopic}
                onChange={(e) => setCaptionTopic(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <button
              onClick={handleGenerateCaptions}
              disabled={isGeneratingCaption}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#00224a] hover:bg-[#0e4380] rounded-xl shadow transition-all disabled:opacity-50"
            >
              {isGeneratingCaption ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#dab553]" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#dab553]" />
              )}
              <span>{isGeneratingCaption ? 'Membuat Caption...' : 'Buat 3 Gaya Caption'}</span>
            </button>
          </div>

          <div className="lg:col-span-2 space-y-3">
            {generatedCaptions.map((cap, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0e4380]">{cap.style}</span>
                  <button
                    onClick={() => copyToClipboard(cap.caption, `cap-${idx}`)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
                  >
                    {copiedIndex === `cap-${idx}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Salin</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {cap.caption}
                </div>
              </div>
            ))}

            {generatedCaptions.length === 0 && !isGeneratingCaption && (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                Buat 3 variasi caption (Sensori, Problem Solving ringkas, dan Interaktif) dengan spacing rapi dan CTA kuat.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

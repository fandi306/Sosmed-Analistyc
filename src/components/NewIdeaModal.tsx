import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, Lightbulb, AlertCircle } from 'lucide-react';
import { ContentIdea, ALL_PILLARS, FunnelStage, ContentStatus, STATUS_LABELS } from '../types.ts';
import { useData } from '../context/DataContext.tsx';

interface NewIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ContentIdea | null;
  defaultDate?: string;
}

export const NewIdeaModal: React.FC<NewIdeaModalProps> = ({
  isOpen,
  onClose,
  initialData,
  defaultDate,
}) => {
  const { addContentIdea, updateContentIdea } = useData();

  const [formData, setFormData] = useState<Omit<ContentIdea, 'id' | 'userId'>>({
    title: '',
    objective: '',
    platform: 'instagram',
    pillar: 'Problem Solution',
    funnelStage: 'MOFU',
    targetAudience: 'Home brewer pemula dan pecinta kopi specialty Bali',
    audienceProblem: 'Rasa kopi sering terlalu asam/pahit saat diseduh sendiri di rumah',
    contentAngle: 'Edukatif & Troubleshooting oleh SCA Roaster',
    hook: '',
    contentFormat: 'Reels',
    contentConcept: '',
    cta: 'Save postingan ini dan konsultasikan grind size kopi favoritmu ke DM kami.',
    priority: 'high',
    status: 'idea',
    plannedDate: defaultDate || new Date().toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        objective: initialData.objective || '',
        platform: initialData.platform || 'instagram',
        pillar: initialData.pillar || 'Problem Solution',
        funnelStage: initialData.funnelStage || 'MOFU',
        targetAudience: initialData.targetAudience || '',
        audienceProblem: initialData.audienceProblem || '',
        contentAngle: initialData.contentAngle || '',
        hook: initialData.hook || '',
        contentFormat: initialData.contentFormat || 'Reels',
        contentConcept: initialData.contentConcept || '',
        cta: initialData.cta || '',
        priority: initialData.priority || 'medium',
        status: initialData.status || 'idea',
        plannedDate: initialData.plannedDate || defaultDate || new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        title: '',
        objective: 'Edukasi cara ekstraksi seimbang pada single origin Bali Kintamani',
        platform: 'both',
        pillar: 'Problem Solution',
        funnelStage: 'MOFU',
        targetAudience: 'Penikmat kopi rumahan yang ingin rasa cangkir andalan konsisten',
        audienceProblem: 'Kopi terasa hambar atau pahit karena suhu air seduh yang salah',
        contentAngle: 'Tips langsung dari Roasting Room Sanur Bali',
        hook: '',
        contentFormat: 'Reels / TikTok',
        contentConcept: 'Tunjukkan perbandingan menyeduh dengan air 88C vs 96C pada beans roast-to-order kami.',
        cta: 'Komentar "SEDUH" untuk panduan lengkap parameter seduh Deluxe Coffee.',
        priority: 'high',
        status: 'idea',
        plannedDate: defaultDate || new Date().toISOString().split('T')[0],
      });
    }
    setErrorMsg('');
  }, [initialData, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg('Judul konten wajib diisi.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (initialData?.id) {
        await updateContentIdea(initialData.id, formData);
      } else {
        await addContentIdea(formData);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan ide konten.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#00224a] text-white">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#dab553]" />
            <h2 className="text-lg font-bold">
              {initialData ? 'Edit Rencana Konten' : 'Buat Rencana Konten Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Rencana Konten
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0e4380]"
              placeholder="e.g. Kenapa Kopi V60 Kamu Rasanya Terlalu Asam Seperti Cuka?"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Platform</label>
              <select
                value={formData.platform}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    platform: e.target.value as 'instagram' | 'tiktok' | 'both',
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              >
                <option value="both">Instagram & TikTok</option>
                <option value="instagram">Instagram Only</option>
                <option value="tiktok">TikTok Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Funnel Stage</label>
              <select
                value={formData.funnelStage}
                onChange={(e) =>
                  setFormData({ ...formData, funnelStage: e.target.value as FunnelStage })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              >
                <option value="TOFU">TOFU (Awareness / Relatable)</option>
                <option value="MOFU">MOFU (Education / Problem Solution - 80%)</option>
                <option value="BOFU">BOFU (Selling / Promo / Closing - 20%)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Content Pillar</label>
              <select
                value={formData.pillar}
                onChange={(e) => setFormData({ ...formData, pillar: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              >
                {ALL_PILLARS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status Produksi</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as ContentStatus })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              >
                {Object.entries(STATUS_LABELS).map(([k, val]) => (
                  <option key={k} value={k}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prioritas</label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              >
                <option value="high">Tinggi (High)</option>
                <option value="medium">Sedang (Medium)</option>
                <option value="low">Rendah (Low)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rencana Tanggal Tayang</label>
              <input
                type="date"
                value={formData.plannedDate || ''}
                onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tujuan Konten (Objective)
              </label>
              <input
                type="text"
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                placeholder="e.g. Edukasi pemulihan rasa kopi yang under-extracted"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Format Konten</label>
              <input
                type="text"
                value={formData.contentFormat}
                onChange={(e) => setFormData({ ...formData, contentFormat: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                placeholder="e.g. Vertical Video 60s / Carousel"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Masalah Audiens yang Diselesaikan (Problem)
              </label>
              <textarea
                rows={2}
                value={formData.audienceProblem}
                onChange={(e) => setFormData({ ...formData, audienceProblem: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                placeholder="Apa kesulitan atau mitos yang dialami konsumen kopi?"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sudut Pandang (Content Angle)
              </label>
              <textarea
                rows={2}
                value={formData.contentAngle}
                onChange={(e) => setFormData({ ...formData, contentAngle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                placeholder="e.g. Pembongkaran mitos oleh roaster tersertifikasi SCA"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Opening Hook (3 Detik Pertama)
            </label>
            <input
              type="text"
              value={formData.hook}
              onChange={(e) => setFormData({ ...formData, hook: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              placeholder="e.g. Kopi single origin kamu bukan rusak, kamu cuma under-extract!"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Konsep Konten & Visual Direction
            </label>
            <textarea
              rows={3}
              value={formData.contentConcept}
              onChange={(e) => setFormData({ ...formData, contentConcept: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              placeholder="Jelaskan alur konten, properti, apa yang dilakukan roaster, visual closeup beans..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Call to Action (CTA)
            </label>
            <input
              type="text"
              value={formData.cta}
              onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              placeholder="e.g. Save video ini untuk referensi seduh besok pagi."
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#00224a] hover:bg-[#0e4380] rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#dab553]" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Rencana'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

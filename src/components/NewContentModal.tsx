import React, { useState, useEffect } from 'react';
import { X, Save, Coffee, AlertCircle } from 'lucide-react';
import { PublishedContent, ALL_PILLARS, FunnelStage, DELUXE_BRAND } from '../types.ts';
import { useData } from '../context/DataContext.tsx';

interface NewContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: PublishedContent | null;
}

export const NewContentModal: React.FC<NewContentModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { addPublishedContent, updatePublishedContent } = useData();

  const [formData, setFormData] = useState<Omit<PublishedContent, 'id' | 'userId'>>({
    contentId: '',
    title: '',
    publishDate: new Date().toISOString().split('T')[0],
    platform: 'instagram',
    pillar: 'Education',
    funnelStage: 'MOFU',
    contentFormat: 'Reels',
    hook: '',
    caption: '',
    cta: '',
    contentAngle: '',
    productFeatured: 'Bali Kintamani Washed',
    videoDuration: 60,
    contentUrl: '',
    views: 0,
    reach: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    profileVisits: 0,
    followersGained: 0,
    linkClicks: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        contentId: initialData.contentId || '',
        title: initialData.title || '',
        publishDate: initialData.publishDate || new Date().toISOString().split('T')[0],
        platform: initialData.platform || 'instagram',
        pillar: initialData.pillar || 'Education',
        funnelStage: initialData.funnelStage || 'MOFU',
        contentFormat: initialData.contentFormat || 'Reels',
        hook: initialData.hook || '',
        caption: initialData.caption || '',
        cta: initialData.cta || '',
        contentAngle: initialData.contentAngle || '',
        productFeatured: initialData.productFeatured || 'Bali Kintamani Washed',
        videoDuration: initialData.videoDuration || 0,
        contentUrl: initialData.contentUrl || '',
        views: initialData.views || 0,
        reach: initialData.reach || 0,
        likes: initialData.likes || 0,
        comments: initialData.comments || 0,
        shares: initialData.shares || 0,
        saves: initialData.saves || 0,
        profileVisits: initialData.profileVisits || 0,
        followersGained: initialData.followersGained || 0,
        linkClicks: initialData.linkClicks || 0,
      });
    } else {
      setFormData({
        contentId: `DLX-${Date.now().toString().slice(-4)}`,
        title: '',
        publishDate: new Date().toISOString().split('T')[0],
        platform: 'instagram',
        pillar: 'Education',
        funnelStage: 'MOFU',
        contentFormat: 'Reels',
        hook: '',
        caption: '',
        cta: '',
        contentAngle: 'Edukatif & Solusi Rasa',
        productFeatured: 'Bali Kintamani Washed Organic',
        videoDuration: 45,
        contentUrl: '',
        views: 0,
        reach: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        profileVisits: 0,
        followersGained: 0,
        linkClicks: 0,
      });
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

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
        await updatePublishedContent(initialData.id, formData);
      } else {
        await addPublishedContent(formData);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data konten.');
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
            <Coffee className="w-5 h-5 text-[#dab553]" />
            <h2 className="text-lg font-bold">
              {initialData ? 'Edit Data Konten Tayang' : 'Input Konten Tayang Baru'}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Identitas Konten */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0e4380] mb-3">
              1. Identitas Konten Deluxe Coffee
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Content ID
                </label>
                <input
                  type="text"
                  value={formData.contentId}
                  onChange={(e) => setFormData({ ...formData, contentId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0e4380] focus:border-[#0e4380]"
                  placeholder="e.g. DLX-IG-025"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) =>
                    setFormData({ ...formData, platform: e.target.value as 'instagram' | 'tiktok' })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0e4380] focus:border-[#0e4380]"
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Tayang (DD/MM/YYYY)
                </label>
                <input
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0e4380] focus:border-[#0e4380]"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Judul Konten
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0e4380] focus:border-[#0e4380]"
                placeholder="Contoh: 3 Kesalahan Simpan Biji Kopi di Dapur Tropis Bali"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Funnel Stage
                </label>
                <select
                  value={formData.funnelStage}
                  onChange={(e) =>
                    setFormData({ ...formData, funnelStage: e.target.value as FunnelStage })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0e4380] focus:border-[#0e4380]"
                >
                  <option value="TOFU">TOFU (Top of Funnel - Awareness)</option>
                  <option value="MOFU">MOFU (Middle - Education/Problem Solving)</option>
                  <option value="BOFU">BOFU (Bottom - Promotion/Selling)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Content Pillar
                </label>
                <select
                  value={formData.pillar}
                  onChange={(e) => setFormData({ ...formData, pillar: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0e4380] focus:border-[#0e4380]"
                >
                  {ALL_PILLARS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Format Konten
                </label>
                <select
                  value={formData.contentFormat}
                  onChange={(e) => setFormData({ ...formData, contentFormat: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0e4380] focus:border-[#0e4380]"
                >
                  <option value="Reels">Reels</option>
                  <option value="TikTok Video">TikTok Video</option>
                  <option value="Carousel">Carousel</option>
                  <option value="Single Image">Single Image</option>
                  <option value="Story">Story</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Detail Konten & Single Origin */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0e4380] mb-3">
              2. Detail Materi & Biji Kopi yang Ditampilkan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Opening Hook (3 Detik Pertama)
                </label>
                <input
                  type="text"
                  value={formData.hook}
                  onChange={(e) => setFormData({ ...formData, hook: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0e4380] focus:border-[#0e4380]"
                  placeholder="Jangan simpan kopi di kulkas kalau kamu tinggal di daerah tropis..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Biji Kopi / Produk Unggulan
                </label>
                <input
                  type="text"
                  value={formData.productFeatured || ''}
                  onChange={(e) => setFormData({ ...formData, productFeatured: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0e4380] focus:border-[#0e4380]"
                  placeholder="e.g. Bali Kintamani Natural, Gayo Anaerobic Honey"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Call to Action (CTA)
                </label>
                <input
                  type="text"
                  value={formData.cta || ''}
                  onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0e4380] focus:border-[#0e4380]"
                  placeholder="e.g. Save resep ini untuk ritual seduh besok pagi."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL Postingan / Video
                </label>
                <input
                  type="url"
                  value={formData.contentUrl || ''}
                  onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0e4380] focus:border-[#0e4380]"
                  placeholder="https://instagram.com/p/..."
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Caption Lengkap
              </label>
              <textarea
                rows={3}
                value={formData.caption || ''}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0e4380] focus:border-[#0e4380]"
                placeholder="Isi teks caption yang diunggah..."
              />
            </div>
          </div>

          {/* Section 3: Data Analitik & Metrik Kinerja Aktual */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0e4380] mb-3">
              3. Metrik Performa Aktual (Data Riil Insights)
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Masukkan angka aktual dari Instagram Insights atau TikTok Analytics. Jangan mengarang metrik palsu.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Views (Tayangan)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.views}
                  onChange={(e) => setFormData({ ...formData, views: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Reach (Jangkauan)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.reach}
                  onChange={(e) => setFormData({ ...formData, reach: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Likes</label>
                <input
                  type="number"
                  min="0"
                  value={formData.likes}
                  onChange={(e) => setFormData({ ...formData, likes: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Comments</label>
                <input
                  type="number"
                  min="0"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Shares (Dibagikan)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.shares}
                  onChange={(e) => setFormData({ ...formData, shares: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Saves (Disimpan)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.saves}
                  onChange={(e) => setFormData({ ...formData, saves: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Profile Visits</label>
                <input
                  type="number"
                  min="0"
                  value={formData.profileVisits}
                  onChange={(e) => setFormData({ ...formData, profileVisits: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Followers Baru</label>
                <input
                  type="number"
                  min="0"
                  value={formData.followersGained}
                  onChange={(e) => setFormData({ ...formData, followersGained: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Link Clicks</label>
                <input
                  type="number"
                  min="0"
                  value={formData.linkClicks}
                  onChange={(e) => setFormData({ ...formData, linkClicks: Number(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>
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
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan ke Database'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

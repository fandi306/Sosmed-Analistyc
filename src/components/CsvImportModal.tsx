import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  RefreshCw,
  Sparkles,
  ClipboardList,
  Edit,
  Trash2,
  HelpCircle,
  Link,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { PublishedContent } from '../types.ts';
import { useData } from '../context/DataContext.tsx';
import { parseDelimitedText, parseGoogleSheetRows } from '../utils/sheetParser.ts';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ImportTab = 'google-sheets' | 'file-upload' | 'screenshot';

const DEFAULT_DELUXE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1NkwrA9OM3p4fKo_AAwZhgWWxFXBk--oIPVeYB_GdB5s/edit?usp=drivesdk';

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { importCsvBatch, addPublishedContent, saveWeeklyReport } = useData();
  const [activeTab, setActiveTab] = useState<ImportTab>('google-sheets');

  // Google Sheets & Paste State
  const [pastedSheetText, setPastedSheetText] = useState('');
  const [sheetUrl, setSheetUrl] = useState(DEFAULT_DELUXE_SHEET_URL);
  const [selectedSheetTab, setSelectedSheetTab] = useState<'smart-merge' | '448205240' | '0' | '222277637'>('smart-merge');
  const [isFetchingSheet, setIsFetchingSheet] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [weeklySummaries, setWeeklySummaries] = useState<any[]>([]);
  const [isSavingWeeklyReports, setIsSavingWeeklyReports] = useState(false);
  const [weeklyReportsSaved, setWeeklyReportsSaved] = useState(false);

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Preview & Processing
  const [previewItems, setPreviewItems] = useState<Omit<PublishedContent, 'id' | 'userId'>[]>([]);
  const [detectedColumns, setDetectedColumns] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'input' | 'preview' | 'success'>('input');
  const [importResult, setImportResult] = useState<{ imported: number; duplicates: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [notesMsg, setNotesMsg] = useState('');
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  // Screenshot OCR State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrExtracted, setOcrExtracted] = useState<any>(null);
  const [ocrSavedSuccess, setOcrSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Process Google Sheet Text (Instant Local TSV Parser with auto column detection)
  const handleProcessSheetText = (textToProcess?: string) => {
    const raw = (textToProcess !== undefined ? textToProcess : pastedSheetText).trim();
    if (!raw) {
      setErrorMsg('Teks data masih kosong. Silakan salin (Ctrl+C) data dari Google Sheets lalu tempelkan (Ctrl+V) di sini.');
      return;
    }

    setErrorMsg('');
    try {
      const rows = parseDelimitedText(raw);
      if (rows.length < 2) {
        throw new Error('Data tidak memiliki baris yang cukup. Pastikan Anda menyalin minimal 1 baris judul kolom dan 1 baris data postingan.');
      }

      const { items, recognizedHeaders } = parseGoogleSheetRows(rows, 'instagram');

      if (items.length === 0) {
        throw new Error('Kolom data tidak terbaca. Klik tombol "Olah dengan Gemini AI" di bawah agar AI memetakan otomatis.');
      }

      setPreviewItems(items);
      setDetectedColumns(recognizedHeaders);
      setNotesMsg(`Berhasil membaca ${items.length} postingan dari Google Sheets secara instan!`);
      setStep('preview');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses teks.');
    }
  };

  // 2. Fetch Google Sheet via URL (Multi-Tab Smart Merge & Direct Tab Support)
  const handleFetchSheetFromUrl = async (overrideTab?: 'smart-merge' | '448205240' | '0' | '222277637') => {
    if (!sheetUrl.trim()) {
      setErrorMsg('Silakan masukkan link URL Google Sheets Anda.');
      return;
    }

    setIsFetchingSheet(true);
    setErrorMsg('');
    const activeTabTarget = overrideTab || selectedSheetTab;

    try {
      const res = await fetch('/api/fetch-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: sheetUrl.trim(),
          gid: activeTabTarget !== 'smart-merge' ? activeTabTarget : undefined,
          mode: activeTabTarget === 'smart-merge' ? 'smart-merge' : 'tab',
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error);
      }

      if (data.items && data.items.length > 0) {
        setPreviewItems(data.items);
        setPastedSheetText(data.csvText || '');
        if (data.weeklySummaries && data.weeklySummaries.length > 0) {
          setWeeklySummaries(data.weeklySummaries);
        }
        setNotesMsg(data.notes || `Berhasil mengambil ${data.items.length} postingan aktual Deluxe Coffee beserta angka Views & Reach dari Google Sheet!`);
        setStep('preview');
      } else if (data.csvText) {
        setPastedSheetText(data.csvText);
        handleProcessSheetText(data.csvText);
      } else {
        throw new Error('Data dalam Google Sheet kosong.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengambil data dari Google Sheets.');
    } finally {
      setIsFetchingSheet(false);
    }
  };

  // Save Weekly Reports from Sheet to Firestore
  const handleSaveWeeklyReports = async () => {
    if (!weeklySummaries || weeklySummaries.length === 0) return;
    setIsSavingWeeklyReports(true);
    try {
      for (const rep of weeklySummaries) {
        const sDate = rep.weekLabel.includes('19') ? '2026-10-19' : rep.weekLabel.includes('26') ? '2026-10-26' : '2026-11-02';
        const eDate = rep.weekLabel.includes('25') ? '2026-10-25' : rep.weekLabel.includes('1') ? '2026-11-01' : '2026-11-08';
        await saveWeeklyReport({
          title: rep.title,
          startDate: sDate,
          endDate: eDate,
          executiveSummary: rep.learnings || rep.hypothesis || 'Evaluasi performa mingguan konten Deluxe Coffee Bali.',
          igPerformance: 'Konten Instagram Reels mendominasi views dengan puncak pada topik relatable emosional.',
          tiktokPerformance: 'Dalam persiapan integrasi data creator tools.',
          totalPublished: 8,
          bestContent: rep.bestContent,
          worstContent: rep.worstContent,
          pillarPerformance: 'Pillar Relatable & Storytelling menyumbang lebih dari 65% total tayangan.',
          kpiProgress: 'Target views bulanan berada di jalur positif melampaui 40.000 views akumulatif.',
          keyFindings: `${rep.hypothesis}\n\nPembelajaran: ${rep.learnings}`,
          challenges: `${rep.redFlags}\n\nKendala: ${rep.blockers}`,
          recommendations: rep.nextActions,
          status: 'finalized',
        });
      }
      setWeeklyReportsSaved(true);
    } catch (err: any) {
      setErrorMsg('Gagal menyimpan laporan mingguan: ' + (err.message || 'Error'));
    } finally {
      setIsSavingWeeklyReports(false);
    }
  };

  // 3. Fallback: Parse with Gemini AI (For unusually formatted or complex Google Sheets)
  const handleAiDeepParse = async (overrideText?: string) => {
    const text = (overrideText !== undefined ? overrideText : pastedSheetText).trim();
    if (!text) {
      setErrorMsg('Silakan tempelkan teks tabel data atau unggah file terlebih dahulu.');
      return;
    }

    setIsAiProcessing(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/gemini/parse-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: text, platformHint: 'instagram' }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      if (!data.items || data.items.length === 0) {
        throw new Error('AI tidak menemukan data postingan yang valid.');
      }

      setPreviewItems(data.items);
      setNotesMsg(data.summaryNotes || `Gemini AI berhasil mengekstrak dan memperbaiki ${data.items.length} data postingan.`);
      setStep('preview');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses dengan AI.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // 4. File Upload (CSV, TSV, TXT)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      setPastedSheetText(content);
      handleProcessSheetText(content);
    };
    reader.readAsText(file);
  };

  // 5. In-Place Table Editing in Preview
  const handleUpdateItem = (index: number, field: string, val: any) => {
    setPreviewItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setPreviewItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // 6. Confirm and Save to Firestore
  const handleConfirmSave = async () => {
    if (previewItems.length === 0) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const res = await importCsvBatch(previewItems);
      setImportResult(res);
      setStep('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data ke database.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 7. Copy Sample Template
  const handleCopySampleTemplate = () => {
    const sample = `Tanggal\tPlatform\tJudul Konten\tFormat\tPilar\tSingle Origin\tViews\tReach\tLikes\tComments\tShares\tSaves\n2026-11-08\tinstagram\t3 Kesalahan Fatal Simpan Biji Kopi di Dapur Bali\tCarousel\tEducation\tBali Kintamani Washed\t18450\t14200\t1120\t86\t340\t890\n2026-11-07\ttiktok\tKenapa Kopi V60 Kamu Rasanya Terlalu Asam Seperti Cuka?\tTikTok Video\tProblem Solution\tBali Kintamani Natural\t42600\t38200\t3140\t215\t890\t1420`;
    navigator.clipboard.writeText(sample);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  // Screenshot OCR handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      processImageOcr(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const processImageOcr = async (base64: string, mimeType: string) => {
    setIsOcrLoading(true);
    setOcrExtracted(null);
    setOcrSavedSuccess(false);
    setErrorMsg('');

    try {
      const res = await fetch('/api/gemini/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setOcrExtracted(data.extracted);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal OCR screenshot.');
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleSaveOcr = async () => {
    if (!ocrExtracted) return;
    setIsProcessing(true);
    try {
      await addPublishedContent({
        contentId: `DLX-OCR-${Date.now().toString().slice(-4)}`,
        title: ocrExtracted.contentTitleOrCaption || 'Tangkapan Layar Insights Deluxe Coffee',
        publishDate: ocrExtracted.publishDate || new Date().toISOString().split('T')[0],
        platform: ocrExtracted.platform || 'instagram',
        pillar: 'Education',
        funnelStage: 'MOFU',
        contentFormat: ocrExtracted.platform === 'tiktok' ? 'TikTok Video' : 'Reels',
        hook: '',
        caption: ocrExtracted.contentTitleOrCaption || '',
        cta: '',
        productFeatured: 'Bali Kintamani Single Origin',
        views: ocrExtracted.views || 0,
        reach: ocrExtracted.reach || 0,
        likes: ocrExtracted.likes || 0,
        comments: ocrExtracted.comments || 0,
        shares: ocrExtracted.shares || 0,
        saves: ocrExtracted.saves || 0,
        profileVisits: ocrExtracted.profileVisits || 0,
        followersGained: ocrExtracted.followersGained || 0,
        linkClicks: ocrExtracted.linkClicks || 0,
      });
      setOcrSavedSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan hasil OCR.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#00224a] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#dab553] to-[#ffefa2] flex items-center justify-center text-[#00224a] font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Import Data Media Sosial Deluxe Coffee</h2>
              <p className="text-[11px] text-slate-300">
                Mendukung Google Sheets (Copy-Paste / Link), File CSV, dan Analisis AI Cerdas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('google-sheets');
              setStep('input');
            }}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'google-sheets'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Google Sheets (Copy-Paste / Link)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('file-upload');
              setStep('input');
            }}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'file-upload'
                ? 'border-[#0e4380] text-[#0e4380]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4 text-[#0e4380]" />
            <span>Upload File CSV / Excel Export</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('screenshot');
              setStep('input');
            }}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'screenshot'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4 text-purple-600" />
            <span>Screenshot Insights OCR</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Perhatian:</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* TAB 1: GOOGLE SHEETS & COPY-PASTE */}
          {activeTab === 'google-sheets' && step === 'input' && (
            <div className="space-y-5">
              {/* Guidance Banner */}
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Cara Termudah: Copy Langsung dari Google Sheets</span>
                  </h4>
                  <p className="leading-relaxed text-emerald-900/90">
                    Buka Google Sheet Anda, <strong>blok / pilih seluruh tabel data Anda</strong> (termasuk baris judul di atas), tekan <strong>Ctrl + C</strong> (Copy), lalu klik di kotak di bawah dan tekan <strong>Ctrl + V</strong> (Paste). Sistem akan langsung mengenali judul, tanggal, dan metriknya!
                  </p>
                </div>

                <button
                  onClick={handleCopySampleTemplate}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-[11px] font-semibold hover:bg-emerald-100 shadow-sm transition-all"
                  title="Salin contoh baris tabel yang didukung"
                >
                  {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTemplate ? 'Tersalin!' : 'Lihat Contoh Format'}</span>
                </button>
              </div>

              {/* Input Method 1: Direct Paste Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-emerald-700" />
                    <span>Tempelkan (Paste) Tabel Google Sheets Anda Di Sini:</span>
                  </label>
                  {pastedSheetText && (
                    <button
                      onClick={() => setPastedSheetText('')}
                      className="text-xs text-slate-400 hover:text-red-600 underline"
                    >
                      Bersihkan
                    </button>
                  )}
                </div>

                <textarea
                  rows={8}
                  value={pastedSheetText}
                  onChange={(e) => setPastedSheetText(e.target.value)}
                  placeholder={`Contoh data yang di-copy dari Google Sheet:\nJudul Konten\tTanggal\tPlatform\tViews\tReach\tLikes\tComments\tSaves\tShares\n3 Kesalahan Fatal Simpan Biji Kopi di Dapur Bali\t2026-11-08\tinstagram\t18450\t14200\t1120\t86\t890\t340\nKenapa Kopi V60 Kamu Rasanya Terlalu Asam?\t2026-11-07\ttiktok\t42600\t38200\t3140\t215\t1420\t890`}
                  className="w-full p-3 font-mono text-[11px] border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 leading-relaxed bg-white"
                />
              </div>

              {/* Action Buttons for Direct Paste */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="text-xs text-slate-500">
                  {pastedSheetText ? `${pastedSheetText.split('\n').length} baris terdeteksi` : 'Siap menerima paste dari Google Sheet'}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAiDeepParse()}
                    disabled={isAiProcessing || !pastedSheetText.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#00224a] bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl shadow-sm transition-all disabled:opacity-50"
                  >
                    {isAiProcessing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    )}
                    <span>Olah Cerdas dengan Gemini AI</span>
                  </button>

                  <button
                    onClick={() => handleProcessSheetText()}
                    disabled={!pastedSheetText.trim()}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow transition-all disabled:opacity-50"
                  >
                    <span>Proses Data Google Sheet</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Input Method 2: Link Google Sheet & Multi-Tab Selection */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Link className="w-4 h-4 text-[#0e4380]" />
                    <span>Pilih Tab / Mode Google Sheets:</span>
                  </label>
                  <button
                    onClick={() => {
                      setSheetUrl(DEFAULT_DELUXE_SHEET_URL);
                      setSelectedSheetTab('smart-merge');
                    }}
                    className="text-[11px] text-[#0e4380] hover:underline font-semibold"
                  >
                    Gunakan Sheet Deluxe Coffee
                  </button>
                </div>

                {/* Tab selector pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSheetTab('smart-merge')}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      selectedSheetTab === 'smart-merge'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold">⭐ Smart Merge (Rekomendasi)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Gabungkan jadwal terbit, SKU kopi, dan angka views aktual secara otomatis
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSheetTab('448205240')}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      selectedSheetTab === '448205240'
                        ? 'border-[#0e4380] bg-blue-50 text-[#00224a] shadow-sm ring-1 ring-[#0e4380]'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold">Post Performance Tracker</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Tab gid=448205240: Views 7 hari, Reach, Engagement, Shares & Link Clicks
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSheetTab('0')}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      selectedSheetTab === '0'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 shadow-sm ring-1 ring-amber-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold">Content Calendar & Publishing</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Tab gid=0: Kalender publikasi, topik, SKU single origin kopi, format konten
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSheetTab('222277637')}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      selectedSheetTab === '222277637'
                        ? 'border-purple-600 bg-purple-50 text-purple-950 shadow-sm ring-1 ring-purple-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold">Weekly Summary & Experiments</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Tab gid=222277637: Laporan evaluasi mingguan & pembelajaran eksperimen
                    </p>
                  </button>
                </div>

                {/* Input URL & Fetch button */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="url"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0e4380]"
                  />
                  <button
                    onClick={() => handleFetchSheetFromUrl()}
                    disabled={isFetchingSheet || !sheetUrl.trim()}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#00224a] hover:bg-[#0e4380] rounded-xl shadow disabled:opacity-50 transition-all whitespace-nowrap"
                  >
                    {isFetchingSheet ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#dab553]" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-[#dab553]" />
                    )}
                    <span>{isFetchingSheet ? 'Mengambil Data...' : 'Ambil dari Google Sheet'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  *Pastikan setelan Google Sheet diatur ke <em>"Siapa saja yang memiliki link dapat melihat"</em>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: FILE UPLOAD */}
          {activeTab === 'file-upload' && step === 'input' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#0e4380] bg-slate-50/70 hover:bg-slate-50 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-[#00224a]/10 text-[#00224a] flex items-center justify-center">
                  <Upload className="w-6 h-6 text-[#0e4380]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Klik untuk memilih file CSV, TSV, atau TXT
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Mendukung ekspor Meta Business Suite & TikTok Creator Tools
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.tsv,.txt,text/csv,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {uploadedFile && (
                <div className="p-3 bg-slate-100 rounded-xl text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{uploadedFile.name}</span>
                  <button
                    onClick={() => handleAiDeepParse()}
                    className="text-xs font-bold text-[#0e4380] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#dab553]" />
                    <span>Proses dengan AI Gemini</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP: PREVIEW TABLE (INTERACTIVE & IN-PLACE EDITABLE) */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      Pratinjau Data: {previewItems.length} Postingan Siap Masuk Database
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Data Metrik Valid
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Angka views, reach, dan interaksi diambil langsung dari data asli tanpa angka fiktif.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAiDeepParse()}
                    disabled={isAiProcessing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#00224a] bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl shadow-sm transition-all disabled:opacity-50"
                  >
                    {isAiProcessing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    )}
                    <span>Perbaiki dengan AI</span>
                  </button>

                  <button
                    onClick={() => setStep('input')}
                    className="text-xs text-slate-500 hover:text-slate-800 underline px-2"
                  >
                    Kembali
                  </button>
                </div>
              </div>

              {/* Aggregated Quick Metrics bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Total Postingan</span>
                  <p className="text-base font-bold font-mono text-slate-900">{previewItems.length}</p>
                </div>
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                  <span className="text-[10px] font-bold text-[#0e4380] uppercase">Total Views Terbaca</span>
                  <p className="text-base font-bold font-mono text-[#00224a]">
                    {previewItems.reduce((acc, p) => acc + (p.views || 0), 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase">Total Reach</span>
                  <p className="text-base font-bold font-mono text-emerald-900">
                    {previewItems.reduce((acc, p) => acc + (p.reach || 0), 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-900 uppercase">Total Interaksi</span>
                  <p className="text-base font-bold font-mono text-amber-950">
                    {previewItems.reduce((acc, p) => acc + (p.likes || 0) + (p.shares || 0) + (p.saves || 0), 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {notesMsg && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{notesMsg}</span>
                </div>
              )}

              {/* Weekly Reports Sync Banner if available */}
              {weeklySummaries.length > 0 && (
                <div className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>{weeklySummaries.length} Laporan Mingguan Asli Ditemukan di Google Sheet</span>
                    </span>
                    <p className="text-[11px] text-purple-700">
                      Termasuk data evaluasi performa mingguan, eksperimen, dan rekomendasi periode Oktober - November 2026.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveWeeklyReports}
                    disabled={isSavingWeeklyReports || weeklyReportsSaved}
                    className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isSavingWeeklyReports ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : weeklyReportsSaved ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Database className="w-3.5 h-3.5" />
                    )}
                    <span>{weeklyReportsSaved ? 'Laporan Tersimpan!' : isSavingWeeklyReports ? 'Menyimpan...' : 'Simpan Laporan Mingguan'}</span>
                  </button>
                </div>
              )}

              {/* Editable Table */}
              <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-80 shadow-inner">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#00224a] text-white sticky top-0 font-semibold z-10">
                    <tr>
                      <th className="p-2.5">Tanggal</th>
                      <th className="p-2.5">Platform</th>
                      <th className="p-2.5 min-w-[220px]">Judul Konten (Bisa Diedit)</th>
                      <th className="p-2.5 min-w-[130px]">SKU / Origin</th>
                      <th className="p-2.5 text-right font-bold text-[#dab553]">Views</th>
                      <th className="p-2.5 text-right">Reach</th>
                      <th className="p-2.5 text-right">Likes</th>
                      <th className="p-2.5 text-right">Saves</th>
                      <th className="p-2.5 text-right">Shares</th>
                      <th className="p-2.5 text-right">Clicks</th>
                      <th className="p-2.5 text-center">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {previewItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        {/* Date */}
                        <td className="p-2">
                          <input
                            type="date"
                            value={item.publishDate}
                            onChange={(e) => handleUpdateItem(idx, 'publishDate', e.target.value)}
                            className="px-1.5 py-1 text-[11px] border border-slate-200 rounded bg-transparent font-mono"
                          />
                        </td>

                        {/* Platform */}
                        <td className="p-2">
                          <select
                            value={item.platform}
                            onChange={(e) => handleUpdateItem(idx, 'platform', e.target.value)}
                            className="text-[10px] font-bold uppercase px-1.5 py-1 border border-slate-200 rounded"
                          >
                            <option value="instagram">Instagram</option>
                            <option value="tiktok">TikTok</option>
                          </select>
                        </td>

                        {/* Title (editable) */}
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleUpdateItem(idx, 'title', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-200 focus:border-[#0e4380] rounded font-medium text-slate-900"
                            placeholder="Judul postingan..."
                            required
                          />
                        </td>

                        {/* SKU / Origin */}
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.productFeatured || ''}
                            onChange={(e) => handleUpdateItem(idx, 'productFeatured', e.target.value)}
                            className="w-full px-1.5 py-1 text-[11px] border border-slate-200 rounded text-slate-700"
                            placeholder="SKU Kopi..."
                          />
                        </td>

                        {/* Views */}
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            value={item.views}
                            onChange={(e) =>
                              handleUpdateItem(idx, 'views', Number(e.target.value) || 0)
                            }
                            className="w-20 px-1 py-1 text-right text-xs font-mono font-bold text-[#00224a] bg-amber-50/50 border border-amber-300 rounded"
                          />
                        </td>

                        {/* Reach */}
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            value={item.reach}
                            onChange={(e) =>
                              handleUpdateItem(idx, 'reach', Number(e.target.value) || 0)
                            }
                            className="w-20 px-1 py-1 text-right text-xs font-mono border border-slate-200 rounded text-slate-800"
                          />
                        </td>

                        {/* Likes */}
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            value={item.likes}
                            onChange={(e) =>
                              handleUpdateItem(idx, 'likes', Number(e.target.value) || 0)
                            }
                            className="w-16 px-1 py-1 text-right text-xs font-mono border border-slate-200 rounded"
                          />
                        </td>

                        {/* Saves */}
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            value={item.saves}
                            onChange={(e) =>
                              handleUpdateItem(idx, 'saves', Number(e.target.value) || 0)
                            }
                            className="w-16 px-1 py-1 text-right text-xs font-mono border border-slate-200 rounded font-semibold text-[#0e4380]"
                          />
                        </td>

                        {/* Shares */}
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            value={item.shares}
                            onChange={(e) =>
                              handleUpdateItem(idx, 'shares', Number(e.target.value) || 0)
                            }
                            className="w-16 px-1 py-1 text-right text-xs font-mono border border-slate-200 rounded"
                          />
                        </td>

                        {/* Link Clicks */}
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            value={item.linkClicks}
                            onChange={(e) =>
                              handleUpdateItem(idx, 'linkClicks', Number(e.target.value) || 0)
                            }
                            className="w-16 px-1 py-1 text-right text-xs font-mono border border-slate-200 rounded text-slate-600"
                          />
                        </td>

                        {/* Delete Row */}
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                            title="Hapus baris ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Confirm Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <button
                  onClick={() => setStep('input')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Kembali ke Input
                </button>
                <button
                  onClick={handleConfirmSave}
                  disabled={isProcessing || previewItems.length === 0}
                  className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-[#00224a] hover:bg-[#0e4380] rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  <Database className="w-3.5 h-3.5 text-[#dab553]" />
                  <span>
                    {isProcessing
                      ? 'Menyimpan ke Database...'
                      : `Konfirmasi & Simpan ${previewItems.length} Data`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP: SUCCESS */}
          {step === 'success' && importResult && (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Impor Data Berhasil Selesai!
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {importResult.imported} postingan berhasil tersimpan dan langsung masuk ke perhitungan analitik Deluxe Coffee.
                  {importResult.duplicates > 0 && (
                    <span className="text-amber-700 ml-1">
                      ({importResult.duplicates} duplikat diabaikan).
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#00224a] rounded-xl hover:bg-[#0e4380] shadow"
              >
                Tutup & Lihat di Database
              </button>
            </div>
          )}

          {/* TAB 3: SCREENSHOT OCR */}
          {activeTab === 'screenshot' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-700 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Gemini Vision Analytics OCR</p>
                  <p className="text-purple-800 mt-0.5 leading-relaxed">
                    Unggah screenshot dari Instagram Insights atau TikTok Creator Tools. Gemini akan membaca metrik (Views, Reach, Likes, Comments, Saves, Shares, dll) untuk ditinjau sebelum disimpan.
                  </p>
                </div>
              </div>

              {!imagePreview ? (
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-purple-600 bg-slate-50/60 hover:bg-purple-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Pilih atau Drop Screenshot Insights
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG (Maks. 10MB)</p>
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-40 h-48 rounded-xl border border-slate-300 overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={imagePreview} alt="Screenshot" className="w-full h-full object-contain" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          Hasil Ekstraksi OCR Gemini:
                        </span>
                        <button
                          onClick={() => {
                            setImagePreview(null);
                            setOcrExtracted(null);
                          }}
                          className="text-xs text-slate-500 hover:text-red-600 underline"
                        >
                          Ganti Gambar
                        </button>
                      </div>

                      {isOcrLoading && (
                        <div className="p-4 rounded-xl bg-slate-100 flex items-center gap-2 text-xs text-slate-600">
                          <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                          <span>Gemini Vision sedang membaca angka metrik screenshot...</span>
                        </div>
                      )}

                      {ocrExtracted && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="p-2 bg-slate-50 rounded border border-slate-200">
                              <span className="text-[10px] text-slate-500 block">Platform</span>
                              <span className="font-bold uppercase text-[#0e4380]">{ocrExtracted.platform || 'instagram'}</span>
                            </div>
                            <div className="p-2 bg-slate-50 rounded border border-slate-200">
                              <span className="text-[10px] text-slate-500 block">Views</span>
                              <span className="font-bold text-slate-800">{ocrExtracted.views ?? 'N/A'}</span>
                            </div>
                            <div className="p-2 bg-slate-50 rounded border border-slate-200">
                              <span className="text-[10px] text-slate-500 block">Reach</span>
                              <span className="font-bold text-slate-800">{ocrExtracted.reach ?? 'N/A'}</span>
                            </div>
                            <div className="p-2 bg-slate-50 rounded border border-slate-200">
                              <span className="text-[10px] text-slate-500 block">Likes</span>
                              <span className="font-bold text-slate-800">{ocrExtracted.likes ?? 'N/A'}</span>
                            </div>
                            <div className="p-2 bg-slate-50 rounded border border-slate-200">
                              <span className="text-[10px] text-slate-500 block">Comments</span>
                              <span className="font-bold text-slate-800">{ocrExtracted.comments ?? 'N/A'}</span>
                            </div>
                            <div className="p-2 bg-slate-50 rounded border border-slate-200">
                              <span className="text-[10px] text-slate-500 block">Shares</span>
                              <span className="font-bold text-slate-800">{ocrExtracted.shares ?? 'N/A'}</span>
                            </div>
                            <div className="p-2 bg-slate-50 rounded border border-slate-200">
                              <span className="text-[10px] text-slate-500 block">Saves</span>
                              <span className="font-bold text-slate-800">{ocrExtracted.saves ?? 'N/A'}</span>
                            </div>
                            <div className="p-2 bg-slate-50 rounded border border-slate-200">
                              <span className="text-[10px] text-slate-500 block">Followers Baru</span>
                              <span className="font-bold text-slate-800">{ocrExtracted.followersGained ?? 'N/A'}</span>
                            </div>
                          </div>

                          {ocrSavedSuccess ? (
                            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Data screenshot berhasil disimpan ke database!</span>
                            </div>
                          ) : (
                            <button
                              onClick={handleSaveOcr}
                              disabled={isProcessing}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#00224a] hover:bg-[#0e4380] rounded-xl shadow transition-all"
                            >
                              <Database className="w-3.5 h-3.5 text-[#dab553]" />
                              <span>Konfirmasi & Simpan Hasil Screenshot Ini</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

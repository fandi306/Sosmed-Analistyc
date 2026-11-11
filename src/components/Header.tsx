import React from 'react';
import {
  Upload,
  Plus,
  Sparkles,
  Database,
  Trash2,
  LogIn,
  LogOut,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useData } from '../context/DataContext.tsx';

interface HeaderProps {
  title: string;
  subtitle: string;
  onOpenImport: () => void;
  onOpenNewContent: () => void;
  onOpenNewIdea: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenImport,
  onOpenNewContent,
  onOpenNewIdea,
}) => {
  const { user, signInWithGoogle, logout, isOnline } = useAuth();
  const { hasDemoData, loadDemoData, removeDemoData, publishedContent } = useData();

  // Current date formatted in DD/MM/YYYY Asia/Makassar
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Makassar',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Page Title & Timezone */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#0e4380]/10 text-[#0e4380] border border-[#0e4380]/20">
            <Clock className="w-3 h-3" /> Bali (WITA) • {todayFormatted}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Demo Data Management */}
        {hasDemoData ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <span className="font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> DATA DEMO AKTIF
            </span>
            <button
              onClick={removeDemoData}
              className="ml-1 text-xs text-amber-900 hover:text-red-700 font-semibold underline flex items-center gap-1"
              title="Hapus semua data demo untuk mulai dari nol"
            >
              <Trash2 className="w-3 h-3" /> Hapus
            </button>
          </div>
        ) : (
          <button
            onClick={loadDemoData}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors border border-slate-200"
            title="Muat contoh data analitik & konten Deluxe Coffee Bali"
          >
            + Muat Data Demo
          </button>
        )}

        {/* Quick CSV Import */}
        <button
          onClick={onOpenImport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-slate-600" />
          <span>Import CSV / OCR</span>
        </button>

        {/* Quick New Idea / Content */}
        <button
          onClick={onOpenNewIdea}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0e4380] hover:bg-[#00224a] text-white transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-[#dab553]" />
          <span>Rencana Konten</span>
        </button>

        <button
          onClick={onOpenNewContent}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#dab553] hover:bg-[#b89333] text-[#00224a] transition-colors shadow-sm"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Input Data Tayang</span>
        </button>

        {/* Auth / Account Profile */}
        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {user ? (
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00224a] to-[#0e4380] text-white flex items-center justify-center text-xs font-bold border border-[#dab553]">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'D'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                {user.displayName || 'Deluxe Team'}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" /> Cloud Firestore Sync
              </span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            title="Masuk dengan Google untuk sinkronisasi Cloud Firestore"
          >
            <LogIn className="w-3.5 h-3.5 text-[#0e4380]" />
            <span>Login Google</span>
          </button>
        )}
      </div>
    </header>
  );
};

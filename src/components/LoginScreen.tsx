import React, { useState } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Coffee,
  Sparkles,
  ArrowRight,
  AlertCircle,
  LogIn,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { DELUXE_BRAND } from '../types.ts';

export const LoginScreen: React.FC = () => {
  const { loginWithCredentials, signInWithGoogle, authError } = useAuth();

  const [identifier, setIdentifier] = useState('fandi.ahmad@thedeluxecoffee.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await loginWithCredentials(identifier, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Username atau kata sandi tidak valid.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillFixedCredentials = () => {
    setIdentifier('fandi.ahmad@thedeluxecoffee.com');
    setPassword('admin123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001733] via-[#00224a] to-[#0e4380] flex items-center justify-center p-4 sm:p-6 text-slate-900 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#dab553]/30 overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-[#00224a] to-[#0e4380] p-6 text-white text-center relative space-y-2 border-b border-[#dab553]/20">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#dab553] to-[#ffefa2] flex items-center justify-center text-[#00224a] mx-auto shadow-md">
            <Coffee className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold font-serif tracking-tight text-white">
              {DELUXE_BRAND.name}
            </h1>
            <p className="text-xs text-[#dab553] font-semibold tracking-wide uppercase">
              Deluxe Social Intelligence • Security Portal
            </p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-white/10 text-slate-200 border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-[#dab553]" />
              <span>Akses Khusus Tim Roastery & Pengambil Keputusan</span>
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {(errorMessage || authError) && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">Autentikasi Gagal:</span>
                <span>{errorMessage || authError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#0e4380]" />
                <span>Username / Email Resmi:</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="fandi.ahmad@thedeluxecoffee.com"
                  className="w-full pl-3.5 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0e4380] focus:border-[#0e4380] bg-slate-50/50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#0e4380]" />
                  <span>Kata Sandi (Password):</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Sandi Tetap Admin</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0e4380] focus:border-[#0e4380] bg-slate-50/50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#00224a] hover:bg-[#0e4380] shadow-md transition-all disabled:opacity-50 mt-2"
            >
              <Lock className="w-4 h-4 text-[#dab553]" />
              <span>{isLoading ? 'Memverifikasi Akses...' : 'Masuk ke Sistem Keamanan'}</span>
              <ArrowRight className="w-4 h-4 text-[#dab553]" />
            </button>
          </form>

          {/* Fixed Credentials Quick Helper Badge */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-blue-50/60 border border-amber-200/80 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Kredensial Akses Resmi yang Ditetapkan:</span>
              </span>
              <button
                type="button"
                onClick={handleFillFixedCredentials}
                className="text-[11px] font-bold text-[#0e4380] hover:underline"
              >
                Isi Otomatis
              </button>
            </div>

            <div className="space-y-1 font-mono text-[11px] bg-white p-2.5 rounded-xl border border-slate-200 text-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">User / Email:</span>
                <span className="font-bold select-all">fandi.ahmad@thedeluxecoffee.com</span>
              </div>
              <div className="flex justify-between pt-0.5 border-t border-slate-100">
                <span className="text-slate-500 font-sans">Password:</span>
                <span className="font-bold select-all">admin123</span>
              </div>
            </div>
          </div>

          {/* Alternative: Google Login */}
          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition-all"
            >
              <LogIn className="w-4 h-4 text-[#0e4380]" />
              <span>Atau Masuk dengan Akun Google</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          <span>Deluxe Coffee Bali • SCA-Certified Specialty Roastery</span>
        </div>
      </div>
    </div>
  );
};

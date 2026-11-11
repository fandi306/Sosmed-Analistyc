import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Instagram,
  CheckCircle,
  Coffee,
} from 'lucide-react';
import { useData } from '../context/DataContext.tsx';
import {
  ContentIdea,
  PublishedContent,
  STATUS_LABELS,
  PlatformFilter,
  ContentStatus,
} from '../types.ts';

type CalendarViewMode = 'monthly' | 'weekly' | 'daily';

export const ContentCalendarView: React.FC<{
  onOpenNewIdea: (date?: string) => void;
  onEditIdea: (idea: ContentIdea) => void;
}> = ({ onOpenNewIdea, onEditIdea }) => {
  const { contentIdeas, publishedContent, updateContentIdea } = useData();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('monthly');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');

  // Month navigation
  const prevPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'monthly') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'weekly') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const nextPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'monthly') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'weekly') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const today = () => setCurrentDate(new Date());

  // Merge ideas and published contents by date
  const itemsByDate = useMemo(() => {
    const map = new Map<string, { type: 'idea' | 'published'; item: any }[]>();

    contentIdeas.forEach((idea) => {
      if (!idea.plannedDate) return;
      if (
        platformFilter !== 'all' &&
        idea.platform !== platformFilter &&
        idea.platform !== 'both'
      )
        return;

      const dateStr = idea.plannedDate;
      const arr = map.get(dateStr) || [];
      arr.push({ type: 'idea', item: idea });
      map.set(dateStr, arr);
    });

    publishedContent.forEach((pub) => {
      if (platformFilter !== 'all' && pub.platform !== platformFilter) return;
      const dateStr = pub.publishDate;
      const arr = map.get(dateStr) || [];
      arr.push({ type: 'published', item: pub });
      map.set(dateStr, arr);
    });

    return map;
  }, [contentIdeas, publishedContent, platformFilter]);

  // Generate days for Month View
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDay.getDay(); // 0 is Sunday
    // Adjust so Monday is 0
    const startOffset = (startingDayOfWeek + 6) % 7;

    const days: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Previous month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      const str = d.toISOString().split('T')[0];
      days.push({ date: d, isCurrentMonth: false, dateStr: str });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      const str = d.toISOString().split('T')[0];
      days.push({ date: d, isCurrentMonth: true, dateStr: str });
    }

    // Next month padding to fill full grid (multiple of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const str = d.toISOString().split('T')[0];
      days.push({ date: d, isCurrentMonth: false, dateStr: str });
    }

    return days;
  }, [currentDate]);

  // Week days
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d.setDate(diff));

    const days: { date: Date; dateStr: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);
      days.push({ date: current, dateStr: current.toISOString().split('T')[0] });
    }
    return days;
  }, [currentDate]);

  const monthTitle = currentDate.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Calendar Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={prevPeriod}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextPeriod}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base font-bold text-slate-900 capitalize min-w-[150px]">
            {monthTitle}
          </h2>

          <button
            onClick={today}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Hari Ini
          </button>
        </div>

        {/* View Mode & Platform Filter */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Platform filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['all', 'instagram', 'tiktok'] as PlatformFilter[]).map((pf) => (
              <button
                key={pf}
                onClick={() => setPlatformFilter(pf)}
                className={`px-3 py-1 font-semibold rounded-lg transition-all capitalize ${
                  platformFilter === pf
                    ? 'bg-[#00224a] text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {pf === 'all' ? 'Semua Platform' : pf}
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['monthly', 'weekly', 'daily'] as CalendarViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1 font-semibold rounded-lg transition-all capitalize ${
                  viewMode === m
                    ? 'bg-[#00224a] text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m === 'monthly' ? 'Bulanan' : m === 'weekly' ? 'Mingguan' : 'Harian'}
              </button>
            ))}
          </div>

          <button
            onClick={() => onOpenNewIdea()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0e4380] hover:bg-[#00224a] text-white shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#dab553]" />
            <span>Jadwalkan Konten</span>
          </button>
        </div>
      </div>

      {/* MONTHLY VIEW */}
      {viewMode === 'monthly' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Day Headers (Mon - Sun) */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2.5 text-xs font-bold text-slate-700">
            <span>Senin</span>
            <span>Selasa</span>
            <span>Rabu</span>
            <span>Kamis</span>
            <span>Jumat</span>
            <span>Sabtu</span>
            <span>Minggu</span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
            {monthDays.map((d, idx) => {
              const dayItems = itemsByDate.get(d.dateStr) || [];
              const isToday = d.dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={idx}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors group hover:bg-slate-50/50 ${
                    !d.isCurrentMonth ? 'bg-slate-50/40 text-slate-400' : 'bg-white text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-[#00224a] text-[#dab553]'
                          : d.isCurrentMonth
                          ? 'text-slate-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {d.date.getDate()}
                    </span>

                    <button
                      onClick={() => onOpenNewIdea(d.dateStr)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 text-slate-500"
                      title="Tambah konten di tanggal ini"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Day Content Badges */}
                  <div className="space-y-1 overflow-y-auto max-h-[85px]">
                    {dayItems.map((entry, eIdx) => {
                      const isPub = entry.type === 'published';
                      const isIG = entry.item.platform === 'instagram';

                      return (
                        <div
                          key={eIdx}
                          onClick={() => {
                            if (!isPub) onEditIdea(entry.item);
                          }}
                          className={`px-2 py-1 rounded-md text-[10px] font-semibold truncate cursor-pointer transition-all border ${
                            isPub
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : isIG
                              ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-900'
                              : 'bg-gradient-to-r from-slate-900/5 to-slate-900/10 border-slate-300 text-slate-900'
                          }`}
                          title={`${entry.item.title} (${entry.item.platform})`}
                        >
                          <div className="flex items-center gap-1">
                            <span
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                isPub ? 'bg-emerald-500' : isIG ? 'bg-pink-500' : 'bg-black'
                              }`}
                            ></span>
                            <span className="truncate">{entry.item.title}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEKLY VIEW */}
      {viewMode === 'weekly' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((d, idx) => {
            const dayItems = itemsByDate.get(d.dateStr) || [];
            const isToday = d.dateStr === new Date().toISOString().split('T')[0];

            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl border p-3.5 space-y-3 min-h-[300px] flex flex-col justify-between ${
                  isToday ? 'border-[#0e4380] shadow-md' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                        {d.date.toLocaleDateString('id-ID', { weekday: 'short' })}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          isToday ? 'text-[#0e4380]' : 'text-slate-900'
                        }`}
                      >
                        {d.date.getDate()}{' '}
                        {d.date.toLocaleDateString('id-ID', { month: 'short' })}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenNewIdea(d.dateStr)}
                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 mt-3">
                    {dayItems.map((entry, eIdx) => {
                      const isPub = entry.type === 'published';
                      const isIG = entry.item.platform === 'instagram';

                      return (
                        <div
                          key={eIdx}
                          onClick={() => {
                            if (!isPub) onEditIdea(entry.item);
                          }}
                          className="p-2.5 rounded-xl border border-slate-200 hover:border-[#0e4380] bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span
                              className={`font-bold uppercase px-1.5 py-0.5 rounded ${
                                isIG
                                  ? 'bg-pink-100 text-pink-700'
                                  : 'bg-slate-900 text-white'
                              }`}
                            >
                              {entry.item.platform}
                            </span>
                            <span className="text-slate-500 font-semibold">
                              {isPub ? 'Tayang' : entry.item.funnelStage}
                            </span>
                          </div>

                          <h5 className="text-xs font-bold text-slate-900 line-clamp-2">
                            {entry.item.title}
                          </h5>

                          {entry.item.hook && (
                            <p className="text-[10px] text-slate-500 italic line-clamp-1">
                              "{entry.item.hook}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                    {dayItems.length === 0 && (
                      <div className="py-8 text-center text-slate-400 text-xs italic">
                        Belum ada konten
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DAILY VIEW */}
      {viewMode === 'daily' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Jadwal Hari Ini:{' '}
                {currentDate.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>
              <p className="text-xs text-slate-500">
                Waktu Roastery Bali (WITA - Asia/Makassar)
              </p>
            </div>

            <button
              onClick={() => onOpenNewIdea(currentDate.toISOString().split('T')[0])}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#00224a] text-white shadow"
            >
              <Plus className="w-3.5 h-3.5 text-[#dab553]" />
              <span>Tambah Konten Hari Ini</span>
            </button>
          </div>

          <div className="space-y-3">
            {(itemsByDate.get(currentDate.toISOString().split('T')[0]) || []).map(
              (entry, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 hover:border-[#0e4380] bg-slate-50/50 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#0e4380] text-white">
                        {entry.item.platform}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {entry.item.pillar} • {entry.item.funnelStage}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{entry.item.title}</h4>
                    {entry.item.concept && (
                      <p className="text-xs text-slate-600">{entry.item.concept}</p>
                    )}
                  </div>
                </div>
              )
            )}
            {(itemsByDate.get(currentDate.toISOString().split('T')[0]) || []).length ===
              0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                Tidak ada konten yang dijadwalkan pada hari ini.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Database,
  BarChart3,
  Bot,
  Sparkles,
  Users2,
  FileText,
  Target,
  Settings,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Sparkle,
  ShieldCheck,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'planner'
  | 'calendar'
  | 'database'
  | 'analytics'
  | 'analyst'
  | 'studio'
  | 'competitor'
  | 'reports'
  | 'kpi'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'planner', label: 'Content Planner', icon: CalendarDays },
  { id: 'calendar', label: 'Content Calendar', icon: Calendar },
  { id: 'database', label: 'Content Database', icon: Database },
  { id: 'analytics', label: 'Analytics Engine', icon: BarChart3 },
  { id: 'analyst', label: 'AI Content Analyst', icon: Bot, badge: 'Gemini' },
  { id: 'studio', label: 'AI Content Studio', icon: Sparkles, badge: 'Pro' },
  { id: 'competitor', label: 'Competitor Analysis', icon: Users2 },
  { id: 'reports', label: 'Weekly Reports', icon: FileText },
  { id: 'kpi', label: 'KPI Tracker', icon: Target },
  { id: 'settings', label: 'Settings & Brand', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
}) => {
  return (
    <aside
      className={`relative flex flex-col bg-[#00224a] text-white border-r border-[#0e4380]/40 transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#0e4380]/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#dab553] to-[#b89333] flex items-center justify-center text-[#00224a] font-bold shadow-md shadow-black/20">
            <Coffee className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-base tracking-wide text-white font-serif">
                DELUXE COFFEE
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-[#dab553] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#dab553]" /> Bali Roastery • Intelligence
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#0e4380]/60 transition-colors"
          title={collapsed ? 'Perluas Menu' : 'Ciutkan Menu'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-[#0e4380] to-[#00224a] text-white font-semibold shadow-inner border border-[#dab553]/40'
                  : 'text-slate-300 hover:text-white hover:bg-[#0e4380]/30'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div
                className={`flex-shrink-0 p-1 rounded-md transition-colors ${
                  isActive
                    ? 'text-[#dab553]'
                    : 'text-slate-400 group-hover:text-[#dab553]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {!collapsed && (
                <div className="flex items-center justify-between w-full truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#dab553]/20 text-[#dab553] border border-[#dab553]/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Roastery Status Footer */}
      {!collapsed ? (
        <div className="p-3 mx-2 mb-3 rounded-xl bg-[#001733] border border-[#0e4380]/40 text-xs">
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="font-medium text-slate-200">Deluxe Roastery Bali</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            SCA Roaster Active • Roast-to-order Single Origin
          </p>
        </div>
      ) : (
        <div className="p-2 mb-2 flex justify-center">
          <span className="flex h-2.5 w-2.5 relative" title="Roastery Sistem Aktif">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
      )}
    </aside>
  );
};

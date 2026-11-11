import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { DataProvider } from './context/DataContext.tsx';
import { Sidebar, NavTab } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { NewContentModal } from './components/NewContentModal.tsx';
import { NewIdeaModal } from './components/NewIdeaModal.tsx';
import { CsvImportModal } from './components/CsvImportModal.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';

import { DashboardView } from './views/DashboardView.tsx';
import { ContentPlannerView } from './views/ContentPlannerView.tsx';
import { ContentCalendarView } from './views/ContentCalendarView.tsx';
import { ContentDatabaseView } from './views/ContentDatabaseView.tsx';
import { AnalyticsView } from './views/AnalyticsView.tsx';
import { AiAnalystView } from './views/AiAnalystView.tsx';
import { AiStudioView } from './views/AiStudioView.tsx';
import { CompetitorAnalysisView } from './views/CompetitorAnalysisView.tsx';
import { WeeklyReportsView } from './views/WeeklyReportsView.tsx';
import { KpiTrackerView } from './views/KpiTrackerView.tsx';
import { SettingsView } from './views/SettingsView.tsx';
import { ContentIdea, PublishedContent } from './types.ts';
import { Menu, Coffee } from 'lucide-react';

const MODULE_HEADERS: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Executive Dashboard',
    subtitle: 'Ikhtisar metrik kinerja media sosial Instagram & TikTok Deluxe Coffee',
  },
  planner: {
    title: 'Content Planner',
    subtitle: 'Perencanaan konten strategis (80% Problem Solving • 20% Selling)',
  },
  calendar: {
    title: 'Content Calendar',
    subtitle: 'Jadwal publikasi interaktif (Tampilan Bulanan, Mingguan, & Harian)',
  },
  database: {
    title: 'Content Database',
    subtitle: 'Penyimpanan terpusat seluruh konten tayang, metrik analitik, & ekspor CSV',
  },
  analytics: {
    title: 'Analytics Engine',
    subtitle: 'Evaluasi mendalam: Best/Worst performing, pilar konten, funnel & format',
  },
  analyst: {
    title: 'AI Content Analyst',
    subtitle: 'Analisis berbasis Google Gemini API dengan koneksi ke database riil Anda',
  },
  studio: {
    title: 'AI Content Studio',
    subtitle: 'Workspace pembuatan ide, hook 3 detik, naskah video, dan caption roastery',
  },
  competitor: {
    title: 'Competitor Analysis',
    subtitle: 'Pemantauan pesaing specialty coffee & identifikasi celah peluang konten',
  },
  reports: {
    title: 'Weekly Reports',
    subtitle: 'Laporan mingguan terotomasi, evaluasi multi-seksi, & ekspor cetak PDF',
  },
  kpi: {
    title: 'KPI Tracker',
    subtitle: 'Manajemen target bulanan & kuartalan produksi, jangkauan, dan simpanan resep',
  },
  settings: {
    title: 'Settings & Brand Guidelines',
    subtitle: 'Identitas brand Deluxe Coffee, status Cloud Firestore, & pengaturan demo',
  },
};

function MainApp() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [isNewContentOpen, setIsNewContentOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<PublishedContent | null>(null);

  const [isNewIdeaOpen, setIsNewIdeaOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<ContentIdea | null>(null);
  const [defaultIdeaDate, setDefaultIdeaDate] = useState<string | undefined>(undefined);

  const [isImportOpen, setIsImportOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#001733] text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#dab553] text-[#00224a] flex items-center justify-center font-bold animate-pulse shadow-lg">
            <Coffee className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-300">Memeriksa Akses Keamanan Deluxe Coffee...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const activeHeader = MODULE_HEADERS[currentTab];

  const handleOpenNewIdea = (date?: string) => {
    setEditingIdea(null);
    setDefaultIdeaDate(date);
    setIsNewIdeaOpen(true);
  };

  const handleEditIdea = (idea: ContentIdea) => {
    setEditingIdea(idea);
    setIsNewIdeaOpen(true);
  };

  const handleOpenNewContent = () => {
    setEditingContent(null);
    setIsNewContentOpen(true);
  };

  const handleEditContent = (content: PublishedContent) => {
    setEditingContent(content);
    setIsNewContentOpen(true);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
        ></div>
      )}

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setMobileMenuOpen(false);
          }}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between p-3.5 bg-[#00224a] text-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg hover:bg-white/10"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
            <span className="font-bold font-serif text-sm">DELUXE COFFEE</span>
          </div>
          <span className="text-[10px] text-[#dab553] font-bold uppercase">
            Intelligence
          </span>
        </div>

        {/* Global Desktop Header */}
        <Header
          title={activeHeader.title}
          subtitle={activeHeader.subtitle}
          onOpenImport={() => setIsImportOpen(true)}
          onOpenNewContent={handleOpenNewContent}
          onOpenNewIdea={() => handleOpenNewIdea()}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={setCurrentTab}
              onOpenImport={() => setIsImportOpen(true)}
              onOpenNewContent={handleOpenNewContent}
            />
          )}

          {currentTab === 'planner' && (
            <ContentPlannerView
              onOpenNewIdea={handleOpenNewIdea}
              onEditIdea={handleEditIdea}
              onNavigateStudio={() => setCurrentTab('studio')}
            />
          )}

          {currentTab === 'calendar' && (
            <ContentCalendarView
              onOpenNewIdea={handleOpenNewIdea}
              onEditIdea={handleEditIdea}
            />
          )}

          {currentTab === 'database' && (
            <ContentDatabaseView
              onOpenNewContent={handleOpenNewContent}
              onEditContent={handleEditContent}
              onOpenImport={() => setIsImportOpen(true)}
            />
          )}

          {currentTab === 'analytics' && <AnalyticsView />}

          {currentTab === 'analyst' && <AiAnalystView />}

          {currentTab === 'studio' && (
            <AiStudioView
              onOpenNewIdeaWithPrefill={(prefill) => {
                setEditingIdea(prefill);
                setIsNewIdeaOpen(true);
              }}
            />
          )}

          {currentTab === 'competitor' && <CompetitorAnalysisView />}

          {currentTab === 'reports' && <WeeklyReportsView />}

          {currentTab === 'kpi' && <KpiTrackerView />}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <NewContentModal
        isOpen={isNewContentOpen}
        onClose={() => {
          setIsNewContentOpen(false);
          setEditingContent(null);
        }}
        initialData={editingContent}
      />

      <NewIdeaModal
        isOpen={isNewIdeaOpen}
        onClose={() => {
          setIsNewIdeaOpen(false);
          setEditingIdea(null);
          setDefaultIdeaDate(undefined);
        }}
        initialData={editingIdea}
        defaultDate={defaultIdeaDate}
      />

      <CsvImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  );
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase.ts';
import { useAuth } from './AuthContext.tsx';
import {
  PublishedContent,
  ContentIdea,
  KpiTarget,
  Competitor,
  CompetitorPost,
  WeeklyReport,
  PlatformFilter,
  LinkedSocialAccount,
} from '../types.ts';
import {
  DEMO_PUBLISHED_CONTENTS,
  DEMO_CONTENT_IDEAS,
  DEMO_COMPETITORS,
  DEMO_KPI_TARGET,
} from '../utils/demoData.ts';
import {
  CURATED_ROASTERY_COMPETITORS,
  CURATED_COMPETITOR_POSTS,
} from '../utils/competitorData.ts';

export const DEFAULT_LINKED_ACCOUNTS: LinkedSocialAccount[] = [
  {
    id: 'account-ig-deluxe',
    userId: 'default',
    platform: 'instagram',
    handle: 'deluxecoffee.bali',
    profileUrl: 'https://instagram.com/deluxecoffee.bali',
    displayName: 'Deluxe Coffee Bali | Specialty Roastery',
    bio: 'SCA-Certified Roaster Bali • Roast-to-Order Indonesian Single Origin • The coffee you stop searching for. Pengiriman seluruh Indonesia.',
    externalLink: 'https://tokopedia.com/deluxecoffee',
    followers: 12850,
    following: 420,
    totalPosts: 248,
    growthRatePct: 4.2,
    lastSyncedAt: new Date().toISOString(),
    status: 'connected',
    history: [
      { date: '2026-10-12', followers: 12320, change: 0 },
      { date: '2026-10-21', followers: 12450, change: 130 },
      { date: '2026-10-28', followers: 12590, change: 140 },
      { date: '2026-11-04', followers: 12720, change: 130 },
      { date: '2026-11-11', followers: 12850, change: 130 },
    ],
  },
  {
    id: 'account-tiktok-deluxe',
    userId: 'default',
    platform: 'tiktok',
    handle: 'deluxecoffee.bali',
    profileUrl: 'https://www.tiktok.com/@deluxecoffee.bali',
    displayName: 'Deluxe Coffee Bali',
    bio: 'Spesialis Kopi Nusantara Roast-to-Order Canggu & Denpasar Bali. Tips seduh harian tanpa ribet!',
    externalLink: 'https://tokopedia.com/deluxecoffee',
    followers: 8420,
    following: 185,
    totalPosts: 86,
    growthRatePct: 6.1,
    lastSyncedAt: new Date().toISOString(),
    status: 'connected',
    history: [
      { date: '2026-10-12', followers: 7950, change: 0 },
      { date: '2026-10-21', followers: 8080, change: 130 },
      { date: '2026-10-28', followers: 8200, change: 120 },
      { date: '2026-11-04', followers: 8320, change: 120 },
      { date: '2026-11-11', followers: 8420, change: 100 },
    ],
  },
];

interface DataContextType {
  publishedContent: PublishedContent[];
  contentIdeas: ContentIdea[];
  kpiTarget: KpiTarget | null;
  competitors: Competitor[];
  competitorPosts: CompetitorPost[];
  weeklyReports: WeeklyReport[];
  loading: boolean;
  hasDemoData: boolean;

  // Actions
  addPublishedContent: (item: Omit<PublishedContent, 'id' | 'userId'>) => Promise<string>;
  updatePublishedContent: (id: string, item: Partial<PublishedContent>) => Promise<void>;
  deletePublishedContent: (id: string) => Promise<void>;
  importCsvBatch: (items: Omit<PublishedContent, 'id' | 'userId'>[]) => Promise<{ imported: number; duplicates: number }>;

  addContentIdea: (item: Omit<ContentIdea, 'id' | 'userId'>) => Promise<string>;
  updateContentIdea: (id: string, item: Partial<ContentIdea>) => Promise<void>;
  deleteContentIdea: (id: string) => Promise<void>;
  importContentIdeaBatch: (items: Omit<ContentIdea, 'id' | 'userId'>[]) => Promise<{ imported: number }>;

  updateKpiTarget: (target: Partial<KpiTarget>) => Promise<void>;

  addCompetitor: (item: Omit<Competitor, 'id' | 'userId'>) => Promise<string>;
  updateCompetitor: (id: string, item: Partial<Competitor>) => Promise<void>;
  deleteCompetitor: (id: string) => Promise<void>;

  addCompetitorPost: (post: Omit<CompetitorPost, 'id' | 'userId'>) => Promise<string>;
  deleteCompetitorPost: (id: string) => Promise<void>;
  seedCuratedCompetitors: () => Promise<void>;

  saveWeeklyReport: (report: Omit<WeeklyReport, 'id' | 'userId'>) => Promise<string>;
  updateWeeklyReport: (id: string, report: Partial<WeeklyReport>) => Promise<void>;
  deleteWeeklyReport: (id: string) => Promise<void>;

  loadDemoData: () => Promise<void>;
  removeDemoData: () => Promise<void>;

  // Real-time Linked Social Media Accounts
  linkedAccounts: LinkedSocialAccount[];
  updateLinkedAccount: (acc: LinkedSocialAccount) => Promise<void>;
  syncAccountRealtime: (platform: 'instagram' | 'tiktok', profileUrl: string, followers?: number) => Promise<any>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [publishedContent, setPublishedContent] = useState<PublishedContent[]>([]);
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [kpiTarget, setKpiTarget] = useState<KpiTarget | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [competitorPosts, setCompetitorPosts] = useState<CompetitorPost[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // In local preview before login, keep in-memory/fallback
  const [localPublished, setLocalPublished] = useState<PublishedContent[]>([]);
  const [localIdeas, setLocalIdeas] = useState<ContentIdea[]>([]);
  const [localKpi, setLocalKpi] = useState<KpiTarget | null>(null);
  const [localCompetitors, setLocalCompetitors] = useState<Competitor[]>(() =>
    CURATED_ROASTERY_COMPETITORS.map((item, idx) => ({
      ...item,
      id: `curated-comp-${idx}`,
      userId: 'curated',
    }))
  );
  const [localCompetitorPosts, setLocalCompetitorPosts] = useState<CompetitorPost[]>(() =>
    CURATED_COMPETITOR_POSTS.map((item, idx) => ({
      ...item,
      id: `curated-cpost-${idx}`,
      userId: 'curated',
    }))
  );
  const [localReports, setLocalReports] = useState<WeeklyReport[]>([]);

  // Real-time Linked Social Media Accounts
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedSocialAccount[]>(() => {
    try {
      const saved = localStorage.getItem('deluxe_linked_social_accounts');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_LINKED_ACCOUNTS;
  });

  const updateLinkedAccount = async (acc: LinkedSocialAccount) => {
    setLinkedAccounts((prev) => {
      const updated = prev.map((item) => (item.platform === acc.platform ? acc : item));
      try {
        localStorage.setItem('deluxe_linked_social_accounts', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const syncAccountRealtime = async (
    platform: 'instagram' | 'tiktok',
    profileUrl: string,
    followers?: number
  ) => {
    try {
      const res = await fetch('/api/social/sync-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, profileUrl, currentFollowers: followers }),
      });
      const data = await res.json();
      if (data.success && data.account) {
        await updateLinkedAccount(data.account);
        return data;
      }
      throw new Error(data.error || 'Gagal menyinkronkan akun.');
    } catch (err: any) {
      console.error('Error syncing account:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (!user) {
      // If user not yet logged in, initialize with demo data so app is immediately alive & rich
      if (localPublished.length === 0) {
        setLocalPublished(
          DEMO_PUBLISHED_CONTENTS.map((item, idx) => ({
            ...item,
            id: `local-pub-${idx}`,
            userId: 'guest',
          }))
        );
        setContentIdeas(
          DEMO_CONTENT_IDEAS.map((item, idx) => ({
            ...item,
            id: `local-idea-${idx}`,
            userId: 'guest',
          }))
        );
        setLocalKpi({
          ...DEMO_KPI_TARGET,
          id: 'local-kpi-1',
          userId: 'guest',
        });
        setLocalCompetitors(
          CURATED_ROASTERY_COMPETITORS.map((item, idx) => ({
            ...item,
            id: `local-comp-${idx}`,
            userId: 'guest',
          }))
        );
        setLocalCompetitorPosts(
          CURATED_COMPETITOR_POSTS.map((item, idx) => ({
            ...item,
            id: `local-cpost-${idx}`,
            userId: 'guest',
          }))
        );
      }
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Published Content Listener
    const qPub = query(collection(db, 'published_content'), where('userId', '==', user.uid));
    const unsubPub = onSnapshot(
      qPub,
      (snapshot) => {
        const list: PublishedContent[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        // Sort descending by publishDate
        list.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
        setPublishedContent(list);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'published_content');
      }
    );

    // 2. Content Ideas Listener
    const qIdeas = query(collection(db, 'content_ideas'), where('userId', '==', user.uid));
    const unsubIdeas = onSnapshot(
      qIdeas,
      (snapshot) => {
        const list: ContentIdea[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        setContentIdeas(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'content_ideas');
      }
    );

    // 3. KPI Targets Listener
    const qKpi = query(collection(db, 'kpis'), where('userId', '==', user.uid));
    const unsubKpi = onSnapshot(
      qKpi,
      (snapshot) => {
        let currentKpi: KpiTarget | null = null;
        snapshot.forEach((d) => {
          currentKpi = { id: d.id, ...(d.data() as any) };
        });
        setKpiTarget(currentKpi);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'kpis');
      }
    );

    // 4. Competitors Listener
    const qComp = query(collection(db, 'competitors'), where('userId', '==', user.uid));
    const unsubComp = onSnapshot(
      qComp,
      (snapshot) => {
        const list: Competitor[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        setCompetitors(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'competitors');
      }
    );

    // 5. Competitor Posts Listener
    const qCompPosts = query(collection(db, 'competitor_posts'), where('userId', '==', user.uid));
    const unsubCompPosts = onSnapshot(
      qCompPosts,
      (snapshot) => {
        const list: CompetitorPost[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        setCompetitorPosts(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'competitor_posts');
      }
    );

    // 6. Weekly Reports Listener
    const qReports = query(collection(db, 'weekly_reports'), where('userId', '==', user.uid));
    const unsubReports = onSnapshot(
      qReports,
      (snapshot) => {
        const list: WeeklyReport[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        list.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        setWeeklyReports(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'weekly_reports');
      }
    );

    return () => {
      unsubPub();
      unsubIdeas();
      unsubKpi();
      unsubComp();
      unsubCompPosts();
      unsubReports();
    };
  }, [user]);

  // Fallback to local state if user is not yet logged in
  const activePublished = user ? publishedContent : localPublished;
  const activeIdeas = user ? contentIdeas : localIdeas;
  const activeKpi = user ? kpiTarget : localKpi;
  const activeCompetitors = user && competitors.length > 0 ? competitors : localCompetitors;
  const activeCompetitorPosts = user && competitorPosts.length > 0 ? competitorPosts : localCompetitorPosts;
  const activeReports = user ? weeklyReports : localReports;

  const hasDemoData = activePublished.some((item) => item.isDemo);

  const seedCuratedCompetitors = async () => {
    if (user) {
      try {
        const batch = writeBatch(db);
        CURATED_ROASTERY_COMPETITORS.forEach((c) => {
          const cRef = doc(collection(db, 'competitors'));
          batch.set(cRef, {
            ...c,
            userId: user.uid,
            createdAt: new Date().toISOString(),
          });
        });
        CURATED_COMPETITOR_POSTS.forEach((p) => {
          const pRef = doc(collection(db, 'competitor_posts'));
          batch.set(pRef, {
            ...p,
            userId: user.uid,
            createdAt: new Date().toISOString(),
          });
        });
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'competitors/seed');
      }
    } else {
      setLocalCompetitors(
        CURATED_ROASTERY_COMPETITORS.map((c, idx) => ({
          ...c,
          id: `local-comp-${idx}`,
          userId: 'guest',
        }))
      );
      setLocalCompetitorPosts(
        CURATED_COMPETITOR_POSTS.map((p, idx) => ({
          ...p,
          id: `local-cpost-${idx}`,
          userId: 'guest',
        }))
      );
    }
  };

  // CRUD Implementations
  const addPublishedContent = async (item: Omit<PublishedContent, 'id' | 'userId'>): Promise<string> => {
    if (user) {
      try {
        const ref = await addDoc(collection(db, 'published_content'), {
          ...item,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        return ref.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'published_content');
        return '';
      }
    } else {
      const newItem: PublishedContent = {
        ...item,
        id: `local-pub-${Date.now()}`,
        userId: 'guest',
        createdAt: new Date().toISOString(),
      };
      setLocalPublished((prev) => [newItem, ...prev]);
      return newItem.id!;
    }
  };

  const updatePublishedContent = async (id: string, item: Partial<PublishedContent>) => {
    if (user) {
      try {
        const docRef = doc(db, 'published_content', id);
        await updateDoc(docRef, {
          ...item,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `published_content/${id}`);
      }
    } else {
      setLocalPublished((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...item, updatedAt: new Date().toISOString() } : p))
      );
    }
  };

  const deletePublishedContent = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'published_content', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `published_content/${id}`);
      }
    } else {
      setLocalPublished((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const importCsvBatch = async (
    items: Omit<PublishedContent, 'id' | 'userId'>[]
  ): Promise<{ imported: number; duplicates: number }> => {
    let imported = 0;
    let duplicates = 0;

    const existingIds = new Set(activePublished.map((p) => p.contentId.toLowerCase()));
    const existingTitles = new Set(activePublished.map((p) => `${p.title.toLowerCase()}_${p.publishDate}`));

    const itemsToSave: Omit<PublishedContent, 'id' | 'userId'>[] = [];

    for (const item of items) {
      const isDuplicate =
        (item.contentId && existingIds.has(item.contentId.toLowerCase())) ||
        existingTitles.has(`${item.title.toLowerCase()}_${item.publishDate}`);

      if (isDuplicate) {
        duplicates++;
      } else {
        itemsToSave.push(item);
        imported++;
      }
    }

    if (user) {
      const batch = writeBatch(db);
      for (const item of itemsToSave) {
        const newDocRef = doc(collection(db, 'published_content'));
        batch.set(newDocRef, {
          ...item,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      try {
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'published_content/batch');
      }
    } else {
      const localItems: PublishedContent[] = itemsToSave.map((it, idx) => ({
        ...it,
        id: `imported-${Date.now()}-${idx}`,
        userId: 'guest',
        createdAt: new Date().toISOString(),
      }));
      setLocalPublished((prev) => [...localItems, ...prev]);
    }

    return { imported, duplicates };
  };

  const addContentIdea = async (item: Omit<ContentIdea, 'id' | 'userId'>): Promise<string> => {
    if (user) {
      try {
        const ref = await addDoc(collection(db, 'content_ideas'), {
          ...item,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        return ref.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'content_ideas');
        return '';
      }
    } else {
      const newItem: ContentIdea = {
        ...item,
        id: `idea-${Date.now()}`,
        userId: 'guest',
        createdAt: new Date().toISOString(),
      };
      setLocalIdeas((prev) => [newItem, ...prev]);
      return newItem.id!;
    }
  };

  const updateContentIdea = async (id: string, item: Partial<ContentIdea>) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'content_ideas', id), {
          ...item,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `content_ideas/${id}`);
      }
    } else {
      setLocalIdeas((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...item, updatedAt: new Date().toISOString() } : i))
      );
    }
  };

  const deleteContentIdea = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'content_ideas', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `content_ideas/${id}`);
      }
    } else {
      setLocalIdeas((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const importContentIdeaBatch = async (
    items: Omit<ContentIdea, 'id' | 'userId'>[]
  ): Promise<{ imported: number }> => {
    let imported = 0;
    if (user) {
      for (const item of items) {
        try {
          await addDoc(collection(db, 'content_ideas'), {
            ...item,
            userId: user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          imported++;
        } catch (e) {
          console.warn('Batch add idea failed:', e);
        }
      }
    } else {
      const newItems: ContentIdea[] = items.map((item, idx) => ({
        ...item,
        id: `idea-${Date.now()}-${idx}`,
        userId: 'guest',
        createdAt: new Date().toISOString(),
      }));
      setLocalIdeas((prev) => [...newItems, ...prev]);
      imported = newItems.length;
    }
    return { imported };
  };

  const updateKpiTarget = async (target: Partial<KpiTarget>) => {
    if (user) {
      try {
        if (kpiTarget?.id) {
          await updateDoc(doc(db, 'kpis', kpiTarget.id), {
            ...target,
            updatedAt: new Date().toISOString(),
          });
        } else {
          await addDoc(collection(db, 'kpis'), {
            ...target,
            userId: user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'kpis');
      }
    } else {
      setLocalKpi((prev) => ({
        ...(prev || DEMO_KPI_TARGET),
        ...target,
        id: prev?.id || 'local-kpi',
        userId: 'guest',
        updatedAt: new Date().toISOString(),
      }));
    }
  };

  const addCompetitor = async (item: Omit<Competitor, 'id' | 'userId'>): Promise<string> => {
    if (user) {
      try {
        const ref = await addDoc(collection(db, 'competitors'), {
          ...item,
          userId: user.uid,
          createdAt: new Date().toISOString(),
        });
        return ref.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'competitors');
        return '';
      }
    } else {
      const newComp: Competitor = {
        ...item,
        id: `comp-${Date.now()}`,
        userId: 'guest',
      };
      setLocalCompetitors((prev) => [...prev, newComp]);
      return newComp.id!;
    }
  };

  const updateCompetitor = async (id: string, item: Partial<Competitor>) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'competitors', id), {
          ...item,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `competitors/${id}`);
      }
    } else {
      setLocalCompetitors((prev) => prev.map((c) => (c.id === id ? { ...c, ...item } : c)));
    }
  };

  const deleteCompetitor = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'competitors', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `competitors/${id}`);
      }
    } else {
      setLocalCompetitors((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const addCompetitorPost = async (post: Omit<CompetitorPost, 'id' | 'userId'>): Promise<string> => {
    if (user) {
      try {
        const ref = await addDoc(collection(db, 'competitor_posts'), {
          ...post,
          userId: user.uid,
          createdAt: new Date().toISOString(),
        });
        return ref.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'competitor_posts');
        return '';
      }
    } else {
      const newP: CompetitorPost = {
        ...post,
        id: `cpost-${Date.now()}`,
        userId: 'guest',
      };
      setCompetitorPosts((prev) => [newP, ...prev]);
      return newP.id!;
    }
  };

  const deleteCompetitorPost = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'competitor_posts', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `competitor_posts/${id}`);
      }
    } else {
      setCompetitorPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const saveWeeklyReport = async (report: Omit<WeeklyReport, 'id' | 'userId'>): Promise<string> => {
    if (user) {
      try {
        const ref = await addDoc(collection(db, 'weekly_reports'), {
          ...report,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        return ref.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'weekly_reports');
        return '';
      }
    } else {
      const newR: WeeklyReport = {
        ...report,
        id: `report-${Date.now()}`,
        userId: 'guest',
      };
      setLocalReports((prev) => [newR, ...prev]);
      return newR.id!;
    }
  };

  const updateWeeklyReport = async (id: string, report: Partial<WeeklyReport>) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'weekly_reports', id), {
          ...report,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `weekly_reports/${id}`);
      }
    } else {
      setLocalReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...report } : r)));
    }
  };

  const deleteWeeklyReport = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'weekly_reports', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `weekly_reports/${id}`);
      }
    } else {
      setLocalReports((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const loadDemoData = async () => {
    if (user) {
      const batch = writeBatch(db);
      for (const item of DEMO_PUBLISHED_CONTENTS) {
        const ref = doc(collection(db, 'published_content'));
        batch.set(ref, {
          ...item,
          userId: user.uid,
          isDemo: true,
          createdAt: new Date().toISOString(),
        });
      }
      for (const idea of DEMO_CONTENT_IDEAS) {
        const ref = doc(collection(db, 'content_ideas'));
        batch.set(ref, {
          ...idea,
          userId: user.uid,
          createdAt: new Date().toISOString(),
        });
      }
      for (const comp of DEMO_COMPETITORS) {
        const ref = doc(collection(db, 'competitors'));
        batch.set(ref, {
          ...comp,
          userId: user.uid,
          createdAt: new Date().toISOString(),
        });
      }
      const kpiRef = doc(collection(db, 'kpis'));
      batch.set(kpiRef, {
        ...DEMO_KPI_TARGET,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });
      await batch.commit();
    } else {
      setLocalPublished(
        DEMO_PUBLISHED_CONTENTS.map((item, idx) => ({
          ...item,
          id: `demo-pub-${idx}`,
          userId: 'guest',
        }))
      );
      setLocalIdeas(
        DEMO_CONTENT_IDEAS.map((item, idx) => ({
          ...item,
          id: `demo-idea-${idx}`,
          userId: 'guest',
        }))
      );
      setLocalCompetitors(
        DEMO_COMPETITORS.map((item, idx) => ({
          ...item,
          id: `demo-comp-${idx}`,
          userId: 'guest',
        }))
      );
      setLocalKpi({
        ...DEMO_KPI_TARGET,
        id: 'demo-kpi',
        userId: 'guest',
      });
    }
  };

  const removeDemoData = async () => {
    if (user) {
      const q = query(
        collection(db, 'published_content'),
        where('userId', '==', user.uid),
        where('isDemo', '==', true)
      );
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } else {
      setLocalPublished((prev) => prev.filter((p) => !p.isDemo));
    }
  };

  return (
    <DataContext.Provider
      value={{
        publishedContent: activePublished,
        contentIdeas: activeIdeas,
        kpiTarget: activeKpi,
        competitors: activeCompetitors,
        competitorPosts: activeCompetitorPosts,
        weeklyReports: activeReports,
        loading,
        hasDemoData,
        addPublishedContent,
        updatePublishedContent,
        deletePublishedContent,
        importCsvBatch,
        addContentIdea,
        updateContentIdea,
        deleteContentIdea,
        importContentIdeaBatch,
        updateKpiTarget,
        addCompetitor,
        updateCompetitor,
        deleteCompetitor,
        addCompetitorPost,
        deleteCompetitorPost,
        seedCuratedCompetitors,
        saveWeeklyReport,
        updateWeeklyReport,
        deleteWeeklyReport,
        loadDemoData,
        removeDemoData,
        linkedAccounts,
        updateLinkedAccount,
        syncAccountRealtime,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

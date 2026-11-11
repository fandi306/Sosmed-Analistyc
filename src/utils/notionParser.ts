import { ContentIdea, PublishedContent, FunnelStage, ContentStatus } from '../types.ts';

export interface NotionRowItem {
  id?: string;
  title: string;
  status: string;
  publishDate?: string;
  platform: 'instagram' | 'tiktok' | 'both';
  pillar: string;
  funnelStage: FunnelStage;
  hook?: string;
  contentAngle?: string;
  contentConcept?: string;
  contentFormat?: string;
  scriptBrief?: string;
  cta?: string;
  productFeatured?: string;
  targetAudience?: string;
  audienceProblem?: string;
  priority?: 'low' | 'medium' | 'high';
  // Metrics if included
  views?: number;
  reach?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  linkClicks?: number;
}

// RFC 4180 Multi-line CSV Parser designed for Notion database exports
export function parseNotionCsv(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \r\n
      }
      currentRow.push(currentCell.trim());
      if (currentRow.length > 0 && currentRow.some((c) => c !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// Parse Notion Date expressions (e.g. "November 12, 2026", "2026-11-12 -> 2026-11-15", "@November 10, 2026")
export function parseNotionDate(raw: string): string {
  if (!raw) return new Date().toISOString().split('T')[0];
  const cleaned = raw.replace(/^@|\(.*\)/g, '').split('->')[0].trim();

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  // Indonesian / standard date fallback DD/MM/YYYY
  const parts = cleaned.match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/);
  if (parts) {
    const [, day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return new Date().toISOString().split('T')[0];
}

// Map Notion Status to Deluxe ContentStatus
export function mapNotionStatus(rawStatus: string): ContentStatus {
  const s = (rawStatus || '').toLowerCase();
  if (s.includes('published') || s.includes('tayang') || s.includes('selesai') || s.includes('done')) {
    return 'published';
  }
  if (s.includes('scheduled') || s.includes('jadwal')) {
    return 'scheduled';
  }
  if (s.includes('review')) {
    return 'review';
  }
  if (s.includes('edit') || s.includes('editing')) {
    return 'editing';
  }
  if (s.includes('production') || s.includes('shooting') || s.includes('rekam')) {
    return 'production';
  }
  if (s.includes('script') || s.includes('naskah') || s.includes('brief')) {
    return 'scripting';
  }
  if (s.includes('plan') || s.includes('rencana') || s.includes('in progress')) {
    return 'planning';
  }
  return 'idea';
}

// Map Notion Pillars & Funnel Stages
export function mapNotionPillarAndStage(rawPillar: string, rawStage?: string): { pillar: string; funnelStage: FunnelStage } {
  const p = (rawPillar || '').toLowerCase();
  const stg = (rawStage || '').toUpperCase();

  if (stg === 'BOFU' || p.includes('promo') || p.includes('bundle') || p.includes('closing') || p.includes('jual') || p.includes('urgency')) {
    let pillar = 'Promotion';
    if (p.includes('bundle')) pillar = 'Bundle';
    if (p.includes('urgency')) pillar = 'Urgency';
    if (p.includes('closing')) pillar = 'Closing';
    return { pillar, funnelStage: 'BOFU' };
  }

  if (stg === 'MOFU' || p.includes('edukasi') || p.includes('education') || p.includes('problem') || p.includes('solusi') || p.includes('resep') || p.includes('banding') || p.includes('comparison') || p.includes('product') || p.includes('testimonial')) {
    let pillar = 'Education';
    if (p.includes('problem') || p.includes('solusi')) pillar = 'Problem Solution';
    if (p.includes('product') || p.includes('penjelasan')) pillar = 'Product Explanation';
    if (p.includes('banding') || p.includes('comparison')) pillar = 'Comparison';
    if (p.includes('testi')) pillar = 'Soft Testimonial';
    return { pillar, funnelStage: 'MOFU' };
  }

  let pillar = 'Lifestyle';
  if (p.includes('relatable') || p.includes('curhat') || p.includes('malam')) pillar = 'Relatable';
  if (p.includes('trend')) pillar = 'Trend';
  if (p.includes('cerita') || p.includes('story')) pillar = 'Storytelling';
  if (p.includes('aware') || p.includes('roastery')) pillar = 'Awareness';
  return { pillar, funnelStage: 'TOFU' };
}

// Convert parsed Notion rows into structured Deluxe objects
export function parseNotionDatabase(csvRows: string[][]): {
  items: NotionRowItem[];
  headers: string[];
  totalParsed: number;
} {
  if (csvRows.length < 2) {
    return { items: [], headers: [], totalParsed: 0 };
  }

  const headerRow = csvRows[0].map((h) => h.trim().toLowerCase());
  const dataRows = csvRows.slice(1);

  // Column finder helper
  const findColIdx = (keywords: string[]) => {
    return headerRow.findIndex((h) => keywords.some((k) => h.includes(k)));
  };

  const titleIdx = findColIdx(['name', 'title', 'judul', 'konten', 'topic', 'topik']);
  const statusIdx = findColIdx(['status', 'state', 'tahap', 'progress']);
  const dateIdx = findColIdx(['date', 'tanggal', 'publish', 'jadwal', 'due']);
  const platformIdx = findColIdx(['platform', 'channel', 'media']);
  const pillarIdx = findColIdx(['pillar', 'pilar', 'kategori', 'category']);
  const stageIdx = findColIdx(['stage', 'funnel', 'corong']);
  const hookIdx = findColIdx(['hook', 'opening', '3 detik', 'headline']);
  const angleIdx = findColIdx(['angle', 'sudut pandang', 'concept', 'konsep']);
  const scriptIdx = findColIdx(['script', 'naskah', 'brief', 'konten brief', 'notes', 'catatan', 'copy', 'caption']);
  const formatIdx = findColIdx(['format', 'tipe', 'type']);
  const skuIdx = findColIdx(['sku', 'origin', 'biji', 'kopi', 'single origin', 'product']);
  const ctaIdx = findColIdx(['cta', 'call to action', 'ajakan']);
  const targetIdx = findColIdx(['target', 'audiens', 'audience']);
  const problemIdx = findColIdx(['problem', 'masalah']);
  const priorityIdx = findColIdx(['priority', 'prioritas']);

  // Metrics
  const viewsIdx = findColIdx(['views', 'tayangan', 'view']);
  const reachIdx = findColIdx(['reach', 'jangkauan']);
  const likesIdx = findColIdx(['likes', 'suka']);
  const commentsIdx = findColIdx(['comments', 'komentar']);
  const sharesIdx = findColIdx(['shares', 'bagikan']);
  const savesIdx = findColIdx(['saves', 'simpan']);
  const clicksIdx = findColIdx(['clicks', 'klik', 'link']);

  const items: NotionRowItem[] = [];

  dataRows.forEach((row, idx) => {
    const rawTitle = titleIdx !== -1 ? row[titleIdx] : '';
    if (!rawTitle || rawTitle.trim() === '') return;

    const rawStatus = statusIdx !== -1 ? row[statusIdx] : '';
    const rawDate = dateIdx !== -1 ? row[dateIdx] : '';
    const rawPlatform = platformIdx !== -1 ? (row[platformIdx] || '').toLowerCase() : '';
    const rawPillar = pillarIdx !== -1 ? row[pillarIdx] : '';
    const rawStage = stageIdx !== -1 ? row[stageIdx] : '';

    let platform: 'instagram' | 'tiktok' | 'both' = 'instagram';
    if (rawPlatform.includes('tiktok') && (rawPlatform.includes('ig') || rawPlatform.includes('insta'))) {
      platform = 'both';
    } else if (rawPlatform.includes('tiktok')) {
      platform = 'tiktok';
    }

    const { pillar, funnelStage } = mapNotionPillarAndStage(rawPillar, rawStage);

    const parseNum = (colIdx: number) => {
      if (colIdx === -1 || !row[colIdx]) return 0;
      const cleaned = row[colIdx].replace(/[.,\s]/g, '');
      const n = parseInt(cleaned, 10);
      return isNaN(n) ? 0 : n;
    };

    items.push({
      id: `notion-row-${idx + 1}`,
      title: rawTitle.replace(/^"|"$/g, '').trim(),
      status: rawStatus ? mapNotionStatus(rawStatus) : 'planning',
      publishDate: parseNotionDate(rawDate),
      platform,
      pillar,
      funnelStage,
      hook: hookIdx !== -1 ? row[hookIdx] : '',
      contentAngle: angleIdx !== -1 ? row[angleIdx] : 'Troubleshooting Kopi Rumahan',
      contentConcept: angleIdx !== -1 ? row[angleIdx] : 'Edukatif & Solutif',
      contentFormat: formatIdx !== -1 ? (row[formatIdx] || 'Reels') : 'Reels',
      scriptBrief: scriptIdx !== -1 ? row[scriptIdx] : '',
      cta: ctaIdx !== -1 ? row[ctaIdx] : 'Ketik "RESEP" di DM atau klik link di bio untuk beans fresh roast-to-order',
      productFeatured: skuIdx !== -1 ? (row[skuIdx] || 'Bali Kintamani Roast-to-Order') : 'Bali Kintamani Roast-to-Order',
      targetAudience: targetIdx !== -1 ? row[targetIdx] : 'Pecinta Kopi Rumahan Bali & Nusantara',
      audienceProblem: problemIdx !== -1 ? row[problemIdx] : 'Rasa kopi seduhan rumah terlalu asam/pahit',
      priority: priorityIdx !== -1 && (row[priorityIdx] || '').toLowerCase().includes('high') ? 'high' : 'medium',
      views: parseNum(viewsIdx),
      reach: parseNum(reachIdx),
      likes: parseNum(likesIdx),
      comments: parseNum(commentsIdx),
      shares: parseNum(sharesIdx),
      saves: parseNum(savesIdx),
      linkClicks: parseNum(clicksIdx),
    });
  });

  return {
    items,
    headers: csvRows[0],
    totalParsed: items.length,
  };
}

// Export Deluxe Coffee data into Notion-ready CSV format
export function generateNotionExportCsv(ideas: ContentIdea[], published: PublishedContent[]): string {
  const headers = [
    'Name',
    'Status',
    'Date',
    'Platform',
    'Content Pillar',
    'Funnel Stage',
    'Content Format',
    'Single Origin / SKU',
    'Hook 3 Detik',
    'Angle / Konsep',
    'Script / Content Brief',
    'CTA',
    'Views',
    'Reach',
    'Likes',
    'Saves',
    'Shares',
    'Link Clicks',
  ];

  const escapeCsv = (str: any) => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows: string[] = [headers.join(',')];

  // 1. Add Content Ideas
  ideas.forEach((idea) => {
    rows.push(
      [
        escapeCsv(idea.title),
        escapeCsv(idea.status),
        escapeCsv(idea.plannedDate || new Date().toISOString().split('T')[0]),
        escapeCsv(idea.platform),
        escapeCsv(idea.pillar),
        escapeCsv(idea.funnelStage),
        escapeCsv(idea.contentFormat),
        escapeCsv('Bali Kintamani Roast-to-Order'),
        escapeCsv(idea.hook),
        escapeCsv(idea.contentAngle),
        escapeCsv(idea.contentConcept),
        escapeCsv(idea.cta),
        escapeCsv(0),
        escapeCsv(0),
        escapeCsv(0),
        escapeCsv(0),
        escapeCsv(0),
        escapeCsv(0),
      ].join(',')
    );
  });

  // 2. Add Published Content
  published.forEach((pub) => {
    rows.push(
      [
        escapeCsv(pub.title),
        escapeCsv('Published'),
        escapeCsv(pub.publishDate),
        escapeCsv(pub.platform),
        escapeCsv(pub.pillar),
        escapeCsv(pub.funnelStage),
        escapeCsv(pub.contentFormat),
        escapeCsv(pub.productFeatured || 'Bali Kintamani Washed'),
        escapeCsv(pub.hook),
        escapeCsv(pub.contentAngle || 'Edukasi Roastery'),
        escapeCsv(pub.caption || pub.hook),
        escapeCsv(pub.cta || 'Kunjungi link di bio'),
        escapeCsv(pub.views),
        escapeCsv(pub.reach),
        escapeCsv(pub.likes),
        escapeCsv(pub.saves),
        escapeCsv(pub.shares),
        escapeCsv(pub.linkClicks),
      ].join(',')
    );
  });

  return rows.join('\n');
}

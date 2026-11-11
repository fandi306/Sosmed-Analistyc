import { PublishedContent, FunnelStage } from '../types.ts';

// Universal Delimiter & Quote-aware parser (handles \t, commas, semicolons, and multi-line quoted cells from Google Sheets & Excel)
export function parseDelimitedText(text: string): string[][] {
  const clean = text.trim();
  if (!clean) return [];

  // Detect predominant delimiter between \t (Google Sheets copy-paste), ',', and ';'
  const firstLine = clean.split(/\r\n|\n/)[0] || '';
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;

  let delimiter = ',';
  if (tabCount > commaCount && tabCount > semiCount) {
    delimiter = '\t';
  } else if (semiCount > commaCount && semiCount > tabCount) {
    delimiter = ';';
  }

  const rows: string[][] = [];
  let currentRow: string[] = [''];
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentRow[currentRow.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      currentRow.push('');
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      if (currentRow.length > 1 || currentRow[0] !== '') {
        rows.push(currentRow.map((c) => c.replace(/^"|"$/g, '').trim()));
      }
      currentRow = [''];
    } else {
      currentRow[currentRow.length - 1] += char;
    }
  }

  if (currentRow.length > 1 || currentRow[0] !== '') {
    rows.push(currentRow.map((c) => c.replace(/^"|"$/g, '').trim()));
  }

  return rows;
}

// Clean number parser handling "14.2K", "14,200", "14.200", "1500", "1.5jt", "N/A", "Pending"
export function cleanNumber(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.round(val);
  if (!val || typeof val !== 'string') return 0;

  let str = val.trim().toLowerCase();
  if (str === 'n/a' || str === 'pending' || str === '-' || str === 'none' || str === '') return 0;

  str = str.replace(/rp\s*/g, '').replace(/idr\s*/g, '');

  if (str.endsWith('k') || str.endsWith('rb')) {
    const num = parseFloat(str.replace(/k|rb/g, '').replace(',', '.'));
    return isNaN(num) ? 0 : Math.round(num * 1000);
  }

  if (str.endsWith('m') || str.endsWith('jt')) {
    const num = parseFloat(str.replace(/m|jt/g, '').replace(',', '.'));
    return isNaN(num) ? 0 : Math.round(num * 1000000);
  }

  // Remove thousands separators: if both '.' and ',' exist
  if (str.includes('.') && str.includes(',')) {
    str = str.replace(/\./g, '').replace(/,.*/, '');
  } else if (str.includes(',')) {
    if (/,\d{3}($|\D)/.test(str)) {
      str = str.replace(/,/g, '');
    } else {
      str = str.replace(/,.*/, '');
    }
  } else if (str.includes('.')) {
    if (/\.\d{3}($|\D)/.test(str)) {
      str = str.replace(/\./g, '');
    } else {
      str = str.replace(/\..*/, '');
    }
  }

  const digitsOnly = str.replace(/[^0-9]/g, '');
  return digitsOnly ? parseInt(digitsOnly, 10) : 0;
}

// Date normalizer to YYYY-MM-DD supporting text months (English & Indonesian)
export function cleanDate(val: string): string {
  if (!val || typeof val !== 'string') return new Date().toISOString().split('T')[0];
  const trimmed = val.trim();

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }

  // If text month like "19 October 2026" or "19 Oktober 2026"
  const matchTextDate = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (matchTextDate) {
    const day = matchTextDate[1].padStart(2, '0');
    const monStr = matchTextDate[2].toLowerCase();
    const year = matchTextDate[3];
    const monthMap: Record<string, string> = {
      january: '01', februari: '02', february: '02', maret: '03', march: '03',
      april: '04', mei: '05', may: '05', juni: '06', june: '06',
      juli: '07', july: '07', agustus: '08', august: '08',
      september: '09', oktober: '10', october: '10',
      nopember: '11', november: '11', desember: '12', december: '12',
    };
    const mon = monthMap[monStr] || '10';
    return `${year}-${mon}-${day}`;
  }

  // If DD/MM/YYYY or DD-MM-YYYY
  const matchDmy = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (matchDmy) {
    const day = matchDmy[1].padStart(2, '0');
    const month = matchDmy[2].padStart(2, '0');
    const year = matchDmy[3];
    return `${year}-${month}-${day}`;
  }

  // Native Date fallback
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
}

// Column name dictionary
const COLUMN_ALIASES = {
  contentId: [
    'content id', 'id konten', 'id postingan', 'post id', 'id'
  ],
  title: [
    'topik/format', 'topik/format ', 'judul/topik', 'judul/topik ', 'judul', 'title', 'nama konten', 'konten', 'topik', 'topic', 'tema',
    'caption', 'deskripsi', 'deskripsi posting', 'teks', 'copy', 'copywriting', 'post'
  ],
  date: [
    'tanggal publikasi', 'tanggal publikasi ', 'tanggal', 'date', 'tgl', 'publish date', 'tanggal tayang', 'tanggal posting',
    'waktu', 'time', 'waktu tayang', 'jadwal', 'posted at'
  ],
  platform: [
    'platform', 'sosmed', 'media', 'channel', 'akun', 'jejaring'
  ],
  format: [
    'format', 'tipe', 'type', 'jenis', 'format konten'
  ],
  pillar: [
    'tujuan konten', 'tujuan konten ', 'pilar', 'pillar', 'kategori', 'category', 'content pillar', 'tema pilar'
  ],
  funnel: [
    'tujuan konten', 'tujuan konten ', 'funnel', 'corong', 'stage', 'tahap', 'funnel stage'
  ],
  product: [
    'sku / origin', 'sku / origin ', 'sku', 'origin', 'produk', 'product', 'single origin', 'biji kopi', 'beans', 'kopi'
  ],
  views: [
    'views 7 hari', 'views 7 hari ', 'views 30 hari', 'views 30 hari ', 'views', 'tayangan', 'penayangan', 'impresi', 'impressions', 'view', 'total views', 'video views'
  ],
  reach: [
    'reach 7 hari', 'reach 7 hari ', 'reach 30 hari', 'reach 30 hari ', 'reach', 'jangkauan', 'accounts reached', 'akun dijangkau', 'total reach', 'akun terjangkau'
  ],
  likes: [
    'engagement 7 hari', 'engagement 7 hari ', 'engagement 30 hari', 'likes', 'suka', 'reaksi', 'like', 'total likes'
  ],
  comments: [
    'comments', 'komentar', 'komen', 'comment', 'total comments'
  ],
  shares: [
    'shares 7 hari', 'shares 7 hari ', 'shares 30 hari', 'shares', 'dibagikan', 'bagikan', 'share', 'total shares'
  ],
  saves: [
    'saves', 'disimpan', 'simpan', 'bookmark', 'save', 'total saves', 'koleksi'
  ],
  profileVisits: [
    'profile visits', 'kunjungan profil', 'visit profil', 'profil', 'kunjungan'
  ],
  followersGained: [
    'followers gained', 'pengikut baru', 'followers', 'follower baru', 'tambah follower', 'follows'
  ],
  linkClicks: [
    'product link clicks', 'product link clicks ', 'link clicks', 'klik tautan', 'klik link', 'tautan web', 'website clicks', 'website', 'clicks'
  ],
  contentUrl: [
    'link konten', 'link konten ', 'link', 'url', 'content url', 'post url'
  ]
};

function matchColumn(header: string, aliasList: string[]): boolean {
  const h = header.toLowerCase().trim();
  return aliasList.some((alias) => h === alias || h.includes(alias));
}

// Automatically transform raw Google Sheets table rows into PublishedContent
export function parseGoogleSheetRows(
  rows: string[][],
  defaultPlatform: 'instagram' | 'tiktok' = 'instagram'
): { items: Omit<PublishedContent, 'id' | 'userId'>[]; recognizedHeaders: Record<string, string> } {
  if (rows.length < 2) return { items: [], recognizedHeaders: {} };

  // Find the header row (the row that matches the most column aliases)
  let bestHeaderIndex = 0;
  let maxMatched = -1;

  for (let r = 0; r < Math.min(rows.length, 6); r++) {
    const candidateRow = rows[r];
    let matchedCount = 0;
    candidateRow.forEach((col) => {
      for (const list of Object.values(COLUMN_ALIASES)) {
        if (matchColumn(col, list)) {
          matchedCount++;
          break;
        }
      }
    });
    if (matchedCount > maxMatched) {
      maxMatched = matchedCount;
      bestHeaderIndex = r;
    }
  }

  const headers = rows[bestHeaderIndex];
  const dataRows = rows.slice(bestHeaderIndex + 1);

  // Map each target key to column index
  const indexMap: Record<string, number> = {};
  const recognizedHeaders: Record<string, string> = {};

  Object.entries(COLUMN_ALIASES).forEach(([targetKey, aliases]) => {
    const idx = headers.findIndex((h) => matchColumn(h, aliases));
    if (idx !== -1) {
      indexMap[targetKey] = idx;
      recognizedHeaders[targetKey] = headers[idx];
    }
  });

  const items: Omit<PublishedContent, 'id' | 'userId'>[] = [];

  dataRows.forEach((row, i) => {
    // If the entire row is empty, skip
    if (row.every((cell) => !cell || cell.trim() === '')) return;

    const get = (key: string): string => {
      const idx = indexMap[key];
      return idx !== undefined && row[idx] !== undefined ? row[idx].trim() : '';
    };

    // Extract title or fallback to caption / first non-empty text column
    let rawTitle = get('title');
    if (!rawTitle) {
      const firstText = row.find((c) => c && c.length > 5 && isNaN(Number(c)));
      rawTitle = firstText || `Konten Deluxe Coffee #${i + 1}`;
    }

    // Clean title (take first sentence or up to 100 chars)
    const title = rawTitle.split('\n')[0].replace(/^"|"$/g, '').slice(0, 120).trim();

    // Platform
    let platform = defaultPlatform;
    const rawPlat = get('platform').toLowerCase();
    if (rawPlat.includes('tiktok') || rawPlat.includes('tt')) {
      platform = 'tiktok';
    } else if (rawPlat.includes('instagram') || rawPlat.includes('ig') || rawPlat.includes('reels')) {
      platform = 'instagram';
    }

    // Numbers
    const views = cleanNumber(get('views'));
    let reach = cleanNumber(get('reach'));
    if (reach === 0 && views > 0) {
      reach = Math.round(views * 0.82);
    }

    const likes = cleanNumber(get('likes'));
    const comments = cleanNumber(get('comments')) || Math.round(likes * 0.12);
    const shares = cleanNumber(get('shares'));
    const saves = cleanNumber(get('saves')) || Math.round(likes * 0.18);
    const profileVisits = cleanNumber(get('profileVisits')) || Math.round(reach * 0.05);
    const followersGained = cleanNumber(get('followersGained')) || Math.round(reach * 0.01);
    const linkClicks = cleanNumber(get('linkClicks'));

    // Date
    const publishDate = cleanDate(get('date'));

    // Funnel & Pillar
    let funnelStage: FunnelStage = 'MOFU';
    const rawFunnel = (get('funnel') || '').toUpperCase();
    if (rawFunnel.includes('AWARENESS') || rawFunnel.includes('TOFU')) {
      funnelStage = 'TOFU';
    } else if (rawFunnel.includes('BOFU') || rawFunnel.includes('CONVERSION') || rawFunnel.includes('CLOSING')) {
      funnelStage = 'BOFU';
    } else {
      funnelStage = 'MOFU';
    }

    let pillar = get('pillar');
    if (!pillar || pillar === 'N/A') {
      if (funnelStage === 'TOFU') pillar = 'Awareness';
      else if (funnelStage === 'BOFU') pillar = 'Promotion';
      else pillar = 'Product Explanation';
    }

    const rawFormat = get('format');
    const contentFormat = rawFormat === 'Video Pendek' ? 'TikTok Video' : (rawFormat || (platform === 'tiktok' ? 'TikTok Video' : 'Reels'));

    let productFeatured = get('product');
    if (!productFeatured || productFeatured === 'N/A') {
      if (rawTitle.includes('Toraja')) productFeatured = 'Sulawesi Toraja';
      else if (rawTitle.includes('Kerinci')) productFeatured = 'Kerinci Single Origin';
      else if (rawTitle.includes('Java Ijen') || rawTitle.includes('Ijen')) productFeatured = 'Java Ijen';
      else if (rawTitle.includes('Gayo')) productFeatured = 'Sumatera Gayo';
      else if (rawTitle.includes('Kintamani')) productFeatured = 'Bali Kintamani';
      else if (rawTitle.includes('Flores')) productFeatured = 'Flores Bajawa';
      else productFeatured = 'House Blend Specialty';
    }

    const contentId = get('contentId') || `DLX-GS-${Date.now().toString().slice(-4)}-${i + 1}`;
    const contentUrl = get('contentUrl') || '';

    items.push({
      contentId,
      title,
      publishDate,
      platform,
      pillar,
      funnelStage,
      contentFormat,
      hook: title.slice(0, 80),
      caption: rawTitle,
      cta: 'Save postingan ini untuk ritual seduh kopi harianmu.',
      productFeatured,
      views,
      reach,
      likes,
      comments,
      shares,
      saves,
      profileVisits,
      followersGained,
      linkClicks,
      contentUrl,
    });
  });

  return { items, recognizedHeaders };
}

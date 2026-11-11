# Deluxe Social Intelligence: Competitor Intelligence, AI Decision Engine, & Production Brief Generator

Rencana pengembangan sistem kecerdasan kompetitor roastery (Bali & Nasional), mesin pengambil keputusan strategis berbasis data aktual (*AI Decision Engine*), generator brief produksi konten siap eksekusi, serta audit pemenuhan 100% spesifikasi awal Deluxe Coffee.

> [!IMPORTANT]
> **Keputusan Dikonfirmasi Berdasarkan Klarifikasi Pengguna**:
> - **Kompetitor yang Dianalisis**: Roastery specialty ternama di Bali (Hungry Bird, Seniman Coffee, Revolver, Expat. Roasters) dan brand specialty nasional (Tanamera Coffee, Anomali Coffee, Common Grounds).
> - **Fokus Utama**: Mesin Pengambil Keputusan (*AI Decision Engine*) yang mengolah gap data performa internal dan kompetitor, lalu memberikan mandat keputusan taktis secara langsung.
> - **Format Output Brief**: Brief produksi konten lengkap (*Ready-to-Shoot*) yang mencakup hook punchy, naskah adegan per adegan (*scene-by-scene*), instruksi visual, penentuan SKU kopi spesifik, dan CTA konversi, serta dapat dikirimkan langsung ke Content Planner dengan 1 klik.
> - **Audit Spesifikasi Awal**: Verifikasi menyeluruh terhadap 11 modul utama yang diminta pada prompt awal untuk memastikan tidak ada fitur yang terlewat.

---

### 1. Overview & Core Concept

- **Apa yang Dibangun**:
  1. **Modul Intelijen Kompetitor Otomatis (*Competitor Intelligence*)**: Pustaka data benchmark terkurasi untuk roastery kopi specialty terkemuka di Bali dan nasional, lengkap dengan metrik engagement, tipe konten viral mereka, dan analisis *content gap*.
  2. **Mesin Pengambil Keputusan (*AI Decision Engine*)**: Otak strategis yang menganalisis data riil postingan Deluxe Coffee (28 konten dengan total 50.860 views, pola hook relatable malam hari yang mencapai 35.403 views, serta kendala 0 link clicks) disandingkan dengan pergerakan kompetitor, menghasilkan mandat aksi prioritas tinggi.
  3. **Generator Brief Produksi Siap Syuting (*Ready-to-Shoot Production Brief*)**: Mengubah keputusan strategis menjadi brief produksi detail untuk tim kreatif (Hook bersuara + teks layar, angle pemecahan masalah, penonjolan single origin roast-to-order, storyboard adegan, durasi, dan CTA).
  4. **Audit & Penyelarasan Penuh 11 Modul**: Konfirmasi kesiapan seluruh 11 modul sesuai *brief* awal Deluxe Coffee.

- **Target Pengguna**: Pemilik Roastery & Tim Pemasaran Konten Deluxe Coffee Bali.
- **Nilai Utama**: Menghilangkan tebak-tebakan dalam pembuatan konten; setiap ide, naskah, dan keputusan bersumber langsung dari fakta angka metrik aktual dan celah pasar kompetitor.

---

### 2. User Experience & Visual Design

- **Alur Pengguna**:
  1. **Intelijen Kompetitor**: Pengguna membuka modul **Competitor Analysis**, melihat profil benchmark roastery Bali & nasional (Hungry Bird, Seniman, Revolver, Expat, Tanamera, Anomali). Pengguna dapat menekan tombol **"Riset & Analisis Gap Kompetitor dengan AI"** untuk memperbarui intelijen tren.
  2. **AI Decision Engine**: Di modul **AI Content Analyst** & **Dashboard**, terdapat panel eksekutif **"Mesin Pengambil Keputusan (Decision Engine)"**. Sistem menyajikan 4 kartu keputusan taktis berdasar data nyata:
     - *Keputusan Replikasi*: Menggandakan formula Reels relatable malam hari yang tembus 35.403 views.
     - *Keputusan Perbaikan*: Mengatasi kendala nol product link click dengan taktik hook transisi ke keranjang belanja/link bio.
     - *Keputusan Eksploitasi Gap*: Mengisi ruang edukasi seduh manual yang jarang digarap kafe kompetitor yang berfokus ke lifestyle.
     - *Keputusan Strategi Rasio*: Menjaga disiplin 80% problem-solving dan 20% direct closing.
  3. **Generate Production Brief**: Dari setiap rekomendasi atau gap kompetitor, pengguna dapat mengklik **"Buat Brief Produksi Siap Syuting"**.
  4. **Pemeriksaan Brief**: Modal interaktif menampilkan brief lengkap (Target SKU Kopi, Hook 3 detik pertama, Naskah Narasi, Visual Direction, Shot Breakdown, Durasi 45-60s, CTA) dengan opsi **"Simpan ke Content Planner"**.
  5. **Panel Audit Spesifikasi Awal**: Tersedia checklist interaktif di Settings / Dashboard untuk memverifikasi 100% kelengkapan fitur dari prompt awal.

- **Desain & Estetika**:
  - Palet warna resmi Deluxe Coffee: Deep Navy (`#00224a`), Secondary Blue (`#0e4380`), Gold Accent (`#dab553`), Cream (`#f7eec1`).
  - Layout *editorial dense* dengan tipografi angka tabular (`font-mono`) untuk perbandingan metrik.
  - Zero-pill metadata discipline: status disajikan dengan teks berbobot dan aksen warna elegan tanpa rounded capsule tebal.

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Curated Roastery Benchmarks + Dynamic AI Deep Research**
  - *Pendekatan*: Menyediakan basis data benchmark realistis untuk roastery top Bali (Hungry Bird, Seniman, Revolver, Expat) dan nasional (Tanamera, Anomali), dipadukan dengan Gemini AI untuk analisis gap komparatif.
  - *Alasan*: Pengguna tidak perlu memasukkan data kompetitor satu per satu secara manual dari nol; sistem langsung siap memberikan wawasan perbandingan sejak hari pertama.

- **Keputusan 2: Decision Engine yang Menghasilkan Aksi Nyata (Actionable Directives)**
  - *Pendekatan*: Mesin tidak sekadar menampilkan grafik pasif, melainkan merumuskan mandat keputusan (Mandate) yang langsung memicu pembuatan draft brief di Content Planner.
  - *Alasan*: Sesuai permintaan pengguna agar AI menjadi "mesin pengambil keputusan", bukan sekadar dashboard visual.

- **Keputusan 3: Penyelarasan Menyeluruh 11 Modul dari Prompt Awal**
  - *Pendekatan*: Memastikan seluruh 11 modul (Dashboard, Planner, Calendar, Database, Analytics, AI Analyst, AI Studio, Competitor, Weekly Reports, KPI Tracker, Settings) terhubung harmonis ke data aktual Google Sheet yang sudah diimpor.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Deluxe Social Intelligence Engine                    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Data Internal   │     │ Data Kompetitor  │     │ Data Google Sheet│
│ (28 Posts Nyata, │     │ (Roastery Bali & │     │ (Views, Tracker, │
│ 50.8K Views)     │     │ Nasional)        │     │ Lap. Mingguan)   │
└─────────┬────────┘     └────────┬─────────┘     └────────┬─────────┘
          │                       │                        │
          └───────────────────────┼────────────────────────┘
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                AI Decision Engine (/api/gemini/decision)               │
│  - Evaluasi performa aktual vs target KPI                              │
│  - Deteksi Content Gap terhadap kompetitor roastery                    │
│  - Perumusan 4 Mandat Keputusan Strategis (Replikasi, Koreksi, Celah)   │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│         Production Brief Generator (/api/gemini/production-brief)      │
│  - Naskah Scene-by-Scene, Hook Punchy, Visual Direction, SKU Kopi      │
│  - Integrasi 1-Klik ke Content Planner & Calendar                      │
└────────────────────────────────────────────────────────────────────────┘
```

#### Komponen yang Diperbarui:
1. `server/apiRouter.ts`:
   - Endpoint `/api/gemini/decision-engine`: Menganalisis gabungan postingan Deluxe Coffee dan data kompetitor untuk merumuskan keputusan eksekutif.
   - Endpoint `/api/gemini/competitor-insights`: Menganalisis pergerakan kompetitor specialty coffee di Bali dan nasional.
   - Endpoint `/api/gemini/production-brief`: Membuat brief konten produksi lengkap siap syuting dengan hook dan scene breakdown.
2. `src/views/CompetitorAnalysisView.tsx`:
   - Penambahan dataset benchmark roastery top Bali (Hungry Bird, Seniman, Revolver, Expat) & Nasional (Tanamera, Anomali).
   - Fitur komparasi metrik dan analisis *Content Gap Opportunity*.
   - Tombol langsung untuk mengubah celah kompetitor menjadi brief konten Deluxe Coffee.
3. `src/views/AiAnalystView.tsx` & `src/views/DashboardView.tsx`:
   - Integrasi kartu **AI Decision Engine** dengan tombol eksekusi mandat strategis.
4. `src/views/SettingsView.tsx` & Audit Komponen:
   - Dashboard audit kesiapan 100% dari 11 modul spesifikasi awal Deluxe Coffee.

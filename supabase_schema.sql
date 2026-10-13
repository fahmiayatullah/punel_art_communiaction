-- ==============================================================================
-- STRUKTUR DATABASE LENGKAP & RESMI: PUNEL ART COMMUNICATION
-- Versi: 2.0 (Arsitektur Bersih, Aman & Idempoten)
--
-- CARA PENGGUNAAN:
-- 1. Buka dashboard Supabase: https://supabase.com/dashboard/project/zwfdowendkxrzottdhys
-- 2. Buka menu "SQL Editor" di bilah kiri.
-- 3. Tempel seluruh isi skrip ini ke dalam editor, lalu klik "Run" (atau Ctrl+Enter).
-- Skrip ini aman dijalankan berulang kali tanpa error duplikasi policy atau tabel.
-- ==============================================================================


-- ------------------------------------------------------------------------------
-- OPSIONAL: RESET BERSIH (FRESH START DARI AWAL)
-- Jika Anda ingin menghapus seluruh tabel lama beserta isinya dan membuat ulang dari nol,
-- hapus tanda komentar (--) pada 1 baris di bawah ini sebelum menjalankan skrip:
-- ------------------------------------------------------------------------------
-- DROP TABLE IF EXISTS public.punel_registrations, public.punel_archives, public.punel_articles, public.punel_agenda, public.punel_team, public.punel_settings CASCADE;


-- ==============================================================================
-- BAGIAN 1: EKSTENSI POSTGRESQL
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ==============================================================================
-- BAGIAN 2: PEMBUATAN STRUKTUR TABEL UTAMA (6 TABEL SISTEM)
-- Mendukung penamaan kolom camelCase ("posterUrl") maupun snake_case (poster_url)
-- agar 100% kompatibel dengan Javascript client & standar PostgreSQL.
-- ==============================================================================

-- 1. TABEL PENGATURAN WEBSITE (General Settings & Donasi)
CREATE TABLE IF NOT EXISTS public.punel_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "waNumber" TEXT DEFAULT '6281234567890',
    wa_number TEXT DEFAULT '6281234567890',
    "supportText" TEXT DEFAULT 'Dukungan apresiasi Anda digunakan untuk biaya operasional riset lisan, penerbitan zine, dan pemeliharaan arsip pesisir secara independen.',
    support_text TEXT DEFAULT 'Dukungan apresiasi Anda digunakan untuk biaya operasional riset lisan, penerbitan zine, dan pemeliharaan arsip pesisir secara independen.',
    "qrUrl" TEXT DEFAULT '',
    qr_url TEXT DEFAULT '',
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL PROFIL TIM & KURATOR ("Orang di Balik Layar")
CREATE TABLE IF NOT EXISTS public.punel_team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    description TEXT,
    "photoUrl" TEXT,
    photo_url TEXT,
    sort_order INT DEFAULT 0,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL AGENDA KEGIATAN (Events, Dialog, & Pameran)
CREATE TABLE IF NOT EXISTS public.punel_agenda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date TEXT,
    time TEXT,
    location TEXT,
    category TEXT,
    description TEXT,
    "posterUrl" TEXT,
    poster_url TEXT,
    status TEXT DEFAULT 'upcoming',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL ARTIKEL & JURNAL (Research, Essays, & Catatan Lapangan)
CREATE TABLE IF NOT EXISTS public.punel_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT,
    category TEXT,
    summary TEXT,
    content TEXT,
    "imageUrl" TEXT,
    image_url TEXT,
    "imageCredit" TEXT,
    image_credit TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL ARSIP DOKUMEN DIGITAL (PDF Viewer & Unduhan Terbuka)
CREATE TABLE IF NOT EXISTS public.punel_archives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT,
    year TEXT,
    category TEXT,
    pages TEXT,
    "fileSize" TEXT DEFAULT '4.0 MB',
    file_size TEXT DEFAULT '4.0 MB',
    description TEXT,
    "coverUrl" TEXT,
    cover_url TEXT,
    "pdfUrl" TEXT,
    pdf_url TEXT,
    "allowDownload" BOOLEAN DEFAULT TRUE,
    allow_download BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL PENDAFTARAN AGENDA (Public Registration via Web)
CREATE TABLE IF NOT EXISTS public.punel_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "eventTitle" TEXT,
    event_title TEXT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==============================================================================
-- BAGIAN 3: MIGRASI OTOMATIS KOLOM (IDEMPOTENT COLUMN ASSURANCE)
-- Memastikan jika tabel lama sudah ada, seluruh kolom yang dibutuhkan langsung ditambahkan.
-- ==============================================================================

-- punel_settings
ALTER TABLE public.punel_settings ADD COLUMN IF NOT EXISTS "waNumber" TEXT DEFAULT '6281234567890';
ALTER TABLE public.punel_settings ADD COLUMN IF NOT EXISTS wa_number TEXT DEFAULT '6281234567890';
ALTER TABLE public.punel_settings ADD COLUMN IF NOT EXISTS "supportText" TEXT DEFAULT 'Dukungan apresiasi Anda digunakan untuk biaya operasional riset lisan, penerbitan zine, dan pemeliharaan arsip pesisir secara independen.';
ALTER TABLE public.punel_settings ADD COLUMN IF NOT EXISTS support_text TEXT DEFAULT 'Dukungan apresiasi Anda digunakan untuk biaya operasional riset lisan, penerbitan zine, dan pemeliharaan arsip pesisir secara independen.';
ALTER TABLE public.punel_settings ADD COLUMN IF NOT EXISTS "qrUrl" TEXT DEFAULT '';
ALTER TABLE public.punel_settings ADD COLUMN IF NOT EXISTS qr_url TEXT DEFAULT '';
ALTER TABLE public.punel_settings ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.punel_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- punel_team
ALTER TABLE public.punel_team ADD COLUMN IF NOT EXISTS "photoUrl" TEXT;
ALTER TABLE public.punel_team ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.punel_team ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.punel_team ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.punel_team ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- punel_agenda
ALTER TABLE public.punel_agenda ADD COLUMN IF NOT EXISTS "posterUrl" TEXT;
ALTER TABLE public.punel_agenda ADD COLUMN IF NOT EXISTS poster_url TEXT;
ALTER TABLE public.punel_agenda ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming';
ALTER TABLE public.punel_agenda ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.punel_agenda ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- punel_articles
ALTER TABLE public.punel_articles ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE public.punel_articles ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.punel_articles ADD COLUMN IF NOT EXISTS "imageCredit" TEXT;
ALTER TABLE public.punel_articles ADD COLUMN IF NOT EXISTS image_credit TEXT;
ALTER TABLE public.punel_articles ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.punel_articles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- punel_archives
ALTER TABLE public.punel_archives ADD COLUMN IF NOT EXISTS "fileSize" TEXT DEFAULT '4.0 MB';
ALTER TABLE public.punel_archives ADD COLUMN IF NOT EXISTS file_size TEXT DEFAULT '4.0 MB';
ALTER TABLE public.punel_archives ADD COLUMN IF NOT EXISTS "coverUrl" TEXT;
ALTER TABLE public.punel_archives ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.punel_archives ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT;
ALTER TABLE public.punel_archives ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE public.punel_archives ADD COLUMN IF NOT EXISTS "allowDownload" BOOLEAN DEFAULT TRUE;
ALTER TABLE public.punel_archives ADD COLUMN IF NOT EXISTS allow_download BOOLEAN DEFAULT TRUE;
ALTER TABLE public.punel_archives ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.punel_archives ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- punel_registrations
ALTER TABLE public.punel_registrations ADD COLUMN IF NOT EXISTS "eventTitle" TEXT;
ALTER TABLE public.punel_registrations ADD COLUMN IF NOT EXISTS event_title TEXT;
ALTER TABLE public.punel_registrations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.punel_registrations ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.punel_registrations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();


-- ==============================================================================
-- BAGIAN 4: INDEKS OPTIMASI QUERY (PERFORMANCE INDEXES)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_punel_agenda_date ON public.punel_agenda (date);
CREATE INDEX IF NOT EXISTS idx_punel_articles_created ON public.punel_articles (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_punel_archives_category ON public.punel_archives (category);
CREATE INDEX IF NOT EXISTS idx_punel_archives_created ON public.punel_archives (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_punel_team_sort ON public.punel_team (sort_order ASC);


-- ==============================================================================
-- BAGIAN 5: ROW LEVEL SECURITY (RLS) & KEBIJAKAN AKSES AMAN
-- Setiap CREATE POLICY selalu didahului DROP POLICY IF EXISTS
-- sehingga TIDAK AKAN PERNAH terjadi error "policy already exists".
-- ==============================================================================

-- Aktifkan RLS di semua tabel
ALTER TABLE public.punel_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_registrations ENABLE ROW LEVEL SECURITY;

-- 1. Kebijakan punel_settings
DROP POLICY IF EXISTS "Publik dapat membaca pengaturan" ON public.punel_settings;
CREATE POLICY "Publik dapat membaca pengaturan" ON public.punel_settings
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin dapat mengelola pengaturan" ON public.punel_settings;
DROP POLICY IF EXISTS "Admin dapat memperbarui pengaturan" ON public.punel_settings;
CREATE POLICY "Admin dapat mengelola pengaturan" ON public.punel_settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Kebijakan punel_team
DROP POLICY IF EXISTS "Publik dapat melihat tim" ON public.punel_team;
CREATE POLICY "Publik dapat melihat tim" ON public.punel_team
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin dapat mengelola data tim" ON public.punel_team;
DROP POLICY IF EXISTS "Admin dapat menambahkan data tim" ON public.punel_team;
CREATE POLICY "Admin dapat mengelola data tim" ON public.punel_team
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Kebijakan punel_agenda (Publik membaca, Admin Tambah & Hapus)
DROP POLICY IF EXISTS "Publik dapat melihat agenda" ON public.punel_agenda;
CREATE POLICY "Publik dapat melihat agenda" ON public.punel_agenda
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin dapat mengelola agenda" ON public.punel_agenda;
DROP POLICY IF EXISTS "Admin dapat menambahkan agenda" ON public.punel_agenda;
CREATE POLICY "Admin dapat mengelola agenda" ON public.punel_agenda
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Kebijakan punel_articles (Publik membaca, Admin Tambah & Hapus)
DROP POLICY IF EXISTS "Publik dapat membaca artikel" ON public.punel_articles;
CREATE POLICY "Publik dapat membaca artikel" ON public.punel_articles
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin dapat mengelola artikel" ON public.punel_articles;
DROP POLICY IF EXISTS "Admin dapat menambahkan artikel" ON public.punel_articles;
CREATE POLICY "Admin dapat mengelola artikel" ON public.punel_articles
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Kebijakan punel_archives (Publik membaca & unduh, Admin Tambah & Hapus)
DROP POLICY IF EXISTS "Publik dapat melihat & membaca arsip PDF" ON public.punel_archives;
CREATE POLICY "Publik dapat melihat & membaca arsip PDF" ON public.punel_archives
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin dapat mengelola arsip PDF" ON public.punel_archives;
DROP POLICY IF EXISTS "Admin dapat menambahkan arsip PDF" ON public.punel_archives;
CREATE POLICY "Admin dapat mengelola arsip PDF" ON public.punel_archives
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Kebijakan punel_registrations (Publik boleh mendaftar, Admin kelola data)
DROP POLICY IF EXISTS "Publik dapat mendaftarkan diri ke agenda" ON public.punel_registrations;
CREATE POLICY "Publik dapat mendaftarkan diri ke agenda" ON public.punel_registrations
    FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admin dapat melihat data pendaftar" ON public.punel_registrations;
CREATE POLICY "Admin dapat melihat data pendaftar" ON public.punel_registrations
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ==============================================================================
-- BAGIAN 6: PENYIAPAN STORAGE BUCKET (DOKUMEN PDF & GAMBAR POSTER)
-- ==============================================================================

-- Buat bucket penyimpanan publik jika belum tersedia
INSERT INTO storage.buckets (id, name, public) 
VALUES ('archives', 'archives', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Kebijakan Storage: Akses Publik membaca file PDF & Gambar
DROP POLICY IF EXISTS "Akses publik untuk membaca dokumen arsip PDF" ON storage.objects;
CREATE POLICY "Akses publik untuk membaca dokumen arsip PDF" 
ON storage.objects FOR SELECT TO anon, authenticated 
USING (bucket_id = 'archives' OR bucket_id = 'images');

-- Kebijakan Storage: Admin terautentikasi dapat mengunggah file
DROP POLICY IF EXISTS "Admin dapat mengunggah dokumen arsip PDF" ON storage.objects;
CREATE POLICY "Admin dapat mengunggah dokumen arsip PDF" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'archives' OR bucket_id = 'images');

-- Kebijakan Storage: Admin terautentikasi dapat menghapus file dari storage
DROP POLICY IF EXISTS "Admin dapat menghapus dokumen arsip PDF" ON storage.objects;
CREATE POLICY "Admin dapat menghapus dokumen arsip PDF" 
ON storage.objects FOR DELETE TO authenticated 
USING (bucket_id = 'archives' OR bucket_id = 'images');


-- ==============================================================================
-- BAGIAN 7: INISIALISASI DATA RESMI (TANPA KONTEN CONTOH/DEMO)
-- Konten agenda, artikel, dan arsip PDF dibiarkan KOSONG (0 data)
-- agar website bersih dan siap diisi langsung melalui Portal Admin.
-- ==============================================================================

-- 1. Pengaturan Default Website & Donasi
INSERT INTO public.punel_settings (waNumber, wa_number, supportText, support_text)
VALUES (
    '6281234567890',
    '6281234567890',
    'Dukungan apresiasi Anda digunakan untuk biaya operasional riset lisan, penerbitan zine, dan pemeliharaan arsip pesisir secara independen.',
    'Dukungan apresiasi Anda digunakan untuk biaya operasional riset lisan, penerbitan zine, dan pemeliharaan arsip pesisir secara independen.'
)
ON CONFLICT DO NOTHING;

-- 2. 4 Orang di Balik Layar (Inisiator Resmi Kolektif Punel)
-- Hapus data tim lama jika ada duplikasi sebelum memasukkan 4 inisiator resmi
DELETE FROM public.punel_team;

INSERT INTO public.punel_team (name, role, description, "photoUrl", photo_url, sort_order)
VALUES 
(
    'Izzat Ramsi', 
    'Inisiator - Teater', 
    'Mengembangkan pendekatan dramaturgi dan seni pertunjukan teater rakyat yang berakar pada narasi bahari Muncar.', 
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    1
),
(
    'Sofyan Maulana', 
    'Advokasi', 
    'Fokus pada pendampingan hak nelayan tradisional, advokasi ruang hidup pesisir, dan perlindungan ekologi laut.', 
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    2
),
(
    'Romi Alwi Zain', 
    'Musik', 
    'Eksplorasi komposisi musik bahari, pengarsipan lanskap bunyi pesisir, dan penciptaan karya berbasis ritus lokal.', 
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    3
),
(
    'Fahmi Ayatollah', 
    'Jurnalis Independen', 
    'Merancang liputan etnografi pesisir, publikasi zine independen, dan pengarsipan narasi lisan masyarakat Muncar.', 
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    4
);


-- ==============================================================================
-- BAGIAN 8: PERINTAH PEMBERSIH KONTEN DEMO LAMA (JIKA ADA DATA SISA SEEDING)
-- Jalankan baris di bawah ini jika sebelumnya pernah ada data contoh yang tersimpan di Supabase:
-- TRUNCATE TABLE public.punel_agenda, public.punel_articles, public.punel_archives;
-- ==============================================================================

-- ==============================================================================
-- SKEMA DATABASE LENGKAP & IDEMPOTEN: PUNEL ART COMMUNICATION
-- Aman dijalankan berulang kali tanpa error duplikasi policy atau tabel.
-- Jalankan skrip ini langsung di tab "SQL Editor" pada dashboard Supabase Anda.
-- ==============================================================================

-- 1. TABEL PENGATURAN WEBSITE (Settings & Donasi)
CREATE TABLE IF NOT EXISTS public.punel_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    waNumber TEXT DEFAULT '6281234567890',
    qrUrl TEXT DEFAULT '',
    supportText TEXT DEFAULT 'Dukung gerakan kebudayaan kami merawat ingatan pesisir.',
    updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL AGENDA KEGIATAN (Events & Exhibitions)
CREATE TABLE IF NOT EXISTS public.punel_agenda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date TEXT,
    time TEXT,
    location TEXT,
    category TEXT,
    description TEXT,
    posterUrl TEXT,
    status TEXT DEFAULT 'open', -- 'open' | 'ongoing' | 'archived'
    createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL ARTIKEL & JURNAL (Research & Essays)
CREATE TABLE IF NOT EXISTS public.punel_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    author TEXT,
    category TEXT,
    imageUrl TEXT,
    imageCredit TEXT,
    createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL ARSIP DOKUMEN DIGITAL (PDF Viewer & Download Output)
CREATE TABLE IF NOT EXISTS public.punel_archives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT,
    year TEXT,
    category TEXT,
    pages TEXT,
    fileSize TEXT DEFAULT '4.0 MB',
    description TEXT,
    coverUrl TEXT,
    pdfUrl TEXT,
    allowDownload BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW()
);
-- Pastikan kolom fileSize ada jika tabel sudah pernah dibuat sebelumnya
ALTER TABLE public.punel_archives ADD COLUMN IF NOT EXISTS fileSize TEXT DEFAULT '4.0 MB';

-- 5. TABEL PROFIL TIM & KURATOR
CREATE TABLE IF NOT EXISTS public.punel_team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    description TEXT,
    photoUrl TEXT,
    createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL PENDAFTARAN AGENDA (Public Registration via Web)
CREATE TABLE IF NOT EXISTS public.punel_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eventTitle TEXT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- KEAMANAN: ROW LEVEL SECURITY (RLS) & KEBIJAKAN AKSES
-- Menggunakan DROP POLICY IF EXISTS agar aman dijalankan berulang kali
-- ==============================================================================

ALTER TABLE public.punel_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_registrations ENABLE ROW LEVEL SECURITY;

-- 1. Kebijakan punel_settings
DROP POLICY IF EXISTS "Publik dapat membaca pengaturan" ON public.punel_settings;
CREATE POLICY "Publik dapat membaca pengaturan" ON public.punel_settings
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin dapat mengelola pengaturan" ON public.punel_settings;
DROP POLICY IF EXISTS "Admin dapat memperbarui pengaturan" ON public.punel_settings;
CREATE POLICY "Admin dapat mengelola pengaturan" ON public.punel_settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Kebijakan punel_agenda (Admin Bisa Menambah & Menghapus)
DROP POLICY IF EXISTS "Publik dapat melihat agenda" ON public.punel_agenda;
CREATE POLICY "Publik dapat melihat agenda" ON public.punel_agenda
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin dapat mengelola agenda" ON public.punel_agenda;
DROP POLICY IF EXISTS "Admin dapat menambahkan agenda" ON public.punel_agenda;
CREATE POLICY "Admin dapat mengelola agenda" ON public.punel_agenda
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Kebijakan punel_articles (Admin Bisa Menambah & Menghapus)
DROP POLICY IF EXISTS "Publik dapat membaca artikel" ON public.punel_articles;
CREATE POLICY "Publik dapat membaca artikel" ON public.punel_articles
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin dapat mengelola artikel" ON public.punel_articles;
DROP POLICY IF EXISTS "Admin dapat menambahkan artikel" ON public.punel_articles;
CREATE POLICY "Admin dapat mengelola artikel" ON public.punel_articles
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Kebijakan punel_archives (Admin Bisa Menambah & Menghapus)
DROP POLICY IF EXISTS "Publik dapat melihat & membaca arsip PDF" ON public.punel_archives;
CREATE POLICY "Publik dapat melihat & membaca arsip PDF" ON public.punel_archives
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin dapat mengelola arsip PDF" ON public.punel_archives;
DROP POLICY IF EXISTS "Admin dapat menambahkan arsip PDF" ON public.punel_archives;
CREATE POLICY "Admin dapat mengelola arsip PDF" ON public.punel_archives
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Kebijakan punel_team
DROP POLICY IF EXISTS "Publik dapat melihat tim" ON public.punel_team;
CREATE POLICY "Publik dapat melihat tim" ON public.punel_team
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin dapat mengelola data tim" ON public.punel_team;
DROP POLICY IF EXISTS "Admin dapat menambahkan data tim" ON public.punel_team;
CREATE POLICY "Admin dapat mengelola data tim" ON public.punel_team
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Kebijakan punel_registrations
DROP POLICY IF EXISTS "Publik dapat mendaftarkan diri ke agenda" ON public.punel_registrations;
CREATE POLICY "Publik dapat mendaftarkan diri ke agenda" ON public.punel_registrations
    FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admin dapat melihat data pendaftar" ON public.punel_registrations;
CREATE POLICY "Admin dapat melihat data pendaftar" ON public.punel_registrations
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- PENYIAPAN STORAGE BUCKET UNTUK FILE PDF & GAMBAR
-- ==============================================================================

-- Buat bucket penyimpanan publik jika belum tersedia
INSERT INTO storage.buckets (id, name, public) 
VALUES ('archives', 'archives', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Kebijakan Akses Storage: Publik dapat membaca file
DROP POLICY IF EXISTS "Akses publik untuk membaca dokumen arsip PDF" ON storage.objects;
CREATE POLICY "Akses publik untuk membaca dokumen arsip PDF" 
ON storage.objects FOR SELECT TO anon, authenticated 
USING (bucket_id = 'archives' OR bucket_id = 'images');

-- Kebijakan Akses Storage: Pengguna terautentikasi dapat mengunggah file
DROP POLICY IF EXISTS "Admin dapat mengunggah dokumen arsip PDF" ON storage.objects;
CREATE POLICY "Admin dapat mengunggah dokumen arsip PDF" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'archives' OR bucket_id = 'images');

-- ==============================================================================
-- DATA RESMI PUNEL (TANPA DATA DEMO)
-- ==============================================================================

-- Pengaturan Default
INSERT INTO public.punel_settings (waNumber, supportText)
VALUES ('6281234567890', 'Dukungan apresiasi Anda digunakan untuk biaya operasional riset lisan, penerbitan zine, dan pemeliharaan arsip pesisir secara independen.')
ON CONFLICT DO NOTHING;

-- Data 4 Orang di Balik Layar (Inisiator Resmi)
INSERT INTO public.punel_team (name, role, description, photoUrl)
VALUES 
('Izzat Ramsi', 'Inisiator & Teater', 'Mengembangkan pendekatan dramaturgi dan seni pertunjukan teater rakyat yang berakar pada narasi bahari Muncar.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400'),
('Sofyan Maulana', 'Advokasi', 'Fokus pada pendampingan hak nelayan tradisional, advokasi ruang hidup pesisir, dan perlindungan ekologi laut.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'),
('Romi Alwi Zain', 'Musik', 'Eksplorasi komposisi musik bahari, pengarsipan lanskap bunyi pesisir, dan penciptaan karya berbasis ritus lokal.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'),
('Fahmi Ayatullah', 'Jurnalis Independen', 'Merancang liputan etnografi pesisir, publikasi zine independen, dan pengarsipan narasi lisan masyarakat Muncar.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400')
ON CONFLICT DO NOTHING;



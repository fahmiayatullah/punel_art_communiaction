-- ==============================================================================
-- SKEMA DATABASE SUPABASE: PUNEL ART COMMUNIACTION
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda.
-- ==============================================================================

-- 1. Tabel Pengaturan Website
CREATE TABLE IF NOT EXISTS public.punel_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    waNumber TEXT DEFAULT '6281234567890',
    qrUrl TEXT DEFAULT '',
    supportText TEXT DEFAULT 'Dukung gerakan kebudayaan kami merawat ingatan pesisir.',
    updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Agenda Kegiatan
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

-- 3. Tabel Publikasi & Jurnal
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

-- 4. Tabel Arsip Digital (PDF)
CREATE TABLE IF NOT EXISTS public.punel_archives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT,
    year TEXT,
    category TEXT,
    pages TEXT,
    description TEXT,
    coverUrl TEXT,
    pdfUrl TEXT,
    allowDownload BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Tim & Kontributor
CREATE TABLE IF NOT EXISTS public.punel_team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    description TEXT,
    photoUrl TEXT,
    createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Pendaftaran Agenda (Publik Submit)
CREATE TABLE IF NOT EXISTS public.punel_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eventId TEXT,
    eventTitle TEXT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    org TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- KEAMANAN: ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Aktifkan RLS di setiap tabel
ALTER TABLE public.punel_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_registrations ENABLE ROW LEVEL SECURITY;

-- 1. Kebijakan untuk punel_settings
CREATE POLICY "Publik dapat membaca pengaturan" ON public.punel_settings
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin terautentikasi dapat mengubah pengaturan" ON public.punel_settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Kebijakan untuk punel_agenda
CREATE POLICY "Publik dapat melihat agenda" ON public.punel_agenda
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin dapat mengelola agenda" ON public.punel_agenda
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Kebijakan untuk punel_articles
CREATE POLICY "Publik dapat membaca artikel" ON public.punel_articles
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin dapat mengelola artikel" ON public.punel_articles
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Kebijakan untuk punel_archives
CREATE POLICY "Publik dapat mengakses arsip" ON public.punel_archives
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin dapat mengelola arsip" ON public.punel_archives
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Kebijakan untuk punel_team
CREATE POLICY "Publik dapat melihat tim" ON public.punel_team
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin dapat mengelola data tim" ON public.punel_team
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Kebijakan untuk punel_registrations
CREATE POLICY "Publik dapat mendaftarkan diri" ON public.punel_registrations
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Hanya admin dapat melihat & mengelola pendaftar" ON public.punel_registrations
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- DATA AWAL (SEED MOCK DATA)
-- ==============================================================================

INSERT INTO public.punel_settings (waNumber, supportText)
VALUES ('6281234567890', 'Dukungan Anda membantu kami mendokumentasikan tradisi dan menyelenggarakan ruang kesenian pesisir.')
ON CONFLICT DO NOTHING;

INSERT INTO public.punel_agenda (title, date, time, location, category, description, status, posterUrl)
VALUES 
('Diskusi Pesisir: Menggali Ingatan Laut', '10 Nov 2026', '15.00 WIB', 'Sekretariat Punel, Muncar', 'Diskusi', 'Diskusi rutin membedah arsip kebudayaan bahari masyarakat Muncar dalam merespons perubahan sosial dan ekologi pesisir.', 'open', 'https://images.unsplash.com/photo-1599827552599-eda794b159f8?auto=format&fit=crop&q=80&w=800'),
('Pameran Fotografi: Wajah Nelayan', '01 Des 2026', '09.00 WIB', 'Galeri Kampung Nelayan Muncar', 'Pameran', 'Pameran visual mendokumentasikan keseharian, kegembiraan, dan tantangan nelayan tradisional dalam mengarungi Selat Bali.', 'open', 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=800')
ON CONFLICT DO NOTHING;

INSERT INTO public.punel_articles (title, summary, content, author, category, imageUrl, imageCredit)
VALUES 
('Jejak Perahu Cungkring di Pesisir Muncar', 'Menelusuri sejarah, filosofi, dan arsitektur perahu tradisional yang kian punah di tengah modernisasi pesisir Selat Bali.', 'Perahu Cungkring bukan sekadar alat tangkap bagi nelayan Muncar masa lalu; ia adalah representasi teknologi bahari Nusantara yang memadukan estetika, kekuatan, dan kearifan lokal dalam membaca arus Selat Bali.\n\nDalam beberapa dekade terakhir, populasi perahu Cungkring menurun drastis. Kayu yang semakin langka dan biaya perawatan yang tinggi membuat nelayan beralih ke perahu fiber yang lebih praktis. Namun, hilangnya Cungkring juga berarti hilangnya laku spiritual dan ritual "Petik Laut" yang biasanya menjadikan perahu jenis ini sebagai ikon utamanya.\n\nMelalui riset ini, Punel Art Communication berusaha mendokumentasikan rupa, ukuran, dan cerita dari para pembuat perahu (undagi) terakhir di pesisir Muncar. Dokumentasi ini diharapkan menjadi arsip berharga bagi generasi mendatang bahwa kita pernah memiliki mahakarya maritim yang diakui ketangguhannya.', 'Tim Riset Punel', 'Riset Budaya', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800', 'Dokumentasi Punel')
ON CONFLICT DO NOTHING;

INSERT INTO public.punel_archives (title, author, year, category, pages, description, pdfUrl, allowDownload)
VALUES 
('Zine: Suara Ombak Vol. 1', 'Kolektif Pemuda Muncar', '2026', 'Zine Budaya', '28', 'Kumpulan catatan puisi, esai reflektif, dan ilustrasi karya anak muda pesisir tentang laut dan rumah.', 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf', true),
('Laporan Ekologi & Budaya Bahari Muncar', 'Divisi Riset Punel', '2025', 'Laporan Riset', '54', 'Pemetaan partisipatoris mengenai kearifan lokal nelayan dalam menjaga keseimbangan ekosistem terumbu karang dan pantai.', 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.punel_team (name, role, description, photoUrl)
VALUES 
('Budi Santoso', 'Inisiator & Peneliti', 'Fokus pada sejarah maritim dan pendokumentasian narasi lokal pesisir Muncar.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'),
('Siti Aminah', 'Kurator Seni & Arsip', 'Mengelola program edukasi seni, kurasi pameran, dan pengarsipan digital komunitas.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400')
ON CONFLICT DO NOTHING;

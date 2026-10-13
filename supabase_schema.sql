-- ==============================================================================
-- SKEMA DATABASE LENGKAP SUPABASE: PUNEL ART COMMUNICATION
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
-- ==============================================================================

ALTER TABLE public.punel_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punel_registrations ENABLE ROW LEVEL SECURITY;

-- 1. Kebijakan punel_settings
CREATE POLICY "Publik dapat membaca pengaturan" ON public.punel_settings
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin dapat mengelola pengaturan" ON public.punel_settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Kebijakan punel_agenda
CREATE POLICY "Publik dapat melihat agenda" ON public.punel_agenda
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin dapat mengelola agenda" ON public.punel_agenda
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Kebijakan punel_articles
CREATE POLICY "Publik dapat membaca artikel" ON public.punel_articles
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin dapat mengelola artikel" ON public.punel_articles
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Kebijakan punel_archives (PDF Documents)
CREATE POLICY "Publik dapat melihat & membaca arsip PDF" ON public.punel_archives
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin dapat mengelola arsip PDF" ON public.punel_archives
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Kebijakan punel_team
CREATE POLICY "Publik dapat melihat tim" ON public.punel_team
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin dapat mengelola data tim" ON public.punel_team
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Kebijakan punel_registrations
CREATE POLICY "Publik dapat mendaftarkan diri ke agenda" ON public.punel_registrations
    FOR INSERT TO anon, authenticated WITH CHECK (true);

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
CREATE POLICY "Akses publik untuk membaca dokumen arsip PDF" 
ON storage.objects FOR SELECT TO anon, authenticated 
USING (bucket_id = 'archives' OR bucket_id = 'images');

-- Kebijakan Akses Storage: Pengguna terautentikasi dapat mengunggah file
CREATE POLICY "Admin dapat mengunggah dokumen arsip PDF" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'archives' OR bucket_id = 'images');

-- ==============================================================================
-- DATA AWAL LENGKAP (SEED MOCK DATA)
-- ==============================================================================

-- Data Pengaturan Default
INSERT INTO public.punel_settings (waNumber, supportText)
VALUES ('6281234567890', 'Dukungan apresiasi Anda digunakan untuk biaya operasional riset lisan, penerbitan zine, dan pemeliharaan arsip pesisir secara independen.')
ON CONFLICT DO NOTHING;

-- Data Agenda Awal
INSERT INTO public.punel_agenda (title, date, time, location, category, description, status, posterUrl)
VALUES 
('Diskusi Pesisir: Menggali Ingatan Laut', '10 Nov 2026', '15:00', 'Sekretariat Muncar', 'Diskusi', 'Diskusi rutin membedah arsip kebudayaan bahari masyarakat Muncar dalam menghadapi perubahan iklim dan modernisasi alat tangkap.', 'open', 'https://images.unsplash.com/photo-1599827552599-eda794b159f8?auto=format&fit=crop&q=80&w=800'),
('Pameran Fotografi: Wajah & Gelombang Nelayan', '01 Des 2026', '09:00', 'Galeri Kampung Pesisir', 'Seni Rupa', 'Pameran visual mendokumentasikan keseharian, ritus keberangkatan, dan ketangguhan nelayan tradisional Selat Bali.', 'open', 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=800')
ON CONFLICT DO NOTHING;

-- Data Jurnal & Artikel Awal
INSERT INTO public.punel_articles (title, summary, content, author, category, imageUrl, imageCredit)
VALUES 
('Jejak Perahu Cungkring di Pesisir Muncar', 'Menelusuri sejarah, rancang bangun arsitektural, dan nilai filosofis perahu tradisional yang kian punah di tengah arus modernitas.', 'Perahu Cungkring bukan sekadar alat tangkap bagi nelayan Muncar masa lalu; ia adalah representasi teknologi bahari Nusantara yang memadukan estetika kurva lambung, kekuatan kayu jati pesisir, dan kearifan membaca arus Selat Bali.\n\nDalam beberapa dekade terakhir, populasi perahu Cungkring menurun drastis. Kayu hutan yang kian sulit didapat dan biaya perawatan tinggi membuat nelayan beralih ke perahu fiber mesin tempel yang lebih praktis. Namun, hilangnya Cungkring juga berisiko menghilangkan laku spiritual dan ritual sakral "Petik Laut" yang biasanya menempatkan perahu jenis ini sebagai ikon utamanya.\n\nMelalui riset lapangan dan wawancara mendalam ini, Punel Art Communication berikhtiar merekam rupa, dimensi, serta petuah dari para pembuat perahu (undagi) terakhir di pesisir Muncar. Catatan ini kami dedikasikan sebagai arsip terbuka bagi generasi masa depan.', 'Tim Riset Punel', 'Riset Budaya', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800', 'Dokumentasi Punel'),
('Merawat Larung Sesaji: Antara Syukur dan Ekologi', 'Refleksi mendalam tentang makna spiritual Petik Laut dan bagaimana masyarakat nelayan menjaga harmoni dengan ekosistem terumbu karang.', 'Setiap tahunnya, gelombang laut Muncar menyambut arak-arakan sesaji dalam ritual Petik Laut. Bagi masyarakat pesisir, laut bukanlah hamparan air tanpa jiwa yang bebas dieksploitasi, melainkan rahim kehidupan yang harus dihormati.\n\nEsai ini mengulas pergeseran paradigma ritual dari masa ke masa, serta bagaimana anak-anak muda di Muncar mulai memadukan kesadaran konservasi laut tanpa mencederai sakralitas tradisi nenek moyang.', 'Siti Aminah', 'Tradisi', 'https://images.unsplash.com/photo-1544256718-3b610a088d43?auto=format&fit=crop&q=80&w=800', 'Dokumentasi Punel')
ON CONFLICT DO NOTHING;

-- Data Arsip Dokumen PDF (Viewer & Download)
INSERT INTO public.punel_archives (title, author, year, category, pages, fileSize, description, coverUrl, pdfUrl, allowDownload)
VALUES 
('Monograf Etnografi: Kosmologi Laut Masyarakat Muncar', 'Tim Riset Punel', '2026', 'Riset Etnografi', '56 Halaman', '4.8 MB', 'Kajian komprehensif tentang ritual Petik Laut, sistem navigasi tradisional bintang nelayan Selat Bali, dan dinamika kebudayaan masyarakat pesisir Muncar.', 'https://images.unsplash.com/photo-1544256718-3b610a088d43?auto=format&fit=crop&q=80&w=800', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
('Katalog Arsip Visual: Perahu Cungkring Terakhir', 'Siti Aminah & Tim Kuratorial', '2026', 'Katalog Seni & Arsip', '72 Halaman', '12.4 MB', 'Dokumentasi fotografi cetak biru lambung perahu tradisional Cungkring, ragam hias ukir pesisir, dan transkrip undagi perahu kayu Muncar.', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
('Zine Kebudayaan Bahari: Gelombang Suara Pelabuhan Vol. 01', 'Fahmi Ayatollah & Kolaborator', '2026', 'Publikasi Zine', '32 Halaman', '3.6 MB', 'Kompilasi narasi lisan, puisi nelayan tradisional, arsip foto hitam-putih pelelangan ikan pagi, dan ilustrasi seni pesisir independen.', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true),
('Laporan Kajian: Ekologi Selat Bali & Hak Nelayan Tradisional', 'Koalisi Pesisir Berdaya', '2025', 'Riset Kebijakan', '44 Halaman', '2.9 MB', 'Laporan pemetaan wilayah tangkap nelayan skala kecil, dampak krisis iklim lokal, serta rekomendasi proteksi zonasi perikanan berkelanjutan.', 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=800', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true)
ON CONFLICT DO NOTHING;

-- Data Profil Tim Penggerak
INSERT INTO public.punel_team (name, role, description, photoUrl)
VALUES 
('Budi Santoso', 'Inisiator & Peneliti Sejarah', 'Meneliti dinamika sejarah maritim, folklore nelayan, dan pendokumentasian narasi lisan kawasan pesisir Banyuwangi.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'),
('Siti Aminah', 'Kurator Seni & Arsip Visual', 'Mengelola laboratorium arsip digital, lokakarya edukasi anak muda, dan kurasi pameran seni komunitas.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400'),
('Fahmi Ayatollah', 'Koordinator Publikasi & Media', 'Merancang publikasi zine independen, arsip web interaktif, dan komunikasi jaringan kebudayaan pesisir.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400')
ON CONFLICT DO NOTHING;

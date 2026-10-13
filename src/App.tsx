import React, { useState, useEffect } from 'react';
import { 
  Menu, X, ArrowRight, Calendar, MapPin, Clock, 
  Heart, ArrowLeft, Download, FileText, Eye, 
  BookOpen, ExternalLink, Search
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';

// --- TIPE DATA TYPESCRIPT ---
export interface Agenda {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  category: string;
  description: string;
  image: string;
}

export interface Article {
  id: string;
  title: string;
  author: string;
  date: string;
  category: string;
  summary: string;
  content: string;
  image: string;
}

export interface ArchiveDocument {
  id: string;
  title: string;
  author: string;
  year: string;
  category: string;
  pages: string;
  fileSize: string;
  description: string;
  coverUrl: string;
  pdfUrl: string;
  allowDownload?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

// --- MOCK DATA FALLBACK (EDITORIAL MARITIM MUNCAR) ---
const MOCK_AGENDAS: Agenda[] = [
  {
    id: '1',
    title: 'Diskusi Pesisir: Menggali Ingatan Laut',
    date: '10 Nov 2026',
    time: '15:00',
    location: 'Sekretariat Muncar',
    status: 'upcoming',
    category: 'Diskusi',
    description: 'Diskusi rutin membedah arsip kebudayaan bahari masyarakat Muncar dalam menghadapi perubahan iklim dan modernisasi alat tangkap.',
    image: 'https://images.unsplash.com/photo-1599827552599-eda794b159f8?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    title: 'Pameran Fotografi: Wajah & Gelombang Nelayan',
    date: '01 Des 2026',
    time: '09:00',
    location: 'Galeri Kampung Pesisir',
    status: 'upcoming',
    category: 'Seni Rupa',
    description: 'Pameran visual mendokumentasikan keseharian, ritus keberangkatan, dan ketangguhan nelayan tradisional Selat Bali.',
    image: 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=800'
  }
];

const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Jejak Perahu Cungkring di Pesisir Muncar',
    author: 'Tim Riset Punel',
    date: '01 Okt 2026',
    category: 'Riset Budaya',
    summary: 'Menelusuri sejarah, rancang bangun arsitektural, dan nilai filosofis perahu tradisional yang kian punah di tengah arus modernitas.',
    content: `Perahu Cungkring bukan sekadar alat tangkap bagi nelayan Muncar masa lalu; ia adalah representasi teknologi bahari Nusantara yang memadukan estetika kurva lambung, kekuatan kayu jati pesisir, dan kearifan membaca arus Selat Bali.\n\nDalam beberapa dekade terakhir, populasi perahu Cungkring menurun drastis. Kayu hutan yang kian sulit didapat dan biaya perawatan tinggi membuat nelayan beralih ke perahu fiber mesin tempel yang lebih praktis. Namun, hilangnya Cungkring juga berisiko menghilangkan laku spiritual dan ritual sakral "Petik Laut" yang biasanya menempatkan perahu jenis ini sebagai ikon utamanya.\n\nMelalui riset lapangan dan wawancara mendalam ini, Punel Art Communication berikhtiar merekam rupa, dimensi, serta petuah dari para pembuat perahu (undagi) terakhir di pesisir Muncar. Catatan ini kami dedikasikan sebagai arsip terbuka bagi generasi masa depan.`,
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    title: 'Merawat Larung Sesaji: Antara Syukur dan Ekologi',
    author: 'Siti Aminah',
    date: '08 Okt 2026',
    category: 'Tradisi',
    summary: 'Refleksi mendalam tentang makna spiritual Petik Laut dan bagaimana masyarakat nelayan menjaga harmoni dengan ekosistem terumbu karang.',
    content: `Setiap tahunnya, gelombang laut Muncar menyambut arak-arakan sesaji dalam ritual Petik Laut. Bagi masyarakat pesisir, laut bukanlah hamparan air tanpa jiwa yang bebas dieksploitasi, melainkan rahim kehidupan yang harus dihormati.\n\nEsai ini mengulas pergeseran paradigma ritual dari masa ke masa, serta bagaimana anak-anak muda di Muncar mulai memadukan kesadaran konservasi laut tanpa mencederai sakralitas tradisi nenek moyang.`,
    image: 'https://images.unsplash.com/photo-1544256718-3b610a088d43?auto=format&fit=crop&q=80&w=800'
  }
];

const MOCK_ARCHIVES: ArchiveDocument[] = [
  {
    id: '1',
    title: 'Monograf Etnografi: Kosmologi Laut Masyarakat Muncar',
    author: 'Tim Riset Punel',
    year: '2026',
    category: 'Riset Etnografi',
    pages: '56 Halaman',
    fileSize: '4.8 MB',
    description: 'Kajian komprehensif tentang ritual Petik Laut, sistem navigasi tradisional bintang nelayan Selat Bali, dan dinamika kebudayaan masyarakat pesisir Muncar.',
    coverUrl: 'https://images.unsplash.com/photo-1544256718-3b610a088d43?auto=format&fit=crop&q=80&w=800',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    allowDownload: true
  },
  {
    id: '2',
    title: 'Katalog Arsip Visual: Perahu Cungkring Terakhir',
    author: 'Siti Aminah & Tim Kuratorial',
    year: '2026',
    category: 'Katalog Seni & Arsip',
    pages: '72 Halaman',
    fileSize: '12.4 MB',
    description: 'Dokumentasi fotografi cetak biru lambung perahu tradisional Cungkring, ragam hias ukir pesisir, dan transkrip undagi perahu kayu Muncar.',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    allowDownload: true
  },
  {
    id: '3',
    title: 'Zine Kebudayaan Bahari: Gelombang Suara Pelabuhan Vol. 01',
    author: 'Fahmi Ayatollah & Kolaborator',
    year: '2026',
    category: 'Publikasi Zine',
    pages: '32 Halaman',
    fileSize: '3.6 MB',
    description: 'Kompilasi narasi lisan, puisi nelayan tradisional, arsip foto hitam-putih pelelangan ikan pagi, dan ilustrasi seni pesisir independen.',
    coverUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    allowDownload: true
  },
  {
    id: '4',
    title: 'Laporan Kajian: Ekologi Selat Bali & Hak Nelayan Tradisional',
    author: 'Koalisi Pesisir Berdaya',
    year: '2025',
    category: 'Riset Kebijakan',
    pages: '44 Halaman',
    fileSize: '2.9 MB',
    description: 'Laporan pemetaan wilayah tangkap nelayan skala kecil, dampak krisis iklim lokal, serta rekomendasi proteksi zonasi perikanan berkelanjutan.',
    coverUrl: 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=800',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    allowDownload: true
  }
];

const MOCK_TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Budi Santoso',
    role: 'Inisiator & Peneliti Sejarah',
    bio: 'Meneliti dinamika sejarah maritim, folklore nelayan, dan pendokumentasian narasi lisan kawasan pesisir Banyuwangi.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '2',
    name: 'Siti Aminah',
    role: 'Kurator Seni & Arsip Visual',
    bio: 'Mengelola laboratorium arsip digital, lokakarya edukasi anak muda, dan kurasi pameran seni komunitas.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '3',
    name: 'Fahmi Ayatollah',
    role: 'Koordinator Publikasi & Media',
    bio: 'Merancang publikasi zine independen, arsip web interaktif, dan komunikasi jaringan kebudayaan pesisir.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
  }
];

// --- KOMPONEN IKON BRAND SOSIAL MEDIA (SVG MURNI) ---
const FacebookIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);

// --- KOMPONEN UI DASAR DESIGN SYSTEM MODERN ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'accent' | 'ghost';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = "px-6 py-3 rounded-full font-heading font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer";
  const variants = {
    primary: "bg-sky-600 text-white hover:bg-sky-700 hover:shadow-lg hover:shadow-sky-500/30",
    outline: "bg-white text-slate-800 border-2 border-slate-200 hover:border-sky-600 hover:text-sky-600 hover:shadow-md",
    accent: "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30",
    ghost: "text-sky-600 hover:bg-sky-50"
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const SectionHeader = ({ title, subtitle, align = 'left' }: { title: string; subtitle?: string; align?: 'left' | 'center' }) => (
  <div className={`mb-14 ${align === 'center' ? 'text-center' : ''}`}>
    <h2 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight text-slate-900 leading-tight">
      {title}
    </h2>
    {subtitle && (
      <p className={`text-base md:text-lg text-slate-500 max-w-2xl mt-3 font-sans leading-relaxed ${align === 'center' ? 'mx-auto' : ''}`}>
        {subtitle}
      </p>
    )}
    <div className={`w-20 h-1.5 bg-orange-500 rounded-full mt-6 ${align === 'center' ? 'mx-auto' : ''}`}></div>
  </div>
);

const Card = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div 
    onClick={onClick} 
    className={`bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 transition-all duration-300 ${
      onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : ''
    } ${className}`}
  >
    {children}
  </div>
);

const Badge = ({ children, variant = 'sky' }: { children: React.ReactNode; variant?: 'sky' | 'orange' | 'slate' }) => {
  const styles = {
    sky: 'bg-sky-50 text-sky-700 border border-sky-100',
    orange: 'bg-orange-50 text-orange-700 border border-orange-100',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200'
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-heading font-bold uppercase tracking-wider ${styles[variant]}`}>
      {children}
    </span>
  );
};

// --- APLIKASI UTAMA PUNEL ART COMMUNICATION ---
export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'agenda' | 'archives' | 'articles' | 'team' | 'admin'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data State
  const [agendas, setAgendas] = useState<Agenda[]>(MOCK_AGENDAS);
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
  const [archives, setArchives] = useState<ArchiveDocument[]>(MOCK_ARCHIVES);
  const [team, setTeam] = useState<TeamMember[]>(MOCK_TEAM);

  // Filter & Search State untuk Arsip Dokumen
  const [archiveCategory, setArchiveCategory] = useState<string>('Semua');
  const [archiveSearch, setArchiveSearch] = useState<string>('');

  // Modal State
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<ArchiveDocument | null>(null);
  const [registerItem, setRegisterItem] = useState<{ title: string; type: 'agenda'; price?: string | number } | null>(null);
  const [isSawerOpen, setIsSawerOpen] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Form State Registrasi Pop-up
  const [regForm, setRegForm] = useState({ name: '', phone: '', email: '', note: '' });
  const [regSubmitted, setRegSubmitted] = useState(false);

  // Admin Dashboard State
  const [adminType, setAdminType] = useState<'agenda' | 'archive' | 'article'>('archive');
  const [adminFormData, setAdminFormData] = useState<any>({});
  const [adminMessage, setAdminMessage] = useState<string | null>(null);

  // 1. Fetching Data (Supabase dengan Mock Fallback)
  useEffect(() => {
    async function fetchData() {
      if (isSupabaseConfigured && supabase) {
        try {
          const [agendasRes, articlesRes, archivesRes, teamRes] = await Promise.all([
            supabase.from('punel_agenda').select('*').order('date', { ascending: true }),
            supabase.from('punel_articles').select('*').order('createdAt', { ascending: false }),
            supabase.from('punel_archives').select('*').order('createdAt', { ascending: false }),
            supabase.from('punel_team').select('*')
          ]);

          if (agendasRes.data && agendasRes.data.length > 0) {
            setAgendas(agendasRes.data.map(item => ({
              id: item.id,
              title: item.title,
              date: item.date || '',
              time: item.time || '',
              location: item.location || '',
              status: item.status || 'upcoming',
              category: item.category || 'Umum',
              description: item.description || '',
              image: item.posterUrl || 'https://images.unsplash.com/photo-1599827552599-eda794b159f8?auto=format&fit=crop&q=80&w=800'
            })));
          }

          if (articlesRes.data && articlesRes.data.length > 0) {
            setArticles(articlesRes.data.map(item => ({
              id: item.id,
              title: item.title,
              author: item.author || 'Punel Team',
              date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
              category: item.category || 'Catatan Budaya',
              summary: item.summary || '',
              content: item.content || '',
              image: item.imageUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800'
            })));
          }

          if (archivesRes.data && archivesRes.data.length > 0) {
            setArchives(archivesRes.data.map(item => ({
              id: item.id,
              title: item.title,
              author: item.author || 'Tim Punel',
              year: item.year || '2026',
              category: item.category || 'Arsip Digital',
              pages: item.pages || 'Dokumen PDF',
              fileSize: item.fileSize || 'Unduh PDF',
              description: item.description || '',
              coverUrl: item.coverUrl || 'https://images.unsplash.com/photo-1544256718-3b610a088d43?auto=format&fit=crop&q=80&w=800',
              pdfUrl: item.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              allowDownload: item.allowDownload !== false
            })));
          }

          if (teamRes.data && teamRes.data.length > 0) {
            setTeam(teamRes.data.map(item => ({
              id: item.id,
              name: item.name,
              role: item.role || 'Anggota Kolektif',
              bio: item.description || '',
              image: item.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'
            })));
          }
        } catch (err) {
          console.warn('Gagal memuat data dari Supabase, beralih ke Mock Data:', err);
        }
      }
    }
    fetchData();
  }, []);

  // Handler Download File PDF
  const handleDownload = (doc: ArchiveDocument) => {
    try {
      const link = document.createElement('a');
      link.href = doc.pdfUrl;
      link.target = '_blank';
      link.setAttribute('download', `${doc.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadNotice(`Sedang mengunduh "${doc.title}"...`);
      setTimeout(() => setDownloadNotice(null), 3500);
    } catch (err) {
      window.open(doc.pdfUrl, '_blank');
    }
  };

  // Handler Kirim Registrasi ke WhatsApp & Simpan
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name || !regForm.phone) {
      alert('Nama dan Nomor WhatsApp wajib diisi.');
      return;
    }

    if (isSupabaseConfigured && supabase && registerItem) {
      try {
        await supabase.from('punel_registrations').insert([{
          eventTitle: registerItem.title,
          name: regForm.name,
          phone: regForm.phone,
          email: regForm.email,
          notes: regForm.note
        }]);
      } catch (err) {
        console.error('Gagal mencatat registrasi ke Supabase:', err);
      }
    }

    const message = `Halo Punel Art Communication, saya ingin mendaftar untuk:\n\n*${registerItem?.title}* (Agenda Pesisir)\n\nNama: ${regForm.name}\nWhatsApp: ${regForm.phone}\nEmail: ${regForm.email || '-'}\nCatatan: ${regForm.note || '-'}`;
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    
    setRegSubmitted(true);
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setRegSubmitted(false);
      setRegisterItem(null);
      setRegForm({ name: '', phone: '', email: '', note: '' });
    }, 1200);
  };

  // Handler Submit Tambah Konten Admin
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminMessage(null);

    if (isSupabaseConfigured && supabase) {
      try {
        if (adminType === 'archive') {
          const payload = {
            title: adminFormData.title,
            author: adminFormData.author || 'Tim Punel',
            year: adminFormData.year || new Date().getFullYear().toString(),
            category: adminFormData.category || 'Riset Etnografi',
            pages: adminFormData.pages || '30 Halaman',
            description: adminFormData.description || '',
            coverUrl: adminFormData.coverUrl || 'https://images.unsplash.com/photo-1544256718-3b610a088d43?auto=format&fit=crop&q=80&w=800',
            pdfUrl: adminFormData.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            allowDownload: true
          };
          const { error } = await supabase.from('punel_archives').insert([payload]);
          if (error) throw error;
        } else if (adminType === 'agenda') {
          const payload = {
            title: adminFormData.title,
            date: adminFormData.date,
            time: adminFormData.time || '15:00',
            location: adminFormData.location,
            category: adminFormData.category || 'Diskusi',
            description: adminFormData.description,
            posterUrl: adminFormData.image
          };
          const { error } = await supabase.from('punel_agenda').insert([payload]);
          if (error) throw error;
        } else {
          const payload = {
            title: adminFormData.title,
            author: adminFormData.author,
            category: adminFormData.category,
            summary: adminFormData.summary || adminFormData.content?.slice(0, 140) + '...',
            content: adminFormData.content,
            imageUrl: adminFormData.image
          };
          const { error } = await supabase.from('punel_articles').insert([payload]);
          if (error) throw error;
        }
        setAdminMessage('Konten berhasil diterbitkan ke database Supabase!');
      } catch (err: any) {
        setAdminMessage(`Gagal menerbitkan ke Supabase: ${err.message}`);
      }
    } else {
      // Mock Fallback
      if (adminType === 'archive') {
        const newDoc: ArchiveDocument = {
          id: String(Date.now()),
          title: adminFormData.title || 'Dokumen Baru',
          author: adminFormData.author || 'Tim Riset',
          year: adminFormData.year || '2026',
          category: adminFormData.category || 'Riset Budaya',
          pages: adminFormData.pages || '40 Halaman',
          fileSize: adminFormData.fileSize || '5.0 MB',
          description: adminFormData.description || 'Deskripsi dokumen...',
          coverUrl: adminFormData.coverUrl || 'https://images.unsplash.com/photo-1544256718-3b610a088d43?auto=format&fit=crop&q=80&w=800',
          pdfUrl: adminFormData.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          allowDownload: true
        };
        setArchives(prev => [newDoc, ...prev]);
      } else if (adminType === 'agenda') {
        setAgendas(prev => [{ ...adminFormData, id: String(Date.now()) }, ...prev]);
      } else {
        setArticles(prev => [{ ...adminFormData, id: String(Date.now()) }, ...prev]);
      }
      setAdminMessage('Berhasil ditambahkan ke daftar pratinjau lokal (Mock Mode)!');
    }
    setAdminFormData({});
  };

  // Filtered Archives
  const filteredArchives = archives.filter(item => {
    const matchCat = archiveCategory === 'Semua' || item.category.toLowerCase().includes(archiveCategory.toLowerCase());
    const matchSearch = archiveSearch === '' || 
      item.title.toLowerCase().includes(archiveSearch.toLowerCase()) || 
      item.author.toLowerCase().includes(archiveSearch.toLowerCase()) || 
      item.description.toLowerCase().includes(archiveSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-orange-500 selection:text-white flex flex-col">
      {/* --- NOTIFIKASI TOAST DOWNLOAD --- */}
      {downloadNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Download className="w-5 h-5 text-orange-400 animate-bounce" />
          <span className="text-xs font-heading font-semibold">{downloadNotice}</span>
        </div>
      )}

      {/* --- NAVBAR MODERN EDITORIAL --- */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            onClick={() => { setActiveTab('home'); setSelectedArticle(null); setSelectedPdf(null); }} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-sky-600 flex items-center justify-center text-white font-heading font-extrabold text-xl shadow-md group-hover:bg-sky-700 transition-colors">
              P
            </div>
            <div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors block">
                Punel Art
              </span>
              <span className="text-[11px] font-heading font-bold text-orange-500 tracking-widest uppercase block -mt-1">
                Communication
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 font-heading text-sm font-semibold text-slate-600">
            <button 
              onClick={() => { setActiveTab('home'); setSelectedArticle(null); setSelectedPdf(null); }} 
              className={`transition-colors py-1 ${activeTab === 'home' && !selectedArticle ? 'text-sky-600 font-bold border-b-2 border-sky-600' : 'hover:text-sky-600'}`}
            >
              Beranda
            </button>
            <button 
              onClick={() => { setActiveTab('agenda'); setSelectedArticle(null); setSelectedPdf(null); }} 
              className={`transition-colors py-1 ${activeTab === 'agenda' ? 'text-sky-600 font-bold border-b-2 border-sky-600' : 'hover:text-sky-600'}`}
            >
              Agenda
            </button>
            <button 
              onClick={() => { setActiveTab('archives'); setSelectedArticle(null); setSelectedPdf(null); }} 
              className={`transition-colors py-1 flex items-center gap-1.5 ${activeTab === 'archives' ? 'text-sky-600 font-bold border-b-2 border-sky-600' : 'hover:text-sky-600'}`}
            >
              <FileText className="w-4 h-4" />
              <span>Arsip Dokumen PDF</span>
            </button>
            <button 
              onClick={() => { setActiveTab('articles'); setSelectedArticle(null); setSelectedPdf(null); }} 
              className={`transition-colors py-1 ${activeTab === 'articles' ? 'text-sky-600 font-bold border-b-2 border-sky-600' : 'hover:text-sky-600'}`}
            >
              Jurnal & Esai
            </button>
            <button 
              onClick={() => { setActiveTab('team'); setSelectedArticle(null); setSelectedPdf(null); }} 
              className={`transition-colors py-1 ${activeTab === 'team' ? 'text-sky-600 font-bold border-b-2 border-sky-600' : 'hover:text-sky-600'}`}
            >
              Tentang Kami
            </button>
            <button 
              onClick={() => { setActiveTab('admin'); setSelectedArticle(null); setSelectedPdf(null); }} 
              className={`transition-colors py-1 ${activeTab === 'admin' ? 'text-sky-600 font-bold border-b-2 border-sky-600' : 'hover:text-sky-600'}`}
            >
              Admin
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="accent" onClick={() => setIsSawerOpen(true)}>
              <Heart className="w-4 h-4 fill-white" />
              <span>Sawer / Donasi</span>
            </Button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={() => setIsSawerOpen(true)} 
              className="p-2 text-orange-500 rounded-full hover:bg-orange-50"
              title="Donasi"
            >
              <Heart className="w-6 h-6 fill-orange-500" />
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 font-heading font-semibold text-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
            <button 
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); setSelectedArticle(null); setSelectedPdf(null); }} 
              className="block w-full text-left py-2 hover:text-sky-600"
            >
              Beranda
            </button>
            <button 
              onClick={() => { setActiveTab('agenda'); setMobileMenuOpen(false); setSelectedArticle(null); setSelectedPdf(null); }} 
              className="block w-full text-left py-2 hover:text-sky-600"
            >
              Agenda
            </button>
            <button 
              onClick={() => { setActiveTab('archives'); setMobileMenuOpen(false); setSelectedArticle(null); setSelectedPdf(null); }} 
              className="block w-full text-left py-2 text-sky-600 font-bold flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Arsip Dokumen PDF
            </button>
            <button 
              onClick={() => { setActiveTab('articles'); setMobileMenuOpen(false); setSelectedArticle(null); setSelectedPdf(null); }} 
              className="block w-full text-left py-2 hover:text-sky-600"
            >
              Jurnal & Esai
            </button>
            <button 
              onClick={() => { setActiveTab('team'); setMobileMenuOpen(false); setSelectedArticle(null); setSelectedPdf(null); }} 
              className="block w-full text-left py-2 hover:text-sky-600"
            >
              Tentang Kami
            </button>
            <button 
              onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); setSelectedArticle(null); setSelectedPdf(null); }} 
              className="block w-full text-left py-2 hover:text-sky-600"
            >
              Kelola Konten (Admin)
            </button>
          </div>
        )}
      </nav>

      {/* --- KONTEN HALAMAN --- */}
      <main className="flex-1">
        {/* TAMPILAN ARTIKEL TUNGGAL (EDITORIAL READER) */}
        {selectedArticle ? (
          <div className="py-20 max-w-4xl mx-auto px-6">
            <button 
              onClick={() => setSelectedArticle(null)}
              className="mb-8 inline-flex items-center gap-2 text-sm font-heading font-bold text-sky-600 hover:text-sky-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Arsip
            </button>
            <div className="bg-white rounded-3xl p-8 md:p-14 shadow-sm border border-slate-100">
              <Badge variant="sky">{selectedArticle.category}</Badge>
              <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-slate-900 mt-6 leading-tight">
                {selectedArticle.title}
              </h1>
              <div className="flex items-center gap-4 text-xs font-heading font-semibold text-slate-500 my-6 pb-6 border-b border-slate-100">
                <span>Oleh: <strong className="text-slate-800">{selectedArticle.author}</strong></span>
                <span>•</span>
                <span>{selectedArticle.date}</span>
              </div>
              <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden mb-10 shadow-inner">
                <img 
                  src={selectedArticle.image} 
                  alt={selectedArticle.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="prose prose-slate max-w-none text-slate-700 text-lg leading-relaxed space-y-6 whitespace-pre-line font-sans">
                {selectedArticle.content}
              </div>
              <div className="mt-14 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-500 font-heading">
                  Dibagikan oleh Punel Art Communication — Laboratorium Arsip Kebudayaan Muncar
                </p>
                <Button variant="accent" onClick={() => setIsSawerOpen(true)}>
                  <Heart className="w-4 h-4 fill-white" />
                  Dukung Riset Ini
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 1. BERANDA (HOME) */}
            {activeTab === 'home' && (
              <div>
                {/* HERO SECTION EDITORIAL */}
                <section className="relative overflow-hidden py-24 md:py-32 bg-gradient-to-b from-sky-50/70 via-slate-50 to-slate-50">
                  <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
                    <div className="md:col-span-7 space-y-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100/80 text-sky-700 text-xs font-heading font-bold uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse"></span>
                        Kolektif Seni & Kebudayaan Bahari Muncar
                      </div>
                      <h1 className="text-4xl md:text-6xl font-heading font-extrabold text-slate-900 leading-[1.12] tracking-tight">
                        Merawat Ingatan Pesisir Lewat <span className="text-sky-600">Seni</span>, <span className="text-orange-500">Komunikasi</span> & <span className="text-slate-900">Aksi</span>.
                      </h1>
                      <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-sans max-w-xl">
                        Ruang temu pegiat budaya, seniman, dan masyarakat bahari dalam mendokumentasikan tradisi lokal, menerbitkan monograf riset, serta membuka akses arsip pengetahuan secara gratis.
                      </p>
                      <div className="flex flex-wrap items-center gap-4 pt-4">
                        <Button variant="primary" onClick={() => setActiveTab('archives')}>
                          <BookOpen className="w-4 h-4" />
                          Akses Portal Arsip PDF
                        </Button>
                        <Button variant="outline" onClick={() => setActiveTab('agenda')}>
                          Eksplorasi Agenda <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="md:col-span-5 relative">
                      <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-1 hover:rotate-0 transition-transform duration-500">
                        <img 
                          src="https://images.unsplash.com/photo-1544256718-3b610a088d43?auto=format&fit=crop&q=80&w=1000" 
                          alt="Pelabuhan Muncar" 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                      <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 hidden sm:block max-w-xs">
                        <p className="text-xs font-heading font-bold text-sky-600 uppercase tracking-wider">Portal Arsip Terbuka</p>
                        <p className="text-sm font-heading font-bold text-slate-800 mt-1">
                          "Semua publikasi, zine, dan monograf riset dapat dibaca daring dan diunduh bebas."
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* HIGHLIGHT PUBLIKASI & ARSIP DOKUMEN PDF TERBARU */}
                <section className="py-24 max-w-7xl mx-auto px-6">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
                    <SectionHeader 
                      title="Publikasi & Arsip PDF Pilihan" 
                      subtitle="Dokumen etnografi, katalog visual perahu tradisional, dan zine independen yang siap dibaca serta diunduh." 
                    />
                    <Button variant="ghost" onClick={() => setActiveTab('archives')} className="mb-14">
                      Buka Semua Arsip PDF <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {archives.slice(0, 2).map((doc) => (
                      <Card key={doc.id} className="flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div>
                          <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-6 bg-slate-100 relative">
                            <img 
                              src={doc.coverUrl} 
                              alt={doc.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute top-4 left-4">
                              <Badge variant="sky">{doc.category}</Badge>
                            </div>
                            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-heading font-bold text-slate-800 shadow-md">
                              {doc.year}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs font-heading font-semibold text-slate-500 mb-2">
                            <span>Oleh: <strong className="text-slate-700">{doc.author}</strong></span>
                            <span>•</span>
                            <span>{doc.pages}</span>
                            <span>•</span>
                            <span className="text-orange-600 font-bold">{doc.fileSize}</span>
                          </div>
                          <h3 className="text-2xl font-heading font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                            {doc.title}
                          </h3>
                          <p className="text-slate-600 mt-3 text-sm leading-relaxed line-clamp-2">
                            {doc.description}
                          </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-3">
                          <Button 
                            variant="primary" 
                            onClick={() => setSelectedPdf(doc)}
                            className="!px-4 !py-2.5 text-xs"
                          >
                            <Eye className="w-4 h-4" /> Baca PDF
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleDownload(doc)}
                            className="!px-4 !py-2.5 text-xs !border-orange-200 text-orange-600 hover:!border-orange-500 hover:!bg-orange-50"
                          >
                            <Download className="w-4 h-4" /> Unduh File
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>

                {/* HIGHLIGHT AGENDA TERDEKAT */}
                <section className="py-24 bg-white border-y border-slate-100">
                  <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
                      <SectionHeader 
                        title="Agenda & Ruang Dialog" 
                        subtitle="Program publik, temu wicara, lokakarya arsip, dan pameran visual komunitas pesisir." 
                      />
                      <Button variant="ghost" onClick={() => setActiveTab('agenda')} className="mb-14">
                        Lihat Semua Agenda <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      {agendas.slice(0, 2).map((item) => (
                        <Card key={item.id} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                          <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-6 bg-slate-100 relative">
                            <img 
                              src={item.image} 
                              alt={item.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute top-4 left-4">
                              <Badge variant="orange">{item.category}</Badge>
                            </div>
                          </div>
                          <h3 className="text-2xl font-heading font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-slate-600 mt-3 text-sm leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-heading font-semibold text-slate-500 mt-6 pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-sky-600" /> {item.date}</div>
                            <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-sky-600" /> {item.time} WIB</div>
                            <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-sky-600" /> {item.location}</div>
                          </div>
                          <div className="mt-6">
                            <Button 
                              variant="primary" 
                              className="w-full"
                              onClick={() => setRegisterItem({ title: item.title, type: 'agenda' })}
                            >
                              Daftar Hadir via WhatsApp
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </section>

                {/* TIM KOLEKTIF PREVIEW */}
                <section className="py-24 max-w-7xl mx-auto px-6">
                  <SectionHeader 
                    title="Orang di Balik Layar" 
                    subtitle="Penggerak kolektif yang berdedikasi merawat ruang temu dan arsip kebudayaan pesisir." 
                    align="center"
                  />
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {team.map((m) => (
                      <div key={m.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center hover:shadow-lg transition-all duration-300">
                        <div className="w-28 h-28 mx-auto rounded-full overflow-hidden mb-5 border-4 border-sky-50 shadow-inner">
                          <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="text-lg font-heading font-bold text-slate-900">{m.name}</h4>
                        <p className="text-xs font-heading font-semibold text-orange-500 mt-1 uppercase tracking-wider">{m.role}</p>
                        <p className="text-xs text-slate-500 mt-3 leading-relaxed">{m.bio}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* 2. AGENDA LENGKAP */}
            {activeTab === 'agenda' && (
              <div className="py-24 max-w-7xl mx-auto px-6">
                <SectionHeader 
                  title="Kalender Agenda & Kegiatan" 
                  subtitle="Temukan ruang kolaborasi, pameran visual, dan lingkaran diskusi berkala kami di Muncar." 
                />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {agendas.map((item) => (
                    <Card key={item.id} className="flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div>
                        <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-5 bg-slate-100 relative">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-3 left-3">
                            <Badge variant="orange">{item.category}</Badge>
                          </div>
                        </div>
                        <h3 className="text-xl font-heading font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-slate-600 mt-2 text-sm leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      </div>
                      <div>
                        <div className="space-y-1 text-xs font-heading font-semibold text-slate-500 my-6 pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-sky-600" /> {item.date}</div>
                          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-sky-600" /> {item.time} WIB</div>
                          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-sky-600" /> {item.location}</div>
                        </div>
                        <Button 
                          variant="primary" 
                          className="w-full"
                          onClick={() => setRegisterItem({ title: item.title, type: 'agenda' })}
                        >
                          Daftar Sekarang
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 3. PORTAL ARSIP & PUBLIKASI DOKUMEN PDF (MENGGANTIKAN KELAS & PELATIHAN) */}
            {activeTab === 'archives' && (
              <div className="py-24 max-w-7xl mx-auto px-6">
                <SectionHeader 
                  title="Portal Arsip Dokumen & Publikasi PDF" 
                  subtitle="Laboratorium publikasi independen Punel Art Communication: monograf etnografi, cetak biru perahu, zine sastra, dan laporan ekologi laut yang dapat dibaca daring maupun diunduh bebas." 
                />

                {/* FILTER DAN SEARCH BAR */}
                <div className="mb-12 flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  {/* Category Pills */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {['Semua', 'Riset Etnografi', 'Katalog Seni', 'Publikasi Zine', 'Riset Kebijakan'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setArchiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-xs font-heading font-bold transition-all duration-200 cursor-pointer ${
                          archiveCategory === cat 
                            ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      value={archiveSearch}
                      onChange={(e) => setArchiveSearch(e.target.value)}
                      placeholder="Cari arsip, penulis, topik..."
                      className="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
                    />
                    {archiveSearch && (
                      <button 
                        onClick={() => setArchiveSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* GRID DOKUMEN ARSIP */}
                {filteredArchives.length === 0 ? (
                  <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 p-8">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="text-lg font-heading font-bold text-slate-700">Tidak ada dokumen ditemukan</h4>
                    <p className="text-xs text-slate-500 mt-1">Coba gunakan kata kunci pencarian atau kategori lain.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {filteredArchives.map((doc) => (
                      <Card key={doc.id} className="flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div>
                          <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-6 bg-slate-100 relative">
                            <img 
                              src={doc.coverUrl} 
                              alt={doc.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute top-4 left-4">
                              <Badge variant="sky">{doc.category}</Badge>
                            </div>
                            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-heading font-bold text-slate-800 shadow-md">
                              {doc.year}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs font-heading font-semibold text-slate-500 mb-2">
                            <span>Oleh: <strong className="text-slate-800">{doc.author}</strong></span>
                            <span>•</span>
                            <span>{doc.pages}</span>
                            <span>•</span>
                            <span className="text-orange-600 font-bold">{doc.fileSize}</span>
                          </div>

                          <h3 className="text-2xl font-heading font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug">
                            {doc.title}
                          </h3>

                          <p className="text-slate-600 mt-3 text-sm leading-relaxed">
                            {doc.description}
                          </p>
                        </div>

                        {/* TOMBOL AKSI DOKUMEN: BACA & UNDUH */}
                        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                          <Button 
                            variant="primary" 
                            className="w-full sm:flex-1 !py-3"
                            onClick={() => setSelectedPdf(doc)}
                          >
                            <Eye className="w-4 h-4" />
                            <span>Baca Dokumen PDF</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full sm:w-auto !py-3 !border-orange-200 text-orange-600 hover:!border-orange-500 hover:!bg-orange-50"
                            onClick={() => handleDownload(doc)}
                            title="Unduh File PDF ke Perangkat Anda"
                          >
                            <Download className="w-4 h-4" />
                            <span>Unduh ({doc.fileSize})</span>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. JURNAL & ARSIP (ARTIKEL) */}
            {activeTab === 'articles' && (
              <div className="py-24 max-w-7xl mx-auto px-6">
                <SectionHeader 
                  title="Jurnal, Esai & Catatan Lapangan" 
                  subtitle="Hasil pengamatan etnografi, rekaman lisan nelayan, dan catatan kritis kolektif Punel Art Communication." 
                />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {articles.map((art) => (
                    <Card 
                      key={art.id} 
                      onClick={() => setSelectedArticle(art)}
                      className="flex flex-col justify-between group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div>
                        <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-5 bg-slate-100 relative">
                          <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-3 left-3">
                            <Badge variant="sky">{art.category}</Badge>
                          </div>
                        </div>
                        <div className="text-xs font-heading font-semibold text-slate-400 mb-2">
                          {art.date} • {art.author}
                        </div>
                        <h3 className="text-xl font-heading font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug">
                          {art.title}
                        </h3>
                        <p className="text-slate-600 mt-2 text-sm leading-relaxed line-clamp-3">
                          {art.summary}
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-heading font-bold text-sky-600">
                        <span>Baca Arsip</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 5. TENTANG KAMI & PROFIL TIM */}
            {activeTab === 'team' && (
              <div className="py-24 max-w-7xl mx-auto px-6">
                <div className="max-w-3xl mb-16">
                  <Badge variant="sky">Tentang Kolektif</Badge>
                  <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-slate-900 mt-4 leading-tight">
                    Menjaga Denyut Kebudayaan Pesisir di Ujung Timur Jawa
                  </h2>
                  <p className="text-slate-600 mt-6 text-base md:text-lg leading-relaxed font-sans">
                    <strong>Punel Art Communication</strong> didirikan sebagai wadah independen yang berakar di Muncar, Banyuwangi. Kami percaya bahwa pesisir bukan sekadar ruang geografis pelabuhan, melainkan lumbung pengetahuan bahari, ekspresi estetika perahu, dan etika gotong royong yang memerlukan medium pengarsipan modern.
                  </p>
                </div>

                <div className="bg-sky-600 rounded-3xl p-8 md:p-12 text-white mb-20 shadow-xl shadow-sky-600/10">
                  <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
                    <div>
                      <h4 className="text-2xl font-heading font-extrabold text-white">Seni</h4>
                      <p className="text-sky-100 text-sm mt-2 leading-relaxed">
                        Mengeksplorasi bahasa visual, fotografi, dan instalasi yang membumi pada narasi kehidupan maritim.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-2xl font-heading font-extrabold text-orange-400">Komunikasi</h4>
                      <p className="text-sky-100 text-sm mt-2 leading-relaxed">
                        Menjembatani pengetahuan lisan para sesepuh nelayan dengan publikasi daring dan arsip dokumen PDF terbuka.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-2xl font-heading font-extrabold text-white">Aksi</h4>
                      <p className="text-sky-100 text-sm mt-2 leading-relaxed">
                        Menginisiasi lokakarya, pendampingan kampung pesisir, dan kepedulian terhadap kelestarian ekologi laut.
                      </p>
                    </div>
                  </div>
                </div>

                <SectionHeader 
                  title="Struktur & Penggerak Kolektif" 
                  subtitle="Individu yang mendedikasikan waktu dan gagasan untuk keberlanjutan program Punel Art Communication." 
                />
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
                  {team.map((member) => (
                    <Card key={member.id} className="text-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-slate-50 shadow-md">
                        <img 
                          src={member.image} 
                          alt={member.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                      <h3 className="text-xl font-heading font-bold text-slate-900">{member.name}</h3>
                      <p className="text-xs font-heading font-bold text-orange-500 mt-1 uppercase tracking-wider">{member.role}</p>
                      <p className="text-slate-500 text-sm mt-4 leading-relaxed font-sans">{member.bio}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 6. ADMIN DASHBOARD */}
            {activeTab === 'admin' && (
              <div className="py-24 max-w-4xl mx-auto px-6">
                <SectionHeader 
                  title="Pusat Penerbitan Konten" 
                  subtitle={isSupabaseConfigured 
                    ? "Tersambung langsung dengan Supabase PostgreSQL Database (punel_archives, punel_agenda, punel_articles)." 
                    : "Mode Simulasi Aktif — Variabel VITE_SUPABASE_URL belum terpasang. Data baru akan masuk ke pratinjau lokal."
                  } 
                />

                <div className="flex flex-wrap gap-3 mb-8">
                  {(['archive', 'agenda', 'article'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => { setAdminType(type); setAdminFormData({}); setAdminMessage(null); }}
                      className={`px-5 py-2.5 rounded-full font-heading font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        adminType === type 
                          ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30' 
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      + Tambah {type === 'archive' ? 'Arsip Dokumen PDF' : type === 'agenda' ? 'Agenda' : 'Artikel'}
                    </button>
                  ))}
                </div>

                {adminMessage && (
                  <div className="mb-6 p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800 text-sm font-heading font-semibold">
                    {adminMessage}
                  </div>
                )}

                <Card>
                  <form onSubmit={handleAdminSubmit} className="space-y-6">
                    <div>
                      <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-2">
                        {adminType === 'archive' ? 'Judul Dokumen / Monograf PDF' : 'Judul Konten'}
                      </label>
                      <input 
                        type="text" 
                        required
                        value={adminFormData.title || ''}
                        onChange={(e) => setAdminFormData({ ...adminFormData, title: e.target.value })}
                        placeholder={adminType === 'archive' ? 'Contoh: Monograf Etnografi: Kosmologi Laut Muncar' : 'Masukkan judul...'} 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans text-sm"
                      />
                    </div>

                    {adminType === 'archive' ? (
                      <>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-2">Penulis / Kurator</label>
                            <input 
                              type="text" 
                              required
                              value={adminFormData.author || ''}
                              onChange={(e) => setAdminFormData({ ...adminFormData, author: e.target.value })}
                              placeholder="Nama Penulis" 
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-2">Kategori Arsip</label>
                            <input 
                              type="text" 
                              required
                              value={adminFormData.category || ''}
                              onChange={(e) => setAdminFormData({ ...adminFormData, category: e.target.value })}
                              placeholder="Riset Etnografi / Katalog Seni / Zine" 
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-2">Tahun Terbit</label>
                            <input 
                              type="text" 
                              required
                              value={adminFormData.year || ''}
                              onChange={(e) => setAdminFormData({ ...adminFormData, year: e.target.value })}
                              placeholder="Contoh: 2026" 
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans text-sm"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-2">Jumlah Halaman</label>
                            <input 
                              type="text" 
                              required
                              value={adminFormData.pages || ''}
                              onChange={(e) => setAdminFormData({ ...adminFormData, pages: e.target.value })}
                              placeholder="Contoh: 56 Halaman" 
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-2">Ukuran File</label>
                            <input 
                              type="text" 
                              required
                              value={adminFormData.fileSize || ''}
                              onChange={(e) => setAdminFormData({ ...adminFormData, fileSize: e.target.value })}
                              placeholder="Contoh: 4.8 MB" 
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-2">Tautan Langsung File PDF (URL)</label>
                          <input 
                            type="url" 
                            required
                            value={adminFormData.pdfUrl || ''}
                            onChange={(e) => setAdminFormData({ ...adminFormData, pdfUrl: e.target.value })}
                            placeholder="https://your-bucket.supabase.co/storage/v1/object/public/archives/file.pdf" 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans text-sm"
                          />
                          <p className="text-[11px] text-slate-400 mt-1">
                            Bisa berupa tautan dokumen publik di Supabase Storage atau link berkas PDF eksternal.
                          </p>
                        </div>
                      </>
                    ) : adminType === 'agenda' ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-2">Tanggal Pelaksanaan</label>
                          <input 
                            type="text" 
                            required
                            value={adminFormData.date || ''}
                            onChange={(e) => setAdminFormData({ ...adminFormData, date: e.target.value })}
                            placeholder="Contoh: 15 Des 2026" 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-2">Lokasi Acara</label>
                          <input 
                            type="text" 
                            required
                            value={adminFormData.location || ''}
                            onChange={(e) => setAdminFormData({ ...adminFormData, location: e.target.value })}
                            placeholder="Contoh: Dermaga Muncar" 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans text-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-2">Penulis</label>
                          <input 
                            type="text" 
                            required
                            value={adminFormData.author || ''}
                            onChange={(e) => setAdminFormData({ ...adminFormData, author: e.target.value })}
                            placeholder="Nama penulis..." 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-2">Kategori</label>
                          <input 
                            type="text" 
                            required
                            value={adminFormData.category || ''}
                            onChange={(e) => setAdminFormData({ ...adminFormData, category: e.target.value })}
                            placeholder="Riset / Tradisi / Catatan Budaya" 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans text-sm"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-2">URL Gambar Sampul (Cover Image)</label>
                      <input 
                        type="url" 
                        required
                        value={adminFormData.coverUrl || adminFormData.image || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdminFormData({ ...adminFormData, coverUrl: val, image: val });
                        }}
                        placeholder="https://images.unsplash.com/..." 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-2">
                        {adminType === 'article' ? 'Isi Lengkap Artikel' : 'Deskripsi & Sinopsis'}
                      </label>
                      <textarea 
                        rows={6}
                        required
                        value={adminType === 'article' ? (adminFormData.content || '') : (adminFormData.description || '')}
                        onChange={(e) => {
                          if (adminType === 'article') {
                            setAdminFormData({ ...adminFormData, content: e.target.value, summary: e.target.value.slice(0, 140) + '...' });
                          } else {
                            setAdminFormData({ ...adminFormData, description: e.target.value });
                          }
                        }}
                        placeholder="Tulis ringkasan atau sinopsis di sini..." 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans text-sm"
                      />
                    </div>

                    <Button type="submit" variant="primary" className="w-full">
                      Terbitkan Arsip / Konten Baru
                    </Button>
                  </form>
                </Card>
              </div>
            )}
          </>
        )}
      </main>

      {/* --- MODAL INTERAKTIF PEMBACA PDF (IN-WEBSITE PDF VIEWER) --- */}
      {selectedPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative">
            
            {/* Header Modal PDF */}
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="sky">{selectedPdf.category}</Badge>
                    <span className="text-xs text-slate-400 font-heading font-semibold">{selectedPdf.year} • {selectedPdf.pages}</span>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-slate-900 line-clamp-1 mt-0.5">
                    {selectedPdf.title}
                  </h3>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button 
                  variant="primary" 
                  onClick={() => handleDownload(selectedPdf)}
                  className="!px-4 !py-2 text-xs !shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF ({selectedPdf.fileSize})</span>
                </Button>
                <a 
                  href={selectedPdf.pdfUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-2.5 rounded-full border border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-white transition-colors"
                  title="Buka di Tab Baru"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button 
                  onClick={() => setSelectedPdf(null)} 
                  className="p-2.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Tutup Pembaca"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Frame / PDF Embed */}
            <div className="flex-1 bg-slate-100 relative p-2 sm:p-4 overflow-hidden">
              <iframe 
                src={`${selectedPdf.pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                className="w-full h-full rounded-2xl border border-slate-200 bg-white shadow-inner"
                title={selectedPdf.title}
              />
            </div>

            {/* Footer Modal PDF Helper */}
            <div className="px-6 py-3 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-sans gap-2">
              <div className="flex items-center gap-2">
                <span>Penulis: <strong>{selectedPdf.author}</strong></span>
                <span>•</span>
                <span>Ukuran File: <strong>{selectedPdf.fileSize}</strong></span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Jika browser perangkat Anda memblokir tampilan berkas, silakan klik tombol <strong className="text-slate-600">"Unduh PDF"</strong> di atas.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL PENDAFTARAN AGENDA POP-UP --- */}
      {registerItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 relative">
            <button 
              onClick={() => setRegisterItem(null)} 
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <Badge variant="orange">Formulir Pendaftaran</Badge>
            <h3 className="text-2xl font-heading font-extrabold text-slate-900 mt-3 leading-snug">
              {registerItem.title}
            </h3>
            <p className="text-xs font-heading text-slate-500 mt-1">
              Agenda Komunitas Pesisir Muncar
            </p>

            {regSubmitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  ✓
                </div>
                <h4 className="text-lg font-heading font-bold text-slate-900">Menghubungkan ke WhatsApp...</h4>
                <p className="text-xs text-slate-500">Data Anda sedang diteruskan langsung ke tim narahubung Punel.</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-6">
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-1.5">Nama Lengkap *</label>
                  <input 
                    type="text" 
                    required
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    placeholder="Nama Anda" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-1.5">Nomor WhatsApp Aktif *</label>
                  <input 
                    type="tel" 
                    required
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="081234567890" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-1.5">Email (Opsional)</label>
                  <input 
                    type="email" 
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="nama@email.com" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-1.5">Catatan / Alasan Tertarik (Opsional)</label>
                  <textarea 
                    rows={2}
                    value={regForm.note}
                    onChange={(e) => setRegForm({ ...regForm, note: e.target.value })}
                    placeholder="Saya tertarik mendalami tradisi laut..." 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="pt-2">
                  <Button type="submit" variant="primary" className="w-full">
                    Kirim & Hubungi via WhatsApp
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL SAWER / DONASI QRIS --- */}
      {isSawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl border border-slate-100 text-center relative">
            <button 
              onClick={() => setIsSawerOpen(false)} 
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 fill-orange-500" />
            </div>

            <h3 className="text-xl font-heading font-extrabold text-slate-900">
              Dukung Kolektif Punel
            </h3>
            <p className="text-xs text-slate-500 mt-2 font-sans leading-relaxed">
              Donasi dan apresiasi Anda digunakan untuk biaya operasional riset lisan, penerbitan zine, dan pemeliharaan arsip pesisir secara independen.
            </p>

            <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block">
              {/* QRIS PLACEHOLDER / SIMULATOR */}
              <div className="w-48 h-48 bg-white rounded-xl p-2 border border-slate-200 flex flex-col items-center justify-center shadow-inner">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://wa.me/6281234567890?text=Konfirmasi%20Donasi%20Punel" 
                  alt="QRIS Donasi Punel Art" 
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[11px] font-heading font-bold text-slate-600 mt-2">
                Pindai dengan GoPay / OVO / Dana / BCA
              </p>
            </div>

            <div className="text-left bg-slate-50 p-4 rounded-xl text-xs space-y-1 text-slate-600 font-sans border border-slate-100 mb-6">
              <div>Bank: <strong>BCA</strong> (014)</div>
              <div>No. Rek: <strong className="text-slate-900 font-mono">123-456-7890</strong></div>
              <div>Atas Nama: <strong>Punel Art Communication</strong></div>
            </div>

            <Button variant="outline" className="w-full" onClick={() => setIsSawerOpen(false)}>
              Tutup Jendela
            </Button>
          </div>
        </div>
      )}

      {/* --- FOOTER EDITORIAL PESISIR --- */}
      <footer className="bg-slate-900 text-white mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center text-white font-heading font-extrabold text-lg">
                P
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                Punel Art Communication
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-sans">
              Kolektif independen yang bergerak di irisan seni rupa, etno-arsip, dan komunikasi budaya masyarakat pesisir Muncar, Banyuwangi.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-sky-600 transition-colors">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-sky-600 transition-colors">
                <FacebookIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3 font-sans text-sm">
            <h4 className="font-heading font-bold text-white text-base">Navigasi Arsip</h4>
            <ul className="space-y-2 text-slate-400">
              <li><button onClick={() => { setActiveTab('home'); setSelectedArticle(null); setSelectedPdf(null); }} className="hover:text-sky-400 transition-colors cursor-pointer">Beranda</button></li>
              <li><button onClick={() => { setActiveTab('agenda'); setSelectedArticle(null); setSelectedPdf(null); }} className="hover:text-sky-400 transition-colors cursor-pointer">Agenda Pesisir</button></li>
              <li><button onClick={() => { setActiveTab('archives'); setSelectedArticle(null); setSelectedPdf(null); }} className="hover:text-sky-400 transition-colors cursor-pointer">Arsip Dokumen PDF</button></li>
              <li><button onClick={() => { setActiveTab('articles'); setSelectedArticle(null); setSelectedPdf(null); }} className="hover:text-sky-400 transition-colors cursor-pointer">Jurnal & Esai</button></li>
              <li><button onClick={() => { setActiveTab('team'); setSelectedArticle(null); setSelectedPdf(null); }} className="hover:text-sky-400 transition-colors cursor-pointer">Profil Tim</button></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3 font-sans text-sm">
            <h4 className="font-heading font-bold text-white text-base">Sekretariat & Studio</h4>
            <p className="text-slate-400 leading-relaxed">
              Kampung Bahari, Kecamatan Muncar, Kabupaten Banyuwangi, Jawa Timur — 68472
            </p>
            <p className="text-slate-400 pt-1">
              WhatsApp: <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">+62 812-3456-7890</a>
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-[11px] font-heading font-semibold text-orange-400 border border-slate-700">
                Seni • Komunikasi • Aksi
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 font-sans">
          &copy; {new Date().getFullYear()} Punel Art Communication. Dikurasi dan dirawat bersama masyarakat nelayan Muncar.
        </div>
      </footer>
    </div>
  );
}
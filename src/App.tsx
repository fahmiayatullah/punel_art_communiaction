import React, { useState, useEffect } from 'react';
import { 
  Menu, X, ArrowRight, Calendar, MapPin, Clock, 
  Heart, ArrowLeft, Download, FileText, Eye, EyeOff,
  BookOpen, ExternalLink, Search, Share2, Copy, Check,
  LogOut, Lock, ShieldCheck, AlertCircle, Loader2, Trash2
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';

// --- TIPE DATA TYPESCRIPT ---
export interface Agenda {
  id: string;
  slug?: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: string; // 'upcoming' | 'ongoing' | 'completed'
  category: string;
  description: string;
  longDescription?: string;
  organizer?: string;
  schedule?: { time: string; activity: string }[];
  image: string;
  isOpenRegistration?: boolean;
}

export interface Article {
  id: string;
  slug?: string;
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

// --- HELPER UNTUK URL SLUG ---
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// --- DAFTAR JUDUL KONTEN DEMO AWAL (DIBERSIHKAN DARI SITUS RESMI) ---
const DEMO_TITLES = [
  'Diskusi Pesisir: Menggali Ingatan Laut',
  'Pameran Fotografi: Wajah & Gelombang Nelayan',
  'Jejak Perahu Cungkring di Pesisir Muncar',
  'Merawat Larung Sesaji: Antara Syukur dan Ekologi',
  'Monograf Etnografi: Kosmologi Laut Masyarakat Muncar',
  'Katalog Arsip Visual: Perahu Cungkring Terakhir',
  'Zine Kebudayaan Bahari: Gelombang Suara Pelabuhan Vol. 01',
  'Laporan Kajian: Ekologi Selat Bali & Hak Nelayan Tradisional'
];

// --- INITIAL STATE RESMI (BERSIH DARI DEMO) ---
const MOCK_AGENDAS: Agenda[] = [];
const MOCK_ARTICLES: Article[] = [];
const MOCK_ARCHIVES: ArchiveDocument[] = [];

const MOCK_TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Izzat Ramsi',
    role: 'Inisiator & Teater',
    bio: 'Mengembangkan pendekatan dramaturgi dan seni pertunjukan teater rakyat yang berakar pada narasi bahari Muncar.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '2',
    name: 'Sofyan Maulana',
    role: 'Advokasi',
    bio: 'Fokus pada pendampingan hak nelayan tradisional, advokasi ruang hidup pesisir, dan perlindungan ekologi laut.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '3',
    name: 'Romi Alwi Zain',
    role: 'Musik',
    bio: 'Eksplorasi komposisi musik bahari, pengarsipan lanskap bunyi pesisir, dan penciptaan karya berbasis ritus lokal.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '4',
    name: 'Fahmi Ayatullah',
    role: 'Jurnalis Independen',
    bio: 'Merancang liputan etnografi pesisir, publikasi zine independen, dan pengarsipan narasi lisan masyarakat Muncar.',
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
  variant?: 'primary' | 'outline' | 'accent' | 'ghost' | 'danger';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = "px-6 py-3 rounded-full font-heading font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-sky-600 text-white hover:bg-sky-700 hover:shadow-lg hover:shadow-sky-500/30",
    outline: "bg-white text-slate-800 border-2 border-slate-200 hover:border-sky-600 hover:text-sky-600 hover:shadow-md",
    accent: "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30",
    ghost: "text-sky-600 hover:bg-sky-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-500/30"
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

const Badge = ({ children, variant = 'sky' }: { children: React.ReactNode; variant?: 'sky' | 'orange' | 'slate' | 'emerald' }) => {
  const styles = {
    sky: 'bg-sky-50 text-sky-700 border border-sky-100',
    orange: 'bg-orange-50 text-orange-700 border border-orange-100',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-100'
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-heading font-bold uppercase tracking-wider ${styles[variant]}`}>
      {children}
    </span>
  );
};

// --- APLIKASI UTAMA PUNEL ART COMMUNICATION ---
export default function App() {
  // ROUTING STATE BERBASIS URL PATHNAME
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // DATA STATE
  const [agendas, setAgendas] = useState<Agenda[]>(MOCK_AGENDAS);
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
  const [archives, setArchives] = useState<ArchiveDocument[]>(MOCK_ARCHIVES);
  const [team, setTeam] = useState<TeamMember[]>(MOCK_TEAM);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // FILTER & SEARCH STATE
  const [archiveCategory, setArchiveCategory] = useState<string>('Semua');
  const [archiveSearch, setArchiveSearch] = useState<string>('');

  // MODAL STATE
  const [selectedPdf, setSelectedPdf] = useState<ArchiveDocument | null>(null);
  const [registerItem, setRegisterItem] = useState<{ title: string; type: 'agenda'; price?: string | number } | null>(null);
  const [isSawerOpen, setIsSawerOpen] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // REGISTRASI FORM STATE
  const [regForm, setRegForm] = useState({ name: '', phone: '', email: '', note: '' });
  const [regSubmitted, setRegSubmitted] = useState(false);

  // AUTENTIKASI ADMIN SUPABASE
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // ADMIN DASHBOARD FORM & DELETE STATE
  const [adminType, setAdminType] = useState<'archive' | 'agenda' | 'article'>('archive');
  const [adminFormData, setAdminFormData] = useState<any>({});
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // --- SISTEM NAVIGASI & SCROLL-TO-TOP TERPUSAT ---
  const navigate = (path: string, options?: { replace?: boolean; hash?: string }) => {
    setMobileMenuOpen(false);
    if (options?.replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);

    // RESET SCROLL LANGSUNG KE ATAS (Y = 0)
    setTimeout(() => {
      if (options?.hash) {
        const el = document.getElementById(options.hash.replace('#', ''));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 10);
  };

  // Browser Back / Forward Button Handling (PopState)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Guarantee Scroll to Top whenever currentPath changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentPath]);

  // Check Supabase Auth Session
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
        setSession(currentSession);
        setAuthLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        setSession(currentSession);
        setAuthLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      setAuthLoading(false);
    }
  }, []);

  // Fetching Data from Supabase with Fallback
  useEffect(() => {
    async function fetchData() {
      setLoadingData(true);
      if (isSupabaseConfigured && supabase) {
        try {
          const [agendasRes, articlesRes, archivesRes, teamRes] = await Promise.all([
            supabase.from('punel_agenda').select('*'),
            supabase.from('punel_articles').select('*'),
            supabase.from('punel_archives').select('*'),
            supabase.from('punel_team').select('*')
          ]);

          const isDemo = (title?: string) => title ? DEMO_TITLES.some(d => title.toLowerCase().includes(d.toLowerCase())) : false;

          if (agendasRes.data) {
            const cleanAgendas = agendasRes.data
              .filter(item => !isDemo(item.title))
              .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

            setAgendas(cleanAgendas.map(item => ({
              id: item.id,
              slug: slugify(item.title),
              title: item.title,
              date: item.date || '',
              time: item.time || '',
              location: item.location || '',
              status: item.status || 'upcoming',
              category: item.category || 'Umum',
              description: item.description || '',
              longDescription: item.description || '',
              organizer: 'Punel Art Communication',
              schedule: [
                { time: `${item.time || '15:00'} WIB`, activity: 'Pembukaan & Registrasi Hadir' },
                { time: 'Sesi Lanjutan', activity: 'Pelaksanaan Kegiatan & Diskusi' }
              ],
              image: item.posterUrl || item.posterurl || item.poster_url || 'https://images.unsplash.com/photo-1599827552599-eda794b159f8?auto=format&fit=crop&q=80&w=800',
              isOpenRegistration: true
            })));
          }

          if (articlesRes.data) {
            const cleanArticles = articlesRes.data
              .filter(item => !isDemo(item.title))
              .sort((a, b) => {
                const timeA = new Date(a.createdAt || a.created_at || a.createdat || 0).getTime();
                const timeB = new Date(b.createdAt || b.created_at || b.createdat || 0).getTime();
                return timeB - timeA;
              });

            setArticles(cleanArticles.map(item => ({
              id: item.id,
              slug: slugify(item.title),
              title: item.title,
              author: item.author || 'Punel Team',
              date: (item.createdAt || item.created_at || item.createdat) 
                ? new Date(item.createdAt || item.created_at || item.createdat).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) 
                : '',
              category: item.category || 'Catatan Budaya',
              summary: item.summary || '',
              content: item.content || '',
              image: item.imageUrl || item.imageurl || item.image_url || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800'
            })));
          }

          if (archivesRes.data) {
            const cleanArchives = archivesRes.data
              .filter(item => !isDemo(item.title))
              .sort((a, b) => {
                const timeA = new Date(a.createdAt || a.created_at || a.createdat || 0).getTime();
                const timeB = new Date(b.createdAt || b.created_at || b.createdat || 0).getTime();
                return timeB - timeA;
              });

            setArchives(cleanArchives.map(item => ({
              id: item.id,
              title: item.title,
              author: item.author || 'Tim Punel',
              year: item.year || '2026',
              category: item.category || 'Arsip Digital',
              pages: item.pages || 'Dokumen PDF',
              fileSize: item.fileSize || item.filesize || item.file_size || 'Unduh PDF',
              description: item.description || '',
              coverUrl: item.coverUrl || item.coverurl || item.cover_url || 'https://images.unsplash.com/photo-1544256718-3b610a088d43?auto=format&fit=crop&q=80&w=800',
              pdfUrl: item.pdfUrl || item.pdfurl || item.pdf_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              allowDownload: item.allowDownload !== false && item.allowdownload !== false && item.allow_download !== false
            })));
          }

          if (teamRes.data && teamRes.data.length > 0) {
            const sortedTeam = [...teamRes.data].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            const hasNewTeam = sortedTeam.some(item => 
              (item.name && (item.name.includes('Izzat') || item.name.includes('Sofyan') || item.name.includes('Romi') || item.name.includes('Fahmi')))
            );
            if (hasNewTeam) {
              setTeam(sortedTeam.map(item => ({
                id: item.id,
                name: item.name,
                role: item.role || 'Anggota Kolektif',
                bio: item.description || '',
                image: item.photoUrl || item.photourl || item.photo_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'
              })));
            } else {
              setTeam(MOCK_TEAM);
            }
          }
        } catch (err) {
          console.warn('Gagal memuat data dari Supabase, beralih ke Mock Data:', err);
        }
      }
      setLoadingData(false);
    }
    fetchData();
  }, []);

  // --- HANDLER AUTENTIKASI ADMIN ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    if (!loginEmail || !loginPassword) {
      setLoginError('Harap masukkan alamat email dan kata sandi.');
      setIsLoggingIn(false);
      return;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword
        });

        if (error) {
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            setLoginError('Email atau kata sandi tidak cocok. Silakan periksa kembali akun administrator Anda.');
          } else {
            setLoginError(error.message);
          }
        } else if (data.session) {
          setSession(data.session);
          setLoginEmail('');
          setLoginPassword('');
          navigate('/admin');
        }
      } catch (err: any) {
        setLoginError(err.message || 'Terjadi kesalahan sistem saat mencoba masuk.');
      }
    } else {
      // Mock Demo Auth jika kredensial .env Supabase belum dipasang
      setTimeout(() => {
        setLoginError('Koneksi Supabase belum terkonfigurasi. Pasang VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY pada file .env.');
      }, 600);
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    navigate('/admin/login');
  };

  // --- HANDLER DOWNLOAD BERKAS PDF ---
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
    } catch {
      window.open(doc.pdfUrl, '_blank');
    }
  };

  // --- HANDLER SALIN TAUTAN (SHARE) ---
  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // --- HANDLER REGISTRASI AGENDA POP-UP ---
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

    const message = `Halo Punel Art Communication, saya ingin mendaftar untuk:\n\n*${registerItem?.title}* (Agenda Pesisir Muncar)\n\nNama: ${regForm.name}\nWhatsApp: ${regForm.phone}\nEmail: ${regForm.email || '-'}\nCatatan: ${regForm.note || '-'}`;
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    
    setRegSubmitted(true);
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setRegSubmitted(false);
      setRegisterItem(null);
      setRegForm({ name: '', phone: '', email: '', note: '' });
    }, 1200);
  };

  // --- HANDLER ADMIN TERBITKAN KONTEN (APPEND-ONLY ARCHIVAL) ---
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminMessage(null);
    setIsAdminSubmitting(true);

    if (isSupabaseConfigured && supabase) {
      try {
        if (adminType === 'archive') {
          const payload = {
            title: adminFormData.title,
            author: adminFormData.author || 'Tim Punel',
            year: adminFormData.year || new Date().getFullYear().toString(),
            category: adminFormData.category || 'Riset Etnografi',
            pages: adminFormData.pages || '30 Halaman',
            fileSize: adminFormData.fileSize || '4.5 MB',
            description: adminFormData.description || '',
            coverUrl: adminFormData.coverUrl || 'https://images.unsplash.com/photo-1544256718-3b610a088d43?auto=format&fit=crop&q=80&w=800',
            pdfUrl: adminFormData.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            allowDownload: true
          };
          const { data, error } = await supabase.from('punel_archives').insert([payload]).select();
          if (error) throw error;

          const created = data && data[0] ? data[0] : payload;
          const newDoc: ArchiveDocument = {
            id: created.id || String(Date.now()),
            title: created.title,
            author: created.author || 'Tim Punel',
            year: created.year || '2026',
            category: created.category || 'Arsip Digital',
            pages: created.pages || 'Dokumen PDF',
            fileSize: created.fileSize || created.filesize || 'Unduh PDF',
            description: created.description || '',
            coverUrl: created.coverUrl || created.coverurl || payload.coverUrl,
            pdfUrl: created.pdfUrl || created.pdfurl || payload.pdfUrl,
            allowDownload: true
          };
          setArchives(prev => [newDoc, ...prev]);
          setAdminMessage('✓ Berhasil! Dokumen PDF baru telah ditambahkan ke arsip permanen Supabase.');
        } else if (adminType === 'agenda') {
          const payload = {
            title: adminFormData.title,
            date: adminFormData.date,
            time: adminFormData.time || '15:00',
            location: adminFormData.location,
            category: adminFormData.category || 'Diskusi',
            description: adminFormData.description || '',
            posterUrl: adminFormData.image || adminFormData.coverUrl || 'https://images.unsplash.com/photo-1599827552599-eda794b159f8?auto=format&fit=crop&q=80&w=800'
          };
          const { data, error } = await supabase.from('punel_agenda').insert([payload]).select();
          if (error) throw error;

          const created = data && data[0] ? data[0] : payload;
          const newAg: Agenda = {
            id: created.id || String(Date.now()),
            slug: slugify(created.title || 'Agenda Baru'),
            title: created.title,
            date: created.date,
            time: created.time || '15:00',
            location: created.location,
            status: 'upcoming',
            category: created.category || 'Diskusi',
            description: created.description || '',
            longDescription: created.description || '',
            organizer: 'Punel Art Communication',
            image: created.posterUrl || created.posterurl || payload.posterUrl,
            isOpenRegistration: true
          };
          setAgendas(prev => [newAg, ...prev]);
          setAdminMessage('✓ Berhasil! Agenda baru telah ditambahkan ke kalender kegiatan Supabase.');
        } else {
          const payload = {
            title: adminFormData.title,
            author: adminFormData.author || 'Tim Punel',
            category: adminFormData.category || 'Catatan Budaya',
            summary: adminFormData.summary || adminFormData.content?.slice(0, 140) + '...',
            content: adminFormData.content || '',
            imageUrl: adminFormData.image || adminFormData.coverUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800'
          };
          const { data, error } = await supabase.from('punel_articles').insert([payload]).select();
          if (error) throw error;

          const created = data && data[0] ? data[0] : payload;
          const newArticle: Article = {
            id: created.id || String(Date.now()),
            slug: slugify(created.title || 'Artikel'),
            title: created.title,
            author: created.author || 'Tim Punel',
            date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
            category: created.category || 'Catatan Budaya',
            summary: created.summary || '',
            content: created.content || '',
            image: created.imageUrl || created.imageurl || payload.imageUrl
          };
          setArticles(prev => [newArticle, ...prev]);
          setAdminMessage('✓ Berhasil! Artikel baru telah diterbitkan ke indeks jurnal Supabase.');
        }
        setAdminFormData({});
      } catch (err: any) {
        setAdminMessage(`Gagal menerbitkan ke Supabase: ${err.message}`);
      } finally {
        setIsAdminSubmitting(false);
      }
    } else {
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
        const newAg: Agenda = {
          id: String(Date.now()),
          slug: slugify(adminFormData.title || 'Agenda Baru'),
          title: adminFormData.title || 'Agenda Baru',
          date: adminFormData.date || 'Segera Hadir',
          time: adminFormData.time || '15:00',
          location: adminFormData.location || 'Muncar',
          status: 'upcoming',
          category: adminFormData.category || 'Diskusi',
          description: adminFormData.description || '',
          longDescription: adminFormData.description || '',
          organizer: 'Punel Art Communication',
          image: adminFormData.image || adminFormData.coverUrl || 'https://images.unsplash.com/photo-1599827552599-eda794b159f8?auto=format&fit=crop&q=80&w=800',
          isOpenRegistration: true
        };
        setAgendas(prev => [newAg, ...prev]);
      } else {
        const newArt: Article = {
          id: String(Date.now()),
          slug: slugify(adminFormData.title || 'Artikel'),
          title: adminFormData.title || 'Artikel Baru',
          author: adminFormData.author || 'Tim Punel',
          date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
          category: adminFormData.category || 'Catatan Budaya',
          summary: adminFormData.summary || adminFormData.content?.slice(0, 140) + '...',
          content: adminFormData.content || '',
          image: adminFormData.image || adminFormData.coverUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800'
        };
        setArticles(prev => [newArt, ...prev]);
      }
      setAdminMessage('✓ Berhasil ditambahkan ke daftar arsip lokal (Mock Mode)!');
      setIsAdminSubmitting(false);
      setAdminFormData({});
    }
  };

  // --- HANDLER ADMIN HAPUS KONTEN (DELETE ACTION) ---
  const handleAdminDelete = async (type: 'archive' | 'agenda' | 'article', id: string, title: string) => {
    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus "${title}"? Data ini akan dihapus dari web.`);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      if (isSupabaseConfigured && supabase) {
        const table = type === 'archive' ? 'punel_archives' : type === 'agenda' ? 'punel_agenda' : 'punel_articles';
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) {
          console.warn('Gagal menghapus dari Supabase:', error.message);
        }
      }

      if (type === 'archive') {
        setArchives(prev => prev.filter(item => item.id !== id));
      } else if (type === 'agenda') {
        setAgendas(prev => prev.filter(item => item.id !== id));
      } else {
        setArticles(prev => prev.filter(item => item.id !== id));
      }

      setAdminMessage(`✓ Konten "${title}" berhasil dihapus.`);
    } catch (err: any) {
      setAdminMessage(`Gagal menghapus konten: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // --- PARSER RUTE DINAMIS DARI URL PATHNAME ---
  const isAgendaDetail = currentPath.startsWith('/agenda/') && currentPath !== '/agenda/';
  const agendaParam = isAgendaDetail ? currentPath.replace('/agenda/', '').split('/')[0] : null;
  const currentAgenda = isAgendaDetail 
    ? agendas.find(a => a.id === agendaParam || a.slug === agendaParam || slugify(a.title) === agendaParam)
    : null;

  const isArticleDetail = currentPath.startsWith('/artikel/') && currentPath !== '/artikel/';
  const articleParam = isArticleDetail ? currentPath.replace('/artikel/', '').split('/')[0] : null;
  const currentArticle = isArticleDetail
    ? articles.find(a => a.id === articleParam || a.slug === articleParam || slugify(a.title) === articleParam)
    : null;

  // Filter Arsip Dokumen PDF
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
      {/* NOTIFIKASI TOAST DOWNLOAD */}
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
            onClick={() => navigate('/')} 
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
              onClick={() => navigate('/')} 
              className={`transition-colors py-1 cursor-pointer ${currentPath === '/' ? 'text-sky-600 font-bold border-b-2 border-sky-600' : 'hover:text-sky-600'}`}
            >
              Beranda
            </button>
            <button 
              onClick={() => navigate('/agenda')} 
              className={`transition-colors py-1 cursor-pointer ${(currentPath === '/agenda' || isAgendaDetail) ? 'text-sky-600 font-bold border-b-2 border-sky-600' : 'hover:text-sky-600'}`}
            >
              Agenda
            </button>
            <button 
              onClick={() => navigate('/arsip')} 
              className={`transition-colors py-1 flex items-center gap-1.5 cursor-pointer ${currentPath === '/arsip' ? 'text-sky-600 font-bold border-b-2 border-sky-600' : 'hover:text-sky-600'}`}
            >
              <FileText className="w-4 h-4" />
              <span>Arsip Dokumen PDF</span>
            </button>
            <button 
              onClick={() => navigate('/artikel')} 
              className={`transition-colors py-1 cursor-pointer ${(currentPath === '/artikel' || isArticleDetail) ? 'text-sky-600 font-bold border-b-2 border-sky-600' : 'hover:text-sky-600'}`}
            >
              Jurnal & Esai
            </button>
            <button 
              onClick={() => navigate('/tentang')} 
              className={`transition-colors py-1 cursor-pointer ${currentPath === '/tentang' ? 'text-sky-600 font-bold border-b-2 border-sky-600' : 'hover:text-sky-600'}`}
            >
              Tentang Kami
            </button>
            <button 
              onClick={() => navigate(session ? '/admin' : '/admin/login')} 
              className={`transition-colors py-1 flex items-center gap-1 cursor-pointer ${currentPath.startsWith('/admin') ? 'text-sky-600 font-bold border-b-2 border-sky-600' : 'hover:text-sky-600'}`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
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

        {/* MOBILE MENU DROPDOWN */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 font-heading font-semibold text-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
            <button 
              onClick={() => navigate('/')} 
              className={`block w-full text-left py-2 ${currentPath === '/' ? 'text-sky-600 font-bold' : 'hover:text-sky-600'}`}
            >
              Beranda
            </button>
            <button 
              onClick={() => navigate('/agenda')} 
              className={`block w-full text-left py-2 ${currentPath.startsWith('/agenda') ? 'text-sky-600 font-bold' : 'hover:text-sky-600'}`}
            >
              Agenda
            </button>
            <button 
              onClick={() => navigate('/arsip')} 
              className={`block w-full text-left py-2 flex items-center gap-2 ${currentPath === '/arsip' ? 'text-sky-600 font-bold' : 'hover:text-sky-600'}`}
            >
              <FileText className="w-4 h-4" />
              Arsip Dokumen PDF
            </button>
            <button 
              onClick={() => navigate('/artikel')} 
              className={`block w-full text-left py-2 ${currentPath.startsWith('/artikel') ? 'text-sky-600 font-bold' : 'hover:text-sky-600'}`}
            >
              Jurnal & Esai
            </button>
            <button 
              onClick={() => navigate('/tentang')} 
              className={`block w-full text-left py-2 ${currentPath === '/tentang' ? 'text-sky-600 font-bold' : 'hover:text-sky-600'}`}
            >
              Tentang Kami
            </button>
            <button 
              onClick={() => navigate(session ? '/admin' : '/admin/login')} 
              className={`block w-full text-left py-2 flex items-center gap-1.5 ${currentPath.startsWith('/admin') ? 'text-sky-600 font-bold' : 'hover:text-sky-600'}`}
            >
              <Lock className="w-4 h-4" />
              Portal Admin
            </button>
          </div>
        )}
      </nav>

      {/* --- KONTEN HALAMAN UTAMA --- */}
      <main className="flex-1">

        {/* 1. HALAMAN DETAIL AGENDA (ROUTING /agenda/:slugOrId) */}
        {isAgendaDetail && (
          <div className="py-20 max-w-4xl mx-auto px-6">
            <button 
              onClick={() => navigate('/agenda')}
              className="mb-8 inline-flex items-center gap-2 text-sm font-heading font-bold text-sky-600 hover:text-sky-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Kalender Agenda
            </button>

            {loadingData ? (
              <div className="py-24 text-center bg-white rounded-3xl p-12 border border-slate-100 shadow-sm">
                <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-4" />
                <p className="font-heading font-bold text-slate-700">Memuat detail agenda...</p>
              </div>
            ) : !currentAgenda ? (
              <div className="bg-white rounded-3xl p-10 md:p-16 shadow-sm border border-slate-100 text-center space-y-4">
                <AlertCircle className="w-16 h-16 text-orange-500 mx-auto" />
                <h2 className="text-2xl md:text-4xl font-heading font-extrabold text-slate-900">
                  Agenda Tidak Ditemukan
                </h2>
                <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
                  Agenda dengan identitas "{agendaParam}" tidak ditemukan atau telah diarsipkan oleh pengelola Punel Art Communication.
                </p>
                <div className="pt-4">
                  <Button variant="primary" onClick={() => navigate('/agenda')}>
                    Lihat Semua Agenda
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="bg-white rounded-3xl p-8 md:p-14 shadow-sm border border-slate-100">
                  {/* Badges & Status */}
                  <div className="flex flex-wrap items-center gap-2.5 mb-5">
                    <Badge variant="orange">{currentAgenda.category}</Badge>
                    <Badge variant={currentAgenda.status === 'upcoming' ? 'sky' : currentAgenda.status === 'ongoing' ? 'emerald' : 'slate'}>
                      {currentAgenda.status === 'upcoming' ? 'Akan Datang' : currentAgenda.status === 'ongoing' ? 'Sedang Berlangsung' : 'Selesai'}
                    </Badge>
                  </div>

                  <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-slate-900 leading-tight">
                    {currentAgenda.title}
                  </h1>

                  {/* Metadata Bar */}
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 my-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-heading font-semibold text-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Tanggal</div>
                        <div className="text-slate-900 font-bold">{currentAgenda.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Waktu</div>
                        <div className="text-slate-900 font-bold">{currentAgenda.time} WIB</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:col-span-2 md:col-span-1">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Lokasi</div>
                        <div className="text-slate-900 font-bold line-clamp-1">{currentAgenda.location}</div>
                      </div>
                    </div>
                  </div>

                  {/* Poster / Foto Utama */}
                  <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden mb-10 shadow-md">
                    <img 
                      src={currentAgenda.image} 
                      alt={currentAgenda.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  {/* Deskripsi Lengkap & Latar Belakang */}
                  <div className="space-y-6 text-slate-700 text-base md:text-lg leading-relaxed font-sans whitespace-pre-line">
                    <h3 className="text-xl font-heading font-bold text-slate-900">
                      Tentang Kegiatan Ini
                    </h3>
                    <p>{currentAgenda.longDescription || currentAgenda.description}</p>
                  </div>

                  {/* Rangkaian Acara / Rundown */}
                  {currentAgenda.schedule && currentAgenda.schedule.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-slate-100">
                      <h3 className="text-xl font-heading font-bold text-slate-900 mb-6">
                        Susunan Rangkaian Acara
                      </h3>
                      <div className="space-y-3">
                        {currentAgenda.schedule.map((item, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                            <span className="font-heading font-bold text-sky-600 text-sm shrink-0 sm:w-36">
                              {item.time}
                            </span>
                            <span className="text-sm font-sans text-slate-700 font-medium">
                              {item.activity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Penyelenggara */}
                  <div className="mt-10 p-5 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between text-xs font-heading">
                    <span className="text-slate-500">Penyelenggara:</span>
                    <strong className="text-sky-800 font-bold">{currentAgenda.organizer || 'Punel Art Communication'}</strong>
                  </div>

                  {/* Aksi & Tombol Registrasi */}
                  <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Button 
                        variant="primary" 
                        onClick={() => setRegisterItem({ title: currentAgenda.title, type: 'agenda' })}
                        className="w-full sm:w-auto !px-8 !py-3.5"
                      >
                        Daftar Hadir via WhatsApp
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <a 
                        href={`https://wa.me/?text=${encodeURIComponent(`Ayo ikuti kegiatan "${currentAgenda.title}" bersama Punel Art Communication: ${window.location.href}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-3 rounded-full border border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 text-xs font-heading font-bold flex items-center gap-2 transition-colors cursor-pointer"
                        title="Bagikan ke WhatsApp"
                      >
                        <Share2 className="w-4 h-4 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                      <button 
                        onClick={handleCopyLink}
                        className="px-4 py-3 rounded-full border border-slate-200 text-slate-700 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50 text-xs font-heading font-bold flex items-center gap-2 transition-colors cursor-pointer"
                        title="Salin Tautan"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedLink ? 'Tersalin!' : 'Salin Link'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. HALAMAN DETAIL ARTIKEL (ROUTING /artikel/:id) */}
        {isArticleDetail && currentArticle && (
          <div className="py-20 max-w-4xl mx-auto px-6">
            <button 
              onClick={() => navigate('/artikel')}
              className="mb-8 inline-flex items-center gap-2 text-sm font-heading font-bold text-sky-600 hover:text-sky-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Arsip Jurnal
            </button>
            <div className="bg-white rounded-3xl p-8 md:p-14 shadow-sm border border-slate-100">
              <Badge variant="sky">{currentArticle.category}</Badge>
              <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-slate-900 mt-6 leading-tight">
                {currentArticle.title}
              </h1>
              <div className="flex items-center gap-4 text-xs font-heading font-semibold text-slate-500 my-6 pb-6 border-b border-slate-100">
                <span>Oleh: <strong className="text-slate-800">{currentArticle.author}</strong></span>
                <span>•</span>
                <span>{currentArticle.date}</span>
              </div>
              <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden mb-10 shadow-inner">
                <img 
                  src={currentArticle.image} 
                  alt={currentArticle.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="prose prose-slate max-w-none text-slate-700 text-lg leading-relaxed space-y-6 whitespace-pre-line font-sans">
                {currentArticle.content}
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
        )}

        {/* 3. HALAMAN LOGIN ADMINISTRATOR (ROUTING /admin/login) */}
        {currentPath === '/admin/login' && (
          <div className="py-24 max-w-md mx-auto px-6">
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-100">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-sky-600 flex items-center justify-center text-white font-heading font-extrabold text-2xl shadow-lg shadow-sky-500/30 mx-auto mb-4">
                  P
                </div>
                <h2 className="text-2xl font-heading font-extrabold text-slate-900">
                  Portal Administrator
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-2">
                  Masuk menggunakan akun otorisasi Supabase untuk mengelola arsip, agenda, dan publikasi.
                </p>
              </div>

              {loginError && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-heading font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {session ? (
                <div className="text-center space-y-4 py-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-heading font-semibold">
                    Anda telah masuk sebagai <strong>{session.user?.email}</strong>.
                  </div>
                  <Button variant="primary" className="w-full" onClick={() => navigate('/admin')}>
                    Buka Dashboard Admin
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    Keluar / Logout
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Alamat Email Admin
                    </label>
                    <input 
                      type="email" 
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="admin@punelart.org" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••" 
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans text-sm"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" variant="primary" className="w-full !py-3.5" disabled={isLoggingIn}>
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Memverifikasi...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Masuk ke Dashboard</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-center pt-2">
                    <button 
                      type="button" 
                      onClick={() => navigate('/')}
                      className="text-xs font-heading font-bold text-slate-400 hover:text-sky-600 transition-colors cursor-pointer"
                    >
                      ← Kembali ke Beranda Publik
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* 4. DASHBOARD ADMIN TERPROTEKSI (ROUTING /admin) */}
        {currentPath === '/admin' && (
          <div className="py-24 max-w-4xl mx-auto px-6">
            {authLoading ? (
              <div className="py-24 text-center bg-white rounded-3xl p-12 border border-slate-100 shadow-sm">
                <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-4" />
                <p className="font-heading font-bold text-slate-700">Memeriksa hak akses administrator...</p>
              </div>
            ) : !session ? (
              // PROTEKSI RUTE: Jika belum login, tampilkan blokir & arahkan ke /admin/login
              <div className="bg-white rounded-3xl p-10 md:p-14 shadow-sm border border-slate-100 text-center space-y-4">
                <Lock className="w-14 h-14 text-orange-500 mx-auto" />
                <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-slate-900">
                  Akses Terbatas Administrator
                </h2>
                <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
                  Halaman ini memerlukan sesi login administrator yang valid. Silakan masuk terlebih dahulu melalui portal autentikasi.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <Button variant="primary" onClick={() => navigate('/admin/login')}>
                    Buka Halaman Login
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')}>
                    Kembali ke Beranda
                  </Button>
                </div>
              </div>
            ) : (
              // DASHBOARD ADMINISTRATOR AKTIF
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200">
                  <div>
                    <Badge variant="emerald">Sesi Admin Aktif</Badge>
                    <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-slate-900 mt-2">
                      Pusat Manajemen Konten
                    </h1>
                    <p className="text-xs text-slate-500 font-sans mt-0.5">
                      Masuk sebagai: <strong className="text-slate-800">{session.user?.email || 'admin@punelart.org'}</strong>
                    </p>
                  </div>
                  <Button variant="danger" className="!px-4 !py-2.5 text-xs" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                    <span>Keluar / Logout</span>
                  </Button>
                </div>

                {/* BANNER KONTROL KONTEN ADMINISTRATOR (TAMBAH & HAPUS AKTIF) */}
                <div className="mb-8 p-5 rounded-2xl bg-sky-50/90 border border-sky-200/80 flex items-start gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-heading font-extrabold text-sky-900 uppercase tracking-wider">
                        Pusat Kelola Konten & Publikasi
                      </h4>
                      <span className="text-[10px] font-heading font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Tambah & Hapus Aktif
                      </span>
                    </div>
                    <p className="text-xs text-sky-800/90 font-sans mt-1 leading-relaxed">
                      Administrator memiliki akses penuh untuk <strong>menerbitkan konten baru</strong> serta <strong>menghapus konten lama</strong> secara langsung dari situs web dan basis data Supabase.
                    </p>
                  </div>
                </div>

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
                  <div className="mb-6 p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800 text-sm font-heading font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>{adminMessage}</span>
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

                    <Button type="submit" variant="primary" className="w-full !py-3.5" disabled={isAdminSubmitting}>
                      {isAdminSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Menerbitkan Konten ke Arsip...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          <span>Terbitkan {adminType === 'archive' ? 'Dokumen PDF' : adminType === 'agenda' ? 'Agenda' : 'Artikel'} Baru</span>
                        </>
                      )}
                    </Button>
                  </form>
                </Card>

                {/* DAFTAR DOKUMENTASI TERBITAN (BISA DITAMBAH & DIHAPUS OLEH ADMIN) */}
                <div className="mt-14 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <h3 className="text-xl font-heading font-extrabold text-slate-900">
                        Daftar {adminType === 'archive' ? 'Dokumen PDF' : adminType === 'agenda' ? 'Agenda Kegiatan' : 'Artikel & Jurnal'} Aktif
                      </h3>
                      <p className="text-xs text-slate-500 font-sans mt-0.5">
                        Anda dapat memeriksa tampilan di web atau menghapus konten yang sudah tidak aktif.
                      </p>
                    </div>
                    <Badge variant="emerald">
                      Akses Penuh (Bisa Tambah & Hapus)
                    </Badge>
                  </div>

                  {/* KONTEN ARSIP DOKUMEN PDF */}
                  {adminType === 'archive' && (
                    archives.length === 0 ? (
                      <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center shadow-sm">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <h4 className="text-sm font-heading font-bold text-slate-700">Belum Ada Dokumen PDF</h4>
                        <p className="text-xs text-slate-500 mt-1">Gunakan formulir di atas untuk menambahkan dokumen arsip baru.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {archives.map((item) => (
                          <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-slate-200 transition-all">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">{item.category}</span>
                                  <span className="text-xs text-slate-400 font-sans">{item.year} • {item.pages}</span>
                                </div>
                                <h4 className="text-sm font-heading font-bold text-slate-900 truncate mt-0.5">{item.title}</h4>
                                <p className="text-xs text-slate-400 truncate">Penulis: {item.author}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                              <Button 
                                variant="outline" 
                                className="!px-3 !py-1.5 text-xs" 
                                onClick={() => setSelectedPdf(item)}
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Lihat</span>
                              </Button>
                              <Button 
                                variant="danger" 
                                className="!px-3 !py-1.5 text-xs flex items-center gap-1.5 !bg-rose-50 !text-rose-600 !border-rose-200 hover:!bg-rose-600 hover:!text-white transition-colors"
                                disabled={deletingId === item.id}
                                onClick={() => handleAdminDelete('archive', item.id, item.title)}
                              >
                                {deletingId === item.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                                <span>Hapus</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {/* KONTEN AGENDA */}
                  {adminType === 'agenda' && (
                    agendas.length === 0 ? (
                      <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center shadow-sm">
                        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <h4 className="text-sm font-heading font-bold text-slate-700">Belum Ada Agenda Terjadwal</h4>
                        <p className="text-xs text-slate-500 mt-1">Gunakan formulir di atas untuk menjadwalkan agenda atau kegiatan baru.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {agendas.map((item) => (
                          <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-slate-200 transition-all">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                <Calendar className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">{item.category}</span>
                                  <span className="text-xs text-slate-400 font-sans">{item.date} • {item.time} WIB</span>
                                </div>
                                <h4 className="text-sm font-heading font-bold text-slate-900 truncate mt-0.5">{item.title}</h4>
                                <p className="text-xs text-slate-400 truncate"><MapPin className="w-3 h-3 inline mr-1" />{item.location}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                              <Button 
                                variant="outline" 
                                className="!px-3 !py-1.5 text-xs" 
                                onClick={() => navigate(`/agenda/${item.slug || item.id}`)}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Lihat</span>
                              </Button>
                              <Button 
                                variant="danger" 
                                className="!px-3 !py-1.5 text-xs flex items-center gap-1.5 !bg-rose-50 !text-rose-600 !border-rose-200 hover:!bg-rose-600 hover:!text-white transition-colors"
                                disabled={deletingId === item.id}
                                onClick={() => handleAdminDelete('agenda', item.id, item.title)}
                              >
                                {deletingId === item.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                                <span>Hapus</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {/* KONTEN ARTIKEL */}
                  {adminType === 'article' && (
                    articles.length === 0 ? (
                      <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center shadow-sm">
                        <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <h4 className="text-sm font-heading font-bold text-slate-700">Belum Ada Artikel / Jurnal</h4>
                        <p className="text-xs text-slate-500 mt-1">Gunakan formulir di atas untuk menerbitkan artikel atau esai baru.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {articles.map((item) => (
                          <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-slate-200 transition-all">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                                <BookOpen className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">{item.category}</span>
                                  <span className="text-xs text-slate-400 font-sans">{item.date}</span>
                                </div>
                                <h4 className="text-sm font-heading font-bold text-slate-900 truncate mt-0.5">{item.title}</h4>
                                <p className="text-xs text-slate-400 truncate">Penulis: {item.author}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                              <Button 
                                variant="outline" 
                                className="!px-3 !py-1.5 text-xs" 
                                onClick={() => navigate(`/artikel/${item.slug || item.id}`)}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Lihat</span>
                              </Button>
                              <Button 
                                variant="danger" 
                                className="!px-3 !py-1.5 text-xs flex items-center gap-1.5 !bg-rose-50 !text-rose-600 !border-rose-200 hover:!bg-rose-600 hover:!text-white transition-colors"
                                disabled={deletingId === item.id}
                                onClick={() => handleAdminDelete('article', item.id, item.title)}
                              >
                                {deletingId === item.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                                <span>Hapus</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. HALAMAN BERANDA UTAMA (ROUTING / ATAU /home) */}
        {(currentPath === '/' || currentPath === '/home') && (
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
                    <Button variant="primary" onClick={() => navigate('/arsip')}>
                      <BookOpen className="w-4 h-4" />
                      Akses Portal Arsip PDF
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/agenda')}>
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
                <Button variant="ghost" onClick={() => navigate('/arsip')} className="mb-14">
                  Buka Semua Arsip PDF <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {archives.length === 0 ? (
                  <div className="md:col-span-2 py-16 text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="text-lg font-heading font-bold text-slate-700">Belum Ada Publikasi Arsip PDF</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">Dokumen riset dan arsip kebudayaan sedang dalam proses kurasi dan digitalisasi.</p>
                  </div>
                ) : (
                  archives.slice(0, 2).map((doc) => (
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
                  ))
                )}
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
                  <Button variant="ghost" onClick={() => navigate('/agenda')} className="mb-14">
                    Lihat Semua Agenda <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {agendas.length === 0 ? (
                    <div className="md:col-span-2 py-16 text-center bg-slate-50 rounded-3xl border border-slate-100 p-8 shadow-sm">
                      <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h4 className="text-lg font-heading font-bold text-slate-700">Belum Ada Agenda Mendatang</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">Rangkaian kegiatan dialog dan program seni pesisir berikutnya akan segera diumumkan.</p>
                    </div>
                  ) : (
                    agendas.slice(0, 2).map((item) => (
                      <Card 
                        key={item.id} 
                        className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        onClick={() => navigate(`/agenda/${item.slug || slugify(item.title)}`)}
                      >
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
                        <div className="mt-6 grid grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="primary" 
                            className="!px-3 !py-2.5 text-xs"
                            onClick={() => navigate(`/agenda/${item.slug || slugify(item.title)}`)}
                          >
                            Lihat Detail Agenda
                          </Button>
                          <Button 
                            variant="outline" 
                            className="!px-3 !py-2.5 text-xs"
                            onClick={() => setRegisterItem({ title: item.title, type: 'agenda' })}
                          >
                            Daftar via WA
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
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
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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

        {/* 6. HALAMAN KALENDER AGENDA LENGKAP (ROUTING /agenda) */}
        {currentPath === '/agenda' && (
          <div className="py-24 max-w-7xl mx-auto px-6">
            <SectionHeader 
              title="Kalender Agenda & Kegiatan" 
              subtitle="Temukan ruang kolaborasi, pameran visual, dan lingkaran diskusi berkala kami di Muncar." 
            />
            {agendas.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-lg font-heading font-bold text-slate-700">Belum Ada Agenda Terjadwal</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">Nantikan informasi lokakarya, temu wicara, pameran, dan ruang dialog berikutnya dari Punel Art Communication.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {agendas.map((item) => (
                  <Card 
                    key={item.id} 
                    className="flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/agenda/${item.slug || slugify(item.title)}`)}
                  >
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
                      <div className="grid grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="primary" 
                          className="!px-3 !py-2.5 text-xs"
                          onClick={() => navigate(`/agenda/${item.slug || slugify(item.title)}`)}
                        >
                          Detail Lengkap
                        </Button>
                        <Button 
                          variant="outline" 
                          className="!px-3 !py-2.5 text-xs"
                          onClick={() => setRegisterItem({ title: item.title, type: 'agenda' })}
                        >
                          Daftar Hadir
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. PORTAL ARSIP & PUBLIKASI DOKUMEN PDF (ROUTING /arsip) */}
        {currentPath === '/arsip' && (
          <div className="py-24 max-w-7xl mx-auto px-6">
            <SectionHeader 
              title="Portal Arsip Dokumen & Publikasi PDF" 
              subtitle="Laboratorium publikasi independen Punel Art Communication: monograf etnografi, cetak biru perahu, zine sastra, dan laporan ekologi laut yang dapat dibaca daring maupun diunduh bebas." 
            />

            {/* FILTER DAN SEARCH BAR */}
            <div className="mb-12 flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
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

        {/* 8. HALAMAN JURNAL & ARTIKEL LENGKAP (ROUTING /artikel) */}
        {currentPath === '/artikel' && (
          <div className="py-24 max-w-7xl mx-auto px-6">
            <SectionHeader 
              title="Jurnal, Esai & Catatan Lapangan" 
              subtitle="Hasil pengamatan etnografi, rekaman lisan nelayan, dan catatan kritis kolektif Punel Art Communication." 
            />
            {articles.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-lg font-heading font-bold text-slate-700">Belum Ada Catatan atau Artikel</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">Jurnal, esai etnografi, dan catatan lapangan baru akan segera dipublikasikan di sini.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((art) => (
                  <Card 
                    key={art.id} 
                    onClick={() => navigate(`/artikel/${art.slug || slugify(art.title)}`)}
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
            )}
          </div>
        )}

        {/* 9. HALAMAN TENTANG KAMI (ROUTING /tentang) */}
        {currentPath === '/tentang' && (
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
              <li><button onClick={() => navigate('/')} className="hover:text-sky-400 transition-colors cursor-pointer">Beranda</button></li>
              <li><button onClick={() => navigate('/agenda')} className="hover:text-sky-400 transition-colors cursor-pointer">Agenda Pesisir</button></li>
              <li><button onClick={() => navigate('/arsip')} className="hover:text-sky-400 transition-colors cursor-pointer">Arsip Dokumen PDF</button></li>
              <li><button onClick={() => navigate('/artikel')} className="hover:text-sky-400 transition-colors cursor-pointer">Jurnal & Esai</button></li>
              <li><button onClick={() => navigate('/tentang')} className="hover:text-sky-400 transition-colors cursor-pointer">Profil Tim</button></li>
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
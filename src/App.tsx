import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Calendar, BookOpen, Image as ImageIcon, 
  Users, Info, Heart, ArrowRight, MapPin, Clock, Search, 
  Download, FileText, Share2, 
  Settings, LogOut, Plus, Edit2, Trash2, Check, AlertCircle,
  Sparkles, Bot, Wand2, Loader2, Send
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const Facebook = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const Instagram = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);

// --- TIPE DATA TYPESCRIPT ---
export interface WebsiteSettings {
  id?: string;
  waNumber: string;
  qrUrl: string;
  supportText: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  description: string;
  posterUrl: string;
  status: 'open' | 'ongoing' | 'archived';
  createdAt?: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  category: string;
  imageUrl: string;
  imageCredit?: string;
  createdAt?: string;
}

export interface ArchiveItem {
  id: string;
  title: string;
  author: string;
  year: string;
  category: string;
  pages?: string;
  description: string;
  coverUrl?: string;
  pdfUrl: string;
  allowDownload: boolean;
  createdAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  photoUrl: string;
  createdAt?: string;
}

export interface RegistrationItem {
  id: string;
  eventId?: string;
  eventTitle: string;
  name: string;
  phone: string;
  email?: string;
  org?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// --- DATA AWAL (FALLBACK DEFAULT DATA) ---
const DEFAULT_SETTINGS: WebsiteSettings = {
  waNumber: '6281234567890',
  qrUrl: '',
  supportText: 'Dukungan Anda membantu kami mendokumentasikan tradisi dan menyelenggarakan ruang kesenian pesisir Muncar.'
};

const DEFAULT_AGENDAS: AgendaItem[] = [
  {
    id: '1',
    title: 'Diskusi Pesisir: Menggali Ingatan Laut',
    date: '10 Nov 2026',
    time: '15.00 WIB',
    location: 'Sekretariat Punel, Muncar',
    category: 'Diskusi',
    description: 'Diskusi rutin membedah arsip kebudayaan bahari masyarakat Muncar dalam merespons perubahan sosial dan ekologi pesisir.',
    posterUrl: 'https://images.unsplash.com/photo-1599827552599-eda794b159f8?auto=format&fit=crop&q=80&w=800',
    status: 'open',
    createdAt: '2026-10-01T08:00:00Z'
  },
  {
    id: '2',
    title: 'Pameran Fotografi: Wajah Nelayan',
    date: '01 Des 2026',
    time: '09.00 WIB',
    location: 'Galeri Kampung Nelayan Muncar',
    category: 'Pameran',
    description: 'Pameran visual mendokumentasikan keseharian, kegembiraan, dan tantangan nelayan tradisional dalam mengarungi Selat Bali.',
    posterUrl: 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=800',
    status: 'open',
    createdAt: '2026-10-05T09:00:00Z'
  }
];

const DEFAULT_ARTICLES: ArticleItem[] = [
  {
    id: '1',
    title: 'Jejak Perahu Cungkring di Pesisir Muncar',
    author: 'Tim Riset Punel',
    category: 'Riset Budaya',
    summary: 'Menelusuri sejarah, filosofi, dan arsitektur perahu tradisional yang kian punah di tengah modernisasi pesisir Selat Bali.',
    content: `Perahu Cungkring bukan sekadar alat tangkap bagi nelayan Muncar masa lalu; ia adalah representasi teknologi bahari Nusantara yang memadukan estetika, kekuatan, dan kearifan lokal dalam membaca arus Selat Bali.

Dalam beberapa dekade terakhir, populasi perahu Cungkring menurun drastis. Kayu yang semakin langka dan biaya perawatan yang tinggi membuat nelayan beralih ke perahu fiber yang lebih praktis. Namun, hilangnya Cungkring juga berarti hilangnya laku spiritual dan ritual "Petik Laut" yang biasanya menjadikan perahu jenis ini sebagai ikon utamanya.

Melalui riset ini, Punel Art Communication berusaha mendokumentasikan rupa, ukuran, dan cerita dari para pembuat perahu (undagi) terakhir di pesisir Muncar. Dokumentasi ini diharapkan menjadi arsip berharga bagi generasi mendatang bahwa kita pernah memiliki mahakarya maritim yang diakui ketangguhannya.`,
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
    imageCredit: 'Dokumentasi Punel',
    createdAt: '2026-10-01T10:00:00Z'
  },
  {
    id: '2',
    title: 'Ritual Petik Laut dan Kosmologi Masyarakat Pesisir',
    author: 'Siti Aminah',
    category: 'Tradisi',
    summary: 'Mendalami makna syukur dan relasi sakral antara masyarakat pesisir Muncar dengan laut yang memberi kehidupan.',
    content: `Setiap bulan Suro dalam kalender Jawa, pesisir Muncar bertransformasi menjadi panggung perayaan akbar. Petik Laut bukan hanya atraksi pariwisata, melainkan wujud rasa syukur masyarakat nelayan atas kelimpahan hasil laut dan permohonan keselamatan saat berlayar.

Sesaji yang dihanyutkan (larung sesaji) ke tengah laut menyimbolkan penghormatan terhadap alam. Punel Art Communication mencatat narasi-narasi lisan para tetua adat agar nilai luhur ini tidak terdistorsi menjadi komodifikasi semata.`,
    imageUrl: 'https://images.unsplash.com/photo-1544256729-9e8cfa14be0e?auto=format&fit=crop&q=80&w=800',
    imageCredit: 'Foto Koleksi Punel',
    createdAt: '2026-10-08T12:00:00Z'
  }
];

const DEFAULT_ARCHIVES: ArchiveItem[] = [
  {
    id: '1',
    title: 'Zine: Suara Ombak Vol. 1',
    author: 'Kolektif Pemuda Muncar',
    year: '2026',
    category: 'Zine Budaya',
    pages: '28',
    description: 'Kumpulan puisi, esai reflektif, dan ilustrasi karya anak muda pesisir tentang laut, rumah, dan harapan.',
    coverUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead2708?auto=format&fit=crop&q=80&w=800',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    allowDownload: true,
    createdAt: '2026-10-02T09:00:00Z'
  },
  {
    id: '2',
    title: 'Laporan Ekologi & Budaya Bahari Muncar',
    author: 'Divisi Riset Punel',
    year: '2025',
    category: 'Laporan Riset',
    pages: '54',
    description: 'Pemetaan partisipatoris mengenai kearifan lokal nelayan dalam menjaga keseimbangan ekosistem dan pesisir.',
    coverUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    allowDownload: true,
    createdAt: '2025-12-15T09:00:00Z'
  }
];

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Budi Santoso',
    role: 'Inisiator & Peneliti',
    description: 'Fokus pada sejarah maritim dan pendokumentasian narasi lisan masyarakat pesisir Muncar.',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-09-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Siti Aminah',
    role: 'Kurator Seni & Arsip',
    description: 'Mengelola program edukasi seni, kurasi pameran, dan pengarsipan digital komunitas.',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-09-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Fahmi Ayatollah',
    role: 'Komunikasi & Dokumentasi',
    description: 'Mengembangkan sistem komunikasi digital, publikasi zine, dan koordinasi aksi sosial.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    createdAt: '2026-09-01T00:00:00Z'
  }
];

// --- AI SERVICE HELPERS (GEMINI API) ---
const generateAIText = async (prompt: string, systemInstruction = ""): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 
    if (!apiKey) {
      return "Fitur bantuan AI memerlukan VITE_GEMINI_API_KEY di pengaturan environment.";
    }
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload: { contents: { parts: { text: string }[] }[]; systemInstruction?: { parts: { text: string }[] } } = {
      contents: [{ parts: [{ text: prompt }] }],
    };
    if (systemInstruction) {
      payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    return result?.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, AI tidak dapat merespons saat ini.";
  } catch (error) {
    console.error("AI Text Gen Error:", error);
    return "Terjadi kendala pada layanan AI.";
  }
};

const generateAIImage = async (prompt: string): Promise<string | null> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    if (!apiKey) return null;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
    const payload = {
      instances: [{ prompt }],
      parameters: { sampleCount: 1 }
    };
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    const base64Data = result?.predictions?.[0]?.bytesBase64Encoded;
    if (base64Data) {
      return `data:image/jpeg;base64,${base64Data}`;
    }
    return null;
  } catch (error) {
    console.error("AI Image Gen Error:", error);
    return null;
  }
};

// --- KOMPONEN UI DASAR ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'ghost';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center px-6 py-3 font-medium transition-all duration-300 rounded-none border border-transparent";
  const variants = {
    primary: "bg-slate-900 text-stone-50 hover:bg-slate-800 shadow-sm",
    secondary: "bg-stone-200 text-slate-900 hover:bg-stone-300",
    outline: "border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-stone-50",
    accent: "bg-amber-600 text-white hover:bg-amber-700 shadow-sm",
    ghost: "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-stone-200"
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-stone-50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-stone-200">
        <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-white">
          <h3 className="text-xl font-serif font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-1 transition-colors">
            <X size={22} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- APLIKASI UTAMA ---
export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'agenda' | 'agenda-detail' | 'docs' | 'doc-detail' | 'archive' | 'archive-detail' | 'about' | 'admin-login' | 'admin'>('home');
  const [viewParams, setViewParams] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Halo! Saya Asisten AI Punel Art Communiaction. Ada yang bisa kami bantu seputar arsip kebudayaan pesisir, agenda, atau kegiatan komunitas?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Data States
  const [settings, setSettings] = useState<WebsiteSettings>(DEFAULT_SETTINGS);
  const [agenda, setAgenda] = useState<AgendaItem[]>(DEFAULT_AGENDAS);
  const [articles, setArticles] = useState<ArticleItem[]>(DEFAULT_ARTICLES);
  const [archives, setArchives] = useState<ArchiveItem[]>(DEFAULT_ARCHIVES);
  const [team, setTeam] = useState<TeamMember[]>(DEFAULT_TEAM);
  const [loading, setLoading] = useState(true);

  // Fetch Data dari Supabase (dengan graceful fallback)
  const fetchPublicData = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        console.log("Supabase credentials belum dikonfigurasi di .env. Menggunakan data cadangan (fallback).");
        setLoading(false);
        return;
      }

      const [setRes, agendaRes, artRes, archRes, teamRes] = await Promise.all([
        supabase.from('punel_settings').select('*').limit(1).maybeSingle(),
        supabase.from('punel_agenda').select('*').order('createdAt', { ascending: false }),
        supabase.from('punel_articles').select('*').order('createdAt', { ascending: false }),
        supabase.from('punel_archives').select('*').order('createdAt', { ascending: false }),
        supabase.from('punel_team').select('*').order('createdAt', { ascending: true })
      ]);

      if (setRes.data) setSettings(setRes.data as WebsiteSettings);
      if (agendaRes.data && agendaRes.data.length > 0) setAgenda(agendaRes.data as AgendaItem[]);
      if (artRes.data && artRes.data.length > 0) setArticles(artRes.data as ArticleItem[]);
      if (archRes.data && archRes.data.length > 0) setArchives(archRes.data as ArchiveItem[]);
      if (teamRes.data && teamRes.data.length > 0) setTeam(teamRes.data as TeamMember[]);
    } catch (err) {
      console.warn("Gagal memuat data dari Supabase, menggunakan data cadangan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsAdmin(!!session?.user);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAdmin(!!session?.user);
      });

      fetchPublicData();

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const navigate = (view: typeof currentView, params: any = null) => {
    setCurrentView(view);
    setViewParams(params);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return timestamp;
    }
  };

  const generateWALink = (phone: string, message: string) => {
    const cleanPhone = (phone || settings.waNumber || '6281234567890').replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const handleSendChat = async () => {
    if(!chatInput.trim()) return;
    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', text: chatInput }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsChatLoading(true);
    
    const promptContext = newMessages.map(m => `${m.role === 'user' ? 'Pengunjung' : 'Asisten'}: ${m.text}`).join('\n');
    const systemPrompt = "Anda adalah Asisten AI dari Punel Art Communiaction (Putra Nelayan), komunitas kebudayaan di pesisir Muncar, Banyuwangi. Anda bertugas menjawab pertanyaan seputar kebudayaan pesisir, tradisi bahari, agenda, dan arsip komunitas. Jawablah dengan ramah, bersemangat, puitis namun tetap informatif dan ringkas.";
    const reply = await generateAIText(`Berikut adalah riwayat percakapan:\n${promptContext}\n\nBerikan tanggapan untuk pesan terakhir pengunjung.`, systemPrompt);
    
    setChatMessages([...newMessages, { role: 'model', text: reply }]);
    setIsChatLoading(false);
  };

  // --- NAVBAR ---
  const Navbar = () => (
    <header className="sticky top-0 z-40 w-full bg-stone-50/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('home')}>
            <div className="flex flex-col">
              <span className="font-serif font-black text-2xl tracking-tighter text-slate-900 leading-none">PUNEL</span>
              <span className="text-[0.65rem] font-bold tracking-[0.2em] text-amber-600 uppercase mt-1">Art Communiaction</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { id: 'home' as const, label: 'Beranda' },
              { id: 'agenda' as const, label: 'Agenda' },
              { id: 'archive' as const, label: 'Arsip Digital' },
              { id: 'docs' as const, label: 'Dokumentasi' },
              { id: 'about' as const, label: 'Tentang Kami' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`text-sm font-semibold uppercase tracking-wider transition-colors ${
                  currentView === item.id ? 'text-amber-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
            <Button variant="accent" onClick={() => setIsSupportModalOpen(true)}>
              <Heart size={16} className="mr-2" /> Dukung Punel
            </Button>
            {isAdmin && (
               <button onClick={() => navigate('admin')} className="p-2 text-slate-400 hover:text-slate-900 transition-colors" title="Panel Redaksi">
                 <Settings size={20} />
               </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
             <button onClick={() => setIsSupportModalOpen(true)} className="p-2 text-amber-600">
               <Heart size={20} />
             </button>
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-900 p-2">
               {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-stone-50 border-b border-stone-200 animate-fade-in">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {[
              { id: 'home' as const, label: 'Beranda' },
              { id: 'agenda' as const, label: 'Agenda Kegiatan' },
              { id: 'archive' as const, label: 'Arsip Digital (PDF)' },
              { id: 'docs' as const, label: 'Dokumentasi & Publikasi' },
              { id: 'about' as const, label: 'Tentang Kami' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className="block w-full text-left px-3 py-4 text-base font-medium text-slate-900 border-b border-stone-200 hover:bg-stone-100 transition-colors"
              >
                {item.label}
              </button>
            ))}
             <div className="mt-6 px-3">
              <Button variant="accent" className="w-full" onClick={() => setIsSupportModalOpen(true)}>
                <Heart size={16} className="mr-2" /> Dukung Punel (Sawer QRIS)
              </Button>
            </div>
            <div className="pt-4 px-3">
              <button onClick={() => navigate('admin-login')} className="text-xs text-slate-500 hover:text-slate-800">
                Login Redaksi Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );

  // --- FOOTER ---
  const Footer = () => (
    <footer className="bg-slate-900 text-stone-300 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h2 className="font-serif font-bold text-3xl text-stone-50 mb-2">PUTRA NELAYAN</h2>
            <p className="text-sm font-bold tracking-widest text-amber-500 uppercase mb-6">Seni . Komunikasi . Aksi</p>
            <p className="max-w-md text-slate-400 leading-relaxed mb-6">
              Kolektif independen pesisir Muncar yang bergerak merawat ingatan, merajut komunikasi, dan menghidupkan kebudayaan bahari melalui seni, riset, dan arsip digital.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-colors" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-colors" aria-label="Instagram"><Instagram size={18} /></a>
            </div>
          </div>
          <div>
            <h4 className="text-stone-50 font-semibold mb-6 uppercase tracking-wider text-sm">Jelajahi</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => navigate('home')} className="hover:text-amber-500 transition-colors">Beranda</button></li>
              <li><button onClick={() => navigate('agenda')} className="hover:text-amber-500 transition-colors">Agenda Kegiatan</button></li>
              <li><button onClick={() => navigate('docs')} className="hover:text-amber-500 transition-colors">Publikasi & Artikel</button></li>
              <li><button onClick={() => navigate('archive')} className="hover:text-amber-500 transition-colors">Arsip Digital PDF</button></li>
              <li><button onClick={() => navigate('about')} className="hover:text-amber-500 transition-colors">Tentang Kami</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-stone-50 font-semibold mb-6 uppercase tracking-wider text-sm">Kontak & Sekretariat</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start"><MapPin size={16} className="mr-2 mt-1 shrink-0 text-amber-500" /> Kawasan Pesisir Muncar, Banyuwangi, Jawa Timur, Indonesia</li>
              <li>
                <a href={generateWALink(settings.waNumber, "Halo Punel Art Communiaction, saya ingin bertanya tentang...")} target="_blank" rel="noreferrer" className="flex items-center text-stone-200 hover:text-amber-500 transition-colors">
                   Hubungi WhatsApp <ArrowRight size={14} className="ml-1"/>
                </a>
              </li>
              <li className="pt-4">
                <button onClick={() => navigate('admin-login')} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Login Redaksi (Admin)</button>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-slate-800 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Punel Art Communiaction. Tagline: Seni . Komunikasi . Aksi.</p>
          <p className="text-xs">Didukung oleh Supabase & Vercel</p>
        </div>
      </div>
    </footer>
  );

  // --- BERANDA (HOME VIEW) ---
  const HomeView = () => (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[85vh] bg-slate-900 flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1544256729-9e8cfa14be0e?auto=format&fit=crop&w=2000&q=80" 
            alt="Pesisir Muncar" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/75 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <span className="inline-block py-1 px-3 border border-amber-500/50 text-amber-400 text-xs font-bold tracking-widest uppercase mb-6">
              Muncar, Banyuwangi
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-stone-50 leading-tight mb-6">
              Seni. Komunikasi.<br/>
              <span className="text-amber-500 italic">Aksi.</span>
            </h1>
            <p className="text-lg md:text-xl text-stone-300 mb-10 max-w-2xl leading-relaxed">
              Mendokumentasikan kehidupan pesisir, merawat ingatan lokal, dan membangun ruang dialog kebudayaan melalui kerja kreatif di Muncar, Banyuwangi.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => navigate('docs')}>Jelajahi Dokumentasi</Button>
              <Button variant="outline" className="border-stone-400 text-stone-200 hover:bg-stone-100 hover:text-slate-900" onClick={() => navigate('agenda')}>
                Lihat Agenda Kegiatan
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Jurnal & Agenda Terbaru */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-stone-200 pb-6">
            <div>
              <h2 className="text-4xl font-serif font-bold text-slate-900">Jurnal & Agenda</h2>
              <p className="text-slate-500 mt-2">Catatan pergerakan budaya dan agenda kegiatan terdekat.</p>
            </div>
            <button onClick={() => navigate('docs')} className="flex items-center text-amber-700 font-semibold hover:text-amber-800 mt-4 md:mt-0 transition-colors">
              Lihat Semua Publikasi <ArrowRight size={18} className="ml-2" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Artikel Utama (Kiri) */}
            <div className="lg:col-span-7">
              {articles.length > 0 ? (
                <div className="group cursor-pointer" onClick={() => navigate('doc-detail', articles[0])}>
                  <div className="relative h-[55vh] overflow-hidden mb-6 bg-stone-200">
                    <img 
                      src={articles[0].imageUrl || 'https://images.unsplash.com/photo-1599557628330-10901e1da608?auto=format&fit=crop&w=800&q=80'} 
                      alt={articles[0].title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  </div>
                  <span className="text-amber-600 font-bold text-xs uppercase tracking-wider">{articles[0].category}</span>
                  <h3 className="text-3xl font-serif font-bold text-slate-900 mt-2 mb-4 group-hover:text-amber-700 transition-colors">
                    {articles[0].title}
                  </h3>
                  <p className="text-slate-600 line-clamp-3 mb-4">{articles[0].summary}</p>
                  <p className="text-sm text-slate-400 font-medium">{articles[0].author} — {formatDate(articles[0].createdAt)}</p>
                </div>
              ) : (
                <div className="h-[50vh] bg-stone-200 flex items-center justify-center text-slate-400">Belum ada publikasi.</div>
              )}
            </div>

            {/* Agenda List (Kanan) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-stone-200 pb-4 mb-8">Agenda Terdekat</h4>
                <div className="space-y-8">
                  {agenda.filter(a => a.status !== 'archived').slice(0, 3).map((item) => (
                    <div key={item.id} className="flex gap-6 group cursor-pointer" onClick={() => navigate('agenda-detail', item)}>
                      <div className="flex-shrink-0 w-24 h-32 bg-stone-200 overflow-hidden">
                        {item.posterUrl ? (
                           <img src={item.posterUrl} alt="Poster" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                        ) : (
                           <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300"><Calendar size={24}/></div>
                        )}
                      </div>
                      <div>
                        <span className={`text-xs font-bold px-2 py-1 uppercase tracking-wider ${item.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                          {item.status === 'open' ? 'Pendaftaran Buka' : 'Ditutup'}
                        </span>
                        <h4 className="text-lg font-serif font-bold text-slate-900 mt-3 group-hover:text-amber-600 transition-colors leading-tight">
                          {item.title}
                        </h4>
                        <div className="flex items-center text-slate-500 text-sm mt-2">
                          <Clock size={14} className="mr-1" /> {item.date} • {item.time}
                        </div>
                      </div>
                    </div>
                  ))}
                  {agenda.length === 0 && <p className="text-slate-500 italic">Belum ada agenda terdekat.</p>}
                </div>
              </div>
              <Button variant="outline" className="w-full mt-12" onClick={() => navigate('agenda')}>Lihat Seluruh Agenda</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Dukungan */}
      <section className="py-24 bg-amber-600 text-white text-center px-4">
         <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Dukung Gerakan Kebudayaan</h2>
            <p className="text-amber-100 text-lg mb-10">Setiap dukungan sukarela Anda membantu kami merawat arsip tradisi, menyelenggarakan ruang diskusi, dan mendanai aksi kebudayaan mandiri di kawasan Muncar.</p>
            <Button variant="primary" className="bg-slate-900 text-white hover:bg-slate-800 border-none text-lg px-8 py-4" onClick={() => setIsSupportModalOpen(true)}>
               <Heart size={20} className="mr-2 text-amber-400 fill-current" /> Beri Dukungan / Sawer
            </Button>
         </div>
      </section>
    </div>
  );

  // --- AGENDA VIEW ---
  const AgendaView = () => (
    <div className="min-h-screen bg-stone-50 py-16 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">Agenda Kegiatan</h1>
          <p className="text-slate-600 text-lg">Jadwal diskusi, pameran seni, lokakarya, dan aksi sosial kolektif yang diselenggarakan oleh Punel Art Communiaction.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agenda.map(item => (
            <div key={item.id} className="bg-white border border-stone-200 group flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-64 overflow-hidden bg-stone-100">
                {item.posterUrl ? (
                  <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="flex items-center justify-center h-full text-stone-300"><ImageIcon size={48} /></div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${item.status === 'open' ? 'bg-amber-500 text-white' : item.status === 'ongoing' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-white'}`}>
                    {item.status === 'open' ? 'Pendaftaran Buka' : item.status === 'ongoing' ? 'Sedang Berlangsung' : 'Selesai'}
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <span className="text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">{item.category}</span>
                <h3 className="text-xl font-serif font-bold text-slate-900 mb-3">{item.title}</h3>
                <div className="space-y-2 text-sm text-slate-600 mb-6 flex-grow">
                  <div className="flex items-start"><Calendar size={16} className="mr-2 mt-0.5 shrink-0 text-amber-600" /> {item.date}</div>
                  <div className="flex items-start"><Clock size={16} className="mr-2 mt-0.5 shrink-0 text-amber-600" /> {item.time}</div>
                  <div className="flex items-start"><MapPin size={16} className="mr-2 mt-0.5 shrink-0 text-amber-600" /> {item.location}</div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate('agenda-detail', item)}>Lihat Detail & Daftar</Button>
              </div>
            </div>
          ))}
          {agenda.length === 0 && <div className="col-span-full py-20 text-center text-slate-500">Belum ada agenda saat ini.</div>}
        </div>
      </div>
    </div>
  );

  // --- DETAIL AGENDA & FORM PENDAFTARAN ---
  const AgendaDetailView = () => {
    const item = viewParams as AgendaItem;
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', org: '', notes: '' });
    const [submitStatus, setSubmitStatus] = useState<{ loading: boolean; error: string | null; success: boolean }>({ loading: false, error: null, success: false });

    if (!item) return <div className="p-20 text-center">Data kegiatan tidak ditemukan.</div>;

    const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitStatus({ loading: true, error: null, success: false });
      
      try {
        if (!formData.name || !formData.phone) throw new Error("Nama dan Nomor WhatsApp wajib diisi.");
        
        if (isSupabaseConfigured) {
          const { error } = await supabase
            .from('punel_registrations')
            .insert([{
              eventId: item.id,
              eventTitle: item.title,
              ...formData,
              createdAt: new Date().toISOString(),
              status: 'pending'
            }]);
            
          if (error) console.warn("Supabase insert warning:", error);
        }
        
        setSubmitStatus({ loading: false, error: null, success: true });
      } catch (error: any) {
        setSubmitStatus({ loading: false, error: error.message || 'Terjadi kesalahan.', success: false });
      }
    };

    return (
      <div className="bg-stone-50 min-h-screen pb-20 animate-fade-in">
        {/* Detail Header */}
        <div className="w-full h-[40vh] md:h-[55vh] bg-slate-900 relative">
           {item.posterUrl && <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover opacity-50" />}
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
           <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white max-w-5xl mx-auto">
              <span className="bg-amber-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4 inline-block">{item.category}</span>
              <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-4">{item.title}</h1>
           </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <div className="bg-white shadow-xl flex flex-col md:flex-row border border-stone-200">
            <div className="p-8 md:p-12 md:w-2/3 border-r border-stone-100">
              <h3 className="text-xl font-serif font-bold text-slate-900 mb-6">Deskripsi Kegiatan</h3>
              <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-600 leading-relaxed">
                {item.description}
              </div>
            </div>
            <div className="p-8 md:p-12 md:w-1/3 bg-stone-50 flex flex-col">
               <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Waktu & Tempat</h3>
               <ul className="space-y-6 text-slate-700 mb-10 flex-grow">
                 <li className="flex items-start">
                   <Calendar className="mr-3 text-amber-600 mt-1 shrink-0" size={20}/>
                   <div><strong className="block text-slate-900">Tanggal</strong>{item.date}</div>
                 </li>
                 <li className="flex items-start">
                   <Clock className="mr-3 text-amber-600 mt-1 shrink-0" size={20}/>
                   <div><strong className="block text-slate-900">Waktu</strong>{item.time}</div>
                 </li>
                 <li className="flex items-start">
                   <MapPin className="mr-3 text-amber-600 mt-1 shrink-0" size={20}/>
                   <div><strong className="block text-slate-900">Lokasi</strong>{item.location}</div>
                 </li>
               </ul>
               {item.status === 'open' ? (
                 <Button className="w-full shadow-lg" onClick={() => setIsRegisterOpen(true)}>Daftar Sekarang</Button>
               ) : (
                 <div className="bg-slate-200 text-slate-600 text-center py-3 font-semibold text-sm">Pendaftaran Ditutup</div>
               )}
            </div>
          </div>
        </div>

        {/* Modal Pop-up Pendaftaran */}
        <Modal isOpen={isRegisterOpen} onClose={() => {setIsRegisterOpen(false); setSubmitStatus({loading:false, error:null, success:false});}} title={`Pendaftaran: ${item.title}`}>
          {submitStatus.success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Pendaftaran Berhasil!</h3>
              <p className="text-slate-600 mb-8 text-sm">Terima kasih atas partisipasi Anda. Klik tombol di bawah untuk konfirmasi langsung ke nomor WhatsApp resmi Punel.</p>
              <a 
                href={generateWALink(settings.waNumber, `Halo Admin Punel, saya *${formData.name}* telah mendaftar kegiatan *${item.title}*.\nAsal: ${formData.org || '-'}\nMohon informasi selanjutnya. Terima kasih.`)}
                target="_blank" rel="noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#25D366] text-white font-medium hover:bg-[#1ebd5a] transition-colors w-full shadow-md"
              >
                Konfirmasi via WhatsApp
              </a>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {submitStatus.error && (
                <div className="bg-red-50 text-red-600 p-3 text-sm flex items-start border border-red-200">
                  <AlertCircle size={16} className="mr-2 mt-0.5 shrink-0" /> {submitStatus.error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 border border-stone-300 focus:border-amber-500 outline-none" placeholder="Nama Anda" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nomor WhatsApp *</label>
                <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 border border-stone-300 focus:border-amber-500 outline-none" placeholder="08..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email <span className="text-stone-400 font-normal">(Opsional)</span></label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 border border-stone-300 focus:border-amber-500 outline-none" placeholder="email@contoh.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Asal Komunitas / Instansi</label>
                <input type="text" value={formData.org} onChange={e => setFormData({...formData, org: e.target.value})} className="w-full p-3 border border-stone-300 focus:border-amber-500 outline-none" placeholder="Nama komunitas atau umum" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-3 border border-stone-300 focus:border-amber-500 outline-none h-20 resize-none text-sm" placeholder="Pertanyaan atau catatan khusus..." />
              </div>
              <Button type="submit" className="w-full mt-4" disabled={submitStatus.loading}>
                {submitStatus.loading ? 'Menyimpan...' : 'Kirim Pendaftaran & Lanjut ke WA'}
              </Button>
            </form>
          )}
        </Modal>
      </div>
    );
  };

  // --- DOKUMENTASI & PUBLIKASI VIEW ---
  const DocumentationView = () => {
    const [filter, setFilter] = useState('Semua');
    const categories = ['Semua', ...new Set(articles.map(a => a.category))];
    const filtered = filter === 'Semua' ? articles : articles.filter(a => a.category === filter);

    return (
      <div className="bg-stone-50 min-h-screen py-16 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">Dokumentasi & Publikasi</h1>
              <p className="text-slate-600 max-w-xl text-lg">Catatan lapangan, riset maritim, dan narasi kehidupan pesisir yang ditulis oleh tim dan kontributor Punel Art Communiaction.</p>
            </div>
          </div>
          
          {/* Filter Kategori */}
          <div className="flex flex-wrap gap-2 mb-12 pb-4 border-b border-stone-200">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${filter === cat ? 'bg-slate-900 text-white' : 'bg-stone-200 text-slate-700 hover:bg-stone-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid Publikasi */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map((item, idx) => (
              <article key={item.id} className={`group cursor-pointer flex flex-col bg-white border border-stone-200 p-4 md:p-6 ${idx === 0 ? 'md:col-span-2 lg:col-span-2 md:flex-row gap-8' : ''}`} onClick={() => navigate('doc-detail', item)}>
                <div className={`overflow-hidden bg-stone-200 flex-shrink-0 ${idx === 0 ? 'md:w-1/2 h-64 md:h-[380px]' : 'h-52 w-full mb-4'}`}>
                   {item.imageUrl ? (
                     <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-stone-400"><ImageIcon size={40}/></div>
                   )}
                </div>
                <div className={`flex flex-col justify-center ${idx === 0 ? 'md:w-1/2' : ''}`}>
                  <span className="text-amber-600 font-bold text-xs uppercase tracking-wider mb-2 block">{item.category}</span>
                  <h3 className={`font-serif font-bold text-slate-900 group-hover:text-amber-700 transition-colors mb-3 leading-tight ${idx === 0 ? 'text-3xl md:text-4xl' : 'text-xl'}`}>
                    {item.title}
                  </h3>
                  <p className="text-slate-600 line-clamp-3 mb-4 text-sm leading-relaxed">{item.summary}</p>
                  <div className="text-xs font-medium text-slate-400 mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span>Oleh {item.author}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </article>
            ))}
            {filtered.length === 0 && <div className="col-span-full py-20 text-center text-slate-500">Belum ada publikasi pada kategori ini.</div>}
          </div>
        </div>
      </div>
    );
  };

  // --- DETAIL DOKUMEN / ARTIKEL ---
  const DocDetailView = () => {
    const doc = viewParams as ArticleItem;
    if (!doc) return null;

    const shareUrl = generateWALink('', `Baca artikel dari Punel Art Communiaction: *${doc.title}*`);

    return (
      <article className="bg-stone-50 min-h-screen pb-24 animate-fade-in">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
            <span className="text-amber-600 font-bold text-sm uppercase tracking-widest mb-4 inline-block">{doc.category}</span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 leading-tight mb-8">{doc.title}</h1>
            <div className="flex items-center justify-center space-x-4 text-slate-500 font-medium border-t border-b border-stone-200 py-4 mb-12 text-sm">
               <span>Penulis: <strong className="text-slate-800">{doc.author}</strong></span>
               <span>•</span>
               <span>{formatDate(doc.createdAt)}</span>
            </div>
         </div>

         {doc.imageUrl && (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
               <img src={doc.imageUrl} alt={doc.title} className="w-full max-h-[70vh] object-cover bg-stone-200 shadow-md" />
               {doc.imageCredit && <p className="text-right text-xs text-slate-400 mt-2 italic">Foto: {doc.imageCredit}</p>}
            </div>
         )}

         <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="prose prose-lg prose-slate prose-headings:font-serif prose-headings:text-slate-900 prose-a:text-amber-600 mx-auto whitespace-pre-wrap leading-relaxed text-slate-700 text-lg">
               {doc.content}
            </div>
            
            <div className="mt-16 pt-8 border-t border-stone-200 flex justify-between items-center">
               <Button variant="outline" onClick={() => navigate('docs')}><ArrowRight size={16} className="mr-2 rotate-180" /> Kembali ke Indeks</Button>
               <a href={shareUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-slate-700 hover:text-[#25D366] font-semibold transition-colors">
                  <Share2 size={18} className="mr-2" /> Bagikan via WhatsApp
               </a>
            </div>
         </div>
      </article>
    );
  };

  // --- ARSIP DIGITAL (PDF VIEWER) ---
  const ArchiveView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const filtered = archives.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.category.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <div className="bg-stone-50 min-h-screen py-16 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">Arsip Digital & Pustaka</h1>
              <p className="text-slate-600 text-lg">Koleksi zine kebudayaan, publikasi riset independen, dan dokumen bersejarah dalam format PDF yang dapat dibaca langsung.</p>
            </div>
            <div className="relative w-full md:w-72">
              <input 
                type="text" 
                placeholder="Cari judul atau arsip..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-300 focus:outline-none focus:border-amber-500 transition-colors shadow-sm"
              />
              <Search className="absolute left-3 top-3.5 text-stone-400" size={18} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filtered.map(item => (
              <div key={item.id} className="group bg-white border border-stone-200 hover:border-amber-400 transition-all flex flex-col h-full cursor-pointer shadow-sm hover:shadow-md" onClick={() => navigate('archive-detail', item)}>
                <div className="aspect-[3/4] bg-stone-200 relative overflow-hidden p-4 flex items-center justify-center">
                  {item.coverUrl ? (
                    <img src={item.coverUrl} alt="Cover" className="w-full h-full object-cover shadow-sm group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-3/4 h-5/6 bg-white shadow-md flex flex-col items-center justify-center text-stone-300 border border-stone-200">
                      <FileText size={48} className="mb-2 text-amber-600"/>
                      <span className="text-xs font-serif text-slate-600 font-bold">DOKUMEN PDF</span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">{item.category} • {item.year}</span>
                  <h4 className="font-serif font-bold text-slate-900 leading-tight mb-2 group-hover:text-amber-700">{item.title}</h4>
                  <p className="text-xs text-slate-500 mb-4 flex-grow">Penyusun: {item.author}</p>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1 group-hover:text-amber-600">
                    Buka PDF <ArrowRight size={12}/>
                  </span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="col-span-full py-20 text-center text-slate-500">Tidak ada dokumen yang sesuai pencarian.</div>}
          </div>
        </div>
      </div>
    );
  };

  // --- DETAIL ARSIP (BUILT-IN PDF READER) ---
  const ArchiveDetailView = () => {
    const doc = viewParams as ArchiveItem;
    if (!doc) return null;

    return (
      <div className="bg-stone-50 min-h-screen py-10 animate-fade-in">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-10">
           {/* Sidebar Info */}
           <div className="lg:w-1/3 flex flex-col">
              <div className="aspect-[3/4] bg-stone-200 w-2/3 lg:w-full mx-auto mb-6 shadow-xl border border-stone-200 overflow-hidden">
                 {doc.coverUrl ? <img src={doc.coverUrl} alt="Cover" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-white"><FileText size={64} className="text-stone-300"/></div>}
              </div>
              <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">{doc.title}</h1>
              <div className="text-sm text-slate-600 space-y-2 mb-6">
                <p><strong>Penulis / Penyusun:</strong> {doc.author}</p>
                <p><strong>Tahun Terbit:</strong> {doc.year}</p>
                <p><strong>Kategori:</strong> {doc.category}</p>
                {doc.pages && <p><strong>Jumlah Halaman:</strong> {doc.pages} hal</p>}
              </div>
              <p className="text-slate-700 leading-relaxed mb-8 text-sm">{doc.description}</p>
              
              <div className="flex gap-4">
                 <Button variant="outline" className="flex-1" onClick={() => navigate('archive')}><ArrowRight size={16} className="mr-2 rotate-180" /> Kembali</Button>
                 {doc.allowDownload && doc.pdfUrl && (
                   <a href={doc.pdfUrl} download target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors shadow-sm">
                     <Download size={16} className="mr-2"/> Unduh PDF
                   </a>
                 )}
              </div>
           </div>

           {/* PDF Viewer Area (Live Iframe Reader) */}
           <div className="lg:w-2/3 bg-stone-200 border border-stone-300 min-h-[75vh] flex flex-col shadow-inner relative">
              <div className="bg-slate-900 text-white p-3 flex justify-between items-center text-sm">
                 <span className="font-medium truncate pr-4">{doc.title}.pdf</span>
                 <div className="flex items-center gap-2">
                   <FileText size={16}/>
                 </div>
              </div>
              {doc.pdfUrl ? (
                 <iframe 
                   src={doc.pdfUrl} 
                   className="w-full flex-grow border-none min-h-[600px]" 
                   title={`PDF Reader: ${doc.title}`} 
                 />
              ) : (
                 <div className="flex-grow flex flex-col items-center justify-center text-stone-400 p-8 text-center">
                    <AlertCircle size={48} className="mb-4 text-stone-300"/>
                    <p>File dokumen PDF belum ditautkan.</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    );
  };

  // --- TENTANG KAMI VIEW ---
  const AboutView = () => (
    <div className="bg-stone-50 min-h-screen animate-fade-in">
       {/* Hero About */}
       <div className="bg-slate-900 text-white py-24 text-center px-4">
          <div className="max-w-3xl mx-auto">
             <span className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-3 block">Profil Kolektif</span>
             <h1 className="text-5xl font-serif font-bold mb-6">Merawat Ingatan Pesisir</h1>
             <p className="text-xl text-slate-300 leading-relaxed font-light">
               Putra Nelayan (Punel) Art Communiaction adalah ruang bersama untuk merawat ingatan, memperkuat komunikasi, dan menggerakkan aksi nyata kebudayaan di pesisir Muncar.
             </p>
          </div>
       </div>

       {/* Story Content */}
       <div className="max-w-4xl mx-auto px-4 py-20 prose prose-lg prose-slate prose-headings:font-serif prose-headings:text-slate-900 text-slate-700 leading-relaxed">
          <h2>Sejarah Singkat & Visi</h2>
          <p>
            Putra Nelayan (Punel) Art Communiaction lahir dari keresahan bersama melihat bergesernya ruang hidup dan tergerusnya tradisi maritim pesisir Muncar, Banyuwangi. Ritual Petik Laut, teknologi pembuatan perahu tradisional (seperti Perahu Cungkring), dan nyanyian laut para nelayan mulai jarang terarsip dengan baik.
          </p>
          <blockquote className="border-l-4 border-amber-600 pl-4 italic text-slate-800 my-6">
             "Seni adalah cara kami mengingat, Komunikasi adalah cara kami berserikat, dan Aksi adalah wujud nyata keberpihakan kami pada ruang hidup pesisir."
          </blockquote>
          <h2>Fokus Gerakan</h2>
          <ul>
             <li><strong>Riset & Pengarsipan Digital:</strong> Mengumpulkan memori kolektif, foto arsip, dan cerita lisan tetua nelayan dalam bentuk publikasi terbuka.</li>
             <li><strong>Seni & Lokakarya Kreatif:</strong> Membuka ruang edukasi bagi anak muda pesisir melalui fotografi, penulisan etnografi, dan pameran seni.</li>
             <li><strong>Literasi & Penerbitan Mandiri:</strong> Menerbitkan zine, buletin budaya, dan dokumen laporan secara independen.</li>
          </ul>
       </div>

       {/* Team Section */}
       <div className="bg-stone-200 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-16">
                <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">Penggerak Komunitas</h2>
                <p className="text-slate-600">Para penggerak yang merawat keberlanjutan kerja kebudayaan Punel.</p>
             </div>
             
             {team.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                 {team.map(member => (
                    <div key={member.id} className="bg-white p-8 border border-stone-300 text-center flex flex-col items-center shadow-sm">
                       <div className="w-32 h-32 rounded-full overflow-hidden bg-stone-100 mb-5 border-2 border-stone-200">
                          {member.photoUrl ? (
                            <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300"><Users size={40}/></div>
                          )}
                       </div>
                       <h3 className="font-bold text-slate-900 text-xl mb-1">{member.name}</h3>
                       <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-4">{member.role}</p>
                       <p className="text-sm text-slate-600 leading-relaxed">{member.description}</p>
                    </div>
                 ))}
               </div>
             ) : (
               <div className="text-center p-12 bg-white border border-stone-300 text-slate-500">Data tim sedang diperbarui.</div>
             )}
          </div>
       </div>
    </div>
  );

  // --- MODAL DUKUNGAN (SAWER / DONASI QRIS) ---
  const SupportModal = () => (
    <Modal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} title="Dukung Gerakan Punel">
       <div className="text-center pb-6">
          <p className="text-slate-600 mb-6 text-sm">{settings.supportText}</p>
          
          <div className="bg-white p-4 inline-block border-2 border-stone-200 rounded-xl shadow-sm mb-6 relative">
             {settings.qrUrl ? (
               <img src={settings.qrUrl} alt="QRIS Donasi" className="w-56 h-56 object-contain mx-auto" />
             ) : (
               <div className="w-56 h-56 bg-stone-100 flex flex-col items-center justify-center text-stone-400 mx-auto border border-dashed border-stone-300">
                  <ImageIcon size={48} className="mb-2 text-stone-300"/>
                  <span className="text-xs font-semibold text-slate-500">[QRIS / QR Sawer]</span>
                  <span className="text-[11px] text-slate-400 mt-1">Dikelola via Panel Admin</span>
               </div>
             )}
             <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-sm">
               Scan E-Wallet / Mobile Banking
             </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
             {['10.000', '25.000', '50.000', '100.000'].map(nom => (
               <div key={nom} className="bg-stone-100 py-2 text-xs font-bold text-slate-700 border border-stone-200">
                 Rp {nom}
               </div>
             ))}
          </div>

          <p className="text-xs text-slate-500 mb-6 text-left bg-stone-100 p-3 rounded">
            * Pindai kode QR menggunakan aplikasi mobile banking atau e-wallet (GoPay, OVO, Dana, LinkAja, ShopeePay). Nominal bersifat sukarela untuk mendukung produksi karya budaya.
          </p>

          <a 
            href={generateWALink(settings.waNumber, "Halo Admin Punel Art Communiaction, saya telah mengirimkan dukungan/sawer untuk kegiatan kolektif.")}
            target="_blank" rel="noreferrer"
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-[#25D366] text-white font-medium hover:bg-[#1ebd5a] transition-colors shadow-md"
          >
            Konfirmasi Dukungan via WhatsApp
          </a>
       </div>
    </Modal>
  );

  // --- LOGIN REDAKSI (ADMIN LOGIN) ---
  const AdminLoginView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthLoading(true); 
      setError('');
      try {
        if (!isSupabaseConfigured) {
          throw new Error("Supabase belum dikonfigurasi. Tambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env.");
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('admin');
      } catch (err: any) {
        setError(err.message || "Email atau kata sandi tidak cocok.");
      } finally {
        setAuthLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-stone-50 p-8 shadow-2xl border border-stone-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif font-bold text-slate-900">Akses Redaksi</h2>
            <p className="text-slate-500 text-sm mt-1">Panel Pengelolaan Punel Art Communiaction</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            {error && <div className="bg-red-100 text-red-700 p-3 text-sm border border-red-200">{error}</div>}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Redaksi</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 border border-stone-300 focus:border-amber-500 outline-none" placeholder="admin@punel.org" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Kata Sandi</label>
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 border border-stone-300 focus:border-amber-500 outline-none" placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={authLoading}>{authLoading ? 'Memeriksa...' : 'Masuk Panel Redaksi'}</Button>
            <button type="button" onClick={() => navigate('home')} className="w-full mt-4 text-sm text-slate-500 hover:text-slate-900 transition-colors">Kembali ke Beranda</button>
          </form>
        </div>
      </div>
    );
  };

  // --- PANEL REDAKSI (ADMIN DASHBOARD) ---
  const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'summary' | 'agenda' | 'registrations' | 'articles' | 'archives' | 'settings'>('summary');
    const [editingItem, setEditingItem] = useState<any>(null);
    const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);

    const fetchRegistrations = async () => {
      if (isSupabaseConfigured) {
        const { data } = await supabase
          .from('punel_registrations')
          .select('*')
          .order('createdAt', { ascending: false });
        if (data) setRegistrations(data as RegistrationItem[]);
      }
    };

    useEffect(() => {
      fetchRegistrations();
    }, []);

    const handleLogout = async () => {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setIsAdmin(false);
      navigate('home');
    };

    const handleDelete = async (collectionName: string, id: string) => {
      if(window.confirm('Yakin ingin menghapus data ini dari database?')) {
        if (isSupabaseConfigured) {
          await supabase.from(collectionName).delete().eq('id', id);
          fetchPublicData();
          if (collectionName === 'punel_registrations') {
             fetchRegistrations();
          }
        }
      }
    };

    // Form Agenda
    const AgendaForm = () => {
      const [form, setForm] = useState<any>(editingItem && editingItem.id ? editingItem : { title: '', date: '', time: '', location: '', category: '', description: '', posterUrl: '', status: 'open' });
      const [aiTextPrompt, setAiTextPrompt] = useState('');
      const [aiImagePrompt, setAiImagePrompt] = useState('');
      const [isGenText, setIsGenText] = useState(false);
      const [isGenImg, setIsGenImg] = useState(false);

      const save = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = { ...form, createdAt: form.createdAt || new Date().toISOString() };
        const { id, ...insertData } = data;
        
        if (isSupabaseConfigured) {
          if (editingItem && editingItem.id) {
            await supabase.from('punel_agenda').update(insertData).eq('id', editingItem.id);
          } else {
            await supabase.from('punel_agenda').insert([insertData]);
          }
          fetchPublicData();
        }
        setEditingItem(null);
      };

      const handleAiText = async () => {
        if(!aiTextPrompt) return;
        setIsGenText(true);
        const text = await generateAIText(`Tulis deskripsi acara kebudayaan menarik dengan ide: ${aiTextPrompt}`);
        setForm({...form, description: text});
        setIsGenText(false);
      };

      const handleAiImage = async () => {
        if(!aiImagePrompt) return;
        setIsGenImg(true);
        const imgUrl = await generateAIImage(`Poster seni kebudayaan pesisir, gaya ilustrasi estetis: ${aiImagePrompt}`);
        if(imgUrl) setForm({...form, posterUrl: imgUrl});
        setIsGenImg(false);
      };

      return (
        <form onSubmit={save} className="space-y-4 bg-white p-6 border border-stone-200 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 border-b pb-3 mb-4">{editingItem?.id ? 'Edit Agenda' : 'Tambah Agenda Baru'}</h3>
          <input type="text" placeholder="Judul Kegiatan" required value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="w-full p-3 border border-stone-300 focus:border-amber-500 outline-none" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Tanggal (mis: 12 Okt 2026)" required value={form.date} onChange={e=>setForm({...form, date: e.target.value})} className="w-full p-3 border border-stone-300 outline-none" />
            <input type="text" placeholder="Waktu (mis: 19.00 WIB)" required value={form.time} onChange={e=>setForm({...form, time: e.target.value})} className="w-full p-3 border border-stone-300 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <input type="text" placeholder="Lokasi" required value={form.location} onChange={e=>setForm({...form, location: e.target.value})} className="w-full p-3 border border-stone-300 outline-none" />
             <input type="text" placeholder="Kategori (mis: Diskusi, Pameran)" required value={form.category} onChange={e=>setForm({...form, category: e.target.value})} className="w-full p-3 border border-stone-300 outline-none" />
          </div>
          
          <div className="p-4 bg-stone-50 border border-stone-200">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center"><Sparkles size={14} className="mr-1 text-amber-600"/> Poster Visual</label>
             <div className="flex gap-2 mb-2">
               <input type="text" placeholder="Ide poster bantuan AI..." value={aiImagePrompt} onChange={e=>setAiImagePrompt(e.target.value)} className="flex-1 p-2 border border-stone-300 text-sm" />
               <Button type="button" variant="secondary" onClick={handleAiImage} disabled={isGenImg}>
                 {isGenImg ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
               </Button>
             </div>
             <input type="text" placeholder="Atau masukkan URL Poster (https://...)" value={form.posterUrl} onChange={e=>setForm({...form, posterUrl: e.target.value})} className="w-full p-3 border border-stone-300 outline-none text-sm" />
          </div>

          <div className="p-4 bg-stone-50 border border-stone-200">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center"><Sparkles size={14} className="mr-1 text-amber-600"/> Deskripsi Kegiatan</label>
             <div className="flex gap-2 mb-2">
               <input type="text" placeholder="Kata kunci ide narasi AI..." value={aiTextPrompt} onChange={e=>setAiTextPrompt(e.target.value)} className="flex-1 p-2 border border-stone-300 text-sm" />
               <Button type="button" variant="secondary" onClick={handleAiText} disabled={isGenText}>
                 {isGenText ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
               </Button>
             </div>
             <textarea placeholder="Deskripsi lengkap..." required value={form.description} onChange={e=>setForm({...form, description: e.target.value})} className="w-full p-3 border border-stone-300 outline-none h-32 leading-relaxed text-sm"></textarea>
          </div>

          <select value={form.status} onChange={e=>setForm({...form, status: e.target.value})} className="w-full p-3 border border-stone-300 outline-none text-sm">
            <option value="open">Pendaftaran Buka</option>
            <option value="ongoing">Sedang Berlangsung</option>
            <option value="archived">Selesai / Diarsipkan</option>
          </select>
          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" className="flex-1">Simpan ke Supabase</Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingItem(null)}>Batal</Button>
          </div>
        </form>
      );
    };

    // Form Artikel
    const ArticleForm = () => {
      const [form, setForm] = useState<any>(editingItem && editingItem.id ? editingItem : { title: '', summary: '', content: '', author: '', category: '', imageUrl: '', imageCredit: '' });
      const [aiTextPrompt, setAiTextPrompt] = useState('');
      const [isGenText, setIsGenText] = useState(false);

      const save = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = { ...form, createdAt: form.createdAt || new Date().toISOString() };
        const { id, ...insertData } = data;
        
        if (isSupabaseConfigured) {
          if (editingItem && editingItem.id) {
            await supabase.from('punel_articles').update(insertData).eq('id', editingItem.id);
          } else {
            await supabase.from('punel_articles').insert([insertData]);
          }
          fetchPublicData();
        }
        setEditingItem(null);
      };

      const handleAiText = async () => {
        if(!aiTextPrompt) return;
        setIsGenText(true);
        const text = await generateAIText(`Tuliskan draf artikel jurnalistik kebudayaan pesisir mengenai: ${aiTextPrompt}`);
        setForm({...form, content: text});
        setIsGenText(false);
      };

      return (
        <form onSubmit={save} className="space-y-4 bg-white p-6 border border-stone-200 shadow-sm">
           <h3 className="font-bold text-lg text-slate-900 border-b pb-3 mb-4">{editingItem?.id ? 'Edit Publikasi' : 'Tulis Publikasi Baru'}</h3>
           <input type="text" placeholder="Judul Artikel" required value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="w-full p-4 border border-stone-300 outline-none font-serif text-2xl font-bold text-slate-900" />
           <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Kategori (mis: Riset Budaya, Tradisi)" required value={form.category} onChange={e=>setForm({...form, category: e.target.value})} className="w-full p-3 border border-stone-300 outline-none" />
              <input type="text" placeholder="Nama Penulis" required value={form.author} onChange={e=>setForm({...form, author: e.target.value})} className="w-full p-3 border border-stone-300 outline-none" />
           </div>
           <textarea placeholder="Ringkasan singkat artikel..." required value={form.summary} onChange={e=>setForm({...form, summary: e.target.value})} className="w-full p-3 border border-stone-300 outline-none h-24 text-sm"></textarea>
           
           <div className="p-4 bg-stone-50 border border-stone-200">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center"><Sparkles size={14} className="mr-1 text-amber-600"/> Bantuan Penulisan AI</label>
             <div className="flex gap-2 mb-2">
               <input type="text" placeholder="Ide atau poin-poin artikel..." value={aiTextPrompt} onChange={e=>setAiTextPrompt(e.target.value)} className="flex-1 p-2 border border-stone-300 text-sm" />
               <Button type="button" variant="secondary" onClick={handleAiText} disabled={isGenText}>
                 {isGenText ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
               </Button>
             </div>
             <textarea placeholder="Isi artikel lengkap..." required value={form.content} onChange={e=>setForm({...form, content: e.target.value})} className="w-full p-4 border border-stone-300 outline-none h-72 font-serif leading-relaxed text-slate-800 text-sm"></textarea>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <input type="text" placeholder="URL Foto Utama (https://...)" value={form.imageUrl} onChange={e=>setForm({...form, imageUrl: e.target.value})} className="w-full p-3 border border-stone-300 outline-none text-sm" />
             <input type="text" placeholder="Kredit Foto" value={form.imageCredit} onChange={e=>setForm({...form, imageCredit: e.target.value})} className="w-full p-3 border border-stone-300 outline-none text-sm" />
           </div>

           <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" className="flex-1">Terbitkan ke Supabase</Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingItem(null)}>Batal</Button>
          </div>
        </form>
      );
    };

    // Form Pengaturan
    const SettingsForm = () => {
      const [form, setForm] = useState(settings);
      const save = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSupabaseConfigured) {
          const { data: existing } = await supabase.from('punel_settings').select('id').limit(1).maybeSingle();
          if (existing) {
            await supabase.from('punel_settings').update(form).eq('id', existing.id);
          } else {
            await supabase.from('punel_settings').insert([form]);
          }
          alert("Pengaturan berhasil disimpan ke Supabase.");
          fetchPublicData();
        } else {
          setSettings(form);
          alert("Tersimpan di memori lokal.");
        }
      };
      return (
        <form onSubmit={save} className="space-y-4 max-w-xl bg-white p-6 border border-stone-200">
           <div>
             <label className="font-bold block mb-1 text-sm">Nomor WhatsApp Utama</label>
             <input type="text" value={form.waNumber} onChange={e=>setForm({...form, waNumber: e.target.value})} className="w-full p-3 border border-stone-300 outline-none" placeholder="6281234567890" />
             <p className="text-xs text-slate-500 mt-1">Gunakan format internasional tanpa + (misal: 62812...)</p>
           </div>
           <div>
             <label className="font-bold block mb-1 text-sm">URL Gambar QR Donasi / Sawer</label>
             <input type="text" value={form.qrUrl} onChange={e=>setForm({...form, qrUrl: e.target.value})} className="w-full p-3 border border-stone-300 outline-none" placeholder="https://..." />
             <p className="text-xs text-slate-500 mt-1">Tautkan URL gambar QRIS yang valid dari Supabase Storage atau CDN.</p>
           </div>
           <div>
             <label className="font-bold block mb-1 text-sm">Teks Deskripsi Modal Dukungan</label>
             <textarea value={form.supportText} onChange={e=>setForm({...form, supportText: e.target.value})} className="w-full p-3 border border-stone-300 outline-none h-24 text-sm" />
           </div>
           <Button type="submit">Simpan Pengaturan</Button>
        </form>
      );
    };

    return (
      <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
        {/* Sidebar Redaksi */}
        <div className="w-full md:w-64 bg-slate-900 text-stone-300 flex flex-col h-auto md:min-h-screen shrink-0">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-white font-serif font-bold text-xl">Panel Redaksi</h2>
            <p className="text-xs text-amber-500 mt-1 font-semibold uppercase">PUNEL Art Communiaction</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {[
              { id: 'summary' as const, icon: Info, label: 'Ringkasan' },
              { id: 'agenda' as const, icon: Calendar, label: 'Kelola Agenda' },
              { id: 'registrations' as const, icon: Users, label: 'Pendaftar Acara' },
              { id: 'articles' as const, icon: BookOpen, label: 'Publikasi' },
              { id: 'archives' as const, icon: FileText, label: 'Arsip PDF' },
              { id: 'settings' as const, icon: Settings, label: 'Pengaturan' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => {setActiveTab(tab.id); setEditingItem(null);}} 
                className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-amber-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <tab.icon size={18} className="mr-3" /> {tab.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800">
             <button onClick={() => navigate('home')} className="w-full flex items-center px-4 py-2 text-sm text-slate-400 hover:text-white mb-2"><Heart size={16} className="mr-2"/> Ke Beranda</button>
             <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:text-red-300"><LogOut size={16} className="mr-2"/> Keluar</button>
          </div>
        </div>

        {/* Area Konten Redaksi */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-stone-50">
           {activeTab === 'summary' && (
             <div>
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">Ringkasan Sistem</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   <div className="bg-white p-6 border border-stone-200 shadow-sm text-center"><h3 className="text-4xl font-bold text-slate-900 mb-2">{agenda.length}</h3><p className="text-xs text-slate-500 uppercase font-bold">Total Agenda</p></div>
                   <div className="bg-white p-6 border border-stone-200 shadow-sm text-center"><h3 className="text-4xl font-bold text-slate-900 mb-2">{articles.length}</h3><p className="text-xs text-slate-500 uppercase font-bold">Publikasi Artikel</p></div>
                   <div className="bg-white p-6 border border-stone-200 shadow-sm text-center"><h3 className="text-4xl font-bold text-slate-900 mb-2">{archives.length}</h3><p className="text-xs text-slate-500 uppercase font-bold">Arsip PDF</p></div>
                   <div className="bg-white p-6 border border-stone-200 shadow-sm text-center"><h3 className="text-4xl font-bold text-amber-600 mb-2">{registrations.length}</h3><p className="text-xs text-slate-500 uppercase font-bold">Total Pendaftar</p></div>
                </div>
                <div className="mt-8 p-6 bg-white border border-stone-200">
                  <h4 className="font-bold text-slate-800 mb-2">Status Koneksi Supabase</h4>
                  <p className="text-sm text-slate-600">
                    {isSupabaseConfigured ? (
                      <span className="text-green-600 font-bold flex items-center gap-2"><Check size={16} /> Terhubung ke Supabase PostgreSQL API</span>
                    ) : (
                      <span className="text-amber-600 font-bold flex items-center gap-2"><AlertCircle size={16} /> Berjalan dalam mode lokal / fallback. Tambahkan kredensial di file .env.</span>
                    )}
                  </p>
                </div>
             </div>
           )}

           {activeTab === 'agenda' && (
             <div>
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-serif font-bold text-slate-900">Kelola Agenda Kegiatan</h2>
                 {!editingItem && <Button onClick={() => setEditingItem({})}><Plus size={16} className="mr-2"/> Tambah Agenda</Button>}
               </div>
               {editingItem ? <AgendaForm /> : (
                 <div className="bg-white border border-stone-200 overflow-x-auto shadow-sm">
                   <table className="w-full text-left text-sm">
                     <thead className="bg-stone-100 text-slate-600 uppercase text-xs">
                       <tr><th className="p-4">Kegiatan</th><th className="p-4">Tanggal</th><th className="p-4">Status</th><th className="p-4">Aksi</th></tr>
                     </thead>
                     <tbody className="divide-y divide-stone-200">
                       {agenda.map(item => (
                         <tr key={item.id} className="hover:bg-stone-50">
                           <td className="p-4 font-medium text-slate-900">{item.title}</td>
                           <td className="p-4 text-slate-500">{item.date}</td>
                           <td className="p-4"><span className="px-2 py-1 bg-stone-200 text-xs uppercase font-bold">{item.status}</span></td>
                           <td className="p-4 flex gap-2">
                             <button onClick={() => setEditingItem(item)} className="p-2 text-blue-600 hover:bg-blue-50" title="Edit"><Edit2 size={16}/></button>
                             <button onClick={() => handleDelete('punel_agenda', item.id)} className="p-2 text-red-600 hover:bg-red-50" title="Hapus"><Trash2 size={16}/></button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
             </div>
           )}

           {activeTab === 'articles' && (
             <div>
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-serif font-bold text-slate-900">Publikasi & Dokumentasi</h2>
                 {!editingItem && <Button onClick={() => setEditingItem({})}><Plus size={16} className="mr-2"/> Tulis Artikel</Button>}
               </div>
               {editingItem ? <ArticleForm /> : (
                 <div className="grid gap-4">
                   {articles.map(item => (
                     <div key={item.id} className="bg-white p-4 border border-stone-200 flex justify-between items-center shadow-sm">
                       <div>
                         <h4 className="font-bold text-slate-900">{item.title}</h4>
                         <p className="text-xs text-slate-500 mt-1">{item.category} • Penulis: {item.author}</p>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => setEditingItem(item)} className="px-3 py-1 text-sm border border-slate-300 hover:bg-slate-100">Edit</button>
                          <button onClick={() => handleDelete('punel_articles', item.id)} className="px-3 py-1 text-sm bg-red-50 text-red-600 hover:bg-red-100">Hapus</button>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           )}

           {activeTab === 'registrations' && (
             <div>
               <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">Data Pendaftar Agenda</h2>
               <div className="bg-white border border-stone-200 overflow-x-auto shadow-sm">
                   <table className="w-full text-left text-sm">
                     <thead className="bg-stone-100 text-slate-600 uppercase text-xs">
                       <tr><th className="p-4">Nama Lengkap</th><th className="p-4">WhatsApp</th><th className="p-4">Kegiatan</th><th className="p-4">Waktu Daftar</th><th className="p-4">Aksi</th></tr>
                     </thead>
                     <tbody className="divide-y divide-stone-200">
                       {registrations.map(reg => (
                         <tr key={reg.id} className="hover:bg-stone-50">
                           <td className="p-4 font-medium">{reg.name}<br/><span className="text-xs text-slate-400 font-normal">{reg.org || '-'}</span></td>
                           <td className="p-4"><a href={generateWALink(reg.phone, `Halo ${reg.name}, konfirmasi pendaftaran kegiatan ${reg.eventTitle}`)} target="_blank" rel="noreferrer" className="text-green-600 hover:underline font-bold">{reg.phone}</a></td>
                           <td className="p-4 text-slate-700">{reg.eventTitle}</td>
                           <td className="p-4 text-slate-500 text-xs">{formatDate(reg.createdAt)}</td>
                           <td className="p-4">
                             <button onClick={() => handleDelete('punel_registrations', reg.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button>
                           </td>
                         </tr>
                       ))}
                       {registrations.length === 0 && (
                         <tr><td colSpan={5} className="p-8 text-center text-slate-500">Belum ada data pendaftar.</td></tr>
                       )}
                     </tbody>
                   </table>
                 </div>
             </div>
           )}

           {activeTab === 'archives' && (
             <div className="text-center py-16 bg-white border border-stone-200">
                <FileText size={48} className="mx-auto text-amber-600 mb-4"/>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Manajemen Dokumen Arsip PDF</h3>
                <p className="text-slate-500 max-w-md mx-auto text-sm">
                  Kelola dokumen PDF melalui tabel <code>punel_archives</code> di Supabase. Anda dapat mengunggah berkas PDF ke Supabase Storage dan menautkan URL-nya ke tabel arsip.
                </p>
             </div>
           )}
           
           {activeTab === 'settings' && (
             <div>
               <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">Pengaturan Website</h2>
               <SettingsForm />
             </div>
           )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center font-serif text-slate-500 italic">Memuat Punel Art Communiaction...</div>;

  if (currentView === 'admin-login' && !isAdmin) return <AdminLoginView />;
  if (currentView === 'admin' && isAdmin) return <AdminDashboard />;

  return (
    <div className="bg-stone-50 text-slate-800 font-sans min-h-screen flex flex-col selection:bg-amber-200 selection:text-amber-900">
      <Navbar />
      
      <main className="flex-grow">
        {currentView === 'home' && <HomeView />}
        {currentView === 'agenda' && <AgendaView />}
        {currentView === 'agenda-detail' && <AgendaDetailView />}
        {currentView === 'docs' && <DocumentationView />}
        {currentView === 'doc-detail' && <DocDetailView />}
        {currentView === 'archive' && <ArchiveView />}
        {currentView === 'archive-detail' && <ArchiveDetailView />}
        {currentView === 'about' && <AboutView />}
      </main>

      <Footer />
      <SupportModal />
      
      {/* Tombol WhatsApp Mengambang */}
      {currentView !== 'admin' && (
        <a 
          href={generateWALink(settings.waNumber, "Halo Punel Art Communiaction, saya ingin bertanya tentang...")}
          target="_blank" rel="noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-40"
          aria-label="Chat WhatsApp Resmi"
          title="Chat WhatsApp Resmi"
        >
          <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        </a>
      )}

      {/* Floating PunelBot AI Assistant */}
      {currentView !== 'admin' && (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
          {isChatOpen && (
            <div className="w-80 sm:w-96 bg-white shadow-2xl border border-stone-200 mb-4 flex flex-col overflow-hidden animate-fade-in origin-bottom-right rounded-t-xl rounded-bl-xl">
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <Bot size={20} className="mr-2 text-amber-500" />
                  <span className="font-serif font-bold">PunelBot AI</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={18} /></button>
              </div>
              
              <div className="flex-1 p-4 h-80 overflow-y-auto bg-stone-50 space-y-4 text-sm flex flex-col">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-amber-100 text-amber-900 rounded-tr-none' : 'bg-white border border-stone-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                   <div className="flex justify-start">
                     <div className="max-w-[85%] p-3 rounded-2xl bg-white border border-stone-200 text-slate-400 rounded-tl-none shadow-sm flex items-center">
                       <Loader2 size={16} className="animate-spin mr-2" /> Mengetik...
                     </div>
                   </div>
                )}
              </div>
              
              <div className="p-3 bg-white border-t border-stone-200 flex gap-2">
                <input 
                  type="text" 
                  placeholder="Tanya seputar budaya pesisir..." 
                  className="flex-1 p-2 bg-stone-100 border border-stone-200 text-sm outline-none focus:border-amber-500 transition-colors rounded-full px-4"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                  disabled={isChatLoading}
                />
                <button 
                  onClick={handleSendChat}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-amber-600 transition-colors disabled:bg-slate-300"
                  aria-label="Kirim Pesan"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isChatOpen ? 'bg-slate-700 text-white rotate-12 scale-90' : 'bg-amber-500 text-white hover:scale-110 hover:bg-amber-600'}`}
            aria-label="Asisten AI Punel"
            title="Tanya Asisten AI"
          >
            {isChatOpen ? <X size={24} /> : <Sparkles size={24} />}
          </button>
        </div>
      )}
    </div>
  );
}
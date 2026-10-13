import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, onSnapshot, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Menu, X, ArrowRight, Calendar, MapPin, Clock, BookOpen, Users, Heart, FileText, Image as ImageIcon, CheckCircle, ChevronRight, Download, Lock, Search, PlayCircle, Tag, GraduationCap, ArrowLeft } from 'lucide-react';

// --- FIREBASE INITIALIZATION (MANDATORY PATTERN) ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'punel-art-app';

// --- MOCK DATA FOR FALLBACK ---
const MOCK_AGENDAS = [
  { id: '1', title: 'Diskusi Pesisir: Menggali Ingatan Laut', date: '2026-11-10', time: '15:00', location: 'Sekretariat Muncar', status: 'upcoming', category: 'diskusi', description: 'Diskusi rutin membedah arsip kebudayaan bahari masyarakat Muncar dalam menghadapi perubahan iklim.', image: 'https://images.unsplash.com/photo-1599827552599-eda794b159f8?auto=format&fit=crop&q=80&w=800' },
  { id: '2', title: 'Pameran Fotografi: Wajah Nelayan', date: '2026-12-01', time: '09:00', location: 'Galeri Kampung', status: 'upcoming', category: 'seni', description: 'Pameran visual mendokumentasikan keseharian, kegembiraan, dan tantangan nelayan tradisional saat ini.', image: 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=800' }
];

const MOCK_ARTICLES = [
  { id: '1', title: 'Jejak Perahu Cungkring di Muncar', author: 'Tim Riset Punel', date: '2026-10-01', category: 'riset', summary: 'Menelusuri sejarah, arsitektur, dan nilai filosofis perahu tradisional yang kian punah di tengah modernisasi pesisir.', content: 'Perahu Cungkring bukan sekadar alat tangkap bagi nelayan Muncar masa lalu; ia adalah representasi teknologi bahari Nusantara yang memadukan estetika, kekuatan, dan kearifan lokal dalam membaca arus Selat Bali.\n\nDalam beberapa dekade terakhir, populasi perahu Cungkring menurun drastis. Kayu yang semakin langka dan biaya perawatan yang tinggi membuat nelayan beralih ke perahu fiber yang lebih praktis. Namun, hilangnya Cungkring juga berarti hilangnya laku spiritual dan ritual "Petik Laut" yang biasanya menjadikan perahu jenis ini sebagai ikon utamanya.\n\nMelalui riset ini, Punel Art Communication berusaha mendokumentasikan rupa, ukuran, dan cerita dari para pembuat perahu (undagi) terakhir di pesisir Muncar. Dokumentasi ini diharapkan menjadi arsip berharga bagi generasi mendatang bahwa kita pernah memiliki mahakarya maritim yang diakui ketangguhannya.', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800' }
];

const MOCK_CLASSES = [
  { id: '1', title: 'Kelas Menulis Etnografi Pesisir', date: '2026-11-20', time: '13:00', location: 'Sekretariat Punel', price: '150000', instructor: 'Budi Santoso', description: 'Pelatihan intensif 2 hari tentang teknik wawancara, observasi partisipatoris, dan penulisan narasi budaya lokal pesisir. Kuota terbatas 15 orang.', image: 'https://images.unsplash.com/photo-1455390582262-044cdead2708?auto=format&fit=crop&q=80&w=800' },
  { id: '2', title: 'Lokakarya Fotografi Dokumenter', date: '2026-12-05', time: '09:00', location: 'Pelabuhan Muncar', price: '250000', instructor: 'Siti Aminah', description: 'Belajar merekam realitas sosial nelayan dengan pendekatan story-telling visual. Termasuk sesi praktik di lapangan (hunting) dan kurasi foto.', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800' }
];

const MOCK_TEAM = [
  { id: '1', name: 'Budi Santoso', role: 'Inisiator & Peneliti', bio: 'Fokus pada sejarah maritim dan pendokumentasian narasi lokal pesisir.', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400' },
  { id: '2', name: 'Siti Aminah', role: 'Kurator Seni', bio: 'Mengelola program edukasi seni dan pameran komunitas untuk anak muda.', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400' }
];

// --- MODERN STYLES ---
const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
  
  :root {
    --color-bg: #f8fafc;
    --color-surface: #ffffff;
    --color-primary: #0284c7; /* Ocean Blue */
    --color-primary-dark: #0369a1;
    --color-secondary: #0f172a; /* Slate Dark */
    --color-accent: #f97316; /* Coral Orange */
    --color-accent-hover: #ea580c;
  }
  
  body {
    background-color: var(--color-bg);
    color: var(--color-secondary);
    font-family: 'DM Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  
  h1, h2, h3, h4, h5, .font-heading {
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  /* Smooth scroll & modern scrollbar */
  html { scroll-behavior: smooth; }
  ::-webkit-scrollbar { width: 10px; }
  ::-webkit-scrollbar-track { background: var(--color-bg); }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 2px solid var(--color-bg); }
  ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

// --- MODERN UI COMPONENTS ---
const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = "px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95";
  const variants = {
    primary: "bg-[#0284c7] text-white hover:bg-[#0369a1] hover:shadow-lg hover:shadow-sky-500/30",
    outline: "bg-white text-[#0f172a] border-2 border-slate-200 hover:border-[#0284c7] hover:text-[#0284c7] hover:shadow-md",
    accent: "bg-[#f97316] text-white hover:bg-[#ea580c] hover:shadow-lg hover:shadow-orange-500/30",
    ghost: "text-[#0284c7] hover:bg-sky-50"
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

const SectionHeader = ({ title, subtitle, align = 'left' }) => (
  <div className={`mb-12 ${align === 'center' ? 'text-center' : ''}`}>
    <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4 tracking-tight text-slate-900">{title}</h2>
    {subtitle && <p className={`text-lg text-slate-500 max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`}>{subtitle}</p>}
    <div className={`w-20 h-1.5 bg-[#f97316] rounded-full mt-6 ${align === 'center' ? 'mx-auto' : ''}`}></div>
  </div>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    blue: "bg-sky-100 text-sky-700",
    orange: "bg-orange-100 text-orange-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
};

// --- MAIN APPLICATION COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPath, setCurrentPath] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data States
  const [agendas, setAgendas] = useState(MOCK_AGENDAS);
  const [articles, setArticles] = useState(MOCK_ARTICLES);
  const [classes, setClasses] = useState(MOCK_CLASSES);
  const [team, setTeam] = useState(MOCK_TEAM);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Helper to safely format WhatsApp message
  const formatWAMessage = (text) => encodeURIComponent(text);
  const waNumber = "6281234567890";

  // 1. Auth Setup
  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error("Auth Error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); });
    return () => unsubscribe();
  }, []);

  // 2. Data Fetching
  useEffect(() => {
    if (!user || !db) {
      setLoading(false);
      return;
    }
    const fetchData = () => {
      const agendasRef = collection(db, 'artifacts', appId, 'public', 'data', 'agendas');
      const unsubsAgendas = onSnapshot(agendasRef, 
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (data.length > 0) setAgendas(data);
        },
        (err) => console.error("Error fetching agendas:", err)
      );

      const articlesRef = collection(db, 'artifacts', appId, 'public', 'data', 'articles');
      const unsubsArticles = onSnapshot(articlesRef, 
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (data.length > 0) setArticles(data);
        },
        (err) => console.error("Error fetching articles:", err)
      );

      const classesRef = collection(db, 'artifacts', appId, 'public', 'data', 'classes');
      const unsubsClasses = onSnapshot(classesRef, 
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (data.length > 0) setClasses(data);
        },
        (err) => console.error("Error fetching classes:", err)
      );

      const teamRef = collection(db, 'artifacts', appId, 'public', 'data', 'team');
      const unsubsTeam = onSnapshot(teamRef, 
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (data.length > 0) setTeam(data);
          setLoading(false);
        },
        (err) => console.error("Error fetching team:", err)
      );
      return () => { unsubsAgendas(); unsubsArticles(); unsubsClasses(); unsubsTeam(); };
    };
    return fetchData();
  }, [user]);

  const navigate = (path) => {
    setCurrentPath(path);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const Home = () => (
    <div className="animate-fadeIn">
      {/* Modern Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-sky-100 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-orange-50 rounded-full blur-3xl opacity-50 -z-10"></div>
        
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="max-w-2xl">
              <Badge color="orange">Kolektif Kebudayaan</Badge>
              <h1 className="text-5xl md:text-7xl font-heading font-extrabold leading-[1.1] mt-6 mb-6 text-slate-900 tracking-tight">
                Seni. Komunikasi.<br />
                <span className="text-[#0284c7]">Aksi.</span>
              </h1>
              <p className="text-lg md:text-xl mb-10 text-slate-600 leading-relaxed font-medium">
                Mendokumentasikan kehidupan pesisir, merawat arsip lokal, dan membangun ruang dialog melalui pendekatan kreatif di Muncar, Banyuwangi.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => navigate('agendas')}>Jelajahi Agenda</Button>
                <Button variant="outline" onClick={() => navigate('classes')}><GraduationCap size={20} /> Kelas & Pelatihan</Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                <img 
                  src="https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=1200" 
                  alt="Masyarakat Pesisir" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              </div>
              {/* Floating Element */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 max-w-[240px] animate-bounce-slow hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                    <Heart size={24} className="fill-current" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-slate-900">100+ Aksi</p>
                    <p className="text-sm text-slate-500">Terdokumentasi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro / Manifesto */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <SectionHeader title="Catatan Pinggir Pantai" subtitle="Merekam jejak yang kerap luput dari sejarah arus utama." align="center" />
          <p className="text-lg md:text-xl leading-relaxed text-slate-600 mb-12 font-medium">
            Punel Art Communication lahir dari kesadaran bahwa pesisir bukan sekadar ruang eksploitasi, melainkan rahim kebudayaan yang terus berdenyut. Melalui lensa kamera, guratan pena, dan interaksi langsung, kami menjaga ingatan.
          </p>
          <div className="rounded-[2.5rem] overflow-hidden shadow-xl h-64 md:h-96">
            <img src="https://images.unsplash.com/photo-1544256718-3b610a088d43?auto=format&fit=crop&q=80&w=1200" alt="Nelayan" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" />
          </div>
        </div>
      </section>

      {/* Recent Agendas */}
      <section className="py-24 container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <SectionHeader title="Agenda Terdekat" subtitle="Ruang perjumpaan, diskusi, dan aksi bersama." />
          <Button variant="ghost" onClick={() => navigate('agendas')} className="mb-6 md:mb-12">Lihat Semua Agenda <ArrowRight size={18}/></Button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {agendas.filter(a => a.status === 'upcoming').slice(0, 2).map(agenda => (
            <Card key={agenda.id} className="group cursor-pointer p-4 md:p-6" onClick={() => navigate('agendas')}>
              <div className="rounded-2xl overflow-hidden mb-6 aspect-[16/10]">
                <img src={agenda.image} alt={agenda.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="px-2">
                <div className="flex items-center gap-3 mb-4">
                  <Badge color="orange">{agenda.category}</Badge>
                  <span className="text-sm font-medium text-slate-500 flex items-center gap-1"><Calendar size={14}/> {agenda.date}</span>
                </div>
                <h3 className="text-2xl font-heading font-bold mb-3 text-slate-900 group-hover:text-[#0284c7] transition-colors line-clamp-2">{agenda.title}</h3>
                <p className="text-slate-600 mb-4 line-clamp-2">{agenda.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );

  const Agendas = () => {
    const [selectedAgenda, setSelectedAgenda] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const handleRegisterClick = (agenda) => {
      setSelectedAgenda(agenda);
      setShowForm(true);
    };

    return (
      <div className="pt-32 pb-24 container mx-auto px-6 max-w-7xl animate-fadeIn">
        <SectionHeader title="Agenda & Kegiatan" subtitle="Jadwal diskusi, pameran, lokakarya, dan aksi sosial kolektif." align="center" />
        
        <div className="grid gap-8 mt-12 max-w-5xl mx-auto">
          {agendas.map(agenda => (
            <Card key={agenda.id} className="p-0 overflow-hidden flex flex-col md:flex-row group">
              <div className="md:w-2/5 h-64 md:h-auto relative overflow-hidden">
                <img src={agenda.image} alt={agenda.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4">
                   <Badge color={agenda.status === 'upcoming' ? 'orange' : 'slate'}>
                    {agenda.status === 'upcoming' ? 'Mendatang' : 'Arsip'}
                  </Badge>
                </div>
              </div>
              
              <div className="p-6 md:p-8 flex flex-col justify-center flex-1">
                <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500 mb-3">
                  <span className="flex items-center gap-1"><Calendar size={16} className="text-[#0284c7]"/> {agenda.date}</span>
                  <span className="flex items-center gap-1"><Clock size={16} className="text-[#0284c7]"/> {agenda.time} WIB</span>
                  <span className="flex items-center gap-1"><MapPin size={16} className="text-[#0284c7]"/> {agenda.location}</span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-heading font-bold mb-4 text-slate-900">{agenda.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-8 line-clamp-3">{agenda.description}</p>
                
                {agenda.status === 'upcoming' && (
                  <div className="mt-auto">
                    <Button onClick={() => handleRegisterClick(agenda)}>Daftar Sekarang</Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Modern Registration Modal */}
        {showForm && selectedAgenda && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 md:p-10 max-w-md w-full relative animate-fadeIn shadow-2xl">
              <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
              
              <div className="mb-8">
                <Badge color="orange">Form Pendaftaran</Badge>
                <h3 className="text-2xl font-heading font-bold mt-4 mb-2 text-slate-900">Ikut Serta</h3>
                <p className="text-slate-500 text-sm font-medium">{selectedAgenda.title}</p>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData);
                try {
                  if(db && user) {
                    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'registrations'), {
                      ...data, agendaId: selectedAgenda.id, agendaTitle: selectedAgenda.title, timestamp: new Date().toISOString()
                    });
                  }
                  const msg = `Halo Admin Punel, saya ingin mengkonfirmasi pendaftaran untuk:\n\n*${selectedAgenda.title}*\nNama: ${data.name}\nInstansi: ${data.instansi}\n\nTerima kasih.`;
                  window.open(`https://wa.me/${waNumber}?text=${formatWAMessage(msg)}`, '_blank');
                  setShowForm(false);
                } catch (err) { alert("Gagal mendaftar. Silakan coba lagi."); }
              }} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap *</label>
                  <input required name="name" type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:bg-white transition-all" placeholder="Masukkan nama Anda" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">No. WhatsApp *</label>
                  <input required name="phone" type="tel" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:bg-white transition-all" placeholder="08..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Asal Komunitas/Instansi</label>
                  <input name="instansi" type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:bg-white transition-all" placeholder="Opsional" />
                </div>
                <div className="pt-4">
                  <Button type="submit" className="w-full">Kirim & Lanjut ke WhatsApp</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Journal = () => (
    <div className="pt-32 pb-24 container mx-auto px-6 max-w-7xl animate-fadeIn">
      <SectionHeader title="Jurnal & Dokumentasi" subtitle="Catatan lapangan, esai, dan liputan visual dari pesisir Muncar." align="center" />
      
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        {articles.map((article, idx) => (
          <Card 
            key={article.id} 
            className={`${idx === 0 ? 'md:col-span-3 grid md:grid-cols-2 gap-8 p-0 overflow-hidden' : 'p-0 overflow-hidden'} group cursor-pointer flex flex-col`}
            onClick={() => { setSelectedArticle(article); navigate('article-detail'); }}
          >
            <div className={`overflow-hidden ${idx === 0 ? 'h-full min-h-[300px]' : 'aspect-video'}`}>
              <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className={`flex flex-col justify-center p-6 ${idx === 0 ? 'md:p-10' : ''} flex-1`}>
              <div className="flex items-center gap-3 mb-4">
                <Badge color="blue">{article.category}</Badge>
                <span className="text-sm font-medium text-slate-500">{article.date}</span>
              </div>
              <h3 className={`${idx === 0 ? 'text-3xl md:text-4xl' : 'text-xl'} font-heading font-bold mb-4 text-slate-900 group-hover:text-[#0284c7] transition-colors leading-tight`}>
                {article.title}
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed line-clamp-3">{article.summary}</p>
              
              <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                    {article.author.charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{article.author}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-[#0284c7] group-hover:bg-[#0284c7] group-hover:text-white transition-colors">
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const ArticleDetail = () => {
    if (!selectedArticle) {
      navigate('journal');
      return null;
    }
    
    return (
      <div className="pt-32 pb-24 container mx-auto px-6 max-w-4xl animate-fadeIn bg-white">
        <button onClick={() => navigate('journal')} className="flex items-center gap-2 text-slate-500 hover:text-[#0284c7] font-bold mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Jurnal
        </button>
        
        <div className="mb-8">
          <Badge color="blue">{selectedArticle.category}</Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mt-6 mb-6 text-slate-900 leading-tight">{selectedArticle.title}</h1>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500 border-b border-slate-100 pb-8">
            <span className="flex items-center gap-2 font-bold text-slate-700">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                {selectedArticle.author.charAt(0)}
              </div>
              {selectedArticle.author}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1"><Calendar size={16}/> {selectedArticle.date}</span>
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden mb-12 shadow-xl">
          <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-auto object-cover max-h-[500px]" />
        </div>

        <article className="prose prose-lg md:prose-xl prose-slate max-w-none font-medium leading-relaxed">
          {selectedArticle.content?.split('\n').map((paragraph, i) => (
            <p key={i} className="mb-6">{paragraph}</p>
          ))}
        </article>
      </div>
    );
  };

  const Classes = () => {
    const [selectedClass, setSelectedClass] = useState(null);
    const [showClassForm, setShowClassForm] = useState(false);

    const handleRegisterClick = (cls) => {
      setSelectedClass(cls);
      setShowClassForm(true);
    };

    return (
      <div className="pt-32 pb-24 container mx-auto px-6 max-w-7xl animate-fadeIn">
        <SectionHeader title="Kelas & Pelatihan" subtitle="Program berbayar untuk mengasah skill kreatif dan metodologi riset pesisir." align="center" />
        
        <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-5xl mx-auto">
          {classes.map(cls => (
            <Card key={cls.id} className="p-0 overflow-hidden flex flex-col group">
              <div className="h-56 relative overflow-hidden">
                <img src={cls.image} alt={cls.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg font-bold text-[#0284c7] flex items-center gap-2">
                  <Tag size={16} /> Rp {parseInt(cls.price).toLocaleString('id-ID')}
                </div>
              </div>
              
              <div className="p-6 md:p-8 flex flex-col justify-center flex-1">
                <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500 mb-3">
                  <span className="flex items-center gap-1"><Calendar size={16} className="text-[#f97316]"/> {cls.date}</span>
                  <span className="flex items-center gap-1"><Users size={16} className="text-[#f97316]"/> {cls.instructor}</span>
                </div>
                
                <h3 className="text-2xl font-heading font-bold mb-4 text-slate-900">{cls.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-8 line-clamp-3">{cls.description}</p>
                
                <div className="mt-auto">
                  <Button onClick={() => handleRegisterClick(cls)} className="w-full" variant="accent">Daftar Kelas Ini</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Paid Class Registration Modal */}
        {showClassForm && selectedClass && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 md:p-10 max-w-md w-full relative animate-fadeIn shadow-2xl">
              <button onClick={() => setShowClassForm(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
              
              <div className="mb-6">
                <Badge color="orange">Registrasi Kelas Berbayar</Badge>
                <h3 className="text-2xl font-heading font-bold mt-4 mb-2 text-slate-900">{selectedClass.title}</h3>
                <div className="bg-sky-50 p-4 rounded-xl mt-4 border border-sky-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">Biaya Pendaftaran:</span>
                  <span className="text-lg font-bold text-[#0284c7]">Rp {parseInt(selectedClass.price).toLocaleString('id-ID')}</span>
                </div>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData);
                try {
                  if(db && user) {
                    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'class_registrations'), {
                      ...data, classId: selectedClass.id, classTitle: selectedClass.title, timestamp: new Date().toISOString()
                    });
                  }
                  const msg = `Halo Admin Punel, saya ingin mendaftar kelas:\n\n*${selectedClass.title}*\nNama: ${data.name}\nEmail: ${data.email}\n\nMohon info pembayaran sebesar Rp ${parseInt(selectedClass.price).toLocaleString('id-ID')}. Terima kasih.`;
                  window.open(`https://wa.me/${waNumber}?text=${formatWAMessage(msg)}`, '_blank');
                  setShowClassForm(false);
                } catch (err) { alert("Gagal mendaftar. Silakan coba lagi."); }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap *</label>
                  <input required name="name" type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7]" placeholder="Masukkan nama Anda" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">No. WhatsApp *</label>
                  <input required name="phone" type="tel" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7]" placeholder="08..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email *</label>
                  <input required name="email" type="email" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7]" placeholder="email@contoh.com" />
                </div>
                <div className="pt-4">
                  <Button type="submit" className="w-full" variant="primary">Kirim & Konfirmasi Pembayaran</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Library = () => (
    <div className="pt-32 pb-24 container mx-auto px-6 max-w-7xl animate-fadeIn bg-white">
      <SectionHeader title="Arsip & Pustaka" subtitle="Koleksi zine, laporan riset, dan publikasi independen (Format PDF)." align="center" />
      
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        {[
          { title: 'Zine: Suara Ombak Vol. 1', desc: 'Kumpulan puisi dan ilustrasi nelayan muda.', year: '2026' },
          { title: 'Laporan Ekologi Muncar', desc: 'Pemetaan masalah lingkungan dan sampah pesisir.', year: '2025' }
        ].map((item, idx) => (
          <Card key={idx} className="group cursor-pointer border-2 border-transparent hover:border-sky-100 flex flex-col items-start">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6 group-hover:bg-[#f97316] group-hover:text-white transition-colors">
              <FileText size={28} />
            </div>
            <h3 className="text-xl font-heading font-bold mb-3 text-slate-900">{item.title}</h3>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed">{item.desc}</p>
            
            <div className="mt-auto w-full flex justify-between items-center pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.year}</span>
              <span className="flex items-center gap-2 text-[#0284c7] font-bold text-sm">
                <Download size={16}/> Unduh PDF
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const About = () => (
    <div className="pt-32 pb-24 container mx-auto px-6 max-w-5xl animate-fadeIn">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <Badge color="blue">Tentang Kami</Badge>
        <h1 className="text-4xl md:text-5xl font-heading font-extrabold mt-6 mb-8 text-slate-900">Merawat Ingatan Pesisir</h1>
        <p className="text-lg md:text-xl leading-relaxed text-slate-600 font-medium">
          Putra Nelayan (Punel) Art Communication adalah ruang kolektif yang berfokus pada persimpangan antara seni, komunikasi, dan aksi sosial. Berakar di pesisir Muncar, kami bergerak merespons isu sosial-ekologi melalui medium kreatif.
        </p>
      </div>

      <SectionHeader title="Tim & Kontributor" align="center" />
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        {team.map(member => (
          <Card key={member.id} className="text-center group p-8">
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500">
              <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-heading font-bold text-slate-900 mb-1">{member.name}</h3>
            <p className="text-[#f97316] font-bold text-sm mb-4">{member.role}</p>
            <p className="text-sm text-slate-600 leading-relaxed">{member.bio}</p>
          </Card>
        ))}
      </div>
    </div>
  );

  const Support = () => (
    <div className="pt-32 pb-24 container mx-auto px-6 max-w-4xl animate-fadeIn text-center">
      <div className="w-20 h-20 mx-auto bg-orange-100 text-[#f97316] rounded-full flex items-center justify-center mb-8 shadow-inner">
        <Heart size={40} className="fill-current" />
      </div>
      <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-6 text-slate-900">Dukung Gerakan</h1>
      <p className="text-lg leading-relaxed text-slate-600 max-w-2xl mx-auto mb-12 font-medium">
        Dukungan Anda membantu kami terus memproduksi arsip kebudayaan, menyelenggarakan ruang diskusi, dan mendanai aksi sosial di kawasan pesisir.
      </p>

      <Card className="max-w-md mx-auto relative overflow-hidden border-2 border-[#0284c7] p-8 md:p-12 shadow-xl shadow-sky-100">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0284c7] to-[#f97316]"></div>
        <Badge color="orange">Donasi QRIS</Badge>
        <h3 className="text-2xl font-heading font-bold mt-4 mb-2 text-slate-900">A.n. Kolektif Putra Nelayan</h3>
        <p className="text-sm text-slate-500 mb-8">Pindai kode di bawah ini menggunakan aplikasi e-wallet atau mobile banking Anda.</p>
        
        {/* Mock QR Code Container */}
        <div className="bg-slate-50 p-4 w-64 h-64 mx-auto mb-8 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300">
          <div className="text-center text-slate-400">
            <ImageIcon size={48} className="mx-auto mb-3 opacity-50 text-slate-300" />
            <p className="text-sm font-bold">[Area QR Code]</p>
            <p className="text-xs mt-2">Dikelola via Dashboard Admin</p>
          </div>
        </div>

        <Button 
          className="w-full"
          onClick={() => {
            const msg = "Halo Punel, saya baru saja mengirimkan donasi/sawer untuk mendukung kegiatan kolektif.";
            window.open(`https://wa.me/${waNumber}?text=${formatWAMessage(msg)}`, '_blank');
          }}
        >
          Konfirmasi via WhatsApp
        </Button>
      </Card>
    </div>
  );

  const AdminLogin = () => {
    const [pin, setPin] = useState('');
    const handleLogin = (e) => {
      e.preventDefault();
      if (pin === 'punel2026') setIsAdmin(true);
      else alert('Kode akses salah.');
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card className="max-w-sm w-full p-8 md:p-10 text-center">
          <div className="w-16 h-16 mx-auto bg-sky-100 text-[#0284c7] rounded-full flex items-center justify-center mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-heading font-bold text-slate-900 mb-2">Ruang Redaksi</h2>
          <p className="text-sm text-slate-500 mb-8 font-medium">Masukkan PIN (Demo: punel2026)</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:bg-white text-center text-2xl tracking-[0.5em] transition-all" 
              placeholder="••••"
            />
            <Button type="submit" className="w-full !py-4">Masuk Dashboard</Button>
            <button type="button" onClick={() => navigate('home')} className="w-full mt-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Kembali ke Beranda</button>
          </form>
        </Card>
      </div>
    );
  };

  const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('agendas');
    const [formData, setFormData] = useState({});

    const handleSave = async (collectionName, data) => {
      if (db && user) {
        try {
          const docRef = doc(collection(db, 'artifacts', appId, 'public', 'data', collectionName));
          await setDoc(docRef, { ...data, createdAt: new Date().toISOString() });
          alert('Data berhasil disimpan!');
          setFormData({}); 
        } catch (error) { alert('Gagal menyimpan ke database.'); }
      } else { alert('Disimpan ke memori sementara (mode demo).'); }
    };

    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
        <div className="w-full md:w-72 bg-white border-r border-slate-200 p-6 flex flex-col">
          <div className="mb-10">
            <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">Redaksi<span className="text-[#0284c7]">Punel</span></h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Dashboard Admin</p>
          </div>
          
          <nav className="space-y-2 flex-1">
            {['agendas', 'articles', 'classes', 'team'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                Kelola {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
          
          <div className="pt-6 mt-6 border-t border-slate-100">
            <button onClick={() => { setIsAdmin(false); navigate('home'); }} className="text-sm font-bold text-orange-600 hover:bg-orange-50 w-full text-left px-4 py-3 rounded-xl transition-colors">Keluar & Ke Beranda</button>
          </div>
        </div>

        <div className="flex-1 p-8 md:p-12 overflow-y-auto">
          <div className="max-w-4xl">
            <h3 className="text-3xl font-heading font-bold mb-8 capitalize text-slate-900">Manajemen {activeTab}</h3>
            
            <Card className="mb-12 border-0 shadow-md">
              <h4 className="font-bold text-lg mb-6 text-slate-800">Tambah Entri Baru</h4>
              <div className="grid gap-5">
                <input type="text" placeholder="Judul / Nama" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7]" onChange={e => setFormData({...formData, title: e.target.value, name: e.target.value})} />
                
                {activeTab === 'agendas' && (
                  <div className="grid md:grid-cols-2 gap-5">
                    <input type="date" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7]" onChange={e => setFormData({...formData, date: e.target.value})} />
                    <input type="text" placeholder="Lokasi" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7]" onChange={e => setFormData({...formData, location: e.target.value})} />
                    <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7]" onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="upcoming">Mendatang</option>
                      <option value="archived">Arsip</option>
                    </select>
                  </div>
                )}
                
                {activeTab === 'classes' && (
                  <div className="grid md:grid-cols-2 gap-5">
                    <input type="date" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7]" onChange={e => setFormData({...formData, date: e.target.value})} />
                    <input type="number" placeholder="Harga (Misal: 150000)" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7]" onChange={e => setFormData({...formData, price: e.target.value})} />
                    <input type="text" placeholder="Instruktur / Pemateri" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7]" onChange={e => setFormData({...formData, instructor: e.target.value})} />
                    <input type="text" placeholder="Lokasi" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7]" onChange={e => setFormData({...formData, location: e.target.value})} />
                  </div>
                )}

                {activeTab === 'articles' && (
                  <>
                    <input type="text" placeholder="Kategori (Misal: riset, seni)" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7]" onChange={e => setFormData({...formData, category: e.target.value})} />
                    <input type="text" placeholder="Penulis" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7]" onChange={e => setFormData({...formData, author: e.target.value})} />
                    <textarea placeholder="Konten Artikel Lengkap" rows={8} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7]" onChange={e => setFormData({...formData, content: e.target.value})}></textarea>
                  </>
                )}
                {activeTab === 'team' && <input type="text" placeholder="Peran (Role)" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7]" onChange={e => setFormData({...formData, role: e.target.value})} />}

                <input type="url" placeholder="URL Gambar (https://...)" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7]" onChange={e => setFormData({...formData, image: e.target.value})} />
                
                {activeTab !== 'articles' && (
                  <textarea placeholder="Deskripsi Singkat" rows={4} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7]" onChange={e => setFormData({...formData, description: e.target.value, summary: e.target.value, bio: e.target.value})}></textarea>
                )}
                
                <div className="pt-4">
                  <Button onClick={() => handleSave(activeTab, formData)}>Simpan Data</Button>
                </div>
              </div>
            </Card>

            <div>
               <h4 className="font-bold text-lg mb-6 text-slate-800">Daftar {activeTab} Saat Ini</h4>
               <div className="grid gap-4">
                 {(activeTab === 'agendas' ? agendas : activeTab === 'articles' ? articles : activeTab === 'classes' ? classes : team).map(item => (
                   <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-[#0284c7] transition-colors">
                     <span className="font-bold text-slate-700">{item.title || item.name}</span>
                     <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">{item.id}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (currentPath === 'admin') {
    return isAdmin ? <AdminDashboard /> : <AdminLogin />;
  }

  return (
    <>
      <style>{customStyles}</style>
      <div className="min-h-screen flex flex-col selection:bg-sky-200 selection:text-sky-900">
        
        {/* Modern Navigation Bar */}
        <header className="fixed w-full top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100 transition-all duration-300">
          <div className="container mx-auto px-6 h-20 flex items-center justify-between max-w-7xl">
            
            <div className="cursor-pointer flex flex-col leading-none" onClick={() => navigate('home')}>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-slate-900">PUNEL</span>
              <span className="text-[9px] tracking-[0.2em] font-bold text-[#f97316] uppercase mt-1">Art Communication</span>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
              {[
                { id: 'agendas', label: 'Agenda' },
                { id: 'classes', label: 'Kelas' },
                { id: 'journal', label: 'Jurnal' },
                { id: 'library', label: 'Arsip' },
                { id: 'about', label: 'Tentang' }
              ].map(item => (
                <button 
                  key={item.id} 
                  onClick={() => navigate(item.id)}
                  className={`hover:text-[#0284c7] transition-colors relative py-2 ${currentPath === item.id ? 'text-[#0284c7]' : ''}`}
                >
                  {item.label}
                  {currentPath === item.id && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0284c7] rounded-full"></span>}
                </button>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <Button variant="accent" onClick={() => navigate('support')} className="!px-5 !py-2.5 text-sm">
                <Heart size={16} className="fill-current" /> Dukung
              </Button>
            </div>

            <button className="md:hidden text-slate-600 hover:text-slate-900 bg-slate-50 p-2 rounded-xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Nav */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 p-6 shadow-2xl animate-fadeIn">
              <nav className="flex flex-col gap-4 text-lg font-heading font-bold text-slate-700">
                {['home', 'agendas', 'classes', 'journal', 'library', 'about'].map(id => (
                  <button key={id} onClick={() => navigate(id)} className={`text-left p-3 rounded-xl transition-colors ${currentPath === id ? 'bg-sky-50 text-[#0284c7]' : 'hover:bg-slate-50'}`}>
                    {id === 'home' ? 'Beranda' : id.charAt(0).toUpperCase() + id.slice(1)}
                  </button>
                ))}
                <button onClick={() => navigate('support')} className="text-left p-3 rounded-xl bg-orange-50 text-[#f97316] mt-2">Dukung Gerakan</button>
                <div className="border-t border-slate-100 mt-4 pt-4">
                   <button onClick={() => navigate('admin')} className="text-left text-sm text-slate-400 p-3 w-full">Login Redaksi</button>
                </div>
              </nav>
            </div>
          )}
        </header>

        <main className="flex-grow">
          {currentPath === 'home' && <Home />}
          {currentPath === 'agendas' && <Agendas />}
          {currentPath === 'classes' && <Classes />}
          {currentPath === 'journal' && <Journal />}
          {currentPath === 'article-detail' && <ArticleDetail />}
          {currentPath === 'library' && <Library />}
          {currentPath === 'about' && <About />}
          {currentPath === 'support' && <Support />}
        </main>

        {/* Modern Footer */}
        <footer className="bg-slate-900 text-white pt-20 pb-10 mt-auto rounded-t-[3rem] md:rounded-t-[4rem]">
          <div className="container mx-auto px-6 max-w-7xl grid md:grid-cols-4 gap-12 lg:gap-16">
            <div className="md:col-span-2">
              <h2 className="font-heading font-extrabold text-3xl mb-4 tracking-tight">Punel <span className="text-[#0284c7]">Art</span></h2>
              <p className="text-slate-400 max-w-sm text-sm leading-relaxed mb-8 font-medium">
                Kolektif independen yang bergerak di bidang seni, komunikasi, dan aksi sosial untuk merawat kebudayaan dan narasi masyarakat pesisir Muncar.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#0284c7] hover:text-white transition-all"><InstagramIcon /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#0284c7] hover:text-white transition-all"><FacebookIcon /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#0284c7] hover:text-white transition-all"><YoutubeIcon /></a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-sm mb-6 text-slate-300">JELAJAHI</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li><button onClick={() => navigate('agendas')} className="hover:text-[#0284c7] transition-colors">Agenda</button></li>
                <li><button onClick={() => navigate('classes')} className="hover:text-[#0284c7] transition-colors">Kelas & Pelatihan</button></li>
                <li><button onClick={() => navigate('journal')} className="hover:text-[#0284c7] transition-colors">Jurnal Editorial</button></li>
                <li><button onClick={() => navigate('library')} className="hover:text-[#0284c7] transition-colors">Perpustakaan Arsip</button></li>
                <li><button onClick={() => navigate('support')} className="hover:text-[#f97316] transition-colors">Dukung Kami</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-6 text-slate-300">HUBUNGI KAMI</h4>
              <p className="text-sm text-slate-500 leading-relaxed mb-6 font-medium">
                Kawasan Pesisir Muncar,<br />
                Banyuwangi, Jawa Timur,<br />
                Indonesia 68472
              </p>
              <Button 
                variant="outline"
                onClick={() => window.open(`https://wa.me/${waNumber}`, '_blank')}
                className="!py-2 !px-4 text-xs !bg-transparent !text-white !border-slate-700 hover:!border-[#0284c7] hover:!bg-[#0284c7]"
              >
                Chat WhatsApp <ArrowRight size={14} />
              </Button>
            </div>
          </div>
          
          <div className="container mx-auto px-6 max-w-7xl mt-20 pt-8 border-t border-slate-800 text-center md:text-left text-xs font-bold text-slate-600 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; {new Date().getFullYear()} Putra Nelayan Art Communication.</p>
            <button onClick={() => navigate('admin')} className="hover:text-slate-300 transition-colors">Masuk Redaksi (Admin)</button>
          </div>
        </footer>
      </div>
    </>
  );
}

// Mock Icons
const InstagramIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const FacebookIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const YoutubeIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>;
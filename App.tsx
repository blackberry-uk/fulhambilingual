
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { RELATIONSHIP_LABELS_EN, RELATIONSHIP_LABELS_FR, TRANSLATIONS } from './constants';
import { Language, RelationshipKey, Person, PetitionRecord, Testimonial, ForumThread } from './types';
import { storage } from './services/storage';
import { translateText, detectLanguage, summarizeThread } from './services/gemini';

// --- Context & Navigation ---

interface AppContextType {
  lang: Language;
  setLang: (l: Language) => void;
  view: string;
  setView: (v: string) => void;
  signatureCount: number;
  refreshStats: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// --- Reusable Components ---

const PetitionContent = () => {
  const { lang: appLang } = useApp();
  const [activeLang, setActiveLang] = useState<Language>(appLang);
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    storage.getSiteContent('petition_body').then(data => {
      if (data) {
        setContent(activeLang === Language.EN ? data.en : data.fr);
      } else {
        setContent(TRANSLATIONS[activeLang].petition_body);
      }
    });
  }, [activeLang]);

  return (
    <div className="space-y-8">
      <div className="flex justify-center p-1 bg-gray-100 rounded-full w-fit mx-auto mb-12">
        <button
          onClick={() => setActiveLang(Language.EN)}
          className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${activeLang === Language.EN ? 'bg-white text-[#d52b27] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          English
        </button>
        <button
          onClick={() => setActiveLang(Language.FR)}
          className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${activeLang === Language.FR ? 'bg-white text-[#d52b27] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Français
        </button>
      </div>
      <div
        className="prose prose-xl max-w-3xl mx-auto text-gray-800 leading-relaxed font-medium text-left animate-in fade-in duration-700"
        dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
      />
    </div>
  );
};

// --- Page Components ---

const Navbar = () => {
  const { lang, setLang, view, setView } = useApp();
  const t = TRANSLATIONS[lang];

  return (
    <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 py-6 border-b border-gray-50">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <button onClick={() => setView('home')} className="group flex flex-col">
          <span className="font-black text-[#d52b27] text-lg uppercase tracking-tighter leading-none group-hover:opacity-60 transition-opacity">FB COMMUNITY</span>
        </button>
        <div className="hidden md:flex items-center space-x-2">
          <button
            onClick={() => setView('petition')}
            className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all ${view === 'petition' ? 'bg-[#d52b27] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            {t.nav_petition}
          </button>
          <button
            onClick={() => setView('testimonials')}
            className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all ${view === 'testimonials' ? 'bg-[#d52b27] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            {t.nav_testimonials}
          </button>
          <button
            onClick={() => setView('forum')}
            className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all ${view === 'forum' ? 'bg-[#d52b27] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            {t.nav_forum}
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-gray-100 p-1 rounded-full flex">
            <button onClick={() => setLang(Language.EN)} className={`px-4 py-1.5 rounded-full text-[9px] font-black transition-all ${lang === Language.EN ? 'bg-white text-[#d52b27] shadow-sm' : 'text-gray-400'}`}>EN</button>
            <button onClick={() => setLang(Language.FR)} className={`px-4 py-1.5 rounded-full text-[9px] font-black transition-all ${lang === Language.FR ? 'bg-white text-[#d52b27] shadow-sm' : 'text-gray-400'}`}>FR</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Disclaimer = () => {
  const { lang } = useApp();
  return (
    <div className="bg-gray-50 text-gray-500 text-[15px] py-4 px-6 text-center font-medium border-b border-gray-100">
      {TRANSLATIONS[lang].disclaimer}
    </div>
  );
};

const Hero = () => {
  const { lang, setView, signatureCount } = useApp();
  const t = TRANSLATIONS[lang];

  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="space-y-6">
          <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.5em]">
            {t.subtitle}
          </p>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-gray-900 leading-[0.85] tracking-tighter text-balance">
            {t.hero.split(' ').slice(0, 2).join(' ')} <span className="text-[#d52b27]">{t.hero.split(' ').slice(2).join(' ')}</span>
          </h1>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <button
            onClick={() => setView('petition')}
            className="w-full md:w-auto px-12 py-6 bg-[#d52b27] text-white font-black rounded-full shadow-xl hover:shadow-red-200 hover:-translate-y-1 btn-transition text-lg uppercase tracking-widest"
          >
            {t.petition_action}
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('mission-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full md:w-auto px-12 py-6 bg-white text-gray-900 border border-gray-200 font-black rounded-full hover:bg-gray-50 hover:-translate-y-1 btn-transition text-lg uppercase tracking-widest"
          >
            {t.read_the_petition}
          </button>
        </div>

        <div className="pt-10">
          <div className="inline-flex flex-col items-center group cursor-pointer" onClick={() => setView('signatories')}>
            <div className="text-5xl font-black text-gray-900 tracking-tighter mb-2 group-hover:text-[#d52b27] transition-colors">
              {signatureCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em]">Signatures so far</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PetitionForm = () => {
  const { lang, refreshStats, setView } = useApp();
  const t = TRANSLATIONS[lang];
  const labels = lang === Language.EN ? RELATIONSHIP_LABELS_EN : RELATIONSHIP_LABELS_FR;
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email_address: '',
    relationships: [] as RelationshipKey[],
    year_groups: '',
    comment: '',
    consent: false,
    petition_support: true
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isCurrentStudentOrParent = formData.relationships.some(r =>
    [RelationshipKey.LYCEE_PARENT, RelationshipKey.HOLY_CROSS_PARENT, RelationshipKey.LYCEE_ALUMNI_OVER_16, RelationshipKey.HOLY_CROSS_ALUMNI_OVER_16, RelationshipKey.CURRENT_SCHOOL_EMPLOYEE].includes(r)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const personData = await storage.addPerson({
        id: '',
        full_name: formData.full_name,
        email_address: formData.email_address,
        relationship_to_school: formData.relationships,
        student_year_groups: formData.year_groups.split(',').map(s => s.trim()).filter(Boolean),
        submission_language: lang,
        created_at: new Date().toISOString()
      });

      const record: PetitionRecord = {
        id: '',
        person_id: personData.id,
        petition_support: formData.petition_support,
        supporting_comment: formData.comment,
        consent_public_use: formData.consent,
        submission_timestamp: new Date().toISOString()
      };

      if (formData.comment && formData.consent) {
        const detected = await detectLanguage(formData.comment);
        const target = detected === Language.EN ? Language.FR : Language.EN;
        const translated = await translateText(formData.comment, detected, target);

        record.comment_en = detected === Language.EN ? formData.comment : translated;
        record.comment_fr = detected === Language.FR ? formData.comment : translated;

        await storage.addTestimonial({
          id: '',
          person_name: formData.full_name,
          content: formData.comment,
          content_translated: translated,
          is_moderated: true,
          language: detected,
          created_at: new Date().toISOString()
        });
      }

      await storage.addPetitionRecord(record);
      refreshStats();
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleRelationship = (key: RelationshipKey) => {
    setFormData(prev => ({
      ...prev,
      relationships: prev.relationships.includes(key)
        ? prev.relationships.filter(r => r !== key)
        : [...prev.relationships, key]
    }));
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-40 text-center space-y-8 animate-in zoom-in-95 duration-500">
        <h2 className="text-7xl font-black text-gray-900 tracking-tighter">Registered.</h2>
        <p className="text-lg text-gray-500 font-medium leading-relaxed">Thank you for joining the community voice. We are stronger together.</p>
        <div className="pt-8 flex flex-col items-center gap-4">
          <button onClick={() => setView('home')} className="bg-[#d52b27] text-white px-12 py-5 rounded-full font-black uppercase text-[11px] tracking-widest hover:bg-gray-900 transition-colors shadow-lg">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-24 px-6 space-y-24">
      <div className="space-y-12">
        <h2 className="text-4xl md:text-5xl font-black text-gray-900 text-center tracking-tighter uppercase">{t.petition_title}</h2>
        <PetitionContent />
      </div>

      <div ref={formRef} className="bg-white border-t border-gray-100 pt-20">
        <h2 className="text-4xl font-black mb-16 text-center text-gray-900 tracking-tighter uppercase">{t.petition_action}</h2>
        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="flex items-center space-x-6 bg-red-50 p-8 rounded-3xl border-2 border-red-100 animate-in fade-in slide-in-from-top-4 duration-700">
            <input
              required
              type="checkbox"
              id="petition_support"
              checked={formData.petition_support}
              onChange={e => setFormData({ ...formData, petition_support: e.target.checked })}
              className="w-8 h-8 rounded-xl text-[#d52b27] focus:ring-[#d52b27] cursor-pointer"
            />
            <label htmlFor="petition_support" className="text-xl md:text-2xl font-black text-gray-900 cursor-pointer leading-tight">
              {t.petition_support_label}
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-2">
              <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest">{t.full_name}</label>
              <input
                required
                type="text"
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full border-2 border-gray-100 rounded-2xl p-6 bg-gray-50 outline-none font-bold text-2xl focus:border-[#d52b27] focus:ring-4 focus:ring-red-50 transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest">{t.email}</label>
              <input
                required
                type="email"
                value={formData.email_address}
                onChange={e => setFormData({ ...formData, email_address: e.target.value })}
                className="w-full border-2 border-gray-100 rounded-2xl p-6 bg-gray-50 outline-none font-bold text-2xl focus:border-[#d52b27] focus:ring-4 focus:ring-red-50 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest">{t.relationship}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(labels).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleRelationship(key as RelationshipKey)}
                  className={`text-left p-6 rounded-2xl text-base transition-all border-2 font-bold ${formData.relationships.includes(key as RelationshipKey)
                    ? 'bg-[#d52b27] text-white border-[#d52b27] shadow-lg scale-105'
                    : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-gray-200 hover:bg-white shadow-sm'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {isCurrentStudentOrParent && (
            <div className="animate-in slide-in-from-top-4 space-y-2">
              <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest">{t.year_groups}</label>
              <input
                required
                type="text"
                value={formData.year_groups}
                onChange={e => setFormData({ ...formData, year_groups: e.target.value })}
                placeholder="e.g. GSA, CP, CE1..."
                className="w-full border-2 border-gray-100 rounded-2xl p-6 bg-gray-50 outline-none font-bold text-2xl focus:border-[#d52b27] focus:ring-4 focus:ring-red-50 transition-all shadow-sm"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest">{t.comment}</label>
            <textarea
              rows={4}
              value={formData.comment}
              onChange={e => setFormData({ ...formData, comment: e.target.value })}
              className="w-full border-2 border-gray-100 rounded-2xl p-6 bg-gray-50 outline-none font-medium text-2xl focus:border-[#d52b27] focus:ring-4 focus:ring-red-50 transition-all shadow-sm"
            ></textarea>
          </div>

          <div className="flex items-center space-x-6 bg-gray-50 p-8 rounded-3xl border border-gray-100">
            <input
              required
              type="checkbox"
              id="consent"
              checked={formData.consent}
              onChange={e => setFormData({ ...formData, consent: e.target.checked })}
              className="w-8 h-8 rounded-xl text-[#d52b27] focus:ring-[#d52b27] cursor-pointer"
            />
            <label htmlFor="consent" className="text-base text-gray-600 font-bold cursor-pointer leading-tight">
              {t.consent}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || formData.relationships.length === 0}
            className="w-full py-10 bg-[#d52b27] text-white font-black text-2xl rounded-full shadow-2xl hover:bg-gray-900 transition-all disabled:opacity-20 disabled:grayscale uppercase tracking-widest"
          >
            {loading ? t.loading : t.submit}
          </button>
        </form>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const { lang } = useApp();
  const t = TRANSLATIONS[lang];
  const [items, setItems] = useState<Testimonial[]>([]);

  useEffect(() => {
    storage.getTestimonials().then(setItems);
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-24 px-6 space-y-20">
      <div className="text-center space-y-4">
        <h2 className="text-7xl font-black text-gray-900 tracking-tighter">Community Voices</h2>
        <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">Stories from our community.</p>
      </div>

      <div className="space-y-24">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-12 border-t border-gray-50 pt-12 animate-in fade-in duration-700">
            <div className="md:col-span-1">
              <div className="font-black text-gray-900 text-lg uppercase tracking-tighter leading-none mb-2">{item.person_name}</div>
              <div className="text-[10px] text-gray-300 font-black uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</div>
            </div>
            <div className="md:col-span-3 space-y-8">
              <div className="text-2xl font-medium leading-relaxed italic text-gray-800 tracking-tight">"{item.content}"</div>
              {item.content_translated && (
                <div className="text-lg leading-relaxed text-gray-400 font-medium tracking-tight border-l border-gray-100 pl-8">
                  {item.content_translated}
                  <div className="text-[8px] uppercase tracking-widest font-black text-gray-200 mt-2">Auto-translated</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SignatoryList = () => {
  const { lang } = useApp();
  const t = TRANSLATIONS[lang];
  const [sigs, setSigs] = useState<{ name: string, timestamp: string }[]>([]);

  useEffect(() => {
    storage.getPublicSignatories().then(setSigs);
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-24 px-6 space-y-16 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-7xl font-black text-gray-900 tracking-tighter">Signatories</h2>
        <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">A growing list of supporters.</p>
      </div>
      <div className="space-y-4 border-t border-gray-50">
        {sigs.map((s, idx) => (
          <div key={idx} className="flex justify-between items-baseline py-4 border-b border-gray-50 hover:bg-gray-50 px-4 transition-colors">
            <span className="font-bold text-gray-900 uppercase tracking-tighter">{s.name}</span>
            <span className="text-gray-300 text-[10px] font-black uppercase tracking-widest">{new Date(s.timestamp).toLocaleDateString()}</span>
          </div>
        ))}
        {sigs.length === 0 && <div className="py-20 text-center text-gray-200 font-black uppercase tracking-widest">No entries yet.</div>}
      </div>
    </div>
  );
};

const Forum = () => {
  const { lang } = useApp();
  const t = TRANSLATIONS[lang];
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    storage.getForumThreads().then(setThreads);
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;
    setLoading(true);
    try {
      const summary = await summarizeThread(newContent, []);
      await storage.addForumThread({
        id: '', title: newTitle, author_name: "Community Member", content: newContent,
        ai_summary: summary, language: lang, replies: [], created_at: new Date().toISOString()
      });
      const data = await storage.getForumThreads();
      setThreads(data);
      setNewTitle(''); setNewContent('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-24 px-6 space-y-24">
      <div className="text-center space-y-4">
        <h2 className="text-7xl font-black text-gray-900 tracking-tighter">Forum</h2>
        <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">Community Discussion.</p>
      </div>

      <div className="space-y-12">
        <form onSubmit={handlePost} className="space-y-6">
          <input
            type="text" placeholder="Topic Title" value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full border-b-2 border-gray-100 py-6 outline-none font-black text-3xl tracking-tighter placeholder:text-gray-200 focus:border-[#d52b27] transition-all"
          />
          <textarea
            placeholder="Share your thoughts..." rows={3} value={newContent}
            onChange={e => setNewContent(e.target.value)}
            className="w-full border-b border-gray-100 py-6 outline-none text-xl font-medium placeholder:text-gray-200 focus:border-[#d52b27] transition-all"
          ></textarea>
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="px-10 py-4 bg-gray-900 text-white font-black rounded-full uppercase text-[10px] tracking-widest">
              {loading ? 'Posting...' : 'Post Topic'}
            </button>
          </div>
        </form>

        <div className="space-y-16 pt-20">
          {threads.map(thread => (
            <div key={thread.id} className="space-y-6 animate-in fade-in duration-700">
              <div className="flex justify-between items-baseline">
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter hover:text-[#d52b27] cursor-pointer transition-colors">{thread.title}</h3>
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{new Date(thread.created_at).toLocaleDateString()}</span>
              </div>
              {thread.ai_summary && (
                <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-[#d52b27]">
                  <p className="text-sm text-gray-900 font-bold italic">"{thread.ai_summary}"</p>
                </div>
              )}
              <p className="text-lg text-gray-500 font-medium leading-relaxed line-clamp-2">{thread.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ReconsentFlow = () => {
  const { lang } = useApp();
  const t = TRANSLATIONS[lang];
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await storage.updateConsent(email, consent, comment);
    if (ok) setSuccess(true);
    else alert("Email not found.");
  };

  return (
    <div className="max-w-xl mx-auto py-24 px-6 text-center space-y-12">
      <h2 className="text-7xl font-black text-gray-900 tracking-tighter">{t.reconsent_title}</h2>
      {success ? (
        <div className="py-20 bg-green-50 rounded-3xl text-green-700 font-black text-2xl">Updated.</div>
      ) : (
        <form onSubmit={handleSubmit} className="text-left space-y-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.email}</label>
            <input
              required type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-100 rounded-2xl p-5 bg-gray-50/50 outline-none font-black text-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New Comment</label>
            <textarea
              value={comment} onChange={e => setComment(e.target.value)}
              className="w-full border border-gray-100 rounded-2xl p-5 bg-gray-50/50 outline-none font-medium text-lg"
            ></textarea>
          </div>
          <button type="submit" className="w-full py-6 bg-gray-900 text-white font-black rounded-full uppercase tracking-widest">Update Support</button>
        </form>
      )}
    </div>
  );
};

// --- App Root ---

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(Language.EN);
  const [view, setView] = useState('home');
  const [signatureCount, setSignatureCount] = useState(0);

  const refreshStats = () => {
    storage.getPetitionStats().then(stats => setSignatureCount(stats.total));
  };

  useEffect(() => { refreshStats(); }, []);

  return (
    <AppContext.Provider value={{ lang, setLang, view, setView, signatureCount, refreshStats }}>
      {children}
    </AppContext.Provider>
  );
};

const MainContent = () => {
  const { view, setView, lang } = useApp();

  return (
    <main className="min-h-screen selection:bg-red-100 selection:text-red-900">
      <Navbar />
      <Disclaimer />

      {view === 'home' && (
        <>
          <Hero />
          <section id="mission-section" className="py-40 px-6 max-w-4xl mx-auto text-center space-y-16 animate-in fade-in duration-1000">
            <h2 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter text-balance">The Future is Bilingual</h2>
            <PetitionContent />
            <div className="pt-10">
              <button
                onClick={() => setView('petition')}
                className="group flex flex-col items-center mx-auto space-y-4"
              >
                <div className="w-24 h-24 bg-[#d52b27] rounded-full flex items-center justify-center text-white text-4xl shadow-2xl hover:scale-110 transition-transform cursor-pointer">
                  ✍️
                </div>
                <span className="font-black text-[10px] uppercase tracking-[0.4em] text-gray-400 group-hover:text-[#d52b27] transition-colors">Sign the petition</span>
              </button>
            </div>
          </section>
        </>
      )}

      {view === 'petition' && <PetitionForm />}
      {view === 'testimonials' && <Testimonials />}
      {view === 'forum' && <Forum />}
      {view === 'reconsent' && <ReconsentFlow />}
      {view === 'signatories' && <SignatoryList />}

      <footer className="py-24 px-6 text-center border-t border-gray-50">
        <div className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-300">
          2026, Fulham Bilingual Community
        </div>
        <div className="mt-8 flex justify-center space-x-10 text-[9px] font-black uppercase tracking-widest text-gray-200">
          <button onClick={() => setView('reconsent')} className="hover:text-gray-400 transition-colors">Update Consent</button>
          <button className="hover:text-gray-400 transition-colors">Privacy</button>
          <button className="hover:text-gray-400 transition-colors">Contact</button>
        </div>
      </footer>
    </main>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;


import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { RELATIONSHIP_LABELS_EN, RELATIONSHIP_LABELS_FR, TRANSLATIONS } from './constants';
import { Language, RelationshipKey, Person, PetitionRecord, Testimonial, ForumThread } from './types';
import { storage } from './services/storage';
import { translateText, detectLanguage, summarizeThread } from './services/gemini';
import Analytics from './Analytics';

// --- Context & Navigation ---

interface AppContextType {
  lang: Language;
  setLang: (l: Language) => void;
  view: string;
  setView: (v: string) => void;
  signatureCount: number;
  refreshStats: () => void;
  showManageSignature: boolean;
  setShowManageSignature: (s: boolean) => void;
  targetTestimonialId: string | null;
  setTargetTestimonialId: (id: string | null) => void;
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

  // Sync with global language changes
  useEffect(() => {
    setActiveLang(appLang);
  }, [appLang]);

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
        style={{
          listStylePosition: 'outside',
        }}
        dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>').replace(/<ul>/g, '<ul style="list-style-type: disc; margin-left: 2rem; margin-top: 1rem; margin-bottom: 1rem;">').replace(/<li>/g, '<li style="margin-bottom: 0.5rem;">') }}
      />
    </div>
  );
};

// --- Page Components ---

const Navbar = () => {
  const { lang, setLang, view, setView } = useApp();
  const t = TRANSLATIONS[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 py-4 md:py-6 border-b border-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
        <button
          onClick={() => {
            setView('home');
            setMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group flex flex-col text-left"
        >
          <span className="font-black text-[#d52b27] text-base md:text-lg uppercase tracking-tighter leading-none group-hover:opacity-60 transition-opacity">{t.site_name}</span>
        </button>

        {/* Desktop Navigation */}
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
          <button
            onClick={() => setView('signatories')}
            className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all ${view === 'signatories' ? 'bg-[#d52b27] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            {t.nav_signatories}
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {/* Language Toggle */}
          <div className="bg-gray-100 p-1 rounded-full flex">
            <button onClick={() => setLang(Language.EN)} className={`px-3 md:px-4 py-1.5 rounded-full text-[9px] font-black transition-all ${lang === Language.EN ? 'bg-white text-[#d52b27] shadow-sm' : 'text-gray-400'}`}>EN</button>
            <button onClick={() => setLang(Language.FR)} className={`px-3 md:px-4 py-1.5 rounded-full text-[9px] font-black transition-all ${lang === Language.FR ? 'bg-white text-[#d52b27] shadow-sm' : 'text-gray-400'}`}>FR</button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-[#d52b27] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => { setView('petition'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${view === 'petition' ? 'bg-[#d52b27] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            {t.nav_petition}
          </button>
          <button
            onClick={() => { setView('testimonials'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${view === 'testimonials' ? 'bg-[#d52b27] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            {t.nav_testimonials}
          </button>
          <button
            onClick={() => { setView('forum'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${view === 'forum' ? 'bg-[#d52b27] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            {t.nav_forum}
          </button>
          <button
            onClick={() => { setView('signatories'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${view === 'signatories' ? 'bg-[#d52b27] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            {t.nav_signatories}
          </button>
        </div>
      )}
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
            onClick={() => {
              setView('petition');
              setTimeout(() => {
                document.getElementById('sign-form-container')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
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
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em]">{t.signatures_so_far}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PetitionForm = ({ initialData, isEdit = false, authToken = '' }: { initialData?: any, isEdit?: boolean, authToken?: string }) => {
  const { lang, refreshStats, setView } = useApp();
  const t = TRANSLATIONS[lang];
  const labels = lang === Language.EN ? RELATIONSHIP_LABELS_EN : RELATIONSHIP_LABELS_FR;
  const formRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isEdit && formRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isEdit]);

  const [formData, setFormData] = useState({
    full_name: initialData?.person?.full_name || '',
    email_address: initialData?.person?.email_address || '',
    relationships: initialData?.person?.relationship_to_school || [] as RelationshipKey[],
    year_groups: initialData?.person?.student_year_groups?.join(', ') || '',
    comment: initialData?.petitionRecord?.supporting_comment || '',
    consent: initialData?.petitionRecord?.consent_public_use || false,
    petition_support: initialData?.petitionRecord?.petition_support !== undefined ? initialData?.petitionRecord?.petition_support : true
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
      if (isEdit) {
        // 1. Update the official record and person details via edge function
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-petition-record`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email_address,
            token: authToken,
            personUpdates: {
              full_name: formData.full_name,
              relationship_to_school: formData.relationships,
              student_year_groups: formData.year_groups.split(',').map(s => s.trim()).filter(Boolean),
            },
            recordUpdates: {
              petition_support: formData.petition_support,
              supporting_comment: formData.comment,
              consent_public_use: formData.consent,
            }
          })
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Update failed');
        }



        // 2. If there is a comment, update the testimonial
        if (formData.comment) {
          // Use Anonymous if consent is false
          const displayName = formData.consent ? formData.full_name : 'Anonymous';

          // Check if the comment text or consent status changed
          const originalComment = initialData?.petitionRecord?.supporting_comment || '';
          const originalConsent = initialData?.petitionRecord?.consent_public_use || false;
          const commentChanged = formData.comment !== originalComment;
          const consentChanged = formData.consent !== originalConsent;

          // Try to update existing testimonial
          try {
            if (commentChanged) {
              // Comment changed - re-translate
              const detected = await detectLanguage(formData.comment);
              const target = detected === Language.EN ? Language.FR : Language.EN;
              const translated = await translateText(formData.comment, detected, target);

              await storage.updateTestimonial(formData.full_name, {
                person_name: displayName,
                content: formData.comment,
                content_translated: translated,
                language: detected,
                is_moderated: true
              });
            } else if (consentChanged) {
              // Only consent changed - update name only, preserve everything else
              await storage.updateTestimonial(formData.full_name, {
                person_name: displayName,
                is_moderated: true
              });
            } else {
              // Nothing changed - still update moderation status
              await storage.updateTestimonial(formData.full_name, {
                person_name: displayName,
                is_moderated: true
              });
            }
          } catch (e) {
            console.error('Failed to update testimonial:', e);
            // If update fails (testimonial doesn't exist), create it with translation
            const detected = await detectLanguage(formData.comment);
            const target = detected === Language.EN ? Language.FR : Language.EN;
            const translated = await translateText(formData.comment, detected, target);

            await storage.addTestimonial({
              id: '',
              person_name: displayName,
              content: formData.comment,
              content_translated: translated,
              is_moderated: true,
              language: detected,
              created_at: new Date().toISOString()
            });
          }
        }

        refreshStats();
        setSubmitted(true);
        return;
      }

      // Check for duplicate email before creating new record
      const existingPerson = await storage.getPersonByEmail(formData.email_address);
      if (existingPerson) {
        throw new Error(lang === Language.EN
          ? 'This email address has already been used to sign the petition. Please click on "Manage my Signature" to update your information.'
          : 'Cette adresse e-mail a déjà été utilisée pour signer la pétition. Veuillez cliquer sur "Gérer ma signature" pour mettre à jour vos informations.');
      }

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

      if (formData.comment) {
        const detected = await detectLanguage(formData.comment);
        const target = detected === Language.EN ? Language.FR : Language.EN;
        const translated = await translateText(formData.comment, detected, target);

        record.comment_en = detected === Language.EN ? formData.comment : translated;
        record.comment_fr = detected === Language.FR ? formData.comment : translated;

        // Create testimonial even if consent is false, but use "Anonymous" as the name
        const displayName = formData.consent ? formData.full_name : (detected === Language.EN ? 'Anonymous' : 'Anonyme');

        await storage.addTestimonial({
          id: '',
          person_name: displayName,
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
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Action failed. Please try again.");
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
        <h2 className="text-7xl font-black text-gray-900 tracking-tighter uppercase">
          {isEdit ? t.edit_success : t.registered_success}
        </h2>
        <p className="text-lg text-gray-500 font-medium leading-relaxed">{t.thank_you_message}</p>
        <div className="pt-8 flex flex-col items-center gap-4">
          <button
            onClick={() => {
              if (isEdit) window.location.reload();
              else setView('home');
            }}
            className="bg-[#d52b27] text-white px-12 py-5 rounded-full font-black uppercase text-[11px] tracking-widest hover:bg-gray-900 transition-colors shadow-lg"
          >
            {isEdit ? t.back_to_site : t.back_to_home}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-32 px-6 space-y-32">
      {!isEdit && (
        <div className="space-y-12">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 text-center tracking-tighter">{t.petition_title}</h2>
          <PetitionContent />
        </div>
      )}

      <div
        ref={formRef}
        id="sign-form-container"
        className={`bg-white rounded-[40px] shadow-2xl shadow-red-900/5 border border-gray-100 p-10 md:p-20 animate-in fade-in slide-in-from-bottom-8 duration-1000`}
      >
        <h2 className="text-4xl md:text-6xl font-black mb-16 text-center text-gray-900 tracking-tighter uppercase leading-none">
          {isEdit ? t.request_code_title : t.petition_action}
        </h2>
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
            {loading ? t.loading : (isEdit ? "Update Signature" : t.submit)}
          </button>
        </form>
      </div>
    </div>
  );
};

const ManageSignatureFlow = () => {
  const { lang, refreshStats } = useApp();
  const t = TRANSLATIONS[lang];
  const [step, setStep] = useState<'request' | 'verify' | 'edit'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editData, setEditData] = useState<any>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-edit-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, language: lang })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep('verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-edit-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEditData(data);
      setStep('edit');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'edit' && editData) {
    return <PetitionForm isEdit={true} initialData={editData} authToken={code} />;
  }

  return (
    <div className="max-w-xl mx-auto py-24 px-6">
      <div className="bg-white rounded-3xl border-2 border-gray-100 p-12 shadow-xl space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
            {step === 'request' ? t.request_code_title : t.enter_code_title}
          </h2>
          <p className="text-gray-500 font-medium">
            {step === 'request' ? t.request_code_intro : t.enter_code_intro}
          </p>
        </div>

        <form onSubmit={step === 'request' ? handleRequestCode : handleVerifyCode} className="space-y-6">
          {step === 'request' ? (
            <div className="space-y-2">
              <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest">{t.email}</label>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-2xl p-6 bg-gray-50 outline-none font-bold text-2xl focus:border-[#d52b27] transition-all shadow-sm"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[13px] font-black text-gray-400 uppercase tracking-widest">{t.enter_code_title}</label>
              <input
                required
                type="text"
                maxLength={6}
                placeholder={t.code_placeholder}
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-2xl p-6 bg-gray-50 outline-none font-bold text-4xl text-center tracking-[1rem] focus:border-[#d52b27] transition-all shadow-sm"
              />
            </div>
          )}

          {error && <p className="text-red-600 font-bold text-center bg-red-50 p-4 rounded-xl">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-8 bg-[#d52b27] text-white font-black text-xl rounded-full shadow-2xl hover:bg-gray-900 transition-all disabled:opacity-50 uppercase tracking-widest"
          >
            {loading ? t.loading : (step === 'request' ? t.request_button : t.verify_button)}
          </button>

          {step === 'verify' && (
            <button
              type="button"
              onClick={() => setStep('request')}
              className="w-full text-gray-400 font-bold hover:text-gray-600 transition-all text-sm"
            >
              {t.resend_code}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const { lang, targetTestimonialId, setTargetTestimonialId } = useApp();
  const t = TRANSLATIONS[lang];
  const [items, setItems] = useState<(Testimonial & { relationship: string[], years: string[] })[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    storage.getTestimonials().then(data => {
      setItems(data as any);
      if (targetTestimonialId) {
        setTimeout(() => {
          const el = document.getElementById(`testimonial-${targetTestimonialId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-4', 'ring-[#d52b27]/20', 'scale-[1.01]');
            setTimeout(() => {
              el.classList.remove('ring-4', 'ring-[#d52b27]/20', 'scale-[1.01]');
              setTargetTestimonialId(null);
            }, 3000);
          }
        }, 300);
      }
    });
  }, [targetTestimonialId]);

  const filteredItems = (filter === 'all'
    ? items
    : items.filter(i => i.relationship.some(r => r.includes(filter.split(' - ')[0])))
  ).sort((a, b) => a.person_name.localeCompare(b.person_name));

  return (
    <div className="max-w-6xl mx-auto py-24 px-6 space-y-20 animate-in fade-in duration-700">
      <div className="text-center space-y-10">
        <div className="space-y-4">
          <h2 className="text-7xl font-black text-gray-900 tracking-tighter">{t.testimonials_title}</h2>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">{t.testimonials_subtitle}</p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white border-2 border-gray-100 rounded-full px-8 text-[11px] font-black uppercase tracking-widest outline-none focus:border-[#d52b27] transition-all cursor-pointer appearance-none text-center min-w-[200px] h-12"
            >
              <option value="all">{lang === Language.EN ? 'All Stories' : 'Tous les témoignages'}</option>
              {Object.values(RelationshipKey).map((key) => {
                const parts = key.split(' - ');
                const label = lang === Language.FR && parts[1] ? parts[1] : parts[0];
                return (
                  <option key={key} value={key}>{label}</option>
                );
              })}
            </select>
          </div>

          <div className="flex flex-col items-center">
            <button
              onClick={() => setFilter('Alumni (over 16)')}
              className={`px-8 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border-2 h-12 flex items-center justify-center ${filter === 'Alumni (over 16)' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' : 'bg-white text-indigo-600 border-indigo-100 hover:border-indigo-600'}`}
            >
              Alumni - Anciens Élèves
            </button>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">
              {t.alumni_subtitle}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            id={`testimonial-${item.id}`}
            className="group bg-white border border-gray-100 p-8 md:p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 relative"
          >
            <div className="grid grid-cols-1 lg:grid-cols-8 gap-12 items-start">
              {/* Column 1: Metadata */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#d52b27] text-white rounded-full flex items-center justify-center font-black text-lg shrink-0">
                    {item.person_name[0]}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900 tracking-tight leading-tight">{item.person_name}</h4>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString(lang === Language.EN ? 'en-GB' : 'fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.relationship.map((rel, rIdx) => {
                    const parts = rel.split(' - ');
                    const displayName = lang === Language.FR && parts[1] ? parts[1] : parts[0];
                    return (
                      <span key={rIdx} className="text-[9px] font-bold text-gray-600 uppercase tracking-wider bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-md">
                        {displayName}
                      </span>
                    );
                  })}
                  {item.years && item.years.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 w-full mt-1 border-t border-gray-50 pt-3">
                      {item.years.map((year, yIdx) => (
                        <span key={yIdx} className="text-[10px] font-black text-blue-700 bg-blue-50/50 px-2 py-1 rounded border border-blue-100/50">
                          {year}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: Original Message */}
              <div className="lg:col-span-3 lg:border-l lg:border-gray-50 lg:pl-10 space-y-5">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Original Text</span>
                  <div className="h-px flex-1 bg-gray-100/50"></div>
                </div>
                <p className="text-xl font-medium leading-relaxed text-gray-800 italic tracking-tight">
                  "{item.content}"
                </p>
              </div>

              {/* Column 3: Translation */}
              <div className="lg:col-span-3 border-l-2 lg:border-l-4 border-red-50 pl-8 lg:pl-10 space-y-5">
                {item.content_translated ? (
                  <>
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] font-black text-[#d52b27] uppercase tracking-[0.2em] flex items-center shrink-0">
                        <span className="mr-2">✨</span>
                        {item.language === 'EN' ? 'Translated to French' : 'Translated to English'}
                      </span>
                      <div className="h-px flex-1 bg-red-100/30"></div>
                    </div>
                    <p className="text-xl font-medium leading-relaxed text-gray-500 tracking-tight">
                      {item.content_translated}
                    </p>
                  </>
                ) : (
                  <div className="h-full bg-gray-50/50 rounded-3xl border border-dashed border-gray-100 p-8 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center animate-pulse">
                      <span className="text-gray-400 text-xs">...</span>
                    </div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Translation loading...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="py-32 text-center text-gray-200 font-bold uppercase tracking-[0.2em] text-sm italic">
            {items.length === 0 ? 'Wait for the community to share...' : 'No testimonials found in this category.'}
          </div>
        )}
      </div>
    </div>
  );
};

const SignatoryList = () => {
  const { lang, setView, setShowManageSignature, setTargetTestimonialId } = useApp();
  const t = TRANSLATIONS[lang];
  const [sigs, setSigs] = useState<{ name: string, timestamp: string, relationship: string[], years: string[], hasTestimonial: boolean, testimonialId?: string, consent: boolean }[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    storage.getPublicSignatories().then(setSigs);
  }, []);

  const filteredSigs = filter === 'all'
    ? sigs
    : sigs.filter(s => s.relationship.some(r => r.includes(filter.split(' - ')[0])));

  const sortedSigs = [...filteredSigs].sort((a, b) => {
    if (a.consent !== b.consent) return a.consent ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="max-w-4xl mx-auto py-24 px-6 space-y-16 animate-in fade-in duration-500">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-7xl font-black text-gray-900 tracking-tighter leading-none">{t.signatories_title}</h2>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">{t.signatories_subtitle}</p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                setShowManageSignature(true);
                setView('petition');
              }}
              className="inline-flex items-center justify-center space-x-2 text-[#d52b27] font-black uppercase text-[11px] tracking-widest hover:text-gray-900 transition-colors border-2 border-red-50 px-6 rounded-full bg-red-50/30 h-12"
            >
              <span>{t.manage_signature}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </button>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white border-2 border-gray-100 rounded-full px-6 text-[11px] font-black uppercase tracking-widest outline-none focus:border-[#d52b27] transition-all cursor-pointer appearance-none text-center min-w-[200px] h-12"
            >
              <option value="all">{lang === Language.EN ? 'All Categories' : 'Toutes les catégories'}</option>
              {Object.values(RelationshipKey).map((key) => {
                const parts = key.split(' - ');
                const label = lang === Language.FR && parts[1] ? parts[1] : parts[0];
                return (
                  <option key={key} value={key}>{label}</option>
                );
              })}
            </select>
          </div>

          <div className="flex flex-col items-center">
            <button
              onClick={() => setFilter('Alumni (over 16)')}
              className={`px-8 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border-2 h-12 flex items-center justify-center ${filter === 'Alumni (over 16)' ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-100 shadow-xl' : 'bg-white text-indigo-600 border-indigo-100 hover:border-indigo-600'}`}
            >
              Alumni - Anciens Élèves
            </button>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3 animate-pulse">
              {t.alumni_subtitle_alt}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1 border-t border-gray-100">
        {sortedSigs.map((s, idx) => (
          <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between py-6 border-b border-gray-50 hover:bg-gray-50/50 px-6 transition-all rounded-2xl group">
            <div className="flex items-start md:items-center space-x-6">
              <span className="text-gray-400 font-black text-sm tabular-nums min-w-[2rem] pt-1 md:pt-0">
                {idx + 1}
              </span>
              <div className="flex flex-col space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-xl font-bold tracking-tight ${s.consent ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                    {s.name}
                  </span>
                  {s.hasTestimonial && (
                    <button
                      onClick={() => {
                        if (s.testimonialId) setTargetTestimonialId(s.testimonialId);
                        setView('testimonials');
                      }}
                      className="bg-red-50 text-[#d52b27] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[#d52b27] hover:text-white transition-all shadow-sm shrink-0"
                    >
                      {t.view_testimonial}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {s.relationship.map((rel, rIdx) => {
                    const parts = rel.split(' - ');
                    const displayName = lang === Language.FR && parts[1] ? parts[1] : parts[0];
                    return (
                      <span key={rIdx} className="text-[9px] font-bold text-gray-600 uppercase tracking-wider bg-gray-100/80 border border-gray-200 px-2.5 py-1 rounded-md">
                        {displayName}
                      </span>
                    );
                  })}
                  {s.years && s.years.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 ml-1 border-l border-gray-100 pl-3">
                      {s.years.map((year, yIdx) => (
                        <span key={yIdx} className="text-[11px] font-black text-blue-700 bg-blue-50/50 px-2 py-1 rounded border border-blue-100/50">
                          {year}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <span className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mt-4 md:mt-0 bg-gray-50 px-3 py-1 rounded-full md:bg-transparent md:px-0">
              {new Date(s.timestamp).toLocaleDateString(lang === Language.EN ? 'en-GB' : 'fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        ))}
        {sortedSigs.length === 0 && (
          <div className="py-32 text-center text-gray-200 font-bold uppercase tracking-[0.2em] text-sm italic">
            {sigs.length === 0 ? 'Gathering community voices...' : 'No supporters found in this category.'}
          </div>
        )}
      </div>
    </div>
  );
};

const Forum = () => {
  const { lang } = useApp();
  const t = TRANSLATIONS[lang];

  return (
    <div className="max-w-4xl mx-auto py-40 px-6 text-center space-y-12 animate-in fade-in duration-1000">
      <div className="space-y-6">
        <h2 className="text-7xl md:text-9xl font-black text-gray-900 tracking-tighter uppercase">{t.nav_forum}</h2>
        <div className="inline-flex items-center space-x-3 bg-red-50 px-6 py-2 rounded-full">
          <span className="w-2 h-2 bg-[#d52b27] rounded-full animate-pulse"></span>
          <span className="text-[10px] font-black text-[#d52b27] uppercase tracking-[0.4em]">{t.coming_soon}</span>
        </div>
      </div>
      <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
        {lang === Language.EN
          ? "We are building a space for our community to discuss, collaborate, and share ideas. Stay tuned."
          : "Nous construisons un espace pour que notre communauté puisse discuter, collaborer et partager des idées. Restez à l'écoute."}
      </p>
      <div className="pt-10">
        <div className="w-20 h-px bg-gray-100 mx-auto"></div>
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
  const [showManageSignature, setShowManageSignature] = useState(false);
  const [targetTestimonialId, setTargetTestimonialId] = useState<string | null>(null);

  const refreshStats = () => {
    storage.getPetitionStats().then(stats => setSignatureCount(stats.total));
  };

  useEffect(() => { refreshStats(); }, []);

  return (
    <AppContext.Provider value={{ lang, setLang, view, setView, signatureCount, refreshStats, showManageSignature, setShowManageSignature, targetTestimonialId, setTargetTestimonialId }}>
      {children}
    </AppContext.Provider>
  );
};

const MainContent = () => {
  const { view, setView, lang, showManageSignature, setShowManageSignature } = useApp();
  const t = TRANSLATIONS[lang];

  return (
    <main className="min-h-screen selection:bg-red-100 selection:text-red-900">
      <Navbar />
      <Disclaimer />

      {view === 'home' && (
        <>
          <Hero />
          <section id="mission-section" className="py-40 px-6 max-w-4xl mx-auto text-center space-y-16 animate-in fade-in duration-1000">
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter text-balance">{t.home_subtitle}</h2>
            <PetitionContent />
            <div className="pt-10">
              <button
                onClick={() => {
                  setView('petition');
                  setTimeout(() => {
                    document.getElementById('sign-form-container')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="group flex flex-col items-center mx-auto space-y-4"
              >
                <div className="w-24 h-24 bg-[#d52b27] rounded-full flex items-center justify-center text-white text-4xl shadow-2xl hover:scale-110 transition-transform cursor-pointer">
                  ✍️
                </div>
                <span className="font-black text-[10px] uppercase tracking-[0.4em] text-gray-400 group-hover:text-[#d52b27] transition-colors">{t.petition_action}</span>
              </button>
            </div>
          </section>
        </>
      )}

      {view === 'petition' && (
        <div id="petition" className="bg-red-50/50">
          {showManageSignature ? (
            <div className="space-y-12">
              <div className="max-w-3xl mx-auto pt-12 px-6">
                <button
                  onClick={() => {
                    setShowManageSignature(false);
                    setTimeout(() => {
                      document.getElementById('sign-form-container')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 font-bold transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>{t.back_to_petition}</span>
                </button>
              </div>
              <ManageSignatureFlow />
            </div>
          ) : (
            <>
              <PetitionForm />
              <div className="max-w-3xl mx-auto pb-24 px-6 text-center">
                <button
                  onClick={() => setShowManageSignature(true)}
                  className="text-gray-400 hover:text-[#d52b27] font-bold border-b border-gray-200 hover:border-[#d52b27] pb-1 transition-all"
                >
                  {t.manage_signature}
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {view === 'testimonials' && <Testimonials />}
      {view === 'forum' && <Forum />}
      {view === 'reconsent' && <ReconsentFlow />}
      {view === 'signatories' && <SignatoryList />}
      {view === 'analytics' && <Analytics />}

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

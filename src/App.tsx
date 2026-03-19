import { useState, useEffect, createContext, useContext, ReactNode, FormEvent, MouseEvent, useRef } from 'react';
import { MapPin, Building2, Sparkles, ExternalLink, Mail, Filter, Linkedin, ChevronRight, Copy, Check, Lock, X, Search, Bell, Bookmark, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, Link, useParams, useLocation, useNavigate } from 'react-router-dom';

// --- Auth & Usage Logic ---

interface UsageState {
  hasGated: boolean;
  linkedinClickCount: number;
  userEmail: string | null;
  subscribed: boolean;
}

const COOKIE_NAME = 'scouter_gated';

const setGatedCookie = () => {
  const date = new Date();
  date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
  document.cookie = `${COOKIE_NAME}=true; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
};

const getGatedCookie = () => {
  return document.cookie.split('; ').some(row => row.startsWith(`${COOKIE_NAME}=`));
};

const UsageContext = createContext<{
  usage: UsageState;
  trackEmail: (email: string, id: number) => 'allow' | 'reveal' | 'deny';
  trackLink: (link: string) => boolean; // returns true if allowed
  completeGate: (email: string, subscribe: boolean) => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  gateType: 'email' | 'linkedin';
  setGateType: (type: 'email' | 'linkedin') => void;
  pendingLink: string | null;
  setPendingLink: (link: string | null) => void;
} | null>(null);

function UsageProvider({ children }: { children: ReactNode }) {
  const [usage, setUsage] = useState<UsageState>(() => {
    const saved = localStorage.getItem('scouter_usage');
    const hasCookie = getGatedCookie();
    const defaultState = { hasGated: hasCookie, linkedinClickCount: 0, userEmail: null, subscribed: false };
    
    if (!saved) return defaultState;
    try {
      const parsed = JSON.parse(saved);
      return { ...defaultState, ...parsed, hasGated: hasCookie || parsed.hasGated };
    } catch (e) {
      return defaultState;
    }
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [gateType, setGateType] = useState<'email' | 'linkedin'>('email');
  const [pendingLink, setPendingLink] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('scouter_usage', JSON.stringify(usage));
    if (usage.hasGated && !getGatedCookie()) {
      setGatedCookie();
    }
  }, [usage]);

  const trackEmail = (id: number) => {
    if (usage.hasGated) return 'allow';
    return 'reveal';
  };

  const trackLink = (link: string) => {
    if (usage.hasGated) return true;
    
    if (usage.linkedinClickCount === 0) {
      setUsage(prev => ({ ...prev, linkedinClickCount: 1 }));
      return true;
    }

    setGateType('linkedin');
    setPendingLink(link);
    setShowLoginModal(true);
    return false;
  };

  const completeGate = (email: string, subscribe: boolean) => {
    setUsage(prev => ({ ...prev, hasGated: true, userEmail: email, subscribed: subscribe }));
    setGatedCookie();
    setShowLoginModal(false);
    
    if (pendingLink) {
      window.open(pendingLink, '_blank');
      setPendingLink(null);
    }
  };

  return (
    <UsageContext.Provider value={{ 
      usage, 
      trackEmail, 
      trackLink, 
      completeGate, 
      showLoginModal, 
      setShowLoginModal,
      gateType,
      setGateType,
      pendingLink,
      setPendingLink
    }}>
      {children}
      <LoginModal />
    </UsageContext.Provider>
  );
}

function useUsage() {
  const context = useContext(UsageContext);
  if (!context) throw new Error('useUsage must be used within UsageProvider');
  return context;
}

function LoginModal() {
  const { showLoginModal, setShowLoginModal, completeGate, gateType } = useUsage();
  const [email, setEmail] = useState('');
  const [subscribe, setSubscribe] = useState(true);

  if (!showLoginModal) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      completeGate(email, subscribe);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-plum/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
      >
        <button 
          onClick={() => setShowLoginModal(false)}
          className="absolute top-4 right-4 p-2 hover:bg-sand/50 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-plum/50" />
        </button>

        <div className="w-16 h-16 bg-burgundy/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <Mail className="w-8 h-8 text-burgundy" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">
          {gateType === 'email' ? 'Unlock Recruiter Contacts' : 'Continue Accessing Jobs'}
        </h2>
        <p className="text-plum/60 text-center mb-8">
          {gateType === 'email' 
            ? "Enter your email to unlock direct recruiter contacts." 
            : "Enter your email to keep accessing job listings."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-plum/80 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-burgundy transition-all"
            />
          </div>

          <div className="flex items-center gap-2 px-1">
            <input 
              type="checkbox" 
              id="subscribe"
              checked={subscribe}
              onChange={(e) => setSubscribe(e.target.checked)}
              className="w-4 h-4 accent-burgundy cursor-pointer"
            />
            <label htmlFor="subscribe" className="text-sm text-plum/70 cursor-pointer select-none">
              Subscribe to email list
            </label>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-burgundy text-white rounded-xl font-bold hover:bg-burgundy-dark transition-all shadow-lg shadow-burgundy/20 active:scale-[0.98]"
          >
            Unlock Access &rarr;
          </button>
          <p className="text-[10px] text-center text-plum/40 px-4">
            By continuing, you agree to receive job alerts and updates. We never spam.
          </p>
        </form>
        <p className="mt-6 text-center text-xs text-plum/50">
          By continuing, you agree to our{' '}
          <Link 
            to="/privacy" 
            onClick={() => setShowLoginModal(false)}
            className="underline hover:text-plum/70 transition-colors"
          >
            Privacy Policy
          </Link>.
        </p>
      </motion.div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use a small timeout to ensure the DOM has updated and layout has settled
    const timeoutId = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      // Aggressive fallbacks for different environments/browsers
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}

interface Job {
  id: number;
  role: string;
  details: string;
  company: string;
  city: string;
  country: string;
  compensation: string;
  email: string;
  link: string;
  posted_at: string;
}

function JobBoard({ initialCity = '', initialCountry = '', hideHero = false }: { initialCity?: string, initialCountry?: string, hideHero?: boolean }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();
  const { trackEmail, trackLink, usage, setGateType, setShowLoginModal } = useUsage();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState(initialCity || initialCountry || '');
  const [remoteOnly, setRemoteOnly] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage, setJobsPerPage] = useState<number | 'all'>(20);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());
  const [blurredIds, setBlurredIds] = useState<Set<number>>(new Set());
  const hasGatedRef = useRef(usage.hasGated);

  useEffect(() => {
    hasGatedRef.current = usage.hasGated;
  }, [usage.hasGated]);

  const handleCopyEmail = (email: string, id: number) => {
    if (!email) return;
    
    if (usage.hasGated) {
      navigator.clipboard.writeText(email);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      return;
    }

    if (blurredIds.has(id)) {
      setGateType('email');
      setShowLoginModal(true);
      return;
    }

    if (revealedIds.has(id)) return;

    // First time reveal
    setRevealedIds(prev => new Set(prev).add(id));
    
    setTimeout(() => {
      if (hasGatedRef.current) return;
      
      setRevealedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setBlurredIds(prev => new Set(prev).add(id));
      setGateType('email');
      setShowLoginModal(true);
    }, 2000);
  };

  const handleLinkClick = (e: MouseEvent, link: string) => {
    if (!trackLink(link)) {
      e.preventDefault();
    }
  };

  const isEmailViewed = (id: number) => {
    return usage.hasGated || revealedIds.has(id) || blurredIds.has(id);
  };

  // Clear reveal/blur states when access is granted
  useEffect(() => {
    if (usage.hasGated) {
      setRevealedIds(new Set());
      setBlurredIds(new Set());
    }
  }, [usage.hasGated]);

  // Reset filters when route changes
  useEffect(() => {
    setLocationFilter(initialCity || initialCountry || '');
  }, [initialCity, initialCountry]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, locationFilter, remoteOnly, jobsPerPage]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      job.role.toLowerCase().includes(searchLower) || 
      job.company.toLowerCase().includes(searchLower) || 
      job.details.toLowerCase().includes(searchLower);
      
    const matchesLocation = locationFilter === '' || 
      job.city.toLowerCase().includes(locationFilter.toLowerCase()) || 
      job.country.toLowerCase().includes(locationFilter.toLowerCase());
      
    const matchesRemote = !remoteOnly || job.city.toLowerCase() === 'remote' || job.country.toLowerCase() === 'remote';

    return matchesSearch && matchesLocation && matchesRemote;
  });

  const uniqueLocations = Array.from(new Set(jobs.map(j => `${j.city}, ${j.country}`))).sort() as string[];

  const totalPages = jobsPerPage === 'all' ? 1 : Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = jobsPerPage === 'all' 
    ? filteredJobs 
    : filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  const getHeadline = () => {
    if (initialCity === 'Dubai') return "ScouterZero – Product Manager Jobs in Dubai";
    if (initialCity === 'London') return "ScouterZero – Product Manager Jobs in London";
    if (initialCity === 'New York') return "ScouterZero – Product Manager Jobs in New York";
    if (initialCity === 'Remote') return "ScouterZero – Remote Product Manager Jobs";
    if (initialCountry === 'USA') return "ScouterZero – Product Manager Jobs in the United States";
    return "ScouterZero – Product Manager Jobs with Direct Recruiter Contacts";
  };

  return (
    <>
      {/* Hero Section */}
      {!hideHero && (
        <header className="bg-canvas border-b border-sand pt-6 pb-2 sm:pt-8 sm:pb-2">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex justify-center"
            >
              <a 
                href="https://wa.me/+919403052811" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 group"
              >
                <div className="p-1 bg-[#25D366]/10 rounded-xl group-hover:bg-[#25D366]/20 transition-all duration-300 group-hover:scale-105">
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-4 h-4 fill-[#25D366]"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-plum/50 group-hover:text-plum transition-colors">Feedback</span>
              </a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1 bg-burgundy/5 text-burgundy rounded-full text-sm font-bold mb-3 border border-burgundy/10"
            >
              <Sparkles className="w-4 h-4" />
              6945+ PMs joined ScouterZero in our first 30 days
            </motion.div>
            <motion.h1 
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-[44px] font-extrabold tracking-tight mb-4 leading-[1.2] text-plum"
            >
              {getHeadline()}
            </motion.h1>
            <p className="text-lg text-plum/60 font-normal mb-8 mx-auto max-w-4xl">
              Skip the black hole. Get direct recruiter emails for PM, design, and engineering roles.
            </p>
            
            <div className="max-w-4xl mx-auto bg-white p-2 rounded-2xl shadow-sm border border-sand flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-plum/50" />
                <input 
                  type="text"
                  placeholder="Search roles, skills, companies..."
                  className="w-full pl-12 pr-4 py-3 bg-transparent focus:outline-none text-plum placeholder:text-plum/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-px bg-sand hidden sm:block my-2"></div>
              <div className="relative sm:w-64">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-plum/50" />
                <select 
                  className="w-full pl-12 pr-4 py-3 bg-transparent focus:outline-none appearance-none text-plum cursor-pointer"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="">Location</option>
                  {uniqueLocations.map(loc => <option key={loc} value={loc.split(',')[0]}>{loc}</option>)}
                </select>
              </div>
              <div className="w-px bg-sand hidden sm:block my-2"></div>
              <div className="flex items-center px-2 py-2 sm:py-0">
                <button
                  onClick={() => setRemoteOnly(!remoteOnly)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    remoteOnly 
                      ? 'bg-burgundy/10 text-burgundy-dark border border-burgundy/20' 
                      : 'bg-canvas text-plum/70 border border-sand hover:bg-sand/50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${remoteOnly ? 'bg-burgundy' : 'bg-plum/50'}`} />
                  Remote Only
                </button>
              </div>
              <button className="w-full sm:w-auto px-8 py-3 bg-burgundy text-white rounded-xl font-medium hover:bg-burgundy-dark transition-colors whitespace-nowrap">
                Search &rarr;
              </button>
            </div>
            
            <div className="mt-4 text-sm text-plum/60 font-medium">
              {filteredJobs.length} active roles &middot; Updated daily
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <span className="text-xs font-bold text-plum/40 uppercase tracking-widest">Browse by Location:</span>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { name: 'Dubai', path: '/dubai' },
                  { name: 'London', path: '/london' },
                  { name: 'New York', path: '/new-york' },
                  { name: 'United States', path: '/usa' },
                  { name: 'Remote', path: '/remote' }
                ].map((loc) => (
                  <Link 
                    key={loc.path}
                    to={loc.path}
                    className="px-4 py-1.5 bg-white border border-sand rounded-full text-sm font-semibold text-plum/70 hover:border-burgundy hover:text-burgundy hover:shadow-md transition-all duration-200"
                  >
                    {loc.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content - Job Cards */}
      <main className={`max-w-4xl mx-auto pb-10 pt-4 px-4 sm:px-6 lg:px-8 ${hideHero ? 'pt-0' : ''}`}>
        {hideHero && (
          <div className="mb-4">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-sand flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-plum/50" />
                <input 
                  type="text"
                  placeholder="Search roles, skills, companies..."
                  className="w-full pl-12 pr-4 py-3 bg-transparent focus:outline-none text-plum placeholder:text-plum/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-px bg-sand hidden sm:block my-2"></div>
              <div className="relative sm:w-64">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-plum/50" />
                <select 
                  className="w-full pl-12 pr-4 py-3 bg-transparent focus:outline-none appearance-none text-plum cursor-pointer"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="">Location</option>
                  {uniqueLocations.map(loc => <option key={loc} value={loc.split(',')[0]}>{loc}</option>)}
                </select>
              </div>
              <div className="w-px bg-sand hidden sm:block my-2"></div>
              <div className="flex items-center px-2 py-2 sm:py-0">
                <button
                  onClick={() => setRemoteOnly(!remoteOnly)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    remoteOnly 
                      ? 'bg-burgundy/10 text-burgundy-dark border border-burgundy/20' 
                      : 'bg-canvas text-plum/70 border border-sand hover:bg-sand/50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${remoteOnly ? 'bg-burgundy' : 'bg-plum/50'}`} />
                  Remote Only
                </button>
              </div>
              <button className="w-full sm:w-auto px-8 py-3 bg-burgundy text-white rounded-xl font-medium hover:bg-burgundy-dark transition-colors whitespace-nowrap">
                Search &rarr;
              </button>
            </div>
            <div className="mt-4 text-sm text-plum/60 font-medium text-center sm:text-left">
              {filteredJobs.length} active roles &middot; Updated daily
            </div>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white border border-sand rounded-xl p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-sand/50 rounded-lg shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-sand/50 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-canvas rounded w-2/3 mb-4"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 bg-canvas rounded-full w-20"></div>
                      <div className="h-6 bg-canvas rounded-full w-24"></div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-sand/50">
                      <div className="h-5 bg-sand/50 rounded w-24"></div>
                      <div className="h-9 bg-sand/50 rounded-lg w-32"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white border border-sand rounded-xl p-12 text-center text-plum/60">
              No jobs found matching your criteria.
            </div>
          ) : (
            paginatedJobs.map((job) => {
              const isRemote = job.city.toLowerCase() === 'remote' || job.country.toLowerCase() === 'remote';
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={job.id} 
                  className="group bg-white border border-sand rounded-xl p-5 sm:p-6 hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-burgundy opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div className="flex justify-between items-start sm:block">
                      <div className="w-10 h-10 bg-sand/50 rounded-lg flex items-center justify-center shrink-0 text-plum/50 font-bold text-lg">
                        {job.company.charAt(0)}
                      </div>
                      <span className="sm:hidden text-xs text-plum/50 font-medium">
                        {new Date(job.posted_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-burgundy text-base">{job.role}</h3>
                        <span className="hidden sm:block text-xs text-plum/50 font-medium">
                          {new Date(job.posted_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-plum/60 mb-4 line-clamp-2 sm:line-clamp-none">{job.details}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-5">
                        <span className="px-3 py-1 bg-sand/50 text-plum/80 rounded-full text-xs font-medium flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          {job.company}
                        </span>
                        <span className="px-3 py-1 bg-sand/50 text-plum/80 rounded-full text-xs font-medium flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.city}, {job.country}
                        </span>
                        {isRemote && (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
                            Remote
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-sand/50">
                        <div className="text-sm font-bold text-emerald-600">
                          {job.compensation || 'Salary undisclosed'}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {job.email ? (
                            <button 
                              onClick={() => handleCopyEmail(job.email, job.id)}
                              className="flex-1 sm:flex-none px-4 py-2 border border-burgundy text-burgundy rounded-lg text-sm font-medium hover:bg-burgundy/5 transition-colors flex items-center justify-center gap-2"
                            >
                              {copiedId === job.id ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  Copied!
                                </>
                              ) : isEmailViewed(job.id) ? (
                                <>
                                  <Mail className="w-4 h-4" />
                                  <span className={(blurredIds.has(job.id) && !revealedIds.has(job.id) && !usage.hasGated) ? "blur-sm select-none" : ""}>
                                    {job.email}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-4 h-4" />
                                  Contact Recruiter
                                </>
                              )}
                            </button>
                          ) : null}
                          
                          {job.link && (
                            <a 
                              href={job.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => handleLinkClick(e, job.link)}
                              className="flex-1 sm:flex-none px-4 py-2 border border-sand text-plum/70 rounded-lg text-sm font-medium hover:bg-sand/20 transition-colors flex items-center justify-center gap-2"
                            >
                              <Linkedin className="w-4 h-4 text-[#0a66c2] fill-[#0a66c2]" />
                              <span>View on LinkedIn</span>
                            </a>
                          )}
                          
                          {!job.email && !job.link && (
                            <span className="text-plum/50 italic text-sm">No contact info</span>
                          )}
                          
                          <button className="p-2 text-plum/50 hover:text-burgundy hover:bg-burgundy/5 rounded-lg transition-colors border border-transparent hover:border-burgundy/20">
                            <Bookmark className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && filteredJobs.length > paginatedJobs.length && (
          <div className="mt-8 text-center">
            <button 
              onClick={() => setJobsPerPage(prev => (typeof prev === 'number' ? prev + 20 : prev))}
              className="w-full sm:w-auto px-8 py-3 bg-burgundy text-white rounded-xl font-medium hover:bg-burgundy-dark transition-colors"
            >
              Load more roles
            </button>
          </div>
        )}
      </main>

      {/* SEO Locations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-sand">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-plum">Popular PM Hubs</h2>
          <div className="h-px flex-1 bg-sand ml-6 hidden sm:block"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link to="/dubai" className="flex items-center justify-between p-5 bg-white border border-sand rounded-2xl hover:border-burgundy hover:shadow-lg transition-all group">
            <div>
              <span className="block font-bold text-plum group-hover:text-burgundy">Dubai</span>
              <span className="text-xs text-plum/50">United Arab Emirates</span>
            </div>
            <ChevronRight className="w-5 h-5 text-plum/30 group-hover:text-burgundy group-hover:translate-x-1 transition-all" />
          </Link>
          <Link to="/london" className="flex items-center justify-between p-5 bg-white border border-sand rounded-2xl hover:border-burgundy hover:shadow-lg transition-all group">
            <div>
              <span className="block font-bold text-plum group-hover:text-burgundy">London</span>
              <span className="text-xs text-plum/50">United Kingdom</span>
            </div>
            <ChevronRight className="w-5 h-5 text-plum/30 group-hover:text-burgundy group-hover:translate-x-1 transition-all" />
          </Link>
          <Link to="/new-york" className="flex items-center justify-between p-5 bg-white border border-sand rounded-2xl hover:border-burgundy hover:shadow-lg transition-all group">
            <div>
              <span className="block font-bold text-plum group-hover:text-burgundy">New York</span>
              <span className="text-xs text-plum/50">United States</span>
            </div>
            <ChevronRight className="w-5 h-5 text-plum/30 group-hover:text-burgundy group-hover:translate-x-1 transition-all" />
          </Link>
          <Link to="/usa" className="flex items-center justify-between p-5 bg-white border border-sand rounded-2xl hover:border-burgundy hover:shadow-lg transition-all group">
            <div>
              <span className="block font-bold text-plum group-hover:text-burgundy">United States</span>
              <span className="text-xs text-plum/50">North America</span>
            </div>
            <ChevronRight className="w-5 h-5 text-plum/30 group-hover:text-burgundy group-hover:translate-x-1 transition-all" />
          </Link>
          <Link to="/remote" className="flex items-center justify-between p-5 bg-white border border-sand rounded-2xl hover:border-burgundy hover:shadow-lg transition-all group">
            <div>
              <span className="block font-bold text-plum group-hover:text-burgundy">Remote</span>
              <span className="text-xs text-plum/50">Work from anywhere</span>
            </div>
            <ChevronRight className="w-5 h-5 text-plum/30 group-hover:text-burgundy group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </section>
    </>
  );
}

function LocationLanding() {
  const { location } = useParams();
  const cityMap: Record<string, string> = { 
    'dubai': 'Dubai', 
    'london': 'London', 
    'remote': 'Remote',
    'new-york': 'New York'
  };
  const countryMap: Record<string, string> = { 'usa': 'USA' };
  
  const city = cityMap[location || ''];
  const country = countryMap[location || ''];
  
  const seoContent: Record<string, { title: string; subtitle: string; body: string; highlights: string[] }> = {
    'dubai': {
      title: "Product Manager Jobs in Dubai",
      subtitle: "Join the Middle East's most vibrant tech ecosystem.",
      body: "Dubai is rapidly becoming a global technology hub, attracting top-tier talent from around the world. With its strategic location, tax-free environment, and massive investment in digital transformation, the city offers unique opportunities for Product Managers to build world-class products in sectors like FinTech, E-commerce, and Logistics.",
      highlights: ["Tax-free salary packages", "High quality of life", "Rapidly growing startup scene", "Global networking hub"]
    },
    'london': {
      title: "Product Manager Jobs in London",
      subtitle: "Build the future in Europe's leading tech capital.",
      body: "London remains at the forefront of global innovation, particularly in FinTech, AI, and Creative Tech. The city's diverse talent pool and access to venture capital make it an ideal place for Product Managers to scale products from seed stage to IPO. From East London's Tech City to the giants in King's Cross, the opportunities are endless.",
      highlights: ["World-leading FinTech hub", "Access to global VC capital", "Diverse and international culture", "Thriving tech community"]
    },
    'new-york': {
      title: "Product Manager Jobs in New York",
      subtitle: "Lead innovation in the world's financial and media capital.",
      body: "New York City's tech scene, often called 'Silicon Alley', is a powerhouse of innovation across Finance, Media, Advertising, and HealthTech. For Product Managers, NYC offers a unique blend of established giants and high-growth startups, all operating in one of the world's most dynamic urban environments.",
      highlights: ["Epicenter of FinTech and Media", "Unmatched networking opportunities", "Diverse industry landscape", "High-energy startup culture"]
    },
    'remote': {
      title: "Remote Product Manager Jobs",
      subtitle: "Work from anywhere, build for everywhere.",
      body: "The future of work is distributed. Remote Product Management roles offer the flexibility to design your life while working with the world's most innovative companies. Whether you're a digital nomad or prefer the comfort of your home office, remote roles allow you to focus on impact rather than commute times.",
      highlights: ["Ultimate work-life balance", "Access to global companies", "Location independence", "Focus on asynchronous results"]
    },
    'usa': {
      title: "Product Manager Jobs in the USA",
      subtitle: "Innovate at the epicenter of the global tech industry.",
      body: "The United States continues to lead the world in technological advancement. From the legendary Silicon Valley to emerging hubs like Austin, Miami, and New York, the US offers the most competitive and diverse Product Management landscape. Work on products that define categories and reach billions of users globally.",
      highlights: ["Highest global compensation", "Category-defining companies", "Unmatched career growth", "Diverse industry specializations"]
    }
  };

  const content = seoContent[location || ''];

  if (!content) return <JobBoard />;

  return (
    <div className="min-h-screen bg-white">
      {/* SEO Rich Header */}
      <div className="bg-canvas border-b border-sand py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-burgundy/5 text-burgundy rounded-full text-sm font-bold mb-6 border border-burgundy/10"
              >
                <Sparkles className="w-4 h-4" />
                6945+ PMs joined ScouterZero in our first 30 days
              </motion.div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-plum mb-6">
                {content.title}
              </h1>
              <p className="text-xl text-plum/70 mb-8 leading-relaxed">
                {content.body}
              </p>
              <div className="flex flex-wrap gap-3">
                {content.highlights.map((h, i) => (
                  <span key={i} className="px-4 py-2 bg-burgundy/5 text-burgundy-dark rounded-full text-sm font-bold border border-burgundy/10">
                    {h}
                  </span>
                ))}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden lg:block relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-burgundy/10 to-burgundy-dark/10 border border-sand flex items-center justify-center overflow-hidden p-12">
                <div className="text-center">
                  <Sparkles className="w-24 h-24 text-burgundy mx-auto mb-6 opacity-20" />
                  <div className="text-2xl font-bold text-plum/50">Verified Recruiter Contacts</div>
                  <div className="text-sm text-plum/50 mt-2">Updated daily for {content.title.split(' ').pop()}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* The Job Board Section */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <h2 className="text-2xl font-bold">Current Openings</h2>
          <p className="text-plum/60">Showing all verified Product Manager roles in this region.</p>
        </div>
        <JobBoard initialCity={city} initialCountry={country} hideHero={true} />
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-lg max-w-none"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-plum mb-4">
            The ScouterZero Story
          </h1>
          <p className="text-burgundy font-bold mb-8 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            6945+ PMs joined ScouterZero in our first 30 days
          </p>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-plum mb-4">Why We Exist: Breaking the "ATS Black Hole"</h2>
            <p className="text-plum/70 leading-relaxed mb-6">
              Most job boards today are designed for algorithms, not people. When you click "Apply" on a typical platform, your resume is instantly fed into an Applicant Tracking System (ATS).
            </p>
            <p className="text-plum/70 leading-relaxed mb-6">
              The reality is harsh: unless your CV perfectly matches a specific set of keywords, it gets slotted into a digital folder that many recruiters never even open. Your experience, your "vibe," and your potential are often hidden behind a machine-learning filter before a human ever sees your name.
            </p>
            <p className="text-burgundy font-bold text-xl">
              We think that’s a broken way to hire Product Managers.
            </p>
          </section>

          <section className="mb-12 bg-canvas p-8 rounded-3xl border border-sand">
            <h2 className="text-2xl font-bold text-plum mb-4">The ScouterZero Difference: Direct to Human</h2>
            <p className="text-plum/70 leading-relaxed mb-6">
              ScouterZero isn't just another job board. We are a Human-First gateway designed to get you noticed.
            </p>
            <p className="text-plum/70 leading-relaxed mb-6">
              Instead of leaving your career to chance in a database, we prioritize direct connections. Wherever possible, we provide the "Zero-Distance" path:
            </p>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="w-6 h-6 bg-burgundy/10 text-burgundy rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-plum block">Direct Recruiter Access</strong>
                  <span className="text-plum/70">We find the LinkedIn profiles or direct email addresses of the actual hiring team.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-6 h-6 bg-burgundy/10 text-burgundy rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-plum block">Bypassing the Gatekeeper</strong>
                  <span className="text-plum/70">By reaching out directly, you ensure a human—not an algorithm—reviews your CV.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-6 h-6 bg-burgundy/10 text-burgundy rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-plum block">Higher Call-Back Rates</strong>
                  <span className="text-plum/70">Direct outreach significantly increases the probability of your profile being seen, leading to more interviews and faster hires.</span>
                </div>
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-plum mb-4">Our Philosophy: High Signal, No Noise</h2>
            <p className="text-plum/70 leading-relaxed mb-6">
              As Product Managers, we know that the best products are built on high-quality data. We apply that same logic to your job search.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-6 bg-white border border-sand rounded-2xl shadow-sm">
                <h3 className="font-bold mb-2">No "Ghost" Jobs</h3>
                <p className="text-sm text-plum/60">We focus on active, high-impact PM roles.</p>
              </div>
              <div className="p-6 bg-white border border-sand rounded-2xl shadow-sm">
                <h3 className="font-bold mb-2">Curated for PMs</h3>
                <p className="text-sm text-plum/60">We categorize roles by specific PM archetypes (Growth, Technical, Core).</p>
              </div>
              <div className="p-6 bg-white border border-sand rounded-2xl shadow-sm">
                <h3 className="font-bold mb-2">Shortcut to Interview</h3>
                <p className="text-sm text-plum/60">We provide the tools and the contact info; you provide the talent.</p>
              </div>
            </div>
          </section>

          <section className="text-center py-12 border-t border-sand">
            <h2 className="text-3xl font-bold text-plum mb-4">Join the Community</h2>
            <p className="text-xl text-plum/70 mb-8 max-w-2xl mx-auto">
              ScouterZero was built to empower the PM community to take control of their career narrative. Stop being a row in a spreadsheet and start being a candidate with a voice.
            </p>
            <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-burgundy text-white rounded-full font-bold hover:bg-burgundy-dark transition-all">
              Browse Jobs
              <ChevronRight className="w-5 h-5" />
            </Link>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

function Contact() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-plum mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-plum/70">
            Have questions or need support? We're here to help.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-canvas p-8 rounded-3xl border border-sand"
          >
            <div className="w-12 h-12 bg-plum rounded-2xl flex items-center justify-center mb-6">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Email Us</h2>
            <p className="text-plum/70 mb-4">For all inquiries, please reach out to our support team.</p>
            <a 
              href="mailto:support@scouterzero.com" 
              className="text-xl font-bold text-burgundy hover:text-burgundy-dark transition-colors"
            >
              support@scouterzero.com
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-canvas p-8 rounded-3xl border border-sand"
          >
            <div className="w-12 h-12 bg-plum rounded-2xl flex items-center justify-center mb-6">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Our Location</h2>
            <p className="text-plum/70">
              Barsha Heights<br />
              Dubai, United Arab Emirates
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-slate max-w-none"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-plum mb-4">
            Privacy Policy for ScouterZero
          </h1>
          <div className="flex flex-col gap-1 text-plum/60 mb-12">
            <p>Effective Date: March 11, 2026</p>
            <p>Last Updated: March 11, 2026</p>
          </div>

          <div className="space-y-12 text-plum/70 leading-relaxed">
            <section>
              <p className="text-lg">
                Welcome to ScouterZero (accessible at scouterzero.com). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and share your information in compliance with the Information Technology Act, 2000, and the Digital Personal Data Protection Act (DPDPA), 2023.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-plum mb-4">1. Data Fiduciary and Collection</h2>
              <p className="mb-4">ScouterZero acts as the "Data Fiduciary." We collect the following categories of "Personal Data":</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>User-Provided Data:</strong> Name, email address, LinkedIn profile link, and resume details.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, and device identifiers collected via cookies.</li>
                <li><strong>Public Data:</strong> Professional information aggregated from public job listings and professional networks to provide a comprehensive job board experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-plum mb-4">2. Purpose of Data Processing</h2>
              <p className="mb-4">We process your data only for "Lawful Purposes" related to our recruitment platform:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and maintain our job board services.</li>
                <li>To notify you about PM job openings that match your profile.</li>
                <li>To facilitate communication between you and potential employers.</li>
                <li>To improve our platform’s user experience through data analytics.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-plum mb-4">3. Marketing and Platform Partnerships</h2>
              <p className="mb-4">ScouterZero is a hub for the Product Management community. We actively encourage growth through professional collaborations.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>B2B/Marketing Inquiries:</strong> Organizations, recruiters, or service providers looking to market their tools or roles on our platform may contact us for partnership opportunities.</li>
                <li><strong>User Consent:</strong> We will only send promotional or marketing communications to users who have provided clear, affirmative consent. You have the right to withdraw this consent at any time through the "Unsubscribe" link in our emails.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-plum mb-4">4. Data Sharing and Third Parties</h2>
              <p className="mb-4">We do not sell your personal data. Sharing only occurs:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>With Employers:</strong> When you apply for a position, your data is shared with the hiring entity.</li>
                <li><strong>Service Providers:</strong> With cloud hosting (e.g., AWS/Google Cloud), email services, and analytics providers who act as "Data Processors."</li>
                <li><strong>Legal Obligations:</strong> If required by Indian law enforcement or regulatory bodies (such as CERT-In).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-plum mb-4">5. Your Rights as a "Data Principal"</h2>
              <p className="mb-4">In accordance with Indian law, you have the following rights:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Right to Correction and Erasure:</strong> You may request to update or delete your data.</li>
                <li><strong>Right of Grievance Redressal:</strong> You have the right to address any concerns regarding your data processing with our Grievance Officer.</li>
                <li><strong>Right to Nominate:</strong> You may nominate an individual to exercise your rights in the event of death or incapacity.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-plum mb-4">6. Data Security and Storage</h2>
              <p>We use industry-standard encryption to protect your data. While we are based in India, your data may be stored on secure global servers. We ensure that any cross-border transfer complies with the standards set by the Indian government.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-plum mb-4">7. Grievance Officer</h2>
              <p className="mb-4">In accordance with the Information Technology Act and DPDPA, if you have any questions, wish to report a breach, or want to contact us regarding marketing and partnership opportunities, please reach out to our designated officer:</p>
              <div className="bg-canvas p-6 rounded-2xl border border-sand inline-block">
                <p className="font-bold text-plum">Contact: <a href="mailto:support@scouterzero.com" className="text-burgundy hover:text-burgundy-dark">support@scouterzero.com</a></p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UsageProvider>
        <ScrollToTop />
        <div className="min-h-screen bg-canvas text-plum font-sans">
          {/* Navigation */}
          <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-sand">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-12">
                <div className="flex items-center">
                  <Link to="/" className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-burgundy" />
                    <span className="text-lg sm:text-xl font-bold tracking-tight truncate text-plum">ScouterZero</span>
                  </Link>
                </div>
                <div className="flex items-center gap-4 sm:gap-8">
                  <div className="hidden md:flex items-center gap-6 text-sm font-medium text-plum/60">
                    <Link to="/about" className="hover:text-plum transition-colors">About</Link>
                    <Link to="/contact" className="hover:text-plum transition-colors">Contact Us</Link>
                    <a 
                      href="https://linkedinmsgextension.scouterzero.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 border border-burgundy text-burgundy rounded-lg hover:bg-burgundy/5 transition-colors"
                    >
                      LinkedIn Extension
                    </a>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <a 
                      href="https://www.linkedin.com/company/scouterzero/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 bg-[#0a66c2] text-white rounded-lg text-[11px] sm:text-sm font-bold hover:bg-[#004182] transition-all shadow-sm active:scale-95 whitespace-nowrap"
                    >
                      <Linkedin className="w-3 h-3 sm:w-4 sm:h-4 fill-white" />
                      Follow on LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Spacer for fixed navigation */}
          <div className="h-12" />

          <Routes>
            <Route path="/" element={<JobBoard />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/:location" element={<LocationLanding />} />
          </Routes>

          {/* Footer */}
          <footer className="bg-white border-t border-sand py-8 sm:py-12 mt-12 sm:mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-burgundy" />
                  <span className="font-bold text-plum">ScouterZero</span>
                </div>
                <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-plum/60">
                  <Link to="/" className="hover:text-plum transition-colors">Home</Link>
                  <Link to="/about" className="hover:text-plum transition-colors">About</Link>
                  <Link to="/privacy" className="hover:text-plum transition-colors">Privacy</Link>
                  <Link to="/contact" className="hover:text-plum transition-colors">Contact</Link>
                </div>
                <p className="text-sm text-plum/50">© 2026 ScouterZero. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </UsageProvider>
    </BrowserRouter>
  );
}

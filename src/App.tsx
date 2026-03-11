import { useState, useEffect } from 'react';
import { MapPin, Building2, Sparkles, ExternalLink, Mail, Filter, Linkedin, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { BrowserRouter, Routes, Route, Link, useParams, useLocation } from 'react-router-dom';

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

  // Filters
  const [roleFilter, setRoleFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [cityFilter, setCityFilter] = useState(initialCity);
  const [countryFilter, setCountryFilter] = useState(initialCountry);

  // Reset filters when route changes
  useEffect(() => {
    setCityFilter(initialCity);
    setCountryFilter(initialCountry);
  }, [initialCity, initialCountry]);

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
    const matchesRole = roleFilter === '' || job.role.toLowerCase().includes(roleFilter.toLowerCase());
    const matchesCompany = companyFilter === '' || job.company.toLowerCase().includes(companyFilter.toLowerCase());
    const matchesCity = cityFilter === '' || job.city.toLowerCase() === cityFilter.toLowerCase();
    const matchesCountry = countryFilter === '' || job.country.toLowerCase() === countryFilter.toLowerCase();

    return matchesRole && matchesCompany && matchesCity && matchesCountry;
  });

  const uniqueRoles = Array.from(new Set(jobs.map(j => j.role))).sort();
  const uniqueCompanies = Array.from(new Set(jobs.map(j => j.company))).sort();
  const uniqueCities = Array.from(new Set(jobs.map(j => j.city))).sort();
  const uniqueCountries = Array.from(new Set(jobs.map(j => j.country))).sort();

  const getHeadline = () => {
    if (initialCity === 'Dubai') return "ScouterZero – Product Manager Jobs in Dubai";
    if (initialCity === 'London') return "ScouterZero – Product Manager Jobs in London";
    if (initialCity === 'Remote') return "ScouterZero – Remote Product Manager Jobs";
    if (initialCountry === 'USA') return "ScouterZero – Product Manager Jobs in the United States";
    return "ScouterZero – Product Manager Jobs with Direct Recruiter Contacts";
  };

  return (
    <>
      {/* Hero Section */}
      {!hideHero && (
        <header className="bg-white border-b border-black/5 py-8 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 sm:mb-8 leading-tight"
            >
              {getHeadline()}
            </motion.h1>

            <div className="flex justify-center mb-8 sm:hidden">
               <a 
                  href="https://www.linkedin.com/company/scouterzero/posts/?feedView=all&viewAsMember=true" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0077B5] text-white rounded-full text-sm font-bold hover:bg-[#006097] transition-colors shadow-lg"
                >
                  <Linkedin className="w-4 h-4" />
                  Follow on LinkedIn
                </a>
            </div>
            
            <div className="max-w-6xl mx-auto">
              {/* Filters Row */}
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 appearance-none text-sm shadow-sm"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">All Roles</option>
                    {uniqueRoles.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 appearance-none text-sm shadow-sm"
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                  >
                    <option value="">All Companies</option>
                    {uniqueCompanies.map(company => <option key={company} value={company}>{company}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 appearance-none text-sm shadow-sm"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                  >
                    <option value="">All Cities</option>
                    {uniqueCities.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 appearance-none text-sm shadow-sm"
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                  >
                    <option value="">All Countries</option>
                    {uniqueCountries.map(country => <option key={country} value={country}>{country}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content - Table (Desktop) & Cards (Mobile) */}
      <main className={`max-w-full sm:max-w-[95%] mx-auto py-6 sm:py-12 px-4 sm:px-0 ${hideHero ? 'pt-0' : ''}`}>
        {hideHero && (
          <div className="max-w-6xl mx-auto mb-8">
            {/* Filters Row - Re-rendered here if hero is hidden */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 appearance-none text-sm shadow-sm"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  {uniqueRoles.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 appearance-none text-sm shadow-sm"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                >
                  <option value="">All Companies</option>
                  {uniqueCompanies.map(company => <option key={company} value={company}>{company}</option>)}
                </select>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 appearance-none text-sm shadow-sm"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <option value="">All Cities</option>
                  {uniqueCities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 appearance-none text-sm shadow-sm"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                >
                  <option value="">All Countries</option>
                  {uniqueCountries.map(country => <option key={country} value={country}>{country}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
        {/* Desktop Table View */}
        <div className="hidden sm:block bg-white border border-black/5 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-black/5">
                  <th className="px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Role</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Details</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Company</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">City</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Country</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Compensation</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Email</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Updated</th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 sm:px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                      ))}
                    </tr>
                  ))
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 sm:px-6 py-12 text-center text-gray-500">
                      No jobs found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-4 sm:px-6 py-4 font-bold text-emerald-600 whitespace-nowrap" title={job.role}>{job.role}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                        <div className="max-w-[300px] overflow-x-auto whitespace-nowrap scrollbar-hide" title={job.details}>
                          {job.details}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap">{job.company}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{job.city}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{job.country}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-mono text-gray-700 whitespace-nowrap">{job.compensation}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm">
                        <a href={`mailto:${job.email}`} className="inline-flex items-center gap-1 text-gray-400 hover:text-black transition-colors whitespace-nowrap">
                          <Mail className="w-4 h-4" />
                          <span className="hidden lg:inline">{job.email}</span>
                          <span className="lg:hidden">Contact</span>
                        </a>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-[10px] sm:text-xs text-gray-400 font-mono whitespace-nowrap">
                        {new Date(job.posted_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm">
                        {job.link && (
                          <a 
                            href={job.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-100 rounded-lg inline-flex items-center justify-center hover:bg-black hover:text-white transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white border border-black/5 rounded-2xl p-5 animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-50 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-50 rounded w-full"></div>
                  <div className="h-3 bg-gray-50 rounded w-5/6"></div>
                </div>
                <div className="mt-6 flex justify-between">
                  <div className="h-8 bg-gray-100 rounded w-24"></div>
                  <div className="h-8 bg-gray-100 rounded w-8"></div>
                </div>
              </div>
            ))
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white border border-black/5 rounded-2xl p-12 text-center text-gray-500">
              No jobs found matching your criteria.
            </div>
          ) : (
            filteredJobs.map((job) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={job.id} 
                className="bg-white border border-black/5 rounded-2xl p-5 shadow-sm active:scale-[0.98] transition-transform"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-emerald-600 text-lg leading-tight">{job.role}</h3>
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    {new Date(job.posted_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-y-2 gap-x-4 mb-4">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    {job.company}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {job.city}, {job.country}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{job.details}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-black/5">
                  <div className="text-sm font-mono font-bold text-gray-700">
                    {job.compensation}
                  </div>
                  <div className="flex items-center gap-2">
                    <a 
                      href={`mailto:${job.email}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Contact
                    </a>
                    {job.link && (
                      <a 
                        href={job.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-black text-white rounded-xl inline-flex items-center justify-center hover:bg-gray-800 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* SEO Locations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-black/5">
        <h2 className="text-xl font-bold mb-6">Popular Locations</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to="/dubai" className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-2xl hover:border-emerald-500 transition-colors group">
            <span className="font-medium">Dubai</span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />
          </Link>
          <Link to="/london" className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-2xl hover:border-emerald-500 transition-colors group">
            <span className="font-medium">London</span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />
          </Link>
          <Link to="/remote" className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-2xl hover:border-emerald-500 transition-colors group">
            <span className="font-medium">Remote</span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />
          </Link>
          <Link to="/usa" className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-2xl hover:border-emerald-500 transition-colors group">
            <span className="font-medium">United States</span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />
          </Link>
        </div>
      </section>
    </>
  );
}

function LocationLanding() {
  const { location } = useParams();
  const cityMap: Record<string, string> = { 'dubai': 'Dubai', 'london': 'London', 'remote': 'Remote' };
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
      <div className="bg-gray-50 border-b border-black/5 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
                {content.title}
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {content.body}
              </p>
              <div className="flex flex-wrap gap-3">
                {content.highlights.map((h, i) => (
                  <span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100">
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
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-black/5 flex items-center justify-center overflow-hidden p-12">
                <div className="text-center">
                  <Sparkles className="w-24 h-24 text-emerald-500 mx-auto mb-6 opacity-20" />
                  <div className="text-2xl font-bold text-gray-400">Verified Recruiter Contacts</div>
                  <div className="text-sm text-gray-400 mt-2">Updated daily for {content.title.split(' ').pop()}</div>
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
          <p className="text-gray-500">Showing all verified Product Manager roles in this region.</p>
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
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-8">
            The ScouterZero Story
          </h1>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why We Exist: Breaking the "ATS Black Hole"</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Most job boards today are designed for algorithms, not people. When you click "Apply" on a typical platform, your resume is instantly fed into an Applicant Tracking System (ATS).
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              The reality is harsh: unless your CV perfectly matches a specific set of keywords, it gets slotted into a digital folder that many recruiters never even open. Your experience, your "vibe," and your potential are often hidden behind a machine-learning filter before a human ever sees your name.
            </p>
            <p className="text-emerald-600 font-bold text-xl">
              We think that’s a broken way to hire Product Managers.
            </p>
          </section>

          <section className="mb-12 bg-gray-50 p-8 rounded-3xl border border-black/5">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The ScouterZero Difference: Direct to Human</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              ScouterZero isn't just another job board. We are a Human-First gateway designed to get you noticed.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Instead of leaving your career to chance in a database, we prioritize direct connections. Wherever possible, we provide the "Zero-Distance" path:
            </p>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-gray-900 block">Direct Recruiter Access</strong>
                  <span className="text-gray-600">We find the LinkedIn profiles or direct email addresses of the actual hiring team.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-gray-900 block">Bypassing the Gatekeeper</strong>
                  <span className="text-gray-600">By reaching out directly, you ensure a human—not an algorithm—reviews your CV.</span>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-gray-900 block">Higher Call-Back Rates</strong>
                  <span className="text-gray-600">Direct outreach significantly increases the probability of your profile being seen, leading to more interviews and faster hires.</span>
                </div>
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Philosophy: High Signal, No Noise</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              As Product Managers, we know that the best products are built on high-quality data. We apply that same logic to your job search.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-6 bg-white border border-black/5 rounded-2xl shadow-sm">
                <h3 className="font-bold mb-2">No "Ghost" Jobs</h3>
                <p className="text-sm text-gray-500">We focus on active, high-impact PM roles.</p>
              </div>
              <div className="p-6 bg-white border border-black/5 rounded-2xl shadow-sm">
                <h3 className="font-bold mb-2">Curated for PMs</h3>
                <p className="text-sm text-gray-500">We categorize roles by specific PM archetypes (Growth, Technical, Core).</p>
              </div>
              <div className="p-6 bg-white border border-black/5 rounded-2xl shadow-sm">
                <h3 className="font-bold mb-2">Shortcut to Interview</h3>
                <p className="text-sm text-gray-500">We provide the tools and the contact info; you provide the talent.</p>
              </div>
            </div>
          </section>

          <section className="text-center py-12 border-t border-black/5">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join the Community</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              ScouterZero was built to empower the PM community to take control of their career narrative. Stop being a row in a spreadsheet and start being a candidate with a voice.
            </p>
            <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-all">
              Browse Jobs
              <ChevronRight className="w-5 h-5" />
            </Link>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg sm:text-xl font-bold tracking-tight truncate">ScouterZero</span>
                </Link>
              </div>
              <div className="flex items-center gap-4 sm:gap-8">
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
                  <Link to="/about" className="hover:text-black transition-colors">About</Link>
                  <a 
                    href="https://linkedinmsgextension.scouterzero.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-black transition-colors"
                  >
                    LinkedIn Extension
                  </a>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <a 
                    href="https://www.linkedin.com/company/scouterzero/posts/?feedView=all&viewAsMember=true" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-full text-sm font-medium hover:bg-[#006097] transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    Follow
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<JobBoard />} />
          <Route path="/about" element={<About />} />
          <Route path="/:location" element={<LocationLanding />} />
        </Routes>

        {/* Footer */}
        <footer className="bg-white border-t border-black/5 py-8 sm:py-12 mt-12 sm:mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">ScouterZero</span>
              </div>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-gray-500">
                <Link to="/" className="hover:text-black transition-colors">Home</Link>
                <Link to="/about" className="hover:text-black transition-colors">About</Link>
                <a href="#" className="hover:text-black transition-colors">Privacy</a>
                <a href="#" className="hover:text-black transition-colors">Terms</a>
                <a href="#" className="hover:text-black transition-colors">Contact</a>
              </div>
              <p className="text-sm text-gray-400">© 2026 ScouterZero. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

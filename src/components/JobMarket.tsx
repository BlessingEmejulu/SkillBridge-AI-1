import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Building2, 
  ExternalLink, 
  Sparkles, 
  Search, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { useOnlineStatus, simulateNetworkRequest } from '../lib/useOnlineStatus';
import { loadFromDB, saveToDB } from '../lib/store';
import { cn } from '../lib/utils';

interface Job {
  title: string;
  company: string;
  location: string;
  salary: string;
  match: number;
  link: string;
  description?: string;
}

export default function JobMarket() {
  const { isOnline, speed } = useOnlineStatus();
  
  // Search state
  const [targetRole, setTargetRole] = useState('Junior ML Engineer');
  const [skills, setSkills] = useState('Python, React, TypeScript, TensorFlow');
  
  // Job list and market insights
  const [jobs, setJobs] = useState<Job[]>([
    { title: 'Senior Frontend Developer', company: 'TechCorp', location: 'Remote', salary: '$120k - $150k', match: 92, link: 'https://github.com/careers', description: 'Lead the frontend development of high-performance web applications using React.' },
    { title: 'React Engineer', company: 'Innovate.io', location: 'New York, NY', salary: '$110k - $140k', match: 88, link: 'https://google.com/about/careers', description: 'Design and implement complex, interactive user interfaces for cloud services.' },
    { title: 'UI/UX Developer', company: 'DesignStudio', location: 'San Francisco, CA', salary: '$130k - $160k', match: 85, link: 'https://apple.com/jobs', description: 'Bridge the gap between design and development by delivering perfect UI components.' }
  ]);
  const [marketTrend, setMarketTrend] = useState('+14%');
  const [marketTrendDesc, setMarketTrendDesc] = useState('Demand for React and ML engineers has consistently grown in the last 6 months.');
  const [avgSalary, setAvgSalary] = useState('$135,000');
  const [avgSalaryDesc, setAvgSalaryDesc] = useState('For Junior to Mid-level positions in your region with this skill combination.');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [offlineBadge, setOfflineBadge] = useState(false);

  // Load from DB on mount
  useEffect(() => {
    const init = async () => {
      const savedRole = await loadFromDB('job_market_role', 'Junior ML Engineer');
      const savedSkills = await loadFromDB('job_market_skills', 'Python, React, TypeScript, TensorFlow');
      const savedJobs = await loadFromDB('job_market_jobs', null);
      const savedTrend = await loadFromDB('job_market_trend', null);
      const savedTrendDesc = await loadFromDB('job_market_trend_desc', null);
      const savedSalary = await loadFromDB('job_market_salary', null);
      const savedSalaryDesc = await loadFromDB('job_market_salary_desc', null);
      const savedTime = await loadFromDB('job_market_last_updated', null);
      const savedOfflineBadge = await loadFromDB('job_market_is_offline', false);

      if (savedRole) setTargetRole(savedRole);
      if (savedSkills) setSkills(savedSkills);
      if (savedJobs) setJobs(savedJobs);
      if (savedTrend) setMarketTrend(savedTrend);
      if (savedTrendDesc) setMarketTrendDesc(savedTrendDesc);
      if (savedSalary) setAvgSalary(savedSalary);
      if (savedSalaryDesc) setAvgSalaryDesc(savedSalaryDesc);
      if (savedTime) setLastUpdated(savedTime);
      setOfflineBadge(savedOfflineBadge);
    };
    init();
  }, []);

  const offlineJobsDatabase = [
    { title: 'Machine Learning Engineer', company: 'NeuralScale', location: 'Remote', salary: '$140k - $180k', match: 95, link: 'https://github.com/careers', description: 'Train and optimize transformer pipelines and neural models using Python and PyTorch.' },
    { title: 'Junior Data Scientist', company: 'DataStream', location: 'Austin, TX', salary: '$90k - $115k', match: 86, link: 'https://google.com/about/careers', description: 'Analyze business analytics, deploy random forests, and structure SQL pipelines.' },
    { title: 'React Frontend Developer', company: 'PixelPerfect', location: 'San Francisco, CA', salary: '$115k - $145k', match: 91, link: 'https://apple.com/jobs', description: 'Craft highly responsive PWA applications with offline support using React and Tailwind.' },
    { title: 'Fullstack Software Engineer', company: 'DevSilo', location: 'Seattle, WA', salary: '$130k - $160k', match: 89, link: 'https://github.com/careers', description: 'Build scalable RESTful API controllers with Node.js and client components in React.' },
    { title: 'DevOps & Site Reliability Specialist', company: 'CloudGrid', location: 'Remote', salary: '$125k - $155k', match: 84, link: 'https://google.com/about/careers', description: 'Configure Kubernetes clusters, Docker configs, and maintain CI/CD pipelines.' }
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim() || !skills.trim()) return;

    setIsLoading(true);
    setError(null);
    setOfflineBadge(false);

    if (!isOnline || speed === 'offline') {
      // Offline heuristic match
      setTimeout(async () => {
        const query = targetRole.toLowerCase();
        const skillQuery = skills.toLowerCase();
        
        let filtered = offlineJobsDatabase.filter(j => 
          j.title.toLowerCase().includes(query) || 
          j.description.toLowerCase().includes(query) ||
          skillQuery.split(',').some(sk => j.description.toLowerCase().includes(sk.trim()))
        );

        if (filtered.length === 0) {
          filtered = offlineJobsDatabase;
        }

        // update matching percentages dynamically to fit inputs
        const processed = filtered.map(j => {
          let score = j.match;
          if (j.title.toLowerCase().includes(query)) score += 3;
          if (skillQuery.split(',').some(sk => j.description.toLowerCase().includes(sk.trim()))) score += 2;
          return { ...j, match: Math.min(score, 99) };
        });

        const sorted = processed.sort((a, b) => b.match - a.match);

        // heuristic insights
        let mockTrend = '+12%';
        let mockTrendDesc = `Demand for developers skilled in "${skills.split(',')[0]}" is trending steadily in local caches.`;
        let mockSalary = '$128,000';
        if (query.includes('ml') || query.includes('data') || query.includes('python')) {
          mockTrend = '+16%';
          mockSalary = '$142,000';
          mockTrendDesc = 'High hiring frequency for cached Machine Learning and Data engineering credentials.';
        }

        setJobs(sorted);
        setMarketTrend(mockTrend);
        setMarketTrendDesc(mockTrendDesc);
        setAvgSalary(mockSalary);
        setAvgSalaryDesc(`Typical regional estimate for role "${targetRole}" based on cached local job indexes.`);
        setOfflineBadge(true);

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastUpdated(timestamp + " (Cached)");

        await saveToDB('job_market_role', targetRole);
        await saveToDB('job_market_skills', skills);
        await saveToDB('job_market_jobs', sorted);
        await saveToDB('job_market_trend', mockTrend);
        await saveToDB('job_market_trend_desc', mockTrendDesc);
        await saveToDB('job_market_salary', mockSalary);
        await saveToDB('job_market_salary_desc', `Typical regional estimate for role "${targetRole}" based on cached local job indexes.`);
        await saveToDB('job_market_last_updated', timestamp + " (Cached)");
        await saveToDB('job_market_is_offline', true);

        setIsLoading(false);
      }, 700);
      return;
    }

    try {
      if (speed === 'slow') {
        await simulateNetworkRequest();
      }
      const res = await fetch('/api/match-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole, skills })
      });

      if (!res.ok) {
        throw new Error("Failed to search live job matches. Please try again.");
      }

      const data = await res.json();
      
      if (data.jobs) setJobs(data.jobs);
      if (data.marketTrend) setMarketTrend(data.marketTrend);
      if (data.marketTrendDesc) setMarketTrendDesc(data.marketTrendDesc);
      if (data.avgSalary) setAvgSalary(data.avgSalary);
      if (data.avgSalaryDesc) setAvgSalaryDesc(data.avgSalaryDesc);

      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastUpdated(timestamp);

      // Save to store
      await saveToDB('job_market_role', targetRole);
      await saveToDB('job_market_skills', skills);
      await saveToDB('job_market_jobs', data.jobs);
      await saveToDB('job_market_trend', data.marketTrend);
      await saveToDB('job_market_trend_desc', data.marketTrendDesc);
      await saveToDB('job_market_salary', data.avgSalary);
      await saveToDB('job_market_salary_desc', data.avgSalaryDesc);
      await saveToDB('job_market_last_updated', timestamp);
      await saveToDB('job_market_is_offline', false);

    } catch (err: any) {
      setError(err.message || "An error occurred while communicating with Gemma.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Job Market Insights</h1>
          <p className="text-slate-500 mt-1">Ground open job roles and live hiring demand using Gemma 4 AI.</p>
        </div>
        
        {lastUpdated && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span>Last updated today at {lastUpdated}</span>
          </div>
        )}
      </header>

      {/* Connection warning */}
      {!isOnline && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-bold">Currently in Offline Mode</p>
            <p className="text-xs text-amber-700/90 mt-1 leading-relaxed">
              You can still browse your previously matched jobs and custom query cache below. To execute a new live AI market research or find actual active listings via Google Search, connect your device to internet.
            </p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Configure AI Search Profile</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Target Role / Specialization</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">💼</span>
              <input 
                type="text" 
                value={targetRole} 
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Junior ML Engineer, Frontend React Developer" 
                className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm font-medium focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Your Skillsets & Frameworks</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🛠️</span>
              <input 
                type="text" 
                value={skills} 
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Python, React, TensorFlow, Next.js, Git" 
                className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm font-medium focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-sm transition-colors cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{speed === 'slow' ? 'Connecting slowly...' : 'Searching Live Web Listings...'}</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>{!isOnline || speed === 'offline' ? 'Search Heuristic Local Database' : 'Generate Live AI Matches'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Hiring Demand Trend</h3>
              </div>
              <span className="text-2xl font-black text-emerald-600 tracking-tight">{marketTrend}</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{marketTrendDesc}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Estimated Salary Distribution</h3>
              </div>
              <span className="text-2xl font-black text-slate-800 tracking-tight">{avgSalary}</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{avgSalaryDesc}</p>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-slate-900">AI Verified Job Matches</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{jobs.length} Results</span>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
            No active job matches found. Please configure your profile query above and search.
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <div 
                key={i}
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 mb-2 sm:mb-0 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-bold text-base text-slate-900">{job.title}</h3>
                    <span className={cn(
                      "px-2.5 py-0.5 text-[10px] font-extrabold rounded-full tracking-wider uppercase shrink-0",
                      job.match >= 85 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                        : "bg-indigo-50 text-indigo-600 border border-indigo-200"
                    )}>
                      {job.match}% Match
                    </span>
                  </div>
                  
                  {job.description && (
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{job.description}</p>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-slate-500 font-semibold pt-1">
                    <div className="flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.salary}</span>
                    </div>
                  </div>
                </div>
                
                {job.link && (
                  <a 
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white rounded-xl font-bold text-xs transition-colors border border-slate-200 hover:border-indigo-600 shrink-0 shadow-2xs group-hover:shadow-xs"
                  >
                    <span>Apply / View Role</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Code2, 
  Layout, 
  Database, 
  Github, 
  RefreshCw, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  Star, 
  GitFork, 
  ArrowLeft, 
  Loader2, 
  LogOut, 
  Check,
  Copy,
  X,
  Folder,
  FileCode
} from 'lucide-react';
import { loadFromDB, saveToDB } from '../lib/store';
import { cn } from '../lib/utils';

export default function Portfolio() {
  const [username, setUsername] = useState('');
  const [connectedUser, setConnectedUser] = useState<any>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Scaffold State
  const [scaffoldResult, setScaffoldResult] = useState<any>(null);
  const [isLoadingScaffold, setIsLoadingScaffold] = useState(false);
  const [scaffoldError, setScaffoldError] = useState<string | null>(null);
  const [activeScaffoldProject, setActiveScaffoldProject] = useState<any>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [copiedStepIndex, setCopiedStepIndex] = useState<number | null>(null);
  const [copiedTree, setCopiedTree] = useState(false);

  const projects = [
    {
      level: 'Advanced',
      title: 'Real-time Collaborative Whiteboard',
      desc: 'Build a Figma-like whiteboard using Canvas API, WebSockets, and CRDTs for conflict-free state merging.',
      tech: ['React', 'Zustand', 'WebSockets', 'Canvas API'],
      icon: Layout,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      level: 'Intermediate',
      title: 'AI Content Summarizer',
      desc: 'A Chrome extension that summarizes long articles using Gemini API with local caching for offline viewing.',
      tech: ['TypeScript', 'Gemini API', 'IndexedDB', 'Chrome APIs'],
      icon: Sparkles,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100'
    },
    {
      level: 'Beginner',
      title: 'Personal Finance Tracker',
      desc: 'A beautiful dashboard to track expenses and income, visualized with interactive charts.',
      tech: ['React', 'Tailwind', 'Recharts', 'LocalStorage'],
      icon: Database,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100'
    }
  ];

  useEffect(() => {
    const init = async () => {
      const savedUser = await loadFromDB('github_connected_user', null);
      const savedRepos = await loadFromDB('github_repos', []);
      const savedAnalysis = await loadFromDB('github_analysis_result', null);
      const savedSelected = await loadFromDB('github_selected_repo', null);
      
      if (savedUser) {
        setConnectedUser(savedUser);
        setRepos(savedRepos);
      }
      if (savedAnalysis) {
        setAnalysisResult(savedAnalysis);
      }
      if (savedSelected) {
        setSelectedRepo(savedSelected);
      }
    };
    init();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setIsLoadingUser(true);
    setError(null);
    try {
      const userRes = await fetch(`https://api.github.com/users/${username.trim()}`);
      if (!userRes.ok) {
        if (userRes.status === 404) {
          throw new Error("GitHub user not found. Please verify the spelling.");
        } else {
          throw new Error("Failed to fetch user. GitHub API rate limit may have been reached.");
        }
      }
      const userData = await userRes.json();

      const reposRes = await fetch(`https://api.github.com/users/${username.trim()}/repos?sort=updated&per_page=12`);
      let reposData = [];
      if (reposRes.ok) {
        reposData = await reposRes.json();
      }

      setConnectedUser(userData);
      setRepos(reposData);
      setIsFormOpen(false);
      
      await saveToDB('github_connected_user', userData);
      await saveToDB('github_repos', reposData);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleDisconnect = async () => {
    setConnectedUser(null);
    setRepos([]);
    setUsername('');
    setAnalysisResult(null);
    setSelectedRepo(null);
    setIsFormOpen(false);
    
    await saveToDB('github_connected_user', null);
    await saveToDB('github_repos', []);
    await saveToDB('github_analysis_result', null);
    await saveToDB('github_selected_repo', null);
  };

  const handleGenerateScaffold = async (project: any) => {
    setActiveScaffoldProject(project);
    setIsLoadingScaffold(true);
    setScaffoldError(null);
    setScaffoldResult(null);
    setActiveStepIndex(0);
    
    try {
      const res = await fetch('/api/generate-scaffold', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: project.title,
          desc: project.desc,
          tech: project.tech
        })
      });

      if (!res.ok) {
        throw new Error("Failed to generate scaffold files.");
      }

      const data = await res.json();
      setScaffoldResult(data);
    } catch (err: any) {
      console.error(err);
      setScaffoldError(err.message || "An error occurred while communicating with Gemma.");
    } finally {
      setIsLoadingScaffold(false);
    }
  };

  const copyToClipboard = (text: string, index: number | null) => {
    navigator.clipboard.writeText(text);
    if (index === null) {
      setCopiedTree(true);
      setTimeout(() => setCopiedTree(false), 2000);
    } else {
      setCopiedStepIndex(index);
      setTimeout(() => setCopiedStepIndex(null), 2000);
    }
  };

  const handleAnalyzeRepo = async (repo: any) => {
    setSelectedRepo(repo);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    await saveToDB('github_selected_repo', repo);
    
    try {
      let readmeText = '';
      const branchNames = ['main', 'master', 'develop'];
      for (const branch of branchNames) {
        try {
          const readmeRes = await fetch(`https://raw.githubusercontent.com/${connectedUser.login}/${repo.name}/${branch}/README.md`);
          if (readmeRes.ok) {
            readmeText = await readmeRes.text();
            break;
          }
        } catch (e) {
          // ignore and try next
        }
      }

      const res = await fetch('/api/analyze-repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          repoName: repo.name,
          username: connectedUser.login,
          description: repo.description,
          languages: [repo.language].filter(Boolean),
          readmeContent: readmeText
        })
      });

      if (!res.ok) {
        throw new Error("Server error while analyzing the repository.");
      }

      const data = await res.json();
      setAnalysisResult(data);
      await saveToDB('github_analysis_result', data);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Could not analyze this repository. Please make sure you are online and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Portfolio Ideas</h1>
        <p className="text-slate-500 mt-2">AI-curated project ideas to make your resume stand out.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((proj, i) => {
          const Icon = proj.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${proj.bg} ${proj.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">
                  {proj.level}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{proj.title}</h3>
              <p className="text-sm text-slate-600 mb-6 flex-1 leading-relaxed">{proj.desc}</p>
              
              <div className="space-y-4 mt-auto">
                <div className="flex flex-wrap gap-2">
                  {proj.tech.map((t, idx) => (
                    <span key={idx} className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                      {t}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => handleGenerateScaffold(proj)}
                  disabled={isLoadingScaffold}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  {isLoadingScaffold && activeScaffoldProject?.title === proj.title ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Code2 className="w-4 h-4" />
                      <span>Generate Scaffold</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* GitHub Analyzer Space */}
      {!connectedUser ? (
        <div className="bg-indigo-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          
          {!isFormOpen ? (
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="max-w-lg text-center sm:text-left">
                <h2 className="text-2xl font-bold mb-2">GitHub Portfolio Analyzer</h2>
                <p className="text-indigo-100">Connect your public GitHub to get live AI-driven suggestions on how to improve your readmes and code structure for recruiters.</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="flex items-center space-x-2 bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors whitespace-nowrap shadow-sm"
              >
                <Github className="w-5 h-5" />
                <span>Connect GitHub</span>
              </button>
            </div>
          ) : (
            <div className="relative z-10 max-w-lg mx-auto text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-white/10 rounded-full">
                  <Github className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold">Import Public GitHub Profile</h2>
              <p className="text-sm text-indigo-100">No login or password required. We fetch your public profile and repositories directly from the live GitHub REST API.</p>
              
              <form onSubmit={handleConnect} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                <input
                  type="text"
                  placeholder="Enter GitHub Username (e.g. torvalds)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-slate-800 placeholder-slate-400 bg-white border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-300 font-medium text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoadingUser}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  {isLoadingUser ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Fetch Profile</span>
                  )}
                </button>
              </form>

              {error && (
                <div className="flex items-center gap-2 text-xs bg-red-500/20 text-red-100 p-2.5 rounded-lg justify-center max-w-md mx-auto">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={() => setIsFormOpen(false)}
                className="text-xs text-indigo-200 hover:text-white underline pt-2"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Profile Info */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img 
                src={connectedUser.avatar_url} 
                alt={connectedUser.name || connectedUser.login} 
                className="w-14 h-14 rounded-full border-2 border-white/20"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{connectedUser.name || connectedUser.login}</h2>
                  <a 
                    href={connectedUser.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-xs text-slate-400">@{connectedUser.login} • {connectedUser.public_repos} public repos</p>
                {connectedUser.bio && (
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">{connectedUser.bio}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-white/10 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Repos list */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Select a Repository</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Feed</span>
              </div>
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {repos.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">No public repositories found.</div>
                ) : (
                  repos.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => handleAnalyzeRepo(repo)}
                      disabled={isAnalyzing}
                      className={cn(
                        "w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 focus:outline-none",
                        selectedRepo?.id === repo.id
                          ? "border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-slate-800 text-xs truncate max-w-[160px]">{repo.name}</span>
                        {repo.language && (
                          <span className="text-[9px] font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                            {repo.language}
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 leading-normal">{repo.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3" /> {repo.stargazers_count}</span>
                        <span className="flex items-center gap-0.5"><GitFork className="w-3 h-3" /> {repo.forks_count}</span>
                        <span className="text-[9px] ml-auto">Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Analysis Workspace */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col min-h-[380px]">
              {isAnalyzing ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Gemma 4 is Reviewing Codebase</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Evaluating README hierarchy, documentation completeness, technical profile, and recruiter-readiness...</p>
                  </div>
                </div>
              ) : analysisResult && selectedRepo ? (
                <div className="space-y-5 flex-1">
                  {/* Analysis Header Score */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{selectedRepo.name}</h4>
                      <p className="text-xs text-slate-500">Recruiter readiness scorecard</p>
                    </div>
                    <div className="flex items-center gap-2 bg-indigo-50 px-3.5 py-1.5 rounded-xl border border-indigo-100">
                      <span className="text-xs font-semibold text-indigo-800">Appeal Score:</span>
                      <span className={cn(
                        "text-lg font-bold",
                        analysisResult.score >= 80 ? "text-emerald-600" : analysisResult.score >= 60 ? "text-amber-500" : "text-red-500"
                      )}>
                        {analysisResult.score}/100
                      </span>
                    </div>
                  </div>

                  {/* Summary / Assessment */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                    <p className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Gemma General Assessment:
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">{analysisResult.generalAssessment}</p>
                  </div>

                  {/* README improvements */}
                  {analysisResult.readmeSuggestions?.length > 0 && (
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-500" /> README Improvements:
                      </h5>
                      <ul className="space-y-1.5">
                        {analysisResult.readmeSuggestions.map((sug: string, idx: number) => (
                          <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                            <span className="text-blue-500 font-semibold mt-0.5">•</span>
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Code Quality improvements */}
                  {analysisResult.codeSuggestions?.length > 0 && (
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-indigo-500" /> Architectural & Stack Advice:
                      </h5>
                      <ul className="space-y-1.5">
                        {analysisResult.codeSuggestions.map((sug: string, idx: number) => (
                          <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                            <span className="text-indigo-500 font-semibold mt-0.5">•</span>
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Missing Elements Checklist */}
                  {analysisResult.missingFiles?.length > 0 && (
                    <div className="border-t border-slate-100 pt-4">
                      <h5 className="text-xs font-bold text-slate-800 mb-2.5">Recruiter Checklist Additions:</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {analysisResult.missingFiles.map((file: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-100">
                            <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-500 shrink-0">!</div>
                            <span className="text-[11px] font-medium text-slate-600 truncate" title={file}>{file}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedRepo ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                    <Github className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Selected: {selectedRepo.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Click "Run Review" to fetch readme files and analyze this repository structure with Gemma 4.</p>
                  </div>
                  <button
                    onClick={() => handleAnalyzeRepo(selectedRepo)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Gemma Review</span>
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <Github className="w-10 h-10 stroke-[1.2] mb-3" />
                  <p className="text-xs">Select any repository on the left to start your AI review</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scaffold Loading Overlay */}
      {isLoadingScaffold && !scaffoldResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-8 max-w-sm w-full text-center space-y-4 shadow-xl">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Architecting Codebase...</h3>
              <p className="text-xs text-slate-500 mt-1">Gemma is writing full starter file boilerplate configurations and preparing recruiter checklist points.</p>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 w-2/3 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Scaffold Error Overlay */}
      {scaffoldError && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">!</div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Failed to Generate</h3>
              <p className="text-xs text-slate-500 mt-1">{scaffoldError}</p>
            </div>
            <button 
              onClick={() => setScaffoldError(null)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Scaffold Display Modal */}
      {scaffoldResult && activeScaffoldProject && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                    {activeScaffoldProject.level} Project Scaffold
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900">{scaffoldResult.title || activeScaffoldProject.title}</h2>
              </div>
              <button 
                onClick={() => {
                  setScaffoldResult(null);
                  setActiveScaffoldProject(null);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left Column: Directory structure & Recruiter checklist */}
              <div className="lg:col-span-2 space-y-6">
                {/* Directory tree */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Folder className="w-4 h-4 text-slate-500" />
                      <span>Codebase Blueprint</span>
                    </h3>
                    <button 
                      onClick={() => copyToClipboard(scaffoldResult.directoryTree, null)}
                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      {copiedTree ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Structure</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-slate-950 text-slate-300 p-3.5 rounded-xl font-mono text-[10px] overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
                    {scaffoldResult.directoryTree}
                  </pre>
                </div>

                {/* Recruiter appeal checklist */}
                <div className="bg-indigo-950 text-white p-5 rounded-2xl space-y-3.5 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-300" />
                    <span>How to Impress Recruiters</span>
                  </h3>
                  <ul className="space-y-2.5">
                    {scaffoldResult.recruiterTips?.map((tip: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-indigo-100 leading-normal font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: Step list, Guide, Boilerplate */}
              <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col min-h-[400px]">
                {/* Step navigation tabs */}
                <div className="flex border-b border-slate-200 overflow-x-auto shrink-0 bg-slate-50/50">
                  {scaffoldResult.steps?.map((step: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveStepIndex(idx)}
                      className={cn(
                        "px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap focus:outline-none flex-1 text-center cursor-pointer",
                        activeStepIndex === idx
                          ? "border-indigo-600 text-indigo-600 bg-white"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      {step.phase || `Step ${idx + 1}`}
                    </button>
                  ))}
                </div>

                {/* Step content */}
                {scaffoldResult.steps?.[activeStepIndex] && (
                  <div className="p-5 flex-1 flex flex-col space-y-4">
                    <div className="space-y-1">
                      <h4 className="font-black text-slate-900 text-sm">
                        {scaffoldResult.steps[activeStepIndex].title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {scaffoldResult.steps[activeStepIndex].guide}
                      </p>
                    </div>

                    {/* Starter Code Block */}
                    <div className="flex-1 flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-slate-950 shadow-inner">
                      {/* Code Block Header */}
                      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between shrink-0">
                        <div className="flex items-center space-x-1.5">
                          <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-[11px] font-bold text-slate-400 font-mono">
                            {scaffoldResult.steps[activeStepIndex].filename || 'App.tsx'}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(scaffoldResult.steps[activeStepIndex].code, activeStepIndex)}
                          className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-md transition-all cursor-pointer"
                        >
                          {copiedStepIndex === activeStepIndex ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Boilerplate</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Code Body */}
                      <div className="p-4 overflow-auto max-h-[300px] font-mono text-[10px] text-slate-300 leading-relaxed whitespace-pre">
                        <code>{scaffoldResult.steps[activeStepIndex].code}</code>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <footer className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Generated live by Gemma 4. Feel free to copy into your local project.</span>
              </span>
              <button
                onClick={() => {
                  setScaffoldResult(null);
                  setActiveScaffoldProject(null);
                }}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Done
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

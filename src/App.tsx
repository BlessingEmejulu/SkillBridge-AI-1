import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Users, 
  Map, 
  Briefcase, 
  FolderGit2, 
  Settings,
  Wifi,
  WifiOff,
  Menu,
  X,
  Rocket,
  Loader2
} from 'lucide-react';
import { cn } from './lib/utils';
import { useOnlineStatus, toggleManualOffline } from './lib/useOnlineStatus';

const Dashboard = lazy(() => import('./components/Dashboard'));
const AICoach = lazy(() => import('./components/AICoach'));
const ResumePrep = lazy(() => import('./components/ResumePrep'));
const InterviewSim = lazy(() => import('./components/InterviewSim'));
const LearningRoadmap = lazy(() => import('./components/LearningRoadmap'));
const JobMarket = lazy(() => import('./components/JobMarket'));
const Portfolio = lazy(() => import('./components/Portfolio'));

export type TabType = 'dashboard' | 'coach' | 'resume' | 'interview' | 'roadmap' | 'jobs' | 'portfolio';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isOnline = useOnlineStatus();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'coach', label: 'AI Career Coach', icon: MessageSquare },
    { id: 'resume', label: 'Resume Review', icon: FileText },
    { id: 'interview', label: 'Interview Prep', icon: Users },
    { id: 'roadmap', label: 'Learning Roadmap', icon: Map },
    { id: 'jobs', label: 'Job Market', icon: Briefcase },
    { id: 'portfolio', label: 'Portfolio Ideas', icon: FolderGit2 },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={(t) => setActiveTab(t)} />;
      case 'coach': return <AICoach />;
      case 'resume': return <ResumePrep />;
      case 'interview': return <InterviewSim />;
      case 'roadmap': return <LearningRoadmap />;
      case 'jobs': return <JobMarket />;
      case 'portfolio': return <Portfolio />;
      default: return <Dashboard onNavigate={(t) => setActiveTab(t)} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-transform duration-300 lg:static lg:translate-x-0 flex flex-col",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">SB</div>
            <span className="text-xl font-bold tracking-tight text-slate-800">SkillBridge <span className="text-indigo-600">AI</span></span>
          </div>
          <button className="lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-left font-medium",
                  activeTab === item.id 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className={cn("w-5 h-5", activeTab === item.id ? "text-indigo-600" : "text-slate-400")} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-indigo-600 rounded-xl p-4 text-white">
            <p className="text-xs opacity-80 mb-1">Current Streak</p>
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold">12 Days</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">🔥 Hot</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        <header className="hidden lg:flex h-16 border-b border-slate-200 bg-white px-8 items-center justify-between">
          <div className="relative w-96">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg leading-none">🔍</span>
            <input type="text" placeholder="Search skills, jobs, or mentor topics..." className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={toggleManualOffline}
              className={cn(
                "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors cursor-pointer",
                isOnline ? "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" : "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full animate-pulse", isOnline ? "bg-emerald-500" : "bg-amber-500")}></span>
              {isOnline ? 'Online (Click to mock)' : 'Offline (Click to mock)'}
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">Sarah Chen</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Junior ML Engineer</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-indigo-100"></div>
            </div>
          </div>
        </header>

        <header className="lg:hidden p-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="ml-3 font-bold text-slate-900">SkillBridge AI</span>
          </div>
          <button 
            onClick={toggleManualOffline}
            className={cn(
              "flex items-center gap-2 text-[10px] font-semibold px-2 py-1 rounded-full border",
              isOnline ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-amber-600 bg-amber-50 border-amber-200"
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", isOnline ? "bg-emerald-500" : "bg-amber-500")}></span>
            {isOnline ? 'Synced' : 'Offline'}
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="max-w-6xl mx-auto h-full">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            }>
              {renderContent()}
            </Suspense>
          </div>
        </div>

        <footer className="h-8 bg-white border-t border-slate-200 px-8 flex items-center justify-between text-[10px] text-slate-400 shrink-0 hidden lg:flex">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Gemma AI Engine Online</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> Storage: 14.2MB of 500MB</span>
          </div>
          <div className="italic">Press Cmd+K to open AI Mentor Quick Command</div>
        </footer>
      </main>
    </div>
  );
}

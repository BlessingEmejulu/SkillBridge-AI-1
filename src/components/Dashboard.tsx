import React from 'react';
import { Target, TrendingUp, Trophy, ArrowRight, BrainCircuit } from 'lucide-react';
import type { TabType } from '../App';
import { cn } from '../lib/utils';

interface DashboardProps {
  onNavigate: (tab: TabType) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const score = 84; // Mock readiness score

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between overflow-hidden relative"
        >
          <div className="z-10">
            <p className="text-sm text-slate-500 font-medium mb-1">Readiness Score</p>
            <h3 className="text-3xl font-bold text-slate-800">{score}<span className="text-lg text-slate-400 font-normal">/100</span></h3>
            <p className="text-xs text-emerald-600 mt-2 font-semibold">↑ 4% this week</p>
          </div>
          <div className="w-16 h-16 rounded-full border-[6px] border-indigo-100 border-t-indigo-600 flex items-center justify-center font-bold text-indigo-600 text-xs">HIGH</div>
        </div>

        <div 
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center"
        >
          <p className="text-sm text-slate-500 font-medium mb-1">Resume Strength</p>
          <div className="flex gap-2 items-center mb-2">
            <span className="text-2xl font-bold">A-</span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">ATS Optimized</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '92%' }}></div>
          </div>
        </div>

        <div 
          className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-lg shadow-indigo-200 text-white"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs opacity-80 mb-1 uppercase tracking-widest">AI Career Mentor</p>
              <h3 className="text-lg font-bold">Gemma 4.26b</h3>
            </div>
            <span className="text-xl">✨</span>
          </div>
          <p className="text-sm mt-3 leading-relaxed opacity-90">"Based on your recent progress, you're ready to tackle the next milestone in your roadmap."</p>
        </div>
      </div>

      {/* Mid Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Career Roadmap Preview */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900">Career Roadmap: Frontend Engineer</h3>
            <button 
              onClick={() => onNavigate('roadmap')}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              View Full Path
            </button>
          </div>
          <div className="space-y-4 overflow-hidden">
            <div className="flex items-start gap-4 relative pb-4">
              <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-slate-100"></div>
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] ring-4 ring-emerald-50 z-10">✓</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">Core JavaScript & DOM</p>
                <p className="text-xs text-slate-500">Completed 14 days ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4 relative pb-4">
              <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-slate-100"></div>
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] ring-4 ring-indigo-50 z-10">2</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-indigo-700">Advanced React Patterns</p>
                <p className="text-xs text-slate-500">Current Goal • 3/5 Milestones</p>
                <div className="w-full bg-slate-100 h-1 rounded-full mt-2">
                  <div className="bg-indigo-600 h-full rounded-full w-3/5"></div>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4 relative">
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-[10px] z-10">3</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-400">System Design & Architecture</p>
                <p className="text-xs text-slate-400">Locked • Complete previous step</p>
              </div>
            </div>
          </div>
        </div>

        {/* Skill Gap Analysis */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">Skill Gap Analysis</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-900">React / Next.js</span>
                <span className="text-emerald-600 italic">Match!</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 w-[90%] h-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                <span className="text-slate-900">State Management (Redux)</span>
                <span className="text-amber-500 italic">Gap Found</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="bg-amber-400 w-[45%] h-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                <span className="text-slate-900">CSS / Tailwind</span>
                <span className="text-indigo-600 italic">Strong</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="bg-indigo-500 w-[75%] h-full"></div>
              </div>
            </div>
            <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <p className="text-[10px] text-slate-500 leading-tight uppercase font-bold tracking-wider mb-2">Recommended Quiz</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Redux Fundamentals</span>
                <button className="px-3 py-1 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-lg shadow-sm hover:bg-slate-50">Start</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Quick Actions */}
      <div className="hidden sm:flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 border-r border-slate-200 whitespace-nowrap">Quick Actions</span>
        <button onClick={() => onNavigate('interview')} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-colors whitespace-nowrap">
          <span className="text-lg">📝</span> AI Interview Mock
        </button>
        <button onClick={() => onNavigate('portfolio')} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-colors whitespace-nowrap">
          <span className="text-lg">📁</span> Analyze GitHub Portfolio
        </button>
        <button onClick={() => onNavigate('resume')} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-colors whitespace-nowrap">
          <span className="text-lg">📧</span> Review Resume
        </button>
        <div className="flex-1"></div>
        <div className="text-[10px] bg-slate-100 px-3 py-1 rounded text-slate-500 font-mono whitespace-nowrap">
          PWA v2.4.0 • LocalDB
        </div>
      </div>
      
      {/* Mobile Quick Actions fallback */}
      <div className="sm:hidden grid grid-cols-2 gap-3">
        <button onClick={() => onNavigate('interview')} className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl">
          <span className="text-2xl mb-2">📝</span>
          <span className="text-xs font-bold text-slate-700">Mock Interview</span>
        </button>
        <button onClick={() => onNavigate('portfolio')} className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl">
          <span className="text-2xl mb-2">📁</span>
          <span className="text-xs font-bold text-slate-700">Portfolio</span>
        </button>
        <button onClick={() => onNavigate('resume')} className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl col-span-2">
          <span className="text-xl mb-1">📧</span>
          <span className="text-xs font-bold text-slate-700">Review Resume</span>
        </button>
      </div>
    </div>
  );
}

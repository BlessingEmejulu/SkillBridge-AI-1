import React from 'react';
import { Sparkles, Code2, Layout, Database, Github } from 'lucide-react';

export default function Portfolio() {
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Portfolio Ideas</h1>
        <p className="text-slate-500 mt-2">AI-curated project ideas to make your resume stand out.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <button className="w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors">
                  <Code2 className="w-4 h-4" />
                  <span>Generate Scaffold</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 bg-indigo-600 rounded-2xl p-8 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 max-w-lg mb-6 sm:mb-0">
          <h2 className="text-2xl font-bold mb-2">GitHub Portfolio Analyzer</h2>
          <p className="text-indigo-100">Connect your GitHub to get AI-driven suggestions on how to improve your readmes and code structure for recruiters.</p>
        </div>
        <button className="relative z-10 flex items-center space-x-2 bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors whitespace-nowrap">
          <Github className="w-5 h-5" />
          <span>Connect GitHub</span>
        </button>
      </div>
    </div>
  );
}

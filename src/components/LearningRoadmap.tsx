import React from 'react';
import { BookOpen, Calendar, ChevronRight, PlayCircle } from 'lucide-react';

export default function LearningRoadmap() {
  const roadmap = [
    { title: 'Advanced React Patterns', status: 'in-progress', est: '2 weeks' },
    { title: 'State Management (Redux/Zustand)', status: 'pending', est: '1 week' },
    { title: 'Performance Optimization', status: 'pending', est: '2 weeks' },
    { title: 'System Design for Frontend', status: 'pending', est: '3 weeks' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Learning Roadmap</h1>
        <p className="text-slate-500 mt-2">Your personalized path to becoming a Senior Frontend Engineer.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Current Track</h2>
            <p className="text-sm text-slate-500">Target Role: Senior Frontend Engineer</p>
          </div>
          <button className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors">
            Generate New Path
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {roadmap.map((step, idx) => (
              <div 
                key={idx}
                
                
                
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 group-[.is-active]:bg-indigo-600 group-[.is-active]:text-white">
                  <span className="text-xs font-bold">{idx + 1}</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm group-hover:border-indigo-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{step.est}</span>
                    {step.status === 'in-progress' && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">IN PROGRESS</span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                  <div className="flex space-x-2 mt-4">
                    <button className="flex-1 flex justify-center items-center space-x-1 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">
                      <BookOpen className="w-4 h-4" />
                      <span>Resources</span>
                    </button>
                    {step.status === 'in-progress' && (
                      <button className="flex-1 flex justify-center items-center space-x-1 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700">
                        <PlayCircle className="w-4 h-4" />
                        <span>Continue</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

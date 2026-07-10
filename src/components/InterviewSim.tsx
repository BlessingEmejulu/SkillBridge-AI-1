import React, { useState } from 'react';
import { Play, Mic, UserSquare2, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useOnlineStatus } from '../lib/useOnlineStatus';

export default function InterviewSim() {
  const [role, setRole] = useState('Frontend Developer');
  const [type, setType] = useState('Technical');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const isOnline = useOnlineStatus();

  const startSimulation = async () => {
    if (!isOnline) {
      alert("You are currently offline. The AI Interview Simulator requires an internet connection.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, type })
      });
      const data = await response.json();
      setQuestions(data.questions || []);
      setActiveQuestion(0);
    } catch (err) {
      console.error(err);
      alert('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 h-full flex flex-col">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Interview Simulator</h1>
        <p className="text-slate-500 mt-2">Practice real-world interview scenarios with real-time feedback.</p>
      </header>

      {!questions.length ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Role</label>
              <input 
                type="text" 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Interview Type</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              >
                <option value="Technical">Technical</option>
                <option value="Behavioral">Behavioral (STAR)</option>
                <option value="HR">HR / Culture Fit</option>
              </select>
            </div>
          </div>
          <button 
            onClick={startSimulation}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
            <span>{loading ? 'Preparing Session...' : 'Start Simulation'}</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <span className="font-medium text-slate-600">Question {activeQuestion + 1} of {questions.length}</span>
            <div className="flex space-x-1">
              {questions.map((_, idx) => (
                <div key={idx} className={cn("h-2 w-8 rounded-full", activeQuestion === idx ? "bg-indigo-600" : activeQuestion > idx ? "bg-emerald-500" : "bg-slate-200")} />
              ))}
            </div>
          </div>

          <div 
            key={activeQuestion}
            
            
            className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 w-full max-w-2xl">
              <UserSquare2 className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-slate-900 mb-8 leading-snug">
                "{questions[activeQuestion].question}"
              </h2>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-left w-full">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Key Points to Cover:</h4>
                <ul className="space-y-2">
                  {questions[activeQuestion].expectedKeyPoints.map((pt: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2 text-slate-700 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 flex justify-center space-x-4">
                <button className="flex items-center space-x-2 px-6 py-3 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl font-medium transition-colors">
                  <Mic className="w-5 h-5" />
                  <span>Record Answer</span>
                </button>
                <button 
                  onClick={() => {
                    if (activeQuestion < questions.length - 1) setActiveQuestion(prev => prev + 1);
                    else setQuestions([]); // Reset for now
                  }}
                  className="flex items-center space-x-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
                >
                  <span>{activeQuestion < questions.length - 1 ? 'Next Question' : 'Finish Session'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

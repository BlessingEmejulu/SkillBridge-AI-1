import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useOnlineStatus } from '../lib/useOnlineStatus';

export default function ResumePrep() {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const isOnline = useOnlineStatus();

  const handleAnalyze = async () => {
    if (!resumeText || !targetRole) return;
    if (!isOnline) {
      alert("You are currently offline. Resume analysis requires an active internet connection to communicate with Gemma.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/review-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, targetRole })
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Analysis failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Resume Review</h1>
        <p className="text-slate-500 mt-2">Get instant ATS scoring and optimization tips powered by AI.</p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Role</label>
            <input 
              type="text" 
              placeholder="e.g. Frontend Developer, Data Scientist"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Resume Content (Paste text here)</label>
            <textarea 
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here for analysis..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none font-mono text-sm"
            />
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={loading || !resumeText || !targetRole}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            <span>{loading ? 'Analyzing...' : 'Analyze Resume'}</span>
          </button>
        </div>
      </div>

      {result && (
        <div 
          
          
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white",
              result.score >= 80 ? "bg-emerald-500" : result.score >= 60 ? "bg-amber-500" : "bg-rose-500"
            )}>
              {result.score}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">ATS Match Score</h2>
              <p className="text-slate-500 text-sm">Based on industry standards for {targetRole}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span>General Feedback</span>
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">{result.feedback}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-900 flex items-center space-x-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span>Skill Gaps</span>
                </h3>
                <ul className="space-y-2">
                  {result.skillGaps?.map((gap: string, i: number) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start space-x-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 flex items-center space-x-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>Optimizations</span>
                </h3>
                <ul className="space-y-2">
                  {result.optimizations?.map((opt: string, i: number) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start space-x-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{opt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

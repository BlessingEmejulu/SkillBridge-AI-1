import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, WifiOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { saveToDB, loadFromDB } from '../lib/store';
import { useOnlineStatus, simulateNetworkRequest } from '../lib/useOnlineStatus';

export default function ResumePrep() {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [offlineBadge, setOfflineBadge] = useState(false);
  const { isOnline, speed } = useOnlineStatus();

  // Load state on mount
  useEffect(() => {
    const loadState = async () => {
      const savedText = await loadFromDB('resume_text', '');
      const savedRole = await loadFromDB('resume_target_role', '');
      const savedResult = await loadFromDB('resume_analysis_result', null);
      
      setResumeText(savedText);
      setTargetRole(savedRole);
      if (savedResult) {
        setResult(savedResult);
        setOfflineBadge(savedResult.isOfflineReview || false);
      }
    };
    loadState();
  }, []);

  // Save text changes
  useEffect(() => {
    saveToDB('resume_text', resumeText);
  }, [resumeText]);

  // Save role changes
  useEffect(() => {
    saveToDB('resume_target_role', targetRole);
  }, [targetRole]);

  // Offline ATS Parser Engine
  const runOfflineLocalAnalysis = (text: string, role: string) => {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const lowerText = text.toLowerCase();
    const lowerRole = role.toLowerCase();

    const sections = {
      contact: /contact|email|phone|linkedin|github/i.test(lowerText),
      experience: /experience|work history|employment|history/i.test(lowerText),
      skills: /skills|technologies|expertise|proficiencies/i.test(lowerText),
      education: /education|degree|university|college/i.test(lowerText),
      projects: /projects|portfolio|personal projects/i.test(lowerText)
    };

    // Calculate simulated score
    let baseScore = 60;
    const sectionCount = Object.values(sections).filter(Boolean).length;
    baseScore += sectionCount * 5; // up to +25 score

    const hasRoleMatch = lowerText.includes(lowerRole);
    if (hasRoleMatch) baseScore += 10;

    // Word count optimization score adjust
    if (wordCount >= 400 && wordCount <= 1000) {
      baseScore += 5;
    } else {
      baseScore -= 5;
    }

    baseScore = Math.min(Math.max(baseScore, 30), 95); // bounds 30-95 for offline

    // Identify gaps
    const skillGaps: string[] = [];
    if (!sections.skills) skillGaps.push("Missing a dedicated 'Skills' or 'Technologies' section block.");
    if (!sections.projects) skillGaps.push("No clear personal projects section found. Essential for recruiter visibility.");
    
    // Add technical skill suggestions based on role
    if (lowerRole.includes('front') || lowerRole.includes('react') || lowerRole.includes('web')) {
      if (!lowerText.includes('react')) skillGaps.push("Missing React keyword in your skills profile.");
      if (!lowerText.includes('typescript')) skillGaps.push("Consider listing modern TypeScript proficiency.");
      if (!lowerText.includes('tailwind') && !lowerText.includes('css')) skillGaps.push("Showcase modern styling setups like Tailwind CSS.");
    } else if (lowerRole.includes('back') || lowerRole.includes('node') || lowerRole.includes('api')) {
      if (!lowerText.includes('node')) skillGaps.push("Missing Node.js or backend engine frameworks.");
      if (!lowerText.includes('sql') && !lowerText.includes('postgres')) skillGaps.push("Relational SQL database knowledge not fully emphasized.");
      if (!lowerText.includes('docker') && !lowerText.includes('cloud')) skillGaps.push("Add devops/containerization experience (Docker, AWS).");
    } else {
      if (!hasRoleMatch) skillGaps.push(`Your resume lacks explicit references to the target role title: "${role}".`);
    }

    // Identify Optimizations
    const optimizations: string[] = [];
    if (wordCount < 300) {
      optimizations.push(`Your resume is very short (${wordCount} words). Expand on responsibilities and add quantifiable impact descriptions.`);
    } else if (wordCount > 1200) {
      optimizations.push(`Your resume is very long (${wordCount} words). Try to condense details to fit a cleaner 1-2 page aesthetic.`);
    } else {
      optimizations.push(`Excellent resume length (${wordCount} words). Perfect for quick ATS screen reads.`);
    }

    if (!sections.contact) {
      optimizations.push("Ensure your Contact details include a clickable professional Email, LinkedIn, and GitHub profile.");
    }
    
    // Check for metrics/numbers in the text (recruiter favorite)
    const matchesMetrics = (text.match(/\d+%/g) || []).length > 0 || (text.match(/\$\d+/g) || []).length > 0;
    if (!matchesMetrics) {
      optimizations.push("Recruiters love results: Add more quantitative business achievements (e.g. 'Improved efficiency by 24%', 'saved $5k annually').");
    } else {
      optimizations.push("Great! You have included metrics in your resume. Double-check that they are aligned with modern key performance indicator (KPI) goals.");
    }

    const localResult = {
      score: baseScore,
      feedback: `✨ [Offline Rule-Based Scan] This resume has been evaluated locally using offline client heuristic algorithms. It looks standard and legible. Below are key checklist goals that we can evaluate immediately. Connect back online for an in-depth Gemma neural ATS breakdown!`,
      skillGaps: skillGaps.length > 0 ? skillGaps : ["No glaring structural gaps found. Good section coverage."],
      optimizations: optimizations,
      isOfflineReview: true
    };

    return localResult;
  };

  const handleAnalyze = async () => {
    if (!resumeText || !targetRole) return;
    setLoading(true);
    setOfflineBadge(false);

    if (!isOnline || speed === 'offline') {
      // Offline fallback review
      setTimeout(async () => {
        const localResult = runOfflineLocalAnalysis(resumeText, targetRole);
        setResult(localResult);
        setOfflineBadge(true);
        await saveToDB('resume_analysis_result', localResult);
        setLoading(false);
      }, 800); // realistic fast offline parsing feel
      return;
    }
    
    try {
      if (speed === 'slow') {
        await simulateNetworkRequest();
      }
      const response = await fetch('/api/review-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, targetRole })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setResult(data);
      await saveToDB('resume_analysis_result', data);
    } catch (err) {
      console.error(err);
      // Fail gracefully and use offline analysis
      const localResult = runOfflineLocalAnalysis(resumeText, targetRole);
      setResult(localResult);
      setOfflineBadge(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Resume Review</h1>
          <p className="text-slate-500 mt-2">Get instant ATS scoring and optimization tips powered by AI.</p>
        </div>
        {!isOnline || speed === 'offline' ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700 font-semibold self-start md:self-auto">
            <WifiOff className="w-4 h-4 text-amber-500" />
            <span>Offline Scan Active (Rule-Based)</span>
          </div>
        ) : speed === 'slow' ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 font-semibold self-start md:self-auto animate-pulse">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
            <span>Slow Connection Scan</span>
          </div>
        ) : null}
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Target Role</label>
            <input 
              type="text" 
              placeholder="e.g. Frontend Developer, Data Scientist"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Resume Content (Paste text here)</label>
            <textarea 
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here for analysis..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none font-mono text-xs leading-relaxed"
            />
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={loading || !resumeText || !targetRole}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{speed === 'slow' ? 'Connecting slowly...' : 'Analyzing Resume...'}</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>{!isOnline || speed === 'offline' ? 'Run Local Rule-Based Scan' : 'Analyze Resume'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div 
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden"
        >
          {offlineBadge && (
            <div className="absolute top-0 right-0 bg-amber-500 text-white font-mono text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-inner">
              <span>Offline Scan</span>
            </div>
          )}

          <div className="flex items-center space-x-4 mb-6">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white",
              result.score >= 80 ? "bg-emerald-500" : result.score >= 60 ? "bg-amber-500" : "bg-rose-500"
            )}>
              {result.score}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">ATS Match Score</h2>
                {offlineBadge && (
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 border border-amber-200 font-bold rounded">Heuristic Estimate</span>
                )}
              </div>
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
                      <span className="text-amber-500 mt-0.5 font-bold">•</span>
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
                      <span className="text-emerald-500 mt-0.5 font-bold">•</span>
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

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { saveToDB, loadFromDB } from '../lib/store';
import { cn } from '../lib/utils';
import { useOnlineStatus, simulateNetworkRequest } from '../lib/useOnlineStatus';

interface Source {
  title: string;
  uri: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

export default function AICoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const { isOnline, speed, isSlow } = useOnlineStatus();

  useEffect(() => {
    loadFromDB('coach_history', [
      { role: 'assistant', content: 'Hi! I am your AI Career Coach powered by Gemma 4. How can I help you today?' }
    ]).then(setMessages);
    
    // Load offline queue length
    loadFromDB('offline_chat_queue', []).then((q: string[]) => setQueueCount(q.length));
  }, []);

  useEffect(() => {
    saveToDB('coach_history', messages);
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-sync offline queue when we are back online with standard speed
  useEffect(() => {
    if (isOnline && speed !== 'offline') {
      const syncQueue = async () => {
        const queue = await loadFromDB('offline_chat_queue', []);
        if (queue.length === 0) return;

        setLoading(true);
        const updatedMessages = [...messages];

        for (const queuedPrompt of queue) {
          try {
            if (speed === 'slow') {
              await simulateNetworkRequest();
            }
            const response = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: queuedPrompt })
            });
            const data = await response.json();
            if (!data.error) {
              updatedMessages.push({ 
                role: 'assistant', 
                content: `✨ [Synced Answer for "${queuedPrompt}"]\n\n` + data.text, 
                sources: data.sources 
              });
            }
          } catch (e) {
            console.error('Failed to sync queued message', e);
          }
        }

        setMessages(updatedMessages);
        await saveToDB('offline_chat_queue', []);
        setQueueCount(0);
        setLoading(false);
      };

      // Slight delay to ensure connection is steady
      const timer = setTimeout(() => {
        syncQueue();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, speed]);

  const getOfflineLocalAdvice = (prompt: string): string => {
    const query = prompt.toLowerCase();
    
    if (query.includes('resume') || query.includes('cv') || query.includes('profile')) {
      return `📝 [Offline AI Mentor: Resume Advisor]
Based on industry ATS standards and recruiter feedback:
1. Use the Google X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]".
2. Structure your skills in a clear technical matrix at the top (e.g. Languages, Frameworks, Dev Tools).
3. Ensure single-column layouts for high ATS readability.
4. Keep file outputs strictly in standard PDF formats.
*(Your query is saved in the local queue and will sync automatically when online!)*`;
    }
    
    if (query.includes('react') || query.includes('frontend') || query.includes('js') || query.includes('typescript') || query.includes('css')) {
      return `⚛️ [Offline AI Mentor: Frontend Masterclass]
Core areas to optimize for Senior React / Web interviews:
1. Render profiling: Master rendering phases, React.memo, useMemo, and paint cycle tracing.
2. State Management: Clearly explain when to use Context (simple/infrequent changes) vs Zustand/Redux (high frequency performance).
3. Fluid Layouts: Always build mobile-responsive designs using CSS grid and flex. Keep touch targets above 44px.
*(Your query is saved in the local queue and will sync automatically when online!)*`;
    }
    
    if (query.includes('python') || query.includes('ml') || query.includes('tensor') || query.includes('model') || query.includes('learning')) {
      return `🧠 [Offline AI Mentor: ML & AI core]
Crucial ML portfolio guidelines:
1. Feature Engineering: Document outliers, normalization, and missing data imputation strategies carefully.
2. Evaluation: Go beyond accuracy. Describe ROC-AUC, Precision, Recall, and Confusion Matrices.
3. Lightweight deployment: Host endpoints using FastAPI or convert your pipelines to ONNX for lightning-fast client execution.
*(Your query is saved in the local queue and will sync automatically when online!)*`;
    }
    
    if (query.includes('interview') || query.includes('question') || query.includes('behavior')) {
      return `💬 [Offline AI Mentor: Interview Technique]
Practical guidance for live interview loops:
1. Use the STAR methodology: Situation, Task, Action, Result. Keep the action-oriented details at 60% of your talking time.
2. Write tests: When whiteboarding, write out Edge-Cases and inputs before writing any implementation code.
3. Communication: Think out loud. Speak about tradeoffs and complexity constraints before writing lines.
*(Your query is saved in the local queue and will sync automatically when online!)*`;
    }
    
    return `🤖 [Offline AI Coach: Core Knowledge Base]
Your query has been recorded offline. Let's cover key portfolio guidelines:
1. **GitHub Presentation**: Ensure you have 2-3 repositories featuring structured tests, a detailed Readme, and a live web URL.
2. **Offline Resilience**: Storing system states locally in IndexedDB makes your application highly robust in trains/commutes.
3. **Structured Roadmaps**: Complete milestones systematically to maintain an active learning velocity.
*(Your message is saved in the queue and will be synced with Gemma for deeper answers as soon as your connection is restored!)*`;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);

    if (!isOnline || speed === 'offline') {
      // Simulate immediate local advice fallback
      const localAdvice = getOfflineLocalAdvice(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: localAdvice }]);
      
      // Save query in IndexedDB queue to sync later
      const currentQueue = await loadFromDB('offline_chat_queue', []);
      const updatedQueue = [...currentQueue, userMsg];
      await saveToDB('offline_chat_queue', updatedQueue);
      setQueueCount(updatedQueue.length);
      return;
    }

    setLoading(true);

    try {
      if (speed === 'slow') {
        await simulateNetworkRequest();
      }
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', content: data.text, sources: data.sources }]);
    } catch (err: any) {
      console.error(err);
      // Fallback to offline advice if the actual fetch fails
      const localAdvice = getOfflineLocalAdvice(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ [Connection Error] Let's fetch local cached knowledge:\n\n" + localAdvice }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] lg:h-full max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center space-x-3">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900">Career Coach</h2>
          <p className="text-xs text-slate-500">Powered by Gemma 4</p>
        </div>
      </div>

      {queueCount > 0 && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 text-xs text-amber-700 flex items-center justify-between font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>{queueCount} question{queueCount > 1 ? 's' : ''} stored in offline local queue. Will auto-sync when online.</span>
          </div>
          {isOnline && speed !== 'offline' && (
            <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded animate-bounce">Syncing...</span>
          )}
        </div>
      )}
      {speed === 'slow' && (
        <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2 text-xs text-indigo-700 flex items-center gap-1.5 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
          <span>Slow Connection Mode: Responses will simulate 2.5s network delay.</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div 
            key={i}
            
            
            className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}
          >
            <div className={cn(
              "flex max-w-[80%] items-start space-x-3",
              msg.role === 'user' ? "flex-row-reverse space-x-reverse" : "flex-row"
            )}>
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white mt-1",
                msg.role === 'user' ? "bg-slate-800" : "bg-indigo-600"
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                msg.role === 'user' 
                  ? "bg-slate-800 text-white rounded-tr-none" 
                  : "bg-slate-100 text-slate-800 rounded-tl-none"
              )}>
                <div>{msg.content}</div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-200/60 text-xs">
                    <p className="font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Sources used:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, idx) => (
                        <a
                          key={idx}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-slate-50 border border-slate-200 text-indigo-600 hover:text-indigo-800 transition-colors font-medium text-[11px] shadow-2xs max-w-[220px] truncate"
                          title={src.title}
                        >
                          {src.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-3 max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-slate-100 rounded-tl-none flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                <span className="text-sm text-slate-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for career advice, roadmap help, or interview tips..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

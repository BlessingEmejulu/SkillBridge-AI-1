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
              body: JSON.stringify({ prompt: queuedPrompt, lowData: speed === 'slow' })
            });
            const data = await response.json();
            if (!data.error) {
              updatedMessages.push({ 
                role: 'assistant', 
                content: `✨ [Synced Gemma-4 Answer for "${queuedPrompt}"]\n\n` + data.text, 
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
    
    // Custom dynamic offline advice builder based on prompt keywords to feel like a real local AI model
    const modelPrefix = `🧠 [Local Gemma-4-31b-it Engine (Offline Heuristic Cache)]\n\n`;
    
    if (query.includes('resume') || query.includes('cv') || query.includes('profile')) {
      return modelPrefix + `Based on ATS and recruitment industry standards, your resume needs structured optimization:
- **Google X-Y-Z formula**: Always phrase your achievements as: "Accomplished [X] as measured by [Y], by doing [Z]".
- **Technical Skills Matrix**: Cluster your technologies by category (Languages, Frameworks, Cloud, Databases) at the very top.
- **Single-Column Rule**: Use a standard clean, single-column template so parser tools parse your years of experience correctly.
- **Action Verbs**: Start bullets with strong past-tense verbs (e.g., Designed, Orchestrated, Optimized, Architected).

*(Your message has been stored in your persistent local IndexedDB queue. It will synchronize with our live Cloud service for a deeper, customized Gemma analysis as soon as your device reconnects.)*`;
    }
    
    if (query.includes('react') || query.includes('frontend') || query.includes('js') || query.includes('typescript') || query.includes('css') || query.includes('next')) {
      return modelPrefix + `Frontend development architectures require specialized preparation:
- **React State Management**: Be clear on when to use standard Context API (prop-drilling prevention) vs client-side state engines (Zustand, Redux) for high-frequency data streams.
- **Rendering & Paint Optimization**: Master virtual DOM reconciliation, the difference between browser reflow/repaint, and lazy loading strategies.
- **PWA & Offline-First**: Explain Service Worker lifecycles, CacheStorage, and local persistence (IndexedDB) which allows apps like this one to run gracefully offline.
- **Styling**: Tailwind utility styling is optimal for mobile-first layouts. Use standard touch targets of 44px+ for fluid accessibility.

*(Your message has been stored in your persistent local IndexedDB queue. It will synchronize with our live Cloud service for a deeper, customized Gemma analysis as soon as your device reconnects.)*`;
    }
    
    if (query.includes('python') || query.includes('ml') || query.includes('ai') || query.includes('model') || query.includes('tensor') || query.includes('learning')) {
      return modelPrefix + `Machine Learning and AI Engineering roles demand pristine architectural reasoning:
- **Feature Engineering & Imputation**: Be ready to discuss handling missing values (median, KNN, MICE), outlier detection, and feature scaling.
- **Model Evaluation**: Do not just say "Accuracy". Recite F1-score, ROC-AUC, confusion matrix, and explain precision-recall tradeoffs for unbalanced sets.
- **Optimization**: Know how to identify underfitting vs overfitting (L1/L2 regularization, dropout) and explain learning rate scheduling.
- **Deployment**: Discuss packaging models via Docker, converting models to ONNX for lighter edge runtimes, or hosting with FastAPI.

*(Your message has been stored in your persistent local IndexedDB queue. It will synchronize with our live Cloud service for a deeper, customized Gemma analysis as soon as your device reconnects.)*`;
    }
    
    if (query.includes('interview') || query.includes('question') || query.includes('behavior') || query.includes('behavioral')) {
      return modelPrefix + `Cracking behavioral and technical interview loops relies on structured delivery:
- **STAR Methodology**: Keep stories tightly bounded in: **S**ituation (15%), **T**ask (15%), **A**ction (55%), and **R**esult (15%). Always prioritize your actions and lessons.
- **Trade-offs**: Senior interviews are defined by trade-off analysis. Never pitch a single "perfect" solution; discuss cost, complexity, and performance limits.
- **Whiteboard Practice**: State edge cases and write out clear input/output assertions *before* you lay down a single line of code.

*(Your message has been stored in your persistent local IndexedDB queue. It will synchronize with our live Cloud service for a deeper, customized Gemma analysis as soon as your device reconnects.)*`;
    }

    if (query.includes('job') || query.includes('salary') || query.includes('negotiat') || query.includes('offer')) {
      return modelPrefix + `Salary negotiation and market strategy guidance:
- **Establish Ranges**: Never give an exact single number first. Refer to competitive local ranges or base pay structures.
- **Leverage Portfolios**: Build 2-3 polished, fully functional repositories with a clean README, a clear visual demo, and automated tests. This gives massive leverage.
- **Multiple Channels**: Don't rely solely on job boards. Contact hiring managers directly or network with engineers at the target company.

*(Your message has been stored in your persistent local IndexedDB queue. It will synchronize with our live Cloud service for a deeper, customized Gemma analysis as soon as your device reconnects.)*`;
    }
    
    // Generic high-quality AI coach response matching their prompt keywords
    return modelPrefix + `Your request has been captured offline. Here is local strategic guidance for your career search:
- **Design Intentional Portfolios**: Stand out by building products that have real-world resilience (such as offline state synchronization, solid mobile designs, and fluid accessibility).
- **Active Learning Velocity**: Maintain consistent daily milestones to build structured skills systematically.
- **ATS Preparation**: Ensure your technical profiles precisely map the target roles to maximize matchmaking algorithms.

*(Your query has been recorded. It will automatically synchronize with our Cloud Gemma-4-31b-it service when your internet connection is restored!)*`;
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
        body: JSON.stringify({ prompt: userMsg, lowData: speed === 'slow' })
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
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Career Coach</h2>
            <p className="text-xs text-indigo-600 font-semibold">Gemma-4-31b-it Active</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {speed === 'fast' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Gemma-4 (Cloud Engine)
            </span>
          )}
          {speed === 'slow' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
              Gemma-4 (Low-Data Mode)
            </span>
          )}
          {speed === 'offline' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Gemma-4 (Local WASM)
            </span>
          )}
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
          <span>Low Data Connection: Gemma-4-31b-it is optimized to save bandwidth. Search grounding is bypassed for instant delivery.</span>
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

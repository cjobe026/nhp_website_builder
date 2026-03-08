'use client';

import Link from 'next/link';
import { useChangeSet } from './ChangeSetContext';
import { useAuth } from './AuthContext';
import { deployChanges, triggerRebuild, checkWorkflowStatus } from './deploy';
import { useState, useEffect } from 'react';

export default function Home() {
  const { changes, removeChange, clearChanges } = useChangeSet();
  const { logout, user } = useAuth();
  const [deploying, setDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [counts, setCounts] = useState({ articles: 0, films: 0, events: 0 });
  const [loading, setLoading] = useState(true);
  const [bootText, setBootText] = useState<string[]>([]);

  useEffect(() => {
    const bootSequence = [
      'NHP WEB DESIGNER v1.0',
      'Copyright (c) 2025 No Homework Productions',
      '',
      'Initializing system...',
      'Loading Firebase connection... OK',
      'Checking authentication... OK',
      'Loading articles database... ',
      'Loading films database... ',
      'Loading events database... ',
      'System ready.',
      ''
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < bootSequence.length) {
        setBootText(prev => [...prev, bootSequence[index]]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setLoading(false), 500);
      }
    }, 150);

    async function loadCounts() {
      const { getArticles, getFilms, getEvents } = await import('./firestore');
      const [articles, films, events] = await Promise.all([getArticles(), getFilms(), getEvents()]);
      setCounts({ articles: articles.length, films: films.length, events: events.length });
    }
    loadCounts();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (deploying && deployStatus === 'Building...') {
      interval = setInterval(async () => {
        setPollCount(prev => prev + 1);
        setProgress(prev => Math.min(prev + (100 / 17), 95));
        const status = await checkWorkflowStatus();
        console.log('Workflow status:', status);
        if (status?.status === 'completed') {
          setProgress(100);
          setDeployStatus(status.conclusion === 'success' ? 'Deployed!' : 'Failed');
          setDeploying(false);
          setPollCount(0);
          setTimeout(() => {
            setProgress(0);
            setDeployStatus(null);
          }, 3000);
        } else if (pollCount > 24) {
          setDeployStatus('Timeout - check GitHub Actions');
          setDeploying(false);
          setPollCount(0);
          setProgress(0);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [deploying, deployStatus, pollCount]);

  const handleDeploy = async () => {
    if (!confirm(`Deploy ${changes.length} changes to dev database?`)) return;
    
    setDeploying(true);
    setDeployStatus('Deploying...');
    try {
      const results = await deployChanges(changes);
      const failed = results.filter(r => !r.success);
      
      if (failed.length === 0) {
        clearChanges();
        setDeployStatus('Triggering rebuild...');
        const rebuild = await triggerRebuild();
        if (rebuild.success) {
          setPollCount(0);
          setProgress(0);
          setDeployStatus('Building...');
        } else {
          alert('Deployed to DB, rebuild failed');
          setDeploying(false);
          setDeployStatus(null);
        }
      } else {
        alert(`${failed.length} changes failed`);
        setDeploying(false);
        setDeployStatus(null);
      }
    } catch (error) {
      alert('Deploy failed');
      setDeploying(false);
      setDeployStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-8 flex items-center justify-center font-mono">
        <div className="max-w-2xl w-full">
          <div className="text-green-500 text-sm space-y-1">
            {bootText.map((line, i) => (
              <div key={i} className="whitespace-pre">
                {line}
                {i === bootText.length - 1 && line && <span className="animate-pulse">_</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex justify-between items-start mb-8">
            <h1 className="text-7xl font-black text-white">NHP Web Designer</h1>
            <div className="text-right">
              <a 
                href="https://nhpwebsite-dev.web.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-cyan-400 hover:text-cyan-300 text-sm font-semibold mb-2"
              >
                View Dev Site →
              </a>
              <p className="text-gray-400 text-sm mb-2">{user?.email}</p>
              <button onClick={logout} className="text-red-400 hover:text-red-300 text-sm font-semibold">
                Sign Out
              </button>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <button 
              onClick={handleDeploy}
              disabled={deploying || changes.length === 0}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            {deployStatus && (
              <div className="flex flex-col gap-2">
                <div className="text-cyan-400 font-semibold">{deployStatus}</div>
                {deployStatus === 'Building...' && (
                  <div className="w-64">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Est. 1:24</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            <button className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>
            <button className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <Link href="/articles" className="group">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 h-64 shadow-2xl hover:shadow-yellow-500/50 transition-all hover:scale-105 flex flex-col justify-between">
                  <div>
                    <h2 className="text-4xl font-black text-white mb-2">Articles</h2>
                    <p className="text-white/80 text-sm">Manage news & stories</p>
                  </div>
                  <div className="text-white/60 text-sm font-bold">{counts.articles} articles</div>
                </div>
              </Link>

              <Link href="/films" className="group">
                <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-3xl p-8 h-64 shadow-2xl hover:shadow-gray-500/50 transition-all hover:scale-105 flex flex-col justify-between">
                  <div>
                    <h2 className="text-4xl font-black text-white mb-2">Films</h2>
                    <p className="text-white/80 text-sm">Edit film content</p>
                  </div>
                  <div className="text-white/60 text-sm font-bold">{counts.films} films</div>
                </div>
              </Link>

              <Link href="/events" className="group">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 h-64 shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105 flex flex-col justify-between">
                  <div>
                    <h2 className="text-4xl font-black text-white mb-2">Events</h2>
                    <p className="text-white/80 text-sm">Manage events</p>
                  </div>
                  <div className="text-white/60 text-sm font-bold">{counts.events} events</div>
                </div>
              </Link>
            </div>
          </div>

          <div>
            <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-white">Change Set</h3>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold">
                  {changes.length} changes
                </span>
              </div>

              {changes.length > 0 ? (
                <div className="space-y-3">
                  {changes.map((change, i) => (
                    <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          change.type === 'article' ? 'bg-yellow-500/20 text-yellow-400' :
                          change.type === 'film' ? 'bg-gray-500/20 text-gray-400' :
                          'bg-pink-500/20 text-pink-400'
                        }`}>
                          {change.type}
                        </span>
                        <button 
                          onClick={() => removeChange(change.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-white font-semibold text-sm">{change.name}</p>
                      <p className="text-gray-500 text-xs mt-1">{change.action}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-sm">No pending changes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

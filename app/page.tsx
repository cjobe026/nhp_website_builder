'use client';

import Link from 'next/link';
import { useChangeSet } from './ChangeSetContext';

export default function Home() {
  const { changes, removeChange } = useChangeSet();

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-7xl font-black text-white mb-8">NHP Web Designer</h1>
          
          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
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
          {/* Left Column - Main Sections */}
          <div className="col-span-2 space-y-8">
            {/* Main Sections Grid */}
            <div className="grid grid-cols-2 gap-8">
              {/* Articles */}
              <Link href="/articles" className="group">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 h-64 shadow-2xl hover:shadow-yellow-500/50 transition-all hover:scale-105 flex flex-col justify-between">
                  <div>
                    <h2 className="text-4xl font-black text-white mb-2">Articles</h2>
                    <p className="text-white/80 text-sm">Manage news & stories</p>
                  </div>
                  <div className="text-white/60 text-sm font-bold">4 articles</div>
                </div>
              </Link>

              {/* Films */}
              <Link href="/films" className="group">
                <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-3xl p-8 h-64 shadow-2xl hover:shadow-gray-500/50 transition-all hover:scale-105 flex flex-col justify-between">
                  <div>
                    <h2 className="text-4xl font-black text-white mb-2">Films</h2>
                    <p className="text-white/80 text-sm">Edit film content</p>
                  </div>
                  <div className="text-white/60 text-sm font-bold">5 films</div>
                </div>
              </Link>
            </div>

            {/* Cast & Crew - Full Width */}
            <Link href="/cast-crew" className="group block">
              <div className="bg-gradient-to-br from-pink-400 to-purple-500 rounded-3xl p-8 h-48 shadow-2xl hover:shadow-pink-500/50 transition-all hover:scale-105 flex flex-col justify-between">
                <div>
                  <h2 className="text-4xl font-black text-white mb-2">Cast & Crew</h2>
                  <p className="text-white/80 text-sm">Manage people</p>
                </div>
                <div className="text-white/60 text-sm font-bold">12 members</div>
              </div>
            </Link>
          </div>

          {/* Right Column - Change Set */}
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

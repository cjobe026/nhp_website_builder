'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useChangeSet } from '../ChangeSetContext';
import { getArticles } from '../firestore';

export default function ArticlesPage() {
  const { addChange } = useChangeSet();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      const data = await getArticles();
      setArticles(data);
      setLoading(false);
    }
    loadArticles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-8 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-black text-gray-900">Articles</h1>
          <Link href="/articles/new">
            <button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
              + New Article
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div key={article.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-yellow-400">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900">{article.title}</h3>
                {article.showInCarousel && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold">Carousel</span>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-4">{article.excerpt}</p>
              <div className="flex gap-2">
                <Link href={`/articles/${article.id}`}>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold">Edit</button>
                </Link>
                <button 
                  onClick={() => {
                    if (confirm(`Delete "${article.title}"?`)) {
                      addChange({
                        type: 'article',
                        name: article.title,
                        action: 'deleted',
                        data: { id: article.id },
                      });
                      setArticles(articles.filter(a => a.id !== article.id));
                    }
                  }}
                  className="text-red-600 hover:text-red-800 text-sm font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

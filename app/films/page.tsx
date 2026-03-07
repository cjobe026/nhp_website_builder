'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFilms } from '../firestore';

export default function FilmsPage() {
  const [films, setFilms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFilms() {
      const data = await getFilms();
      setFilms(data);
      setLoading(false);
    }
    loadFilms();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-8 flex items-center justify-center">
        <div className="text-2xl font-bold text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-black text-white">Films</h1>
          <Link href="/films/new">
            <button className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
              + New Film
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {films.map((film) => (
            <div key={film.id} className="bg-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-gray-500">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-white">{film.name}</h3>
                <span className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs font-bold">{film.Year}</span>
              </div>
              <p className="text-gray-300 text-sm mb-2">{film.Synopsis?.substring(0, 100)}...</p>
              <p className="text-gray-400 text-xs mb-4">{film.Status}</p>
              <div className="flex gap-2">
                <Link href={`/films/${film.id}`}>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold">Edit</button>
                </Link>
                <button className="text-red-400 hover:text-red-300 text-sm font-semibold">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

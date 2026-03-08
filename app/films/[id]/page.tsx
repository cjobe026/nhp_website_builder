'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useChangeSet } from '../../ChangeSetContext';
import { getFilms } from '../../firestore';

export default function EditFilmPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { addChange, getPendingData } = useChangeSet();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  
  const [film, setFilm] = useState({
    name: '',
    Year: '',
    Synopsis: '',
    Status: '',
    Starring: '',
    YouTubeLink: '',
    Cast: [] as Array<{ name: string; character: string }>,
    Crew: [] as Array<{ name: string; role: string }>,
  });

  useEffect(() => {
    async function loadFilm() {
      const pendingData = getPendingData('film', id);
      
      if (pendingData) {
        setFilm({
          name: pendingData.name,
          Year: pendingData.Year,
          Synopsis: pendingData.Synopsis,
          Status: pendingData.Status,
          Starring: pendingData.Starring,
          YouTubeLink: pendingData.YouTubeLink,
          Cast: pendingData.Cast || [],
          Crew: pendingData.Crew || [],
        });
        setLoading(false);
        return;
      }

      const films = await getFilms();
      const found = films.find(f => f.id === id);
      if (found) {
        setFilm({
          name: found.name,
          Year: found.Year,
          Synopsis: found.Synopsis,
          Status: found.Status,
          Starring: found.Starring,
          YouTubeLink: found.YouTubeLink,
          Cast: found.Cast || [],
          Crew: found.Crew || [],
        });
      }
      setLoading(false);
    }
    loadFilm();
  }, [id, getPendingData]);

  const handleSave = () => {
    addChange({
      type: 'film',
      name: film.name,
      action: 'updated',
      data: { ...film, id },
    });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-8 flex items-center justify-center">
        <div className="text-2xl font-bold text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/films" className="inline-flex items-center text-gray-300 hover:text-white mb-4">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Films
        </Link>
        <div className="bg-gray-700 rounded-2xl p-8 shadow-xl">
          <h1 className="text-4xl font-black text-white mb-8">Edit Film</h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Film Name</label>
              <input
                type="text"
                value={film.name}
                onChange={(e) => setFilm({ ...film, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl focus:border-gray-400 focus:outline-none text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Year</label>
                <input
                  type="text"
                  value={film.Year}
                  onChange={(e) => setFilm({ ...film, Year: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl focus:border-gray-400 focus:outline-none text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Status</label>
                <input
                  type="text"
                  value={film.Status}
                  onChange={(e) => setFilm({ ...film, Status: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl focus:border-gray-400 focus:outline-none text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Starring</label>
              <input
                type="text"
                value={film.Starring}
                onChange={(e) => setFilm({ ...film, Starring: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl focus:border-gray-400 focus:outline-none text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Synopsis</label>
              <textarea
                value={film.Synopsis}
                onChange={(e) => setFilm({ ...film, Synopsis: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl focus:border-gray-400 focus:outline-none text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">YouTube Link</label>
              <input
                type="text"
                value={film.YouTubeLink}
                onChange={(e) => setFilm({ ...film, YouTubeLink: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl focus:border-gray-400 focus:outline-none text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Cast</label>
              <div className="space-y-2">
                {film.Cast.map((member, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Actor Name"
                      value={member.name}
                      onChange={(e) => {
                        const newCast = [...film.Cast];
                        newCast[idx].name = e.target.value;
                        setFilm({ ...film, Cast: newCast });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-800 border-2 border-gray-600 rounded-xl focus:border-gray-400 focus:outline-none text-white"
                    />
                    <input
                      type="text"
                      placeholder="Character"
                      value={member.character}
                      onChange={(e) => {
                        const newCast = [...film.Cast];
                        newCast[idx].character = e.target.value;
                        setFilm({ ...film, Cast: newCast });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-800 border-2 border-gray-600 rounded-xl focus:border-gray-400 focus:outline-none text-white"
                    />
                    <button
                      onClick={() => setFilm({ ...film, Cast: film.Cast.filter((_, i) => i !== idx) })}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setFilm({ ...film, Cast: [...film.Cast, { name: '', character: '' }] })}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-xl font-bold"
                >
                  + Add Cast Member
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Crew</label>
              <div className="space-y-2">
                {film.Crew.map((member, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => {
                        const newCrew = [...film.Crew];
                        newCrew[idx].name = e.target.value;
                        setFilm({ ...film, Crew: newCrew });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-800 border-2 border-gray-600 rounded-xl focus:border-gray-400 focus:outline-none text-white"
                    />
                    <input
                      type="text"
                      placeholder="Role"
                      value={member.role}
                      onChange={(e) => {
                        const newCrew = [...film.Crew];
                        newCrew[idx].role = e.target.value;
                        setFilm({ ...film, Crew: newCrew });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-800 border-2 border-gray-600 rounded-xl focus:border-gray-400 focus:outline-none text-white"
                    />
                    <button
                      onClick={() => setFilm({ ...film, Crew: film.Crew.filter((_, i) => i !== idx) })}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setFilm({ ...film, Crew: [...film.Crew, { name: '', role: '' }] })}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-xl font-bold"
                >
                  + Add Crew Member
                </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
              >
                Save Changes
              </button>
              <button
                onClick={() => router.push('/films')}
                className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-xl font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useChangeSet } from '../../ChangeSetContext';
import { getEvents, getFilms } from '../../firestore';

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { addChange, getPendingData } = useChangeSet();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [films, setFilms] = useState<any[]>([]);
  
  const [event, setEvent] = useState({
    title: '',
    subtitle: '',
    date: '',
    time: '',
    location: '',
    venue: '',
    description: '',
    link: '',
    type: '',
    status: 'upcoming' as 'upcoming' | 'past',
    movieId: '',
    showOnMainPage: false,
    mainPageOrder: 0,
  });

  useEffect(() => {
    async function loadEvent() {
      const allFilms = await getFilms();
      setFilms(allFilms);

      if (id === 'new') {
        setLoading(false);
        return;
      }

      const allEvents = await getEvents();
      console.log('All events:', allEvents);
      console.log('Looking for id:', id, 'type:', typeof id);
      const pendingData = getPendingData('event', id);
      
      if (pendingData) {
        console.log('Using pending data:', pendingData);
        setEvent(pendingData);
        setLoading(false);
        return;
      }

      const found = allEvents.find(e => String(e.id) === String(id));
      console.log('Found event:', found);
      if (found) {
        const eventData = {
          title: found.title || '',
          subtitle: found.subtitle || '',
          date: found.date || '',
          time: found.time || '',
          location: found.location || '',
          venue: found.venue || '',
          description: found.description || '',
          link: found.link || '',
          type: found.type || '',
          status: found.status || 'upcoming',
          movieId: found.movieId || '',
          showOnMainPage: found.showOnMainPage || false,
          mainPageOrder: found.mainPageOrder || 0,
        };
        console.log('Setting event data:', eventData);
        setEvent(eventData);
      }
      setLoading(false);
    }
    loadEvent();
  }, [id, getPendingData]);

  const handleSave = () => {
    const eventId = id === 'new' ? event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : id;

    addChange({
      type: 'event' as any,
      name: event.title,
      action: id === 'new' ? 'created' : 'updated',
      data: { ...event, id: eventId },
    });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/events" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Events
        </Link>
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h1 className="text-4xl font-black text-gray-900 mb-8">{id === 'new' ? 'New Event' : 'Edit Event'}</h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={event.title}
                onChange={(e) => setEvent({ ...event, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Subtitle</label>
              <input
                type="text"
                value={event.subtitle}
                onChange={(e) => setEvent({ ...event, subtitle: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={event.date}
                  onChange={(e) => setEvent({ ...event, date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
                <input
                  type="text"
                  value={event.time}
                  onChange={(e) => setEvent({ ...event, time: e.target.value })}
                  placeholder="e.g. 7:00 PM"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Venue</label>
              <input
                type="text"
                value={event.venue}
                onChange={(e) => setEvent({ ...event, venue: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={event.location}
                onChange={(e) => setEvent({ ...event, location: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
              <input
                type="text"
                value={event.type}
                onChange={(e) => setEvent({ ...event, type: e.target.value })}
                placeholder="e.g. Festival Screening, Premiere"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea
                value={event.description}
                onChange={(e) => setEvent({ ...event, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Link (Optional)</label>
              <input
                type="url"
                value={event.link}
                onChange={(e) => setEvent({ ...event, link: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Related Film</label>
              <select
                value={event.movieId}
                onChange={(e) => setEvent({ ...event, movieId: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              >
                <option value="">None</option>
                {films.map((film) => (
                  <option key={film.id} value={film.id}>{film.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
              <select
                value={event.status}
                onChange={(e) => setEvent({ ...event, status: e.target.value as 'upcoming' | 'past' })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              >
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={event.showOnMainPage}
                  onChange={(e) => setEvent({ ...event, showOnMainPage: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-sm font-bold text-gray-700">Show on Main Page</span>
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
              >
                Save Changes
              </button>
              <button
                onClick={() => router.push('/events')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-xl font-bold"
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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useChangeSet } from '../ChangeSetContext';
import { getEvents } from '../firestore';

export default function EventsPage() {
  const { addChange } = useChangeSet();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      const data = await getEvents();
      setEvents(data);
      setLoading(false);
    }
    loadEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-black text-gray-900">Events</h1>
          <Link href="/events/new">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
              + New Event
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-400">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  event.status === 'upcoming' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {event.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{event.subtitle}</p>
              <p className="text-gray-500 text-sm mb-4">{event.date} • {event.time}</p>
              <div className="flex gap-2">
                <Link href={`/events/${event.id}`}>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold">Edit</button>
                </Link>
                <button 
                  onClick={() => {
                    if (confirm(`Delete "${event.title}"?`)) {
                      addChange({
                        type: 'event' as any,
                        name: event.title,
                        action: 'deleted',
                        data: { id: event.id },
                      });
                      setEvents(events.filter(e => e.id !== event.id));
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

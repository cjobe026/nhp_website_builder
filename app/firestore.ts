import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase-config';

export interface Article {
  id: string;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
  mobileImage?: string;
  relatedFilm?: string;
  relatedFilms?: string[];
  showInCarousel: boolean;
  carouselOrder: number;
  relatedLinks?: Array<{
    title: string;
    description: string;
    url: string;
    icon: string;
  }>;
}

export interface Film {
  id: string;
  name: string;
  Year: string;
  Starring: string;
  Image_src: string;
  posterPath: string;
  Awards: string[];
  YouTubeLink: string;
  Synopsis: string;
  Status: string;
  TimelinePosition?: number;
  InFestivals: boolean;
  Genres: string[];
  Cast?: Array<{ name: string; character: string }>;
  Crew?: Array<{ name: string; role: string }>;
  directorsStatement?: string;
  posterCount?: number;
  hidden?: boolean;
  watchable?: boolean;
}

export interface Event {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  description: string;
  link?: string;
  type: string;
  status: 'upcoming' | 'past';
  movieId?: string;
  movieIds?: string[];
  showOnMainPage: boolean;
  mainPageOrder: number;
}

export async function getArticles(): Promise<Article[]> {
  const articlesCol = collection(db, 'articles');
  const snapshot = await getDocs(articlesCol);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
    } as Article;
  });
}

export async function getCarouselArticles(): Promise<Article[]> {
  const articlesCol = collection(db, 'articles');
  const snapshot = await getDocs(articlesCol);
  const articles = snapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
    } as Article;
  });
  return articles
    .filter(a => a.showInCarousel)
    .sort((a, b) => a.carouselOrder - b.carouselOrder);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const articlesCol = collection(db, 'articles');
  const q = query(articlesCol, where('slug', '==', slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  const data = docSnap.data();
  return { 
    id: docSnap.id, 
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
  } as Article;
}

export async function getFilms(): Promise<Film[]> {
  const filmsCol = collection(db, 'films');
  const snapshot = await getDocs(filmsCol);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
    } as Film;
  });
}

export async function getFilmByName(name: string): Promise<Film | null> {
  const filmsCol = collection(db, 'films');
  const q = query(filmsCol, where('name', '==', name));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  const data = docSnap.data();
  return { 
    id: docSnap.id, 
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
  } as Film;
}

export async function getEvents(): Promise<Event[]> {
  const eventsCol = collection(db, 'events');
  const snapshot = await getDocs(eventsCol);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
    } as Event;
  });
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const eventsCol = collection(db, 'events');
  const snapshot = await getDocs(eventsCol);
  const events = snapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
    } as Event;
  });
  return events
    .filter(e => e.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function getMainPageEvents(): Promise<Event[]> {
  const eventsCol = collection(db, 'events');
  const snapshot = await getDocs(eventsCol);
  const events = snapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
    } as Event;
  });
  return events
    .filter(e => e.showOnMainPage)
    .sort((a, b) => a.mainPageOrder - b.mainPageOrder);
}

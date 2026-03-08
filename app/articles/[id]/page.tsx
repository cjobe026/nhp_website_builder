'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useChangeSet } from '../../ChangeSetContext';
import { getArticles, getFilms } from '../../firestore';
import { uploadArticleImages } from '../../storage';
import RichTextEditor from '../../components/RichTextEditor';

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { addChange, getPendingData } = useChangeSet();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [films, setFilms] = useState<any[]>([]);
  
  const [article, setArticle] = useState({
    title: '',
    excerpt: '',
    content: '',
    date: '',
    image: '',
    mobileImage: '',
    showInCarousel: false,
    carouselOrder: 0,
    relatedFilm: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageSize, setImageSize] = useState<number>(0);
  const [mobileImageSize, setMobileImageSize] = useState<number>(0);

  useEffect(() => {
    async function loadArticle() {
      const allFilms = await getFilms();
      setFilms(allFilms);

      // Handle new article creation
      if (id === 'new') {
        setArticle({
          title: '',
          excerpt: '',
          content: '',
          date: '',
          image: '',
          mobileImage: '',
          showInCarousel: false,
          carouselOrder: 0,
          relatedFilm: '',
        });
        setLoading(false);
        return;
      }

      const allArticles = await getArticles();
      
      const pendingData = getPendingData('article', id);
      
      if (pendingData) {
        setArticle({
          title: pendingData.title || '',
          excerpt: pendingData.excerpt || '',
          content: pendingData.content || '',
          date: pendingData.date || '',
          image: pendingData.image || '',
          mobileImage: pendingData.mobileImage || '',
          showInCarousel: pendingData.showInCarousel || false,
          carouselOrder: pendingData.carouselOrder || 0,
          relatedFilm: pendingData.relatedFilm || '',
        });
        setLoading(false);
        return;
      }

      const found = allArticles.find(a => a.id === id);
      if (found) {
        setArticle({
          title: found.title || '',
          excerpt: found.excerpt || '',
          content: found.content || '',
          date: found.date || '',
          image: found.image || '',
          mobileImage: found.mobileImage || '',
          showInCarousel: found.showInCarousel || false,
          carouselOrder: found.carouselOrder || 0,
          relatedFilm: found.relatedFilm || '',
        });
      }
      setLoading(false);
    }
    loadArticle();
  }, [id, getPendingData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-8 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  const handleSave = async () => {
    const articleId = id === 'new' ? article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : id;

    addChange({
      type: 'article',
      name: article.title,
      action: id === 'new' ? 'created' : 'updated',
      data: { 
        ...article, 
        id: articleId, 
        slug: articleId,
        imageFile: imageFile ? await fileToBase64(imageFile) : undefined,
        mobileImageFile: mobileImageFile ? await fileToBase64(mobileImageFile) : undefined,
      },
    });
    router.push('/');
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/articles" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Articles
        </Link>
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h1 className="text-4xl font-black text-gray-900 mb-2">{id === 'new' ? 'New Article' : 'Edit Article'}</h1>
          {id !== 'new' && <p className="text-sm text-gray-500 mb-8">ID: {id}</p>}
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={article.title}
                onChange={(e) => setArticle({ ...article, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
              <input
                type="text"
                value={article.date}
                onChange={(e) => setArticle({ ...article, date: e.target.value })}
                placeholder="e.g. February 23, 2026"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Excerpt</label>
              <textarea
                value={article.excerpt}
                onChange={(e) => setArticle({ ...article, excerpt: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Content</label>
              <RichTextEditor
                value={article.content}
                onChange={(content) => setArticle({ ...article, content })}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Desktop Image</label>
                {article.image && (
                  <div className="relative">
                    <img src={article.image} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2" />
                    <button
                      onClick={() => {
                        setArticle({ ...article, image: '' });
                        setImageFile(null);
                        setImageSize(0);
                      }}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}
                {imageSize > 0 && (
                  <p className={`text-sm mb-2 ${imageSize > 1.5 * 1024 * 1024 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                    {imageSize > 1.5 * 1024 * 1024 && '⚠️ '}
                    Size: {(imageSize / 1024 / 1024).toFixed(2)} MB
                    {imageSize > 1.5 * 1024 * 1024 && ' (Too large!)'}
                  </p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      setImageSize(file.size);
                      const url = URL.createObjectURL(file);
                      setArticle({ ...article, image: url });
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Image (Optional)</label>
                {article.mobileImage && (
                  <div className="relative">
                    <img src={article.mobileImage} alt="Mobile Preview" className="w-full h-32 object-cover rounded-lg mb-2" />
                    <button
                      onClick={() => {
                        setArticle({ ...article, mobileImage: '' });
                        setMobileImageFile(null);
                        setMobileImageSize(0);
                      }}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}
                {mobileImageSize > 0 && (
                  <p className={`text-sm mb-2 ${mobileImageSize > 1.5 * 1024 * 1024 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                    {mobileImageSize > 1.5 * 1024 * 1024 && '⚠️ '}
                    Size: {(mobileImageSize / 1024 / 1024).toFixed(2)} MB
                    {mobileImageSize > 1.5 * 1024 * 1024 && ' (Too large!)'}
                  </p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setMobileImageFile(file);
                      setMobileImageSize(file.size);
                      const url = URL.createObjectURL(file);
                      setArticle({ ...article, mobileImage: url });
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={article.showInCarousel}
                  onChange={(e) => setArticle({ ...article, showInCarousel: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-sm font-bold text-gray-700">Show in Carousel</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Related Film (Optional)</label>
              <select
                value={article.relatedFilm}
                onChange={(e) => setArticle({ ...article, relatedFilm: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:outline-none"
              >
                <option value="">None</option>
                {films.map((film) => (
                  <option key={film.id} value={film.name}>{film.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
              >
                Save Changes
              </button>
              <button
                onClick={() => router.push('/articles')}
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

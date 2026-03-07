'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useChangeSet } from '../../ChangeSetContext';
import { getArticles } from '../../firestore';
import { uploadArticleImages } from '../../storage';
import RichTextEditor from '../../components/RichTextEditor';

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { addChange } = useChangeSet();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  
  const [article, setArticle] = useState({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    mobileImage: '',
    showInCarousel: false,
    carouselOrder: 0,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      const articles = await getArticles();
      console.log('All articles:', articles);
      console.log('Looking for ID:', id);
      const found = articles.find(a => a.id === id);
      console.log('Found article:', found);
      if (found) {
        setArticle({
          title: found.title || '',
          excerpt: found.excerpt || '',
          content: found.content || '',
          image: found.image || '',
          mobileImage: found.mobileImage || '',
          showInCarousel: found.showInCarousel || false,
          carouselOrder: found.carouselOrder || 0,
        });
      }
      setLoading(false);
    }
    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-8 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  const handleSave = async () => {
    setUploading(true);
    try {
      let updatedArticle = { ...article };

      // Upload images if new files selected
      if (imageFile || mobileImageFile) {
        const articleSlug = id;
        const urls = await uploadArticleImages(articleSlug, imageFile || undefined, mobileImageFile || undefined);
        
        if (urls.desktop) updatedArticle.image = urls.desktop;
        if (urls.mobile) updatedArticle.mobileImage = urls.mobile;
      }

      addChange({
        type: 'article',
        name: updatedArticle.title,
        action: 'updated',
        data: updatedArticle,
      });
      router.push('/');
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Edit Article</h1>
          <p className="text-sm text-gray-500 mb-8">ID: {id}</p>
          
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
                  <img src={article.image} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
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
                  <img src={article.mobileImage} alt="Mobile Preview" className="w-full h-32 object-cover rounded-lg mb-2" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setMobileImageFile(file);
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

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                disabled={uploading}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Save Changes'}
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

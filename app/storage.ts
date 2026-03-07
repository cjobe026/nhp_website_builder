import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase-config';

export async function uploadImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}

export async function uploadArticleImages(
  articleSlug: string,
  desktopImage?: File,
  mobileImage?: File
): Promise<{ desktop?: string; mobile?: string }> {
  const urls: { desktop?: string; mobile?: string } = {};

  if (desktopImage) {
    const path = `articles/${articleSlug}/desktop-${Date.now()}.${desktopImage.name.split('.').pop()}`;
    urls.desktop = await uploadImage(desktopImage, path);
  }

  if (mobileImage) {
    const path = `articles/${articleSlug}/mobile-${Date.now()}.${mobileImage.name.split('.').pop()}`;
    urls.mobile = await uploadImage(mobileImage, path);
  }

  return urls;
}

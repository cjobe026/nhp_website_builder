import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const devConfig = {
  apiKey: "AIzaSyDAenAF70fYIZFf9Ht0MrwIswSHsHBpcx0",
  authDomain: "nhpwebsite-dev.firebaseapp.com",
  projectId: "nhpwebsite-dev",
  storageBucket: "nhpwebsite-dev.firebasestorage.app",
  messagingSenderId: "662768156676",
  appId: "1:662768156676:web:eef5980b9b7b44e5387551",
  measurementId: "G-L361Y1Q1ES"
};

const prodConfig = {
  apiKey: "AIzaSyCsKlLqAGO9W3QCRIuGbmnyUYfgkpnDsE0",
  authDomain: "nhpwebsite.firebaseapp.com",
  projectId: "nhpwebsite",
  storageBucket: "nhpwebsite.firebasestorage.app",
  messagingSenderId: "291056336896",
  appId: "1:291056336896:web:6920a2f2ee07f4f1bf18e5",
  measurementId: "G-TKTNP6KG1X"
};

const isDev = process.env.NEXT_PUBLIC_ENV === 'development' || process.env.NODE_ENV === 'development';
const config = isDev ? devConfig : prodConfig;

const dbApp = getApps().find(app => app.name === '[DEFAULT]') || initializeApp(config);
export const db = getFirestore(dbApp);
export const storage = getStorage(dbApp);

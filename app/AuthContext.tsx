'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';

const cmsAuthConfig = {
  apiKey: "AIzaSyBY8wOCmHtQ2amhBHo5vZMaraULMGSfk6Q",
  authDomain: "nhp-web-designer.firebaseapp.com",
  projectId: "nhp-web-designer",
  storageBucket: "nhp-web-designer.firebasestorage.app",
  messagingSenderId: "742109920732",
  appId: "1:742109920732:web:b2c509121e5d35ebe7e319",
};

const authApp = getApps().find(app => app.name === 'cms-auth') || initializeApp(cmsAuthConfig, 'cms-auth');
const auth = getAuth(authApp);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email?.endsWith('@nohomeworkproductions.com')) {
        setUser(user);
      } else if (user) {
        signOut(auth);
        setUser(null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ hd: 'nohomeworkproductions.com' });
    try {
      const result = await signInWithPopup(auth, provider);
      if (!result.user.email?.endsWith('@nohomeworkproductions.com')) {
        await signOut(auth);
        throw new Error('Only @nohomeworkproductions.com emails are allowed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

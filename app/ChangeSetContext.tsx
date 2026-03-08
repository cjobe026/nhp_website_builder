'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Change {
  id: string;
  type: 'article' | 'film' | 'cast' | 'event';
  name: string;
  action: 'created' | 'updated' | 'deleted';
  data: any;
  timestamp: number;
}

interface ChangeSetContextType {
  changes: Change[];
  addChange: (change: Omit<Change, 'id' | 'timestamp'>) => void;
  removeChange: (id: string) => void;
  clearChanges: () => void;
  getPendingData: (type: string, id: string) => any | null;
}

const ChangeSetContext = createContext<ChangeSetContextType | undefined>(undefined);

export function ChangeSetProvider({ children }: { children: ReactNode }) {
  const [changes, setChanges] = useState<Change[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('changeSet');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('changeSet', JSON.stringify(changes));
  }, [changes]);

  const addChange = (change: Omit<Change, 'id' | 'timestamp'>) => {
    const newChange: Change = {
      ...change,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setChanges(prev => {
      const filtered = prev.filter(c => !(c.type === change.type && c.data.id === change.data.id));
      return [...filtered, newChange];
    });
  };

  const removeChange = (id: string) => {
    setChanges(prev => prev.filter(c => c.id !== id));
  };

  const clearChanges = () => {
    setChanges([]);
  };

  const getPendingData = (type: string, id: string) => {
    const change = changes.find(c => c.type === type && c.data.id === id);
    return change ? change.data : null;
  };

  return (
    <ChangeSetContext.Provider value={{ changes, addChange, removeChange, clearChanges, getPendingData }}>
      {children}
    </ChangeSetContext.Provider>
  );
}

export function useChangeSet() {
  const context = useContext(ChangeSetContext);
  if (!context) {
    throw new Error('useChangeSet must be used within ChangeSetProvider');
  }
  return context;
}

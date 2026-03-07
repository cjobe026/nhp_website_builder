'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface Change {
  id: string;
  type: 'article' | 'film' | 'cast';
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
}

const ChangeSetContext = createContext<ChangeSetContextType | undefined>(undefined);

export function ChangeSetProvider({ children }: { children: ReactNode }) {
  const [changes, setChanges] = useState<Change[]>([]);

  const addChange = (change: Omit<Change, 'id' | 'timestamp'>) => {
    const newChange: Change = {
      ...change,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setChanges(prev => [...prev, newChange]);
  };

  const removeChange = (id: string) => {
    setChanges(prev => prev.filter(c => c.id !== id));
  };

  const clearChanges = () => {
    setChanges([]);
  };

  return (
    <ChangeSetContext.Provider value={{ changes, addChange, removeChange, clearChanges }}>
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

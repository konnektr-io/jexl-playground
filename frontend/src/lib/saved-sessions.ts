import { useState, useEffect, useCallback } from 'react';

// Types
export interface SavedSession {
  id: string;
  name: string;
  description?: string;
  expression: string;
  context: string; // JSON string
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

// Auto-save session interface
export interface AutoSaveSession {
  expression: string;
  context: string;
  lastSaved: Date;
}

interface SavedSessionsData {
  sessions: SavedSession[];
  metadata: {
    version: string;
    lastCleanup: Date;
  };
}

// Constants
const STORAGE_KEY = 'jexl-playground-sessions';
const AUTO_SAVE_KEY = 'jexl-playground-auto-save';
const STORAGE_VERSION = '1.0';

// Utility functions
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getStorageData = (): SavedSessionsData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const defaultData: SavedSessionsData = {
        sessions: [],
        metadata: {
          version: STORAGE_VERSION,
          lastCleanup: new Date(),
        },
      };
      return defaultData;
    }

    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return {
      ...parsed,
      sessions: parsed.sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
      })),
      metadata: {
        ...parsed.metadata,
        lastCleanup: new Date(parsed.metadata.lastCleanup),
      },
    };
  } catch (error) {
    console.error('Error reading saved sessions from localStorage:', error);
    return {
      sessions: [],
      metadata: {
        version: STORAGE_VERSION,
        lastCleanup: new Date(),
      },
    };
  }
};

const setStorageData = (data: SavedSessionsData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving sessions to localStorage:', error);
  }
};

// Auto-save utility functions
const getAutoSaveSession = (): AutoSaveSession | null => {
  try {
    const stored = localStorage.getItem(AUTO_SAVE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      lastSaved: new Date(parsed.lastSaved),
    };
  } catch (error) {
    console.error('Error reading auto-save session from localStorage:', error);
    return null;
  }
};

const setAutoSaveSession = (expression: string, context: string): void => {
  try {
    const autoSave: AutoSaveSession = {
      expression,
      context,
      lastSaved: new Date(),
    };
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(autoSave));
  } catch (error) {
    console.error('Error saving auto-save session to localStorage:', error);
  }
};

// Hook
export const useSavedSessions = () => {
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const data = getStorageData();
    setSessions(data.sessions);
    setLoading(false);
  }, []);

  // Save session
  const saveSession = useCallback((
    name: string,
    expression: string,
    context: string,
    description?: string,
    tags?: string[]
  ): SavedSession => {
    const newSession: SavedSession = {
      id: generateId(),
      name,
      description,
      expression,
      context,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags,
    };

    setSessions(prev => {
      const updated = [newSession, ...prev];
      const data = getStorageData();
      data.sessions = updated;
      setStorageData(data);
      return updated;
    });

    return newSession;
  }, []);

  // Load session
  const loadSession = useCallback((sessionId: string): SavedSession | null => {
    const session = sessions.find(s => s.id === sessionId);
    return session || null;
  }, [sessions]);

  // Delete session
  const deleteSession = useCallback((sessionId: string): void => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      const data = getStorageData();
      data.sessions = updated;
      setStorageData(data);
      return updated;
    });
  }, []);

  // Update session
  const updateSession = useCallback((
    sessionId: string,
    updates: Partial<Omit<SavedSession, 'id' | 'createdAt'>>
  ): void => {
    setSessions(prev => {
      const updated = prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...updates, updatedAt: new Date() }
          : session
      );
      const data = getStorageData();
      data.sessions = updated;
      setStorageData(data);
      return updated;
    });
  }, []);

  // Get recent sessions (last 5)
  const getRecentSessions = useCallback((): SavedSession[] => {
    return sessions
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5);
  }, [sessions]);

  // Auto-save current session
  const autoSaveSession = useCallback((expression: string, context: string): void => {
    setAutoSaveSession(expression, context);
  }, []);

  // Get auto-saved session
  const getAutoSavedSession = useCallback((): AutoSaveSession | null => {
    return getAutoSaveSession();
  }, []);

  return {
    sessions,
    loading,
    saveSession,
    loadSession,
    deleteSession,
    updateSession,
    getRecentSessions,
    autoSaveSession,
    getAutoSavedSession,
  };
};

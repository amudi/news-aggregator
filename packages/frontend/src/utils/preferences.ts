export interface UserPreferences {
  states: string[];
  topics: string[];
}

const STORAGE_KEY = 'news-preferences';

export const defaultPreferences: UserPreferences = {
  states: [],
  topics: [],
};

export const preferencesManager = {
  get: (): UserPreferences => {
    // Return default preferences during SSR
    if (typeof window === 'undefined') {
      return defaultPreferences;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  },

  save: (preferences: UserPreferences): void => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear preferences:', error);
    }
  },
};

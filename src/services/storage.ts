// =============================================================
// Ojaswa Growth OS — Storage Service (Repository Pattern)
//
// IMPORTANT: This app uses localStorage for persistence.
// localStorage is tied to the specific browser and device.
// Data is NOT encrypted and is NOT synced across devices.
// Use Export/Import backup to move data between devices.
//
// The repository pattern here means the UI components never
// call localStorage directly. In a future version, replace
// LocalStorageRepository with a Firebase/Supabase implementation.
// =============================================================

import type { AppData } from '../types';
import { DEFAULT_APP_DATA } from '../data/defaults';

const STORAGE_KEY = 'ojaswa-growth-os-v1';

// ------------------------------------------------------------------
// Base Storage Service
// ------------------------------------------------------------------
class StorageService {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  load(): AppData {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return this.initialize();

      const parsed = JSON.parse(raw) as Partial<AppData>;

      // Merge with defaults to handle schema additions
      return {
        ...DEFAULT_APP_DATA,
        ...parsed,
        settings: { ...DEFAULT_APP_DATA.settings, ...parsed.settings },
        templates: parsed.templates?.length ? parsed.templates : DEFAULT_APP_DATA.templates,
        achievements: this.mergeAchievements(parsed.achievements),
      };
    } catch (err) {
      console.error('[StorageService] Failed to load data, reinitializing:', err);
      return this.initialize();
    }
  }

  private mergeAchievements(stored?: AppData['achievements']) {
    if (!stored?.length) return DEFAULT_APP_DATA.achievements;
    // Merge stored unlock state with default achievement definitions
    return DEFAULT_APP_DATA.achievements.map((def) => {
      const existing = stored.find((a) => a.id === def.id);
      return existing ? { ...def, ...existing } : def;
    });
  }

  save(data: AppData): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (err) {
      console.error('[StorageService] Failed to save data:', err);
    }
  }

  initialize(): AppData {
    const data = { ...DEFAULT_APP_DATA, settings: { ...DEFAULT_APP_DATA.settings, sprintStartDate: new Date().toISOString().split('T')[0] } };
    this.save(data);
    return data;
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }

  export(): string {
    return JSON.stringify(this.load(), null, 2);
  }

  import(json: string): AppData | null {
    try {
      const parsed = JSON.parse(json) as Partial<AppData>;
      if (!parsed.version || !Array.isArray(parsed.leads)) {
        throw new Error('Invalid backup format');
      }
      const data: AppData = {
        ...DEFAULT_APP_DATA,
        ...parsed,
        settings: { ...DEFAULT_APP_DATA.settings, ...parsed.settings },
        templates: parsed.templates?.length ? parsed.templates : DEFAULT_APP_DATA.templates,
        achievements: this.mergeAchievements(parsed.achievements),
      };
      this.save(data);
      return data;
    } catch (err) {
      console.error('[StorageService] Import failed:', err);
      return null;
    }
  }
}

export const storageService = new StorageService(STORAGE_KEY);

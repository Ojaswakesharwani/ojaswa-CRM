// =============================================================
// Ojaswa Growth OS — App Context (Global State)
// =============================================================

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';
import type {
  AppData,
  Lead,
  LeadStatus,
  WorkSession,
  DailyGoals,
  AppSettings,
  MessageTemplate,
  KPISnapshot,
  ActivityCategory,
} from '../types';
import { storageService } from '../services/storage';
import { computeKPIs, checkAchievements } from '../utils/kpi';

// ------------------------------------------------------------------
// Context Shape
// ------------------------------------------------------------------
interface AppContextType {
  data: AppData;

  // Leads
  addLead: (lead: Omit<Lead, 'id' | 'activities' | 'statusHistory'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  changeLeadStatus: (id: string, status: LeadStatus, note?: string) => void;
  addLeadNote: (id: string, note: string) => void;

  // Sessions
  addSession: (session: Omit<WorkSession, 'id'>) => void;
  deleteSession: (id: string) => void;

  // Daily Goals
  updateDailyGoals: (date: string, updates: Partial<DailyGoals>) => void;
  getDailyGoals: (date: string) => DailyGoals;

  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void;

  // Templates
  updateTemplate: (id: string, updates: Partial<MessageTemplate>) => void;

  // Data Management
  exportData: () => string;
  importData: (json: string) => boolean;
  clearData: () => void;
  loadDemoData: () => void;
  clearDemoData: () => void;

  // KPIs (computed)
  kpis: KPISnapshot;

  // Sprint info
  sprintDay: number;
  daysRemaining: number;
  currentStreak: number;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function computeSprintDay(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(diff + 1, 1), 30);
}

function computeStreak(sessions: WorkSession[]): number {
  const days = new Set(sessions.map((s) => s.date));
  let streak = 0;
  const d = new Date();
  while (true) {
    const dateStr = d.toISOString().split('T')[0];
    if (days.has(dateStr)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

// ------------------------------------------------------------------
// Provider
// ------------------------------------------------------------------
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => storageService.load());

  const persist = useCallback((updater: (prev: AppData) => AppData) => {
    setData((prev) => {
      const next = updater(prev);
      storageService.save(next);
      return next;
    });
  }, []);

  // --- Leads ---
  const addLead = useCallback((lead: Omit<Lead, 'id' | 'activities' | 'statusHistory'>): Lead => {
    const id = uid();
    const now = new Date().toISOString();
    const newLead: Lead = {
      ...lead,
      id,
      status: lead.status ?? 'YET_TO_SEND',
      statusHistory: [{ status: lead.status ?? 'YET_TO_SEND', timestamp: now }],
      activities: [
        {
          id: uid(),
          type: 'created',
          timestamp: now,
          description: `Lead created for ${lead.companyName}`,
        },
      ],
    };
    persist((prev) => {
      const next = { ...prev, leads: [newLead, ...prev.leads] };
      return { ...next, achievements: checkAchievements(next) };
    });
    return newLead;
  }, [persist]);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    persist((prev) => ({
      ...prev,
      leads: prev.leads.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  }, [persist]);

  const deleteLead = useCallback((id: string) => {
    persist((prev) => ({
      ...prev,
      leads: prev.leads.filter((l) => l.id !== id),
    }));
  }, [persist]);

  const changeLeadStatus = useCallback((id: string, status: LeadStatus, note?: string) => {
    const now = new Date().toISOString();
    persist((prev) => {
      const next = {
        ...prev,
        leads: prev.leads.map((l) => {
          if (l.id !== id) return l;
          const activity = {
            id: uid(),
            type: 'status_change' as const,
            timestamp: now,
            description: note || `Status changed to ${status}`,
            metadata: { from: l.status, to: status },
          };
          return {
            ...l,
            status,
            statusHistory: [...l.statusHistory, { status, timestamp: now }],
            activities: [...l.activities, activity],
          };
        }),
      };
      return { ...next, achievements: checkAchievements(next) };
    });
  }, [persist]);

  const addLeadNote = useCallback((id: string, note: string) => {
    const now = new Date().toISOString();
    persist((prev) => ({
      ...prev,
      leads: prev.leads.map((l) => {
        if (l.id !== id) return l;
        return {
          ...l,
          activities: [
            ...l.activities,
            { id: uid(), type: 'note_added' as const, timestamp: now, description: note },
          ],
        };
      }),
    }));
  }, [persist]);

  // --- Sessions ---
  const addSession = useCallback((session: Omit<WorkSession, 'id'>) => {
    const id = uid();
    persist((prev) => {
      const next = { ...prev, sessions: [{ ...session, id }, ...prev.sessions] };
      return { ...next, achievements: checkAchievements(next) };
    });
  }, [persist]);

  const deleteSession = useCallback((id: string) => {
    persist((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== id),
    }));
  }, [persist]);

  // --- Daily Goals ---
  const getDailyGoals = useCallback((date: string): DailyGoals => {
    return (
      data.dailyGoals.find((g) => g.date === date) ?? {
        date,
        leadsResearched: 0,
        messagesSent: 0,
        followUps: 0,
        calls: 0,
        proposals: 0,
        devHours: 0,
      }
    );
  }, [data.dailyGoals]);

  const updateDailyGoals = useCallback((date: string, updates: Partial<DailyGoals>) => {
    persist((prev) => {
      const existing = prev.dailyGoals.find((g) => g.date === date);
      if (existing) {
        return {
          ...prev,
          dailyGoals: prev.dailyGoals.map((g) =>
            g.date === date ? { ...g, ...updates } : g
          ),
        };
      }
      return {
        ...prev,
        dailyGoals: [
          ...prev.dailyGoals,
          { date, leadsResearched: 0, messagesSent: 0, followUps: 0, calls: 0, proposals: 0, devHours: 0, ...updates },
        ],
      };
    });
  }, [persist]);

  // --- Settings ---
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    persist((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  }, [persist]);

  // --- Templates ---
  const updateTemplate = useCallback((id: string, updates: Partial<MessageTemplate>) => {
    persist((prev) => ({
      ...prev,
      templates: prev.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, [persist]);

  // --- Data Management ---
  const exportData = useCallback((): string => {
    return storageService.export();
  }, []);

  const importData = useCallback((json: string): boolean => {
    const result = storageService.import(json);
    if (result) {
      setData(result);
      return true;
    }
    return false;
  }, []);

  const clearData = useCallback(() => {
    storageService.clear();
    const fresh = storageService.initialize();
    setData(fresh);
  }, []);

  // Demo data loader (clearly labeled, separate from real data)
  const loadDemoData = useCallback(() => {
    persist((prev) => {
      const demoLeads: Lead[] = generateDemoLeads();
      const demoSessions: WorkSession[] = generateDemoSessions();
      return {
        ...prev,
        leads: [...prev.leads.filter((l) => !l.isDemo), ...demoLeads],
        sessions: [...prev.sessions.filter((s) => !s.isDemo), ...demoSessions],
      };
    });
  }, [persist]);

  const clearDemoData = useCallback(() => {
    persist((prev) => ({
      ...prev,
      leads: prev.leads.filter((l) => !l.isDemo),
      sessions: prev.sessions.filter((s) => !s.isDemo),
    }));
  }, [persist]);

  // --- Computed ---
  const kpis = computeKPIs(data);
  const sprintDay = computeSprintDay(data.settings.sprintStartDate);
  const daysRemaining = Math.max(0, 30 - sprintDay + 1);
  const currentStreak = computeStreak(data.sessions);

  return (
    <AppContext.Provider
      value={{
        data,
        addLead,
        updateLead,
        deleteLead,
        changeLeadStatus,
        addLeadNote,
        addSession,
        deleteSession,
        updateDailyGoals,
        getDailyGoals,
        updateSettings,
        updateTemplate,
        exportData,
        importData,
        clearData,
        loadDemoData,
        clearDemoData,
        kpis,
        sprintDay,
        daysRemaining,
        currentStreak,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ------------------------------------------------------------------
// Demo Data Generators
// ------------------------------------------------------------------
function demoUid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function generateDemoLeads(): Lead[] {
  const statuses: LeadStatus[] = ['SENT', 'REPLIED', 'INTERESTED', 'PROPOSAL', 'WON', 'LOST', 'YET_TO_SEND'];
  const sources = ['LinkedIn', 'Google Play', 'Clutch', 'Cold Email'];
  const services = ['Android Bug Fix', 'API/Firebase Integration', 'Feature Development'];

  return Array.from({ length: 12 }, (_, i) => {
    const status = statuses[i % statuses.length];
    const now = new Date().toISOString();
    return {
      id: `demo-${i}`,
      companyName: ['TechNova Inc', 'AppVentures', 'CodeCraft Ltd', 'MobilePro', 'StartupX', 'DataDriven', 'SwiftApp', 'NexGen Solutions', 'PeakApps', 'ByteWave', 'CloudMobile', 'DevHive'][i],
      companyType: 'Agency',
      website: `https://example${i}.com`,
      androidApp: '',
      industry: ['FinTech', 'EdTech', 'HealthTech', 'E-commerce', 'SaaS', 'Logistics'][i % 6],
      country: 'India',
      city: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad'][i % 4],
      contactPerson: ['Rahul Sharma', 'Priya Nair', 'Amit Patel', 'Sneha Gupta', 'Vikram Singh', 'Deepa Krishnan', 'Arjun Mehta', 'Kavya Reddy', 'Rohan Das', 'Anjali Verma', 'Karan Joshi', 'Nisha Agarwal'][i],
      contactRole: ['CTO', 'Founder', 'Product Manager', 'CEO'][i % 4],
      linkedinUrl: '',
      email: `contact@example${i}.com`,
      whatsapp: '',
      phone: '',
      whyThisLead: 'Strong product with Android quality issues',
      potentialProblem: 'App crashes and performance issues',
      recommendedService: services[i % services.length],
      personalizationLine: 'Noticed your app has 2.8 stars on Play Store',
      leadSource: sources[i % sources.length],
      serviceInterest: services[i % services.length],
      dateAdded: daysAgo(20 - i),
      dateContacted: status !== 'YET_TO_SEND' ? daysAgo(15 - i) : '',
      nextFollowUp: daysAgo(-2 + i),
      status,
      statusHistory: [{ status, timestamp: now }],
      dealValue: status === 'WON' ? [15000, 25000, 35000][i % 3] : 0,
      notes: 'Demo lead — not real data',
      activities: [{ id: demoUid(), type: 'created', timestamp: now, description: '[DEMO] Lead created' }],
      isDemo: true,
    };
  });
}

function generateDemoSessions(): WorkSession[] {
  return Array.from({ length: 14 }, (_, i) => ({
    id: `demo-session-${i}`,
    date: daysAgo(i),
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    duration: Math.floor(Math.random() * 240 + 60),
    category: ['Lead Research', 'Outreach', 'Development', 'Calls'][i % 4] as ActivityCategory,
    notes: '[DEMO] Demo work session',
    type: 'manual' as const,
    isDemo: true,
  }));
}

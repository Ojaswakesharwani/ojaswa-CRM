// =============================================================
// Ojaswa Growth OS — Core Type Definitions
// =============================================================

export type LeadStatus =
  | 'YET_TO_SEND'
  | 'SENT'
  | 'REPLIED'
  | 'INTERESTED'
  | 'CALL'
  | 'PROPOSAL'
  | 'ACCEPTED'
  | 'NOT_ACCEPTED'
  | 'WON'
  | 'LOST';

export type LeadSource =
  | 'LinkedIn'
  | 'Google Play'
  | 'Clutch'
  | 'Upwork'
  | 'Contra'
  | 'Referral'
  | 'Website'
  | 'Cold Email'
  | 'WhatsApp'
  | 'Other';

export type ServiceInterest =
  | 'Android Bug Fix'
  | 'API/Firebase Integration'
  | 'Feature Development'
  | 'Build/Gradle Fix'
  | 'Play Store/Release Support'
  | 'Android Maintenance'
  | 'Other';

export type ActivityCategory =
  | 'Lead Research'
  | 'Outreach'
  | 'Client Work'
  | 'Development'
  | 'Learning'
  | 'Portfolio'
  | 'Calls'
  | 'Admin'
  | 'Other';

// ------------------------------------------------------------------
// Lead
// ------------------------------------------------------------------
export interface LeadActivity {
  id: string;
  type:
    | 'status_change'
    | 'note_added'
    | 'contacted'
    | 'replied'
    | 'call'
    | 'proposal'
    | 'won'
    | 'lost'
    | 'created';
  timestamp: string; // ISO
  description: string;
  metadata?: Record<string, unknown>;
}

export interface Lead {
  id: string;
  // Company
  companyName: string;
  companyType: string;
  website: string;
  androidApp: string;
  industry: string;
  country: string;
  city: string;
  // Contact
  contactPerson: string;
  contactRole: string;
  linkedinUrl: string;
  email: string;
  whatsapp: string;
  phone: string;
  // Opportunity
  whyThisLead: string;
  potentialProblem: string;
  recommendedService: ServiceInterest | string;
  personalizationLine: string;
  // Outreach
  leadSource: LeadSource | string;
  serviceInterest: ServiceInterest | string;
  dateAdded: string; // ISO date
  dateContacted: string;
  nextFollowUp: string;
  // Status
  status: LeadStatus;
  statusHistory: { status: LeadStatus; timestamp: string }[];
  // Deal
  dealValue: number;
  notes: string;
  // Activity log (timeline)
  activities: LeadActivity[];
  // Demo flag
  isDemo?: boolean;
}

// ------------------------------------------------------------------
// Activity / Time Tracking
// ------------------------------------------------------------------
export interface WorkSession {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  startTime: string; // ISO
  endTime: string; // ISO
  duration: number; // minutes
  category: ActivityCategory;
  notes: string;
  type: 'session' | 'manual';
  isDemo?: boolean;
}

// ------------------------------------------------------------------
// Daily Goals
// ------------------------------------------------------------------
export interface DailyGoals {
  date: string; // YYYY-MM-DD
  leadsResearched: number;
  messagesSent: number;
  followUps: number;
  calls: number;
  proposals: number;
  devHours: number;
}

export interface DailyTargets {
  leadsResearched: number;
  messagesSent: number;
  followUps: number;
  calls: number;
  proposals: number;
  devHours: number;
}

// ------------------------------------------------------------------
// Settings
// ------------------------------------------------------------------
export type Theme = 'light' | 'dark' | 'system';

export interface AppSettings {
  profileName: string;
  dailyLeadTarget: number;
  dailyOutreachTarget: number;
  dailyFollowUpTarget: number;
  dailyHourTarget: number;
  revenueTarget: number;
  sprintStartDate: string; // YYYY-MM-DD
  theme: Theme;
  dailyTargets: DailyTargets;
}

// ------------------------------------------------------------------
// Templates
// ------------------------------------------------------------------
export type TemplateType =
  | 'Agency Outreach'
  | 'Founder Outreach'
  | 'Follow-up 1'
  | 'Follow-up 2'
  | 'Proposal'
  | 'Meeting Follow-up';

export interface MessageTemplate {
  id: string;
  name: string;
  type: TemplateType;
  content: string;
  variables: string[]; // e.g. ['[Company]', '[Name]']
}

// ------------------------------------------------------------------
// Achievements
// ------------------------------------------------------------------
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string; // ISO timestamp
  unlocked: boolean;
}

// ------------------------------------------------------------------
// Root App State (stored as a versioned blob)
// ------------------------------------------------------------------
export interface AppData {
  version: string;
  leads: Lead[];
  sessions: WorkSession[];
  dailyGoals: DailyGoals[];
  settings: AppSettings;
  templates: MessageTemplate[];
  achievements: Achievement[];
}

// ------------------------------------------------------------------
// KPI Computed Values (not persisted)
// ------------------------------------------------------------------
export interface KPISnapshot {
  totalLeads: number;
  leadsSent: number;
  replies: number;
  interested: number;
  accepted: number;
  rejected: number;
  calls: number;
  proposals: number;
  dealsWon: number;
  revenue: number;
  target: number;
  remaining: number;
  revenueProgressPct: number;
  dealConversionPct: number;
  replyRatePct: number;
  acceptanceRatePct: number;
  averageDealValue: number;
  leadsPerDeal: number;
}

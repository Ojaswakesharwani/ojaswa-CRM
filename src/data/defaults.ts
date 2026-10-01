// =============================================================
// Ojaswa Growth OS — Default Data Initializers
// =============================================================

import type {
  AppData,
  AppSettings,
  MessageTemplate,
  Achievement,
  DailyTargets,
} from '../types';

export const DEFAULT_TARGETS: DailyTargets = {
  leadsResearched: 50,
  messagesSent: 30,
  followUps: 10,
  calls: 3,
  proposals: 2,
  devHours: 5,
};

export const DEFAULT_SETTINGS: AppSettings = {
  profileName: 'Ojaswa',
  dailyLeadTarget: 50,
  dailyOutreachTarget: 30,
  dailyFollowUpTarget: 10,
  dailyHourTarget: 5,
  revenueTarget: 100000,
  sprintStartDate: new Date().toISOString().split('T')[0],
  theme: 'system',
  dailyTargets: DEFAULT_TARGETS,
};

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Agency Outreach',
    type: 'Agency Outreach',
    content: `Hi [Name],

I came across [Company] on [Platform] and was genuinely impressed by your Android portfolio.

I noticed [Problem] — something I specialize in fixing. I've helped similar agencies [Result].

Would you be open to a quick 15-minute call to explore if I can add value?

[Portfolio]`,
    variables: ['[Name]', '[Company]', '[Platform]', '[Problem]', '[Result]', '[Portfolio]'],
  },
  {
    id: 'tpl-2',
    name: 'Founder Outreach',
    type: 'Founder Outreach',
    content: `Hi [Name],

Found [Company] while looking for [Industry] apps on [Platform]. Your product looks solid — I noticed [Problem].

I'm an Android developer specializing in [Service]. I've solved exactly this type of issue for other founders.

Happy to do a free audit if you're interested.

[Portfolio] | [GitHub]`,
    variables: ['[Name]', '[Company]', '[Industry]', '[Platform]', '[Problem]', '[Service]', '[Portfolio]', '[GitHub]'],
  },
  {
    id: 'tpl-3',
    name: 'Follow-up 1',
    type: 'Follow-up 1',
    content: `Hi [Name],

Just following up on my message from a few days ago. I know your inbox is busy.

Still happy to help [Company] with [Problem] — no pressure.

Let me know if there's a better time.`,
    variables: ['[Name]', '[Company]', '[Problem]'],
  },
  {
    id: 'tpl-4',
    name: 'Follow-up 2',
    type: 'Follow-up 2',
    content: `Hi [Name],

One last nudge — I'll leave you alone after this!

I put together a quick note on how I'd approach [Problem] for [Company]. Happy to share if you're curious.

No obligation, just want to be useful.`,
    variables: ['[Name]', '[Company]', '[Problem]'],
  },
  {
    id: 'tpl-5',
    name: 'Proposal',
    type: 'Proposal',
    content: `Hi [Name],

Great talking earlier. Here's what I'm proposing for [Company]:

Problem: [Problem]
Solution: [Service]
Timeline: [Timeline]
Investment: [Price]

I've handled similar projects — [Portfolio]

Let me know if you'd like to move forward.`,
    variables: ['[Name]', '[Company]', '[Problem]', '[Service]', '[Timeline]', '[Price]', '[Portfolio]'],
  },
  {
    id: 'tpl-6',
    name: 'Meeting Follow-up',
    type: 'Meeting Follow-up',
    content: `Hi [Name],

Thanks for the time today! Really enjoyed learning about [Company].

As discussed: [Summary]

Next step: [NextStep]

I'll follow up by [Date].`,
    variables: ['[Name]', '[Company]', '[Summary]', '[NextStep]', '[Date]'],
  },
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach-1', title: 'First Lead', description: 'Added your first lead', icon: '🎯', unlocked: false },
  { id: 'ach-2', title: '10 Leads', description: 'Added 10 leads', icon: '📋', unlocked: false },
  { id: 'ach-3', title: '50 Leads', description: 'Added 50 leads', icon: '🚀', unlocked: false },
  { id: 'ach-4', title: '100 Leads', description: 'Added 100 leads', icon: '💯', unlocked: false },
  { id: 'ach-5', title: 'First Reply', description: 'Got your first reply', icon: '💬', unlocked: false },
  { id: 'ach-6', title: 'First Call', description: 'Booked your first call', icon: '📞', unlocked: false },
  { id: 'ach-7', title: 'First Proposal', description: 'Sent your first proposal', icon: '📄', unlocked: false },
  { id: 'ach-8', title: 'First Deal', description: 'Closed your first deal', icon: '🤝', unlocked: false },
  { id: 'ach-9', title: '₹10K Revenue', description: 'Earned ₹10,000 in revenue', icon: '💰', unlocked: false },
  { id: 'ach-10', title: '₹50K Revenue', description: 'Earned ₹50,000 in revenue', icon: '💎', unlocked: false },
  { id: 'ach-11', title: '₹1L Revenue', description: 'Hit ₹1,00,000 in revenue', icon: '🏆', unlocked: false },
  { id: 'ach-12', title: '7-Day Streak', description: 'Active 7 days in a row', icon: '🔥', unlocked: false },
  { id: 'ach-13', title: '30-Day Completion', description: 'Completed the 30-day sprint', icon: '⚡', unlocked: false },
];

export const DEFAULT_APP_DATA: AppData = {
  version: '1.0.0',
  leads: [],
  sessions: [],
  dailyGoals: [],
  settings: DEFAULT_SETTINGS,
  templates: DEFAULT_TEMPLATES,
  achievements: DEFAULT_ACHIEVEMENTS,
};

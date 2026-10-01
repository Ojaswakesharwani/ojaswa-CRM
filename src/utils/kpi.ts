// =============================================================
// Ojaswa Growth OS — KPI & Achievement Computation Utilities
// =============================================================

import type { AppData, KPISnapshot, Achievement } from '../types';

export function computeKPIs(data: AppData): KPISnapshot {
  const leads = data.leads;
  const target = data.settings.revenueTarget;

  const totalLeads = leads.length;
  const leadsSent = leads.filter((l) =>
    ['SENT', 'REPLIED', 'INTERESTED', 'CALL', 'PROPOSAL', 'ACCEPTED', 'NOT_ACCEPTED', 'WON', 'LOST'].includes(l.status)
  ).length;
  const replies = leads.filter((l) =>
    ['REPLIED', 'INTERESTED', 'CALL', 'PROPOSAL', 'ACCEPTED', 'NOT_ACCEPTED', 'WON'].includes(l.status)
  ).length;
  const interested = leads.filter((l) =>
    ['INTERESTED', 'CALL', 'PROPOSAL', 'ACCEPTED', 'WON'].includes(l.status)
  ).length;
  const accepted = leads.filter((l) => l.status === 'ACCEPTED' || l.status === 'WON').length;
  const rejected = leads.filter((l) => l.status === 'NOT_ACCEPTED' || l.status === 'LOST').length;
  const calls = leads.filter((l) =>
    ['CALL', 'PROPOSAL', 'ACCEPTED', 'WON'].includes(l.status)
  ).length;
  const proposals = leads.filter((l) =>
    ['PROPOSAL', 'ACCEPTED', 'WON'].includes(l.status)
  ).length;
  const dealsWon = leads.filter((l) => l.status === 'WON').length;

  const revenue = leads
    .filter((l) => l.status === 'WON')
    .reduce((sum, l) => sum + (l.dealValue || 0), 0);

  const remaining = Math.max(0, target - revenue);
  const revenueProgressPct = target > 0 ? Math.min(100, (revenue / target) * 100) : 0;
  const dealConversionPct = leadsSent > 0 ? (dealsWon / leadsSent) * 100 : 0;
  const replyRatePct = leadsSent > 0 ? (replies / leadsSent) * 100 : 0;
  const acceptanceRatePct = proposals > 0 ? (accepted / proposals) * 100 : 0;
  const averageDealValue = dealsWon > 0 ? revenue / dealsWon : 0;
  const leadsPerDeal = dealsWon > 0 ? totalLeads / dealsWon : 0;

  return {
    totalLeads,
    leadsSent,
    replies,
    interested,
    accepted,
    rejected,
    calls,
    proposals,
    dealsWon,
    revenue,
    target,
    remaining,
    revenueProgressPct,
    dealConversionPct,
    replyRatePct,
    acceptanceRatePct,
    averageDealValue,
    leadsPerDeal,
  };
}

export function checkAchievements(data: AppData): Achievement[] {
  const leads = data.leads.filter((l) => !l.isDemo);
  const sessions = data.sessions.filter((s) => !s.isDemo);
  const wonLeads = leads.filter((l) => l.status === 'WON');
  const revenue = wonLeads.reduce((sum, l) => sum + (l.dealValue || 0), 0);

  return data.achievements.map((ach) => {
    if (ach.unlocked) return ach;

    let shouldUnlock = false;
    switch (ach.id) {
      case 'ach-1': shouldUnlock = leads.length >= 1; break;
      case 'ach-2': shouldUnlock = leads.length >= 10; break;
      case 'ach-3': shouldUnlock = leads.length >= 50; break;
      case 'ach-4': shouldUnlock = leads.length >= 100; break;
      case 'ach-5':
        shouldUnlock = leads.some((l) =>
          ['REPLIED', 'INTERESTED', 'CALL', 'PROPOSAL', 'ACCEPTED', 'WON'].includes(l.status)
        );
        break;
      case 'ach-6':
        shouldUnlock = leads.some((l) =>
          ['CALL', 'PROPOSAL', 'ACCEPTED', 'WON'].includes(l.status)
        );
        break;
      case 'ach-7':
        shouldUnlock = leads.some((l) =>
          ['PROPOSAL', 'ACCEPTED', 'WON'].includes(l.status)
        );
        break;
      case 'ach-8': shouldUnlock = wonLeads.length >= 1; break;
      case 'ach-9': shouldUnlock = revenue >= 10000; break;
      case 'ach-10': shouldUnlock = revenue >= 50000; break;
      case 'ach-11': shouldUnlock = revenue >= 100000; break;
      case 'ach-12': {
        const days = new Set(sessions.map((s) => s.date));
        let streak = 0;
        const d = new Date();
        while (days.has(d.toISOString().split('T')[0]) && streak < 7) {
          streak++;
          d.setDate(d.getDate() - 1);
        }
        shouldUnlock = streak >= 7;
        break;
      }
      case 'ach-13': {
        const start = new Date(data.settings.sprintStartDate);
        const diff = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
        shouldUnlock = diff >= 29;
        break;
      }
    }

    if (shouldUnlock) {
      return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() };
    }
    return ach;
  });
}

export function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatINRFull(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function pct(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getRevenueByDate(leads: AppData['leads']): { date: string; revenue: number; cumulative: number }[] {
  const wonLeads = leads.filter((l) => l.status === 'WON' && l.dealValue > 0);
  const byDate: Record<string, number> = {};

  wonLeads.forEach((l) => {
    // Use last status timestamp for WON
    const wonEntry = [...l.statusHistory].reverse().find((s) => s.status === 'WON');
    const date = wonEntry ? wonEntry.timestamp.split('T')[0] : l.dateAdded;
    byDate[date] = (byDate[date] || 0) + l.dealValue;
  });

  const sorted = Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0]));
  let cumulative = 0;
  return sorted.map(([date, revenue]) => {
    cumulative += revenue;
    return { date, revenue, cumulative };
  });
}

export function getLeadsBySource(leads: AppData['leads']) {
  const sources: Record<string, { leads: number; sent: number; replies: number; interested: number; won: number; revenue: number }> = {};

  leads.filter((l) => !l.isDemo).forEach((l) => {
    const src = l.leadSource || 'Other';
    if (!sources[src]) sources[src] = { leads: 0, sent: 0, replies: 0, interested: 0, won: 0, revenue: 0 };
    sources[src].leads++;
    if (['SENT', 'REPLIED', 'INTERESTED', 'CALL', 'PROPOSAL', 'ACCEPTED', 'WON'].includes(l.status)) sources[src].sent++;
    if (['REPLIED', 'INTERESTED', 'CALL', 'PROPOSAL', 'ACCEPTED', 'WON'].includes(l.status)) sources[src].replies++;
    if (['INTERESTED', 'CALL', 'PROPOSAL', 'ACCEPTED', 'WON'].includes(l.status)) sources[src].interested++;
    if (l.status === 'WON') { sources[src].won++; sources[src].revenue += l.dealValue || 0; }
  });

  return Object.entries(sources).map(([source, stats]) => ({ source, ...stats }));
}

export function getLeadsByService(leads: AppData['leads']) {
  const services: Record<string, { leads: number; replies: number; deals: number; revenue: number }> = {};

  leads.filter((l) => !l.isDemo).forEach((l) => {
    const svc = l.serviceInterest || 'Other';
    if (!services[svc]) services[svc] = { leads: 0, replies: 0, deals: 0, revenue: 0 };
    services[svc].leads++;
    if (['REPLIED', 'INTERESTED', 'CALL', 'PROPOSAL', 'ACCEPTED', 'WON'].includes(l.status)) services[svc].replies++;
    if (l.status === 'WON') { services[svc].deals++; services[svc].revenue += l.dealValue || 0; }
  });

  return Object.entries(services).map(([service, stats]) => ({ service, ...stats }));
}

// =============================================================
// Dashboard Page
// =============================================================
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Hero3D } from '../components/Hero3D';
import { KPICards, RevenueRing } from '../components/KPICards';
import { useApp } from '../context/AppContext';
import { Plus, AlertCircle, CheckSquare, ChevronRight, Flame } from 'lucide-react';
import { AddLeadModal } from '../components/AddLeadModal';
import { useNavigate } from 'react-router-dom';

function TodayPanel() {
  const { data, getDailyGoals, updateDailyGoals } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const goals = getDailyGoals(today);
  const targets = data.settings.dailyTargets;

  const items = [
    { key: 'leadsResearched' as const, label: 'Leads Researched', current: goals.leadsResearched, target: targets.leadsResearched, color: '#10b981' },
    { key: 'messagesSent' as const, label: 'Messages Sent', current: goals.messagesSent, target: targets.messagesSent, color: '#6366f1' },
    { key: 'followUps' as const, label: 'Follow-ups', current: goals.followUps, target: targets.followUps, color: '#f59e0b' },
    { key: 'calls' as const, label: 'Calls', current: goals.calls, target: targets.calls, color: '#ea580c' },
    { key: 'devHours' as const, label: 'Focus Hours', current: goals.devHours, target: targets.devHours, color: '#3b82f6' },
  ];

  const firstIncomplete = items.find((i) => i.current < i.target);

  const increment = (key: typeof items[0]['key']) => {
    updateDailyGoals(today, { [key]: (goals[key] as number) + 1 });
  };

  return (
    <div className="card">
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
          Today's Mission
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item) => {
          const pct = Math.min((item.current / item.target) * 100, 100);
          const done = item.current >= item.target;
          return (
            <div key={item.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {done && <CheckSquare size={12} color="var(--color-accent)" />}
                  <span style={{ fontSize: 13, fontWeight: 500, color: done ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                    {item.label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                    {item.current} / {item.target}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => increment(item.key)}
                    aria-label={`Increment ${item.label}`}
                    style={{ fontSize: 16, lineHeight: 1, padding: '2px 6px', fontWeight: 700 }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%`, background: item.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {firstIncomplete && (
        <div style={{
          marginTop: 16,
          padding: '10px 12px',
          background: 'var(--color-surface-2)',
          borderRadius: 8,
          borderLeft: '2px solid var(--color-accent)',
          fontSize: 12,
          color: 'var(--color-text-secondary)',
        }}>
          <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>Next: </span>
          {firstIncomplete.target - firstIncomplete.current} {firstIncomplete.label.toLowerCase()} remaining today
        </div>
      )}
    </div>
  );
}

function FollowUpWidget() {
  const { data } = useApp();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const overdue = data.leads.filter((l) => l.nextFollowUp && l.nextFollowUp < today && !['WON', 'LOST'].includes(l.status));
  const dueToday = data.leads.filter((l) => l.nextFollowUp === today);
  const dueTomorrow = data.leads.filter((l) => l.nextFollowUp === tomorrow);

  const items = [
    { label: 'Overdue', leads: overdue, color: '#ef4444', urgent: true },
    { label: 'Due Today', leads: dueToday, color: '#f59e0b', urgent: false },
    { label: 'Tomorrow', leads: dueTomorrow, color: '#3b82f6', urgent: false },
  ];

  return (
    <div className="card">
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Follow-ups
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads?tab=followups')}>
          View All <ChevronRight size={12} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {items.map((item) => (
          <div key={item.label} style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 8,
            background: `${item.color}10`,
            border: `1px solid ${item.color}20`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.leads.length}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: item.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {overdue.slice(0, 3).map((lead) => (
        <div
          key={lead.id}
          onClick={() => navigate(`/leads/${lead.id}`)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 10px',
            borderRadius: 6,
            cursor: 'pointer',
            marginBottom: 4,
            background: 'rgba(239,68,68,0.04)',
            border: '1px solid rgba(239,68,68,0.1)',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{lead.companyName}</div>
            <div style={{ fontSize: 11, color: '#ef4444' }}>Overdue: {lead.nextFollowUp}</div>
          </div>
          <AlertCircle size={14} color="#ef4444" style={{ animation: 'pulse 2s infinite' }} />
        </div>
      ))}

      {overdue.length === 0 && dueToday.length === 0 && dueTomorrow.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
          No follow-ups scheduled.
        </div>
      )}
    </div>
  );
}

function ExecutionScore() {
  const { data, kpis, currentStreak } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const sessions = data.sessions.filter((s) => !s.isDemo && s.date === today);
  const totalMinutesToday = sessions.reduce((sum, s) => sum + s.duration, 0);
  const hoursToday = totalMinutesToday / 60;
  const targets = data.settings.dailyTargets;

  // Score dimensions (0-100 each, from real data only)
  const todayGoals = data.dailyGoals.find((g) => g.date === today);
  const dims = [
    { label: 'Leads', score: todayGoals ? Math.min((todayGoals.leadsResearched / targets.leadsResearched) * 100, 100) : 0 },
    { label: 'Outreach', score: todayGoals ? Math.min((todayGoals.messagesSent / targets.messagesSent) * 100, 100) : 0 },
    { label: 'Follow-ups', score: todayGoals ? Math.min((todayGoals.followUps / targets.followUps) * 100, 100) : 0 },
    { label: 'Focus', score: Math.min((hoursToday / targets.devHours) * 100, 100) },
    { label: 'Revenue', score: kpis.revenueProgressPct },
    { label: 'Pipeline', score: Math.min(kpis.totalLeads > 0 ? (kpis.leadsSent / Math.max(kpis.totalLeads, 1)) * 100 : 0, 100) },
  ];
  const overall = Math.round(dims.reduce((sum, d) => sum + d.score, 0) / dims.length);

  return (
    <div className="card">
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
          Execution Score
        </div>
        <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
          Based on real recorded activity
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: `conic-gradient(#10b981 ${overall * 3.6}deg, var(--color-surface-3) 0)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--color-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>{overall}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-accent)', letterSpacing: '-0.02em' }}>
              <Flame size={16} style={{ display: 'inline', marginBottom: -3 }} />
              {' '}{currentStreak}
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Day Streak</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              {hoursToday.toFixed(1)}h
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Today</div>
          </div>
        </div>
      </div>

      {dims.map((d) => (
        <div key={d.label} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{d.label}</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)' }}>
              {Math.round(d.score)}%
            </span>
          </div>
          <div className="progress-bar" style={{ height: 4 }}>
            <div className="progress-fill" style={{ width: `${d.score}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const [showAdd, setShowAdd] = React.useState(false);
  const { sprintDay, daysRemaining } = useApp();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pageRef.current) return;
    const cards = pageRef.current.querySelectorAll('.kpi-card, .card');
    gsap.fromTo(
      cards,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.04, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  return (
    <div ref={pageRef}>
      {/* Hero */}
      <div className="hero-section">
        <div className="hero-bg-grid" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-eyebrow">// growth_os.init() · Sprint active</div>
          <h1 className="hero-title">
            30 DAYS. <span>1 LAKH.</span><br />
            BUILD THE PIPELINE.
          </h1>
          <p className="hero-subtitle">
            Track every lead, every hour, every conversation and every rupee.
          </p>
          <div className="hero-meta">
            <div className="hero-meta-item">
              <div className="hero-meta-label">Today</div>
              <div className="hero-meta-value">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
            </div>
            <div className="hero-meta-item">
              <div className="hero-meta-label">Sprint Day</div>
              <div className="hero-meta-value accent">{sprintDay} / 30</div>
            </div>
            <div className="hero-meta-item">
              <div className="hero-meta-label">Days Left</div>
              <div className="hero-meta-value">{daysRemaining}</div>
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <button className="btn btn-accent" onClick={() => setShowAdd(true)} id="add-lead-btn">
              <Plus size={15} /> Add Lead
            </button>
          </div>
        </div>
        {/* 3D Canvas */}
        <div className="hero-3d-canvas">
          <Hero3D />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="section">
        <KPICards />
      </div>

      {/* Bottom grid: Today + Revenue + Followups + Score */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <TodayPanel />
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', alignSelf: 'flex-start' }}>
            Revenue Progress
          </div>
          <RevenueRing />
        </div>
        <FollowUpWidget />
        <ExecutionScore />
      </div>

      {showAdd && <AddLeadModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

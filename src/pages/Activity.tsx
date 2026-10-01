// =============================================================
// Activity Page — Focus Timer + Work Sessions + Daily Score
// =============================================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Plus, Trash2, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import type { ActivityCategory, WorkSession } from '../types';

const CATEGORIES: ActivityCategory[] = [
  'Lead Research', 'Outreach', 'Client Work', 'Development',
  'Learning', 'Portfolio', 'Calls', 'Admin', 'Other',
];

// ============================================================
// Simple bar chart
// ============================================================
function BarChart({ data }: { data: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, padding: '0 4px' }}>
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{
              width: '100%',
              maxWidth: 32,
              background: d.color || 'var(--color-accent)',
              borderRadius: '4px 4px 0 0',
              height: `${pct}%`,
              minHeight: 2,
              opacity: pct > 0 ? 1 : 0.2,
              transition: 'height 0.8s cubic-bezier(0.4,0,0.2,1)',
            }} />
            <div style={{ fontSize: 9, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', transform: 'rotate(-30deg)', transformOrigin: 'top center', whiteSpace: 'nowrap' }}>
              {d.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Focus Timer
// ============================================================
function FocusTimer() {
  const { addSession } = useApp();
  const { success } = useToast();
  const [state, setState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [elapsed, setElapsed] = useState(0); // seconds
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [category, setCategory] = useState<ActivityCategory>('Lead Research');
  const [notes, setNotes] = useState('');
  const [showSave, setShowSave] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => setElapsed((e) => e + 1), []);

  useEffect(() => {
    if (state === 'running') {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state, tick]);

  const start = () => {
    if (!startTime) setStartTime(new Date());
    setState('running');
  };

  const pause = () => setState('paused');

  const stop = () => {
    setState('idle');
    setShowSave(true);
  };

  const save = () => {
    if (elapsed < 30 || !startTime) {
      success('Session too short to save (minimum 30 seconds)');
      reset();
      return;
    }
    const endTime = new Date();
    addSession({
      date: startTime.toISOString().split('T')[0],
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: Math.round(elapsed / 60),
      category,
      notes,
      type: 'session',
    });
    success(`Session saved: ${Math.round(elapsed / 60)} min of ${category}`);
    reset();
  };

  const reset = () => {
    setElapsed(0);
    setStartTime(null);
    setShowSave(false);
    setNotes('');
  };

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const progress = Math.min((elapsed / (25 * 60)) * 100, 100); // Pomodoro 25 min
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="card">
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
        Focus Timer
      </div>

      {/* Timer display */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 130, height: 130 }}>
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r="54" fill="none" stroke="var(--color-surface-3)" strokeWidth="8" />
            <circle
              cx="65" cy="65" r="54"
              fill="none"
              stroke={state === 'running' ? '#10b981' : state === 'paused' ? '#f59e0b' : '#6366f1'}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              strokeLinecap="round"
              transform="rotate(-90 65 65)"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
              {fmt(elapsed)}
            </div>
            <div style={{ fontSize: 9, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {state === 'idle' ? 'ready' : state}
            </div>
          </div>
        </div>

        {!showSave ? (
          <>
            <div style={{ display: 'flex', gap: 8 }}>
              {state === 'idle' && (
                <button className="btn btn-accent" onClick={start} id="start-timer-btn">
                  <Play size={14} fill="currentColor" /> Start Session
                </button>
              )}
              {state === 'running' && (
                <>
                  <button className="btn btn-outline" onClick={pause}>
                    <Pause size={14} /> Pause
                  </button>
                  <button className="btn btn-danger" onClick={stop}>
                    <Square size={14} fill="currentColor" /> Stop
                  </button>
                </>
              )}
              {state === 'paused' && (
                <>
                  <button className="btn btn-accent" onClick={start}>
                    <Play size={14} fill="currentColor" /> Resume
                  </button>
                  <button className="btn btn-danger" onClick={stop}>
                    <Square size={14} fill="currentColor" /> Stop
                  </button>
                </>
              )}
            </div>

            <div className="form-group" style={{ width: '100%' }}>
              <label className="form-label">Category</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value as ActivityCategory)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </>
        ) : (
          <div style={{ width: '100%' }}>
            <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 14, textAlign: 'center' }}>
              Save {fmt(elapsed)} of work?
            </div>
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="form-label">Category</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value as ActivityCategory)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">What did you work on?</label>
              <textarea className="form-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Quick description…" autoFocus />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-accent" onClick={save} style={{ flex: 1 }}>Save Session</button>
              <button className="btn btn-ghost" onClick={reset}>Discard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Manual Entry
// ============================================================
function ManualEntry() {
  const { addSession } = useApp();
  const { success } = useToast();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    duration: '',
    category: 'Lead Research' as ActivityCategory,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.duration) return;
    const dur = parseInt(form.duration);
    const start = new Date(`${form.date}T09:00:00`);
    const end = new Date(start.getTime() + dur * 60000);
    addSession({
      date: form.date,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      duration: dur,
      category: form.category,
      notes: form.notes,
      type: 'manual',
    });
    success(`${dur} min of ${form.category} logged`);
    setForm({ date: new Date().toISOString().split('T')[0], duration: '', category: 'Lead Research', notes: '' });
    setShow(false);
  };

  if (!show) return (
    <button className="btn btn-outline btn-sm" onClick={() => setShow(true)}>
      <Plus size={13} /> Manual Entry
    </button>
  );

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Manual Entry</div>
      <form onSubmit={handleSubmit}>
        <div className="grid-2" style={{ marginBottom: 10 }}>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Duration (minutes)</label>
            <input className="form-input" type="number" min={1} value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} placeholder="90" required />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 10 }}>
          <label className="form-label">Category</label>
          <select className="form-select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ActivityCategory }))}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Notes</label>
          <input className="form-input" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="What did you work on?" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-accent btn-sm" type="submit">Log Activity</button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setShow(false)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ============================================================
// Activity Page
// ============================================================
export function ActivityPage() {
  const { data, deleteSession } = useApp();
  const { success } = useToast();
  const [range, setRange] = useState<7 | 14 | 30>(7);

  const realSessions = data.sessions.filter((s) => !s.isDemo);

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Days in range
  const days = Array.from({ length: range }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (range - 1 - i));
    return d.toISOString().split('T')[0];
  });

  const sessionsByDay: Record<string, WorkSession[]> = {};
  days.forEach((d) => { sessionsByDay[d] = []; });
  realSessions.forEach((s) => {
    if (sessionsByDay[s.date] !== undefined) {
      sessionsByDay[s.date].push(s);
    }
  });

  const chartData = days.map((d) => ({
    label: new Date(d).toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 3),
    value: sessionsByDay[d].reduce((sum, s) => sum + s.duration, 0) / 60,
    color: d === today ? 'var(--color-accent)' : 'var(--color-accent-mid)',
  }));

  const totalMinutes = realSessions.reduce((sum, s) => sum + s.duration, 0);
  const todayMinutes = realSessions.filter((s) => s.date === today).reduce((sum, s) => sum + s.duration, 0);
  const weekMinutes = realSessions.filter((s) => {
    const d = new Date(s.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).reduce((sum, s) => sum + s.duration, 0);
  const activeDays = new Set(realSessions.map((s) => s.date)).size;
  const avgHours = activeDays > 0 ? totalMinutes / 60 / activeDays : 0;

  // Best day
  const dayTotals: Record<string, number> = {};
  realSessions.forEach((s) => { dayTotals[s.date] = (dayTotals[s.date] || 0) + s.duration; });
  const bestDay = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity</h1>
          <div className="page-subtitle">// personal effort tracking</div>
        </div>
        <ManualEntry />
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Hours', value: `${(totalMinutes / 60).toFixed(1)}h` },
          { label: 'Today', value: `${(todayMinutes / 60).toFixed(1)}h` },
          { label: 'This Week', value: `${(weekMinutes / 60).toFixed(1)}h` },
          { label: 'Avg / Day', value: `${avgHours.toFixed(1)}h` },
          { label: 'Total Sessions', value: realSessions.length },
          { label: 'Best Day', value: bestDay ? `${(bestDay[1] / 60).toFixed(1)}h` : '—' },
        ].map((stat) => (
          <div key={stat.label} className="kpi-card">
            <div className="kpi-label">{stat.label}</div>
            <div className="kpi-value" style={{ fontSize: 22 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, alignItems: 'start' }}>
        <FocusTimer />

        <div>
          {/* Chart */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Daily Hours
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {([7, 14, 30] as const).map((r) => (
                  <button key={r} className={`filter-chip ${range === r ? 'active' : ''}`} onClick={() => setRange(r)}>
                    {r}d
                  </button>
                ))}
              </div>
            </div>
            <BarChart data={chartData} />
          </div>

          {/* Recent sessions */}
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
              Recent Sessions
            </div>
            {realSessions.length === 0 ? (
              <div className="empty-state" style={{ padding: 24 }}>
                <div className="empty-state-title">No activity recorded yet</div>
                <div className="empty-state-desc">Start a focus session or add a manual entry.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {realSessions.slice(0, 20).map((session) => (
                  <div key={session.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'var(--color-surface-2)',
                  }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'var(--color-accent-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-accent)',
                      flexShrink: 0,
                    }}>
                      <Clock size={14} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 1 }}>{session.category}</div>
                      {session.notes && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.notes}</div>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                      {session.duration}m
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', flexShrink: 0 }}>
                      {session.date}
                    </div>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => { deleteSession(session.id); success('Session removed'); }}
                      aria-label="Delete session"
                      style={{ flexShrink: 0 }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

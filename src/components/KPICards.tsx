// =============================================================
// KPI Cards with animated number counting
// =============================================================
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR, formatINRFull } from '../utils/kpi';
import {
  Users, Send, MessageSquare, Zap, CheckCircle, XCircle,
  Phone, FileText, Trophy, TrendingDown,
  TrendingUp, BarChart2, Star,
} from 'lucide-react';

function useCountUp(target: number, duration = 1200) {
  const [current, setCurrent] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const diff = target - start;
    if (diff === 0) return;

    const startTime = performance.now();
    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(frame);
      else prevRef.current = target;
    };
    requestAnimationFrame(frame);
  }, [target, duration]);

  return current;
}

interface KPICardProps {
  label: string;
  value: number;
  format?: 'number' | 'inr' | 'pct';
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
  trend?: number;
}

function KPICard({ label, value, format = 'number', sub, icon, accent, trend }: KPICardProps) {
  const animated = useCountUp(value);

  const display =
    format === 'inr'
      ? formatINRFull(animated)
      : format === 'pct'
      ? `${animated.toFixed ? animated.toFixed(1) : animated}%`
      : animated.toLocaleString('en-IN');

  return (
    <div
      className="kpi-card"
      style={{ '--kpi-accent': accent || 'var(--color-accent)' } as React.CSSProperties}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="kpi-label">{label}</div>
        <div style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: accent ? `${accent}15` : 'var(--color-accent-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accent || 'var(--color-accent)',
        }}>
          {icon}
        </div>
      </div>
      <div className="kpi-value">{display}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
      {trend !== undefined && (
        <div className={`kpi-trend ${trend >= 0 ? 'up' : 'down'}`}>
          {trend >= 0 ? <TrendingUp size={11} style={{ display: 'inline', marginBottom: -2 }} /> : <TrendingDown size={11} style={{ display: 'inline', marginBottom: -2 }} />}
          {' '}{Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

export function KPICards() {
  const { kpis } = useApp();

  return (
    <div>
      {/* Revenue spotlight */}
      <div className="card" style={{
        background: 'var(--color-charcoal)',
        marginBottom: 16,
        padding: '20px 24px',
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <div style={{ flex: 1, minWidth: 150 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>TARGET</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.03em' }}>₹1,00,000</div>
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--color-accent)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>CURRENT</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-accent)', letterSpacing: '-0.03em' }}>
            {formatINRFull(kpis.revenue)}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>REMAINING</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.03em' }}>
            {formatINRFull(kpis.remaining)}
          </div>
        </div>
        {/* Mini progress bar */}
        <div style={{ flex: '0 0 100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>Revenue Progress</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
              {kpis.revenueProgressPct.toFixed(1)}%
            </span>
          </div>
          <div className="progress-bar" style={{ height: 8, background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="progress-fill"
              style={{ width: `${kpis.revenueProgressPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <KPICard label="Total Leads" value={kpis.totalLeads} icon={<Users size={14} />} />
        <KPICard label="Leads Sent" value={kpis.leadsSent} icon={<Send size={14} />} accent="#3b82f6" />
        <KPICard label="Replies" value={kpis.replies} icon={<MessageSquare size={14} />} accent="#6366f1" />
        <KPICard label="Interested" value={kpis.interested} icon={<Zap size={14} />} accent="#f59e0b" />
        <KPICard label="Accepted" value={kpis.accepted} icon={<CheckCircle size={14} />} accent="#10b981" />
        <KPICard label="Rejected" value={kpis.rejected} icon={<XCircle size={14} />} accent="#ef4444" />
        <KPICard label="Calls" value={kpis.calls} icon={<Phone size={14} />} accent="#ea580c" />
        <KPICard label="Proposals" value={kpis.proposals} icon={<FileText size={14} />} accent="#8b5cf6" />
        <KPICard label="Deals Won" value={kpis.dealsWon} icon={<Trophy size={14} />} accent="#10b981" />
        <KPICard label="Reply Rate" value={parseFloat(kpis.replyRatePct.toFixed(1))} format="pct" icon={<BarChart2 size={14} />} accent="#6366f1" />
        <KPICard label="Conv. Rate" value={parseFloat(kpis.dealConversionPct.toFixed(1))} format="pct" icon={<TrendingUp size={14} />} accent="#10b981" />
        <KPICard label="Avg. Deal" value={Math.round(kpis.averageDealValue)} format="inr" icon={<Star size={14} />} accent="#f59e0b" />
      </div>
    </div>
  );
}

// Revenue Ring Visualization
export function RevenueRing() {
  const { kpis } = useApp();
  const size = 160;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = Math.min(kpis.revenueProgressPct / 100, 1);
  const dashoffset = circumference * (1 - progress);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div className="revenue-ring-container" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-surface-3)"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#10b981"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }}
          />
          {/* Glow */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(16,185,129,0.2)"
            strokeWidth={stroke * 2}
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)', filter: 'blur(4px)' }}
          />
        </svg>
        <div className="revenue-ring-label">
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>
            {kpis.revenueProgressPct.toFixed(0)}%
          </div>
          <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>of goal</div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {formatINRFull(kpis.revenue)}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
          of {formatINR(kpis.target)} target
        </div>
      </div>
    </div>
  );
}

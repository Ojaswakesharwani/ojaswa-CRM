// =============================================================
// Analytics Page — Funnel, Source, Service, Revenue charts
// =============================================================
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getLeadsBySource, getLeadsByService, getRevenueByDate, formatINRFull, formatINR } from '../utils/kpi';

function FunnelBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color }}>
          {count} <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 400 }}>({pct.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="progress-bar" style={{ height: 8 }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: color, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  );
}

function RevenueLineChart({ data }: { data: { date: string; cumulative: number }[] }) {
  if (data.length === 0) return (
    <div className="empty-state" style={{ padding: 40 }}>
      <div className="empty-state-title">No revenue data yet</div>
      <div className="empty-state-desc">Close deals to see revenue over time.</div>
    </div>
  );

  const maxVal = Math.max(...data.map((d) => d.cumulative), 1);
  const W = 500, H = 120, PAD = 20;

  const points = data.map((d, i) => {
    const x = PAD + (i / Math.max(data.length - 1, 1)) * (W - PAD * 2);
    const y = PAD + (1 - d.cumulative / maxVal) * (H - PAD * 2);
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${H - PAD} L ${PAD} ${H - PAD} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
      <defs>
        <linearGradient id="rev-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((pct) => {
        const y = PAD + (1 - pct) * (H - PAD * 2);
        return (
          <g key={pct}>
            <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="var(--color-border)" strokeWidth="1" />
            <text x={PAD - 2} y={y + 4} fontSize="9" fill="var(--color-text-tertiary)" textAnchor="end" fontFamily="var(--font-mono)">
              {formatINR(maxVal * pct)}
            </text>
          </g>
        );
      })}
      {/* Area */}
      <path d={areaD} fill="url(#rev-gradient)" />
      {/* Line */}
      <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#10b981" />
      ))}
    </svg>
  );
}

export function AnalyticsPage() {
  const { data, kpis } = useApp();
  const [range, setRange] = useState<7 | 14 | 30 | 'all'>('all');

  const realLeads = data.leads.filter((l) => !l.isDemo);
  const sourceData = getLeadsBySource(realLeads);
  const serviceData = getLeadsByService(realLeads);
  const revenueData = getRevenueByDate(realLeads);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <div className="page-subtitle">// performance metrics · real data only</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['7', '14', '30', 'all'] as const).map((r) => (
            <button key={r} className={`filter-chip ${range === r ? 'active' : ''}`} onClick={() => setRange(r as typeof range)}>
              {r === 'all' ? 'All Time' : `${r}d`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Funnel */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            Lead Funnel
          </div>
          <FunnelBar label="Total Leads" count={kpis.totalLeads} max={kpis.totalLeads} color="#6366f1" />
          <FunnelBar label="Sent" count={kpis.leadsSent} max={kpis.totalLeads} color="#3b82f6" />
          <FunnelBar label="Replied" count={kpis.replies} max={kpis.totalLeads} color="#8b5cf6" />
          <FunnelBar label="Interested" count={kpis.interested} max={kpis.totalLeads} color="#f59e0b" />
          <FunnelBar label="Proposals" count={kpis.proposals} max={kpis.totalLeads} color="#ea580c" />
          <FunnelBar label="Won" count={kpis.dealsWon} max={kpis.totalLeads} color="#10b981" />
        </div>

        {/* Key rates */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            Conversion Rates
          </div>
          {[
            { label: 'Reply Rate', value: kpis.replyRatePct, color: '#6366f1' },
            { label: 'Interest Rate', value: kpis.leadsSent > 0 ? (kpis.interested / kpis.leadsSent) * 100 : 0, color: '#f59e0b' },
            { label: 'Acceptance Rate', value: kpis.acceptanceRatePct, color: '#10b981' },
            { label: 'Win Rate', value: kpis.proposals > 0 ? (kpis.dealsWon / kpis.proposals) * 100 : 0, color: '#ea580c' },
          ].map((r) => (
            <div key={r.label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{r.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: r.color, fontFamily: 'var(--font-mono)' }}>
                  {r.value.toFixed(1)}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${r.value}%`, background: r.color }} />
              </div>
            </div>
          ))}
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Avg Deal Value</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent)' }}>{formatINRFull(kpis.averageDealValue)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Leads per Deal</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {kpis.leadsPerDeal > 0 ? kpis.leadsPerDeal.toFixed(1) : '—'}
            </span>
          </div>
        </div>

        {/* Revenue chart */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            Revenue Over Time
          </div>
          <RevenueLineChart data={revenueData} />
        </div>
      </div>

      {/* Source Analytics */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
          Leads by Source
        </div>
        {sourceData.length === 0 ? (
          <div className="empty-state" style={{ padding: 24 }}>
            <div className="empty-state-title">No leads yet</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Leads</th>
                  <th>Sent</th>
                  <th>Replies</th>
                  <th>Interested</th>
                  <th>Won</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {sourceData.sort((a, b) => b.leads - a.leads).map((row) => (
                  <tr key={row.source}>
                    <td>{row.source}</td>
                    <td>{row.leads}</td>
                    <td>{row.sent}</td>
                    <td>{row.replies}</td>
                    <td>{row.interested}</td>
                    <td style={{ color: row.won > 0 ? 'var(--color-accent)' : undefined, fontWeight: row.won > 0 ? 700 : 400 }}>{row.won}</td>
                    <td style={{ color: row.revenue > 0 ? 'var(--color-accent)' : 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      {row.revenue > 0 ? formatINRFull(row.revenue) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Service Analytics */}
      <div className="card">
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
          Leads by Service
        </div>
        {serviceData.length === 0 ? (
          <div className="empty-state" style={{ padding: 24 }}>
            <div className="empty-state-title">No service data yet</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Leads</th>
                  <th>Replies</th>
                  <th>Deals</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {serviceData.sort((a, b) => b.leads - a.leads).map((row) => (
                  <tr key={row.service}>
                    <td>{row.service}</td>
                    <td>{row.leads}</td>
                    <td>{row.replies}</td>
                    <td style={{ color: row.deals > 0 ? 'var(--color-accent)' : undefined }}>{row.deals}</td>
                    <td style={{ color: row.revenue > 0 ? 'var(--color-accent)' : 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      {row.revenue > 0 ? formatINRFull(row.revenue) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

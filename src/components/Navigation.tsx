// =============================================================
// Sidebar + Bottom Navigation
// =============================================================
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Activity,
  BarChart2,
  Settings,
  LogOut,
  Terminal,
  Flame,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { logout } from './AuthGate';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/activity', icon: Activity, label: 'Activity' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { sprintDay, daysRemaining, currentStreak } = useApp();
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      {/* Brand */}
      <div className="sidebar-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Terminal size={16} color="#000" />
          </div>
          <div>
            <div className="sidebar-brand-name">OJASWA</div>
            <div className="sidebar-brand-subtitle">Growth OS</div>
          </div>
        </div>
        <div className="sidebar-status" style={{ marginTop: 12 }}>
          <div className="sidebar-status-dot" />
          <div className="sidebar-status-text">30 Day Client Sprint</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={() => `nav-link ${isActive(to) ? 'active' : ''}`}
            aria-current={isActive(to) ? 'page' : undefined}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-stats">
          <div className="sidebar-stat">
            <div className="sidebar-stat-value" style={{ color: 'var(--color-accent)' }}>
              <Flame size={14} style={{ display: 'inline', marginBottom: -2 }} />
              {' '}{currentStreak}
            </div>
            <div className="sidebar-stat-label">Day Streak</div>
          </div>
          <div className="sidebar-stat">
            <div className="sidebar-stat-value">
              <Clock size={14} style={{ display: 'inline', marginBottom: -2, color: 'rgba(255,255,255,0.4)' }} />
              {' '}{daysRemaining}
            </div>
            <div className="sidebar-stat-label">Days Left</div>
          </div>
          <div className="sidebar-stat">
            <div className="sidebar-stat-value">{sprintDay}</div>
            <div className="sidebar-stat-label">Day / 30</div>
          </div>
        </div>

        <button
          className="btn btn-ghost"
          onClick={logout}
          style={{ width: '100%', color: 'rgba(255,255,255,0.35)', fontSize: 12, justifyContent: 'flex-start', gap: 8 }}
          aria-label="Logout"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <div className="bottom-nav-items">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={() => `bottom-nav-item ${isActive(to) ? 'active' : ''}`}
            aria-current={isActive(to) ? 'page' : undefined}
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

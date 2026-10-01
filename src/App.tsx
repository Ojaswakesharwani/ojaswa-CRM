// =============================================================
// Ojaswa Growth OS — Main Application Entry
// =============================================================
import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthGate } from './components/AuthGate';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import { Sidebar, BottomNav } from './components/Navigation';
import { DashboardPage } from './pages/Dashboard';
import { LeadsPage, LeadDetailPage } from './pages/Leads';
import { ActivityPage } from './pages/Activity';
import { AnalyticsPage } from './pages/Analytics';
import { SettingsPage } from './pages/Settings';
import './index.css';

// Apply theme based on settings
function ThemeApplier() {
  const { data } = useApp();
  useEffect(() => {
    const theme = data.settings.theme;
    const root = document.documentElement;

    const applyTheme = (dark: boolean) => {
      root.setAttribute('data-theme', dark ? 'dark' : 'light');
    };

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches);
      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [data.settings.theme]);
  return null;
}

function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content" role="main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <ToastProvider>
          <ThemeApplier />
          <AuthGate>
            <AppLayout />
          </AuthGate>
        </ToastProvider>
      </AppProvider>
    </HashRouter>
  );
}

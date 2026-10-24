import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAppData } from '../../context/AppDataContext';

const PAGE_META: Record<string, { title: string; sub: string }> = {
  '/':         { title: 'Dashboard',       sub: "Today's medication schedule" },
  '/medicines':{ title: 'My Medicines',    sub: 'Manage your medications and dose times' },
  '/health':   { title: 'Health Log',      sub: 'Record and review your vital measurements' },
  '/summary':  { title: 'Weekly Summary',  sub: 'Medication adherence this week' },
  '/trends':   { title: 'Health Trends',   sub: 'Track your health metrics over time' },
};

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { loading } = useAppData();
  const meta = PAGE_META[pathname] ?? { title: 'MediTrack', sub: '' };

  return (
    <div className="shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        {/* Desktop top header */}
        <header className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">{meta.title}</span>
            <span className="topbar-sub">{meta.sub}</span>
          </div>
          <div className="topbar-right">
            <span className="topbar-date">{formatDate()}</span>
          </div>
        </header>

        {/* Mobile bar */}
        <div className="mobile-bar">
          <button
            className="icon-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6"  x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="mobile-bar-title">{meta.title}</span>
        </div>

        <main className="workspace fade-in">
          {loading ? (
            <div className="data-loading">
              <div className="spinner" />
              Loading your data…
            </div>
          ) : children}
        </main>
      </div>
    </div>
  );
}

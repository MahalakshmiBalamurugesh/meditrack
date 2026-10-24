import './index.css';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { createRoot } from 'react-dom/client';

import { AuthProvider, useAuth } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import { ClockProvider } from './context/ClockContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';

import { TodayPage }         from './pages/TodayPage';
import { MedicinesPage }     from './pages/MedicinesPage';
import { HealthLogPage }     from './pages/HealthLogPage';
import { WeeklySummaryPage } from './pages/WeeklySummaryPage';
import { TrendsPage }        from './pages/TrendsPage';

// ── Inner app — only shown when authenticated ─────────────────────
function AuthenticatedApp() {
  const { user, loading } = useAuth();

  // While Firebase checks the session, show a full-page spinner
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="spinner" />
        <span className="spinner-label">Loading MediTrack…</span>
      </div>
    );
  }

  // Not signed in → show login/signup page
  if (!user) {
    return <LoginPage />;
  }

  // Signed in → show the full dashboard
  return (
    <ClockProvider>
      <AppDataProvider>
        <AppLayout>
          <Routes>
            <Route path="/"          element={<TodayPage />} />
            <Route path="/medicines" element={<MedicinesPage />} />
            <Route path="/health"    element={<HealthLogPage />} />
            <Route path="/summary"   element={<WeeklySummaryPage />} />
            <Route path="/trends"    element={<TrendsPage />} />
          </Routes>
        </AppLayout>
      </AppDataProvider>
    </ClockProvider>
  );
}

// ── Root ──────────────────────────────────────────────────────────
function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </HashRouter>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}

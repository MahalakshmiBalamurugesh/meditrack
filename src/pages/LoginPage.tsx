import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass,  setLoginPass]  = useState('');

  // Signup fields
  const [signName,  setSignName]  = useState('');
  const [signEmail, setSignEmail] = useState('');
  const [signPass,  setSignPass]  = useState('');
  const [signPass2, setSignPass2] = useState('');

  const [error,    setError]    = useState('');
  const [busy,     setBusy]     = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(loginEmail, loginPass);
      // AuthContext updates; App re-renders to dashboard
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally {
      setBusy(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (signPass !== signPass2) {
      setError('Passwords do not match.');
      return;
    }
    if (signPass.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      await signup(signName.trim(), signEmail.trim(), signPass);
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally {
      setBusy(false);
    }
  };

  const switchTab = (t: 'login' | 'signup') => {
    setTab(t);
    setError('');
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="auth-app-name">MediTrack</div>
          <div className="auth-tagline">Medication &amp; Health Dashboard</div>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => switchTab('signup')}
          >
            Create Account
          </button>
        </div>

        <div className="auth-body">
          {error && <div className="auth-error">{error}</div>}

          {/* ── LOGIN ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="field">
                <label className="field-label">Email Address</label>
                <input
                  type="email"
                  className="field-input"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="field">
                <label className="field-label">Password</label>
                <input
                  type="password"
                  className="field-input"
                  placeholder="Your password"
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={busy}
                style={{ marginTop: '4px' }}
              >
                {busy ? 'Signing in…' : 'Sign In'}
              </button>
              <div className="auth-footer-note">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('signup')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--c-primary)', fontWeight: 600, fontSize: 'inherit',
                  }}
                >
                  Create one
                </button>
              </div>
            </form>
          )}

          {/* ── SIGN UP ── */}
          {tab === 'signup' && (
            <form onSubmit={handleSignup}>
              <div className="field">
                <label className="field-label">Full Name</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="Your full name"
                  value={signName}
                  onChange={e => setSignName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="field">
                <label className="field-label">Email Address</label>
                <input
                  type="email"
                  className="field-input"
                  placeholder="you@example.com"
                  value={signEmail}
                  onChange={e => setSignEmail(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label className="field-label">Password</label>
                <input
                  type="password"
                  className="field-input"
                  placeholder="Minimum 6 characters"
                  value={signPass}
                  onChange={e => setSignPass(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="field">
                <label className="field-label">Confirm Password</label>
                <input
                  type="password"
                  className="field-input"
                  placeholder="Repeat your password"
                  value={signPass2}
                  onChange={e => setSignPass2(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={busy}
                style={{ marginTop: '4px' }}
              >
                {busy ? 'Creating account…' : 'Create Account'}
              </button>
              <div className="auth-footer-note">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--c-primary)', fontWeight: 600, fontSize: 'inherit',
                  }}
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Firebase error code → human message ──────────────────────────
function friendlyError(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection and try again.';
    default:
      return `An error occurred (${code}). Please try again.`;
  }
}

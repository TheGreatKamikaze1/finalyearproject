import React, { useState } from 'react';
import { api, setSession } from '../utils/api';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

function Login({ onLoginSuccess, onNavigateRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setStatus({ message: 'Please enter both your email and password.', type: 'error' });
      return;
    }

    setSubmitting(true);
    setStatus({ message: 'Signing you in...', type: 'info' });

    try {
      const data = await api('/auth/login', {
        method: 'POST',
        auth: false,
        body: {
          email: email.trim(),
          password: password,
        },
      });

      setSession(data.access_token, data.user);
      setStatus({ message: 'Sign in successful! Entering workspace...', type: 'success' });
      
      // Deliberate tiny timeout for micro-animations feedback
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 800);
    } catch (err) {
      setStatus({ message: err.message, type: 'error' });
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Visual Brand Column */}
      <section className="auth-intro" aria-label="AccessLearn intro">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">AL</span>
          <span>AccessLearn</span>
        </div>
        <div className="intro-copy">
          <p className="eyebrow" style={{ color: '#f6d56f' }}>Accessible E-Learning</p>
          <h1>Learn your own way.</h1>
          <p>Courses adapt dynamically around audio-first formats, read-aloud systems, high readability spacing, screen reader outlines, and motion-calmed interaction styles.</p>
        </div>
        <ul className="access-pills" aria-label="Supported options">
          <li><Check size={16} /> Screen Reader Aware</li>
          <li><Check size={16} /> Caption First</li>
          <li><Check size={16} /> High Contrast</li>
          <li><Check size={16} /> Dyslexia-Friendly Layouts</li>
        </ul>
      </section>

      {/* Auth Control Panel Column */}
      <section className="auth-panel" aria-labelledby="signin-title">
        <div className="auth-card">
          <p className="eyebrow">Welcome Back</p>
          <h2 id="signin-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Sign in</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginBottom: '2rem' }}>
            Enter your credentials to continue learning with your saved accessibility profiles.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email address</label>
              <input
                className="form-control"
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="input-group">
                <input
                  className="form-control"
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={submitting}
                />
                <button
                  className="input-btn"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-pressed={showPassword}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  disabled={submitting}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {status.message && (
              <div 
                className="status" 
                style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  color: status.type === 'error' ? 'hsl(0, 75%, 40%)' : status.type === 'success' ? 'var(--brand)' : 'var(--muted)',
                  fontSize: '0.9rem',
                  margin: '1rem 0'
                }}
                role="status" 
                aria-live="polite"
              >
                {status.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
                <span>{status.message}</span>
              </div>
            )}

            <button 
              className="btn btn-primary btn-full" 
              type="submit"
              disabled={submitting}
              style={{ marginTop: '1.5rem' }}
            >
              {submitting ? 'Authenticating...' : 'Sign in'}
            </button>
          </form>

          <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
            New to AccessLearn?{' '}
            <button 
              style={{ background: 'none', border: 'none', color: 'var(--brand)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              onClick={onNavigateRegister}
            >
              Create an account
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;

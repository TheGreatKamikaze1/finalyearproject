import React, { useState } from 'react';
import { api, setSession } from '../utils/api';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

function Register({ onRegisterSuccess, onNavigateLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('learner');
  const [showPassword, setShowPassword] = useState(false);
  
  // Accessibility Profile Defaults
  const [disabilityProfile, setDisabilityProfile] = useState([]);
  const [preferredFormat, setPreferredFormat] = useState('mixed');
  const [captionsRequired, setCaptionsRequired] = useState(true);
  const [screenReaderOptimized, setScreenReaderOptimized] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [fontSize, setFontSize] = useState('md');

  const [status, setStatus] = useState({ message: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleDisabilityCheckbox = (value) => {
    if (disabilityProfile.includes(value)) {
      setDisabilityProfile(disabilityProfile.filter(item => item !== value));
    } else {
      setDisabilityProfile([...disabilityProfile, value]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setStatus({ message: 'Please fill in all core credentials.', type: 'error' });
      return;
    }
    if (password.length < 8) {
      setStatus({ message: 'Password must be at least 8 characters long.', type: 'error' });
      return;
    }

    setSubmitting(true);
    setStatus({ message: 'Creating your adaptive workspace...', type: 'info' });

    const payload = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      role: role,
      disability_profile: disabilityProfile,
      preferred_format: preferredFormat,
      captions_required: captionsRequired,
      screen_reader_optimized: screenReaderOptimized,
      high_contrast: highContrast,
      reduce_motion: reduceMotion,
      dyslexia_font: dyslexiaFont,
      font_size: fontSize,
    };

    try {
      const data = await api('/auth/register', {
        method: 'POST',
        auth: false,
        body: payload,
      });

      setSession(data.access_token, data.user);
      setStatus({ message: 'Welcome to AccessLearn! Building profile...', type: 'success' });
      setTimeout(() => {
        onRegisterSuccess(data.user);
      }, 800);
    } catch (err) {
      setStatus({ message: err.message, type: 'error' });
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Brand Column */}
      <section className="auth-intro" aria-label="AccessLearn registration details">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">AL</span>
          <span>AccessLearn</span>
        </div>
        <div className="intro-copy">
          <p className="eyebrow" style={{ color: '#f6d56f' }}>Start with Access</p>
          <h1>Set your learning comfort.</h1>
          <p>Your choices store the interface details and content profiles that make online lessons feel stable, readable, and perfectly balanced for different learning needs.</p>
        </div>
        <ul className="access-pills" aria-label="Disability support options">
          <li>Blind / Low Vision Support</li>
          <li>Deaf / Hard of Hearing Support</li>
          <li>Cognitive / Reading Support</li>
          <li>Mobility Support</li>
        </ul>
      </section>

      {/* Control Panel Column */}
      <section className="auth-panel" aria-labelledby="register-title" style={{ overflowY: 'auto' }}>
        <div className="auth-card" style={{ margin: '2rem 0' }}>
          <p className="eyebrow">Create Account</p>
          <h2 id="register-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Join AccessLearn</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginBottom: '2rem' }}>
            Tell us how to build your workspace. You can change these details at any time.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full name</label>
              <input
                className="form-control"
                id="reg-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
              <div>
                <label className="form-label" htmlFor="reg-email">Email address</label>
                <input
                  className="form-control"
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="reg-role">Account type</label>
                <select
                  className="form-select"
                  id="reg-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={submitting}
                >
                  <option value="learner">Learner</option>
                  <option value="instructor">Instructor</option>
                  <option value="support">Support staff</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="input-group">
                <input
                  className="form-control"
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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
                  disabled={submitting}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <span className="form-text">Choose at least 8 characters.</span>
            </div>

            <fieldset style={{ border: 'none', margin: '1.5rem 0' }}>
              <legend style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--ink)' }}>
                Support Profile (Select all that apply)
              </legend>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={disabilityProfile.includes('hearing')}
                    onChange={() => handleDisabilityCheckbox('hearing')}
                    disabled={submitting}
                  />
                  <span>Deaf / hard of hearing</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={disabilityProfile.includes('vision')}
                    onChange={() => handleDisabilityCheckbox('vision')}
                    disabled={submitting}
                  />
                  <span>Blind / low vision</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={disabilityProfile.includes('mobility')}
                    onChange={() => handleDisabilityCheckbox('mobility')}
                    disabled={submitting}
                  />
                  <span>Mobility support</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={disabilityProfile.includes('cognitive')}
                    onChange={() => handleDisabilityCheckbox('cognitive')}
                    disabled={submitting}
                  />
                  <span>Cognitive / attention</span>
                </label>
              </div>
            </fieldset>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-format">Preferred lesson format</label>
              <select
                className="form-select"
                id="reg-format"
                value={preferredFormat}
                onChange={(e) => setPreferredFormat(e.target.value)}
                disabled={submitting}
              >
                <option value="mixed">Mixed formats</option>
                <option value="video">Video with captions</option>
                <option value="audio">Audio lessons</option>
                <option value="text">Readable text summaries</option>
                <option value="visual">Visual diagrams / outlines</option>
                <option value="interactive">Interactive practice quizzes</option>
              </select>
            </div>

            <fieldset style={{ border: 'none', margin: '1.5rem 0' }}>
              <legend style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--ink)' }}>
                Interface Customizations
              </legend>
              
              <div className="switch-container">
                <div className="switch-label-block">
                  <span className="switch-title">Always show captions</span>
                  <span className="switch-desc">For hearing/cognitive video subtitles</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={captionsRequired}
                    onChange={(e) => setCaptionsRequired(e.target.checked)}
                    disabled={submitting}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="switch-container">
                <div className="switch-label-block">
                  <span className="switch-title">Screen reader optimized</span>
                  <span className="switch-desc">For low vision/blind keyboard loops</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={screenReaderOptimized}
                    onChange={(e) => setScreenReaderOptimized(e.target.checked)}
                    disabled={submitting}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="switch-container">
                <div className="switch-label-block">
                  <span className="switch-title">High contrast styling</span>
                  <span className="switch-desc">Boost accessibility contrast ratios</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    disabled={submitting}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="switch-container">
                <div className="switch-label-block">
                  <span className="switch-title">Calmer reduced motion</span>
                  <span className="switch-desc">Turns off micro-animations/transitions</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={reduceMotion}
                    onChange={(e) => setReduceMotion(e.target.checked)}
                    disabled={submitting}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="switch-container">
                <div className="switch-label-block">
                  <span className="switch-title">Dyslexia reading font</span>
                  <span className="switch-desc">Applies enhanced spacing layout</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={dyslexiaFont}
                    onChange={(e) => setDyslexiaFont(e.target.checked)}
                    disabled={submitting}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="reg-fontsize">Text scale size</label>
                <select
                  className="form-select"
                  id="reg-fontsize"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  disabled={submitting}
                >
                  <option value="sm">Small text scaling</option>
                  <option value="md">Standard text scaling</option>
                  <option value="lg">Large text scaling</option>
                  <option value="xl">Extra-large text scaling</option>
                </select>
              </div>
            </fieldset>

            {status.message && (
              <div 
                className="status" 
                style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  color: status.type === 'error' ? 'hsl(0, 75%, 40%)' : status.type === 'success' ? 'var(--brand)' : 'var(--muted)',
                  fontSize: '0.9rem',
                  margin: '1.2rem 0'
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
              {submitting ? 'Registering workspace...' : 'Create account'}
            </button>
          </form>

          <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
            Already have an account?{' '}
            <button 
              style={{ background: 'none', border: 'none', color: 'var(--brand)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              onClick={onNavigateLogin}
            >
              Sign in
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Register;

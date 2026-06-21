import React, { useState } from 'react';
import { api, setSession } from '../utils/api';
import { Eye, EyeOff, Check, AlertCircle, ShieldAlert, ArrowLeft } from 'lucide-react';

function Register({ onRegisterSuccess, onNavigateLogin, onNavigateLanding }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('learner'); // learner (student), instructor, guardian
  const [showPassword, setShowPassword] = useState(false);
  
  // Strict Accessibility Mode Selection
  const [accessibilityMode, setAccessibilityMode] = useState('standard'); // 'standard', 'visual', 'hearing', 'cognitive'
  
  // Optional Guardian / Support Contact details
  const [guardianContactName, setGuardianContactName] = useState('');
  const [guardianContactInfo, setGuardianContactInfo] = useState('');

  // Fine-tuned accessibility overrides (pre-configured by the selected mode)
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [captionsRequired, setCaptionsRequired] = useState(true);
  const [screenReaderOptimized, setScreenReaderOptimized] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [fontSize, setFontSize] = useState('md');

  const [status, setStatus] = useState({ message: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  // Automatically update customization baselines when accessibility mode is changed
  const handleModeChange = (mode) => {
    setAccessibilityMode(mode);
    if (mode === 'visual') {
      setHighContrast(true);
      setScreenReaderOptimized(true);
      setReduceMotion(false);
      setDyslexiaFont(false);
      setFontSize('lg');
    } else if (mode === 'hearing') {
      setHighContrast(false);
      setScreenReaderOptimized(false);
      setReduceMotion(false);
      setCaptionsRequired(true);
      setDyslexiaFont(false);
      setFontSize('md');
    } else if (mode === 'cognitive') {
      setHighContrast(false);
      setScreenReaderOptimized(false);
      setReduceMotion(true);
      setDyslexiaFont(true);
      setFontSize('md');
    } else {
      // standard defaults
      setHighContrast(false);
      setScreenReaderOptimized(false);
      setReduceMotion(false);
      setDyslexiaFont(false);
      setFontSize('md');
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

    // Storing user preferences and accessibility mode
    const payload = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      role: role,
      accessibility_mode: accessibilityMode,
      guardian_contact_name: role === 'learner' && guardianContactName.trim() ? guardianContactName.trim() : null,
      guardian_contact_info: role === 'learner' && guardianContactInfo.trim() ? guardianContactInfo.trim() : null,
      preferred_format: accessibilityMode === 'hearing' ? 'video' : accessibilityMode === 'visual' ? 'audio' : 'mixed',
      captions_required: captionsRequired,
      screen_reader_optimized: screenReaderOptimized,
      high_contrast: highContrast,
      reduce_motion: reduceMotion,
      dyslexia_font: dyslexiaFont,
      font_size: fontSize,
      disability_profile: [accessibilityMode],
    };

    try {
      const data = await api('/auth/register', {
        method: 'POST',
        auth: false,
        body: payload,
      });

      setSession(data.access_token, data.user);
      setStatus({ message: 'Welcome to AccessLearn! Building profile...', type: 'success' });
      
      // Deliberate tiny timeout for micro-animations feedback
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
        <button 
          onClick={onNavigateLanding}
          style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, cursor: 'pointer', position: 'absolute', top: '2rem', left: '2rem', padding: 0 }}
          aria-label="Back to home page"
        >
          <ArrowLeft size={16} />
          <span>Home</span>
        </button>

        <div className="brand" style={{ marginTop: '2.5rem' }}>
          <span className="brand-mark" aria-hidden="true">AL</span>
          <span>AccessLearn</span>
        </div>
        <div className="intro-copy">
          <p className="eyebrow" style={{ color: '#f6d56f' }}>Inclusive Classrooms</p>
          <h1>Configure your workspace.</h1>
          <p>Choose the accessibility mode that matches your style. The platform adapts pages, timers, fonts, layouts, and available tools globally to fit your choices.</p>
        </div>
        <ul className="access-pills" aria-label="Disability support options">
          <li>Standard Interface</li>
          <li>Blind / Low Vision Support</li>
          <li>Deaf / Hard of Hearing Support</li>
          <li>Cognitive / Reading Support</li>
        </ul>
      </section>

      {/* Register Panel Column */}
      <section className="auth-panel" aria-labelledby="register-title" style={{ overflowY: 'auto' }}>
        <div className="auth-card" style={{ margin: '2rem 0' }}>
          <p className="eyebrow">Create Account</p>
          <h2 id="register-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Join AccessLearn</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginBottom: '2rem' }}>
            Tell us how to build your workspace. You can update these details at any time.
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
                  <option value="learner">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="guardian">Guardian / Support</option>
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
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <span className="form-text">Choose at least 8 characters.</span>
            </div>

            {/* Strict Accessibility Mode Choice */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-mode">Accessibility Mode</label>
              <select
                className="form-select"
                id="reg-mode"
                style={{ fontWeight: 800, borderColor: 'var(--brand)' }}
                value={accessibilityMode}
                onChange={(e) => handleModeChange(e.target.value)}
                disabled={submitting}
              >
                <option value="standard">Standard Mode (No accommodations)</option>
                <option value="visual">Visual Impairment Mode (TTS, Contrast, Keyboard outlines)</option>
                <option value="hearing">Deaf / Hard of Hearing Mode (Forced Captions & Transcripts)</option>
                <option value="cognitive">Cognitive / Attention Mode (Simplified text, No timers, Calm motion)</option>
              </select>
            </div>

            {/* Optional Guardian Contact details (Available if role is learner/student) */}
            {role === 'learner' && (
              <fieldset style={{ border: '1px solid var(--line)', padding: '1rem', borderRadius: 'var(--radius-sm)', margin: '1.5rem 0' }}>
                <legend style={{ padding: '0 0.5rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Optional Guardian / Support Contact
                </legend>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label" htmlFor="reg-guardian-name" style={{ fontSize: '0.85rem' }}>Guardian full name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="reg-guardian-name"
                    value={guardianContactName}
                    onChange={(e) => setGuardianContactName(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="reg-guardian-info" style={{ fontSize: '0.85rem' }}>Guardian contact email or phone</label>
                  <input
                    type="text"
                    className="form-control"
                    id="reg-guardian-info"
                    value={guardianContactInfo}
                    onChange={(e) => setGuardianContactInfo(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </fieldset>
            )}

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
                {status.type === 'error' ? <ShieldAlert size={18} /> : <Check size={18} />}
                <span>{status.message}</span>
              </div>
            )}

            <button 
              className="btn btn-primary btn-full" 
              type="submit"
              disabled={submitting}
              style={{ marginTop: '1rem' }}
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

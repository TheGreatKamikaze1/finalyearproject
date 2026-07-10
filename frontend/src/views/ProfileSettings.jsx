import React, { useState, useEffect } from 'react';
import { api, setSession } from '../utils/api';
import { useAccessibility } from '../context/AccessibilityContext';
import { ArrowLeft, Sliders, CheckCircle2, User, PhoneCall, HelpCircle } from 'lucide-react';

function ProfileSettings({ user, navigateTo }) {
  const { preferences, updatePreferences } = useAccessibility();
  const [fullName, setFullName] = useState(user.full_name || '');
  const [email, setEmail] = useState(user.email || '');
  
  // Customizations
  const [localPrefs, setLocalPrefs] = useState({ ...preferences });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    setLocalPrefs({ ...preferences });
  }, [preferences]);

  const handlePrefChange = (name, value) => {
    setLocalPrefs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleModeChange = (mode) => {
    const updated = {
      ...localPrefs,
      accessibility_mode: mode
    };

    if (mode === 'visual') {
      updated.high_contrast = true;
      updated.screen_reader_optimized = true;
      updated.reduce_motion = false;
      updated.dyslexia_font = false;
      updated.font_size = 'lg';
    } else if (mode === 'hearing') {
      updated.high_contrast = false;
      updated.screen_reader_optimized = false;
      updated.reduce_motion = false;
      updated.captions_required = true;
      updated.dyslexia_font = false;
      updated.font_size = 'md';
    } else if (mode === 'cognitive') {
      updated.high_contrast = false;
      updated.screen_reader_optimized = false;
      updated.reduce_motion = true;
      updated.dyslexia_font = true;
      updated.font_size = 'md';
    } else if (mode === 'physical') {
      updated.high_contrast = false;
      updated.screen_reader_optimized = false;
      updated.reduce_motion = false;
      updated.dyslexia_font = false;
      updated.font_size = 'md';
    } else {
      updated.high_contrast = false;
      updated.screen_reader_optimized = false;
      updated.reduce_motion = false;
      updated.dyslexia_font = false;
      updated.font_size = 'md';
    }

    setLocalPrefs(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setStatus({ message: 'Full name and email are required.', type: 'error' });
      return;
    }
    setSaving(true);
    setStatus({ message: 'Saving profile and preferences...', type: 'info' });

    try {
      const updatedUser = await api('/auth/profile', {
        method: 'PUT',
        body: {
          ...localPrefs,
          full_name: fullName.trim(),
          email: email.trim()
        }
      });

      const token = localStorage.getItem('accesslearn_token');
      setSession(token, updatedUser);
      updatePreferences(updatedUser);
      setStatus({ message: 'Profile and workspace settings updated successfully!', type: 'success' });
      setTimeout(() => setStatus({ message: '', type: '' }), 4000);
    } catch (err) {
      setStatus({ message: `Failed to save: ${err.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigateTo('dashboard')} 
          className="btn btn-secondary btn-sm"
          aria-label="Back to dashboard screen"
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>
        <h1 style={{ fontSize: '2.2rem', margin: 0 }}>Workspace Settings</h1>
      </header>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* SECTION 1: ACCOUNT PROFILE */}
        <section aria-labelledby="profile-info-header" className="glass-card p-4" style={{ background: '#fff' }}>
          <h2 id="profile-info-header" style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} style={{ color: 'var(--brand)' }} />
            <span>Profile Details</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">Full name</label>
              <input
                type="text"
                id="profile-name"
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={saving}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">Email address</label>
              <input
                type="email"
                id="profile-email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={saving}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label" htmlFor="profile-role">Account role type</label>
            <span className="badge-a11y-pill badge-hearing" style={{ display: 'inline-block', fontWeight: 800 }}>
              {user.role.toUpperCase()}
            </span>
          </div>
        </section>

        {/* SECTION 2: OPTIONAL GUARDIAN CONTACT DETAILS */}
        {user.role === 'learner' && (
          <section aria-labelledby="guardian-info-header" className="glass-card p-4" style={{ background: '#fff' }}>
            <h2 id="guardian-info-header" style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PhoneCall size={20} style={{ color: 'var(--accent)' }} />
              <span>Guardian / Support Contact details</span>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-guardian-name">Guardian name</label>
                <input
                  type="text"
                  id="profile-guardian-name"
                  className="form-control"
                  value={localPrefs.guardian_contact_name || ''}
                  onChange={(e) => handlePrefChange('guardian_contact_name', e.target.value)}
                  placeholder="e.g. John Doe"
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-guardian-info">Guardian email or phone</label>
                <input
                  type="text"
                  id="profile-guardian-info"
                  className="form-control"
                  value={localPrefs.guardian_contact_info || ''}
                  onChange={(e) => handlePrefChange('guardian_contact_info', e.target.value)}
                  placeholder="e.g. johndoe@example.com"
                  disabled={saving}
                />
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: ACCESSIBILITY CUSTOMIZATION HUB */}
        <section aria-labelledby="a11y-hub-header" className="glass-card p-4" style={{ background: '#fff' }}>
          <h2 id="a11y-hub-header" style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={20} style={{ color: 'var(--brand)' }} />
            <span>Accessibility Settings Hub</span>
          </h2>

          {/* Primary Accessibility Mode select */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" htmlFor="profile-mode">Base Workspace Mode</label>
            <select
              className="form-select"
              id="profile-mode"
              style={{ fontWeight: 800, borderColor: 'var(--brand)', borderWidth: '2px' }}
              value={localPrefs.accessibility_mode || 'standard'}
              onChange={(e) => handleModeChange(e.target.value)}
              disabled={saving}
            >
              <option value="standard">Standard Mode (No overrides)</option>
              <option value="visual">Visual Impairment Mode (Narration, High contrast)</option>
              <option value="hearing">Deaf / Hard of Hearing Mode (Forced video captions)</option>
              <option value="cognitive">Cognitive / Attention Mode (Timer free, Simplified text)</option>
              <option value="physical">Physical / Motor Impairment Mode (Keyboard focus rings)</option>
            </select>
          </div>

          <fieldset style={{ border: 'none', margin: '0 0 1.5rem', padding: 0 }}>
            <legend style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Fine-Tuned Accommodations
            </legend>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="switch-container">
                <div className="switch-label-block">
                  <span className="switch-title">Always show captions</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={localPrefs.captions_required || false}
                    onChange={(e) => handlePrefChange('captions_required', e.target.checked)}
                    disabled={saving}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="switch-container">
                <div className="switch-label-block">
                  <span className="switch-title">Screen reader optimized</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={localPrefs.screen_reader_optimized || false}
                    onChange={(e) => handlePrefChange('screen_reader_optimized', e.target.checked)}
                    disabled={saving}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="switch-container">
                <div className="switch-label-block">
                  <span className="switch-title">High contrast colors</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={localPrefs.high_contrast || false}
                    onChange={(e) => handlePrefChange('high_contrast', e.target.checked)}
                    disabled={saving || localPrefs.accessibility_mode === 'visual'}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="switch-container">
                <div className="switch-label-block">
                  <span className="switch-title">Dyslexia fonts</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={localPrefs.dyslexia_font || false}
                    onChange={(e) => handlePrefChange('dyslexia_font', e.target.checked)}
                    disabled={saving}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="switch-container">
                <div className="switch-label-block">
                  <span className="switch-title">Reduced animations motion</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={localPrefs.reduce_motion || false}
                    onChange={(e) => handlePrefChange('reduce_motion', e.target.checked)}
                    disabled={saving || localPrefs.accessibility_mode === 'cognitive'}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="profile-fontsize">Text scale size</label>
                <select
                  className="form-select"
                  id="profile-fontsize"
                  value={localPrefs.font_size || 'md'}
                  onChange={(e) => handlePrefChange('font_size', e.target.value)}
                  disabled={saving}
                >
                  <option value="sm">Small scale</option>
                  <option value="md">Standard scale</option>
                  <option value="lg">Large scale</option>
                  <option value="xl">Extra-large scale</option>
                </select>
              </div>
            </div>
          </fieldset>
        </section>

        {status.message && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: status.type === 'error' ? 'hsl(0, 75%, 40%)' : status.type === 'success' ? 'var(--brand)' : 'var(--muted)',
              fontSize: '0.95rem',
              fontWeight: 800,
              padding: '1rem',
              background: 'var(--paper)',
              borderRadius: '6px'
            }}
          >
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <span>ℹ️</span>}
            <span>{status.message}</span>
          </div>
        )}

        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '3rem' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigateTo('dashboard')}
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={saving}
            aria-label="Save all settings customizations"
          >
            {saving ? "Saving Changes..." : "Save Workspace Settings"}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default ProfileSettings;

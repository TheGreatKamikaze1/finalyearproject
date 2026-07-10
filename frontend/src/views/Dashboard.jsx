import React, { useState, useEffect } from 'react';
import { api, setSession } from '../utils/api';
import { useAccessibility } from '../context/AccessibilityContext';
import { Settings, Info, Search, BookOpen, GraduationCap, ArrowRight, BookCheck, Sliders, CheckCircle2, ShieldAlert, Star, AlertTriangle } from 'lucide-react';

function Dashboard({ user, onLogout, navigateTo }) {
  const { preferences, updatePreferences, rulerActive, setRulerActive } = useAccessibility();
  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('learning'); // 'learning' or 'catalog'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefStatus, setPrefStatus] = useState('');
  
  // Local Form state synchronized with global accessibility preferences
  const [localPrefs, setLocalPrefs] = useState({ ...preferences });

  useEffect(() => {
    setLocalPrefs({ ...preferences });
  }, [preferences]);

  // Fetch courses, enrollments, and announcements
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [allCourses, enrolledCourses, allNotifications] = await Promise.all([
          api('/courses'),
          api('/courses/enrolled'),
          api('/notifications'),
        ]);
        setCourses(allCourses);
        setEnrolled(enrolledCourses);
        setNotifications(allNotifications);
      } catch (err) {
        console.error("Dashboard data load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await api(`/courses/${courseId}/enroll`, { method: 'POST' });
      const enrolledCourses = await api('/courses/enrolled');
      setEnrolled(enrolledCourses);
    } catch (err) {
      alert(`Enrollment failed: ${err.message}`);
    }
  };

  const handlePrefChange = (name, value) => {
    setLocalPrefs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleModeChange = (modeValue) => {
    const updated = {
      ...localPrefs,
      accessibility_mode: modeValue,
      disability_profile: [modeValue]
    };

    if (modeValue === 'visual') {
      updated.high_contrast = true;
      updated.screen_reader_optimized = true;
      updated.reduce_motion = false;
      updated.dyslexia_font = false;
      updated.font_size = 'lg';
    } else if (modeValue === 'hearing') {
      updated.high_contrast = false;
      updated.screen_reader_optimized = false;
      updated.reduce_motion = false;
      updated.captions_required = true;
      updated.dyslexia_font = false;
      updated.font_size = 'md';
    } else if (modeValue === 'cognitive') {
      updated.high_contrast = false;
      updated.screen_reader_optimized = false;
      updated.reduce_motion = true;
      updated.dyslexia_font = true;
      updated.font_size = 'md';
    } else if (modeValue === 'physical') {
      updated.high_contrast = false;
      updated.screen_reader_optimized = false;
      updated.reduce_motion = false;
      updated.dyslexia_font = false;
      updated.font_size = 'md';
    } else {
      // standard defaults
      updated.high_contrast = false;
      updated.screen_reader_optimized = false;
      updated.reduce_motion = false;
      updated.dyslexia_font = false;
      updated.font_size = 'md';
    }

    setLocalPrefs(updated);
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    setPrefStatus('Saving modifications...');
    try {
      const updatedUser = await api('/auth/preferences', {
        method: 'PUT',
        body: localPrefs
      });
      const token = localStorage.getItem('accesslearn_token');
      setSession(token, updatedUser);
      updatePreferences(updatedUser);
      setPrefStatus('Preferences saved successfully!');
      setTimeout(() => setPrefStatus(''), 2500);
    } catch (err) {
      setPrefStatus(`Save failed: ${err.message}`);
    } finally {
      setSavingPrefs(false);
    }
  };

  // Recommendation banner details based on selected mode
  const getRecommendation = () => {
    const activeMode = preferences.accessibility_mode || 'standard';
    if (activeMode === 'visual') {
      return "<strong>Visual Impairment mode active:</strong> The workspace contrast is boosted for readability. Press <strong>Tab</strong> on your keyboard to navigate between panels, and click <strong>Narration</strong> in lesson viewports to trigger speech synthesis narration.";
    } else if (activeMode === 'hearing') {
      return "<strong>Deaf / Hard of Hearing mode active:</strong> Video captions are forced on by default. You can open toggleable transcripts below lessons, or click <strong>PiP</strong> to open sign language overlay streams.";
    } else if (activeMode === 'cognitive') {
      return "<strong>Cognitive mode active:</strong> We have simplified layouts and disabled quiz timers to remove time pressure. Dyslexia letter-spacing is applied, and distracting animations are turned off.";
    } else if (activeMode === 'physical') {
      return "<strong>Physical / Keyboard Navigation mode active:</strong> Elements are optimized for sequential keyboard focus. Enhanced focus indicators (glowing rings) are active around all interactive links, fields, and buttons.";
    }
    return '';
  };

  const recommendation = getRecommendation();
  const currentMode = preferences.accessibility_mode || 'standard';
  const btnStyle = currentMode === 'visual' ? { minHeight: '48px', minWidth: '48px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' } : {};

  return (
    <div className="main-content">
      {/* Personalized recommendation banner */}
      {recommendation && (
        <div className="rec-banner glass-card" role="alert" aria-live="polite">
          {currentMode !== 'cognitive' && <span className="rec-icon">💡</span>}
          <div className="rec-body">
            <h2>Mode Accommodations Applied</h2>
            <p dangerouslySetInnerHTML={{ __html: recommendation }} />
          </div>
        </div>
      )}

      {/* Main hero panel */}
      <section className="hero-dashboard" aria-labelledby="welcome-hero-title">
        <div className="hero-title">
          <p className="eyebrow">Student Workspace Hub</p>
          <h1 id="welcome-hero-title">Welcome, {user.full_name}</h1>
          <p>
            {currentMode === 'cognitive' 
              ? "This is your learning dashboard. Study lessons at your own pace." 
              : "Your adaptive e-learning portal, prioritizing accessible layouts tailored to your support profile."}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {currentMode === 'visual' && (
            <button 
              className={`btn ${rulerActive ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setRulerActive(!rulerActive)}
              aria-pressed={rulerActive}
              style={btnStyle}
            >
              🎚️ {rulerActive ? 'Disable Reading Ruler' : 'Enable Reading Ruler'}
            </button>
          )}
          <button 
            className="btn btn-secondary" 
            onClick={() => navigateTo('help')} 
            aria-label="Open accessibility help documentation"
            style={btnStyle}
          >
            <span>Help Center</span>
          </button>
        </div>
      </section>

      {/* Continue Learning CTA */}
      {enrolled.length > 0 && (
        <section aria-label="Continue learning CTA" className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--brand-light)', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-dark)' }}>Ready to resume studies?</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>
              Jump straight back into your enrolled course: <strong>{enrolled[0].title}</strong>.
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => navigateTo('classroom', { courseId: enrolled[0].id })}
            aria-label={`Continue studying ${enrolled[0].title}`}
            style={btnStyle}
          >
            <span>Continue Learning</span>
            {currentMode !== 'cognitive' && <ArrowRight size={16} />}
          </button>
        </section>
      )}

      {/* MAIN DASHBOARD DUAL PANE */}
      <div className="dash-grid">
        {/* Left pane: Course curriculum tabs */}
        <section aria-label="Learning Catalog and Course boards" style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Notifications Panel */}
          {notifications.length > 0 && (
            <div 
              className="glass-card p-4"
              style={{ 
                marginBottom: '2rem', 
                borderLeft: '4px solid var(--accent)',
                order: currentMode === 'hearing' ? -1 : 'initial',
                background: '#fff'
              }}
            >
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {currentMode !== 'cognitive' && <span>🔔</span>}
                <span>Latest System Announcements</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notifications.slice(0, 3).map(n => (
                  <div key={n.id} style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{n.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{n.message}</p>
                  </div>
                ))}
              </div>
              <button 
                type="button"
                className="btn btn-secondary btn-sm" 
                onClick={() => navigateTo('notifications')}
                style={{ ...btnStyle, marginTop: '0.75rem' }}
              >
                View All Notifications
              </button>
            </div>
          )}

          <nav className="tab-nav" aria-label="Dashboard views">
            <button 
              className={`tab-btn ${activeTab === 'learning' ? 'active' : ''}`}
              onClick={() => setActiveTab('learning')}
            >
              My Learning ({enrolled.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
              onClick={() => setActiveTab('catalog')}
            >
              Browse Catalog
            </button>
          </nav>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ border: '4px solid var(--line)', borderTop: '4px solid var(--brand)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
              <p style={{ color: 'var(--muted)' }}>Loading catalog modules...</p>
            </div>
          ) : (
            <div>
              {/* My Learning Tab */}
              {activeTab === 'learning' && (
                <div>
                  {enrolled.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem' }} className="glass-card" style={{ background: '#fff' }}>
                      {currentMode !== 'cognitive' && <BookOpen size={48} style={{ color: 'var(--muted)', marginBottom: '1rem' }} />}
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No active enrollments</h3>
                      <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                        Enroll in courses using the catalog tab to begin learning with adaptive tools.
                      </p>
                      <button className="btn btn-primary" onClick={() => setActiveTab('catalog')} style={btnStyle}>
                        Browse Catalog
                      </button>
                    </div>
                  ) : (
                    <div className="card-grid">
                      {enrolled.map(c => (
                        <article className="classroom-card" key={c.id}>
                          <div>
                            <div className="card-header-block">
                              <span className="course-code">{c.course_code || 'GEN-101'}</span>
                              <span className="badge-a11y-pill badge-hearing" style={{ margin: 0, fontSize: '0.65rem' }}>Active</span>
                              {currentMode === 'hearing' && (
                                <span className="badge-a11y-pill badge-vision" style={{ margin: 0, fontSize: '0.65rem', background: 'var(--success-light)', color: 'var(--success)', borderColor: 'var(--success)' }}>
                                  CC Available
                                </span>
                              )}
                            </div>
                            <h3 className="course-title">{c.title}</h3>
                            <p className="course-desc">
                              {c.description || 'Access classroom lessons, audio transcripts, VTT tracks, and screen reader guidelines.'}
                            </p>
                          </div>
                          <button 
                            className="btn btn-primary btn-full"
                            onClick={() => navigateTo('classroom', { courseId: c.id })}
                            style={{ ...btnStyle, marginTop: '1.5rem' }}
                            aria-label={`Enter classroom for course: ${c.title}`}
                          >
                            <span>Enter Classroom</span>
                            {currentMode !== 'cognitive' && <ArrowRight size={16} />}
                          </button>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Course Catalog Tab */}
              {activeTab === 'catalog' && (
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      {currentMode !== 'cognitive' && <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />}
                      <input 
                        type="text" 
                        id="search-input"
                        className="form-control" 
                        placeholder="Search courses..." 
                        style={{ paddingLeft: currentMode === 'cognitive' ? '1rem' : '2.5rem' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search course catalogue input"
                      />
                    </div>
                  </div>

                  {courses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                      No courses found matching your query.
                    </div>
                  ) : (
                    <div className="card-grid">
                      {courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).map(c => {
                        const isEnrolled = enrolled.some(e => e.id === c.id);
                        return (
                          <article className="classroom-card" key={c.id}>
                            <div>
                              <div className="card-header-block">
                                <span className="course-code">{c.course_code || 'CSC-201'}</span>
                                <span className="badge-a11y-pill badge-vision" style={{ margin: 0, fontSize: '0.65rem' }}>A11y Verified</span>
                                {currentMode === 'hearing' && (
                                  <span className="badge-a11y-pill badge-vision" style={{ margin: 0, fontSize: '0.65rem', background: 'var(--success-light)', color: 'var(--success)', borderColor: 'var(--success)' }}>
                                    CC Available
                                  </span>
                                )}
                              </div>
                              <h3 className="course-title">{c.title}</h3>
                              <p className="course-desc">
                                {c.description || 'Learn this topic with rich visual accessibility support, dyslexia spacing, and screen-readers.'}
                              </p>
                            </div>
                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                              <button 
                                className="btn btn-secondary btn-sm" 
                                onClick={() => navigateTo('coursedetail', { courseId: c.id })}
                                style={{ ...btnStyle, flex: 1 }}
                              >
                                Info
                              </button>
                              {isEnrolled ? (
                                <button className="btn btn-secondary btn-sm" disabled style={{ ...btnStyle, opacity: 0.8, flex: 1 }}>
                                  <span>Enrolled</span>
                                </button>
                              ) : (
                                <button className="btn btn-primary btn-sm" onClick={() => handleEnroll(c.id)} style={{ ...btnStyle, flex: 1 }}>
                                  <span>Enroll</span>
                                </button>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right pane: Accessibility Hub Sidebar Controls */}
        <aside id="preferences-hub" aria-label="Accessibility settings panel">
          <form onSubmit={handleSavePreferences} className="feature-item a11y-sidebar glass-card">
            <h2 className="sidebar-title">
              {currentMode !== 'cognitive' && <Sliders size={20} style={{ color: 'var(--brand)' }} />}
              <span>Accessibility Hub</span>
            </h2>

            {/* Mode override choice */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="hub-mode">Select workspace mode</label>
              <select
                className="form-select"
                id="hub-mode"
                value={localPrefs.accessibility_mode || 'standard'}
                onChange={(e) => handleModeChange(e.target.value)}
                style={{ fontWeight: 800, borderColor: 'var(--brand)' }}
              >
                <option value="standard">Standard Mode</option>
                <option value="visual">Visual Impairment</option>
                <option value="hearing">Deaf / Hard of Hearing</option>
                <option value="cognitive">Cognitive Disability</option>
                <option value="physical">Physical Disability</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: '1rem 0' }}>
              <label className="form-label" htmlFor="dash-fontsize">Text scale size</label>
              <select
                className="form-select"
                id="dash-fontsize"
                value={localPrefs.font_size || 'md'}
                onChange={(e) => handlePrefChange('font_size', e.target.value)}
              >
                <option value="sm">Small scaling</option>
                <option value="md">Standard scaling</option>
                <option value="lg">Large scaling</option>
                <option value="xl">Extra-large scaling</option>
              </select>
            </div>

            <div className="switch-container">
              <div className="switch-label-block">
                <span className="switch-title">Dyslexia spacing font</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={localPrefs.dyslexia_font || false}
                  onChange={(e) => handlePrefChange('dyslexia_font', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="switch-container">
              <div className="switch-label-block">
                <span className="switch-title">Always show captions</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={localPrefs.captions_required || false}
                  onChange={(e) => handlePrefChange('captions_required', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="switch-container">
              <div className="switch-label-block">
                <span className="switch-title">Use high contrast</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={localPrefs.high_contrast || false}
                  onChange={(e) => handlePrefChange('high_contrast', e.target.checked)}
                  disabled={localPrefs.accessibility_mode === 'visual'}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="switch-container">
              <div className="switch-label-block">
                <span className="switch-title">Reduce animations motion</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={localPrefs.reduce_motion || false}
                  onChange={(e) => handlePrefChange('reduce_motion', e.target.checked)}
                  disabled={localPrefs.accessibility_mode === 'cognitive'}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {prefStatus && (
              <div 
                style={{ 
                  margin: '1rem 0', 
                  fontSize: '0.85rem', 
                  color: prefStatus.includes('failed') ? 'var(--accent)' : 'var(--brand)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                {currentMode !== 'cognitive' && (prefStatus.includes('failed') ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />)}
                <span>{prefStatus}</span>
              </div>
            )}

            <button 
              className="btn btn-primary btn-full" 
              type="submit"
              disabled={savingPrefs}
              style={{ ...btnStyle, marginTop: '1rem', width: '100%' }}
            >
              {savingPrefs ? 'Updating Hub...' : 'Save Preferences'}
            </button>
          </form>
        </aside>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;

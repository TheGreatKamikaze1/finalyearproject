import React, { useState, useEffect } from 'react';
import { api, setSession } from '../utils/api';
import { useAccessibility } from '../context/AccessibilityContext';
import { Settings, Info, Search, BookOpen, GraduationCap, ArrowRight, BookCheck, Sliders, CheckCircle2, ShieldAlert } from 'lucide-react';

function Dashboard({ user, onLogout, navigateTo }) {
  const { preferences, updatePreferences, rulerActive, setRulerActive } = useAccessibility();
  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [activeTab, setActiveTab] = useState('learning'); // 'learning' or 'catalog'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefStatus, setPrefStatus] = useState('');
  
  // Local Form state matching current context preferences
  const [localPrefs, setLocalPrefs] = useState({ ...preferences });

  useEffect(() => {
    setLocalPrefs({ ...preferences });
  }, [preferences]);

  // Load Course and Enrollment data
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [allCourses, enrolledCourses] = await Promise.all([
          api('/courses'),
          api('/courses/enrolled'),
        ]);
        setCourses(allCourses);
        setEnrolled(enrolledCourses);
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
      // Refresh enrolled list
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

  const handleDisabilityProfileChange = (value) => {
    const list = localPrefs.disability_profile || [];
    if (list.includes(value)) {
      handlePrefChange('disability_profile', list.filter(x => x !== value));
    } else {
      handlePrefChange('disability_profile', [...list, value]);
    }
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
      // Save local storage
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

  // Recommendation logic matching disability profile and preferred format
  const getRecommendation = () => {
    if (preferences.preferred_format === 'video') {
      return "Since you prefer video-based lessons, our system flags courses with active subtitles and captions. Keep an eye out for courses with the CAPTIONS badge in the catalog.";
    } else if (preferences.preferred_format === 'audio') {
      return "Since you prefer audio lessons, we highlight resources containing downloadable audio lectures or audio transcripts. Toggle the dyscalculia/accessibility reading mode for clean text summaries.";
    } else if (preferences.preferred_format === 'text') {
      return "Since you prefer readable text layouts, you can use our Audio Reader (Text-to-Speech) voice synthesis or toggle the Dyslexia-friendly font settings to format all lessons instantly.";
    } else if (preferences.disability_profile?.includes('vision')) {
      return "For blind or low vision layouts, we prioritize text descriptions for PDFs, audio transcripts, and have enabled keyboard focus highlight outlines across all actions.";
    } else if (preferences.disability_profile?.includes('hearing')) {
      return "For hearing support, we ensure all modules recommend video captions or text transcripts. Look for courses with complete accessibility metadata.";
    }
    return '';
  };

  const recommendation = getRecommendation();

  // Filters catalog courses based on searchQuery
  const filteredCatalog = courses.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(query) ||
      (c.course_code || '').toLowerCase().includes(query) ||
      (c.description || '').toLowerCase().includes(query)
    );
  });

  const enrolledIds = enrolled.map(e => e.id);

  return (
    <div className="main-content">
      {/* Personalized recommendation banner */}
      {recommendation && (
        <div className="rec-banner glass-card">
          <span className="rec-icon">💡</span>
          <div className="rec-body">
            <h2>Tailored accessibility settings active</h2>
            <p dangerouslySetInnerHTML={{ __html: recommendation }} />
          </div>
        </div>
      )}

      {/* Main hero panel */}
      <section className="hero-dashboard">
        <div className="hero-title">
          <p className="eyebrow">Student Workspace</p>
          <h1>Welcome, {user.full_name}</h1>
          <p>Your adaptive classroom portal, prioritising materials tailored to your support profile.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className={`btn ${rulerActive ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setRulerActive(!rulerActive)}
            aria-pressed={rulerActive}
          >
            🎚️ {rulerActive ? 'Disable Reading Ruler' : 'Enable Reading Ruler'}
          </button>
          <a className="btn btn-secondary" href="#preferences-hub">
            Accessibility Hub
          </a>
        </div>
      </section>

      <div className="dash-grid">
        {/* Left pane: Learning lists */}
        <div>
          <nav className="tab-nav" aria-label="Dashboard tabs">
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
              Course Catalog
            </button>
          </nav>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ border: '4px solid var(--line)', borderTop: '4px solid var(--brand)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
              <p style={{ color: 'var(--muted)' }}>Fetching modules catalog...</p>
            </div>
          ) : (
            <div>
              {/* My Learning Tab */}
              {activeTab === 'learning' && (
                <div>
                  {enrolled.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem' }} className="glass-card">
                      <BookOpen size={48} style={{ color: 'var(--muted)', marginBottom: '1rem' }} />
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No active enrollments</h3>
                      <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                        Enroll in courses using the catalog tab to begin learning with adaptive tools.
                      </p>
                      <button className="btn btn-primary" onClick={() => setActiveTab('catalog')}>
                        Browse course catalog
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
                            </div>
                            <h3 className="course-title">{c.title}</h3>
                            <p className="course-desc">
                              {c.description || 'Access classroom lessons, audio transcripts, VTT tracks, and screen reader guidelines.'}
                            </p>
                          </div>
                          <button 
                            className="btn btn-primary btn-full"
                            onClick={() => navigateTo('classroom', { courseId: c.id })}
                            style={{ marginTop: '1.5rem' }}
                          >
                            <span>Enter Classroom</span>
                            <ArrowRight size={16} />
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
                      <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search courses by code, title, topic..." 
                        style={{ paddingLeft: '2.5rem' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {filteredCatalog.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                      No courses found matching your query.
                    </div>
                  ) : (
                    <div className="card-grid">
                      {filteredCatalog.map(c => {
                        const isEnrolled = enrolledIds.includes(c.id);
                        
                        // Accessible metadata tags
                        const isEven = c.id % 2 === 0;

                        return (
                          <article className="classroom-card" key={c.id}>
                            <div>
                              <div className="card-header-block">
                                <span className="course-code">{c.course_code || 'CSC-201'}</span>
                                <span className="badge-a11y-pill badge-vision" style={{ margin: 0, fontSize: '0.65rem' }}>A11y Verified</span>
                              </div>
                              <h3 className="course-title">{c.title}</h3>
                              
                              <div className="a11y-pills-list">
                                <span className="badge-a11y-pill badge-hearing">Transcript Ready</span>
                                {isEven ? (
                                  <>
                                    <span className="badge-a11y-pill badge-cognitive">Captions Verified</span>
                                    <span className="badge-a11y-pill badge-vision">Reader Friendly</span>
                                  </>
                                ) : (
                                  <span className="badge-a11y-pill badge-mobility">Keyboard Nav OK</span>
                                )}
                              </div>

                              <p className="course-desc" style={{ marginTop: '0.5rem' }}>
                                {c.description || 'Learn this topic with rich visual accessibility support, dyslexia spacing, and screen-readers.'}
                              </p>
                            </div>
                            <div style={{ marginTop: '1.5rem' }}>
                              {isEnrolled ? (
                                <button className="btn btn-secondary btn-full" disabled style={{ opacity: 0.8 }}>
                                  <CheckCircle2 size={16} style={{ color: 'var(--brand)' }} />
                                  <span>Already enrolled</span>
                                </button>
                              ) : (
                                <button className="btn btn-outline-brand btn-full" onClick={() => handleEnroll(c.id)}>
                                  <span>Enroll in Course</span>
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
        </div>

        {/* Right pane: Accessibility Profile update Card */}
        <aside id="preferences-hub">
          <form onSubmit={handleSavePreferences} className="feature-item a11y-sidebar glass-card">
            <h2 className="sidebar-title">
              <Sliders size={20} style={{ color: 'var(--brand)' }} />
              <span>Accessibility Hub</span>
            </h2>

            {/* Dyslexia reading triggers */}
            <div className="switch-container">
              <div className="switch-label-block">
                <span className="switch-title" style={{ fontWeight: 800 }}>Dyslexia mode</span>
                <span className="switch-desc">OpenDyslexic alphabet layout</span>
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

            <div className="form-group" style={{ margin: '1rem 0' }}>
              <label className="form-label" htmlFor="dash-fontsize">Text scale size</label>
              <select
                className="form-select"
                id="dash-fontsize"
                value={localPrefs.font_size || 'md'}
                onChange={(e) => handlePrefChange('font_size', e.target.value)}
              >
                <option value="sm">Small text scaling</option>
                <option value="md">Standard text scaling</option>
                <option value="lg">Large text scaling</option>
                <option value="xl">Extra-large text scaling</option>
              </select>
            </div>

            <fieldset style={{ border: 'none', margin: '1.25rem 0' }}>
              <legend style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Disability Profiles
              </legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={localPrefs.disability_profile?.includes('hearing') || false}
                    onChange={() => handleDisabilityProfileChange('hearing')}
                  />
                  <span>Deaf / hard of hearing</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={localPrefs.disability_profile?.includes('vision') || false}
                    onChange={() => handleDisabilityProfileChange('vision')}
                  />
                  <span>Blind / low vision</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={localPrefs.disability_profile?.includes('mobility') || false}
                    onChange={() => handleDisabilityProfileChange('mobility')}
                  />
                  <span>Mobility support</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={localPrefs.disability_profile?.includes('cognitive') || false}
                    onChange={() => handleDisabilityProfileChange('cognitive')}
                  />
                  <span>Cognitive support</span>
                </label>
              </div>
            </fieldset>

            <div className="form-group">
              <label className="form-label" htmlFor="dash-format">Preferred format</label>
              <select
                className="form-select"
                id="dash-format"
                value={localPrefs.preferred_format || 'mixed'}
                onChange={(e) => handlePrefChange('preferred_format', e.target.value)}
              >
                <option value="mixed">Mixed formats</option>
                <option value="video">Video with captions</option>
                <option value="audio">Audio lessons</option>
                <option value="text">Readable text</option>
                <option value="visual">Visual outlines</option>
                <option value="interactive">Interactive practice</option>
              </select>
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
                <span className="switch-title">Screen reader optimized</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={localPrefs.screen_reader_optimized || false}
                  onChange={(e) => handlePrefChange('screen_reader_optimized', e.target.checked)}
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
                {prefStatus.includes('failed') ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
                <span>{prefStatus}</span>
              </div>
            )}

            <button 
              className="btn btn-primary btn-full" 
              type="submit"
              disabled={savingPrefs}
              style={{ marginTop: '1rem' }}
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

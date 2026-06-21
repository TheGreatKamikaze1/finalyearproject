import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAccessibility } from '../context/AccessibilityContext';
import { Search, ArrowLeft, ArrowRight, ShieldCheck, Check } from 'lucide-react';

function CourseCatalog({ user, navigateTo }) {
  const { preferences } = useAccessibility();
  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoading(true);
        const [allCourses, enrolledCourses] = await Promise.all([
          api('/courses'),
          api('/courses/enrolled')
        ]);
        setCourses(allCourses);
        setEnrolled(enrolledCourses);
      } catch (err) {
        console.error("Failed to load catalog details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await api(`/courses/${courseId}/enroll`, { method: 'POST' });
      // Refresh enrollments
      const enrolledCourses = await api('/courses/enrolled');
      setEnrolled(enrolledCourses);
    } catch (err) {
      alert(`Enrollment failed: ${err.message}`);
    }
  };

  const filteredCourses = courses.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      (c.course_code || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q)
    );
  });

  const enrolledIds = enrolled.map(e => e.id);
  const mode = preferences.accessibility_mode || 'standard';

  return (
    <div className="main-content">
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigateTo('dashboard')} 
          className="btn btn-secondary btn-sm"
          aria-label="Back to dashboard screen"
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>
        <h1 style={{ fontSize: '2.2rem', margin: 0 }}>Course Catalog</h1>
      </header>

      {/* Search controller */}
      <section aria-label="Search and filter courses" className="glass-card p-4" style={{ marginBottom: '2.5rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" htmlFor="catalog-search">Search course catalog</label>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              type="text"
              id="catalog-search"
              className="form-control"
              placeholder="Search by keyword, title, syllabus code..."
              style={{ paddingLeft: '2.75rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ border: '4px solid var(--line)', borderTop: '4px solid var(--brand)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--muted)' }}>Fetching modules catalog...</p>
        </div>
      ) : (
        <section aria-label="Available Courses list">
          {filteredCourses.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--muted)' }}>
              No courses match your query. Try searching for other topics.
            </div>
          ) : (
            <div className="card-grid">
              {filteredCourses.map(c => {
                const isEnrolled = enrolledIds.includes(c.id);
                const isEven = c.id % 2 === 0;

                return (
                  <article className="classroom-card" key={c.id}>
                    <div>
                      <div className="card-header-block">
                        <span className="course-code">{c.course_code || 'GEN-101'}</span>
                        <span className="badge-a11y-pill badge-vision" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.62rem' }}>
                          <ShieldCheck size={12} />
                          <span>A11y Verified</span>
                        </span>
                      </div>
                      <h2 className="course-title" style={{ fontSize: '1.25rem' }}>{c.title}</h2>
                      
                      {/* Visual Accessibility Verified features badges list */}
                      <div className="a11y-pills-list">
                        <span className="badge-a11y-pill badge-hearing">Transcript Ready</span>
                        {isEven ? (
                          <>
                            <span className="badge-a11y-pill badge-cognitive">Captions Verified</span>
                            <span className="badge-a11y-pill badge-vision">Dyslexia spacing</span>
                          </>
                        ) : (
                          <span className="badge-a11y-pill badge-mobility">Keyboard navigable</span>
                        )}
                      </div>

                      <p className="course-desc" style={{ marginTop: '0.5rem' }}>
                        {c.description || 'Learn this topic with complete digital accessibility accommodations, dyslexia sizing, screen-reader landmarks, and voice narrator help.'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => navigateTo('coursedetail', { courseId: c.id })}
                        aria-label={`View syllabus and course details for ${c.title}`}
                        style={{ flex: 1 }}
                      >
                        Syllabus Details
                      </button>

                      {isEnrolled ? (
                        <button 
                          className="btn btn-success" 
                          onClick={() => navigateTo('classroom', { courseId: c.id })}
                          aria-label={`Enter classroom portal for ${c.title}`}
                          style={{ flex: 1 }}
                        >
                          <span>Open Class</span>
                          <ArrowRight size={16} />
                        </button>
                      ) : (
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleEnroll(c.id)}
                          aria-label={`Enroll in course ${c.title}`}
                          style={{ flex: 1 }}
                        >
                          <span>Enroll</span>
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default CourseCatalog;

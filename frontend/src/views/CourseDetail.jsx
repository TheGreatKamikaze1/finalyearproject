import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { ArrowLeft, BookOpen, GraduationCap, CheckCircle, HelpCircle, FileText, Headphones, Video } from 'lucide-react';

function CourseDetail({ user, courseId, navigateTo }) {
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourseDetails() {
      try {
        setLoading(true);
        const [cData, matsData, enrolledList] = await Promise.all([
          api(`/courses/${courseId}`),
          api(`/courses/${courseId}/materials`),
          api('/courses/enrolled')
        ]);
        setCourse(cData);
        setMaterials(matsData);
        setEnrolled(enrolledList.some(e => e.id === parseInt(courseId)));
      } catch (err) {
        console.error("Failed to load course details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourseDetails();
  }, [courseId]);

  const handleEnrollToggle = async () => {
    try {
      if (enrolled) {
        if (!window.confirm("Are you sure you want to unenroll? Your lesson completion history will be preserved but you will lose standard dashboard access.")) return;
        await api(`/courses/${courseId}/enroll`, { method: 'DELETE' });
        setEnrolled(false);
      } else {
        await api(`/courses/${courseId}/enroll`, { method: 'POST' });
        setEnrolled(true);
      }
    } catch (err) {
      alert(`Operation failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <div style={{ border: '4px solid var(--line)', borderTop: '4px solid var(--brand)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
        <p style={{ color: 'var(--muted)' }}>Retrieving course curriculum details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <h2 style={{ color: 'var(--accent)' }}>Course not found.</h2>
        <button className="btn btn-secondary" onClick={() => navigateTo('catalog')}>Return to Catalog</button>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <button 
        onClick={() => navigateTo('catalog')} 
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
        aria-label="Back to course catalog browse"
      >
        <ArrowLeft size={16} />
        <span>Return to Catalog</span>
      </button>

      {/* Main syllabus card */}
      <article className="glass-card p-5" style={{ background: '#fff', marginBottom: '2.5rem' }}>
        <header style={{ borderBottom: '2px solid var(--line)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="course-code" style={{ fontSize: '0.9rem' }}>{course.course_code || 'CSC-201'}</span>
            <span className="badge-a11y-pill badge-vision" style={{ margin: 0 }}>Verified Accessible</span>
          </div>
          <h1 style={{ fontSize: '2.3rem', color: 'var(--ink)' }}>{course.title}</h1>
        </header>

        <section aria-labelledby="desc-header" style={{ marginBottom: '2rem' }}>
          <h2 id="desc-header" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>About this Syllabus</h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            {course.description || "No description provided. This course covers core theoretical paradigms adapting layout spacing, transcripts, sign tracks, and voice synthesis support."}
          </p>
        </section>

        {/* Instructor information */}
        <section aria-labelledby="inst-header" style={{ background: 'var(--paper)', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '2.5rem' }}>
          <h2 id="inst-header" style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <GraduationCap style={{ color: 'var(--brand)' }} />
            <span>Instructor Bio Details</span>
          </h2>
          <p style={{ fontWeight: 800 }}>Professor in Charge</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>Email Support: contact@accesslearn.edu</p>
        </section>

        {/* Syllabus Lessons list */}
        <section aria-labelledby="syllabus-header">
          <h2 id="syllabus-header" style={{ fontSize: '1.3rem', marginBottom: '1rem', borderBottom: '1px solid var(--line)', paddingBottom: '0.5rem' }}>
            Course Lessons & Materials ({materials.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {materials.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>No lessons uploaded yet for this syllabus.</p>
            ) : (
              materials.map(m => {
                let icon = <FileText size={18} />;
                if (m.material_type === 'audio') icon = <Headphones size={18} style={{ color: 'var(--brand)' }} />;
                if (m.material_type === 'video') icon = <Video size={18} style={{ color: 'var(--accent)' }} />;

                return (
                  <div 
                    key={m.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem', 
                      padding: '0.75rem 1rem', 
                      background: 'var(--paper)', 
                      borderRadius: '6px', 
                      border: '1px solid var(--line)' 
                    }}
                  >
                    {icon}
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{m.title}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', marginLeft: '0.5rem' }}>
                        ({m.material_type})
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Dynamic CTAs */}
        <footer style={{ marginTop: '3rem', borderTop: '2px solid var(--line)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontWeight: 800 }}>Syllabus Status</p>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              {enrolled ? "You are currently enrolled in this adaptive course." : "Enroll to access lesson voice narration, captions, and assessment quizzes."}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className={`btn ${enrolled ? 'btn-danger' : 'btn-primary'}`} 
              onClick={handleEnrollToggle}
              aria-label={enrolled ? "Unenroll from this course" : "Enroll in this course"}
            >
              {enrolled ? "Unenroll" : "Enroll Now"}
            </button>
            {enrolled && (
              <button 
                className="btn btn-success" 
                onClick={() => navigateTo('classroom', { courseId: course.id })}
                aria-label="Enter course classroom workspace"
              >
                Enter Classroom
              </button>
            )}
          </div>
        </footer>
      </article>
    </div>
  );
}

export default CourseDetail;

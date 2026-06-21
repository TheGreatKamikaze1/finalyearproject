import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { LayoutGrid, Users, ShieldCheck, Plus, Trash2, Globe, FileUp, ClipboardList, CheckSquare, BarChart3, AlertTriangle, Check } from 'lucide-react';

function InstructorStudio({ user, navigateTo }) {
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  
  // Tabs: 'curriculum', 'quizzes', 'analytics'
  const [activeTab, setActiveTab] = useState('curriculum');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({ course_code: '', title: '', description: '' });

  const [showMatModal, setShowMatModal] = useState(false);
  const [matForm, setMatForm] = useState({ title: '', material_type: 'text', content_text: '', file_url: '', image_alt_text: '' });

  const [showA11yModal, setShowA11yModal] = useState(false);
  const [selectedMatForA11y, setSelectedMatForA11y] = useState(null);
  const [a11yForm, setA11yForm] = useState({ kind: 'captions', language: 'en', file_url: '', content_text: '' });

  // Quiz Modal State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizForm, setQuizForm] = useState({ title: '', description: '' });
  const [quizQuestions, setQuizQuestions] = useState([
    { text: '', question_type: 'multiple_choice', optionInput: '', correct_answer: '' }
  ]);

  // Initial Load
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await api('/courses');
      setCourses(data);
      if (activeCourse) {
        const updated = data.find(c => c.id === activeCourse.id);
        if (updated) setActiveCourse(updated);
      }
    } catch (err) {
      console.error("Failed to load instructor courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = async (course) => {
    setActiveCourse(course);
    setActiveTab('curriculum');
    loadMaterials(course.id);
  };

  const loadMaterials = async (courseId) => {
    try {
      const data = await api(`/courses/${courseId}/materials`);
      const materialsWithA11y = await Promise.all(
        data.map(async (m) => {
          try {
            const a11yItems = await api(`/materials/${m.id}/accessibility`);
            return { ...m, a11y: a11yItems };
          } catch {
            return { ...m, a11y: [] };
          }
        })
      );
      setMaterials(materialsWithA11y);
    } catch (err) {
      console.error("Failed to fetch materials:", err);
    }
  };

  const loadQuizzes = async (courseId) => {
    try {
      const data = await api(`/courses/${courseId}/quizzes`);
      setQuizzes(data);
    } catch (err) {
      console.error("Failed to load quizzes:", err);
    }
  };

  const loadAnalytics = async (courseId) => {
    try {
      const data = await api(`/courses/${courseId}/progress-summary`);
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to fetch progress analytics:", err);
    }
  };

  useEffect(() => {
    if (activeCourse) {
      if (activeTab === 'analytics') {
        loadAnalytics(activeCourse.id);
      } else if (activeTab === 'quizzes') {
        loadQuizzes(activeCourse.id);
      } else {
        loadMaterials(activeCourse.id);
      }
    }
  }, [activeTab, activeCourse?.id]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title.trim()) return;
    try {
      const newCourse = await api('/courses', {
        method: 'POST',
        body: courseForm
      });
      setShowCourseModal(false);
      setCourseForm({ course_code: '', title: '', description: '' });
      await loadCourses();
      handleSelectCourse(newCourse);
    } catch (err) {
      alert(`Failed to create course: ${err.message}`);
    }
  };

  const handleDeleteCourse = async () => {
    if (!activeCourse) return;
    if (!window.confirm("Are you sure you want to delete this course? This cannot be undone.")) return;
    try {
      await api(`/courses/${activeCourse.id}`, { method: 'DELETE' });
      setActiveCourse(null);
      await loadCourses();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleTogglePublish = async () => {
    if (!activeCourse) return;
    const nextStatus = !activeCourse.is_published;
    try {
      const updated = await api(`/courses/${activeCourse.id}`, {
        method: 'PUT',
        body: { is_published: nextStatus }
      });
      setActiveCourse(updated);
      await loadCourses();
    } catch (err) {
      alert(`Failed to change publish status: ${err.message}`);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!matForm.title.trim()) return;

    const payload = {
      title: matForm.title.trim(),
      material_type: matForm.material_type,
      content_text: matForm.material_type === 'text' ? matForm.content_text : null,
      file_url: matForm.material_type !== 'text' ? matForm.file_url.trim() : null,
      image_alt_text: matForm.image_alt_text.trim() ? matForm.image_alt_text.trim() : null,
    };

    try {
      await api(`/courses/${activeCourse.id}/materials`, {
        method: 'POST',
        body: payload
      });
      setShowMatModal(false);
      setMatForm({ title: '', material_type: 'text', content_text: '', file_url: '', image_alt_text: '' });
      loadMaterials(activeCourse.id);
    } catch (err) {
      alert(`Failed to add material: ${err.message}`);
    }
  };

  const handleDeleteMaterial = async (matId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await api(`/materials/${matId}`, { method: 'DELETE' });
      loadMaterials(activeCourse.id);
    } catch (err) {
      alert(`Failed to delete material: ${err.message}`);
    }
  };

  const handleAddA11y = async (e) => {
    e.preventDefault();
    if (!selectedMatForA11y) return;

    const payload = {
      kind: a11yForm.kind,
      language: a11yForm.language,
      file_url: a11yForm.kind !== 'transcript' ? a11yForm.file_url.trim() : null,
      content_text: a11yForm.kind === 'transcript' ? a11yForm.content_text : null
    };

    try {
      await api(`/materials/${selectedMatForA11y.id}/accessibility`, {
        method: 'POST',
        body: payload
      });
      setShowA11yModal(false);
      setA11yForm({ kind: 'captions', language: 'en', file_url: '', content_text: '' });
      loadMaterials(activeCourse.id);
    } catch (err) {
      alert(`Failed to save accessibility resource: ${err.message}`);
    }
  };

  const openA11yModal = (mat) => {
    setSelectedMatForA11y(mat);
    setA11yForm({ kind: 'captions', language: 'en', file_url: '', content_text: '' });
    setShowA11yModal(true);
  };

  // Quiz creation handling
  const handleAddQuestionRow = () => {
    setQuizQuestions(prev => [
      ...prev,
      { text: '', question_type: 'multiple_choice', optionInput: '', correct_answer: '' }
    ]);
  };

  const handleQuizQuestionChange = (index, field, value) => {
    setQuizQuestions(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!quizForm.title.trim()) return;

    // Parse questions options from comma separated strings
    const questionsPayload = quizQuestions.map(q => {
      const optionsArray = q.question_type === 'multiple_choice' 
        ? q.optionInput.split(',').map(o => o.trim()).filter(Boolean)
        : ["True", "False"];

      return {
        text: q.text.trim(),
        question_type: q.question_type,
        options: optionsArray,
        correct_answer: q.correct_answer.trim()
      };
    });

    try {
      await api(`/courses/${activeCourse.id}/quizzes`, {
        method: 'POST',
        body: {
          title: quizForm.title.trim(),
          description: quizForm.description.trim() || null,
          questions: questionsPayload
        }
      });
      setShowQuizModal(false);
      setQuizForm({ title: '', description: '' });
      setQuizQuestions([{ text: '', question_type: 'multiple_choice', optionInput: '', correct_answer: '' }]);
      loadQuizzes(activeCourse.id);
    } catch (err) {
      alert(`Quiz creation failed: ${err.message}`);
    }
  };

  return (
    <div className="classroom-grid">
      {/* Sidebar course menu */}
      <aside className="lessons-sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em' }}>My Courses</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCourseModal(true)} style={{ padding: '0.25rem 0.5rem' }}>
            <Plus size={14} />
            <span>Create</span>
          </button>
        </div>

        <nav aria-label="Course list sidebar" className="lessons-list">
          {loading ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Synchronizing studio...</p>
          ) : courses.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No courses created.</p>
          ) : (
            courses.map(c => {
              const isActive = activeCourse?.id === c.id;
              return (
                <button
                  key={c.id}
                  className={`lesson-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectCourse(c)}
                  style={{ justifyContent: 'space-between', padding: '0.75rem 1rem' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', gap: '0.1rem' }}>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 800 }}>
                      {c.course_code || 'GEN-101'}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--ink)' }}>{c.title}</span>
                  </div>
                  <span className={`status-pill ${c.is_published ? 'status-live' : 'status-draft'}`} style={{ fontSize: '0.6rem' }}>
                    {c.is_published ? 'LIVE' : 'DRAFT'}
                  </span>
                </button>
              );
            })
          )}
        </nav>
      </aside>

      {/* Main Studio Workspace Pane */}
      <section className="lesson-viewport">
        {!activeCourse ? (
          <div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Instructor Control Studio</h1>

            {/* Metrics */}
            <div className="stat-grid" style={{ marginBottom: '2.5rem' }}>
              <div className="stat-card">
                <span className="stat-num">{courses.length}</span>
                <span className="stat-label">Total Courses</span>
              </div>
              <div className="stat-card">
                <span className="stat-num" style={{ color: 'var(--success)' }}>
                  {courses.filter(c => c.is_published).length}
                </span>
                <span className="stat-label">Published Live</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '4rem auto' }} className="glass-card p-5">
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🛠️</span>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Configure adaptive learning modules</h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
                Select a course from the sidebar to manage lessons, upload captions, add sign language stream URLs, define alt texts for diagrams, create quizzes, and monitor student reports.
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* Header dashboard cockpit */}
            <div className="glass-card p-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#fff', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="course-code">{activeCourse.course_code || 'CSC-301'}</span>
                  <span className={`status-pill ${activeCourse.is_published ? 'status-live' : 'status-draft'}`}>
                    {activeCourse.is_published ? 'Published (Live)' : 'Draft (Offline)'}
                  </span>
                </div>
                <h1 style={{ fontSize: '1.8rem', color: 'var(--ink)' }}>{activeCourse.title}</h1>
                <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginTop: '0.25rem' }}>{activeCourse.description || 'No description summary.'}</p>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className={`btn btn-sm ${activeCourse.is_published ? 'btn-secondary' : 'btn-primary'}`} onClick={handleTogglePublish}>
                  {activeCourse.is_published ? 'Set Draft (Offline)' : 'Publish Course (Live)'}
                </button>
                <button className="btn btn-danger btn-sm" onClick={handleDeleteCourse}>
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Course Studio Tabs */}
            <nav className="tab-nav">
              <button className={`tab-btn ${activeTab === 'curriculum' ? 'active' : ''}`} onClick={() => setActiveTab('curriculum')}>
                Curriculum Lessons
              </button>
              <button className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`} onClick={() => setActiveTab('quizzes')}>
                Manage Quizzes
              </button>
              <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
                Student Reports
              </button>
            </nav>

            {/* TAB 1: CURRICULUM LESSONS */}
            {activeTab === 'curriculum' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem' }}>Lessons & Materials</h3>
                  <button className="btn btn-outline-brand btn-sm" onClick={() => setShowMatModal(true)}>
                    <Plus size={14} />
                    <span>Add Lesson</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {materials.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }} className="glass-card">
                      <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>No lessons uploaded. Click "+ Add Lesson" to build curriculum.</p>
                    </div>
                  ) : (
                    materials.map(m => (
                      <article className="glass-card p-3" style={{ background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }} key={m.id}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            <span className="badge-a11y-pill badge-hearing" style={{ margin: 0, fontSize: '0.65rem' }}>
                              {m.material_type}
                            </span>
                            {m.image_alt_text && (
                              <span className="badge-a11y-pill badge-vision" style={{ margin: 0, fontSize: '0.6rem', padding: '0.15rem 0.4rem' }}>
                                ALT TEXT ACTIVE
                              </span>
                            )}
                            {m.a11y?.map(a => (
                              <span key={a.id} className="badge-a11y-pill badge-cognitive" style={{ margin: 0, fontSize: '0.6rem', padding: '0.15rem 0.4rem' }}>
                                + {a.kind.toUpperCase()}
                              </span>
                            ))}
                          </div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{m.title}</h4>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-outline-brand btn-sm" onClick={() => openA11yModal(m)}>
                            <FileUp size={14} />
                            <span>Upload A11y Track</span>
                          </button>
                          <button className="btn btn-secondary btn-sm" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }} onClick={() => handleDeleteMaterial(m.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MANAGE QUIZZES */}
            {activeTab === 'quizzes' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem' }}>Assessment Quizzes</h3>
                  <button className="btn btn-outline-brand btn-sm" onClick={() => setShowQuizModal(true)}>
                    <Plus size={14} />
                    <span>Create Quiz</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {quizzes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }} className="glass-card">
                      <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>No quizzes created for this course. Click "+ Create Quiz" to set up assessments.</p>
                    </div>
                  ) : (
                    quizzes.map(quiz => (
                      <article className="glass-card p-3" style={{ background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} key={quiz.id}>
                        <div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{quiz.title}</h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                            Questions: {quiz.questions?.length || 0}
                          </span>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: STUDENT REPORTS */}
            {activeTab === 'analytics' && (
              <div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Student Progress Metrics</h3>
                {analytics.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }} className="glass-card">
                    <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>No students enrolled in this course yet.</p>
                  </div>
                ) : (
                  <div className="custom-table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Student Details</th>
                          <th>Accessibility Preferences</th>
                          <th style={{ textAlign: 'center' }}>Lessons Completed</th>
                          <th>Progress Tracking</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.map(row => (
                          <tr key={row.student_id}>
                            <td>
                              <div style={{ fontWeight: 700 }}>{row.full_name}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{row.email}</div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                {row.disability_profile?.map((p, i) => (
                                  <span key={i} className={`badge-a11y-pill badge-${p}`} style={{ fontSize: '0.62rem', margin: 0 }}>
                                    {p}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 800 }}>
                              {row.completed_materials} / {row.total_materials}
                            </td>
                            <td style={{ width: '260px' }}>
                              <div className="progress-bar-container">
                                <div className="progress-track">
                                  <div className="progress-fill" style={{ width: `${row.progress_percentage}%` }}></div>
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{row.progress_percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* MODAL: CREATE COURSE */}
      {showCourseModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="create-course-header">
          <div className="modal-content-box">
            <header className="modal-header">
              <h3 id="create-course-header">Create New Course</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCourseModal(false)} style={{ padding: '0.25rem 0.5rem', border: 'none' }}>✕</button>
            </header>
            <form onSubmit={handleCreateCourse}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="new-code">Course Code</label>
                  <input
                    type="text"
                    className="form-control"
                    id="new-code"
                    placeholder="e.g. LRN-402"
                    value={courseForm.course_code}
                    onChange={(e) => setCourseForm({ ...courseForm, course_code: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="new-title">Course Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="new-title"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="new-desc">Description / Summary</label>
                  <textarea
                    className="form-control"
                    id="new-desc"
                    rows="3"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  />
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCourseModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Course</button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD LESSON MATERIAL */}
      {showMatModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="create-mat-header">
          <div className="modal-content-box">
            <header className="modal-header">
              <h3 id="create-mat-header">Add Lesson Material</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowMatModal(false)} style={{ padding: '0.25rem 0.5rem', border: 'none' }}>✕</button>
            </header>
            <form onSubmit={handleAddMaterial}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="mat-title">Lesson Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="mat-title"
                    value={matForm.title}
                    onChange={(e) => setMatForm({ ...matForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="mat-type">Material Type</label>
                  <select
                    className="form-select"
                    id="mat-type"
                    value={matForm.material_type}
                    onChange={(e) => setMatForm({ ...matForm, material_type: e.target.value })}
                    required
                  >
                    <option value="text">Text Lesson</option>
                    <option value="pdf">PDF Document Link</option>
                    <option value="audio">Audio Resource Link</option>
                    <option value="video">Video Resource Link</option>
                  </select>
                </div>

                {matForm.material_type === 'text' ? (
                  <div className="form-group">
                    <label className="form-label" htmlFor="mat-content">Lesson Content Text</label>
                    <textarea
                      className="form-control"
                      id="mat-content"
                      rows="5"
                      value={matForm.content_text}
                      onChange={(e) => setMatForm({ ...matForm, content_text: e.target.value })}
                      required
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label" htmlFor="mat-url">Media File URL</label>
                    <input
                      type="url"
                      className="form-control"
                      id="mat-url"
                      value={matForm.file_url}
                      onChange={(e) => setMatForm({ ...matForm, file_url: e.target.value })}
                      required
                    />
                  </div>
                )}

                {/* Alt text field for diagrams/images */}
                <div className="form-group">
                  <label className="form-label" htmlFor="mat-alt">Image / Diagram Alt Text (For screen readers)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="mat-alt"
                    placeholder="Provide description of any images/diagrams in this lesson..."
                    value={matForm.image_alt_text}
                    onChange={(e) => setMatForm({ ...matForm, image_alt_text: e.target.value })}
                  />
                </div>
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMatModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Lesson</button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ACCESSIBILITY RESOURE TRACKS */}
      {showA11yModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-a11y-header">
          <div className="modal-content-box">
            <header className="modal-header">
              <h3 id="add-a11y-header">Add Accessibility Tracks</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowA11yModal(false)} style={{ padding: '0.25rem 0.5rem', border: 'none' }}>✕</button>
            </header>
            <form onSubmit={handleAddA11y}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="a11y-kind">Resource Type</label>
                  <select
                    className="form-select"
                    id="a11y-kind"
                    value={a11yForm.kind}
                    onChange={(e) => setA11yForm({ ...a11yForm, kind: e.target.value })}
                    required
                  >
                    <option value="captions">Captions Track URL (VTT file link)</option>
                    <option value="transcript">Alternative Text Transcript</option>
                    <option value="sign_language">Sign Language Interpreter Video URL</option>
                  </select>
                </div>

                {a11yForm.kind === 'transcript' ? (
                  <div className="form-group">
                    <label className="form-label" htmlFor="a11y-text">Transcript Content</label>
                    <textarea
                      className="form-control"
                      id="a11y-text"
                      rows="5"
                      value={a11yForm.content_text}
                      onChange={(e) => setA11yForm({ ...a11yForm, content_text: e.target.value })}
                      required
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label" htmlFor="a11y-url">Track Resource URL Link</label>
                    <input
                      type="url"
                      className="form-control"
                      id="a11y-url"
                      value={a11yForm.file_url}
                      onChange={(e) => setA11yForm({ ...a11yForm, file_url: e.target.value })}
                      required
                    />
                  </div>
                )}
              </div>
              <footer className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowA11yModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Track</button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE QUIZ */}
      {showQuizModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="create-quiz-title" style={{ zIndex: 110 }}>
          <div className="modal-content-box" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <header className="modal-header">
              <h3 id="create-quiz-title">Create Course Assessment Quiz</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowQuizModal(false)} style={{ padding: '0.25rem 0.5rem', border: 'none' }}>✕</button>
            </header>
            <form onSubmit={handleCreateQuiz}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="quiz-title">Quiz Title</label>
                  <input 
                    type="text" 
                    id="quiz-title" 
                    className="form-control" 
                    required 
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="quiz-desc">Quiz Description (Optional)</label>
                  <input 
                    type="text" 
                    id="quiz-desc" 
                    className="form-control" 
                    value={quizForm.description}
                    onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                  />
                </div>

                <fieldset style={{ border: '1px solid var(--line)', padding: '1rem', borderRadius: '6px', marginTop: '1.5rem' }}>
                  <legend style={{ padding: '0 0.5rem', fontWeight: 800, color: 'var(--muted)', fontSize: '0.85rem' }}>
                    Quiz Questions ({quizQuestions.length})
                  </legend>
                  
                  {quizQuestions.map((q, idx) => (
                    <div key={idx} style={{ borderBottom: '1px dashed var(--line)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor={`q-${idx}-text`} style={{ fontSize: '0.85rem' }}>Question {idx + 1} Text</label>
                        <input 
                          type="text" 
                          id={`q-${idx}-text`} 
                          className="form-control" 
                          required
                          value={q.text}
                          onChange={(e) => handleQuizQuestionChange(idx, 'text', e.target.value)}
                        />
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label" htmlFor={`q-${idx}-type`} style={{ fontSize: '0.85rem' }}>Question Type</label>
                          <select 
                            id={`q-${idx}-type`}
                            className="form-select"
                            value={q.question_type}
                            onChange={(e) => handleQuizQuestionChange(idx, 'question_type', e.target.value)}
                          >
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="true_false">True / False</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor={`q-${idx}-ans`} style={{ fontSize: '0.85rem' }}>Correct Answer Value</label>
                          <input 
                            type="text" 
                            id={`q-${idx}-ans`}
                            className="form-control" 
                            required
                            placeholder="e.g. Option text or True/False"
                            value={q.correct_answer}
                            onChange={(e) => handleQuizQuestionChange(idx, 'correct_answer', e.target.value)}
                          />
                        </div>
                      </div>

                      {q.question_type === 'multiple_choice' && (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" htmlFor={`q-${idx}-opts`} style={{ fontSize: '0.85rem' }}>Multiple Choice Options (Comma separated)</label>
                          <input 
                            type="text" 
                            id={`q-${idx}-opts`}
                            className="form-control" 
                            required
                            placeholder="e.g. Option A, Option B, Option C"
                            value={q.optionInput}
                            onChange={(e) => handleQuizQuestionChange(idx, 'optionInput', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddQuestionRow}>
                    <Plus size={14} />
                    <span>Add Question</span>
                  </button>
                </fieldset>
              </div>
              <footer className="modal-footer" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowQuizModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Quiz</button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstructorStudio;

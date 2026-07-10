import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAccessibility } from '../context/AccessibilityContext';
import { ArrowLeft, BookOpen, FileText, Headphones, Video, CheckCircle2, Play, Pause, Square, Volume2, ExternalLink, Scroll, Check, MessageSquare, ClipboardList, HelpCircle } from 'lucide-react';

function CourseClassroom({ user, courseId, navigateTo }) {
  const { preferences, speak, pauseSpeech, stopSpeech, speakingState, rulerActive, setRulerActive } = useAccessibility();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [selectedMat, setSelectedMat] = useState(null);
  const [accItems, setAccItems] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  
  // TTS settings
  const [speechCharIndex, setSpeechCharIndex] = useState(null);
  const [ttsRate, setTtsRate] = useState(1.0);

  // Text adjustments for Text Lessons
  const [localLineSpacing, setLocalLineSpacing] = useState('1.6'); // '1.4', '1.8', '2.2'
  const [localFontFamily, setLocalFontFamily] = useState('Lexend'); // 'Inter', 'Lexend', 'Atkinson Hyperlegible'
  const [localFontSize, setLocalFontSize] = useState('1.15rem');

  // Sign Language overlay slot
  const [showSignLanguagePiP, setShowSignLanguagePiP] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState('video'); // 'video', 'sign', 'captions', 'transcript'

  // Load Course and Materials
  useEffect(() => {
    async function loadClassroom() {
      try {
        setLoading(true);
        const [courseData, materialsData, progressData] = await Promise.all([
          api(`/courses/${courseId}`),
          api(`/courses/${courseId}/materials`),
          api('/progress/me')
        ]);

        setCourse(courseData);
        setMaterials(materialsData);
        
        // Build progress map
        const pMap = {};
        progressData.forEach(p => {
          pMap[p.material_id] = p.status;
        });
        setProgressMap(pMap);

      } catch (err) {
        console.error("Failed to load classroom:", err);
      } finally {
        setLoading(false);
      }
    }
    loadClassroom();
  }, [courseId]);

  // Handle selected material change
  const handleSelectMaterial = async (mat) => {
    stopSpeech();
    setSpeechCharIndex(null);
    setSelectedMat(mat);
    setAccItems([]);
    setShowSignLanguagePiP(false);
    setActiveMediaTab(mat.material_type === 'audio' ? 'audio' : 'video');

    // Fetch related captions/transcripts/sign language tracks
    try {
      const items = await api(`/materials/${mat.id}/accessibility`);
      setAccItems(items);

      // Read Alt Text aloud automatically in visual mode
      if (preferences.accessibility_mode === 'visual') {
        let textToRead = `Opened lesson: ${mat.title}.`;
        if (mat.image_alt_text) {
          textToRead += ` Diagram Description: ${mat.image_alt_text}`;
        }
        speak(textToRead);
      }
    } catch (err) {
      console.warn("Failed to load accessibility items:", err);
    }

    // Mark as in-progress
    const currentStatus = progressMap[mat.id] || 'not_started';
    if (currentStatus === 'not_started') {
      await updateProgressStatus(mat.id, 'in_progress');
    }
  };

  const updateProgressStatus = async (materialId, status) => {
    try {
      await api(`/materials/${materialId}/progress`, {
        method: 'PUT',
        body: { status }
      });
      setProgressMap(prev => ({ ...prev, [materialId]: status }));
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  const handleToggleCompletion = async () => {
    if (!selectedMat) return;
    const currentStatus = progressMap[selectedMat.id] || 'not_started';
    const nextStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    await updateProgressStatus(selectedMat.id, nextStatus);
  };

  // TTS Read aloud
  const handleSpeakText = () => {
    if (!selectedMat || selectedMat.material_type !== 'text') return;
    speak(selectedMat.content_text, (charIndex) => {
      setSpeechCharIndex(charIndex);
    }, ttsRate);
  };

  // TTS word highlighter
  const renderHighlightedContent = () => {
    if (!selectedMat || !selectedMat.content_text) return '';
    const text = selectedMat.content_text;
    
    if (speechCharIndex === null || speechCharIndex === undefined || speechCharIndex < 0) {
      return text.split('\n').map((para, i) => <p key={i} style={{ marginBottom: '1.25rem' }}>{para}</p>);
    }

    let endIndex = speechCharIndex;
    while (endIndex < text.length && /\w/.test(text[endIndex])) {
      endIndex++;
    }

    const before = text.slice(0, speechCharIndex);
    const word = text.slice(speechCharIndex, endIndex);
    const after = text.slice(endIndex);

    return (
      <div>
        {before.split('\n').map((para, i, arr) => {
          if (i === arr.length - 1) {
            return (
              <p key={i} style={{ marginBottom: '1.25rem', display: 'inline' }}>
                {para}
                <span className="tts-highlight" style={{ display: 'inline' }}>{word}</span>
                {after.split('\n')[0]}
              </p>
            );
          }
          return <p key={i} style={{ marginBottom: '1.25rem' }}>{para}</p>;
        })}
        {after.split('\n').slice(1).map((para, i) => (
          <p key={i} style={{ marginBottom: '1.25rem', marginTop: i === 0 ? '1.25rem' : 0 }}>{para}</p>
        ))}
      </div>
    );
  };

  // Stop speech synthesis on leaving page
  useEffect(() => {
    return () => stopSpeech();
  }, []);

  const transcript = accItems.find(x => x.kind === 'transcript');
  const captions = accItems.find(x => x.kind === 'captions');
  const signLanguage = accItems.find(x => x.kind === 'sign_language');

  return (
    <div className="classroom-grid">
      {/* Sidebar navigation */}
      <aside className="lessons-sidebar">
        <button 
          onClick={() => navigateTo('dashboard')} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--brand)', marginBottom: '1.5rem', padding: 0 }}
          aria-label="Return to Dashboard Home"
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>

        <div style={{ marginBottom: '1.5rem' }}>
          <span className="course-code">{course?.course_code || 'GEN-101'}</span>
          <h2 style={{ fontSize: '1.35rem', marginTop: '0.2rem' }}>{course?.title}</h2>
        </div>

        {/* Links to Quizzes & Forums */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--line)', paddingBottom: '1rem' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => navigateTo('forum', { courseId })}
            style={{ justifyContent: 'flex-start' }}
            aria-label="Open course Q&A discussion forum"
          >
            <MessageSquare size={16} />
            <span>Class Forum</span>
          </button>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => navigateTo('quiz', { courseId })}
            style={{ justifyContent: 'flex-start' }}
            aria-label="Open course quizzes and assessments"
          >
            <ClipboardList size={16} />
            <span>Course Quizzes</span>
          </button>
        </div>

        <nav aria-label="Course curriculum lessons">
          <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Curriculum Lessons
          </h3>
          <div className="lessons-list">
            {materials.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No lessons uploaded.</p>
            ) : (
              materials.map(m => {
                const status = progressMap[m.id] || 'not_started';
                const isSelected = selectedMat?.id === m.id;
                
                let icon = <FileText size={18} />;
                if (m.material_type === 'pdf') icon = <FileText size={18} style={{ color: 'hsl(14, 75%, 48%)' }} />;
                if (m.material_type === 'audio') icon = <Headphones size={18} style={{ color: 'hsl(207, 85%, 45%)' }} />;
                if (m.material_type === 'video') icon = <Video size={18} style={{ color: 'var(--brand)' }} />;

                return (
                  <button 
                    className={`lesson-item ${isSelected ? 'active' : ''}`}
                    key={m.id}
                    onClick={() => handleSelectMaterial(m)}
                    aria-current={isSelected ? 'true' : 'false'}
                  >
                    <span className="lesson-title-inner">
                      {icon}
                      <span>{m.title}</span>
                    </span>
                    {status === 'completed' ? (
                      <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                    ) : status === 'in_progress' ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 800 }}>⌛</span>
                    ) : (
                      <span style={{ opacity: 0.35, fontSize: '0.75rem' }}>○</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </nav>
      </aside>

      {/* Classroom Viewport */}
      <section className="lesson-viewport" style={{ position: 'relative' }}>
        {!selectedMat ? (
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '4rem auto' }} className="glass-card p-5">
            <BookOpen size={64} style={{ color: 'var(--brand)', marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>Welcome to your adaptive classroom</h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
              Select any lesson from the sidebar menu to display its content. The classroom dashboard will customize its controls to match your accessibility specifications.
            </p>
          </div>
        ) : (
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 style={{ fontSize: '2.1rem' }}>{selectedMat.title}</h1>
              <span className="badge-a11y-pill badge-hearing" style={{ textTransform: 'uppercase', margin: 0 }}>
                {selectedMat.material_type}
              </span>
            </div>

            {/* TEXT LESSON PANEL WITH SPEECH CONTROLLERS & FONT FORMATTERS */}
            {selectedMat.material_type === 'text' && (
              <div>
                <div className="tts-bar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div className="tts-bar-title">
                      <Volume2 size={20} />
                      <span>Audio Voice Reader</span>
                    </div>
                    <div className="tts-actions">
                      <button className="btn btn-primary btn-sm" onClick={handleSpeakText}>
                        <Play size={14} />
                        <span>{speakingState.speaking ? 'Restart' : 'Play Narration'}</span>
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={pauseSpeech} disabled={!speakingState.speaking}>
                        <Pause size={14} />
                        <span>{speakingState.paused ? 'Resume' : 'Pause'}</span>
                      </button>
                      <button className="btn btn-secondary btn-sm" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }} onClick={stopSpeech} disabled={!speakingState.speaking}>
                        <Square size={14} />
                        <span>Stop</span>
                      </button>
                      <select 
                        className="form-select form-select-sm" 
                        style={{ width: '100px', height: '32px', minHeight: '32px', padding: '0 0.5rem' }}
                        value={ttsRate}
                        onChange={(e) => setTtsRate(parseFloat(e.target.value))}
                        aria-label="Reading rate speed selector"
                      >
                        <option value="0.75">0.75x</option>
                        <option value="1.0">1.0x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                      </select>
                    </div>
                  </div>

                  {/* Immediate Font formatting switches */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid rgba(29, 111, 95, 0.15)', paddingTop: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label htmlFor="classroom-font" style={{ fontSize: '0.8rem', fontWeight: 800 }}>Font Family:</label>
                      <select 
                        id="classroom-font"
                        className="form-select form-select-sm"
                        style={{ height: '28px', minHeight: '28px', padding: '0 0.5rem', width: '140px' }}
                        value={localFontFamily}
                        onChange={(e) => setLocalFontFamily(e.target.value)}
                      >
                        <option value="Inter">Standard (Inter)</option>
                        <option value="Lexend">Lexend (Dyslexia-friendly)</option>
                        <option value="Atkinson Hyperlegible">Atkinson (High readability)</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label htmlFor="classroom-spacing" style={{ fontSize: '0.8rem', fontWeight: 800 }}>Line Spacing:</label>
                      <select 
                        id="classroom-spacing"
                        className="form-select form-select-sm"
                        style={{ height: '28px', minHeight: '28px', padding: '0 0.5rem', width: '110px' }}
                        value={localLineSpacing}
                        onChange={(e) => setLocalLineSpacing(e.target.value)}
                      >
                        <option value="1.4">Standard (1.4)</option>
                        <option value="1.8">Relaxed (1.8)</option>
                        <option value="2.2">Wide spacing (2.2)</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label htmlFor="classroom-fontsize" style={{ fontSize: '0.8rem', fontWeight: 800 }}>Text Size:</label>
                      <select 
                        id="classroom-fontsize"
                        className="form-select form-select-sm"
                        style={{ height: '28px', minHeight: '28px', padding: '0 0.5rem', width: '110px' }}
                        value={localFontSize}
                        onChange={(e) => setLocalFontSize(e.target.value)}
                      >
                        <option value="1rem">Small size</option>
                        <option value="1.15rem">Medium size</option>
                        <option value="1.35rem">Large size</option>
                        <option value="1.6rem">Extra Large</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${rulerActive ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setRulerActive(!rulerActive)}
                        style={{ height: '28px', minHeight: '28px', padding: '0 0.75rem', fontSize: '0.8rem', fontWeight: 800 }}
                        aria-pressed={rulerActive}
                        aria-label="Toggle Dyslexia Reading Ruler overlay"
                      >
                        {rulerActive ? '📏 Disable Ruler' : '📏 Enable Ruler'}
                      </button>
                    </div>
                  </div>
                </div>

                <article 
                  className="glass-card p-4 text-lesson-body" 
                  style={{ 
                    background: '#fff', 
                    fontSize: localFontSize, 
                    lineHeight: localLineSpacing,
                    fontFamily: `"${localFontFamily}", sans-serif`,
                    minHeight: '200px' 
                  }} 
                  tabIndex={0}
                >
                  {renderHighlightedContent()}

                  {/* Render alt text diagram if available to simulate visual narration */}
                  {selectedMat.image_alt_text && (
                    <div style={{ marginTop: '2rem', borderTop: '1px dashed var(--line)', paddingTop: '1rem', background: 'var(--paper)', padding: '1rem', borderRadius: '6px' }}>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--muted)' }}>Diagram Description (Image Alt Text):</strong>
                      <p style={{ fontStyle: 'italic', color: 'var(--ink)' }}>{selectedMat.image_alt_text}</p>
                    </div>
                  )}
                </article>
              </div>
            )}

            {/* PDF RESOURCE FRAME */}
            {selectedMat.material_type === 'pdf' && (
              <div className="glass-card p-4" style={{ background: '#fff', textAlign: 'center' }}>
                <p style={{ marginBottom: '1rem', color: 'var(--muted)' }}>
                  This lesson contains a PDF document. You can open it in a new window or read the document below.
                </p>
                <a 
                  href={selectedMat.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline-brand"
                  style={{ marginBottom: '1.5rem' }}
                >
                  <ExternalLink size={16} />
                  <span>Open PDF in New Window</span>
                </a>
                <iframe 
                  title={`${selectedMat.title} PDF Document`}
                  src={selectedMat.file_url} 
                  className="pdf-viewer-frame"
                />
              </div>
            )}

            {/* AUDIO LESSON W/ TRANSCRIPT TABS */}
            {selectedMat.material_type === 'audio' && (
              <div className="glass-card p-4" style={{ background: '#fff' }}>
                <nav className="tab-nav" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--line)', paddingBottom: '0.5rem' }}>
                  <button 
                    type="button"
                    className={`tab-btn ${activeMediaTab === 'audio' ? 'active' : ''}`}
                    onClick={() => setActiveMediaTab('audio')}
                    style={{ flex: 1, padding: '0.75rem', fontWeight: 800 }}
                  >
                    🎵 Audio Player
                  </button>
                  {transcript && (
                    <button 
                      type="button"
                      className={`tab-btn ${activeMediaTab === 'transcript' ? 'active' : ''}`}
                      onClick={() => setActiveMediaTab('transcript')}
                      style={{ flex: 1, padding: '0.75rem', fontWeight: 800 }}
                    >
                      📜 Text Transcript
                    </button>
                  )}
                </nav>

                {activeMediaTab === 'audio' && (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <Headphones size={64} style={{ color: 'var(--brand)', marginBottom: '1.5rem' }} />
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                      <audio controls src={selectedMat.file_url} style={{ width: '100%', maxWidth: '600px' }} />
                    </div>
                  </div>
                )}

                {activeMediaTab === 'transcript' && transcript && (
                  <article className="transcript-block" style={{ marginTop: 0 }}>
                    <div className="transcript-header" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                      <Scroll size={16} />
                      <span>Audio Lesson Text Transcript</span>
                    </div>
                    <div className="transcript-body" style={{ textAlign: 'left', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                      {transcript.content_text?.split('\n').map((para, i) => (
                        <p key={i} style={{ marginBottom: '0.75rem' }}>{para}</p>
                      ))}
                    </div>
                  </article>
                )}
              </div>
            )}

            {/* VIDEO LESSON W/ CAPTIONS, TRANSCRIPTS & SIGN LANGUAGE INTERPRETER TABS */}
            {selectedMat.material_type === 'video' && (
              <div className="glass-card p-4" style={{ background: '#fff' }}>
                <nav className="tab-nav" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--line)', paddingBottom: '0.5rem' }}>
                  <button 
                    type="button"
                    className={`tab-btn ${activeMediaTab === 'video' ? 'active' : ''}`}
                    onClick={() => setActiveMediaTab('video')}
                    style={{ flex: 1, padding: '0.75rem', fontWeight: 800 }}
                  >
                    🎥 Video Stream
                  </button>
                  {signLanguage && (
                    <button 
                      type="button"
                      className={`tab-btn ${activeMediaTab === 'sign' ? 'active' : ''}`}
                      onClick={() => setActiveMediaTab('sign')}
                      style={{ flex: 1, padding: '0.75rem', fontWeight: 800 }}
                    >
                      📺 Sign-Language Overlay
                    </button>
                  )}
                  {captions && (
                    <button 
                      type="button"
                      className={`tab-btn ${activeMediaTab === 'captions' ? 'active' : ''}`}
                      onClick={() => setActiveMediaTab('captions')}
                      style={{ flex: 1, padding: '0.75rem', fontWeight: 800 }}
                    >
                      💬 Captions / Text Track
                    </button>
                  )}
                  {transcript && (
                    <button 
                      type="button"
                      className={`tab-btn ${activeMediaTab === 'transcript' ? 'active' : ''}`}
                      onClick={() => setActiveMediaTab('transcript')}
                      style={{ flex: 1, padding: '0.75rem', fontWeight: 800 }}
                    >
                      📜 Text Transcript
                    </button>
                  )}
                </nav>

                {activeMediaTab === 'video' && (
                  <div style={{ maxWidth: '720px', margin: '0 auto', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
                    <video 
                      controls 
                      style={{ width: '100%', display: 'block', maxHeight: '420px' }}
                      src={selectedMat.file_url}
                    >
                      {captions && captions.file_url && (
                        <track 
                          kind="captions" 
                          src={captions.file_url} 
                          srcLang="en" 
                          label="English" 
                          default 
                        />
                      )}
                    </video>
                  </div>
                )}

                {activeMediaTab === 'sign' && signLanguage && (
                  <div style={{ maxWidth: '720px', margin: '0 auto', background: '#000', borderRadius: '12px', overflow: 'hidden', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1rem' }}>Sign Language Interpreter Stream</h3>
                    <video 
                      src={signLanguage.file_url}
                      controls
                      loop
                      style={{ width: '100%', maxWidth: '480px', display: 'block', maxHeight: '360px', borderRadius: '8px' }}
                    />
                  </div>
                )}

                {activeMediaTab === 'captions' && captions && (
                  <div style={{ padding: '2rem', background: 'var(--paper)', borderRadius: '12px', border: '1px solid var(--line)', textAlign: 'left' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--brand-dark)' }}>Captions File Content</h3>
                    <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--ink)', lineHeight: '1.8' }}>
                      {captions.content_text || "Visual captions loaded. Play the video resource to see overlay transcripts."}
                    </p>
                  </div>
                )}

                {activeMediaTab === 'transcript' && transcript && (
                  <article className="transcript-block" style={{ marginTop: 0 }}>
                    <div className="transcript-header" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                      <Scroll size={16} />
                      <span>Video Lesson Text Transcript</span>
                    </div>
                    <div className="transcript-body" style={{ textAlign: 'left', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                      {transcript.content_text?.split('\n').map((para, i) => (
                        <p key={i} style={{ marginBottom: '0.75rem' }}>{para}</p>
                      ))}
                    </div>
                  </article>
                )}
              </div>
            )}

            {/* Lesson complete checklist card */}
            <footer 
              className="glass-card" 
              style={{ 
                marginTop: '2.5rem', 
                marginBottom: '5rem',
                padding: '1.5rem 2rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.5rem'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Have you finished reading/viewing this lesson?</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: '0.15rem' }}>
                  Marking lessons as complete tracks your learning progress to help instructors verify engagement.
                </p>
              </div>
              <button 
                onClick={handleToggleCompletion}
                className={`btn ${progressMap[selectedMat.id] === 'completed' ? 'btn-success' : 'btn-outline-brand'}`}
              >
                {progressMap[selectedMat.id] === 'completed' ? (
                  <>
                    <Check size={16} />
                    <span>Completed</span>
                  </>
                ) : (
                  <span>Mark Completed ✅</span>
                )}
              </button>
            </footer>
          </div>
        )}
      </section>
    </div>
  );
}

export default CourseClassroom;

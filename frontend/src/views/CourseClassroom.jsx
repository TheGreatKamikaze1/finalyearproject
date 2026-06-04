import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAccessibility } from '../context/AccessibilityContext';
import { ArrowLeft, BookOpen, FileText, Headphones, Video, CheckCircle2, Play, Pause, Square, Volume2, ExternalLink, Scroll, Check } from 'lucide-react';

function CourseClassroom({ user, courseId, navigateTo }) {
  const { preferences, speak, pauseSpeech, stopSpeech, speakingState } = useAccessibility();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [selectedMat, setSelectedMat] = useState(null);
  const [accItems, setAccItems] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  
  // TTS highlighting boundary state
  const [speechCharIndex, setSpeechCharIndex] = useState(null);
  const [ttsRate, setTtsRate] = useState(1.0);

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
        console.error("Failed to load classroom context:", err);
      } finally {
        setLoading(false);
      }
    }
    loadClassroom();
  }, [courseId]);

  // Handle selected material change (stop speech synthesis, load a11y details, auto-save in_progress status)
  const handleSelectMaterial = async (mat) => {
    stopSpeech();
    setSpeechCharIndex(null);
    setSelectedMat(mat);
    setAccItems([]);

    // Fetch related captions/transcripts/sign language interpretation links
    try {
      const items = await api(`/materials/${mat.id}/accessibility`);
      setAccItems(items);
    } catch (err) {
      console.warn("Failed to load accessibility items for material:", err);
    }

    // Check progress
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
      console.error("Progress save failed:", err);
    }
  };

  const handleToggleCompletion = async () => {
    if (!selectedMat) return;
    const currentStatus = progressMap[selectedMat.id] || 'not_started';
    const nextStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    await updateProgressStatus(selectedMat.id, nextStatus);
  };

  // Text-To-Speech execution
  const handleSpeakText = () => {
    if (!selectedMat || selectedMat.material_type !== 'text') return;
    
    // Trigger speaking
    speak(selectedMat.content_text, (charIndex) => {
      setSpeechCharIndex(charIndex);
    }, ttsRate);
  };

  // TTS Word highlighting parser
  const renderHighlightedContent = () => {
    if (!selectedMat || !selectedMat.content_text) return '';
    const text = selectedMat.content_text;
    
    if (speechCharIndex === null || speechCharIndex === undefined || speechCharIndex < 0) {
      return text.split('\n').map((para, i) => <p key={i} style={{ marginBottom: '1rem' }}>{para}</p>);
    }

    // Locate end of current word boundary
    let endIndex = speechCharIndex;
    while (endIndex < text.length && /\w/.test(text[endIndex])) {
      endIndex++;
    }

    const before = text.slice(0, speechCharIndex);
    const word = text.slice(speechCharIndex, endIndex);
    const after = text.slice(endIndex);

    return (
      <div className="lh-base">
        {before.split('\n').map((para, i, arr) => {
          if (i === arr.length - 1) {
            // Append word highlight inline to the last paragraph block
            return (
              <p key={i} style={{ marginBottom: '1rem', display: 'inline' }}>
                {para}
                <span className="tts-highlight" style={{ display: 'inline' }}>{word}</span>
                {after.split('\n')[0]}
              </p>
            );
          }
          return <p key={i} style={{ marginBottom: '1rem' }}>{para}</p>;
        })}
        {/* Render remainder paragraphs */}
        {after.split('\n').slice(1).map((para, i) => (
          <p key={i} style={{ marginBottom: '1rem', marginTop: i === 0 ? '1rem' : 0 }}>{para}</p>
        ))}
      </div>
    );
  };

  // Cleanup speech when navigating away
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <div style={{ border: '4px solid var(--line)', borderTop: '4px solid var(--brand)', borderRadius: '50%', width: '45px', height: '45px', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
        <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Syncing classroom assets...</p>
      </div>
    );
  }

  // Find accessibility files
  const transcript = accItems.find(x => x.kind === 'transcript');
  const captions = accItems.find(x => x.kind === 'captions');
  const signLanguage = accItems.find(x => x.kind === 'sign_language');

  return (
    <div className="classroom-grid">
      {/* Sidebar: Lessons checklist */}
      <aside className="lessons-sidebar">
        <button 
          onClick={() => navigateTo('dashboard')} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--brand)', marginBottom: '1.5rem', padding: 0 }}
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>

        <div style={{ marginBottom: '1.5rem' }}>
          <span className="course-code">{course?.course_code || 'GEN-101'}</span>
          <h2 style={{ fontSize: '1.35rem', marginTop: '0.2rem' }}>{course?.title}</h2>
        </div>

        <nav aria-label="Course curriculum lessons">
          <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Course Lessons
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

      {/* Main Classroom Viewer Viewport */}
      <section className="lesson-viewport">
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
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 style={{ fontSize: '2.1rem' }}>{selectedMat.title}</h1>
              <span className="badge-a11y-pill badge-hearing" style={{ textTransform: 'uppercase', margin: 0 }}>
                {selectedMat.material_type}
              </span>
            </div>

            {/* TEXT LESSON WITH TTS READ ALOUD SYSTEM */}
            {selectedMat.material_type === 'text' && (
              <div>
                <div className="tts-bar">
                  <div className="tts-bar-title">
                    <Volume2 size={20} />
                    <span>Audio Reader (Voice Synthesis)</span>
                  </div>
                  <div className="tts-actions">
                    <button className="btn btn-primary btn-sm" onClick={handleSpeakText}>
                      <Play size={14} />
                      <span>{speakingState.speaking ? 'Restart Speech' : 'Play Read Aloud'}</span>
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={pauseSpeech} disabled={!speakingState.speaking}>
                      <Pause size={14} />
                      <span>{speakingState.paused ? 'Resume' : 'Pause'}</span>
                    </button>
                    <button className="btn btn-secondary btn-sm" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }} onClick={stopSpeech} disabled={!speakingState.speaking}>
                      <Square size={14} />
                      <span>Stop</span>
                    </button>
                    
                    <select 
                      className="form-select form-select-sm" 
                      style={{ width: '100px', height: '32px', minHeight: '32px', padding: '0.25rem 0.5rem' }}
                      value={ttsRate}
                      onChange={(e) => setTtsRate(parseFloat(e.target.value))}
                      aria-label="Reading rate speed"
                    >
                      <option value="0.75">0.75x speed</option>
                      <option value="1.0">1.0x speed</option>
                      <option value="1.25">1.25x speed</option>
                      <option value="1.5">1.5x speed</option>
                      <option value="2.0">2.0x speed</option>
                    </select>
                  </div>
                </div>

                <article className="glass-card p-4" style={{ background: '#fff', fontSize: '1.2rem', minHeight: '200px' }} tabIndex={0}>
                  {renderHighlightedContent()}
                </article>
              </div>
            )}

            {/* PDF LESSON EMBEDDING */}
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

            {/* AUDIO LESSON W/ TRANSCRIPTS */}
            {selectedMat.material_type === 'audio' && (
              <div className="glass-card p-5" style={{ background: '#fff', textAlign: 'center' }}>
                <Headphones size={64} style={{ color: 'var(--brand)', marginBottom: '1.5rem' }} />
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                  <audio controls src={selectedMat.file_url} style={{ width: '100%', maxWidth: '600px' }} />
                </div>

                {transcript ? (
                  <article className="transcript-block">
                    <div className="transcript-header">
                      <Scroll size={16} />
                      <span>Audio Lesson Transcript</span>
                    </div>
                    <div className="transcript-body" style={{ textAlign: 'left' }}>
                      {transcript.content_text?.split('\n').map((para, i) => (
                        <p key={i} style={{ marginBottom: '0.75rem' }}>{para}</p>
                      ))}
                    </div>
                  </article>
                ) : (
                  <div style={{ padding: '1rem', background: 'var(--paper)', borderRadius: '6px', color: 'var(--muted)', fontSize: '0.9rem' }}>
                    No transcript has been uploaded for this audio resource.
                  </div>
                )}
              </div>
            )}

            {/* VIDEO LESSON W/ CAPTIONS, TRANSCRIPTS & SIGN LANGUAGE INTERPRETATION */}
            {selectedMat.material_type === 'video' && (
              <div className="glass-card p-4" style={{ background: '#fff', textAlign: 'center' }}>
                <div style={{ maxWidth: '720px', margin: '0 auto 1.5rem', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
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
                    Your browser does not support HTML5 video tag formats.
                  </video>
                </div>

                {signLanguage && signLanguage.file_url && (
                  <div className="recommended-pulse" style={{ padding: '1rem', background: 'var(--brand-light)', border: '1px solid var(--brand)', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📺</span>
                    <div>
                      <strong style={{ color: 'var(--brand-dark)', display: 'block' }}>Sign Language Interpreter Track Available</strong>
                      <a href={signLanguage.file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: 'var(--brand)' }}>
                        Open interpreter stream in overlay window <ExternalLink size={12} style={{ display: 'inline' }} />
                      </a>
                    </div>
                  </div>
                )}

                {transcript ? (
                  <article className="transcript-block">
                    <div className="transcript-header">
                      <Scroll size={16} />
                      <span>Video Lesson Text Transcript</span>
                    </div>
                    <div className="transcript-body" style={{ textAlign: 'left' }}>
                      {transcript.content_text?.split('\n').map((para, i) => (
                        <p key={i} style={{ marginBottom: '0.75rem' }}>{para}</p>
                      ))}
                    </div>
                  </article>
                ) : (
                  <div style={{ padding: '1rem', background: 'var(--paper)', borderRadius: '6px', color: 'var(--muted)', fontSize: '0.9rem' }}>
                    No transcript has been provided for this video resource.
                  </div>
                )}
              </div>
            )}

            {/* Classroom progress checklist card */}
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

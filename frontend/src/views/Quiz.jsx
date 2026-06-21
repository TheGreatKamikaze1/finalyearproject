import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { useAccessibility } from '../context/AccessibilityContext';
import { ArrowLeft, Play, Pause, Volume2, Timer, CheckCircle, ShieldAlert, Award, Star } from 'lucide-react';

function Quiz({ user, courseId, navigateTo }) {
  const { preferences, speak, stopSpeech } = useAccessibility();
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // question_id -> answer_string
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Time limit controls
  const [extendedTime, setExtendedTime] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds default
  const timerRef = useRef(null);

  const mode = preferences.accessibility_mode || 'standard';

  useEffect(() => {
    async function loadQuizzes() {
      try {
        setLoading(true);
        const data = await api(`/courses/${courseId}/quizzes`);
        setQuizzes(data);
      } catch (err) {
        console.error("Failed to load course quizzes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuizzes();
  }, [courseId]);

  // Set up timer when activeQuiz changes
  useEffect(() => {
    if (activeQuiz && mode !== 'cognitive') {
      const baseTime = extendedTime ? 1200 : 600; // 20 mins vs 10 mins
      setTimeLeft(baseTime);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto submit
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeQuiz, extendedTime, mode]);

  const handleStartQuiz = (quiz) => {
    stopSpeech();
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizResult(null);
    if (preferences.accessibility_mode === 'visual' && quiz.questions?.length > 0) {
      // Auto narrate first question
      speak(quiz.questions[0].text);
    }
  };

  const handleAnswerSelect = (questionId, option) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleNext = () => {
    stopSpeech();
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      if (preferences.accessibility_mode === 'visual') {
        speak(activeQuiz.questions[nextIdx].text);
      }
    }
  };

  const handlePrev = () => {
    stopSpeech();
    if (currentQuestionIndex > 0) {
      const prevIdx = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIdx);
      if (preferences.accessibility_mode === 'visual') {
        speak(activeQuiz.questions[prevIdx].text);
      }
    }
  };

  const handleSpeakQuestion = (q) => {
    const optsNarrative = q.options?.map((o, idx) => `Option ${idx + 1}: ${o}`).join('. ') || '';
    speak(`${q.text}. ${optsNarrative}`);
  };

  const handleSubmitQuiz = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    stopSpeech();

    // Check if all questions are answered (unless timer ran out)
    const unansweredCount = activeQuiz.questions.length - Object.keys(selectedAnswers).length;
    if (unansweredCount > 0 && timeLeft > 0) {
      if (!window.confirm(`You have left ${unansweredCount} questions unanswered. Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);
    const answersPayload = Object.keys(selectedAnswers).map(qId => ({
      question_id: parseInt(qId),
      answer: selectedAnswers[qId]
    }));

    try {
      const result = await api(`/quizzes/${activeQuiz.id}/submit`, {
        method: 'POST',
        body: { answers: answersPayload }
      });
      setQuizResult(result);
    } catch (err) {
      alert(`Quiz submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const answersPayload = Object.keys(selectedAnswers).map(qId => ({
      question_id: parseInt(qId),
      answer: selectedAnswers[qId]
    }));
    try {
      const result = await api(`/quizzes/${activeQuiz.id}/submit`, {
        method: 'POST',
        body: { answers: answersPayload }
      });
      setQuizResult(result);
      alert("Time limit reached. Your quiz has been automatically submitted.");
    } catch (err) {
      console.error("Auto submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <div style={{ border: '4px solid var(--line)', borderTop: '4px solid var(--brand)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
        <p style={{ color: 'var(--muted)' }}>Retrieving course assessments...</p>
      </div>
    );
  }

  // Helper cleanup on exit
  const handleExitQuiz = () => {
    stopSpeech();
    if (timerRef.current) clearInterval(timerRef.current);
    setActiveQuiz(null);
    setQuizResult(null);
  };

  return (
    <div className="main-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={() => {
          if (activeQuiz && !quizResult) {
            if (window.confirm("Are you sure you want to exit? Your current answers will be lost.")) {
              handleExitQuiz();
            }
          } else {
            navigateTo('classroom', { courseId });
          }
        }} 
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
        aria-label="Return to course classroom"
      >
        <ArrowLeft size={16} />
        <span>Exit Quiz Workspace</span>
      </button>

      {/* QUIZ SELECTION LIST (START SCREEN) */}
      {!activeQuiz && (
        <section aria-label="Available Quizzes">
          <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Course Assessments</h1>
          {quizzes.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--muted)' }}>
              No assessment quizzes have been assigned for this course yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {quizzes.map(quiz => (
                <article key={quiz.id} className="glass-card p-4" style={{ background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{quiz.title}</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                      {quiz.description || "Take this multiple choice practice quiz to test your understanding."}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--brand)', fontWeight: 700, marginTop: '0.4rem' }}>
                      Questions: {quiz.questions?.length || 0}
                    </p>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleStartQuiz(quiz)}
                    aria-label={`Start assessment: ${quiz.title}`}
                  >
                    Start Quiz
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ACTIVE QUIZ SCREEN */}
      {activeQuiz && !quizResult && (
        <article className="glass-card p-4" style={{ background: '#fff' }}>
          {/* Header block with Timer / Accommodations */}
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--line)', paddingBottom: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="course-code">Active Assessment</span>
              <h1 style={{ fontSize: '1.5rem' }}>{activeQuiz.title}</h1>
            </div>

            {/* Timer Adapter */}
            {mode === 'cognitive' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--success-light)', border: '1px solid var(--success)', padding: '0.5rem 1rem', borderRadius: '20px', color: 'var(--success)' }}>
                <span>🌟 Relaxed learning: No timer active</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* Extended time switch toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '1rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                  <input 
                    type="checkbox" 
                    checked={extendedTime} 
                    onChange={(e) => setExtendedTime(e.target.checked)}
                    disabled={currentQuestionIndex > 0 || Object.keys(selectedAnswers).length > 0} 
                  />
                  <span>Extend Time (20 min)</span>
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: timeLeft < 60 ? 'var(--accent)' : 'var(--muted)', fontWeight: 800 }}>
                  <Timer size={16} />
                  <span aria-label={`Time left: ${formatTime(timeLeft)}`}>{formatTime(timeLeft)}</span>
                </div>
              </div>
            )}
          </header>

          {/* Question Viewport */}
          {activeQuiz.questions?.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>This quiz has no questions uploaded.</p>
          ) : (
            <div>
              {/* Question progress tracker */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                {mode === 'cognitive' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 800 }}>Question progress:</span>
                    {activeQuiz.questions.map((_, idx) => (
                      <Star 
                        key={idx} 
                        size={18} 
                        style={{ 
                          fill: idx <= currentQuestionIndex ? 'var(--warning)' : 'none', 
                          color: idx <= currentQuestionIndex ? 'var(--warning)' : 'var(--line)' 
                        }} 
                      />
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                    Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
                  </span>
                )}

                {/* Speak question button */}
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleSpeakQuestion(activeQuiz.questions[currentQuestionIndex])}
                  aria-label="Read question and options aloud"
                >
                  <Volume2 size={14} />
                  <span>Narration</span>
                </button>
              </div>

              {/* Question card */}
              {activeQuiz.questions.map((q, idx) => {
                if (idx !== currentQuestionIndex) return null;

                return (
                  <fieldset key={q.id} style={{ border: 'none', margin: '0 0 2rem' }}>
                    <legend style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1.5rem', width: '100%', float: 'left' }}>
                      {q.text}
                    </legend>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', float: 'left' }}>
                      {q.options?.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[q.id] === opt;
                        const labelId = `q-${q.id}-opt-${oIdx}`;
                        return (
                          <label 
                            key={oIdx}
                            htmlFor={labelId}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.75rem', 
                              padding: '1rem', 
                              background: isSelected ? 'var(--brand-light)' : 'var(--paper)', 
                              border: isSelected ? '2px solid var(--brand)' : '2px solid var(--line)', 
                              borderRadius: 'var(--radius-sm)', 
                              cursor: 'pointer',
                              fontWeight: 700,
                              transition: 'var(--transition)'
                            }}
                          >
                            <input 
                              type="radio" 
                              name={`question-${q.id}`} 
                              id={labelId}
                              checked={isSelected}
                              onChange={() => handleAnswerSelect(q.id, opt)}
                              style={{ width: '18px', height: '18px', accentColor: 'var(--brand)' }}
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}

              {/* Navigation buttons */}
              <footer style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--line)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  aria-label="Go back to previous question"
                >
                  Previous Question
                </button>

                {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                  <button 
                    className="btn btn-secondary" 
                    onClick={handleNext}
                    disabled={!selectedAnswers[activeQuiz.questions[currentQuestionIndex].id]}
                    aria-label="Proceed to next question"
                  >
                    Next Question
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                    aria-label="Submit your answers for grading"
                  >
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </button>
                )}
              </footer>
            </div>
          )}
        </article>
      )}

      {/* QUIZ SCORE RESULT VIEW */}
      {activeQuiz && quizResult && (
        <section aria-labelledby="score-title" className="glass-card p-5" style={{ background: '#fff', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Award size={64} style={{ color: 'var(--warning)' }} />
          </div>
          <h1 id="score-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Assessment Completed</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
            Thank you for completing this module assessment. Your score has been submitted to your instructor portal.
          </p>

          <div style={{ background: 'var(--paper)', display: 'inline-block', padding: '1.5rem 3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', marginBottom: '2.5rem' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Your Grade Score</span>
            <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--brand)' }}>{roundScore(quizResult.score)}%</span>
            <span style={{ display: 'block', fontSize: '0.9rem', marginTop: '0.25rem', color: 'var(--muted)' }}>
              ({quizResult.score >= 50.0 ? "PASS" : "FAIL"})
            </span>
          </div>

          <div>
            <button 
              className="btn btn-primary" 
              onClick={handleExitQuiz}
              aria-label="Return to course quizzes syllabus menu"
            >
              Continue to Syllabus
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

// Helpers
function roundScore(val) {
  return Math.round(val * 10) / 10;
}

export default Quiz;

import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { ArrowRight, BookOpen, Volume2, ShieldCheck, HelpCircle, Eye, Accessibility } from 'lucide-react';

function Onboarding({ user, navigateTo }) {
  const { preferences, speak, stopSpeech } = useAccessibility();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to AccessLearn",
      description: "AccessLearn is your personalized learning classroom. We adapt lesson layout, colors, and content options around your accessibility mode to make learning comfortable.",
      cognitiveText: "Welcome! AccessLearn helps you study. We make the page simple and clear to help you focus.",
      visualNarrate: "Welcome to AccessLearn! This is slide one. AccessLearn is your personalized e-learning workspace. We adapt lesson content, contrast, and layout elements globally around your selection.",
      icon: <Accessibility size={48} style={{ color: 'var(--brand)' }} />,
    },
    {
      title: "How to Navigate the App",
      description: "Use the global top bar to switch pages. Press the Tab key on your keyboard to navigate through elements, and press Enter or Space to click/select buttons.",
      cognitiveText: "Use the buttons on the screen to switch pages. Take your time, there is no rush.",
      visualNarrate: "Slide two. Keyboard Navigation. Press the Tab key on your keyboard repeatedly to focus on buttons and fields. A yellow border will outline the selected item. Press Enter or Space to select.",
      icon: <Eye size={48} style={{ color: 'var(--accent)' }} />,
    },
    {
      title: "Learning Materials & Formats",
      description: "Lessons support multi-modal formats simultaneously. You can play videos with forced captions, read text transcripts, load dyslexia-friendly fonts, or turn on the Audio voice reader.",
      cognitiveText: "Study lessons by reading text, listening to voice read-alouds, or watching captioned video.",
      visualNarrate: "Slide three. Adaptive Materials. Lessons include video with subtitles, audio lectures, and text summaries. Text lessons feature an Audio Reader voice synthesizer to narrate pages.",
      icon: <BookOpen size={48} style={{ color: 'var(--brand)' }} />,
    },
    {
      title: "Get Support & Help",
      description: "Need help? The Support Chat page connects you directly to instructors or support staff. The Help Center provides plain-language explanations of all platform tools.",
      cognitiveText: "Need help? You can chat with your teacher anytime by going to the Support Chat page.",
      visualNarrate: "Slide four. Support and Help. The Support Chat allows you to message instructors directly. The Help Center provides descriptions of all accessibility features. Onboarding complete.",
      icon: <HelpCircle size={48} style={{ color: 'var(--success)' }} />,
    }
  ];

  // Auto-narrate slides on transition if in visual impairment mode
  useEffect(() => {
    if (preferences.accessibility_mode === 'visual') {
      stopSpeech();
      const slide = slides[currentSlide];
      speak(slide.visualNarrate || slide.description);
    }
    return () => stopSpeech();
  }, [currentSlide, preferences.accessibility_mode]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      stopSpeech();
      // Complete onboarding and enter dashboard
      navigateTo('dashboard');
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const mode = preferences.accessibility_mode || 'standard';
  const slide = slides[currentSlide];

  return (
    <div className="onboarding-container" style={{ display: 'grid', placeItems: 'center', minHeight: '80vh', padding: '2rem' }}>
      <main 
        className="glass-card onboarding-card" 
        style={{ maxWidth: '640px', width: '100%', padding: '3rem', textAlign: 'center', background: '#fff' }}
        aria-live="polite"
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {slide.icon}
        </div>
        
        {/* Simple Progress Indicators (Illustration for Cognitive, standard dots for others) */}
        {mode === 'cognitive' ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {slides.map((_, i) => (
              <span 
                key={i} 
                style={{ 
                  fontSize: '1.25rem', 
                  color: i === currentSlide ? 'var(--brand)' : 'var(--line)', 
                  fontWeight: 800 
                }}
                aria-hidden="true"
              >
                {i === currentSlide ? '🌟' : '○'}
              </span>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {slides.map((_, i) => (
              <span 
                key={i} 
                className={`dot ${i === currentSlide ? 'active' : ''}`}
                style={{ 
                  display: 'inline-block', 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  backgroundColor: i === currentSlide ? 'var(--brand)' : 'var(--line)',
                  transition: 'var(--transition)'
                }}
                aria-label={`Slide ${i + 1} of ${slides.length}`}
              />
            ))}
          </div>
        )}

        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{slide.title}</h1>
        
        <p style={{ color: 'var(--muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          {mode === 'cognitive' ? slide.cognitiveText : slide.description}
        </p>

        {/* Action controllers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Cognitive mode has no skipping, and forces step-by-step progress */}
          {mode !== 'cognitive' && currentSlide < slides.length - 1 ? (
            <button 
              className="btn btn-secondary" 
              onClick={() => { stopSpeech(); navigateTo('dashboard'); }}
              aria-label="Skip walkthrough and go straight to workspace"
            >
              Skip Onboarding
            </button>
          ) : (
            <div style={{ width: '10px' }} />
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {currentSlide > 0 && (
              <button 
                className="btn btn-secondary" 
                onClick={handlePrev}
                aria-label="Previous step"
              >
                Back
              </button>
            )}
            
            <button 
              className="btn btn-primary" 
              onClick={handleNext}
              aria-label={currentSlide === slides.length - 1 ? "Complete onboarding and go to dashboard" : "Next step"}
            >
              <span>{currentSlide === slides.length - 1 ? "Get Started" : "Continue"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </main>

      <style>{`
        .onboarding-card {
          box-shadow: var(--shadow-lg);
          border-top: 6px solid var(--brand);
        }
      `}</style>
    </div>
  );
}

export default Onboarding;

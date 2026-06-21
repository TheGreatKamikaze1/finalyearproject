import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
  // Local state initialized from default values
  const [preferences, setPreferences] = useState({
    disability_profile: [],
    preferred_format: 'mixed',
    high_contrast: false,
    reduce_motion: false,
    captions_required: true,
    screen_reader_optimized: false,
    dyslexia_font: false,
    font_size: 'md',
    accessibility_mode: 'standard',
    guardian_contact_name: '',
    guardian_contact_info: '',
  });

  const [rulerActive, setRulerActive] = useState(false);
  const [rulerY, setRulerY] = useState(0);
  const [speakingState, setSpeakingState] = useState({
    speaking: false,
    paused: false,
    rate: 1.0,
  });

  const utteranceRef = useRef(null);

  // Apply visual overrides to Document elements
  const applyVisualOverrides = (prefs) => {
    if (!prefs) return;
    const body = document.body;
    const html = document.documentElement;

    const mode = prefs.accessibility_mode || 'standard';

    // Apply primary mode classes
    body.classList.toggle('mode-standard', mode === 'standard');
    body.classList.toggle('mode-visual', mode === 'visual');
    body.classList.toggle('mode-hearing', mode === 'hearing');
    body.classList.toggle('mode-cognitive', mode === 'cognitive');

    // High Contrast: forced if mode is visual, otherwise user preference
    const highContrastEnabled = mode === 'visual' ? true : Boolean(prefs.high_contrast);
    body.classList.toggle('high-contrast', highContrastEnabled);

    // Reduce Motion: forced if mode is cognitive, otherwise user preference
    const reduceMotionEnabled = mode === 'cognitive' ? true : Boolean(prefs.reduce_motion);
    body.classList.toggle('reduce-motion', reduceMotionEnabled);

    // Dyslexia Spacing Font
    body.classList.toggle('dyslexia-font', Boolean(prefs.dyslexia_font));

    // Font Sizing
    html.classList.remove('text-size-sm', 'text-size-md', 'text-size-lg', 'text-size-xl');
    html.classList.add(`text-size-${prefs.font_size || 'md'}`);
  };

  // Helper to load user profile from cache
  const updatePreferences = (newPrefs) => {
    setPreferences(newPrefs);
    applyVisualOverrides(newPrefs);
  };

  // Setup dyslexia ruler mouse move listener
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (rulerActive) {
        setRulerY(e.clientY - 12);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [rulerActive]);

  useEffect(() => {
    document.body.classList.toggle('ruler-active', rulerActive);
  }, [rulerActive]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ====== TEXT TO SPEECH (TTS) CONTROLLER ======
  const speak = (text, onBoundaryCallback = null, rate = 1.0) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-Speech is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    if (!text) {
      setSpeakingState({ speaking: false, paused: false, rate });
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utteranceRef.current = utterance;

    utterance.onstart = () => {
      setSpeakingState({ speaking: true, paused: false, rate });
    };

    utterance.onend = () => {
      setSpeakingState({ speaking: false, paused: false, rate });
      if (onBoundaryCallback) onBoundaryCallback(null);
    };

    utterance.onerror = () => {
      setSpeakingState({ speaking: false, paused: false, rate });
      if (onBoundaryCallback) onBoundaryCallback(null);
    };

    if (onBoundaryCallback) {
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          onBoundaryCallback(event.charIndex);
        }
      };
    }

    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (window.speechSynthesis.speaking) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setSpeakingState(prev => ({ ...prev, paused: false }));
      } else {
        window.speechSynthesis.pause();
        setSpeakingState(prev => ({ ...prev, paused: true }));
      }
    }
  };

  const stopSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setSpeakingState(prev => ({ ...prev, speaking: false, paused: false }));
  };

  return (
    <AccessibilityContext.Provider
      value={{
        preferences,
        updatePreferences,
        rulerActive,
        setRulerActive,
        rulerY,
        speakingState,
        speak,
        pauseSpeech,
        stopSpeech,
      }}
    >
      {children}
      {/* Dyslexia reading ruler element overlay */}
      <div
        className="reading-ruler"
        style={{ top: `${rulerY}px` }}
        aria-hidden="true"
      />
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

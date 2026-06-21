import React from 'react';
import { ArrowLeft, BookOpen, Eye, Volume2, Sparkles, Keyboard, ShieldAlert } from 'lucide-react';

function HelpCenter({ navigateTo }) {
  return (
    <div className="main-content" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigateTo('dashboard')} 
          className="btn btn-secondary btn-sm"
          aria-label="Back to dashboard screen"
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>
        <h1 style={{ fontSize: '2.2rem', margin: 0 }}>Help & Accessibility Center</h1>
      </header>

      <section aria-labelledby="intro-help-header" className="glass-card p-4" style={{ background: '#fff', marginBottom: '2.5rem' }}>
        <h2 id="intro-help-header" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Welcome to the Accessibility Hub</h2>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          AccessLearn adapts to your needs. This page explains how each adaptive tool works in plain, simple language. You can adjust these settings at any time in the **Accessibility Hub** sidebar or under **Settings**.
        </p>
      </section>

      {/* DETAILED FEATURES LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Visual accommodations */}
        <article className="glass-card p-4" style={{ background: '#fff' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Eye size={22} style={{ color: 'var(--brand)' }} />
            <span>Visual Support Features</span>
          </h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <strong>High Contrast:</strong> Changes colors to dark grey, black, and white so text is easier to read for low vision eyes.
            </li>
            <li>
              <strong>Text Scale:</strong> Lets you increase font sizes by up to 200% so you do not have to squint.
            </li>
            <li>
              <strong>Reading Ruler:</strong> Creates a bright yellow line that follows your mouse to help your eyes stay on the correct line of text. Click "Enable Reading Ruler" on the dashboard to turn it on.
            </li>
            <li>
              <strong>Audio Narrator (Voice Synthesis):</strong> Reads out lesson texts, quiz questions, and image details. Click the "Play Read Aloud" button on any text lesson.
            </li>
          </ul>
        </article>

        {/* Hearing accommodations */}
        <article className="glass-card p-4" style={{ background: '#fff' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Volume2 size={22} style={{ color: 'var(--accent)' }} />
            <span>Hearing Support Features</span>
          </h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <strong>Video Captions:</strong> Automatically displays captions/subtitles on all video lessons so you can read what the teacher is saying.
            </li>
            <li>
              <strong>Lesson Transcripts:</strong> Provides a toggleable box below audio and video lessons showing the complete text write-up.
            </li>
            <li>
              <strong>Visual Alert Flashers:</strong> Banners and flashing icons appear when there are notifications. This ensures you do not miss warnings that usually rely on sound.
            </li>
            <li>
              <strong>Sign Language Overlay:</strong> Adds a button to load an overlay window containing a sign language interpreter for lessons that have them uploaded.
            </li>
          </ul>
        </article>

        {/* Cognitive accommodations */}
        <article className="glass-card p-4" style={{ background: '#fff' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Sparkles size={22} style={{ color: 'var(--warning)' }} />
            <span>Cognitive & Attention Support</span>
          </h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <strong>Plain Language Mode:</strong> Replaces long words and complicated descriptions with short sentences and simpler words.
            </li>
            <li>
              <strong>Timer-Free Quizzes:</strong> Removes time countdowns on quizzes so you can take tests without feeling time pressure.
            </li>
            <li>
              <strong>Calm Motion:</strong> Turns off micro-animations and animations that might be distracting.
            </li>
            <li>
              <strong>Dyslexia Spacing:</strong> Applies Lexend or Atkinson Hyperlegible fonts with wider letter spacing to make reading books and lessons more stable.
            </li>
          </ul>
        </article>

        {/* Keyboard instructions */}
        <article className="glass-card p-4" style={{ background: '#fff' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Keyboard size={22} style={{ color: 'var(--brand-dark)' }} />
            <span>Keyboard Shortcuts & Navigation</span>
          </h3>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>
            You do not need a mouse to use AccessLearn. You can interact with all pages using your keyboard keys:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <strong>Tab key:</strong> Press Tab to jump to the next button, link, or entry field.
            </li>
            <li>
              <strong>Shift + Tab:</strong> Press together to jump backwards to the previous button.
            </li>
            <li>
              <strong>Enter or Space:</strong> Press to click/activate the highlighted item.
            </li>
            <li>
              <strong>Arrow Keys:</strong> Press to change options inside dropdown menus or selection checklists.
            </li>
          </ul>
        </article>
      </div>

      <footer style={{ marginTop: '3rem', marginBottom: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>
          Need additional assistance? Contact support staff via the **Support Chat** page for immediate support.
        </p>
      </footer>
    </div>
  );
}

export default HelpCenter;

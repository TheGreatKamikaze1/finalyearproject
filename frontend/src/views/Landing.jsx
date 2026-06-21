import React from 'react';
import { BookOpen, Shield, Accessibility, Eye, Volume2, Sparkles, LogIn, UserPlus } from 'lucide-react';

function Landing({ navigateTo }) {
  return (
    <div className="landing-page-container">
      {/* Hero section */}
      <section className="hero-landing" aria-labelledby="hero-main-title">
        <div className="hero-text-content">
          <div className="brand" style={{ marginBottom: '1.5rem', color: 'var(--brand-dark)' }}>
            <span className="brand-mark" aria-hidden="true">AL</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>AccessLearn</span>
          </div>
          <h1 id="hero-main-title">
            Online Education, <span style={{ color: 'var(--brand)' }}>Tailored for Everyone</span>
          </h1>
          <p className="hero-p">
            AccessLearn is an inclusive e-learning platform that dynamically adapts its layout, interface, and material delivery to support students with visual, hearing, cognitive, or motor differences.
          </p>
          <div className="hero-ctas" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => navigateTo('register')}
              aria-label="Get started and create a new account"
            >
              <UserPlus size={18} />
              <span>Get Started</span>
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigateTo('login')}
              aria-label="Sign in to your existing account"
            >
              <LogIn size={18} />
              <span>Sign In</span>
            </button>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="glass-card decorative-glass" style={{ padding: '2rem', maxWidth: '400px' }}>
            <Accessibility size={48} style={{ color: 'var(--brand)', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Personalized Workspaces</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              Select visual contrast, narration controls, captions, simplified content, or screen-reader loops during setup.
            </p>
          </div>
        </div>
      </section>

      {/* Accessibility modes overview */}
      <section className="modes-overview" aria-labelledby="modes-section-title">
        <div className="section-header" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem' }}>
          <span className="badge-a11y-pill badge-vision" style={{ fontSize: '0.75rem' }}>Features</span>
          <h2 id="modes-section-title" style={{ fontSize: '2.2rem', marginTop: '0.5rem' }}>Choose your learning comfort</h2>
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
            Every user selects a specialized mode that customizes the layout, interactions, and content styles.
          </p>
        </div>

        <div className="stat-grid" style={{ gap: '1.5rem' }}>
          <article className="feature-item glass-card p-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span className="badge-a11y-pill badge-vision" style={{ margin: 0, padding: '0.4rem' }}>
                <Eye size={20} />
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Visual Impairment</h3>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              For blind and low vision students. Prompts AAA 7:1 color contrast, custom text scaling, full keyboard Tab outlines, and integrated text-to-speech voice narration.
            </p>
          </article>

          <article className="feature-item glass-card p-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span className="badge-a11y-pill badge-hearing" style={{ margin: 0, padding: '0.4rem' }}>
                <Volume2 size={20} />
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Deaf / Hard of Hearing</h3>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              For students requiring audio-equivalent text. Forces captions on video materials, enables reading transcripts, and maps sound signals to visual notification flashes.
            </p>
          </article>

          <article className="feature-item glass-card p-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span className="badge-a11y-pill badge-cognitive" style={{ margin: 0, padding: '0.4rem' }}>
                <Sparkles size={20} />
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Cognitive / Attention</h3>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              For dyslexia, ADHD, or learning differences. Shows one primary item/task per screen, disables countdowns/timers, blocks autoplay, and supports plain-language toggling.
            </p>
          </article>

          <article className="feature-item glass-card p-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span className="badge-a11y-pill badge-mobility" style={{ margin: 0, padding: '0.4rem' }}>
                <Shield size={20} />
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Standard Mode</h3>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              For general learners who do not require specific visual or cognitive accommodations. Focuses on clean modern design and responsive learning formats.
            </p>
          </article>
        </div>
      </section>

      {/* Call to action footer */}
      <section className="landing-footer glass-card" style={{ padding: '3rem', margin: '4rem 0 2rem', textAlign: 'center', background: 'var(--brand-light)' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--brand-dark)' }}>Ready to experience accessible learning?</h2>
        <p style={{ color: 'var(--muted)', maxWidth: '600px', margin: '0.5rem auto 1.5rem' }}>
          Create an account in seconds, select your profile preferences, and explore our adapted syllabus catalog.
        </p>
        <button 
          className="btn btn-primary btn-lg" 
          onClick={() => navigateTo('register')}
          aria-label="Create your student or instructor account now"
        >
          <span>Create Free Account</span>
        </button>
      </section>

      <style>{`
        .landing-page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }
        .hero-landing {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 3rem;
          align-items: center;
          padding: 4rem 0;
        }
        .hero-text-content h1 {
          font-size: clamp(2.5rem, 5vw, 3.8rem);
          line-height: 1.1;
          margin-bottom: 1rem;
          color: var(--ink);
          letter-spacing: -0.02em;
        }
        .hero-p {
          font-size: 1.15rem;
          color: var(--muted);
          line-height: 1.6;
        }
        .hero-visual {
          display: flex;
          justify-content: center;
        }
        .decorative-glass {
          border-left: 5px solid var(--brand);
          box-shadow: var(--shadow-lg);
        }
        .modes-overview {
          padding: 5rem 0 2rem;
        }
        @media (max-width: 900px) {
          .hero-landing {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 2rem 0;
          }
          .hero-ctas {
            justify-content: center;
          }
          .hero-visual {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default Landing;

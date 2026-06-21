import React, { useState, useEffect } from 'react';
import { api, getToken, clearSession, cachedUser } from './utils/api';
import { useAccessibility } from './context/AccessibilityContext';
import Landing from './views/Landing';
import Login from './views/Login';
import Register from './views/Register';
import Onboarding from './views/Onboarding';
import Dashboard from './views/Dashboard';
import CourseCatalog from './views/CourseCatalog';
import CourseDetail from './views/CourseDetail';
import CourseClassroom from './views/CourseClassroom';
import Quiz from './views/Quiz';
import ProgressGrades from './views/ProgressGrades';
import ProfileSettings from './views/ProfileSettings';
import Notifications from './views/Notifications';
import MessagesSupport from './views/MessagesSupport';
import DiscussionForum from './views/DiscussionForum';
import HelpCenter from './views/HelpCenter';
import InstructorStudio from './views/InstructorStudio';
import { BookOpen, LogOut, User, Bell, MessageSquare, Sliders, HelpCircle, GraduationCap } from 'lucide-react';

function App() {
  const [user, setUser] = useState(cachedUser());
  const [currentView, setCurrentView] = useState({ name: 'landing' });
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(false);
  const { preferences, updatePreferences } = useAccessibility();

  // Validate session on app launch
  useEffect(() => {
    async function checkSession() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        setCurrentView({ name: 'landing' });
        return;
      }
      try {
        const userData = await api('/auth/me');
        setUser(userData);
        updatePreferences(userData); // Apply their visual preferences immediately
        
        if (userData.role === 'instructor') {
          setCurrentView({ name: 'instructor' });
        } else {
          setCurrentView({ name: 'dashboard' });
        }
      } catch (err) {
        console.error("Session restoration failed:", err);
        clearSession();
        setUser(null);
        setCurrentView({ name: 'landing' });
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  // Poll for notifications count
  useEffect(() => {
    if (!user) return;
    async function fetchUnreadCount() {
      try {
        const data = await api('/notifications');
        setUnreadNotifications(data.some(n => !n.is_read));
      } catch (err) {
        console.warn("Notifications count fetch failed:", err);
      }
    }
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setCurrentView({ name: 'landing' });
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    updatePreferences(userData);
    if (userData.role === 'instructor') {
      setCurrentView({ name: 'instructor' });
    } else {
      // Check if onboarding is needed
      setCurrentView({ name: 'onboarding' });
    }
  };

  const navigateTo = (viewName, params = {}) => {
    setCurrentView({ name: viewName, ...params });
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: 'var(--paper)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand-mark" style={{ margin: '0 auto 1.5rem', fontSize: '1.5rem' }}>AL</div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--muted)' }}>Configuring your classroom...</h2>
        </div>
      </div>
    );
  }

  // Render proper View component based on custom routing state
  const renderView = () => {
    switch (currentView.name) {
      case 'landing':
        return <Landing navigateTo={navigateTo} />;
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} onNavigateRegister={() => navigateTo('register')} onNavigateLanding={() => navigateTo('landing')} />;
      case 'register':
        return <Register onRegisterSuccess={handleLoginSuccess} onNavigateLogin={() => navigateTo('login')} onNavigateLanding={() => navigateTo('landing')} />;
      case 'onboarding':
        return <Onboarding user={user} navigateTo={navigateTo} />;
      case 'dashboard':
        return <Dashboard user={user} onLogout={handleLogout} navigateTo={navigateTo} />;
      case 'catalog':
        return <CourseCatalog user={user} navigateTo={navigateTo} />;
      case 'coursedetail':
        return <CourseDetail user={user} courseId={currentView.courseId} navigateTo={navigateTo} />;
      case 'classroom':
        return <CourseClassroom user={user} courseId={currentView.courseId} navigateTo={navigateTo} />;
      case 'quiz':
        return <Quiz user={user} courseId={currentView.courseId} navigateTo={navigateTo} />;
      case 'grades':
        return <ProgressGrades user={user} navigateTo={navigateTo} />;
      case 'settings':
        return <ProfileSettings user={user} navigateTo={navigateTo} />;
      case 'notifications':
        return <Notifications user={user} navigateTo={navigateTo} />;
      case 'messages':
        return <MessagesSupport user={user} navigateTo={navigateTo} />;
      case 'help':
        return <HelpCenter user={user} navigateTo={navigateTo} />;
      case 'forum':
        return <DiscussionForum user={user} courseId={currentView.courseId} navigateTo={navigateTo} />;
      case 'instructor':
        return <InstructorStudio user={user} onLogout={handleLogout} navigateTo={navigateTo} />;
      default:
        return <Landing navigateTo={navigateTo} />;
    }
  };

  // Header/Navbar layout logic for logged-in sessions
  const showNavbar = user && currentView.name !== 'login' && currentView.name !== 'register' && currentView.name !== 'landing' && currentView.name !== 'onboarding';

  return (
    <div className="app-container">
      <a className="skip-link" href="#mainContent">Skip to main content</a>
      
      {showNavbar && (
        <header className="navbar-app">
          <div className="navbar-container">
            <button 
              className="brand" 
              style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
              onClick={() => {
                if (user.role === 'instructor') {
                  navigateTo('instructor');
                } else {
                  navigateTo('dashboard');
                }
              }}
              aria-label="AccessLearn logo, click to return to Dashboard"
            >
              <span className="brand-mark" aria-hidden="true">AL</span>
              <span>AccessLearn</span>
            </button>

            {/* Custom Mode label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`badge-a11y-pill badge-${preferences.accessibility_mode || 'standard'}`} style={{ fontWeight: 800 }}>
                {preferences.accessibility_mode ? preferences.accessibility_mode.toUpperCase() : 'STANDARD'} MODE
              </span>
            </div>

            <div className="nav-actions">
              {user.role === 'instructor' ? (
                <>
                  <button className="btn btn-outline-brand btn-sm" onClick={() => navigateTo('instructor')}>
                    Studio Control
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigateTo('dashboard')}>
                    View Student Mode
                  </button>
                </>
              ) : (
                <nav aria-label="Main menu" style={{ display: 'flex', alignItems: 'center', gap: '0.50rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigateTo('dashboard')} aria-label="Dashboard Home">
                    Home
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigateTo('catalog')} aria-label="Course catalog">
                    Catalog
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigateTo('grades')} aria-label="My progress and grades">
                    Grades
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigateTo('messages')} aria-label="Support chat desk">
                    <MessageSquare size={16} />
                  </button>
                  <button 
                    className={`btn btn-secondary btn-sm ${unreadNotifications && preferences.accessibility_mode === 'hearing' ? 'flash-indicator' : ''}`} 
                    onClick={() => navigateTo('notifications')} 
                    aria-label={unreadNotifications ? "You have unread notifications" : "Notifications center"}
                    style={{ position: 'relative' }}
                  >
                    <Bell size={16} />
                    {unreadNotifications && (
                      <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }} />
                    )}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigateTo('help')} aria-label="Help and Accessibility documentation">
                    <HelpCircle size={16} />
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigateTo('settings')} aria-label="Workspace Customizations">
                    <Sliders size={16} />
                  </button>
                </nav>
              )}
              
              <button className="btn btn-secondary btn-sm" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }} onClick={handleLogout} aria-label="Sign out of your session">
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </header>
      )}

      <main id="mainContent" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderView()}
      </main>

      <style>{`
        .flash-indicator {
          animation: navAlertFlash 1s infinite !important;
          border-color: var(--accent) !important;
        }

        @keyframes navAlertFlash {
          0% { background-color: var(--panel); }
          50% { background-color: var(--accent-light); }
          100% { background-color: var(--panel); }
        }
      `}</style>
    </div>
  );
}

export default App;

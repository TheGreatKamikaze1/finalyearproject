import React, { useState, useEffect } from 'react';
import { api, getToken, clearSession, cachedUser } from './utils/api';
import { useAccessibility } from './context/AccessibilityContext';
import Login from './views/Login';
import Register from './views/Register';
import Dashboard from './views/Dashboard';
import CourseClassroom from './views/CourseClassroom';
import InstructorStudio from './views/InstructorStudio';
import { BookOpen, LogOut } from 'lucide-react';

function App() {
  const [user, setUser] = useState(cachedUser());
  const [currentView, setCurrentView] = useState({ name: 'login' });
  const [loading, setLoading] = useState(true);
  const { updatePreferences } = useAccessibility();

  // Validate session on app launch
  useEffect(() => {
    async function checkSession() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await api('/auth/me');
        setUser(userData);
        updatePreferences(userData); // Apply their visual preferences immediately
        
        if (userData.role === 'instructor' || userData.role === 'support') {
          setCurrentView({ name: 'instructor' });
        } else {
          setCurrentView({ name: 'dashboard' });
        }
      } catch (err) {
        console.error("Session restoration failed:", err);
        clearSession();
        setUser(null);
        setCurrentView({ name: 'login' });
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setCurrentView({ name: 'login' });
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    updatePreferences(userData);
    if (userData.role === 'instructor' || userData.role === 'support') {
      setCurrentView({ name: 'instructor' });
    } else {
      setCurrentView({ name: 'dashboard' });
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
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} onNavigateRegister={() => navigateTo('register')} />;
      case 'register':
        return <Register onRegisterSuccess={handleLoginSuccess} onNavigateLogin={() => navigateTo('login')} />;
      case 'dashboard':
        return <Dashboard user={user} onLogout={handleLogout} navigateTo={navigateTo} />;
      case 'classroom':
        return <CourseClassroom user={user} courseId={currentView.courseId} navigateTo={navigateTo} />;
      case 'instructor':
        return <InstructorStudio user={user} onLogout={handleLogout} navigateTo={navigateTo} />;
      default:
        return <Login onLoginSuccess={handleLoginSuccess} onNavigateRegister={() => navigateTo('register')} />;
    }
  };

  // Header/Navbar layout logic for logged-in sessions
  const showNavbar = user && currentView.name !== 'login' && currentView.name !== 'register';

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
            >
              <span className="brand-mark" aria-hidden="true">AL</span>
              <span>AccessLearn</span>
            </button>
            <div className="nav-actions">
              <span 
                className={`badge-a11y-pill ${user.role === 'instructor' ? 'badge-cognitive' : 'badge-hearing'}`} 
                style={{ fontWeight: 800 }}
              >
                {user.role.toUpperCase()}
              </span>
              
              {user.role === 'instructor' && currentView.name !== 'instructor' && (
                <button className="btn btn-outline-brand btn-sm" onClick={() => navigateTo('instructor')}>
                  Instructor Studio
                </button>
              )}
              {user.role === 'instructor' && currentView.name === 'instructor' && (
                <button className="btn btn-outline-brand btn-sm" onClick={() => navigateTo('dashboard')}>
                  Student Portal
                </button>
              )}
              
              <button className="btn btn-secondary btn-sm" onClick={handleLogout} aria-label="Sign out">
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
    </div>
  );
}

export default App;

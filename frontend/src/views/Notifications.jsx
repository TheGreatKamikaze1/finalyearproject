import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAccessibility } from '../context/AccessibilityContext';
import { ArrowLeft, Bell, BellOff, Check, Eye } from 'lucide-react';

function Notifications({ user, navigateTo }) {
  const { preferences } = useAccessibility();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const mode = preferences.accessibility_mode || 'standard';

  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true);
        const data = await api('/notifications');
        setNotifications(data);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api(`/notifications/${id}/read`, { method: 'PUT' });
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <div style={{ border: '4px solid var(--line)', borderTop: '4px solid var(--brand)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
        <p style={{ color: 'var(--muted)' }}>Synchronizing announcements pipeline...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="main-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigateTo('dashboard')} 
          className="btn btn-secondary btn-sm"
          aria-label="Back to dashboard screen"
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>
        <h1 style={{ fontSize: '2.2rem', margin: 0 }}>System Notifications</h1>
      </header>

      {/* Flashing alerts banner for hearing mode */}
      {mode === 'hearing' && unreadCount > 0 && (
        <div className="flashing-alarm-banner" role="alert" aria-live="assertive">
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <strong style={{ display: 'block' }}>Visual Notification Alert Active</strong>
            <span>You have {unreadCount} new unread system messages or quiz updates.</span>
          </div>
        </div>
      )}

      <section aria-labelledby="notification-list-title">
        <h2 id="notification-list-title" style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={20} style={{ color: 'var(--brand)' }} />
          <span>Announcements & Alerts ({notifications.length})</span>
        </h2>

        {notifications.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
            <BellOff size={48} style={{ color: 'var(--line)', marginBottom: '1rem' }} />
            <p>You have no announcements or message alerts at this time.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map(n => {
              const isUnread = !n.is_read;
              
              // Custom class for deaf mode flashing on unread
              const notificationClass = `notification-item ${isUnread ? 'unread' : ''} ${mode === 'hearing' && isUnread ? 'deaf-flash' : ''}`;

              return (
                <article 
                  key={n.id} 
                  className={notificationClass}
                  style={{
                    padding: '1.25rem 1.5rem',
                    background: isUnread ? 'var(--panel)' : 'var(--paper)',
                    border: isUnread ? '2px solid var(--brand)' : '1px solid var(--line)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: isUnread ? 'var(--shadow-sm)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="badge-a11y-pill badge-vision" style={{ margin: 0, fontSize: '0.6rem' }}>
                        {n.type}
                      </span>
                      {isUnread && (
                        <span className="badge-a11y-pill badge-hearing" style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800 }}>
                          New
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{n.title}</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginTop: '0.25rem', lineHeight: 1.5 }}>
                      {n.message}
                    </p>
                    <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>

                  {isUnread && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleMarkAsRead(n.id)}
                      aria-label={`Mark announcement '${n.title}' as read`}
                    >
                      <Check size={14} />
                      <span>Mark Read</span>
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <style>{`
        .flashing-alarm-banner {
          background: hsl(0, 100%, 96%);
          border: 2px solid hsl(0, 100%, 45%);
          border-left: 8px solid hsl(0, 100%, 45%);
          border-radius: var(--radius-sm);
          padding: 1.25rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          color: hsl(0, 100%, 20%);
          font-weight: 700;
          animation: borderFlash 1.5s infinite;
        }

        @keyframes borderFlash {
          0% { border-color: hsl(0, 100%, 45%); box-shadow: 0 0 10px rgba(255, 0, 0, 0.4); }
          50% { border-color: transparent; box-shadow: none; }
          100% { border-color: hsl(0, 100%, 45%); box-shadow: 0 0 10px rgba(255, 0, 0, 0.4); }
        }

        .deaf-flash {
          animation: deafPulseBorder 2s infinite;
        }

        @keyframes deafPulseBorder {
          0% { border-color: var(--brand); }
          50% { border-color: var(--accent); }
          100% { border-color: var(--brand); }
        }
      `}</style>
    </div>
  );
}

export default Notifications;

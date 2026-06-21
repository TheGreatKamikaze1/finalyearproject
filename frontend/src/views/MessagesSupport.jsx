import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { useAccessibility } from '../context/AccessibilityContext';
import { ArrowLeft, Send, Users, ShieldCheck, User } from 'lucide-react';

function MessagesSupport({ user, navigateTo }) {
  const { preferences } = useAccessibility();
  const [partners, setPartners] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  // Load candidates/partners
  useEffect(() => {
    async function loadChatPartners() {
      try {
        setLoading(true);
        const data = await api('/chat-partners');
        setPartners(data);
        if (data.length > 0) {
          setActivePartner(data[0]);
        }
      } catch (err) {
        console.error("Failed to load chat partners:", err);
      } finally {
        setLoading(false);
      }
    }
    loadChatPartners();
  }, []);

  // Poll for messages when activePartner changes
  useEffect(() => {
    if (!activePartner) return;

    async function fetchMessages() {
      try {
        const data = await api('/messages');
        // Filter messages between current user and active partner
        const filtered = data.filter(m => 
          (m.sender_id === user.id && m.recipient_id === activePartner.id) ||
          (m.sender_id === activePartner.id && m.recipient_id === user.id)
        );
        setMessages(filtered);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    }

    fetchMessages();
    
    // Polling every 4 seconds
    pollingRef.current = setInterval(fetchMessages, 4000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activePartner, user.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePartner) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    try {
      const sent = await api('/messages', {
        method: 'POST',
        body: {
          recipient_id: activePartner.id,
          message: content
        }
      });
      setMessages(prev => [...prev, sent]);
    } catch (err) {
      alert(`Failed to send message: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <div style={{ border: '4px solid var(--line)', borderTop: '4px solid var(--brand)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
        <p style={{ color: 'var(--muted)' }}>Connecting to support portal...</p>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => navigateTo('dashboard')} 
          className="btn btn-secondary btn-sm"
          aria-label="Back to dashboard screen"
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>
        <h1 style={{ fontSize: '2.2rem', margin: 0 }}>Support Desk & Chat</h1>
      </header>

      <div className="chat-layout glass-card">
        {/* Left pane: partner list */}
        <aside className="chat-sidebar" aria-label="Available chat users list">
          <div className="sidebar-header" style={{ padding: '1rem', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
            <Users size={18} style={{ color: 'var(--brand)' }} />
            <span>Chat Contacts</span>
          </div>
          <div className="contacts-list" style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {partners.length === 0 ? (
              <p style={{ padding: '1.5rem', color: 'var(--muted)', fontSize: '0.88rem' }}>No contacts found.</p>
            ) : (
              partners.map(p => {
                const isActive = activePartner?.id === p.id;
                return (
                  <button
                    key={p.id}
                    className={`contact-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActivePartner(p)}
                    style={{
                      padding: '1rem',
                      background: isActive ? 'var(--brand-light)' : 'none',
                      border: 'none',
                      borderBottom: '1px solid var(--line)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      transition: 'var(--transition)'
                    }}
                    aria-current={isActive ? 'true' : 'false'}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--line)', display: 'grid', placeItems: 'center', color: 'var(--ink)' }}>
                      <User size={16} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--ink)' }}>{p.full_name}</span>
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 800 }}>
                        {p.role}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right pane: Chat dialog box */}
        <section className="chat-window" aria-label="Active chat conversation window">
          {activePartner ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--line)', background: 'var(--paper)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.05rem' }}>{activePartner.full_name}</strong>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 800 }}>
                    Role: {activePartner.role}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 800 }}>
                  <ShieldCheck size={14} />
                  <span>Secure Chat Link</span>
                </div>
              </div>

              {/* Feed messages */}
              <div className="chat-messages-feed" style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.length === 0 ? (
                  <div style={{ margin: 'auto', color: 'var(--muted)', textAlign: 'center', fontSize: '0.9rem' }}>
                    No messages in this chat. Type a message below to start chatting.
                  </div>
                ) : (
                  messages.map(m => {
                    const isSelf = m.sender_id === user.id;
                    return (
                      <div 
                        key={m.id} 
                        style={{ 
                          alignSelf: isSelf ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isSelf ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div 
                          style={{ 
                            padding: '0.85rem 1.25rem', 
                            background: isSelf ? 'var(--brand)' : 'var(--paper)', 
                            color: isSelf ? '#fff' : 'var(--ink)', 
                            border: isSelf ? 'none' : '1px solid var(--line)',
                            borderRadius: '12px',
                            borderBottomRightRadius: isSelf ? '2px' : '12px',
                            borderBottomLeftRadius: isSelf ? '12px' : '2px',
                            fontWeight: 600,
                            lineHeight: 1.4,
                            fontSize: '0.95rem'
                          }}
                        >
                          {m.message}
                        </div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--line)', display: 'flex', gap: '0.75rem', background: 'var(--paper)' }}>
                <label className="form-label" htmlFor="chat-input-box" style={{ display: 'none' }}>Write a message</label>
                <input
                  type="text"
                  id="chat-input-box"
                  className="form-control"
                  placeholder={`Send message to ${activePartner.full_name}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  autoComplete="off"
                  disabled={sending}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={sending || !newMessage.trim()}
                  aria-label="Send message button"
                  style={{ padding: '0 1.5rem' }}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          ) : (
            <div style={{ margin: 'auto', color: 'var(--muted)', textAlign: 'center' }}>
              Select a contact from the sidebar to begin messaging.
            </div>
          )}
        </section>
      </div>

      <style>{`
        .chat-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          height: 550px;
          background: #fff;
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .chat-sidebar {
          border-right: 1px solid var(--line);
          display: flex;
          flex-direction: column;
        }

        .chat-window {
          display: flex;
          flex-direction: column;
          background: #fff;
        }

        .contact-item:hover {
          background-color: var(--paper);
        }

        .contact-item.active:hover {
          background-color: var(--brand-light);
        }

        @media (max-width: 768px) {
          .chat-layout {
            grid-template-columns: 1fr;
          }
          .chat-sidebar {
            display: none; /* simple stack logic */
          }
        }
      `}</style>
    </div>
  );
}

export default MessagesSupport;

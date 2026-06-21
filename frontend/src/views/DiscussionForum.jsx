import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { ArrowLeft, MessageSquare, Send, User } from 'lucide-react';

function DiscussionForum({ user, courseId, navigateTo }) {
  const [posts, setPosts] = useState([]);
  const [course, setCourse] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadDiscussions() {
      try {
        setLoading(true);
        const [cData, postsData] = await Promise.all([
          api(`/courses/${courseId}`),
          api(`/courses/${courseId}/discussions`)
        ]);
        setCourse(cData);
        setPosts(postsData);
      } catch (err) {
        console.error("Failed to load forum details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDiscussions();
  }, [courseId]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setSubmitting(true);
    const content = newPost.trim();
    setNewPost('');

    try {
      const data = await api(`/courses/${courseId}/discussions`, {
        method: 'POST',
        body: { message: content }
      });
      // Prepend to posts list (since API sorted desc)
      setPosts(prev => [data, ...prev]);
    } catch (err) {
      alert(`Posting failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <div style={{ border: '4px solid var(--line)', borderTop: '4px solid var(--brand)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
        <p style={{ color: 'var(--muted)' }}>Opening forum message board...</p>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigateTo('classroom', { courseId })} 
          className="btn btn-secondary btn-sm"
          aria-label="Return to course classroom workspace"
        >
          <ArrowLeft size={16} />
          <span>Classroom</span>
        </button>
        <div>
          <span className="course-code" style={{ fontSize: '0.82rem' }}>{course?.course_code || 'GEN-101'}</span>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Course Q&A Forum</h1>
        </div>
      </header>

      {/* Write Post section */}
      <section aria-label="Write a new post" className="glass-card p-4" style={{ background: '#fff', marginBottom: '2rem' }}>
        <form onSubmit={handlePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="forum-new-msg">Join the conversation</label>
            <textarea
              id="forum-new-msg"
              className="form-control"
              rows="3"
              placeholder="Ask a question or post a discussion topic for your classmates..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              disabled={submitting}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting || !newPost.trim()}
              aria-label="Submit discussion post"
            >
              <Send size={16} />
              <span>{submitting ? "Posting..." : "Post Message"}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Discussion Feed */}
      <section aria-labelledby="discussion-feed-title">
        <h2 id="discussion-feed-title" style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} style={{ color: 'var(--brand)' }} />
          <span>Forum Discussion Threads ({posts.length})</span>
        </h2>

        {posts.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
            No questions have been posted for this course. Be the first to start the thread!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {posts.map(post => (
              <article 
                key={post.id} 
                className="glass-card p-4" 
                style={{ 
                  background: '#fff', 
                  borderLeft: '4px solid var(--brand)',
                  display: 'flex',
                  gap: '1rem'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--paper)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <User size={20} style={{ color: 'var(--muted)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.98rem' }}>{post.full_name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      {new Date(post.created_at).toLocaleString()}
                    </span>
                  </header>
                  <p style={{ color: 'var(--ink)', lineHeight: 1.5, fontSize: '0.98rem' }}>
                    {post.message}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DiscussionForum;

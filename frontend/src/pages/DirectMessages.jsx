/**
 * DirectMessages — DM Inbox + Thread in a two-panel layout.
 * Left: conversation list. Right: active thread with real-time WebSocket.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Send, MessageCircle, ArrowLeft, CheckCheck, Check,
  Circle, Search, MoreVertical, User, Zap
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

/* ─── Helpers ─────────────────────────────────────────────────── */

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function Avatar({ src, name, size = 44 }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
      color: 'white', fontWeight: 700, fontSize: size * 0.38,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}

/* ─── Conversation List Item ───────────────────────────────────── */

function ConversationItem({ conv, isActive, onClick }) {
  return (
    <div
      className={`dm-conversation-item${isActive ? ' active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <Avatar src={conv.other_user_image} name={conv.other_user_name} size={44} />
      <div className="dm-conversation-info">
        <div className="dm-conversation-name">{conv.other_user_name}</div>
        <div className="dm-conversation-preview">{conv.last_message}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>
          {formatTime(conv.last_message_at)}
        </span>
        {conv.unread_count > 0 && (
          <span className="dm-unread-badge">{conv.unread_count}</span>
        )}
      </div>
    </div>
  );
}

/* ─── Message Bubble ───────────────────────────────────────────── */

function MessageBubble({ msg, isMine }) {
  return (
    <div className={`dm-message ${isMine ? 'sent' : 'received'}`}>
      <div className="dm-message-bubble">{msg.content}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span className="dm-message-time">{formatTime(msg.created_at)}</span>
        {isMine && (
          msg.is_read
            ? <CheckCheck size={12} color="var(--primary)" />
            : <Check size={12} color="var(--gray-400)" />
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────── */

export default function DirectMessages() {
  const { userId: paramUserId } = useParams(); // /messages/:userId
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeUserId, setActiveUserId] = useState(paramUserId ? parseInt(paramUserId) : null);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [inboxSearch, setInboxSearch] = useState('');

  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const textareaRef = useRef(null);
  const token = localStorage.getItem('token');

  /* ── Load Conversations ── */
  const loadConversations = useCallback(async () => {
    try {
      const res = await api.get('/dm/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  /* ── If URL has userId, open that thread ── */
  useEffect(() => {
    if (paramUserId) {
      openThread(parseInt(paramUserId));
    }
  }, [paramUserId]);

  /* ── WebSocket setup ── */
  useEffect(() => {
    if (!token) return;
    const wsBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api')
      .replace(/^http/, 'ws')
      .replace(/\/api$/, '');
    const ws = new WebSocket(`${wsBase}/api/dm/ws?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message') {
          const incoming = data.message;
          // If it's for the active thread, append it
          if (activeUserId && incoming.sender_id === activeUserId) {
            setMessages(prev => [...prev, {
              ...incoming,
              receiver_id: user.id,
              is_read: true,
            }]);
            scrollToBottom();
          }
          // Refresh conversations
          loadConversations();
        }
        if (data.type === 'typing' && data.from_user_id === activeUserId) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 2500);
        }
      } catch { /* ignore */ }
    };

    ws.onerror = () => {};
    ws.onclose = () => {};

    return () => ws.close();
  }, [token, activeUserId, user?.id, loadConversations]);

  /* ── Scroll to bottom ── */
  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  /* ── Open a thread ── */
  const openThread = async (otherId) => {
    setActiveUserId(otherId);
    setMessages([]);
    setIsTyping(false);
    setLoadingThread(true);
    try {
      const [threadRes, userRes] = await Promise.all([
        api.get(`/dm/thread/${otherId}`),
        api.get(`/users/${otherId}`),
      ]);
      setMessages(threadRes.data);
      setActiveUser(userRes.data);
      // Refresh conversations to clear unread
      loadConversations();
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoadingThread(false);
    }
  };

  /* ── Send message ── */
  const sendMessage = async () => {
    if (!draft.trim() || !activeUserId || sending) return;
    const content = draft.trim();
    setDraft('');
    setSending(true);

    // Optimistic append
    const optimistic = {
      id: `tmp-${Date.now()}`,
      sender_id: user.id,
      receiver_id: activeUserId,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const res = await api.post('/dm/send', { receiver_id: activeUserId, content });
      // Replace optimistic with real
      setMessages(prev => prev.map(m => m.id === optimistic.id ? res.data : m));
      loadConversations();
    } catch {
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setDraft(content);
    } finally {
      setSending(false);
    }
  };

  /* ── Typing indicator ── */
  const handleTyping = (e) => {
    setDraft(e.target.value);
    if (wsRef.current?.readyState === 1 && activeUserId) {
      wsRef.current.send(JSON.stringify({ type: 'typing', to_user_id: activeUserId }));
    }
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => {}, 2000));
  };

  /* ── Enter to send ── */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ── Filter conversations ── */
  const filteredConversations = conversations.filter(c =>
    c.other_user_name.toLowerCase().includes(inboxSearch.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="dm-layout">
        {/* ── Left: Inbox ── */}
        <div className="dm-sidebar">
          <div className="dm-sidebar-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <MessageCircle size={20} color="var(--primary)" />
              Messages
            </div>
            {/* Search conversations */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={inboxSearch}
                onChange={e => setInboxSearch(e.target.value)}
                style={{
                  width: '100%', padding: '8px 8px 8px 30px',
                  border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)',
                  fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif',
                }}
              />
            </div>
          </div>

          <div className="dm-conversation-list">
            {filteredConversations.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>
                {conversations.length === 0
                  ? 'No conversations yet. Discover creators and send them a message!'
                  : 'No results found'}
              </div>
            ) : (
              filteredConversations.map(conv => (
                <ConversationItem
                  key={conv.other_user_id}
                  conv={conv}
                  isActive={activeUserId === conv.other_user_id}
                  onClick={() => {
                    setActiveUserId(conv.other_user_id);
                    openThread(conv.other_user_id);
                    navigate(`/messages/${conv.other_user_id}`, { replace: true });
                  }}
                />
              ))
            )}
          </div>

          {/* Discover button */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--gray-100)' }}>
            <Link
              to="/"
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
            >
              <Zap size={14} /> Discover Creators
            </Link>
          </div>
        </div>

        {/* ── Right: Thread ── */}
        {activeUserId && activeUser ? (
          <div className="dm-thread">
            {/* Header */}
            <div className="dm-thread-header">
              <button
                className="btn-icon btn-ghost"
                onClick={() => { setActiveUserId(null); setActiveUser(null); navigate('/messages'); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ArrowLeft size={18} />
              </button>
              <Avatar src={activeUser.profile_image} name={activeUser.name} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>{activeUser.name}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', textTransform: 'capitalize' }}>
                  {activeUser.role?.replace('_', ' ')}
                  {activeUser.niche && ` · ${activeUser.niche}`}
                </div>
              </div>
              <Link
                to={`/profile/${activeUser.id}`}
                className="btn btn-sm btn-outline"
                style={{ fontSize: 12 }}
              >
                <User size={12} /> View Profile
              </Link>
            </div>

            {/* Messages */}
            <div className="dm-messages-area">
              {loadingThread ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)', fontSize: 14 }}>
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Avatar src={activeUser.profile_image} name={activeUser.name} size={64} />
                  <div style={{ marginTop: 16, fontWeight: 600, color: 'var(--gray-700)' }}>{activeUser.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 4 }}>
                    Start the conversation. Say hello!
                  </div>
                </div>
              ) : (
                messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isMine={msg.sender_id === user?.id}
                  />
                ))
              )}

              {isTyping && (
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="dm-input-area">
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={handleTyping}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${activeUser.name}... (Enter to send)`}
                rows={1}
                style={{ minHeight: 42 }}
              />
              <button
                className="btn btn-primary"
                onClick={sendMessage}
                disabled={!draft.trim() || sending}
                style={{
                  width: 44, height: 44, padding: 0,
                  borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: (!draft.trim() || sending) ? 0.5 : 1,
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        ) : (
          /* Empty state — no thread selected */
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--gray-50)', color: 'var(--gray-400)',
          }}>
            <MessageCircle size={56} style={{ marginBottom: 16, opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: 8 }}>
              Select a conversation
            </h3>
            <p style={{ fontSize: 13, textAlign: 'center', maxWidth: 280 }}>
              Choose a conversation from the left, or discover creators and send them a direct message.
            </p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 24 }}>
              Discover Creators
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

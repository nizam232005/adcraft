import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, RefreshCw, MessageSquare } from 'lucide-react';

export default function ProjectChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchProjectAndMessages();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchProjectAndMessages = async () => {
    try {
      const [projRes, msgRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/messages/project/${id}`),
      ]);
      setProject(projRes.data);
      setMessages(msgRes.data);
    } catch (err) {
      toast.error('Failed to load project chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    try {
      const res = await api.post('/messages/', {
        project_id: parseInt(id),
        message: text.trim(),
      });

      setMessages((prev) => [...prev, res.data]);
      setText('');
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="page-container" style={{ maxWidth: 800 }}>
          <div className="skeleton skeleton-title" style={{ height: 40, width: 240 }} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-container" style={{ maxWidth: 840 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <button onClick={fetchProjectAndMessages} className="btn btn-ghost btn-sm">
            <RefreshCw size={14} /> Refresh Messages
          </button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', minHeight: 500 }}>
          {/* Chat Header */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--gray-200)',
            background: 'var(--gray-50)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius)',
              background: 'var(--primary-100)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>{project?.title}</h2>
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                Platform: {project?.platform} | Budget: ${project?.budget}
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="chat-messages" style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--gray-400)', marginTop: 40 }}>
                No messages yet in this project chat. Send a message to start communicating!
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`chat-bubble ${isMe ? 'sent' : 'received'}`}
                  >
                    <div className="chat-sender">{isMe ? 'You' : msg.sender_name || 'User'}</div>
                    <div>{msg.message}</div>
                    <div className="chat-time">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="chat-input-area">
            <input
              type="text"
              className="form-input"
              placeholder="Type your message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
              <Send size={16} /> Send
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

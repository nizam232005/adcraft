import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import VideoPlayer from '../components/VideoPlayer';
import { User, Edit, Plus, Trash2, Video, Image as ImageIcon, Briefcase, Award } from 'lucide-react';

export default function CreatorProfile() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Portfolio Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.id) fetchPortfolio();
  }, [user?.id]);

  const fetchPortfolio = async () => {
    try {
      const res = await api.get(`/portfolio/user/${user.id}`);
      setPortfolio(res.data);
    } catch (err) {
      console.error('Failed to fetch portfolio', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      toast.error('Title and media file are required');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      if (description) formData.append('description', description);
      formData.append('file', file);

      await api.post('/portfolio/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Portfolio item added!');
      setModalOpen(false);
      setTitle('');
      setDescription('');
      setFile(null);
      fetchPortfolio();
    } catch (err) {
      toast.error('Failed to add portfolio item');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePortfolio = async (id) => {
    try {
      await api.delete(`/portfolio/${id}`);
      toast.success('Item deleted');
      fetchPortfolio();
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container" style={{ maxWidth: 960 }}>
        {/* Profile Card */}
        <div className="card" style={{ padding: 32, marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 36,
              fontWeight: 800,
              flexShrink: 0,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{user?.name}</h1>
                  <span className="badge badge-open" style={{ marginTop: 4 }}>
                    Creator
                  </span>
                </div>
                <Link to="/creator/profile/edit" className="btn btn-sm btn-secondary">
                  <Edit size={14} /> Edit Profile
                </Link>
              </div>

              <p style={{ fontSize: 14, color: 'var(--gray-600)', marginTop: 12, lineHeight: 1.6 }}>
                {user?.bio || 'No bio added yet. Click edit profile to add your creator bio and showcase your experience!'}
              </p>

              {user?.skills && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                  {user.skills.split(',').map((skill, i) => (
                    <span key={i} style={{
                      padding: '4px 12px',
                      background: 'var(--primary-50)',
                      color: 'var(--primary-dark)',
                      fontSize: 12,
                      fontWeight: 600,
                      borderRadius: 'var(--radius-full)',
                    }}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Portfolio Showcase Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Portfolio & Past Works</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>
              <Plus size={16} /> Add Portfolio Item
            </button>
          </div>

          {loading ? (
            <div className="skeleton skeleton-card" />
          ) : portfolio.length === 0 ? (
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>
              No portfolio items added yet. Click 'Add Portfolio Item' to showcase past ad campaigns to brand owners!
            </p>
          ) : (
            <div className="grid-3">
              {portfolio.map((item) => (
                <div key={item.id} className="card" style={{ padding: 16, position: 'relative' }}>
                  <button
                    onClick={() => handleDeletePortfolio(item.id)}
                    style={{
                      position: 'absolute',
                      top: 24,
                      right: 24,
                      background: 'rgba(239,68,68,0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 10,
                    }}
                  >
                    <Trash2 size={14} />
                  </button>

                  {item.media_type === 'image' || item.media_url?.includes('unsplash.com') || item.media_url?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                    <img
                      src={item.media_url}
                      alt={item.title}
                      style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--radius)' }}
                    />
                  ) : (
                    <VideoPlayer src={item.media_url} height={180} />
                  )}

                  <h3 style={{ fontSize: 15, fontWeight: 700, marginTop: 12 }}>{item.title}</h3>
                  {item.description && (
                    <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Portfolio Modal */}
        {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">Add Portfolio Showcase Item</h3>
              <form onSubmit={handleAddPortfolio} style={{ marginTop: 16 }}>
                <div className="form-group">
                  <label className="form-label">Item Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Nike Instagram Campaign Reel"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Short Description</label>
                  <textarea
                    className="form-input"
                    placeholder="Results, view counts, key deliverables..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">Media File (Image or Video) *</label>
                  <FileUpload onFileSelect={setFile} accept="image/*,video/*" />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Save Portfolio Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

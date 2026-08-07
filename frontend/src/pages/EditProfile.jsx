import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState(user?.skills || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', {
        name,
        bio,
        skills,
      });

      updateUser(res.data);
      toast.success('Profile updated successfully!');
      navigate('/creator/profile');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container" style={{ maxWidth: 640 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="card" style={{ padding: 32 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>Edit Creator Profile</h1>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Creator Bio</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Share your experience, video editing tools, target niches..."
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 28 }}>
              <label className="form-label">Skills (Comma-separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Video Editing, Instagram Reels, UGC Content, Scriptwriting"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

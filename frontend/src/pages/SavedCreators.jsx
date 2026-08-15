import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Bookmark, MessageCircle, ExternalLink, Trash2, Search, Users } from 'lucide-react';
import { SkeletonGrid } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

export default function SavedCreators() {
  const navigate = useNavigate();
  const [savedList, setSavedList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedCreators();
  }, []);

  const fetchSavedCreators = async () => {
    try {
      const res = await api.get('/saved-creators/');
      setSavedList(res.data);
    } catch (err) {
      console.error('Failed to load saved creators', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (creatorId) => {
    try {
      await api.delete(`/saved-creators/${creatorId}`);
      setSavedList(prev => prev.filter(item => item.creator_id !== creatorId));
      toast.success('Removed from saved list');
    } catch (err) {
      toast.error('Failed to remove creator');
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container">
        <div className="page-header" style={{ marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
              <Bookmark size={16} /> Saved Talent
            </div>
            <h1 className="page-title">Saved Creators</h1>
            <p className="page-subtitle">
              Your bookmarked content creators. Quickly contact them or invite them to collaboration campaigns.
            </p>
          </div>
        </div>

        {loading ? (
          <SkeletonGrid count={4} />
        ) : savedList.length === 0 ? (
          <EmptyState
            title="No saved creators yet"
            message="Discover creators on the homepage feed and click 'Save Creator' to bookmark talent here."
          />
        ) : (
          <div className="grid-3">
            {savedList.map((item) => (
              <div key={item.id} className="card card-hover" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {item.creator_image ? (
                        <img src={item.creator_image} alt={item.creator_name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.creator_name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{item.creator_name}</h3>
                        <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>{item.creator_niche || 'Content Creator'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnsave(item.creator_id)}
                      className="btn-icon btn-ghost"
                      style={{ color: 'var(--danger)' }}
                      title="Remove from saved"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {item.creator_bio && (
                    <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.creator_bio}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--gray-100)', paddingTop: 16, marginTop: 12 }}>
                  <Link to={`/profile/${item.creator_id}`} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    <ExternalLink size={14} /> Profile
                  </Link>
                  <button onClick={() => navigate(`/messages/${item.creator_id}`)} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    <MessageCircle size={14} /> Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

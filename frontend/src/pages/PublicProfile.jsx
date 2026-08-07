import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import { ArrowLeft, User, Award } from 'lucide-react';

import VideoPlayer from '../components/VideoPlayer';

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [creator, setCreator] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicProfile();
  }, [id]);

  const fetchPublicProfile = async () => {
    try {
      const [userRes, portRes] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/portfolio/user/${id}`),
      ]);
      setCreator(userRes.data);
      setPortfolio(portRes.data);
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="page-container" style={{ maxWidth: 900 }}>
          <div className="skeleton skeleton-title" style={{ height: 40, width: 240 }} />
        </div>
      </DashboardLayout>
    );
  }

  if (!creator) return null;

  return (
    <DashboardLayout>
      <div className="page-container" style={{ maxWidth: 960 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
          <ArrowLeft size={16} /> Back
        </button>

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
              {creator.name?.charAt(0).toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{creator.name}</h1>
              <span className="badge badge-open" style={{ marginTop: 4, textTransform: 'capitalize' }}>
                {creator.role?.replace('_', ' ')}
              </span>

              <p style={{ fontSize: 14, color: 'var(--gray-600)', marginTop: 12, lineHeight: 1.6 }}>
                {creator.bio || 'No bio provided.'}
              </p>

              {creator.skills && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                  {creator.skills.split(',').map((skill, i) => (
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

        {/* Portfolio Grid */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 16 }}>
            Portfolio Showcase ({portfolio.length})
          </h2>

          {portfolio.length === 0 ? (
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>This creator hasn't added portfolio media items yet.</p>
          ) : (
            <div className="grid-3">
              {portfolio.map((item) => (
                <div key={item.id} className="card" style={{ padding: 16 }}>
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
      </div>
    </DashboardLayout>
  );
}

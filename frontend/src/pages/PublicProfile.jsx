import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  ArrowLeft, MessageCircle, Bookmark, BookmarkCheck, MapPin, Globe,
  Star, Video, Image as ImageIcon, Briefcase, Award,
  CheckCircle2, DollarSign, Clock, Sparkles
} from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';

function InstagramIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

function YoutubeIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
    </svg>
  );
}

function AvailabilityBadge({ available }) {
  if (available === false) {
    return <span className="badge-busy">Busy</span>;
  }
  return (
    <span className="badge-available">
      <span className="dot" />
      Available for Work
    </span>
  );
}

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [creator, setCreator] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
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

      if (user?.role === 'brand_owner') {
        try {
          const checkSaved = await api.get(`/saved-creators/check/${id}`);
          setIsSaved(checkSaved.data.saved);
        } catch { /* ignore */ }
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'brand_owner') return;

    try {
      if (isSaved) {
        await api.delete(`/saved-creators/${id}`);
        setIsSaved(false);
        toast.success('Creator removed from saved');
      } else {
        await api.post(`/saved-creators/${id}`);
        setIsSaved(true);
        toast.success('Creator saved to your list!');
      }
    } catch {
      toast.error('Failed to update saved status');
    }
  };

  const handleMessage = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/messages/${id}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="page-container" style={{ maxWidth: 1000 }}>
          <div className="skeleton skeleton-title" style={{ height: 240, width: '100%', borderRadius: 'var(--radius-lg)' }} />
        </div>
      </DashboardLayout>
    );
  }

  if (!creator) return null;

  const skillList = creator.skills ? creator.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
  const languageList = creator.languages ? creator.languages.split(',').map(l => l.trim()).filter(Boolean) : [];

  return (
    <DashboardLayout>
      <div className="page-container" style={{ maxWidth: 1000, padding: 0 }}>
        {/* Navigation & Back */}
        <div style={{ padding: '16px 24px 0' }}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Cover Photo / Banner */}
        <div style={{ margin: '16px 24px 0', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {creator.cover_image ? (
            <img src={creator.cover_image} alt="Cover" className="creator-profile-cover" />
          ) : (
            <div className="creator-profile-cover-placeholder" />
          )}
        </div>

        {/* Header Info Card */}
        <div style={{ margin: '0 24px 32px' }}>
          <div className="card" style={{ padding: '0 32px 32px', marginTop: -40, position: 'relative', overflow: 'visible' }}>
            <div className="creator-profile-avatar-wrap">
              {creator.profile_image ? (
                <img src={creator.profile_image} alt={creator.name} className="creator-profile-avatar" />
              ) : (
                <div className="creator-profile-avatar-placeholder">
                  {creator.name?.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Action CTAs */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                {user?.role === 'brand_owner' && (
                  <button
                    className={`btn ${isSaved ? 'btn-secondary' : 'btn-outline'}`}
                    onClick={handleToggleSave}
                    style={{ gap: 6 }}
                  >
                    {isSaved ? <BookmarkCheck size={16} color="var(--primary)" /> : <Bookmark size={16} />}
                    {isSaved ? 'Saved' : 'Save Creator'}
                  </button>
                )}
                <button className="btn btn-primary" onClick={handleMessage} style={{ gap: 8, padding: '10px 24px' }}>
                  <MessageCircle size={18} /> Message Creator
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--gray-900)' }}>{creator.name}</h1>
                  <AvailabilityBadge available={creator.is_available_for_work} />
                </div>

                <div style={{ display: 'flex', gap: 16, alignItems: 'center', color: 'var(--gray-500)', fontSize: 14, marginTop: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{creator.niche || 'Content Creator'}</span>
                  {creator.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={14} /> {creator.location}
                    </span>
                  )}
                  {creator.experience_years && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Briefcase size={14} /> {creator.experience_years} years exp
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <p style={{ fontSize: 15, color: 'var(--gray-700)', marginTop: 16, lineHeight: 1.6 }}>
              {creator.bio || 'No bio provided yet.'}
            </p>

            {/* Languages, Pricing, Social Links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 24, padding: 20, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
              {languageList.length > 0 && (
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase' }}>Languages</span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)', marginTop: 2 }}>
                    {languageList.join(', ')}
                  </div>
                </div>
              )}

              {creator.pricing_info && (
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase' }}>Starting Rate</span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)', marginTop: 2 }}>
                    {creator.pricing_info}
                  </div>
                </div>
              )}

              {/* Social links */}
              {(creator.social_instagram || creator.social_tiktok || creator.social_youtube) && (
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase' }}>Social Channels</span>
                  <div className="social-links" style={{ marginTop: 4 }}>
                    {creator.social_instagram && (
                      <a href={creator.social_instagram} target="_blank" rel="noreferrer" className="social-link instagram">
                        <InstagramIcon size={14} /> Instagram
                      </a>
                    )}
                    {creator.social_tiktok && (
                      <a href={creator.social_tiktok} target="_blank" rel="noreferrer" className="social-link tiktok">
                        <Globe size={14} /> TikTok
                      </a>
                    )}
                    {creator.social_youtube && (
                      <a href={creator.social_youtube} target="_blank" rel="noreferrer" className="social-link youtube">
                        <YoutubeIcon size={14} /> YouTube
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Skills */}
            {skillList.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', display: 'block', marginBottom: 8 }}>
                  Skills & Expertise
                </span>
                <div className="skill-tags">
                  {skillList.map((skill, i) => (
                    <span key={i} className="skill-tag primary">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Showcase Gallery */}
        <div style={{ margin: '0 24px 48px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} color="var(--primary)" /> Portfolio & Showcase ({portfolio.length})
          </h2>

          {portfolio.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>
              This creator hasn't uploaded portfolio items yet.
            </div>
          ) : (
            <div className="portfolio-grid">
              {portfolio.map((item) => (
                <div key={item.id} className="portfolio-item">
                  <div className="portfolio-item-media">
                    {item.media_type === 'image' || item.media_url?.includes('unsplash.com') || item.media_url?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                      <img src={item.media_url} alt={item.title} />
                    ) : (
                      <VideoPlayer src={item.media_url} height={200} />
                    )}
                  </div>
                  <div className="portfolio-item-info">
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)' }}>{item.title}</h3>
                    {item.description && (
                      <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4, lineHeight: 1.5 }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

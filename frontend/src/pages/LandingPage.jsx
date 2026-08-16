/**
 * LandingPage — AdCraft Creator Marketplace homepage.
 * Publicly accessible creator discovery feed.
 * Brands discover talent → watch portfolio → message creators.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ReelsModal from '../components/ReelsModal';
import {
  Search, Zap, Star, MapPin, Globe, Play, MessageCircle, Eye, ChevronRight, TrendingUp,
  Sparkles, Users, Briefcase, Filter, X, CheckCircle2, ArrowRight, Video, Menu
} from 'lucide-react';

/* ─── Constants ─────────────────────────────────────────────────── */

const CATEGORIES = [
  { label: 'All', emoji: '✨' },
  { label: 'Fashion & Beauty', emoji: '👗' },
  { label: 'Tech & Gadgets', emoji: '📱' },
  { label: 'Food & Beverage', emoji: '🍕' },
  { label: 'Fitness & Health', emoji: '💪' },
  { label: 'Gaming', emoji: '🎮' },
  { label: 'Travel', emoji: '✈️' },
  { label: 'Lifestyle', emoji: '🌟' },
  { label: 'Finance', emoji: '💰' },
  { label: 'Education', emoji: '📚' },
  { label: 'Home & Decor', emoji: '🏠' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Discover Creators',
    desc: 'Browse our curated feed of professional creators. Filter by niche, skills, availability, and more.',
    icon: Search,
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    step: '02',
    title: 'Watch Their Work',
    desc: 'View portfolio videos and past brand collaborations directly on their profile.',
    icon: Play,
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    step: '03',
    title: 'Send a Direct Message',
    desc: 'No job posting needed. Reach out directly with your campaign idea.',
    icon: MessageCircle,
    color: '#059669',
    bg: '#ECFDF5',
  },
  {
    step: '04',
    title: 'Collaborate & Grow',
    desc: 'Or post a campaign brief and let creators apply — your platform, your workflow.',
    icon: TrendingUp,
    color: '#D97706',
    bg: '#FFFBEB',
  },
];

/* ─── Helpers ────────────────────────────────────────────────────── */

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

function RatingStars({ rating }) {
  if (!rating) return null;
  return (
    <div className="rating-stars" style={{ gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          fill={i <= Math.round(rating) ? '#F59E0B' : 'none'}
          color={i <= Math.round(rating) ? '#F59E0B' : '#D1D5DB'}
        />
      ))}
      <span style={{ fontSize: 12, color: 'var(--gray-500)', marginLeft: 4 }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

/* ─── Fallback working video URLs for testing ──────────────────────── */
const DEMO_VIDEOS = [
  'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/bottle-detection.mp4',       // Beauty / Product
  'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/face-demographics-walking.mp4', // Fashion / Model
  'https://vjs.zencdn.net/v/oceans.mp4',                                                                   // Travel / Resort
  'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/store-aisle-detection.mp4',   // Food / Retail
  'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/person-bicycle-car-detection.mp4', // Fitness / Action
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',                              // Aesthetic / Natural
  'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/people-detection.mp4',         // Lifestyle / Community
  'https://media.w3.org/2010/05/sintel/trailer.mp4',                                                      // Tech / Cinematic
];

/* ─── Creator Card — Instagram-style square tile ──────────────────── */

function CreatorCard({ creator, onMessage, isAuthenticated, index, onOpenReel }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const skills = creator.skills ? creator.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

  // Featured media — first portfolio item if available
  const featuredMedia = creator.portfolio?.[0];

  // Determine what to show: real media or fallback
  const isVideo = featuredMedia?.media_type === 'video'
    || (featuredMedia?.media_url && featuredMedia.media_url.match(/\.(mp4|webm|ogg|mov)$/i));

  // If no working src, use a cycling demo video
  const videoSrc = (featuredMedia?.media_url && !featuredMedia.media_url.includes('placeholder'))
    ? featuredMedia.media_url
    : DEMO_VIDEOS[index % DEMO_VIDEOS.length];

  const imageSrc = featuredMedia?.media_url || creator.profile_image;

  // Decide tile type: show video for cards with video portfolio or fallback
  const showVideo = isVideo || (!featuredMedia?.media_url && !creator.profile_image);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  };
  const handleMouseLeave = () => {
    if (videoRef.current) {
      try { videoRef.current.pause(); videoRef.current.currentTime = 0; } catch {}
    }
  };

  return (
    <div
      className="creator-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onOpenReel?.(index)}
    >
      {/* ── Media Layer ── */}
      <div className="creator-card-media">
        {showVideo ? (
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : imageSrc ? (
          <img src={imageSrc} alt={creator.name} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: `linear-gradient(135deg, hsl(${(index * 47) % 360}, 65%, 30%) 0%, hsl(${(index * 47 + 60) % 360}, 70%, 45%) 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '3rem', fontWeight: 800, color: 'rgba(255,255,255,0.25)' }}>
              {creator.name?.charAt(0)}
            </span>
          </div>
        )}

        {/* Video play icon badge */}
        {showVideo && (
          <div className="creator-card-play-icon">
            <Play size={13} color="white" fill="white" />
          </div>
        )}

        {/* Media type badge */}
        {isVideo && (
          <span className="media-type-badge">
            <Video size={9} style={{ display: 'inline', marginRight: 2 }} />
            VIDEO
          </span>
        )}
      </div>

      {/* ── Always-visible corner avatar (fades on hover) ── */}
      <div className="creator-card-corner-avatar">
        {creator.profile_image ? (
          <img src={creator.profile_image} alt={creator.name} className="creator-card-corner-avatar-img" />
        ) : (
          <div className="creator-card-corner-avatar-initials">
            {creator.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* ── Hover Overlay ── */}
      <div className="creator-card-overlay">
        {/* Skills row */}
        {skills.length > 0 && (
          <div className="creator-card-overlay-skills">
            {skills.slice(0, 2).map((s, i) => (
              <span key={i} className="creator-card-overlay-skill">{s}</span>
            ))}
            {skills.length > 2 && (
              <span className="creator-card-overlay-skill">+{skills.length - 2}</span>
            )}
          </div>
        )}

        {/* Avatar + Name */}
        <div className="creator-card-id">
          {creator.profile_image ? (
            <img src={creator.profile_image} alt={creator.name} className="creator-avatar" />
          ) : (
            <div className="creator-avatar-placeholder">
              {creator.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 className="creator-card-name">{creator.name}</h3>
            <p className="creator-card-niche">
              {creator.niche || 'Content Creator'}
              {creator.location && ` · ${creator.location}`}
            </p>
          </div>
          <AvailabilityBadge available={creator.is_available_for_work} />
        </div>

        {/* Action Buttons */}
        <div className="creator-card-overlay-actions" onClick={e => e.stopPropagation()}>
          <Link
            to={`/profile/${creator.id}`}
            className="btn btn-outline btn-sm"
            style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(6px)' }}
          >
            <Eye size={12} /> Profile
          </Link>
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              if (!isAuthenticated) { navigate('/login'); return; }
              onMessage(creator);
            }}
          >
            <MessageCircle size={12} /> Message
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [scrolled, setScrolled] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedReelIndex, setSelectedReelIndex] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardRoute = user?.role === 'brand_owner' ? '/brand/dashboard' : '/creator/dashboard';

  /* ── Scroll detection ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Load creators ── */
  const fetchCreators = useCallback(async (searchTerm = '', niche = '', avail = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (niche && niche !== 'All') params.append('niche', niche);
      if (avail) params.append('available', 'true');
      const res = await api.get(`/users/creators?${params.toString()}`);
      // Also fetch portfolio items for each creator (first 1)
      const withPortfolio = await Promise.all(
        res.data.map(async (c) => {
          try {
            const pRes = await api.get(`/portfolio/user/${c.id}`);
            return { ...c, portfolio: pRes.data };
          } catch {
            return { ...c, portfolio: [] };
          }
        })
      );
      setCreators(withPortfolio);
    } catch (err) {
      console.error('Failed to fetch creators', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCreators();
  }, [fetchCreators]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCreators(search, activeCategory, availableOnly);
  };

  const handleCategory = (cat) => {
    setActiveCategory(cat);
    fetchCreators(search, cat === 'All' ? '' : cat, availableOnly);
  };

  const handleMessage = (creator) => {
    navigate(`/messages/${creator.id}`);
  };

  /* ── Split into featured + rest ── */
  const featured = creators.slice(0, 3);
  const rest = creators.slice(3);

  return (
    <div className="discovery-page">
      {/* ── Nav ── */}
      <nav className={`public-nav${scrolled ? ' scrolled' : ''}`}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 'var(--radius)',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          }}>
            <Zap size={18} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>
            AdCraft
          </span>
        </Link>

        {/* Desktop nav links — hidden on mobile via CSS */}
        <div className="public-nav-links">
          <Link to="/" className="public-nav-link" style={{ fontWeight: 600, color: 'var(--primary)' }}>
            Discover
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/jobs" className="public-nav-link">Browse Jobs</Link>
              <Link to="/messages" className="public-nav-link">Messages</Link>
              <Link
                to={dashboardRoute}
                className="btn btn-primary"
                style={{ marginLeft: 8, fontSize: 14, padding: '8px 18px' }}
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="public-nav-link">Sign In</Link>
              <Link to="/register" className="btn btn-primary" style={{ marginLeft: 8, fontSize: 14 }}>
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger — shown only on mobile via CSS */}
        <button
          className="public-nav-mobile-toggle"
          onClick={() => setMobileMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* ── Mobile Nav Dropdown ── */}
      {mobileMenuOpen && (
        <div className="public-nav-mobile-menu">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Discover</Link>
          {isAuthenticated ? (
            <>
              <Link to="/jobs" onClick={() => setMobileMenuOpen(false)}>Browse Jobs</Link>
              <Link to="/messages" onClick={() => setMobileMenuOpen(false)}>Messages</Link>
              <Link
                to={dashboardRoute}
                className="btn-primary"
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: 'block', textAlign: 'center', padding: '12px 14px', borderRadius: 'var(--radius)', background: 'var(--primary)', color: 'white', fontWeight: 600, marginTop: 8 }}
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: 'block', textAlign: 'center', padding: '12px 14px', borderRadius: 'var(--radius)', background: 'var(--primary)', color: 'white', fontWeight: 600, marginTop: 8 }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}

      {/* ── Hero ── */}
      <section className="discovery-hero" style={{ paddingTop: 96 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.95)', fontSize: 13, fontWeight: 600, marginBottom: 20, position: 'relative' }}>
          <Sparkles size={14} /> The Creator Marketplace
        </div>
        <h1>
          Discover the World's<br />
          <span className="gradient-text">Best Ad Creators</span>
        </h1>
        <p>
          Connect with UGC creators, video editors, and content specialists. 
          Watch their portfolios and message them directly — no middlemen.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="hero-search-bar">
          <Search size={18} color="var(--gray-400)" />
          <input
            type="text"
            placeholder="Search by name, niche, skill (e.g. TikTok, Fashion, UGC)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '10px 24px' }}>
            Search
          </button>
        </form>

        {/* Quick stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 32, position: 'relative', flexWrap: 'wrap' }}>
          {[
            { label: 'Active Creators', value: creators.length || '—' },
            { label: 'Niches', value: '11+' },
            { label: 'Direct Messaging', value: 'Free' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Category Pills + Filters ── */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-200)', position: 'sticky', top: 64, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="category-pills" style={{ flex: 1 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.label}
                className={`category-pill${activeCategory === cat.label ? ' active' : ''}`}
                onClick={() => handleCategory(cat.label)}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>

          <button
            className={`btn btn-sm${showFilters ? ' btn-primary' : ' btn-outline'}`}
            style={{ flexShrink: 0, gap: 6 }}
            onClick={() => setShowFilters(f => !f)}
          >
            <Filter size={14} /> Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div style={{ borderTop: '1px solid var(--gray-100)', padding: '12px 24px', background: 'var(--gray-50)', maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={e => {
                  setAvailableOnly(e.target.checked);
                  fetchCreators(search, activeCategory === 'All' ? '' : activeCategory, e.target.checked);
                }}
                style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
              />
              Available for Work only
            </label>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setAvailableOnly(false);
                setSearch('');
                setActiveCategory('All');
                fetchCreators();
              }}
              style={{ fontSize: 13, color: 'var(--danger)' }}
            >
              <X size={14} /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* ── Main Feed ── */}
      <main className="discovery-main">

        {loading ? (
          <div>
            {/* Instagram grid skeleton */}
            <div style={{ height: 32, width: 220, borderRadius: 'var(--radius)', background: 'var(--gray-200)', marginBottom: 8 }} />
            <div style={{ height: 16, width: 280, borderRadius: 'var(--radius)', background: 'var(--gray-100)', marginBottom: 20 }} />
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
              <div className="creator-feed-grid">
                {[1,2,3,4,5,6].map(i => (
                  <div
                    key={i}
                    style={{
                      aspectRatio: '1/1',
                      background: `hsl(${i * 30}, 10%, ${88 + i % 3}%)`,
                      animation: 'pulse 1.5s ease-in-out infinite',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : creators.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Users size={48} color="var(--gray-300)" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8 }}>
              No creators found
            </h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: 20 }}>
              Try adjusting your search or filters
            </p>
            <button className="btn btn-outline" onClick={() => { setSearch(''); setActiveCategory('All'); setAvailableOnly(false); fetchCreators(); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* ─ Unified Instagram Grid ─ */}
            <section>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={20} color="var(--primary)" />
                    {activeCategory === 'All' ? 'Discover Creators' : activeCategory}
                  </h2>
                  <p className="section-subtitle">
                    {creators.length} creator{creators.length !== 1 ? 's' : ''} · Hover to preview & connect
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 500 }}>
                    <span style={{ marginRight: 6 }}>⬛</span> Grid View
                  </span>
                </div>
              </div>

              {/* The Instagram-style grid */}
              <div style={{
                background: 'var(--white)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--gray-200)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div className="creator-feed-grid">
                  {creators.map((creator, i) => (
                    <CreatorCard
                      key={creator.id}
                      creator={creator}
                      index={i}
                      onMessage={handleMessage}
                      isAuthenticated={isAuthenticated}
                      onOpenReel={(idx) => setSelectedReelIndex(idx)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* ── Reels Vertical Video Scroll Viewer Modal ── */}
            {selectedReelIndex !== null && (
              <ReelsModal
                creators={creators}
                initialIndex={selectedReelIndex}
                onClose={() => setSelectedReelIndex(null)}
                onMessage={handleMessage}
                isAuthenticated={isAuthenticated}
              />
            )}
          </>
        )}

        {/* ── How It Works ── */}
        <section style={{ marginTop: 80, padding: '56px 0', borderTop: '1px solid var(--gray-200)' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title" style={{ fontSize: '2rem' }}>Two Ways to Hire</h2>
            <p style={{ fontSize: '1rem', color: 'var(--gray-500)', maxWidth: 520, margin: '8px auto 0' }}>
              Discover creators directly or post a campaign brief — AdCraft supports both workflows
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {HOW_IT_WORKS.map(step => {
              const Icon = step.icon;
              return (
                <div key={step.step} style={{
                  padding: 28, borderRadius: 'var(--radius-lg)',
                  background: step.bg,
                  border: `1px solid ${step.color}20`,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--radius-md)',
                    background: step.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <Icon size={22} color="white" />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: step.color, marginBottom: 8, letterSpacing: '0.05em' }}>
                    STEP {step.step}
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6 }}>
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CTA Band ── */}
        {!isAuthenticated && (
          <section style={{
            marginTop: 56,
            padding: '56px 40px',
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: 12, letterSpacing: '-0.02em' }}>
                Ready to find your creator?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: 28 }}>
                Join AdCraft and start discovering talent today. Free to sign up.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register?role=brand_owner" className="btn" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700, padding: '12px 28px', fontSize: 15 }}>
                  I'm a Brand <ArrowRight size={16} />
                </Link>
                <Link to="/register?role=creator" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', padding: '12px 28px', fontSize: 15 }}>
                  I'm a Creator
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--gray-200)', background: 'var(--white)', padding: '32px 24px', textAlign: 'center', marginTop: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          }}>
            <Zap size={15} />
          </div>
          <span style={{ fontWeight: 800, color: 'var(--gray-900)', fontSize: '1rem' }}>AdCraft</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>
          © 2026 AdCraft. Creator Marketplace Platform.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12 }}>
          {isAuthenticated ? (
            <Link to={dashboardRoute} style={{ fontSize: 13, color: 'var(--gray-500)' }}>Dashboard</Link>
          ) : (
            <>
              <Link to="/login" style={{ fontSize: 13, color: 'var(--gray-500)' }}>Sign In</Link>
              <Link to="/register" style={{ fontSize: 13, color: 'var(--gray-500)' }}>Register</Link>
            </>
          )}
          <Link to="/jobs" style={{ fontSize: 13, color: 'var(--gray-500)' }}>Browse Jobs</Link>
          <Link to="/messages" style={{ fontSize: 13, color: 'var(--gray-500)' }}>Messages</Link>
        </div>
      </footer>
    </div>
  );
}

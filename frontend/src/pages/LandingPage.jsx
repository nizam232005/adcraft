/**
 * LandingPage — AdCraft Creator Marketplace homepage.
 * Publicly accessible creator & advertisement discovery feed.
 * Brands discover talent → watch portfolio → message creators.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ReelsModal from '../components/ReelsModal';
import { DEMO_CAMPAIGNS } from '../data/demoCampaigns';
import {
  Search, Zap, Star, Play, MessageCircle, Eye,
  Sparkles, Users, Filter, X, CheckCircle2, ArrowRight, Menu, Tag, DollarSign
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
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Discover Ad Creatives',
    desc: 'Browse our curated feed of commercial campaigns and UGC creators. Filter by niche, platform, budget, and skills.',
    icon: Search,
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    step: '02',
    title: 'Inspect Portfolio & Briefs',
    desc: 'View high-converting ad deliverables, creative direction, and past brand collaborations directly.',
    icon: Play,
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    step: '03',
    title: 'Send a Direct Message',
    desc: 'No job posting needed. Reach out directly to top creators with your campaign brief.',
    icon: MessageCircle,
    color: '#059669',
    bg: '#ECFDF5',
  },
  {
    step: '04',
    title: 'Collaborate & Scale',
    desc: 'Or post a custom campaign brief and let verified creators apply — your workflow, your terms.',
    icon: Sparkles,
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
      Available
    </span>
  );
}

function RatingStars({ rating }) {
  if (!rating) return null;
  return (
    <div className="rating-stars" style={{ gap: 2 }}>
      <Star size={12} fill="#F59E0B" color="#F59E0B" />
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-800)', marginLeft: 2 }}>
        {Number(rating).toFixed(1)}
      </span>
    </div>
  );
}

/* ─── Campaign Card — Professional Ad Creative Tile ──────────────── */

function CampaignCard({ campaign, onMessage, isAuthenticated, index, onOpenReel }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const creator = campaign.creator || {};
  const skills = (campaign.skills || creator.skills || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const posterSrc = campaign.poster_url || campaign.media_url || creator.portfolio?.[0]?.media_url;

  return (
    <div
      className="campaign-card"
      onClick={() => onOpenReel?.(index)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: isHovered ? '1px solid var(--primary-light)' : '1px solid var(--gray-200)',
        overflow: 'hidden',
        boxShadow: isHovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        cursor: 'pointer',
      }}
    >
      {/* ── Media Layer ── */}
      <div
        className="campaign-card-media-wrap"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 5',
          backgroundColor: '#0f172a',
          overflow: 'hidden',
        }}
      >
        <img
          src={posterSrc}
          alt={`${campaign.brand || 'Campaign'} — ${campaign.title}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transform: isHovered ? 'scale(1.08)' : 'scale(1.0)',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          loading="lazy"
        />

        {/* Dynamic Light Shimmer on Hover */}
        {isHovered && (
          <div
            style={{
              position: 'absolute',
              inset: '-50%',
              width: '200%',
              height: '200%',
              background: 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
              animation: 'shimmerSweep 1.5s infinite linear',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* ── Top Floating Badges ── */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 2,
            gap: 8,
          }}
        >
          {/* Category Tag */}
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'white',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.02em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {campaign.category || 'Ad Creative'}
          </span>

          {/* Platform / Budget Tag */}
          <div style={{ display: 'flex', gap: 6 }}>
            {campaign.budget && (
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 800,
                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.35)',
                }}
              >
                ${campaign.budget}
              </span>
            )}
          </div>
        </div>

        {/* ── Center Hover Play Button ── */}
        <div
          className="campaign-card-play-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.3) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.25s ease',
            zIndex: 3,
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-dark)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              transform: isHovered ? 'scale(1)' : 'scale(0.85)',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Play size={26} fill="var(--primary)" color="var(--primary)" style={{ marginLeft: 3 }} />
          </div>
        </div>

        {/* ── Bottom Media Strip: Platform Indicator ── */}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 12,
            right: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          <span
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius)',
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(6px)',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.03em',
            }}
          >
            {campaign.platform || 'Short-Form Ad'}
          </span>

          <span
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius)',
              background: isHovered ? 'linear-gradient(135deg, #2563EB, #1D4ED8)' : 'rgba(37, 99, 235, 0.85)',
              backdropFilter: 'blur(6px)',
              color: 'white',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.03em',
            }}
          >
            {isHovered ? '▶ WATCH AD' : 'AD CREATIVE'}
          </span>
        </div>
      </div>

      {/* ── Card Info Footer (Always visible) ── */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1, justifyContent: 'space-between' }}>
        {/* Brand & Campaign Title */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {campaign.brand || 'Featured Brand'}
              </span>
              <CheckCircle2 size={13} color="#2563EB" />
            </div>

            <AvailabilityBadge available={creator.is_available_for_work} />
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', margin: '2px 0 0', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {campaign.title}
          </h3>
        </div>

        {/* Creator Attribution Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          paddingTop: 10,
          borderTop: '1px solid var(--gray-100)',
        }}>
          {creator.profile_image ? (
            <img
              src={creator.profile_image}
              alt={creator.name}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid var(--gray-200)',
                flexShrink: 0,
              }}
            />
          ) : (
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              color: 'white',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {creator.name?.charAt(0).toUpperCase() || 'C'}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {creator.name || 'Commercial Creator'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {creator.niche || 'UGC & Video Specialist'}
            </div>
          </div>

          <RatingStars rating={creator.rating || 4.9} />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onOpenReel?.(index)}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, padding: '7px 10px', fontSize: 12, fontWeight: 600, gap: 5, justifyContent: 'center' }}
          >
            <Play size={13} fill="currentColor" /> Watch Creative
          </button>
          <button
            className="btn btn-primary btn-sm"
            style={{ flex: 1, padding: '7px 10px', fontSize: 12, fontWeight: 600, gap: 5, justifyContent: 'center' }}
            onClick={(e) => {
              e.stopPropagation();
              if (!isAuthenticated) { navigate('/login'); return; }
              onMessage(creator);
            }}
          >
            <MessageCircle size={13} /> Message
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

  const [campaigns, setCampaigns] = useState(DEMO_CAMPAIGNS);
  const [loading, setLoading] = useState(false);
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

  /* ── Load creators & blend campaigns ── */
  const fetchCreators = useCallback(async (searchTerm = '', niche = '', avail = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (niche && niche !== 'All') params.append('niche', niche);
      if (avail) params.append('available', 'true');

      let dbCreators = [];
      try {
        const res = await api.get(`/users/creators?${params.toString()}`);
        dbCreators = res.data || [];
      } catch {
        // Fallback gracefully if offline or backend is starting
      }

      // Filter the demo campaigns library according to search, category, and availability
      const filtered = DEMO_CAMPAIGNS.filter((c) => {
        const q = searchTerm.toLowerCase().trim();
        const matchesCategory =
          !niche || niche === 'All' || c.category.toLowerCase() === niche.toLowerCase();

        const matchesAvailability = !avail || c.creator.is_available_for_work !== false;

        const matchesSearch =
          !q ||
          c.brand.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.platform.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.skills.toLowerCase().includes(q) ||
          c.creator.name.toLowerCase().includes(q) ||
          c.creator.niche.toLowerCase().includes(q) ||
          c.creator.location.toLowerCase().includes(q);

        return matchesCategory && matchesAvailability && matchesSearch;
      });

      // If DB has custom creators matching search, merge them smoothly
      if (dbCreators.length > 0 && (!niche || niche === 'All')) {
        const dbMapped = dbCreators.map((dbc, idx) => ({
          id: `db-${dbc.id}`,
          brand: dbc.niche || 'Freelance Creative',
          title: dbc.bio || `${dbc.name} — Commercial Portfolio`,
          category: dbc.niche || 'Fashion & Beauty',
          platform: 'Instagram / TikTok',
          budget: 750 + (idx % 4) * 200,
          media_url: dbc.profile_image || DEMO_CAMPAIGNS[idx % DEMO_CAMPAIGNS.length].media_url,
          poster_url: dbc.profile_image || DEMO_CAMPAIGNS[idx % DEMO_CAMPAIGNS.length].poster_url,
          description: dbc.bio || 'High-converting social ad creatives and UGC videos for fast-growing DTC brands.',
          deliverables: '30s Vertical Ad Video + Stills',
          skills: dbc.skills || 'UGC, Video Editing, Social Ads',
          creator: dbc,
        }));
        // Prepend any custom DB creators while retaining the 15 rich campaigns
        setCampaigns([...dbMapped, ...filtered]);
      } else {
        setCampaigns(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch marketplace data', err);
      setCampaigns(DEMO_CAMPAIGNS);
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
    if (creator.id) {
      navigate(`/messages/${creator.id}`);
    } else {
      navigate('/messages');
    }
  };

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
          <Sparkles size={14} /> The Commercial Creator Marketplace
        </div>
        <h1>
          Discover the World's<br />
          <span className="gradient-text">Best Ad Creators</span>
        </h1>
        <p>
          Connect with top UGC creators, video editors, and advertising specialists. 
          Inspect commercial campaigns and message talent directly — no middlemen.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="hero-search-bar">
          <Search size={18} color="var(--gray-400)" />
          <input
            type="text"
            placeholder="Search by brand, campaign, niche, or creator (e.g. LumaSkin, Earbuds, Beauty, TikTok)..."
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
            { label: 'Curated Campaigns', value: `${campaigns.length}+` },
            { label: 'Active Categories', value: '8' },
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
            <div style={{ height: 32, width: 220, borderRadius: 'var(--radius)', background: 'var(--gray-200)', marginBottom: 8 }} />
            <div style={{ height: 16, width: 280, borderRadius: 'var(--radius)', background: 'var(--gray-100)', marginBottom: 20 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {[1,2,3,4,5,6].map(i => (
                <div
                  key={i}
                  style={{
                    height: 440,
                    borderRadius: 'var(--radius-lg)',
                    background: `hsl(${i * 30}, 10%, ${88 + i % 3}%)`,
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : campaigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Users size={48} color="var(--gray-300)" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8 }}>
              No ad campaigns found
            </h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: 20 }}>
              Try adjusting your search keywords or active category filter
            </p>
            <button className="btn btn-outline" onClick={() => { setSearch(''); setActiveCategory('All'); setAvailableOnly(false); fetchCreators(); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* ─ Unified Ad Campaign Grid ─ */}
            <section>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={20} color="var(--primary)" />
                    {activeCategory === 'All' ? 'Featured Commercial Campaigns' : `${activeCategory} Campaigns`}
                  </h2>
                  <p className="section-subtitle" style={{ marginBottom: 0 }}>
                    {campaigns.length} verified advertising creative{campaigns.length !== 1 ? 's' : ''} · Click to inspect brief & reel
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600, background: 'var(--white)', padding: '6px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
                    ✨ 3-Column Creative Feed
                  </span>
                </div>
              </div>

              {/* The Campaign Grid */}
              <div
                className="campaign-feed-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 24,
                }}
              >
                {campaigns.map((camp, i) => (
                  <CampaignCard
                    key={camp.id}
                    campaign={camp}
                    index={i}
                    onMessage={handleMessage}
                    isAuthenticated={isAuthenticated}
                    onOpenReel={(idx) => setSelectedReelIndex(idx)}
                  />
                ))}
              </div>
            </section>

            {/* ── Reels Vertical Video / Campaign Viewer Modal ── */}
            {selectedReelIndex !== null && (
              <ReelsModal
                campaigns={campaigns}
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
              Discover commercial creators directly or post a campaign brief — AdCraft supports both workflows
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
                Join AdCraft and start discovering verified advertising talent today. Free to sign up.
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
          © 2026 AdCraft. Commercial Creator Marketplace.
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

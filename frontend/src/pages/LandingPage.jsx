/**
 * LandingPage — AdCraft's high-converting, modern landing page.
 * Showcase brand and creator value propositions, live previews,
 * interactive ROI & earnings calculator, testimonials, and FAQs.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Video,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Star,
  ChevronDown,
  ChevronUp,
  Play,
  Users,
  Briefcase,
  Layers,
  Menu,
  X
} from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import './LandingPage.css';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Navigation bar scroll detection
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tabbed view state for Value Props (brands vs creators)
  const [activeTab, setActiveTab] = useState('brands');

  // Calculator widget state
  const [calcRole, setCalcRole] = useState('creator');
  const [videoCount, setVideoCount] = useState(5);
  const [adSpend, setAdSpend] = useState(3000);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(0);

  const showcaseItems = [
    {
      id: 1,
      tag: 'Product Unboxing',
      title: 'Hydrating Glow Serum Demo',
      creator: 'By Elena R. • 4.9 ★ Rating',
      thumb: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 2,
      tag: 'Problem vs Solution',
      title: 'Wireless ANC Headphone Review',
      creator: 'By Marcus T. • 5.0 ★ Rating',
      thumb: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 3,
      tag: 'Lifestyle & Fitness',
      title: 'Organic Electrolyte Drink Hook',
      creator: 'By Sophia K. • 4.9 ★ Rating',
      thumb: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dashboardRoute = user?.role === 'brand_owner' ? '/brand/dashboard' : '/creator/dashboard';

  // Calculator values calculation
  const estimatedCreatorIncome = videoCount * 250;
  const estimatedBrandROAS = (adSpend * 3.8).toLocaleString('en-US');

  const faqs = [
    {
      question: 'What is AdCraft?',
      answer:
        'AdCraft is an all-in-one UGC marketplace connecting e-commerce brands with top-tier video content creators. Brands get high-converting video ads, while creators earn guaranteed payouts for producing authentic content.'
    },
    {
      question: 'How do payments and escrow work?',
      answer:
        'When a brand accepts a creator pitch, the funds are deposited into AdCraft Escrow. Creators submit videos, and once the brand reviews and approves the submission, the funds are instantly released to the creator.'
    },
    {
      question: 'Can creators pitch to multiple brand projects?',
      answer:
        'Yes! Verified creators can browse open job briefs, submit video proposals, and manage multiple ongoing brand collaborations seamlessly directly from their creator portal.'
    },
    {
      question: 'How quickly can brands expect video ad turnarounds?',
      answer:
        'Most creators deliver initial video concepts within 3 to 5 business days. Revisions can be requested directly in the platform video player with frame-accurate notes.'
    },
    {
      question: 'Is there a free tier for trying out the platform?',
      answer:
        'Signing up as a brand or creator is 100% free! Brands only fund escrow when launching projects, and creators keep 100% of agreed brief payouts with transparent low service fees.'
    }
  ];

  return (
    <div className="lp-container">
      {/* Mesh Background & Overlay */}
      <div className="lp-mesh-bg" />
      <div className="lp-grid-overlay" />

      {/* Glassmorphic Navbar */}
      <header className={`lp-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="lp-content-wrapper lp-header-inner">
          <Link to="/" className="lp-logo">
            <div className="lp-logo-icon">
              <Zap size={22} fill="currentColor" />
            </div>
            <span>Ad<span className="lp-logo-gradient">Craft</span></span>
          </Link>

          <nav className="lp-nav-links">
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#how-it-works" className="lp-nav-link">How It Works</a>
            <a href="#calculator" className="lp-nav-link">Calculator</a>
            <a href="#showcase" className="lp-nav-link">Showcase</a>
            <a href="#testimonials" className="lp-nav-link">Testimonials</a>
            <a href="#faq" className="lp-nav-link">FAQ</a>
          </nav>

          <div className="lp-header-actions">
            {isAuthenticated ? (
              <Link to={dashboardRoute} className="lp-btn lp-btn-primary">
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="lp-btn lp-btn-ghost">
                  Sign In
                </Link>
                <Link to="/register" className="lp-btn lp-btn-primary">
                  Get Started Free <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>

          <button
            className="lp-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lp-mobile-menu">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="lp-nav-link">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="lp-nav-link">How It Works</a>
            <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="lp-nav-link">Calculator</a>
            <a href="#showcase" onClick={() => setMobileMenuOpen(false)} className="lp-nav-link">Showcase</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="lp-nav-link">FAQ</a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {isAuthenticated ? (
                <Link to={dashboardRoute} className="lp-btn lp-btn-primary">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="lp-btn lp-btn-secondary">
                    Sign In
                  </Link>
                  <Link to="/register" className="lp-btn lp-btn-primary">
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="lp-hero">
        <div className="lp-content-wrapper">
          <div className="lp-badge-wrapper">
            <Sparkles size={14} className="lp-badge-sparkle" />
            <span>The #1 Creator Ad Collaboration Platform</span>
          </div>

          <h1 className="lp-hero-title">
            Connect Brands with Top UGC Creators to Craft <span className="lp-gradient-text">High-Converting Video Ads</span>
          </h1>

          <p className="lp-hero-subtitle">
            Post project briefs, source authentic video creators, review drafts with built-in feedback tools, and scale revenue with guaranteed secure escrow.
          </p>

          <div className="lp-hero-ctas">
            <Link to="/register" className="lp-btn lp-btn-primary lp-btn-lg">
              Start as Brand <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="lp-btn lp-btn-secondary lp-btn-lg">
              Join as Creator
            </Link>
          </div>

          {/* Social Proof Stats Bar */}
          <div className="lp-stats-bar">
            <div className="lp-stat-item">
              <div className="lp-stat-number">12,400+</div>
              <div className="lp-stat-label">Video Ads Created</div>
            </div>
            <div className="lp-stat-divider" />
            <div className="lp-stat-item">
              <div className="lp-stat-number">$3.8M+</div>
              <div className="lp-stat-label">Paid to Creators</div>
            </div>
            <div className="lp-stat-divider" />
            <div className="lp-stat-item">
              <div className="lp-stat-number">4.2x</div>
              <div className="lp-stat-label">Avg Brand ROAS Lift</div>
            </div>
            <div className="lp-stat-divider" />
            <div className="lp-stat-item">
              <div className="lp-stat-number">98.6%</div>
              <div className="lp-stat-label">Satisfaction Rate</div>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="lp-hero-visual">
            <div className="lp-float-badge-1">
              <ShieldCheck size={20} color="#34d399" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Escrow Guaranteed</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>100% Payout Protection</div>
              </div>
            </div>

            <div className="lp-float-badge-2">
              <TrendingUp size={20} color="#c084fc" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>+340% Conversions</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>TikTok & Instagram Ads</div>
              </div>
            </div>

            <div className="lp-mockup-frame">
              <div className="lp-mockup-header">
                <div className="lp-mockup-dot lp-dot-red" />
                <div className="lp-mockup-dot lp-dot-yellow" />
                <div className="lp-mockup-dot lp-dot-green" />
                <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 12 }}>AdCraft Workspace — Active Campaign</span>
              </div>

              <div className="lp-mockup-body">
                <div className="lp-preview-card-main">
                  <span className="lp-preview-badge">✨ Active Campaign</span>
                  <h3 className="lp-preview-title">Summer Glow Skin Routine — TikTok UGC Video Ad</h3>
                  <p className="lp-preview-desc">
                    Looking for energetic skincare creators to demonstrate our hydrating facial serum in 30s vertical format.
                  </p>
                  <div className="lp-preview-meta">
                    <div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>Budget</div>
                      <div className="lp-preview-budget">$450 per video</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Applicants</div>
                      <div className="lp-preview-creators">
                        <img className="lp-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Creator" />
                        <img className="lp-avatar" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Creator" />
                        <img className="lp-avatar" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Creator" />
                        <span style={{ fontSize: 12, color: '#60a5fa', marginLeft: 8, fontWeight: 600 }}>+12 creators</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="lp-floating-card lp-float-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Draft Approved!</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#9ca3af' }}>
                      &ldquo;Amazing lighting and authentic hook! Releasing $450 escrow now.&rdquo;
                    </p>
                  </div>

                  <div className="lp-floating-card lp-float-bottom">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <Video size={16} color="#60a5fa" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>4K Video Uploaded</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Format: MP4 (9:16) &bull; 60fps</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Value Proposition Section */}
      <section id="features" className="lp-section">
        <div className="lp-content-wrapper">
          <div className="lp-section-header">
            <span className="lp-section-tag">Tailored Solution</span>
            <h2 className="lp-section-title">Built for High-Growth Brands & Creator Studios</h2>
            <p className="lp-section-desc">
              Whether you are an e-commerce brand seeking viral ad content or a creator building a lucrative video business, AdCraft gives you the edge.
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div className="lp-tab-switch">
              <button
                className={`lp-tab-btn ${activeTab === 'brands' ? 'active' : ''}`}
                onClick={() => setActiveTab('brands')}
              >
                <Briefcase size={16} /> For Brand Owners
              </button>
              <button
                className={`lp-tab-btn ${activeTab === 'creators' ? 'active' : ''}`}
                onClick={() => setActiveTab('creators')}
              >
                <Users size={16} /> For Content Creators
              </button>
            </div>
          </div>

          {activeTab === 'brands' ? (
            <div className="lp-features-grid">
              <div className="lp-feature-card">
                <div className="lp-feature-icon">
                  <Zap size={24} />
                </div>
                <h3 className="lp-feature-title">Post Briefs in 2 Minutes</h3>
                <p className="lp-feature-desc">
                  Define your ad requirements, target demographic, budget, and guidelines. Instant notification alerts top vetted creators.
                </p>
              </div>

              <div className="lp-feature-card">
                <div className="lp-feature-icon">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="lp-feature-title">Escrow Protection</h3>
                <p className="lp-feature-desc">
                  Your funds remain locked safely in escrow and are only released when you inspect and approve the completed video submission.
                </p>
              </div>

              <div className="lp-feature-card">
                <div className="lp-feature-icon">
                  <Video size={24} />
                </div>
                <h3 className="lp-feature-title">Built-In Video Review</h3>
                <p className="lp-feature-desc">
                  Review raw and edited UGC video files with inline comments, playback controls, and revision management directly inside the dashboard.
                </p>
              </div>
            </div>
          ) : (
            <div className="lp-features-grid">
              <div className="lp-feature-card">
                <div className="lp-feature-icon">
                  <DollarSign size={24} />
                </div>
                <h3 className="lp-feature-title">Guaranteed On-Time Payouts</h3>
                <p className="lp-feature-desc">
                  No more chasing unpaid invoices. Funds are deposited into project escrow before you even start filming.
                </p>
              </div>

              <div className="lp-feature-card">
                <div className="lp-feature-icon">
                  <Briefcase size={24} />
                </div>
                <h3 className="lp-feature-title">Access Premium Brand Deals</h3>
                <p className="lp-feature-desc">
                  Pitch to top DTC brands, tech startups, and global e-commerce stores looking for authentic UGC video talent.
                </p>
              </div>

              <div className="lp-feature-card">
                <div className="lp-feature-icon">
                  <Award size={24} />
                </div>
                <h3 className="lp-feature-title">Build Your Verified Portfolio</h3>
                <p className="lp-feature-desc">
                  Showcase client ratings, completed campaign stats, and high-impact video samples on your public AdCraft creator profile.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="lp-section" style={{ background: 'rgba(255, 255, 255, 0.015)' }}>
        <div className="lp-content-wrapper">
          <div className="lp-section-header">
            <span className="lp-section-tag">Seamless Process</span>
            <h2 className="lp-section-title">How AdCraft Delivers Results in 4 Simple Steps</h2>
            <p className="lp-section-desc">
              From posting an ad brief to getting high-performing video assets ready for Meta & TikTok ads.
            </p>
          </div>

          <div className="lp-steps-container">
            <div className="lp-step-card">
              <div className="lp-step-number">01</div>
              <h3 className="lp-step-title">Create or Pitch Brief</h3>
              <p className="lp-step-desc">
                Brands publish video requirements and budget. Creators submit customized pitches and portfolio samples.
              </p>
            </div>

            <div className="lp-step-card">
              <div className="lp-step-number">02</div>
              <h3 className="lp-step-title">Match & Escrow Fund</h3>
              <p className="lp-step-desc">
                Brand selects the best creator candidate and funds escrow securely to begin production.
              </p>
            </div>

            <div className="lp-step-card">
              <div className="lp-step-number">03</div>
              <h3 className="lp-step-title">Film & Deliver Drafts</h3>
              <p className="lp-step-desc">
                Creators produce authentic UGC videos, unboxings, or product demos and submit high-res drafts.
              </p>
            </div>

            <div className="lp-step-card">
              <div className="lp-step-number">04</div>
              <h3 className="lp-step-title">Approve & Launch</h3>
              <p className="lp-step-desc">
                Brand reviews video quality, requests tweaks if necessary, approves final delivery, and launches ad campaigns!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Calculator Widget */}
      <section id="calculator" className="lp-section">
        <div className="lp-content-wrapper">
          <div className="lp-section-header">
            <span className="lp-section-tag">Interactive Estimate</span>
            <h2 className="lp-section-title">Calculate Your Growth Potential</h2>
            <p className="lp-section-desc">
              See how much you can earn as a creator or save as a brand scaling video ad creation.
            </p>
          </div>

          <div className="lp-calc-box">
            <div className="lp-calc-grid">
              <div className="lp-calc-controls">
                <div className="lp-tab-switch" style={{ marginBottom: 24 }}>
                  <button
                    className={`lp-tab-btn ${calcRole === 'creator' ? 'active' : ''}`}
                    onClick={() => setCalcRole('creator')}
                  >
                    Creator Earnings
                  </button>
                  <button
                    className={`lp-tab-btn ${calcRole === 'brand' ? 'active' : ''}`}
                    onClick={() => setCalcRole('brand')}
                  >
                    Brand ROAS Return
                  </button>
                </div>

                {calcRole === 'creator' ? (
                  <div>
                    <div className="lp-calc-label">
                      <span>Videos Filmed Per Month:</span>
                      <strong style={{ color: '#38bdf8', fontSize: 18 }}>{videoCount} videos</strong>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={videoCount}
                      onChange={(e) => setVideoCount(Number(e.target.value))}
                      className="lp-calc-slider"
                    />
                    <p style={{ fontSize: 13, color: '#9ca3af' }}>
                      Based on an average payout of $250 per UGC video brief on AdCraft.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="lp-calc-label">
                      <span>Monthly Video Ad Spend ($):</span>
                      <strong style={{ color: '#38bdf8', fontSize: 18 }}>${adSpend.toLocaleString()}</strong>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="20000"
                      step="500"
                      value={adSpend}
                      onChange={(e) => setAdSpend(Number(e.target.value))}
                      className="lp-calc-slider"
                    />
                    <p style={{ fontSize: 13, color: '#9ca3af' }}>
                      Based on an average 3.8x ROAS increase using authentic creator UGC vs static images.
                    </p>
                  </div>
                )}
              </div>

              <div className="lp-calc-output">
                {calcRole === 'creator' ? (
                  <>
                    <div className="lp-calc-result-number">${estimatedCreatorIncome.toLocaleString()}</div>
                    <div className="lp-calc-result-sub">Estimated Monthly Revenue</div>
                    <Link to="/register" className="lp-btn lp-btn-primary" style={{ width: '100%' }}>
                      Start Filming Now <ArrowRight size={16} />
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="lp-calc-result-number">${estimatedBrandROAS}</div>
                    <div className="lp-calc-result-sub">Estimated Return from Creator Ads</div>
                    <Link to="/register" className="lp-btn lp-btn-primary" style={{ width: '100%' }}>
                      Scale Your Ad Revenue <ArrowRight size={16} />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Showcase Grid */}
      <section id="showcase" className="lp-section" style={{ background: 'rgba(255, 255, 255, 0.015)' }}>
        <div className="lp-content-wrapper">
          <div className="lp-section-header">
            <span className="lp-section-tag">High Performing Formats</span>
            <h2 className="lp-section-title">Explore Trending UGC Video Ad Styles</h2>
            <p className="lp-section-desc">
              Discover authentic ad content format styles crafted by top creators on AdCraft.
            </p>
          </div>

          <div className="lp-showcase-grid">
            {showcaseItems.map((item) => (
              <div key={item.id} className="lp-showcase-card">
                <div
                  className="lp-showcase-thumb"
                  style={{ backgroundImage: `url(${item.thumb})` }}
                >
                  <div className="lp-showcase-overlay" />
                </div>
                <div className="lp-showcase-body">
                  <span className="lp-showcase-tag">{item.tag}</span>
                  <h3 className="lp-showcase-title">{item.title}</h3>
                  <div className="lp-showcase-creator">{item.creator}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials & Reviews */}
      <section id="testimonials" className="lp-section">
        <div className="lp-content-wrapper">
          <div className="lp-section-header">
            <span className="lp-section-tag">Loved by Hundreds</span>
            <h2 className="lp-section-title">What Brands & Creators Are Saying</h2>
            <p className="lp-section-desc">
              Hear directly from the community turning video ideas into scalable revenue.
            </p>
          </div>

          <div className="lp-testimonials-grid">
            <div className="lp-testimonial-card">
              <div>
                <div className="lp-testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="lp-testimonial-quote">
                  &ldquo;AdCraft cut our video creative turnaround time from 3 weeks to 3 days. Our CPA dropped by 38% on Meta ads within the first month!&rdquo;
                </p>
              </div>
              <div className="lp-testimonial-user">
                <img
                  className="lp-user-avatar"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Sarah Chen"
                />
                <div>
                  <div className="lp-user-name">Sarah Chen</div>
                  <div className="lp-user-role">Head of Growth @ GlowBotanica</div>
                </div>
              </div>
            </div>

            <div className="lp-testimonial-card">
              <div>
                <div className="lp-testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="lp-testimonial-quote">
                  &ldquo;As a full-time UGC creator, escrow guarantees give me peace of mind. I know every video I film will be paid out promptly upon delivery.&rdquo;
                </p>
              </div>
              <div className="lp-testimonial-user">
                <img
                  className="lp-user-avatar"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                  alt="David Miller"
                />
                <div>
                  <div className="lp-user-name">David Miller</div>
                  <div className="lp-user-role">Top UGC Video Creator</div>
                </div>
              </div>
            </div>

            <div className="lp-testimonial-card">
              <div>
                <div className="lp-testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="lp-testimonial-quote">
                  &ldquo;The built-in video player review tool makes giving timestamped feedback effortless. Our agency manages 15+ creator campaigns seamlessly.&rdquo;
                </p>
              </div>
              <div className="lp-testimonial-user">
                <img
                  className="lp-user-avatar"
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                  alt="Amanda Vance"
                />
                <div>
                  <div className="lp-user-name">Amanda Vance</div>
                  <div className="lp-user-role">Founder @ Kinetic Media</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="lp-section" style={{ background: 'rgba(255, 255, 255, 0.015)' }}>
        <div className="lp-content-wrapper">
          <div className="lp-section-header">
            <span className="lp-section-tag">Got Questions?</span>
            <h2 className="lp-section-title">Frequently Asked Questions</h2>
            <p className="lp-section-desc">
              Everything you need to know about starting as a brand or creator on AdCraft.
            </p>
          </div>

          <div className="lp-faq-container">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`lp-faq-item ${openFaq === index ? 'open' : ''}`}
              >
                <button
                  className="lp-faq-question"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span>{faq.question}</span>
                  {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {openFaq === index && (
                  <div className="lp-faq-answer">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Action CTA Banner */}
      <section className="lp-section">
        <div className="lp-content-wrapper">
          <div className="lp-cta-banner">
            <div className="lp-cta-glow" />
            <h2 className="lp-cta-title">Ready to Transform Your Video Ads?</h2>
            <p className="lp-cta-desc">
              Join thousands of brands and creators scaling revenue through high-converting UGC video content.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
              <Link to="/register" className="lp-btn lp-btn-primary lp-btn-lg">
                Create Free Account <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="lp-btn lp-btn-secondary lp-btn-lg">
                Sign In to Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-content-wrapper">
          <div className="lp-footer-grid">
            <div>
              <Link to="/" className="lp-logo" style={{ marginBottom: 12 }}>
                <div className="lp-logo-icon">
                  <Zap size={20} fill="currentColor" />
                </div>
                <span>Ad<span className="lp-logo-gradient">Craft</span></span>
              </Link>
              <p className="lp-footer-brand-desc">
                Connecting DTC brands and creators to produce high-converting UGC video advertising campaigns with guaranteed escrow protection.
              </p>
            </div>

            <div>
              <h4 className="lp-footer-col-title">Platform</h4>
              <ul className="lp-footer-links">
                <li><a href="#features" className="lp-footer-link">Features</a></li>
                <li><a href="#how-it-works" className="lp-footer-link">How It Works</a></li>
                <li><a href="#calculator" className="lp-footer-link">Earnings Calculator</a></li>
                <li><a href="#showcase" className="lp-footer-link">Video Formats</a></li>
              </ul>
            </div>

            <div>
              <h4 className="lp-footer-col-title">Account</h4>
              <ul className="lp-footer-links">
                <li><Link to="/login" className="lp-footer-link">Sign In</Link></li>
                <li><Link to="/register" className="lp-footer-link">Brand Registration</Link></li>
                <li><Link to="/register" className="lp-footer-link">Creator Sign Up</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="lp-footer-col-title">Legal & Security</h4>
              <ul className="lp-footer-links">
                <li><a href="#" className="lp-footer-link">Terms of Service</a></li>
                <li><a href="#" className="lp-footer-link">Privacy Policy</a></li>
                <li><a href="#" className="lp-footer-link">Escrow Guidelines</a></li>
                <li><a href="#" className="lp-footer-link">Support Center</a></li>
              </ul>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <div>&copy; {new Date().getFullYear()} AdCraft Technologies Inc. All rights reserved.</div>
            <div style={{ display: 'flex', gap: 20 }}>
              <a href="#" className="lp-footer-link">Twitter / X</a>
              <a href="#" className="lp-footer-link">Instagram</a>
              <a href="#" className="lp-footer-link">TikTok</a>
              <a href="#" className="lp-footer-link">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

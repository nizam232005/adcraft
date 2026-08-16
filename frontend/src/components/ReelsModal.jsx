import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X, ChevronUp, ChevronDown, Volume2, VolumeX, MessageCircle, Eye,
  Sparkles, CheckCircle2, Play, Pause, Share2, Tag, Calendar, DollarSign,
  Smartphone, Film, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReelsModal({
  campaigns = [],
  creators = [],
  initialIndex = 0,
  onClose,
  onMessage,
  isAuthenticated,
}) {
  const navigate = useNavigate();
  const items = campaigns.length > 0 ? campaigns : creators;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [audioCtx, setAudioCtx] = useState(null);
  const timerRef = useRef(null);
  const soundNodeRef = useRef(null);

  const currentItem = items[currentIndex] || {};
  const currentCreator = currentItem.creator || currentItem;
  const skills = (currentItem.skills || currentCreator.skills || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const posterSrc = currentItem.poster_url || currentItem.media_url || currentCreator.portfolio?.[0]?.media_url;

  // Duration in seconds for each ad reel
  const DURATION = 15;

  // Reset progress when index changes
  useEffect(() => {
    setProgress(0);
    setIsPlaying(true);
  }, [currentIndex]);

  // Timeline playback progress loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const interval = 50; // ms
    const step = (interval / (DURATION * 1000)) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Auto loop or go to next campaign
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentIndex]);

  // Web Audio Synth for ambient commercial sound
  useEffect(() => {
    if (isMuted || !isPlaying) {
      if (soundNodeRef.current) {
        try { soundNodeRef.current.stop(); } catch {}
        soundNodeRef.current = null;
      }
      return;
    }

    try {
      const ctx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (!audioCtx) setAudioCtx(ctx);

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Gentle ambient chime sound loop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      const freqs = [329.63, 392.00, 493.88, 587.33, 659.25]; // E major pentatonic
      const f = freqs[currentIndex % freqs.length];
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 3);

      soundNodeRef.current = osc;
    } catch {}

    return () => {
      if (soundNodeRef.current) {
        try { soundNodeRef.current.stop(); } catch {}
        soundNodeRef.current = null;
      }
    };
  }, [isMuted, isPlaying, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isPlaying, items.length]);

  const goToNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(items.length - 1);
    }
  };

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    setIsPlaying(prev => !prev);
  };

  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    setIsMuted(prev => !prev);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Campaign creative link copied to clipboard!');
  };

  if (!currentItem || items.length === 0) return null;

  const currentSeconds = Math.floor((progress / 100) * DURATION);

  return (
    <div
      className="reels-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 18, 0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      {/* ── Top Header / Close Bar ── */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 24,
          right: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10010,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
            fontSize: 13,
            fontWeight: 700,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <Sparkles size={14} color="#60A5FA" />
            <span>Ad Creative Reel Player</span>
          </div>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            {currentIndex + 1} of {items.length} Campaigns
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          title="Close (Esc)"
        >
          <X size={22} />
        </button>
      </div>

      {/* ── Main Reel Content Container ── */}
      <div
        onClick={togglePlay}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 440,
          height: 'min(88vh, 780px)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          backgroundColor: '#0a0e1a',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 50px rgba(37, 99, 235, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
      >
        {/* ── Top Story Scrubber Timeline ── */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 14,
            right: 14,
            height: 3,
            background: 'rgba(255, 255, 255, 0.25)',
            borderRadius: 2,
            overflow: 'hidden',
            zIndex: 20,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #60A5FA, #3B82F6)',
              transition: 'width 0.05s linear',
              borderRadius: 2,
            }}
          />
        </div>

        {/* ── Motion Creative Artwork Layer ── */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#0a0e1a' }}>
          <img
            src={posterSrc}
            alt={currentItem.title || currentCreator.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transform: isPlaying ? `scale(${1.0 + (progress / 100) * 0.12}) translateY(${Math.sin((progress / 100) * Math.PI) * -8}px)` : 'scale(1.04)',
              transition: isPlaying ? 'transform 0.08s linear' : 'transform 0.3s ease',
            }}
          />

          {/* Dynamic Commercial Lighting Shimmer Sweep */}
          {isPlaying && (
            <div
              style={{
                position: 'absolute',
                inset: '-50%',
                width: '200%',
                height: '200%',
                background: 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.22) 50%, transparent 60%)',
                transform: `translateX(${(progress - 50) * 3}%)`,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Vignette Shadow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              boxShadow: 'inset 0 0 60px rgba(0,0,0,0.6)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* ── Top Badges Row ── */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Brand Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}>
            <Sparkles size={13} color="#60A5FA" />
            <span>{currentItem.brand || 'AdCraft Creator'}</span>
            <CheckCircle2 size={13} color="#34D399" />
          </div>

          {/* Equalizer / Audio & Budget Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Animated Equalizer Wave */}
            {isPlaying && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 2,
                height: 16,
                padding: '4px 6px',
                background: 'rgba(0,0,0,0.5)',
                borderRadius: 'var(--radius-sm)',
              }}>
                <span style={{ width: 2.5, height: `${40 + Math.sin(progress * 0.8) * 35}%`, background: '#60A5FA', borderRadius: 1 }} />
                <span style={{ width: 2.5, height: `${60 + Math.cos(progress * 1.2) * 35}%`, background: '#60A5FA', borderRadius: 1 }} />
                <span style={{ width: 2.5, height: `${30 + Math.sin(progress * 1.5) * 35}%`, background: '#60A5FA', borderRadius: 1 }} />
              </div>
            )}

            {currentItem.budget && (
              <div style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: 'white',
                fontSize: 12,
                fontWeight: 800,
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
              }}>
                ${currentItem.budget}
              </div>
            )}

            <button
              onClick={toggleMute}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX size={15} color="#FBBF24" /> : <Volume2 size={15} color="#34D399" />}
            </button>
          </div>
        </div>

        {/* ── Center Play / Pause Indicator on Click ── */}
        {!isPlaying && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)',
              zIndex: 15,
            }}
          >
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              transform: 'scale(1)',
              animation: 'popIn 0.2s ease',
            }}>
              <Play size={34} fill="var(--primary)" color="var(--primary)" style={{ marginLeft: 4 }} />
            </div>
          </div>
        )}

        {/* ── Bottom Overlay: Campaign Details & Creator Info ── */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '80px 20px 20px',
            background: 'linear-gradient(to top, rgba(10, 14, 26, 0.98) 0%, rgba(10, 14, 26, 0.85) 60%, transparent 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            zIndex: 10,
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Campaign Title & Category */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#93C5FD',
                background: 'rgba(37, 99, 235, 0.25)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}>
                {currentItem.category || currentCreator.niche || 'Ad Creative'}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                {currentItem.platform || 'Short-Form Video'}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginLeft: 'auto' }}>
                0:{currentSeconds.toString().padStart(2, '0')} / 0:15
              </span>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.3 }}>
              {currentItem.title || currentCreator.name}
            </h2>
          </div>

          {/* Description / Creative Brief */}
          {currentItem.description && (
            <p style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.45,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {currentItem.description}
            </p>
          )}

          {/* Deliverables snippet */}
          {currentItem.deliverables && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: '#CBD5E1',
              background: 'rgba(255,255,255,0.08)',
              padding: '6px 10px',
              borderRadius: 'var(--radius)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <Film size={13} color="#60A5FA" />
              <span style={{ fontWeight: 600 }}>Deliverable:</span>
              <span style={{ color: 'white' }}>{currentItem.deliverables}</span>
            </div>
          )}

          {/* Creator Profile Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            paddingTop: 8,
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            {currentCreator.profile_image ? (
              <img
                src={currentCreator.profile_image}
                alt={currentCreator.name}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(255,255,255,0.8)',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                color: 'white',
                fontSize: 18,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255,255,255,0.8)',
                flexShrink: 0,
              }}>
                {currentCreator.name?.charAt(0).toUpperCase()}
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentCreator.name}
                </span>
                {currentCreator.rating && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#FBBF24', display: 'flex', alignItems: 'center', gap: 2 }}>
                    ★ {currentCreator.rating}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentCreator.niche || 'Professional Creator'}
                {currentCreator.location && ` · ${currentCreator.location}`}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Link
              to={currentCreator.id ? `/profile/${currentCreator.id}` : '#'}
              onClick={onClose}
              className="btn btn-sm"
              style={{
                flex: 1,
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.12)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(8px)',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: 600,
                padding: '9px 12px',
              }}
            >
              <Eye size={14} /> Profile
            </Link>

            <button
              className="btn btn-primary btn-sm"
              style={{
                flex: 1.4,
                justifyContent: 'center',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: 700,
                padding: '9px 14px',
              }}
              onClick={() => {
                onClose();
                if (!isAuthenticated) { navigate('/login'); return; }
                if (onMessage) onMessage(currentCreator);
              }}
            >
              <MessageCircle size={14} /> Book / Message
            </button>

            <button
              onClick={handleShare}
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Share Campaign"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Scroll Controls (Right Side Arrows for Desktop) ── */}
      <div
        style={{
          position: 'absolute',
          right: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'center',
          zIndex: 10010,
        }}
      >
        <button
          onClick={goToPrev}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          title="Previous Campaign (Up Arrow)"
        >
          <ChevronUp size={24} />
        </button>

        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          NEXT
        </div>

        <button
          onClick={goToNext}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          title="Next Campaign (Down Arrow)"
        >
          <ChevronDown size={24} />
        </button>
      </div>
    </div>
  );
}

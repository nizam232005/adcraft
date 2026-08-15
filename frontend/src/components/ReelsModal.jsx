import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X, ChevronUp, ChevronDown, Volume2, VolumeX, MessageCircle, Eye,
  Sparkles, UserCheck, Play, Pause, Share2
} from 'lucide-react';
import toast from 'react-hot-toast';

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

export default function ReelsModal({ creators = [], initialIndex = 0, onClose, onMessage, isAuthenticated }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(true); // Default muted to comply with browser autoplay policies
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoErrorCount, setVideoErrorCount] = useState(0);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const currentCreator = creators[currentIndex] || {};
  const skills = currentCreator.skills ? currentCreator.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
  const featuredMedia = currentCreator.portfolio?.[0];

  // Determine video URL with fallback retry logic
  const primaryVideoSrc = (featuredMedia?.media_url && !featuredMedia.media_url.includes('placeholder'))
    ? featuredMedia.media_url
    : null;

  const videoSrc = (primaryVideoSrc && videoErrorCount === 0)
    ? primaryVideoSrc
    : DEMO_VIDEOS[(currentIndex + videoErrorCount) % DEMO_VIDEOS.length];

  // Auto-play and manage video when currentIndex changes
  useEffect(() => {
    setVideoErrorCount(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Autoplay blocked or failed:', err);
            setIsPlaying(false);
          });
      }
    }
  }, [currentIndex, videoSrc]);

  // Keyboard navigation (Arrow keys & Escape)
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
  }, [currentIndex, isPlaying]);

  const goToNext = () => {
    if (currentIndex < creators.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // Loop around
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(creators.length - 1);
    }
  };

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Error trying to play video:', err);
            setIsPlaying(false);
          });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Creator profile link copied to clipboard!');
  };

  // Wheel scroll event handler for TikTok/Reels scroll snap feel
  const lastScrollTime = useRef(0);
  const handleWheel = (e) => {
    const now = Date.now();
    if (now - lastScrollTime.current < 600) return; // Debounce rapid scroll ticks
    if (e.deltaY > 30) {
      lastScrollTime.current = now;
      goToNext();
    } else if (e.deltaY < -30) {
      lastScrollTime.current = now;
      goToPrev();
    }
  };

  if (!currentCreator || creators.length === 0) return null;

  return (
    <div
      className="reels-modal-overlay"
      onWheel={handleWheel}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 18, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
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
          justify: 'space-between',
          alignItems: 'center',
          zIndex: 10010,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white' }}>
          <div style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <Sparkles size={14} color="#60A5FA" />
            <span>AdCraft Reels Feed</span>
          </div>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
            {currentIndex + 1} of {creators.length}
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
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
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 420,
          height: 'min(86vh, 760px)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          backgroundColor: '#000',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(37, 99, 235, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* ── Video Element ── */}
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          playsInline
          muted={isMuted}
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onPlaying={() => setIsPlaying(true)}
          onError={() => setVideoErrorCount(prev => prev + 1)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            cursor: 'pointer',
          }}
        />

        {/* ── Tap to Unmute Toast Indicator ── */}
        {isMuted && (
          <div
            onClick={toggleMute}
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              zIndex: 10,
            }}
          >
            <VolumeX size={14} color="#F59E0B" />
            <span>Tap for Audio</span>
          </div>
        )}

        {/* ── Center Play / Pause Indicator on Click ── */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.35)',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Play size={32} color="white" fill="white" style={{ marginLeft: 4 }} />
            </div>
          </div>
        )}

        {/* ── Sound Control Badge (Top-Right of Video) ── */}
        <button
          onClick={toggleMute}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* ── Bottom Overlay: Creator Info & CTAs (Instagram Reels Style) ── */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '60px 20px 20px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 60%, transparent 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            zIndex: 10,
            pointerEvents: 'auto',
          }}
        >
          {/* Creator Profile Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to={`/profile/${currentCreator.id}`} style={{ textDecoration: 'none' }}>
              {currentCreator.profile_image ? (
                <img
                  src={currentCreator.profile_image}
                  alt={currentCreator.name}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid white',
                  }}
                />
              ) : (
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  color: 'white',
                  fontSize: 20,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                }}>
                  {currentCreator.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: 0 }}>
                  {currentCreator.name}
                </h3>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#4ADE80',
                  background: 'rgba(74, 222, 128, 0.15)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}>
                  <UserCheck size={10} /> Verified
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: '2px 0 0' }}>
                {currentCreator.niche || 'Content Creator'}
                {currentCreator.location && ` · ${currentCreator.location}`}
              </p>
            </div>
          </div>

          {/* Bio snippet */}
          {currentCreator.bio && (
            <p style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.4,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {currentCreator.bio}
            </p>
          )}

          {/* Skill pills */}
          {skills.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {skills.slice(0, 3).map((skill, idx) => (
                <span key={idx} style={{
                  fontSize: 11,
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(4px)',
                  color: 'white',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}>
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Link
              to={`/profile/${currentCreator.id}`}
              className="btn btn-sm"
              style={{
                flex: 1,
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(8px)',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
              }}
            >
              <Eye size={14} /> Profile
            </Link>
            <button
              className="btn btn-primary btn-sm"
              style={{
                flex: 1.2,
                justifyContent: 'center',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: 700,
              }}
              onClick={() => {
                onClose();
                if (!isAuthenticated) { navigate('/login'); return; }
                onMessage(currentCreator);
              }}
            >
              <MessageCircle size={14} /> Message Creator
            </button>
            <button
              onClick={handleShare}
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Share Creator"
            >
              <Share2 size={16} />
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
          title="Previous Reel (Up Arrow)"
        >
          <ChevronUp size={24} />
        </button>

        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Scroll
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
          title="Next Reel (Down Arrow)"
        >
          <ChevronDown size={24} />
        </button>
      </div>
    </div>
  );
}

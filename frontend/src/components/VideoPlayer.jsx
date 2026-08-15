import { useState } from 'react';
import { Film, ExternalLink } from 'lucide-react';

const FALLBACK_VIDEO = 'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/bottle-detection.mp4';

export default function VideoPlayer({ src, style = {}, height = 180 }) {
  const [videoSrc, setVideoSrc] = useState(src || FALLBACK_VIDEO);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src && !videoSrc) return null;

  const handleVideoError = (e) => {
    console.warn('Video load error for src:', videoSrc, e);
    if (!hasTriedFallback) {
      setHasTriedFallback(true);
      setVideoSrc(FALLBACK_VIDEO);
    } else {
      setHasError(true);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: height,
        backgroundColor: '#0f172a',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {!hasError ? (
        <video
          src={videoSrc}
          controls
          playsInline
          preload="metadata"
          onError={handleVideoError}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: 16,
            color: '#f8fafc',
            textAlign: 'center',
          }}
        >
          <Film size={32} color="var(--primary)" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Video File</span>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '4px 12px' }}
          >
            <span>Play in New Tab</span>
            <ExternalLink size={13} />
          </a>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Film, ExternalLink, Play } from 'lucide-react';

export default function VideoPlayer({ src, poster = '/campaigns/lumaskin.jpg', style = {}, height = 180 }) {
  const [hasError, setHasError] = useState(false);

  if (!src) return null;

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
          src={src}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          onError={() => setHasError(true)}
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
            backgroundImage: `url(${poster})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.8)' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Film size={28} color="var(--primary)" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Media Preview</span>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '4px 12px' }}
            >
              <span>Play Stream</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

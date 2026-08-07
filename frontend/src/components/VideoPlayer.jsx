import { useState } from 'react';
import { Film, ExternalLink } from 'lucide-react';

export default function VideoPlayer({ src, style = {}, height = 180 }) {
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
          controls
          playsInline
          preload="metadata"
          onError={() => setHasError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src={src} type="video/mp4" />
          <source src={src} type="video/webm" />
          <source src={src} type="video/quicktime" />
          <source src={src} />
          Your browser does not support playing HTML5 video.
        </video>
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

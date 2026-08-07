/**
 * LoadingSkeleton — Reusable skeleton loading placeholders.
 */

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" style={{ width: '80%' }} />
      <div className="skeleton skeleton-text" style={{ width: '60%' }} />
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <div className="skeleton" style={{ width: 80, height: 24, borderRadius: 'var(--radius-full)' }} />
        <div className="skeleton" style={{ width: 60, height: 24, borderRadius: 'var(--radius-full)' }} />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="stat-card">
      <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)' }} />
      <div>
        <div className="skeleton" style={{ width: 60, height: 32, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 100, height: 14 }} />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
          <div className="skeleton skeleton-avatar" />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text" style={{ width: '40%' }} />
            <div className="skeleton skeleton-text" style={{ width: '70%' }} />
          </div>
          <div className="skeleton" style={{ width: 80, height: 30 }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

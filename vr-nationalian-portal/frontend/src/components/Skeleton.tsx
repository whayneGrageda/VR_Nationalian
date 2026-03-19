import './Skeleton.css';

interface SkeletonProps {
  type?: 'card' | 'table' | 'stats' | 'text' | 'button';
  count?: number;
  className?: string;
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text medium" />
      <div className="skeleton skeleton-text short" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          <div className="skeleton skeleton-table-cell" />
          <div className="skeleton skeleton-table-cell" />
          <div className="skeleton skeleton-table-cell" />
          <div className="skeleton skeleton-table-cell" style={{ width: '100px' }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 3 }: { count?: number }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-stat-card" />
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={`skeleton skeleton-text ${i === lines - 1 ? 'medium' : ''}`}
          style={{ marginBottom: i === lines - 1 ? 0 : '12px' }}
        />
      ))}
    </div>
  );
}

export function SkeletonButton() {
  return <div className="skeleton skeleton-button" />;
}

export default function Skeleton({ type = 'card', count = 1, className }: SkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return <SkeletonCard />;
      case 'table':
        return <SkeletonTable rows={count} />;
      case 'stats':
        return <SkeletonStats count={count} />;
      case 'text':
        return <SkeletonText lines={count} />;
      case 'button':
        return <SkeletonButton />;
      default:
        return <SkeletonCard />;
    }
  };

  return <div className={className}>{renderSkeleton()}</div>;
}

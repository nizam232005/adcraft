/**
 * ProjectCard — Reusable card for project listings.
 */

import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Users, Eye } from 'lucide-react';

export default function ProjectCard({ project, linkPrefix = '/creator/jobs' }) {
  const platformColors = {
    instagram: 'badge-instagram',
    facebook: 'badge-facebook',
    youtube: 'badge-youtube',
  };

  const statusClass = `badge badge-${project.status?.replace(' ', '_')}`;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--gray-900)',
            marginBottom: 4,
            lineHeight: 1.4,
          }}>
            {project.title}
          </h3>
          {project.owner_name && (
            <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>
              by {project.owner_name}
            </span>
          )}
        </div>
        <span className={platformColors[project.platform] || 'badge badge-open'} style={{
          padding: '4px 10px',
          fontSize: 11,
          fontWeight: 600,
          borderRadius: 'var(--radius-full)',
          textTransform: 'capitalize',
          flexShrink: 0,
        }}>
          {project.platform}
        </span>
      </div>

      {/* Description preview */}
      <p style={{
        fontSize: 13,
        color: 'var(--gray-600)',
        lineHeight: 1.6,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {project.description}
      </p>

      {/* Meta */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        fontSize: 13,
        color: 'var(--gray-500)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <DollarSign size={14} />
          <strong style={{ color: 'var(--gray-800)' }}>${project.budget?.toLocaleString()}</strong>
        </span>
        {project.deadline && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={14} />
            {new Date(project.deadline).toLocaleDateString()}
          </span>
        )}
        {project.application_count !== undefined && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users size={14} />
            {project.application_count} applied
          </span>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTop: '1px solid var(--gray-100)',
        marginTop: 'auto',
      }}>
        <span className={statusClass}>
          {project.status?.replace('_', ' ')}
        </span>
        <Link to={`${linkPrefix}/${project.id}`} className="btn btn-sm btn-secondary" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <Eye size={14} />
          View Details
        </Link>
      </div>
    </div>
  );
}

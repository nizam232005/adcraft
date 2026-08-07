import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { SkeletonList } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import api from '../api/axios';
import { FileText, Clock, Upload, MessageSquare, ExternalLink } from 'lucide-react';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const res = await api.get('/applications/my');
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container">
        {/* Header */}
        <div className="page-header" style={{ marginBottom: 24 }}>
          <div>
            <h1 className="page-title">My Applications</h1>
            <p className="page-subtitle">Track the status of your submitted project proposals.</p>
          </div>
        </div>

        {loading ? (
          <SkeletonList count={4} />
        ) : applications.length === 0 ? (
          <EmptyState
            title="No applications submitted yet"
            message="Explore open advertisement campaigns and submit your pitch to start earning."
            action={
              <Link to="/creator/jobs" className="btn btn-primary">
                Browse Open Jobs
              </Link>
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {applications.map((app) => (
              <div key={app.id} className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <span className={`badge badge-${app.project_platform}`} style={{ marginBottom: 8 }}>
                      {app.project_platform}
                    </span>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: 4, color: 'var(--gray-900)' }}>
                      {app.project_title}
                    </h3>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>
                      <span>Budget: <strong style={{ color: 'var(--gray-800)' }}>${app.project_budget?.toLocaleString()}</strong></span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={14} /> Delivery: {app.delivery_days} days
                      </span>
                      <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={`badge badge-${app.status}`}>
                      {app.status}
                    </span>

                    {/* Action buttons */}
                    {app.status === 'accepted' && (
                      <Link to={`/creator/submissions/${app.id}`} className="btn btn-sm btn-primary">
                        <Upload size={14} /> Submit Work
                      </Link>
                    )}

                    <Link to={`/projects/${app.project_id}/chat`} className="btn btn-sm btn-secondary">
                      <MessageSquare size={14} /> Chat
                    </Link>
                  </div>
                </div>

                {/* Proposal content */}
                <div style={{ marginTop: 16, padding: 16, background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
                  <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 4 }}>
                    Your Pitch:
                  </h4>
                  <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.5 }}>
                    {app.proposal}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

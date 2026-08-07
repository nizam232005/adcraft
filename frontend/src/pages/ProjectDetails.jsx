import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import ConfirmDialog from '../components/ConfirmDialog';
import { SkeletonList } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Share2,
  Trash2,
  Edit,
  MessageSquare,
  Check,
  X,
  User,
  Clock,
  Download,
} from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchApplications();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      toast.error('Failed to load project details');
      navigate('/brand/projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get(`/applications/project/${id}`);
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setAppsLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      toast.success(`Application ${newStatus}!`);
      fetchApplications();
      fetchProject(); // refresh project status if accepted
    } catch (err) {
      toast.error('Failed to update application status');
    }
  };

  const handleDeleteProject = async () => {
    setDeleting(true);
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted successfully');
      navigate('/brand/projects');
    } catch (err) {
      toast.error('Failed to delete project');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="page-container" style={{ maxWidth: 900 }}>
          <div className="skeleton skeleton-title" style={{ height: 40, width: '50%' }} />
          <div className="skeleton skeleton-text" style={{ height: 120, marginTop: 16 }} />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) return null;

  return (
    <DashboardLayout>
      <div className="page-container" style={{ maxWidth: 960 }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to={`/projects/${id}/chat`} className="btn btn-sm btn-secondary">
              <MessageSquare size={16} /> Chat
            </Link>
            <Link to={`/brand/projects/${id}/edit`} className="btn btn-sm btn-secondary">
              <Edit size={16} /> Edit
            </Link>
            <button className="btn btn-sm btn-danger" onClick={() => setDeleteModalOpen(true)}>
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>

        {/* Main Details Card */}
        <div className="card" style={{ padding: 32, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className={`badge badge-${project.platform}`} style={{ marginBottom: 12 }}>
                {project.platform}
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 4, color: 'var(--gray-900)' }}>
                {project.title}
              </h1>
              <p style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 4 }}>
                Product: <strong style={{ color: 'var(--gray-800)' }}>{project.product_name}</strong>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                ${project.budget?.toLocaleString()}
              </div>
              <span className={`badge badge-${project.status?.replace(' ', '_')}`} style={{ marginTop: 4 }}>
                {project.status?.replace('_', ' ')}
              </span>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', margin: '24px 0' }} />

          {/* Meta Info */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24, fontSize: 14, color: 'var(--gray-600)' }}>
            {project.target_audience && (
              <div>
                <strong style={{ color: 'var(--gray-800)' }}>Target Audience:</strong> {project.target_audience}
              </div>
            )}
            {project.deadline && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={16} color="var(--gray-400)" />
                <strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Project Description</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.7, whitespace: 'pre-line' }}>
              {project.description}
            </p>
          </div>

          {/* Reference Image */}
          {project.reference_image_url && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Reference Image / Moodboard</h3>
              <img
                src={project.reference_image_url}
                alt="Reference"
                style={{
                  maxHeight: 300,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-200)',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}
        </div>

        {/* Creator Applications Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Applications ({applications.length})
            </h2>
          </div>

          {appsLoading ? (
            <SkeletonList count={3} />
          ) : applications.length === 0 ? (
            <EmptyState
              title="No applications yet"
              message="Creators will apply to your project soon. Check back later!"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {applications.map((app) => (
                <div key={app.id} className="card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    {/* Creator info */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: 16,
                      }}>
                        {app.creator_name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div>
                        <Link
                          to={`/profile/${app.creator_id}`}
                          style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)' }}
                        >
                          {app.creator_name || 'Creator'}
                        </Link>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', gap: 12, marginTop: 2 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={12} /> {app.delivery_days} days delivery
                          </span>
                          <span>Applied {new Date(app.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* App Status & Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className={`badge badge-${app.status}`}>
                        {app.status}
                      </span>
                      {app.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleUpdateStatus(app.id, 'accepted')}
                          >
                            <Check size={14} /> Accept
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleUpdateStatus(app.id, 'rejected')}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Proposal */}
                  <div style={{ marginTop: 16, padding: 16, background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
                    <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 4 }}>
                      Proposal Pitch:
                    </h4>
                    <p style={{ fontSize: 14, color: 'var(--gray-800)', lineHeight: 1.6 }}>
                      {app.proposal}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmDialog
          isOpen={deleteModalOpen}
          title="Delete Project"
          message="Are you sure you want to delete this project? All applications and messages will be permanently removed."
          confirmLabel={deleting ? 'Deleting...' : 'Delete Project'}
          danger
          onConfirm={handleDeleteProject}
          onCancel={() => setDeleteModalOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
}

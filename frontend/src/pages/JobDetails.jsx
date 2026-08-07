import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Send,
  Clock,
  CheckCircle,
  Building,
} from 'lucide-react';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [proposal, setProposal] = useState('');
  const [deliveryDays, setDeliveryDays] = useState(3);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    checkIfApplied();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      toast.error('Failed to load job details');
      navigate('/creator/jobs');
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    try {
      const res = await api.get('/applications/my');
      const found = res.data.some((a) => a.project_id === parseInt(id));
      setHasApplied(found);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!proposal) {
      toast.error('Please write a proposal pitch');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/applications/', {
        project_id: parseInt(id),
        proposal,
        delivery_days: parseInt(deliveryDays),
      });

      toast.success('Application submitted successfully!');
      setHasApplied(true);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to submit application';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="page-container" style={{ maxWidth: 840 }}>
          <div className="skeleton skeleton-title" style={{ height: 40, width: '60%' }} />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) return null;

  return (
    <DashboardLayout>
      <div className="page-container" style={{ maxWidth: 840 }}>
        {/* Top button */}
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
          <ArrowLeft size={16} /> Back to Jobs
        </button>

        {/* Project Overview Card */}
        <div className="card" style={{ padding: 32, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className={`badge badge-${project.platform}`} style={{ marginBottom: 12 }}>
                {project.platform}
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 4, color: 'var(--gray-900)' }}>
                {project.title}
              </h1>
              <p style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building size={16} /> Posted by <strong>{project.owner_name || 'Brand Owner'}</strong>
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

          {/* Details */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Product / Campaign</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-700)', fontWeight: 600 }}>{project.product_name}</p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Requirements & Description</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.7, whitespace: 'pre-line' }}>
              {project.description}
            </p>
          </div>

          {project.reference_image_url && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Reference Image / Brief</h3>
              <img
                src={project.reference_image_url}
                alt="Reference"
                style={{ maxHeight: 280, borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>

        {/* Application Form or Status */}
        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 16 }}>
            {hasApplied ? 'Your Application' : 'Apply for this Job'}
          </h2>

          {hasApplied ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 20,
              background: 'var(--success-light)',
              borderRadius: 'var(--radius-md)',
              color: '#065F46',
            }}>
              <CheckCircle size={24} />
              <div>
                <strong style={{ fontSize: 15 }}>You have applied to this project!</strong>
                <p style={{ fontSize: 13, marginTop: 2 }}>You can track your application status in "My Applications".</p>
              </div>
            </div>
          ) : project.status !== 'open' ? (
            <div style={{ padding: 20, background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', color: 'var(--gray-600)' }}>
              This project is no longer accepting applications.
            </div>
          ) : (
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label className="form-label">Expected Delivery Time (Days) *</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="60"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                  style={{ maxWidth: 200 }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Proposal Pitch *</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Explain why you're a great fit for this ad, your creative vision, past performance..."
                  rows={5}
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={submitting}
                style={{ gap: 8 }}
              >
                <Send size={18} />
                {submitting ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    product_name: '',
    description: '',
    target_audience: '',
    platform: 'instagram',
    budget: '',
    deadline: '',
    status: 'open',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      const p = res.data;
      setFormData({
        title: p.title || '',
        product_name: p.product_name || '',
        description: p.description || '',
        target_audience: p.target_audience || '',
        platform: p.platform || 'instagram',
        budget: p.budget || '',
        deadline: p.deadline ? p.deadline.split('T')[0] : '',
        status: p.status || 'open',
      });
    } catch (err) {
      toast.error('Failed to load project details');
      navigate('/brand/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/projects/${id}`, {
        ...formData,
        budget: parseFloat(formData.budget),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      });
      toast.success('Project updated successfully!');
      navigate(`/brand/projects/${id}`);
    } catch (err) {
      toast.error('Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="page-container" style={{ maxWidth: 800 }}>
          <div className="skeleton skeleton-title" style={{ height: 40, width: 300 }} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-container" style={{ maxWidth: 800 }}>
        <div style={{ marginBottom: 28 }}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="page-title">Edit Project</h1>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: 32 }}>
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                name="product_name"
                className="form-input"
                value={formData.product_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <input
                type="text"
                name="target_audience"
                className="form-input"
                value={formData.target_audience}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Platform *</label>
              <select
                name="platform"
                className="form-input form-select"
                value={formData.platform}
                onChange={handleChange}
              >
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Budget ($ USD) *</label>
              <input
                type="number"
                name="budget"
                className="form-input"
                value={formData.budget}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status *</label>
              <select
                name="status"
                className="form-input form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              className="form-input form-textarea"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

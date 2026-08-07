import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import FileUpload from '../components/FileUpload';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Sparkles, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export default function CreateProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    product_name: '',
    description: '',
    target_audience: '',
    platform: 'instagram',
    budget: '',
    deadline: '',
  });

  const [referenceFile, setReferenceFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateAIDescription = async () => {
    if (!formData.product_name) {
      toast.error('Please enter Product Name first for AI generation');
      return;
    }

    setAiGenerating(true);
    try {
      const res = await api.post('/ai/generate-description', {
        product_name: formData.product_name,
        target_audience: formData.target_audience || 'General Consumers',
        platform: formData.platform,
      });

      const { description, marketing_tone, call_to_action } = res.data;
      const fullText = `${description}\n\nMarketing Tone: ${marketing_tone}\nSuggested CTA: ${call_to_action}`;

      setFormData((prev) => ({ ...prev, description: fullText }));
      toast.success('Description generated with Gemini AI!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate AI description. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.product_name || !formData.description || !formData.budget) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      let reference_image_url = null;
      if (referenceFile) {
        // Upload image to Cloudinary via portfolio endpoint or file upload helper if desired
        // Or send as base64/form data
        const uploadForm = new FormData();
        uploadForm.append('title', 'Reference Image');
        uploadForm.append('file', referenceFile);
        try {
          const res = await api.post('/portfolio/', uploadForm, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          reference_image_url = res.data.media_url;
        } catch (e) {
          console.warn('Upload fallback', e);
        }
      }

      await api.post('/projects/', {
        ...formData,
        budget: parseFloat(formData.budget),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        reference_image_url,
      });

      toast.success('Project created successfully!');
      navigate('/brand/projects');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create project';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: 12 }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="page-title">Create New Advertisement Project</h1>
          <p className="page-subtitle">
            Post an advertisement brief and hire talented freelance creators.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: 32 }}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. 30-Second Instagram Reel for Eco Fitness Bottle"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Product Name */}
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                name="product_name"
                className="form-input"
                placeholder="e.g. HydroPure Bottle"
                value={formData.product_name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Target Audience */}
            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <input
                type="text"
                name="target_audience"
                className="form-input"
                placeholder="e.g. Fitness enthusiasts aged 18-35"
                value={formData.target_audience}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Platform & Budget */}
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
                placeholder="500"
                value={formData.budget}
                onChange={handleChange}
                min="10"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input
                type="date"
                name="deadline"
                className="form-input"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Description & AI Button */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="form-label" style={{ margin: 0 }}>Description *</label>
              <button
                type="button"
                onClick={handleGenerateAIDescription}
                disabled={aiGenerating}
                className="btn btn-sm"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
                  color: 'white',
                  gap: 6,
                }}
              >
                <Sparkles size={16} />
                {aiGenerating ? 'Generating with Gemini...' : 'Generate Description using AI'}
              </button>
            </div>
            <textarea
              name="description"
              className="form-input form-textarea"
              placeholder="Describe what you need in detail, video script idea, tone of voice, deliverables..."
              value={formData.description}
              onChange={handleChange}
              rows={6}
              required
            />
          </div>

          {/* Upload Reference Image */}
          <div className="form-group" style={{ marginBottom: 32 }}>
            <label className="form-label">Upload Reference Image / Moodboard</label>
            <FileUpload
              onFileSelect={setReferenceFile}
              accept="image/*"
              label="PNG, JPG, WebP up to 10MB"
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Project...' : 'Publish Project'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import FileUpload from '../components/FileUpload';
import VideoPlayer from '../components/VideoPlayer';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, Download, CheckCircle, Video, Image as ImageIcon } from 'lucide-react';

export default function SubmitWork() {
  const { appId } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, [appId]);

  const fetchSubmissions = async () => {
    try {
      const res = await api.get(`/submissions/application/${appId}`);
      setSubmissions(res.data);
    } catch (err) {
      console.error('Failed to fetch submissions', err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select an image or video file to submit');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('application_id', appId);
      formData.append('file', file);

      await api.post('/submissions/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Campaign deliverable submitted successfully!');
      setFile(null);
      fetchSubmissions();
    } catch (err) {
      toast.error('Failed to upload submission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container" style={{ maxWidth: 760 }}>
        {/* Header */}
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
          <ArrowLeft size={16} /> Back to Applications
        </button>

        <div className="page-header" style={{ marginBottom: 24 }}>
          <div>
            <h1 className="page-title">Submit Campaign Work</h1>
            <p className="page-subtitle">Upload final high-resolution images or MP4/MOV videos for the brand owner.</p>
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="card" style={{ padding: 32, marginBottom: 32 }}>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Select Campaign Deliverable (Image or Video) *</label>
            <FileUpload
              onFileSelect={setFile}
              accept="image/*,video/*"
              label="MP4, MOV, PNG, JPG up to 50MB (Cloudinary Storage)"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading || !file}
            style={{ width: '100%' }}
          >
            <Upload size={18} />
            {loading ? 'Uploading to Cloudinary...' : 'Submit Deliverable'}
          </button>
        </form>

        {/* Previous Submissions */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 16 }}>
            Submitted Deliverables ({submissions.length})
          </h2>

          {fetching ? (
            <div className="skeleton skeleton-card" />
          ) : submissions.length === 0 ? (
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>No deliverables uploaded yet for this application.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {submissions.map((sub) => (
                <div key={sub.id} className="card" style={{ padding: 16 }}>
                  {sub.media_type === 'image' || sub.media_url?.includes('unsplash.com') || sub.media_url?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                    <img
                      src={sub.media_url}
                      alt="Submission"
                      style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 'var(--radius)' }}
                    />
                  ) : (
                    <VideoPlayer src={sub.media_url} height={160} />
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                      {new Date(sub.created_at).toLocaleDateString()}
                    </span>
                    <a
                      href={sub.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-ghost"
                      download
                    >
                      <Download size={14} /> Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

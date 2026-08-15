import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, CheckCircle2 } from 'lucide-react';
import FileUpload from '../components/FileUpload';

const NICHES = [
  'Fashion & Beauty', 'Tech & Gadgets', 'Food & Beverage',
  'Fitness & Health', 'Gaming', 'Travel', 'Lifestyle',
  'Finance', 'Education', 'Home & Decor', 'Entertainment'
];

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState(user?.skills || '');
  const [niche, setNiche] = useState(user?.niche || 'Fashion & Beauty');
  const [location, setLocation] = useState(user?.location || '');
  const [languages, setLanguages] = useState(user?.languages || '');
  const [isAvailable, setIsAvailable] = useState(user?.is_available_for_work ?? true);
  const [instagram, setInstagram] = useState(user?.social_instagram || '');
  const [tiktok, setTiktok] = useState(user?.social_tiktok || '');
  const [youtube, setYoutube] = useState(user?.social_youtube || '');
  const [pricing, setPricing] = useState(user?.pricing_info || '');
  const [experience, setExperience] = useState(user?.experience_years || 1);

  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUploadImage = async (file, type) => {
    const formData = new FormData();
    formData.append('image_type', type);
    formData.append('file', file);
    const res = await api.post('/users/profile/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let updatedUserData = { ...user };

      if (profileFile) {
        setUploading(true);
        updatedUserData = await handleUploadImage(profileFile, 'profile');
      }
      if (coverFile) {
        setUploading(true);
        updatedUserData = await handleUploadImage(coverFile, 'cover');
      }

      const res = await api.put('/users/profile', {
        name,
        bio,
        skills,
        niche,
        location,
        languages,
        is_available_for_work: isAvailable,
        social_instagram: instagram,
        social_tiktok: tiktok,
        social_youtube: youtube,
        pricing_info: pricing,
        experience_years: parseInt(experience) || 1,
      });

      updateUser(res.data);
      toast.success('Profile updated successfully!');
      navigate(user?.role === 'creator' ? '/creator/profile' : '/brand/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container" style={{ maxWidth: 760 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="card" style={{ padding: 32 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>Edit Profile & Discovery Info</h1>

          <form onSubmit={handleSubmit}>
            {/* Availability Toggle */}
            <div style={{ padding: 16, background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>Availability Status</div>
                <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>Show "Available for Work" badge on creator discovery feed</div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={e => setIsAvailable(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                />
                {isAvailable ? 'Available' : 'Busy'}
              </label>
            </div>

            {/* Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Niche / Category</label>
                <select className="form-input" value={niche} onChange={e => setNiche(e.target.value)}>
                  {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Creator Bio</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Share your story, creative style, equipment used, past brands..."
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {/* Image Uploads */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label className="form-label">Profile Photo</label>
                <FileUpload onFileSelect={setProfileFile} accept="image/*" />
              </div>
              <div>
                <label className="form-label">Cover Banner Image</label>
                <FileUpload onFileSelect={setCoverFile} accept="image/*" />
              </div>
            </div>

            {/* Location, Languages, Experience */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Location (City, Country)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. New York, USA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Languages (Comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. English, Spanish"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  className="form-input"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
              </div>
            </div>

            {/* Skills & Pricing */}
            <div className="form-group">
              <label className="form-label">Skills & Deliverables (Comma-separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Video Editing, UGC Reels, Unboxing, Voiceover, Copywriting"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pricing / Rates Overview</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. $150 per UGC Reel, $400 for 3-video pack"
                value={pricing}
                onChange={(e) => setPricing(e.target.value)}
              />
            </div>

            {/* Social Channels */}
            <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 20, marginTop: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Social Channels (Optional)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Instagram profile link"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="TikTok profile link"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="YouTube channel link"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 32 }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
                {loading || uploading ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

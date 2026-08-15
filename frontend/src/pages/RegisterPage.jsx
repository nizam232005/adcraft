import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, User, Mail, Lock, Building, Video, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('creator');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const user = await register(name, email, password, role);
      toast.success(`Account created successfully! Welcome, ${user.name}`);
      navigate(role === 'brand_owner' ? '/brand/dashboard' : '/creator/dashboard');
    } catch (err) {
      let msg = 'Registration failed. Please try again.';
      const detail = err.response?.data?.detail;

      if (typeof detail === 'string') {
        msg = detail;
      } else if (Array.isArray(detail)) {
        msg = detail.map(e => e.msg).join(', ');
      }

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #EFF6FF 0%, #F9FAFB 100%)',
      padding: '32px 24px',
    }}>
      <div className="card animate-scale-in" style={{
        maxWidth: 480,
        width: '100%',
        padding: '40px 32px',
        boxShadow: 'var(--shadow-xl)',
        borderRadius: 'var(--radius-xl)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            marginBottom: 16,
          }}>
            <Zap size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create Your Account</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 4 }}>
            Join AdCraft Lite as a Brand Owner or Creator
          </p>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => setRole('brand_owner')}
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${role === 'brand_owner' ? 'var(--primary)' : 'var(--gray-200)'}`,
              background: role === 'brand_owner' ? 'var(--primary-50)' : 'var(--white)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              transition: 'all var(--transition)',
            }}
          >
            <Building size={24} color={role === 'brand_owner' ? 'var(--primary)' : 'var(--gray-400)'} />
            <span style={{
              fontSize: 13,
              fontWeight: 700,
              color: role === 'brand_owner' ? 'var(--primary-dark)' : 'var(--gray-700)',
            }}>
              Brand Owner
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRole('creator')}
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${role === 'creator' ? 'var(--primary)' : 'var(--gray-200)'}`,
              background: role === 'creator' ? 'var(--primary-50)' : 'var(--white)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              transition: 'all var(--transition)',
            }}
          >
            <Video size={24} color={role === 'creator' ? 'var(--primary)' : 'var(--gray-400)'} />
            <span style={{
              fontSize: 13,
              fontWeight: 700,
              color: role === 'creator' ? 'var(--primary-dark)' : 'var(--gray-700)',
            }}>
              Creator
            </span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gray-400)',
              }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 40 }}
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gray-400)',
              }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: 40 }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gray-400)',
              }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: 40 }}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px 20px' }}
          >
            {loading ? 'Creating Account...' : (
              <>
                Register as {role === 'brand_owner' ? 'Brand' : 'Creator'} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--gray-500)', marginTop: 24 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary)' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

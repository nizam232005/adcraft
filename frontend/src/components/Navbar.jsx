/**
 * Navbar — Top navigation bar with logo, nav links, and user menu.
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, ChevronDown, Zap, MessageCircle, Sparkles, Bookmark } from 'lucide-react';
import api from '../api/axios';

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Poll unread DMs count if logged in
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUnread = async () => {
      try {
        const res = await api.get('/dm/unread-count');
        setUnreadCount(res.data.unread_count);
      } catch { /* ignore */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardLink = user?.role === 'brand_owner' ? '/brand/dashboard' : '/creator/dashboard';

  return (
    <nav className="app-navbar" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 'var(--navbar-height)',
      background: 'var(--white)',
      borderBottom: '1px solid var(--gray-200)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 100,
    }}>
      {/* Left: Logo & Sidebar toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {isAuthenticated && (
          <button
            className="btn-icon btn-ghost"
            onClick={onToggleSidebar}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          textDecoration: 'none',
        }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 'var(--radius)',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}>
            <Zap size={18} />
          </div>
          <span style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            color: 'var(--gray-900)',
            letterSpacing: '-0.02em',
          }}>
            AdCraft
          </span>
        </Link>
      </div>

      {/* Center Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="navbar-center-links">
        <Link
          to="/"
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius)',
            fontSize: 14,
            fontWeight: location.pathname === '/' ? 700 : 500,
            color: location.pathname === '/' ? 'var(--primary)' : 'var(--gray-700)',
            background: location.pathname === '/' ? 'var(--primary-50)' : 'transparent',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <Sparkles size={15} /> Discover Creators
        </Link>

        {user?.role === 'creator' ? (
          <Link
            to="/creator/jobs"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius)',
              fontSize: 14,
              fontWeight: location.pathname.includes('/creator/jobs') ? 700 : 500,
              color: location.pathname.includes('/creator/jobs') ? 'var(--primary)' : 'var(--gray-700)',
              background: location.pathname.includes('/creator/jobs') ? 'var(--primary-50)' : 'transparent',
            }}
          >
            Browse Jobs
          </Link>
        ) : user?.role === 'brand_owner' ? (
          <>
            <Link
              to="/brand/creators"
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius)',
                fontSize: 14,
                fontWeight: location.pathname.includes('/brand/creators') ? 700 : 500,
                color: location.pathname.includes('/brand/creators') ? 'var(--primary)' : 'var(--gray-700)',
                background: location.pathname.includes('/brand/creators') ? 'var(--primary-50)' : 'transparent',
              }}
            >
              Creator Directory
            </Link>
            <Link
              to="/brand/projects/create"
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius)',
                fontSize: 14,
                fontWeight: location.pathname.includes('/projects/create') ? 700 : 500,
                color: location.pathname.includes('/projects/create') ? 'var(--primary)' : 'var(--gray-700)',
              }}
            >
              Post a Job
            </Link>
          </>
        ) : null}

        {isAuthenticated && (
          <Link
            to="/messages"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius)',
              fontSize: 14,
              fontWeight: location.pathname.includes('/messages') ? 700 : 500,
              color: location.pathname.includes('/messages') ? 'var(--primary)' : 'var(--gray-700)',
              background: location.pathname.includes('/messages') ? 'var(--primary-50)' : 'transparent',
              display: 'flex', alignItems: 'center', gap: 6, position: 'relative',
            }}
          >
            <MessageCircle size={15} />
            Messages
            {unreadCount > 0 && (
              <span className="dm-unread-badge" style={{ marginLeft: 2 }}>{unreadCount}</span>
            )}
          </Link>
        )}
      </div>

      {/* Right: User menu / Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isAuthenticated ? (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 12px',
                background: 'var(--gray-50)',
                border: '1px solid var(--gray-200)',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                transition: 'all var(--transition)',
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 14,
                fontWeight: 700,
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="navbar-username" style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--gray-700)',
                maxWidth: 120,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user?.name}
              </span>
              <ChevronDown size={16} color="var(--gray-400)" style={{
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform var(--transition)',
              }} />
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: 200,
                background: 'var(--white)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--gray-200)',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
                zIndex: 200,
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>{user?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', textTransform: 'capitalize' }}>
                    {user?.role?.replace('_', ' ')}
                  </div>
                </div>

                <Link
                  to={dashboardLink}
                  onClick={() => setDropdownOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: 'var(--gray-700)', fontSize: 14 }}
                >
                  <User size={16} /> Dashboard
                </Link>

                {user?.role === 'brand_owner' && (
                  <Link
                    to="/brand/saved-creators"
                    onClick={() => setDropdownOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: 'var(--gray-700)', fontSize: 14 }}
                  >
                    <Bookmark size={16} /> Saved Creators
                  </Link>
                )}

                <Link
                  to="/creator/profile/edit"
                  onClick={() => setDropdownOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: 'var(--gray-700)', fontSize: 14 }}
                >
                  <User size={16} /> Edit Profile
                </Link>

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', width: '100%',
                    background: 'none', border: 'none', color: 'var(--danger)', fontSize: 14, cursor: 'pointer',
                  }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}


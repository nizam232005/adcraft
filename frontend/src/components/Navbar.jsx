/**
 * Navbar — Top navigation bar with logo, nav links, and user menu.
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, ChevronDown, Zap } from 'lucide-react';

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardLink = user?.role === 'brand_owner' ? '/brand/dashboard' : '/creator/dashboard';

  return (
    <nav style={{
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
      padding: '0 24px',
      zIndex: 100,
    }}>
      {/* Left: Logo & hamburger */}
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
        <Link to={isAuthenticated ? dashboardLink : '/'} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          textDecoration: 'none',
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius)',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}>
            <Zap size={20} />
          </div>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--gray-900)',
            letterSpacing: '-0.02em',
          }}>
            AdCraft<span style={{ color: 'var(--primary)' }}>Lite</span>
          </span>
        </Link>
      </div>

      {/* Right: User menu */}
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
              <span style={{
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
                animation: 'slideDown var(--transition-fast) ease',
                zIndex: 200,
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--gray-100)',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)' }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', textTransform: 'capitalize' }}>
                    {user?.role?.replace('_', ' ')}
                  </div>
                </div>
                <Link
                  to={user?.role === 'creator' ? '/creator/profile' : dashboardLink}
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 16px',
                    color: 'var(--gray-700)',
                    fontSize: 14,
                    transition: 'background var(--transition)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <User size={16} />
                  {user?.role === 'creator' ? 'My Profile' : 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 16px',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: 'var(--danger)',
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'background var(--transition)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={16} />
                  Logout
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

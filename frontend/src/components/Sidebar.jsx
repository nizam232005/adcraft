/**
 * Sidebar — Dashboard navigation, role-aware.
 * Collapsible on mobile, fixed on desktop.
 */

import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FolderOpen,
  Search,
  FileText,
  Upload,
  UserCircle,
  Briefcase,
  Users,
  X,
  Sparkles,
  MessageCircle,
  Bookmark,
} from 'lucide-react';

const brandLinks = [
  { to: '/', icon: Sparkles, label: 'Discover Creators' },
  { to: '/brand/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/brand/creators', icon: Users, label: 'Creator Directory' },
  { to: '/brand/saved-creators', icon: Bookmark, label: 'Saved Creators' },
  { to: '/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/brand/projects/create', icon: PlusCircle, label: 'Post a Job' },
  { to: '/brand/projects', icon: FolderOpen, label: 'My Projects' },
];

const creatorLinks = [
  { to: '/', icon: Sparkles, label: 'Discover Creators' },
  { to: '/creator/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/creator/jobs', icon: Search, label: 'Browse Jobs' },
  { to: '/creator/applications', icon: FileText, label: 'My Applications' },
  { to: '/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/creator/profile', icon: UserCircle, label: 'My Profile' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();
  const links = user?.role === 'brand_owner' ? brandLinks : creatorLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 55,
            display: 'none',
          }}
          className="sidebar-overlay"
        />
      )}

      <aside
        className="dashboard-sidebar"
        style={{
          position: 'fixed',
          top: 'var(--navbar-height)',
          left: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          background: 'var(--white)',
          borderRight: '1px solid var(--gray-200)',
          padding: '24px 0',
          zIndex: 50,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform var(--transition-slow)',
          overflowY: 'auto',
        }}
      >
        {/* Mobile close button */}
        <button
          className="btn-icon btn-ghost sidebar-close-btn"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            display: 'none',
          }}
        >
          <X size={18} />
        </button>

        {/* Role label */}
        <div style={{
          padding: '0 20px',
          marginBottom: 24,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            background: 'var(--primary-50)',
            borderRadius: 'var(--radius-md)',
          }}>
            <Briefcase size={18} color="var(--primary)" />
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--primary-dark)',
              textTransform: 'capitalize',
            }}>
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 16px',
                  borderRadius: 'var(--radius)',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--gray-600)',
                  background: isActive ? 'var(--primary-50)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all var(--transition)',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--gray-50)';
                    e.currentTarget.style.color = 'var(--gray-800)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--gray-600)';
                  }
                }}
              >
                <Icon size={18} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-overlay { display: block !important; }
          .sidebar-close-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          aside {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
}

/**
 * DashboardLayout — Wraps content with Navbar + Sidebar.
 * Handles responsive sidebar state.
 */

import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Prevent body scroll while sidebar drawer is open on mobile
  useEffect(() => {
    document.body.classList.toggle('sidebar-open', sidebarOpen);
    return () => document.body.classList.remove('sidebar-open');
  }, [sidebarOpen]);

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--gray-50)' }}>
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main style={{
        marginTop: 'var(--navbar-height)',
        marginLeft: 'var(--sidebar-width)',
        minHeight: 'calc(100dvh - var(--navbar-height))',
        transition: 'margin-left var(--transition-slow)',
      }}>
        <style>{`
          @media (max-width: 768px) {
            main {
              margin-left: 0 !important;
            }
          }
        `}</style>
        {children}
      </main>
    </div>
  );
}

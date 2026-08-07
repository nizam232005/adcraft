/**
 * DashboardLayout — Wraps content with Navbar + Sidebar.
 * Handles responsive sidebar state.
 */

import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
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
        minHeight: 'calc(100vh - var(--navbar-height))',
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

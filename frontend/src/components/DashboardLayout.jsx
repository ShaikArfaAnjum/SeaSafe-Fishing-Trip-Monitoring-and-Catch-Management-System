// ============================================================
// src/components/DashboardLayout.jsx
// Shell layout wrapping the Sidebar, Navbar, and page content (<Outlet />).
// ============================================================

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toggle mobile drawer navigation
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile drawer when user navigates
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-layout">
      {/* Mobile backdrop */}
      <div
        className={`sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={closeMobileMenu}
      />

      {/* Left Navigation Sidebar */}
      <Sidebar isOpen={mobileMenuOpen} onClose={closeMobileMenu} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar onMenuClick={toggleMobileMenu} />
        <main className="content-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


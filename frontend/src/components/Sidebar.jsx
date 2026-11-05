// ============================================================
// src/components/Sidebar.jsx
// Left navigation sidebar with SeaSafe logo, role-specific links and logout.
// ============================================================

import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Navigation links config for each role
const NAV_CONFIG = {
  fisherman: [
    { name: 'Home',           path: '/fisherman',              icon: '🏠' },
    { name: 'My Boats',       path: '/fisherman/boats',        icon: '🚢' },
    { name: 'Start New Trip', path: '/fisherman/start-trip',   icon: '▶️' },
    { name: 'Active Trips',   path: '/fisherman/active-trips', icon: '⛵' },
    { name: 'Add Catch',      path: '/fisherman/add-catch',    icon: '🐟' },
    { name: 'Trip History',   path: '/fisherman/history',      icon: '📋' },
    { name: 'Price Board',    path: '/fisherman/prices',       icon: '🏷️' }
  ],
  officer: [
    { name: 'Home',               path: '/officer',            icon: '🏠' },
    { name: 'Boats at Sea',       path: '/officer/at-sea',     icon: '🚢' },
    { name: 'Overdue Boats',      path: '/officer/overdue',    icon: '⚠️' },
    { name: 'Emergency Contacts', path: '/officer/contacts',   icon: '📞' },
    { name: 'Trip Monitoring',    path: '/officer/monitoring', icon: '📊' },
    { name: 'Alert History',      path: '/officer/alerts',     icon: '📜' }
  ],
  admin: [
    { name: 'Home',                   path: '/admin',         icon: '🏠' },
    { name: 'Manage Users',           path: '/admin/users',   icon: '👥' },
    { name: 'Manage Boats & Harbours',path: '/admin/boats',   icon: '⚓' },
    { name: 'Manage Fish Prices',     path: '/admin/prices',  icon: '💰' },
    { name: 'View All Trips',         path: '/admin/trips',   icon: '🚢' },
    { name: 'Reports',                path: '/admin/reports', icon: '📈' }
  ]
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Get menu items based on the logged-in user's role
  const menuItems = (user && NAV_CONFIG[user.role]) || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand logo & name */}
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">🚢</span>
        <span className="sidebar-brand-text">SeaSafe</span>
      </div>

      {/* Navigation menu list */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === `/${user?.role}`}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout button at bottom */}
      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}


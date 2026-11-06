// Top bar showing user avatar, name, role badge, and mobile toggle.

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { user } = useContext(AuthContext);

  // Get initial letter of user's name for avatar
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
          ☰
        </button>
        <span className="navbar-title">Harbour Operations Portal</span>
      </div>

      <div className="navbar-user">
        <div className="user-avatar">{initial}</div>
        <div className="user-details">
          <span className="user-name">{user?.name || 'User'}</span>
          <span className="user-role-badge">
            {user?.role === 'fisherman' ? '⚓ Fisherman' : user?.role === 'officer' ? '🛡️ Harbour Officer' : '👑 Administrator'}
          </span>
        </div>
      </div>
    </header>
  );
}


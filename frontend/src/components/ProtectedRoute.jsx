// ============================================================
// src/components/ProtectedRoute.jsx
// Protects routes from unauthenticated access or unauthorized roles.
// ============================================================

import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, token, loading } = useContext(AuthContext);

  // Still checking authentication from localStorage
  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p>Loading session...</p>
      </div>
    );
  }

  // Not logged in -> send to /login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If role is not allowed -> send to that user's own home page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
}


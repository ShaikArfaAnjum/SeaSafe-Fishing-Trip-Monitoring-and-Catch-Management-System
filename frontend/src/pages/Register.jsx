// User registration page matching the SeaSafe layout with auth-bg.jpg template.

import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('fisherman');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      login(response.data);

      if (role === 'fisherman') navigate('/fisherman');
      else if (role === 'officer') navigate('/officer');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Background card with left boat graphic and right wave corners */}
      <div className="auth-card-frame">
        {/* Left space reserved for the image graphic */}
        <div className="auth-card-left" />

        {/* Right side form positioned over the white area */}
        <div className="auth-card-right">
          <div className="auth-form-box">
            <h1 className="auth-heading">Create Account</h1>
            <p className="auth-subheading">Register to get started</p>
            <div className="auth-accent-bar" />

            {error && <div className="alert-box alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  className="input-field-custom"
                  placeholder="Full Name (e.g. Ramesh Kumar)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email Address */}
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  className="input-field-custom"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="input-field-custom"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Role Selector */}
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </span>
                <select
                  className="input-field-custom"
                  style={{ cursor: 'pointer' }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="fisherman">⚓ Fisherman (Boat Owner)</option>
                  <option value="officer">🛡️ Harbour Officer</option>
                </select>
              </div>

              {/* Register -> Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-login-gradient"
                style={{ marginTop: '0.5rem' }}
              >
                <span>{loading ? 'Creating account...' : 'Register'}</span>
                {!loading && <span>→</span>}
              </button>
            </form>

            {/* or divider */}
            <div className="auth-divider">
              <span>or</span>
            </div>

            {/* Login link */}
            <p style={{ textAlign: 'center', fontSize: '0.95rem', color: '#475569' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#0284c7', fontWeight: 700 }}>
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// User login page perfectly matching Image 1 using auth-bg.jpg template.

import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data);

      const role = response.data.user.role;
      if (role === 'fisherman') navigate('/fisherman');
      else if (role === 'officer') navigate('/officer');
      else if (role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
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
            <h1 className="auth-heading">Welcome Back!</h1>
            <p className="auth-subheading">Login to continue</p>
            <div className="auth-accent-bar" />

            {error && <div className="alert-box alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Email Address with envelope icon */}
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

              {/* Password with lock icon and eye toggle */}
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field-custom"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="input-icon-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Login -> Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-login-gradient"
              >
                <span>{loading ? 'Logging in...' : 'Login'}</span>
                {!loading && <span>→</span>}
              </button>
            </form>

            {/* or divider */}
            <div className="auth-divider">
              <span>or</span>
            </div>

            {/* Register link */}
            <p style={{ textAlign: 'center', fontSize: '0.95rem', color: '#475569' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#0284c7', fontWeight: 700 }}>
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

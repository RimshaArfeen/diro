import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './auth.css';

const VALID_ROLES = ['creator', 'brand'];

const Login = () => {
  const [searchParams] = useSearchParams();
  const initialRole = VALID_ROLES.includes(searchParams.get('role'))
    ? searchParams.get('role')
    : 'creator';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isLoggedIn, role: userRole } = useAuth();
  const navigate = useNavigate();

  // Redirect already-logged-in users to their dashboard
  useEffect(() => {
    if (isLoggedIn) {
      if (userRole === 'creator') {
        navigate('/creator/dashboard', { replace: true });
      } else if (userRole === 'brand') {
        navigate('/brand/dashboard', { replace: true });
      }
    }
  }, [isLoggedIn, userRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password);

      // Redirect based on role
      if (userData.role === 'creator') {
        navigate('/creator/dashboard', { replace: true });
      } else if (userData.role === 'brand') {
        navigate('/brand/dashboard', { replace: true });
      } else if (userData.role === 'admin') {
        navigate('/admin', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your CLYPZY account</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Role Selector */}
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${role === 'creator' ? 'active' : ''}`}
                onClick={() => setRole('creator')}
              >
                Creator
              </button>
              <button
                type="button"
                className={`role-option ${role === 'brand' ? 'active' : ''}`}
                onClick={() => setRole('brand')}
              >
                Brand
              </button>
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Login Button */}
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {/* Register Link */}
          <div className="auth-footer">
            <p className="auth-footer-text">
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

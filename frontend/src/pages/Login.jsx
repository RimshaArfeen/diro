import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

function navigateByRole(navigate, userData) {
  if (userData.role === 'brand') {
    navigate('/brand-dashboard')
  } else if (userData.role === 'admin') {
    navigate('/admin/dashboard')
  } else {
    navigate('/dashboard')
  }
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('creator')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user, login, googleLogin } = useAuth()
  const navigate = useNavigate()

  if (user) return <Navigate to={user.role === 'brand' ? '/brand-dashboard' : '/dashboard'} replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setError('')
    setSubmitting(true)
    try {
      const userData = await login(email, password, role)
      navigateByRole(navigate, userData)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setSubmitting(true)
    try {
      const userData = await googleLogin(credentialResponse.credential, role)
      navigateByRole(navigate, userData)
    } catch (err) {
      setError(err.message || 'Google login failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google sign-in was unsuccessful. Please try again.')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">CLYPZY</div>
        <h1 className="auth-title">Log in to Clypzy</h1>
        <p className="auth-subtitle">
          Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
        </p>
        <div className="auth-role-toggle">
          <button className={`role-btn ${role === 'creator' ? 'active' : ''}`} onClick={() => setRole('creator')}>Creator</button>
          <button className={`role-btn ${role === 'brand' ? 'active' : ''}`} onClick={() => setRole('brand')}>Brand</button>
        </div>
        {error && <p style={{ color: '#e53e3e', fontSize: '0.85rem', marginBottom: 16 }}>{error}</p>}
        <div className="google-btn-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="continue_with"
            shape="pill"
            size="large"
            width="100%"
          />
        </div>
        <div className="auth-divider">
          <span>or</span>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-btn" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Continue'}
          </button>
        </form>
        <p className="auth-legal">
          By continuing, you confirm that you are over 18 and that you
          have reviewed and agree to our <a href="#">Privacy Policy</a>, <a href="#">Terms of Service</a> and <a href="#">Clipper Terms</a>.
        </p>
      </div>
    </div>
  )
}

export default Login

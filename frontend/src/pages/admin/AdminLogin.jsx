import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../Auth.css'

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user, login } = useAuth()
  const navigate = useNavigate()

  if (user && user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('All fields are required'); return }
    setSubmitting(true)
    try {
      const userData = await login(email, password)
      if (userData.role !== 'admin') {
        setError('This account does not have admin access')
        return
      }
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid admin credentials')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">CLYPZY</div>
        <h1 className="auth-title">Admin Login</h1>
        <p className="auth-subtitle">Sign in to the admin panel</p>
        {error && <p style={{ color: '#e53e3e', fontSize: '0.85rem', marginBottom: 16 }}>{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Admin email"
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
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="auth-legal">
          Admin access only.
        </p>
      </div>
    </div>
  )
}

export default AdminLogin

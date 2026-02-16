import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiHome, FiClipboard, FiDollarSign, FiSettings, FiMessageCircle, FiHelpCircle, FiLifeBuoy, FiLogOut } from 'react-icons/fi'
import './DashNav.css'

function DashNav({ active }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <nav className="dash-nav">
      <Link to="/dashboard" className="dash-logo">CLYPZY <span className="dash-beta">BETA</span></Link>
      <div className="dash-tabs">
        <Link to="/dashboard" className={`dash-tab ${active === 'home' ? 'active' : ''}`}>
          <span className="tab-icon"><FiHome size={14} /></span>
          Home
        </Link>
        <Link to="/add-clips" className={`dash-tab ${active === 'clips' ? 'active' : ''}`}>
          <span className="tab-icon"><FiClipboard size={14} /></span>
          Add Clips
        </Link>
        <Link to="/earnings" className={`dash-tab ${active === 'earnings' ? 'active' : ''}`}>
          <span className="tab-icon"><FiDollarSign size={14} /></span>
          Earnings
        </Link>
      </div>
      <div className="dash-user" ref={menuRef}>
        <button className="dash-avatar" onClick={() => setOpen(!open)}>
          {user?.name?.charAt(0).toUpperCase()}
        </button>
        {open && (
          <div className="profile-dropdown">
            <div className="pd-header">
              <span className="pd-badge">CLIPPER</span>
              <p className="pd-name">{user?.name}</p>
              <p className="pd-email">{user?.email}</p>
            </div>
            <div className="pd-divider" />
            <Link to="/settings" className="pd-item" onClick={() => setOpen(false)}>
              <FiSettings size={14} /> Settings
            </Link>
            <div className="pd-divider" />
            <a href="#" className="pd-item"><FiMessageCircle size={14} /> Discord <span className="pd-arrow">↗</span></a>
            <a href="#" className="pd-item"><FiHelpCircle size={14} /> Give feedback <span className="pd-arrow">↗</span></a>
            <a href="#" className="pd-item"><FiLifeBuoy size={14} /> Support <span className="pd-arrow">↗</span></a>
            <button className="pd-item pd-logout" onClick={logout}><FiLogOut size={14} /> Log out</button>
            <div className="pd-divider" />
            <div className="pd-footer">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Clipper Terms</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default DashNav

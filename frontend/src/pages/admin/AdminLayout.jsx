import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FiBarChart2, FiUsers, FiClipboard, FiFlag, FiDollarSign, FiSettings, FiLogOut } from 'react-icons/fi'
import './Admin.css'

const navItems = [
  { to: '/admin/dashboard', icon: FiBarChart2, label: 'Overview' },
  { to: '/admin/users', icon: FiUsers, label: 'Users' },
  { to: '/admin/campaigns', icon: FiClipboard, label: 'Campaigns' },
  { to: '/admin/reports', icon: FiFlag, label: 'Reports' },
  { to: '/admin/payments', icon: FiDollarSign, label: 'Payments' },
  { to: '/admin/settings', icon: FiSettings, label: 'Settings' },
]

function AdminLayout({ title, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <NavLink to="/admin/dashboard" className="admin-sidebar-logo">
          DIRO <span className="admin-badge">ADMIN</span>
        </NavLink>
        <nav className="admin-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="admin-nav-icon"><Icon size={16} /></span>
                {item.label}
              </NavLink>
            )
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-nav-item" onClick={handleLogout}>
            <span className="admin-nav-icon"><FiLogOut size={16} /></span>
            Log out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <h1 className="admin-header-title">{title}</h1>
          <div className="admin-header-right">
            <span className="admin-header-name">{user?.name || 'Admin'}</span>
            <button className="admin-logout-btn" onClick={handleLogout}>Log out</button>
          </div>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AdminLayout

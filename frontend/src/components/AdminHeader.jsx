import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/log.png';
import './adminHeader.css';

const ADMIN_NAV = [
  { path: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { path: '/admin/campaigns', label: 'Campaigns', icon: '📋' },
  { path: '/admin/clips', label: 'Clips', icon: '🎬' },
];

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/campaigns': 'Campaign Approvals',
  '/admin/clips': 'Clip Reviews',
};

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Admin';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        !e.target.closest('.ah-mobile-toggle')
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/admin/login');
  };

  return (
    <header className="ah-topbar">
      <div className="ah-topbar-inner">
        {/* Left — Brand */}
        <div className="ah-left">
          <NavLink to="/admin" className="ah-brand" end>
            <img src={logo} alt="DIRO" className="ah-brand-logo" />
            <span className="ah-brand-text">
              DIRO <span className="ah-brand-label">Admin</span>
            </span>
          </NavLink>
        </div>

        {/* Center — Nav + Breadcrumb */}
        <nav className="ah-center">
          <ul className="ah-nav">
            {ADMIN_NAV.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `ah-nav-link ${isActive ? 'ah-nav-active' : ''}`
                  }
                >
                  <span className="ah-nav-icon">{item.icon}</span>
                  <span className="ah-nav-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Breadcrumb (desktop only) */}
          <div className="ah-breadcrumb">
            <span className="ah-breadcrumb-root">Admin</span>
            <span className="ah-breadcrumb-sep">/</span>
            <span className="ah-breadcrumb-current">{pageTitle}</span>
          </div>
        </nav>

        {/* Right — Admin profile */}
        <div className="ah-right">
          <div className="ah-profile" ref={dropdownRef}>
            <button
              className="ah-profile-btn"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <span className="ah-avatar">A</span>
              <span className="ah-admin-name">Admin</span>
              <span className={`ah-caret ${dropdownOpen ? 'ah-caret-open' : ''}`}>
                ▾
              </span>
            </button>

            {dropdownOpen && (
              <div className="ah-dropdown">
                <div className="ah-dropdown-header">
                  <span className="ah-dropdown-avatar">A</span>
                  <div className="ah-dropdown-info">
                    <p className="ah-dropdown-name">Admin User</p>
                    <p className="ah-dropdown-email">admin@diro.com</p>
                  </div>
                </div>
                <div className="ah-dropdown-divider" />
                <button className="ah-dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/admin'); }}>
                  <span>📊</span> Dashboard
                </button>
                <button className="ah-dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/admin/campaigns'); }}>
                  <span>📋</span> Campaigns
                </button>
                <button className="ah-dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/admin/clips'); }}>
                  <span>🎬</span> Clips
                </button>
                <div className="ah-dropdown-divider" />
                <button className="ah-dropdown-item ah-dropdown-logout" onClick={handleLogout}>
                  <span>🚪</span> Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={`ah-mobile-toggle ${mobileMenuOpen ? 'ah-mobile-toggle-open' : ''}`}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle admin menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      <div
        className={`ah-mobile-menu ${mobileMenuOpen ? 'ah-mobile-menu-open' : ''}`}
        ref={mobileMenuRef}
      >
        <div className="ah-mobile-profile">
          <span className="ah-avatar ah-avatar-lg">A</span>
          <div>
            <p className="ah-mobile-name">Admin User</p>
            <p className="ah-mobile-email">admin@diro.com</p>
          </div>
        </div>
        <nav className="ah-mobile-nav">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `ah-mobile-link ${isActive ? 'ah-mobile-link-active' : ''}`
              }
            >
              <span className="ah-mobile-link-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="ah-mobile-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;


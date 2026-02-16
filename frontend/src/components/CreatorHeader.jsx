import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/log.png';
import './creatorHeader.css';

const CREATOR_NAV = [
  { path: '/campaigns', label: 'Campaigns', icon: '📋' },
  { path: '/submit-clip', label: 'My Clips', icon: '🎬' },
  { path: '/wallet', label: 'Wallet / Earnings', icon: '💰' },
];

const CreatorHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Mock wallet balance
  const walletBalance = '$3,450.00';

  // Mock creator info
  const creatorName = user?.name || 'Creator';
  const creatorEmail = user?.email || 'creator@diro.com';
  const creatorInitial = creatorName.charAt(0).toUpperCase();

  // Prevent browser back button from leaving the creator dashboard
  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        !e.target.closest('.ch-mobile-toggle')
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
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="ch-topbar">
      <div className="ch-topbar-inner">
        {/* Left — Logo */}
        <div className="ch-left">
          <NavLink to="/creator/dashboard" className="ch-brand">
            <img src={logo} alt="DIRO" className="ch-brand-logo" />
          </NavLink>
        </div>

        {/* Center — Navigation */}
        <nav className="ch-center">
          <ul className="ch-nav">
            {CREATOR_NAV.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `ch-nav-link ${isActive ? 'ch-nav-active' : ''}`
                  }
                >
                  <span className="ch-nav-icon">{item.icon}</span>
                  <span className="ch-nav-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right — Wallet + Profile */}
        <div className="ch-right">
          {/* Wallet Balance */}
          <NavLink to="/wallet" className="ch-wallet">
            <span className="ch-wallet-icon">💳</span>
            <span className="ch-wallet-amount">{walletBalance}</span>
          </NavLink>

          {/* Profile Dropdown */}
          <div className="ch-profile" ref={dropdownRef}>
            <button
              className="ch-profile-btn"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <span className="ch-avatar">{creatorInitial}</span>
              <span className="ch-user-name">{creatorName}</span>
              <span className={`ch-caret ${dropdownOpen ? 'ch-caret-open' : ''}`}>
                ▾
              </span>
            </button>

            {dropdownOpen && (
              <div className="ch-dropdown">
                <div className="ch-dropdown-header">
                  <span className="ch-dropdown-avatar">{creatorInitial}</span>
                  <div className="ch-dropdown-info">
                    <p className="ch-dropdown-name">{creatorName}</p>
                    <p className="ch-dropdown-email">{creatorEmail}</p>
                  </div>
                </div>

                <div className="ch-dropdown-divider" />

                <div className="ch-dropdown-wallet">
                  <span className="ch-dropdown-wallet-label">Wallet Balance</span>
                  <span className="ch-dropdown-wallet-amount">{walletBalance}</span>
                </div>

                <div className="ch-dropdown-divider" />

                <button
                  className="ch-dropdown-item"
                  onClick={() => { setDropdownOpen(false); navigate('/creator/dashboard'); }}
                >
                  <span>👤</span> Profile
                </button>
                <button
                  className="ch-dropdown-item"
                  onClick={() => { setDropdownOpen(false); navigate('/creator/dashboard'); }}
                >
                  <span>⚙️</span> Settings
                </button>

                <div className="ch-dropdown-divider" />

                <button className="ch-dropdown-item ch-dropdown-logout" onClick={handleLogout}>
                  <span>🚪</span> Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={`ch-mobile-toggle ${mobileMenuOpen ? 'ch-mobile-toggle-open' : ''}`}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle creator menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      <div
        className={`ch-mobile-menu ${mobileMenuOpen ? 'ch-mobile-menu-open' : ''}`}
        ref={mobileMenuRef}
      >
        <div className="ch-mobile-profile">
          <span className="ch-avatar ch-avatar-lg">{creatorInitial}</span>
          <div>
            <p className="ch-mobile-name">{creatorName}</p>
            <p className="ch-mobile-email">{creatorEmail}</p>
          </div>
        </div>

        <div className="ch-mobile-wallet-card">
          <span className="ch-mobile-wallet-icon">💳</span>
          <div>
            <span className="ch-mobile-wallet-label">Wallet Balance</span>
            <span className="ch-mobile-wallet-amount">{walletBalance}</span>
          </div>
        </div>

        <nav className="ch-mobile-nav">
          {CREATOR_NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `ch-mobile-link ${isActive ? 'ch-mobile-link-active' : ''}`
              }
            >
              <span className="ch-mobile-link-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/creator/dashboard"
            className={({ isActive }) =>
              `ch-mobile-link ${isActive ? 'ch-mobile-link-active' : ''}`
            }
            end
          >
            <span className="ch-mobile-link-icon">👤</span>
            Profile
          </NavLink>
          <NavLink
            to="/creator/dashboard"
            className="ch-mobile-link"
          >
            <span className="ch-mobile-link-icon">⚙️</span>
            Settings
          </NavLink>
        </nav>

        <button className="ch-mobile-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </header>
  );
};

export default CreatorHeader;


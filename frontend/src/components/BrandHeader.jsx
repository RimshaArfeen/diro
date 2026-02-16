import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/log.png';
import './brandHeader.css';

// Base nav items — "Create Campaign" is conditionally added based on permission
const BASE_NAV = [
  { path: '/brand/dashboard', label: 'My Campaigns', icon: '📊' },
  { path: '/campaigns', label: 'Analytics', icon: '📈' },
];

const BrandHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Mock campaign budget
  const budgetTotal = '$25,000';
  const budgetSpent = '$18,200';
  const budgetRemaining = '$6,800';

  // Brand info
  const brandName = user?.name || 'Brand';
  const brandEmail = user?.email || 'brand@diro.com';
  const brandInitial = brandName.charAt(0).toUpperCase();

  // Build nav items — conditionally include "Create Campaign" if brand has permission
  const BRAND_NAV = user?.canCreateCampaign
    ? [BASE_NAV[0], { path: '/create-campaign', label: 'Create Campaign', icon: '🚀' }, BASE_NAV[1]]
    : BASE_NAV;

  // Prevent browser back button from leaving the brand dashboard
  useEffect(() => {
    const handlePopState = () => {
      // Push the current brand page back onto the history stack
      window.history.pushState(null, '', window.location.href);
    };

    // Push an initial state so popstate fires on back
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Close dropdown / mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        !e.target.closest('.bh-mobile-toggle')
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
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
    <header className="bh-topbar">
      <div className="bh-topbar-inner">
        {/* Left — Logo */}
        <div className="bh-left">
          <NavLink to="/brand/dashboard" className="bh-brand">
            <img src={logo} alt="CLYPZY" className="bh-brand-logo" />
            <span className="bh-brand-badge">Brand</span>
          </NavLink>
        </div>

        {/* Center — Navigation */}
        <nav className="bh-center">
          <ul className="bh-nav">
            {BRAND_NAV.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `bh-nav-link ${isActive ? 'bh-nav-active' : ''}`
                  }
                  end={item.path === '/brand/dashboard'}
                >
                  <span className="bh-nav-icon">{item.icon}</span>
                  <span className="bh-nav-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right — Budget + Profile */}
        <div className="bh-right">
          {/* Budget summary chip */}
          <div className="bh-budget">
            <span className="bh-budget-icon">💰</span>
            <div className="bh-budget-info">
              <span className="bh-budget-label">Budget</span>
              <span className="bh-budget-amount">{budgetRemaining}</span>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="bh-profile" ref={dropdownRef}>
            <button
              className="bh-profile-btn"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <span className="bh-avatar">{brandInitial}</span>
              <span className="bh-user-name">{brandName}</span>
              <span className={`bh-caret ${dropdownOpen ? 'bh-caret-open' : ''}`}>
                ▾
              </span>
            </button>

            {dropdownOpen && (
              <div className="bh-dropdown">
                <div className="bh-dropdown-header">
                  <span className="bh-dropdown-avatar">{brandInitial}</span>
                  <div className="bh-dropdown-info">
                    <p className="bh-dropdown-name">{brandName}</p>
                    <p className="bh-dropdown-email">{brandEmail}</p>
                  </div>
                </div>

                <div className="bh-dropdown-divider" />

                {/* Budget summary in dropdown */}
                <div className="bh-dropdown-budget">
                  <div className="bh-dropdown-budget-row">
                    <span className="bh-dropdown-budget-label">Total Budget</span>
                    <span className="bh-dropdown-budget-value">{budgetTotal}</span>
                  </div>
                  <div className="bh-dropdown-budget-row">
                    <span className="bh-dropdown-budget-label">Spent</span>
                    <span className="bh-dropdown-budget-value bh-budget-spent">{budgetSpent}</span>
                  </div>
                  <div className="bh-dropdown-budget-row">
                    <span className="bh-dropdown-budget-label">Remaining</span>
                    <span className="bh-dropdown-budget-value bh-budget-remain">{budgetRemaining}</span>
                  </div>
                  <div className="bh-dropdown-budget-bar">
                    <div className="bh-dropdown-budget-bar-fill" style={{ width: '72.8%' }} />
                  </div>
                </div>

                <div className="bh-dropdown-divider" />

                <button
                  className="bh-dropdown-item"
                  onClick={() => { setDropdownOpen(false); navigate('/brand/dashboard'); }}
                >
                  <span>⚙️</span> Settings
                </button>

                <div className="bh-dropdown-divider" />

                <button className="bh-dropdown-item bh-dropdown-logout" onClick={handleLogout}>
                  <span>🚪</span> Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={`bh-mobile-toggle ${mobileMenuOpen ? 'bh-mobile-toggle-open' : ''}`}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle brand menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      <div
        className={`bh-mobile-menu ${mobileMenuOpen ? 'bh-mobile-menu-open' : ''}`}
        ref={mobileMenuRef}
      >
        <div className="bh-mobile-profile">
          <span className="bh-avatar bh-avatar-lg">{brandInitial}</span>
          <div>
            <p className="bh-mobile-name">{brandName}</p>
            <p className="bh-mobile-email">{brandEmail}</p>
          </div>
        </div>

        <div className="bh-mobile-budget-card">
          <div className="bh-mobile-budget-header">
            <span className="bh-mobile-budget-icon">💰</span>
            <span className="bh-mobile-budget-title">Campaign Budget</span>
          </div>
          <div className="bh-mobile-budget-details">
            <div className="bh-mobile-budget-row">
              <span>Total</span>
              <span className="bh-mobile-budget-value">{budgetTotal}</span>
            </div>
            <div className="bh-mobile-budget-row">
              <span>Spent</span>
              <span className="bh-mobile-budget-value bh-budget-spent">{budgetSpent}</span>
            </div>
            <div className="bh-mobile-budget-row">
              <span>Remaining</span>
              <span className="bh-mobile-budget-value bh-budget-remain">{budgetRemaining}</span>
            </div>
          </div>
          <div className="bh-mobile-budget-bar">
            <div className="bh-mobile-budget-bar-fill" style={{ width: '72.8%' }} />
          </div>
        </div>

        <nav className="bh-mobile-nav">
          {BRAND_NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `bh-mobile-link ${isActive ? 'bh-mobile-link-active' : ''}`
              }
              end={item.path === '/brand/dashboard'}
            >
              <span className="bh-mobile-link-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/brand/dashboard"
            className="bh-mobile-link"
          >
            <span className="bh-mobile-link-icon">⚙️</span>
            Settings
          </NavLink>
        </nav>

        <button className="bh-mobile-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </header>
  );
};

export default BrandHeader;


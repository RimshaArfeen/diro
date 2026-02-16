import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/log.png';
import './navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLoggedIn, role, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  // Get dashboard path based on role
  const getDashboardPath = () => {
    if (role === 'creator') return '/creator/dashboard';
    if (role === 'brand') return '/brand/dashboard';
    return '/dashboard';
  };

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo / Brand */}
        <NavLink to="/" className="navbar-brand" onClick={closeMenu}>
          <img src={logo} alt="DIRO Logo" className="navbar-logo" />
        </NavLink>

        {/* Desktop Navigation Links */}
        <ul className="navbar-links">
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/campaigns" className={({ isActive }) => isActive ? 'active' : ''}>
              Campaigns
            </NavLink>
          </li>
          <li>
            <NavLink to="/how-it-works" className={({ isActive }) => isActive ? 'active' : ''}>
              How It Works
            </NavLink>
          </li>
          {isLoggedIn && (
            <li>
              <NavLink to={getDashboardPath()} className={({ isActive }) => isActive ? 'active' : ''}>
                Dashboard
              </NavLink>
            </li>
          )}
        </ul>

        {/* Desktop Auth Buttons */}
        <div className="navbar-auth">
          {isLoggedIn ? (
            <>
              <button onClick={handleLogout} className="btn-logout-nav">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn-login">
                Login
              </NavLink>
              <NavLink to="/signup" className="btn-signup">
                Sign Up
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <button
          className={`hamburger ${isMenuOpen ? 'hamburger-open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'mobile-menu-open' : ''}`}>
        <ul className="mobile-menu-links">
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end onClick={closeMenu}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/campaigns" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>
              Campaigns
            </NavLink>
          </li>
          <li>
            <NavLink to="/how-it-works" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>
              How It Works
            </NavLink>
          </li>
          {isLoggedIn && (
            <li>
              <NavLink to={getDashboardPath()} className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>
                Dashboard
              </NavLink>
            </li>
          )}
        </ul>
        <div className="mobile-menu-auth">
          {isLoggedIn ? (
            <>
              <button onClick={handleLogout} className="btn-logout-nav">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn-login" onClick={closeMenu}>
                Login
              </NavLink>
              <NavLink to="/signup" className="btn-signup" onClick={closeMenu}>
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

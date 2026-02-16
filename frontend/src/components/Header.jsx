import { Link } from 'react-router-dom'
import { FiUserPlus } from 'react-icons/fi'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <nav className="header-nav">
        <Link to="/" className="header-logo">CLYPZY</Link>
        <div className="header-links">
          <Link to="/login" className="nav-link">Log in</Link>
          <Link to="/signup" className="nav-link signup-btn">
            <FiUserPlus size={14} style={{ marginRight: 4 }} /> Sign up
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default Header

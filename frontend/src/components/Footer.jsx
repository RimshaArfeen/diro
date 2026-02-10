import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo">DIRO</div>
      <div className="footer-bottom">
        <span className="footer-copy">&copy; 2026 Diro. All rights reserved.</span>
        <nav className="footer-links">
          <a href="#">Help</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Clipper Terms</a>
          <a href="#">Content Requirements</a>
          <a href="#">Manage Cookies</a>
        </nav>
      </div>
    </footer>
  )
}

export default Footer


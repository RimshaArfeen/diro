import { useNavigate } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import './Hero.css'

function Hero() {
  const navigate = useNavigate()
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="light">Make clips </span>
          <span className="bold">for your</span>
          <br />
          <span className="bold">favorite </span>
          <span className="light">creators & brands</span>
        </h1>

        <p className="hero-subtitle">
          Diro is the ultimate clipping platform. Get paid for every view.
        </p>

        <button className="cta-button" onClick={() => navigate('/login')}>
          Start Clipping <FiArrowRight size={16} style={{ marginLeft: 6 }} />
        </button>
      </div>
    </section>
  )
}

export default Hero

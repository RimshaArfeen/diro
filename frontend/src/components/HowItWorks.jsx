import './howItWorks.css';

const HowItWorks = () => {
  const brandSteps = [
    { step: 1, icon: '👤', title: 'Create an Account', description: 'Sign up as a brand and complete your profile with company details and verification.' },
    { step: 2, icon: '📹', title: 'Create a Campaign', description: 'Upload your source videos and set campaign guidelines for creators to follow.' },
    { step: 3, icon: '💰', title: 'Set CPM & Budget', description: 'Define your cost-per-mille rate and deposit your campaign budget securely.' },
    { step: 4, icon: '📊', title: 'Track Performance', description: 'Monitor views, engagement, and payouts in real-time from your dashboard.' },
  ];

  const creatorSteps = [
    { step: 1, icon: '✨', title: 'Sign Up & Browse', description: 'Create your creator account and explore available campaigns that match your style.' },
    { step: 2, icon: '🎬', title: 'Clip & Create', description: 'Download source materials, create engaging clips, and post them on your channels.' },
    { step: 3, icon: '🔗', title: 'Submit Your Clip', description: 'Submit your clip link with view count proof and wait for admin approval.' },
    { step: 4, icon: '💸', title: 'Earn Money', description: 'Get paid based on your views. Withdraw earnings anytime to your preferred method.' },
  ];

  const adminFeatures = [
    { icon: '✅', text: 'Approve campaigns before they go live' },
    { icon: '🎥', text: 'Review and verify submitted clips' },
    { icon: '💳', text: 'Manage creator payouts and transactions' },
    { icon: '📈', text: 'View platform analytics and reports' },
  ];

  return (
    <div className="how-it-works-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">How DIRO Works</h1>
          <p className="hero-subtitle">
            Brands launch campaigns. Creators make clips. Everyone wins.
          </p>
        </div>
        <div className="hero-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </section>

      {/* For Brands Section */}
      <section className="steps-section brands-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">For Brands</span>
            <h2 className="section-title">Launch Campaigns That Convert</h2>
            <p className="section-description">
              Reach millions through authentic creator content. Simple setup, powerful results.
            </p>
          </div>
          <div className="steps-grid">
            {brandSteps.map((item) => (
              <div key={item.step} className="step-card">
                <div className="step-number">{item.step}</div>
                <div className="step-icon">{item.icon}</div>
                <h3 className="step-title">{item.title}</h3>
                <p className="step-description">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Creators Section */}
      <section className="steps-section creators-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">For Creators</span>
            <h2 className="section-title">Turn Views Into Income</h2>
            <p className="section-description">
              Create content you love and earn money for every view. No follower minimums.
            </p>
          </div>
          <div className="steps-grid">
            {creatorSteps.map((item) => (
              <div key={item.step} className="step-card">
                <div className="step-number">{item.step}</div>
                <div className="step-icon">{item.icon}</div>
                <h3 className="step-title">{item.title}</h3>
                <p className="step-description">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Section */}
      <section className="admin-section">
        <div className="section-container">
          <div className="admin-content">
            <div className="admin-text">
              <span className="section-badge badge-dark">Platform Management</span>
              <h2 className="section-title">Powerful Admin Tools</h2>
              <p className="section-description">
                Our admin dashboard gives you complete control over the platform.
              </p>
              <ul className="admin-features">
                {adminFeatures.map((feature, index) => (
                  <li key={index} className="admin-feature-item">
                    <span className="feature-icon">{feature.icon}</span>
                    <span className="feature-text">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="admin-visual">
              <div className="dashboard-preview">
                <div className="preview-header">
                  <div className="preview-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <span className="preview-title">Admin Dashboard</span>
                </div>
                <div className="preview-content">
                  <div className="preview-stat">
                    <span className="stat-label">Campaigns</span>
                    <span className="stat-number">128</span>
                  </div>
                  <div className="preview-stat">
                    <span className="stat-label">Creators</span>
                    <span className="stat-number">1.8K</span>
                  </div>
                  <div className="preview-stat">
                    <span className="stat-label">Revenue</span>
                    <span className="stat-number">$45K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-description">
            Join thousands of brands and creators already using DIRO.
          </p>
          <div className="cta-buttons">
            <a href="/signup" className="cta-btn cta-primary">Create Account</a>
            <a href="/campaigns" className="cta-btn cta-secondary">Browse Campaigns</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;


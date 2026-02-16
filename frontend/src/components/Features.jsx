import { useNavigate } from 'react-router-dom'
import { FiClipboard, FiUpload, FiDollarSign, FiArrowRight } from 'react-icons/fi'
import { SiInstagram, SiTiktok, SiYoutube } from 'react-icons/si'
import { RiTwitterXLine } from 'react-icons/ri'
import './Features.css'

function Features() {
  const navigate = useNavigate()
  return (
    <section className="features">
      {/* Section Intro */}
      <div className="features-intro">
        <h2 className="features-heading">Get views. Make bank.</h2>
        <p className="features-subtext">
          Welcome to the easiest way to make money creating
          <br />
          short-form content. Get paid to get views, it's that simple.
        </p>
      </div>

      {/* Feature 1 - Campaign Drops */}
      <div className="feature-row">
        <div className="feature-text">
          <span className="feature-tag">
            <span className="feature-tag-icon"><FiClipboard /></span> Find campaigns
          </span>
          <h3 className="feature-title">
            Campaign drops
            <br />
            you care about
          </h3>
          <p className="feature-desc">
            Verified creators launching high paying campaigns for
            top clippers. We review each listing to make sure they're
            legit. See them first with notifications in Discord & email.
          </p>
        </div>
        <div className="feature-card campaign-card">
          <div className="campaign-card-bg">
            <div className="campaign-card-inner">
              <div className="campaign-header">
                <div className="campaign-avatar placeholder-avatar">D</div>
                <div className="campaign-info">
                  <span className="campaign-name">
                    Brand Name <span className="verified">✓</span>
                  </span>
                  <div className="campaign-meta">
                    <span className="meta-tag">Per View</span>
                    <span className="meta-dot">i</span>
                    <span className="meta-lang">English</span>
                  </div>
                </div>
              </div>
              <p className="campaign-desc">
                Clip our content and earn
                <br />
                for every view you get!
              </p>
              <div className="campaign-footer">
                <div className="campaign-socials">
                  <span className="social-icon"><SiInstagram /></span>
                  <span className="social-icon"><SiTiktok /></span>
                  <span className="social-icon"><SiYoutube /></span>
                  <span className="social-icon"><RiTwitterXLine /></span>
                </div>
                <div className="campaign-pay">
                  <span className="pay-amount">$X,XXX</span>
                  <span className="pay-label">PER 1M VIEWS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 2 - Submit Clips */}
      <div className="feature-row reverse">
        <div className="feature-text">
          <span className="feature-tag">
            <span className="feature-tag-icon"><FiUpload /></span> Post clips
          </span>
          <h3 className="feature-title">
            Submit clips
            <br />
            in a click
          </h3>
          <p className="feature-desc">
            Connect your socials and add clips in seconds.
            Track your uploads, approvals and stats in one place.
            Clypzy's your home for going viral.
          </p>
        </div>
        <div className="feature-card submit-card">
          <div className="submit-card-inner">
            <div className="submit-header">
              <div className="campaign-avatar placeholder-avatar sm">D</div>
              <div>
                <span className="submit-name">
                  Your Campaign <span className="verified">✓</span>
                </span>
                <div className="submit-campaign-label">Active campaign</div>
              </div>
            </div>
            <div className="submit-stats">
              <div className="stat">
                <span className="stat-value">$$$</span>
                <span className="stat-label">Earned</span>
              </div>
              <div className="stat">
                <span className="stat-value">Views</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat">
                <span className="stat-value">Live</span>
                <span className="stat-label">Status</span>
              </div>
              <div className="stat">
                <span className="stat-value">---</span>
                <span className="stat-label">Paid out</span>
              </div>
            </div>
            <div className="submit-earning-tag">
              Earn per 1M views based on campaign CPM
            </div>
            <div className="submit-menu">
              <div className="submit-menu-item">
                <span><FiClipboard style={{ marginRight: 6 }} /> Directions and content</span>
                <span className="arrow"><FiArrowRight /></span>
              </div>
              <div className="submit-menu-item">
                <span><FiUpload style={{ marginRight: 6 }} /> My submissions</span>
                <span className="arrow"><FiArrowRight /></span>
              </div>
              <div className="submit-menu-item">
                <span><FiDollarSign style={{ marginRight: 6 }} /> Campaign leaderboard</span>
                <span className="arrow"><FiArrowRight /></span>
              </div>
            </div>
            <button className="submit-btn" onClick={() => navigate('/login')}>Submit post</button>
          </div>
        </div>
      </div>

      {/* Feature 3 - Earnings */}
      <div className="feature-row">
        <div className="feature-text">
          <span className="feature-tag">
            <span className="feature-tag-icon"><FiDollarSign /></span> Cash out
          </span>
          <h3 className="feature-title">
            Earnings on
            <br />
            easy mode
          </h3>
          <p className="feature-desc">
            Payouts are sent to your Clypzy wallet hourly.
            <br />
            See what you've earned and withdraw using Stripe or
            PayPal (depending on country).
          </p>
        </div>
        <div className="feature-card earnings-card">
          <div className="earnings-card-inner">
            <div className="earnings-top">
              <div className="balance-box">
                <span className="balance-label">Available balance</span>
                <div className="balance-row">
                  <span className="balance-amount">$X.XX</span>
                  <button className="cashout-btn">Cash out</button>
                </div>
              </div>
              <div className="lifetime-box">
                <span className="lifetime-label">Lifetime earnings</span>
                <span className="lifetime-amount">$X,XXX.XX</span>
              </div>
            </div>
            <div className="earnings-tabs">
              <span className="tab active">Available</span>
              <span className="tab">Pending</span>
              <span className="tab">Paid out</span>
            </div>
            <div className="earnings-table">
              <div className="table-header">
                <span className="col-date">Date</span>
                <span className="col-post">Post</span>
                <span className="col-campaign">Campaign</span>
              </div>
              <div className="table-row">
                <span className="col-date">Your earnings</span>
                <span className="col-post">
                  <span className="post-icon ig"><SiInstagram /></span>
                  <span className="post-info">
                    <span className="post-handle">@yourhandle</span>
                    <span className="post-date">your clip</span>
                  </span>
                </span>
                <span className="col-campaign">Campaign</span>
              </div>
              <div className="table-row">
                <span className="col-date">show here</span>
                <span className="col-post">
                  <span className="post-icon x"><RiTwitterXLine /></span>
                  <span className="post-info">
                    <span className="post-handle">@yourhandle</span>
                    <span className="post-date">your clip</span>
                  </span>
                </span>
                <span className="col-campaign">Campaign</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features

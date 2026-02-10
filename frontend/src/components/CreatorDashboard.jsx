import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clipsAPI, campaignsAPI, usersAPI } from '../services/api';
import './creatorDashboard.css';

const CreatorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clipFilter, setClipFilter] = useState('all');
  const [clips, setClips] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, pendingBalance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      clipsAPI.list({ limit: 20 }).catch(() => ({ clips: [] })),
      campaignsAPI.list({ status: 'live', limit: 3 }).catch(() => ({ campaigns: [] })),
      usersAPI.getWallet().catch(() => ({ wallet: { balance: 0, pendingBalance: 0 } })),
    ]).then(([clipsData, campaignsData, walletData]) => {
      setClips(clipsData.clips || []);
      setCampaigns(campaignsData.campaigns || []);
      setWallet(walletData.wallet || { balance: 0, pendingBalance: 0 });
    }).finally(() => setLoading(false));
  }, []);

  const totalViews = clips.reduce((sum, c) => sum + (c.views || 0), 0);
  const totalEarnings = clips.reduce((sum, c) => sum + (c.earnings || 0), 0);
  const approvedClips = clips.filter(c => c.status === 'approved').length;

  const stats = [
    { id: 1, label: 'Total Clips', value: clips.length.toString(), change: `${approvedClips} approved`, trend: 'up', icon: '🎬', color: 'blue' },
    { id: 2, label: 'Total Views', value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews.toString(), change: 'All time', trend: 'up', icon: '👁️', color: 'green' },
    { id: 3, label: 'Total Earnings', value: `$${totalEarnings.toFixed(2)}`, change: `Balance: $${wallet.balance?.toFixed(2) || '0.00'}`, trend: 'up', icon: '💰', color: 'purple' },
    { id: 4, label: 'Active Campaigns', value: campaigns.length.toString(), change: 'Available now', trend: 'neutral', icon: '📢', color: 'orange' },
  ];

  const filteredClips = clipFilter === 'all' ? clips : clips.filter(c => c.status === clipFilter);

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'tiktok': return '🎵';
      case 'youtube': return '▶️';
      case 'instagram': return '📸';
      default: return '🎬';
    }
  };

  if (loading) {
    return (
      <div className="creator-dashboard">
        <div className="cd-content">
          <p style={{ textAlign: 'center', padding: '3rem' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="creator-dashboard">
      {/* Hero Section */}
      <div className="cd-hero">
        <div className="cd-hero-content">
          <div className="cd-hero-text">
            <span className="cd-welcome-badge">Creator Dashboard</span>
            <h1 className="cd-hero-title">
              Welcome back, <span className="cd-gradient-text">{user?.name || 'Creator'}</span>
            </h1>
            <p className="cd-hero-subtitle">
              You've earned ${totalEarnings.toFixed(2)} total and your clips have been viewed {totalViews.toLocaleString()} times.
            </p>
          </div>
          <div className="cd-hero-actions">
            <Link to="/campaigns" className="cd-btn-primary">
              <span className="cd-btn-icon">🔍</span>
              Browse Campaigns
            </Link>
            <Link to="/submit-clip" className="cd-btn-secondary">
              <span className="cd-btn-icon">📹</span>
              Submit Clip
            </Link>
          </div>
        </div>
        <div className="cd-hero-decoration">
          <div className="cd-circle cd-circle-1"></div>
          <div className="cd-circle cd-circle-2"></div>
          <div className="cd-circle cd-circle-3"></div>
        </div>
      </div>

      <div className="cd-content">
        {/* Stats Grid */}
        <section className="cd-stats-section">
          <div className="cd-stats-grid">
            {stats.map((stat) => (
              <div key={stat.id} className={`cd-stat-card cd-stat-${stat.color}`}>
                <div className="cd-stat-header">
                  <span className="cd-stat-icon">{stat.icon}</span>
                  <span className={`cd-stat-trend cd-trend-${stat.trend}`}>
                    {stat.trend === 'up' && '↑'}
                    {stat.trend === 'down' && '↓'}
                  </span>
                </div>
                <div className="cd-stat-body">
                  <h3 className="cd-stat-value">{stat.value}</h3>
                  <p className="cd-stat-label">{stat.label}</p>
                </div>
                <div className="cd-stat-footer">
                  <span className="cd-stat-change">{stat.change}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="cd-main-grid">
          {/* Left Column - Submissions */}
          <div className="cd-main-column">
            {/* My Clips Section */}
            <section className="cd-clips-section">
              <div className="cd-section-header">
                <div className="cd-section-title-group">
                  <h2 className="cd-section-title">My Clips</h2>
                  <span className="cd-clip-count">{clips.length} total</span>
                </div>
                <div className="cd-clip-tabs">
                  {['all', 'approved', 'pending', 'flagged'].map((tab) => (
                    <button
                      key={tab}
                      className={`cd-tab-btn ${clipFilter === tab ? 'active' : ''}`}
                      onClick={() => setClipFilter(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="cd-clips-list">
                {filteredClips.map((clip) => (
                  <div key={clip.clipId} className="cd-clip-card">
                    <div className="cd-clip-thumbnail">
                      <span className="cd-platform-icon">{getPlatformIcon(clip.platform)}</span>
                    </div>
                    <div className="cd-clip-info">
                      <div className="cd-clip-top-row">
                        <h3 className="cd-clip-campaign">{clip.campaignId}</h3>
                        <span className={`cd-clip-status cd-status-${clip.status}`}>
                          {clip.status}
                        </span>
                      </div>
                      <div className="cd-clip-meta">
                        <span className="cd-meta-item">
                          <span className="cd-meta-icon">🎬</span> {clip.platform}
                        </span>
                        <span className="cd-meta-item">
                          <span className="cd-meta-icon">👁️</span> {(clip.views || 0).toLocaleString()}
                        </span>
                        <span className="cd-meta-item">
                          <span className="cd-meta-icon">💰</span> ${(clip.earnings || 0).toFixed(2)}
                        </span>
                        <span className="cd-meta-item">
                          <span className="cd-meta-icon">📅</span> {new Date(clip.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredClips.length === 0 && (
                  <div className="cd-empty-state">
                    <span className="cd-empty-icon">📭</span>
                    <p>No clips found for this filter.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Available Campaigns */}
            <section className="cd-available-section">
              <div className="cd-section-header">
                <h2 className="cd-section-title">Available Campaigns</h2>
                <Link to="/campaigns" className="cd-see-all-link">View All →</Link>
              </div>
              <div className="cd-campaign-grid">
                {campaigns.map((campaign) => (
                  <div key={campaign.campaignId} className="cd-campaign-card">
                    <div className="cd-campaign-top">
                      <span className="cd-campaign-cpm">${campaign.CPM} CPM</span>
                    </div>
                    <h3 className="cd-campaign-title">{campaign.title}</h3>
                    <div className="cd-campaign-details">
                      <div className="cd-campaign-detail">
                        <span className="cd-detail-label">Goal Views</span>
                        <span className="cd-detail-value">{campaign.goalViews?.toLocaleString()}</span>
                      </div>
                      <div className="cd-campaign-detail">
                        <span className="cd-detail-label">Min Views</span>
                        <span className="cd-detail-value">{campaign.minViewsForPayout?.toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      className="cd-join-btn"
                      onClick={() => navigate(`/join-campaign?id=${campaign.campaignId}`)}
                    >
                      View & Join
                    </button>
                  </div>
                ))}
                {campaigns.length === 0 && (
                  <p style={{ color: '#888', textAlign: 'center' }}>No campaigns available right now.</p>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="cd-sidebar">
            {/* Earnings Overview */}
            <div className="cd-sidebar-card">
              <div className="cd-sidebar-header">
                <h3 className="cd-sidebar-title">Earnings Overview</h3>
                <Link to="/wallet" className="cd-see-all-btn">Wallet →</Link>
              </div>
              <div className="cd-earnings-total">
                <span className="cd-total-label">Total Earned</span>
                <span className="cd-total-value">${totalEarnings.toFixed(2)}</span>
              </div>
              <div className="cd-earnings-total" style={{ marginTop: '0.5rem' }}>
                <span className="cd-total-label">Wallet Balance</span>
                <span className="cd-total-value">${wallet.balance?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="cd-sidebar-card cd-quick-actions">
              <h3 className="cd-sidebar-title">Quick Actions</h3>
              <div className="cd-qa-grid">
                <Link to="/submit-clip" className="cd-qa-btn">
                  <span className="cd-qa-icon">📹</span>
                  <span>Submit Clip</span>
                </Link>
                <Link to="/campaigns" className="cd-qa-btn">
                  <span className="cd-qa-icon">🔍</span>
                  <span>Campaigns</span>
                </Link>
                <Link to="/wallet" className="cd-qa-btn">
                  <span className="cd-qa-icon">💰</span>
                  <span>Wallet</span>
                </Link>
                <Link to="/join-campaign" className="cd-qa-btn">
                  <span className="cd-qa-icon">🎯</span>
                  <span>Join Campaign</span>
                </Link>
              </div>
            </div>

            {/* Performance Card */}
            <div className="cd-sidebar-card cd-performance-card">
              <h3 className="cd-sidebar-title">Your Performance</h3>
              <div className="cd-perf-grid">
                <div className="cd-perf-item">
                  <div className="cd-perf-circle">
                    <svg viewBox="0 0 36 36" className="cd-perf-ring">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#32CD32"
                        strokeWidth="3"
                        strokeDasharray={`${clips.length > 0 ? Math.round((approvedClips / clips.length) * 100) : 0}, 100`}
                      />
                    </svg>
                    <span className="cd-perf-percent">{clips.length > 0 ? Math.round((approvedClips / clips.length) * 100) : 0}%</span>
                  </div>
                  <span className="cd-perf-label">Approval Rate</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;

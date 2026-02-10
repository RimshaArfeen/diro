import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { campaignsAPI } from '../services/api';
import './brandDashboard.css';

const BrandDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campaignsAPI.list({ limit: 50 })
      .then(data => setCampaigns(data.campaigns || []))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  const totalSpend = campaigns.reduce((sum, c) => sum + (c.deposit || 0), 0);
  const liveCampaigns = campaigns.filter(c => c.status === 'live').length;

  const stats = [
    { id: 1, label: 'Total Campaigns', value: campaigns.length.toString(), change: `${liveCampaigns} live`, trend: 'up', icon: '📢', color: 'blue' },
    { id: 2, label: 'Live Campaigns', value: liveCampaigns.toString(), change: `${Math.round((liveCampaigns / (campaigns.length || 1)) * 100)}% of total`, trend: 'neutral', icon: '🚀', color: 'green' },
    { id: 3, label: 'Total Deposited', value: `$${totalSpend.toLocaleString()}`, change: 'All time', trend: 'up', icon: '💰', color: 'purple' },
    { id: 4, label: 'Pending', value: campaigns.filter(c => c.status === 'pending').length.toString(), change: 'Awaiting approval', trend: 'neutral', icon: '⏳', color: 'orange' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'status-active';
      case 'completed': return 'status-completed';
      case 'pending': return 'status-paused';
      default: return '';
    }
  };

  const filteredCampaigns = activeTab === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === activeTab);

  if (loading) {
    return (
      <div className="brand-dashboard">
        <div className="dashboard-content">
          <p style={{ textAlign: 'center', padding: '3rem' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="brand-dashboard">
      {/* Hero Header */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-text">
            <span className="welcome-badge">Brand Dashboard</span>
            <h1 className="hero-title">
              Welcome back, <span className="gradient-text">{user?.name || 'Brand'}</span>
            </h1>
            <p className="hero-subtitle">
              You have {campaigns.length} campaigns with ${totalSpend.toLocaleString()} total deposited.
            </p>
          </div>
          <div className="hero-actions">
            <Link to="/create-campaign" className="btn-primary-hero">
              <span className="btn-icon">+</span>
              Create Campaign
            </Link>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Stats Grid */}
        <section className="stats-section">
          <div className="stats-grid">
            {stats.map((stat) => (
              <div key={stat.id} className={`stat-card-brand stat-${stat.color}`}>
                <div className="stat-card-header">
                  <span className="stat-icon-brand">{stat.icon}</span>
                  <span className={`stat-trend trend-${stat.trend}`}>
                    {stat.trend === 'up' && '↑'}
                    {stat.trend === 'down' && '↓'}
                  </span>
                </div>
                <div className="stat-card-body">
                  <h3 className="stat-value-brand">{stat.value}</h3>
                  <p className="stat-label-brand">{stat.label}</p>
                </div>
                <div className="stat-card-footer">
                  <span className="stat-change">{stat.change}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="main-grid">
          {/* Campaigns Section */}
          <section className="campaigns-section">
            <div className="section-header-brand">
              <div className="section-title-group">
                <h2 className="section-title-brand">Your Campaigns</h2>
                <span className="campaign-count">{campaigns.length} total</span>
              </div>
              <div className="campaign-tabs">
                {['all', 'pending', 'live', 'completed'].map(tab => (
                  <button
                    key={tab}
                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="campaigns-list">
              {filteredCampaigns.map((campaign) => (
                <div key={campaign.campaignId} className="campaign-card-brand">
                  <div className="campaign-card-main">
                    <div className="campaign-info">
                      <div className="campaign-title-row">
                        <h3 className="campaign-name">{campaign.title}</h3>
                        <span className={`campaign-status ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                      <div className="campaign-meta">
                        <span className="meta-item">
                          <span className="meta-icon">💰</span>
                          ${campaign.CPM} CPM
                        </span>
                        <span className="meta-item">
                          <span className="meta-icon">👁️</span>
                          {campaign.goalViews?.toLocaleString()} goal views
                        </span>
                        <span className="meta-item">
                          <span className="meta-icon">📅</span>
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="campaign-budget">
                      <div className="budget-info">
                        <span className="budget-spent">${campaign.deposit?.toLocaleString()}</span>
                        <span className="budget-total"> deposit</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredCampaigns.length === 0 && (
                <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>No campaigns found.</p>
              )}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            {/* Quick Actions */}
            <div className="sidebar-card quick-actions-card">
              <h3 className="sidebar-title">Quick Actions</h3>
              <div className="quick-actions-grid">
                <Link to="/create-campaign" className="quick-action-btn">
                  <span className="qa-icon">📝</span>
                  <span>New Campaign</span>
                </Link>
                <Link to="/campaigns" className="quick-action-btn">
                  <span className="qa-icon">📊</span>
                  <span>All Campaigns</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BrandDashboard;

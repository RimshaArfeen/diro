import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignsAPI } from '../services/api';
import './recentCampaigns.css';

const RecentCampaigns = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campaignsAPI.list({ status: 'live', limit: 6 })
      .then(data => setCampaigns(data.campaigns))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="recent-campaigns">
        <div className="campaigns-container">
          <p style={{ textAlign: 'center', padding: '3rem' }}>Loading campaigns...</p>
        </div>
      </section>
    );
  }

  if (campaigns.length === 0) {
    return (
      <section className="recent-campaigns">
        <div className="campaigns-container">
          <div className="campaigns-header">
            <h2 className="campaigns-title">Recent Campaigns</h2>
            <p className="campaigns-subtitle">No active campaigns yet. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="recent-campaigns">
      <div className="campaigns-container">
        <div className="campaigns-header">
          <h2 className="campaigns-title">Recent Campaigns</h2>
          <p className="campaigns-subtitle">
            Discover active campaigns and start earning today
          </p>
        </div>

        <div className="campaigns-grid">
          {campaigns.map((campaign) => (
            <div key={campaign.campaignId} className="campaign-card">
              <div className="card-content">
                <h3 className="card-title">{campaign.title}</h3>
                <p className="card-description">{campaign.description}</p>

                <div className="card-stats">
                  <div className="stat-item">
                    <span className="stat-label">CPM</span>
                    <span className="stat-value">${campaign.CPM}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Goal Views</span>
                    <span className="stat-value">{campaign.goalViews?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button className="card-button" onClick={() => navigate('/campaigns')}>
                View Campaign
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentCampaigns;

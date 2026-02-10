import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { campaignsAPI } from '../services/api';
import './campaigns.css';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    campaignsAPI.list({ status: 'live', limit: 50 })
      .then(data => setCampaigns(data.campaigns))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  const handleJoinCampaign = (campaignId) => {
    if (!isLoggedIn) {
      navigate('/login?role=creator');
    } else {
      navigate(`/join-campaign?id=${campaignId}`);
    }
  };

  if (loading) {
    return (
      <div className="campaigns-page">
        <div className="campaigns-page-container">
          <p style={{ textAlign: 'center', padding: '3rem' }}>Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="campaigns-page">
      <div className="campaigns-page-container">
        <div className="campaigns-page-header">
          <h1 className="page-title">Active Campaigns</h1>
        </div>

        {campaigns.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>No active campaigns right now. Check back soon!</p>
        ) : (
          <div className="campaigns-grid">
            {campaigns.map((campaign) => (
              <div key={campaign.campaignId} className="campaign-card">
                <div className="card-header">
                  <h3 className="card-title">{campaign.title}</h3>
                </div>

                <div className="card-details">
                  <div className="detail-item">
                    <span className="detail-label">CPM</span>
                    <span className="detail-value">${campaign.CPM}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Min Views</span>
                    <span className="detail-value">{campaign.minViewsForPayout?.toLocaleString()}</span>
                  </div>
                </div>

                <button className="join-button" onClick={() => handleJoinCampaign(campaign.campaignId)}>
                  Join Campaign
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Campaigns;

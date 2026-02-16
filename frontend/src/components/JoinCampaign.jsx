import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { campaignsAPI } from '../services/api';
import './joinCampaign.css';

const JoinCampaign = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('id');
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!campaignId) {
      setLoading(false);
      return;
    }
    campaignsAPI.get(campaignId)
      .then(data => setCampaign(data.campaign))
      .catch(() => setCampaign(null))
      .finally(() => setLoading(false));
  }, [campaignId]);

  const handleJoin = () => {
    setJoined(true);
    setTimeout(() => {
      navigate(`/submit-clip?campaign=${campaign.campaignId}`);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="join-page">
        <div className="join-container">
          <p style={{ textAlign: 'center', padding: '3rem' }}>Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="join-page">
        <div className="join-container">
          <p style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
            Campaign not found or is no longer available.
          </p>
          <button className="join-btn" onClick={() => navigate('/campaigns')} style={{ display: 'block', margin: '0 auto' }}>
            Browse Campaigns
          </button>
        </div>
      </div>
    );
  }

  // Frontend safety: prevent interaction with non-live campaigns
  if (campaign.status !== 'live') {
    return (
      <div className="join-page">
        <div className="join-container">
          <p style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
            This campaign is not currently active and cannot be joined.
          </p>
          <button className="join-btn" onClick={() => navigate('/campaigns')} style={{ display: 'block', margin: '0 auto' }}>
            Browse Active Campaigns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="join-page">
      <div className="join-container">
        <h1 className="page-title">Campaign Details</h1>

        <div className="join-grid">
          {/* Left Section - Campaign Info */}
          <div className="campaign-info-card">
            <h2 className="campaign-title">{campaign.title}</h2>

            <p className="campaign-description">{campaign.description}</p>

            <div className="campaign-stats">
              <div className="stat-item">
                <span className="stat-label">CPM Rate</span>
                <span className="stat-value">${campaign.CPM}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Min. Views</span>
                <span className="stat-value">{campaign.minViewsForPayout?.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Goal Views</span>
                <span className="stat-value highlight">{campaign.goalViews?.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Status</span>
                <span className="stat-value">{campaign.status}</span>
              </div>
            </div>

            {joined ? (
              <div className="success-message">
                <span className="success-icon">✓</span>
                <div>
                  <p className="success-title">Ready to Submit!</p>
                  <p className="success-text">Redirecting to submit your clip...</p>
                </div>
              </div>
            ) : (
              <button className="join-btn" onClick={handleJoin}>
                Join & Submit Clip
              </button>
            )}
          </div>

          {/* Right Section - Source Materials */}
          <div className="source-materials-card">
            <h3 className="section-title">Source Videos</h3>
            <p className="section-subtitle">Official brand videos for this campaign</p>

            <div className="materials-list">
              {campaign.sourceVideos?.map((url, index) => (
                <div key={index} className="material-item">
                  <div className="material-thumbnail">
                    <span className="thumb-icon">▶</span>
                  </div>
                  <div className="material-info">
                    <p className="material-title">Source Video {index + 1}</p>
                  </div>
                  <div className="material-actions">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="btn-view">View</a>
                  </div>
                </div>
              ))}
              {(!campaign.sourceVideos || campaign.sourceVideos.length === 0) && (
                <p style={{ color: '#888', padding: '1rem' }}>No source videos available.</p>
              )}
            </div>

            <div className="guidelines-box">
              <h4>Content Guidelines</h4>
              <ul>
                <li>Keep videos between 15-60 seconds</li>
                <li>Use trending audio when possible</li>
                <li>Minimum {campaign.minViewsForPayout?.toLocaleString() || '0'} views for payout</li>
                <li>CPM rate: ${campaign.CPM} per 1000 views</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinCampaign;

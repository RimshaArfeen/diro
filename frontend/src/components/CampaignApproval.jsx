import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { campaignsAPI } from '../services/api';
import './admin.css';

const CampaignApproval = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campaignsAPI.list({ limit: 50 })
      .then(data => setCampaigns(data.campaigns || []))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (campaignId) => {
    try {
      await campaignsAPI.updateStatus(campaignId, 'live');
      setCampaigns(prev => prev.map(c => c.campaignId === campaignId ? { ...c, status: 'live' } : c));
    } catch {
      // stay silent on error
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      live: 'badge-approved',
      completed: 'badge-approved',
    };
    return badges[status] || 'badge-pending';
  };

  if (loading) {
    return <div className="admin-page"><div className="admin-container"><p style={{ textAlign: 'center', padding: '3rem' }}>Loading...</p></div></div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="page-header">
          <div>
            <Link to="/admin" className="back-link">← Back to Dashboard</Link>
            <h1 className="admin-title">Campaign Approvals</h1>
          </div>
        </div>

        <div className="table-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>CPM</th>
                  <th>Deposit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.campaignId}>
                    <td data-label="Campaign">{campaign.title}</td>
                    <td data-label="CPM">${campaign.CPM}</td>
                    <td data-label="Deposit">${campaign.deposit?.toLocaleString()}</td>
                    <td data-label="Status">
                      <span className={`status-badge ${getStatusBadge(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className="table-actions">
                        <button className="btn-approve" onClick={() => handleApprove(campaign.campaignId)} disabled={campaign.status !== 'pending'}>
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignApproval;

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, campaignsAPI, clipsAPI } from '../services/api';
import './adminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [campaignData, setCampaignData] = useState([]);
  const [clipData, setClipData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      campaignsAPI.list({ limit: 50 }).catch(() => ({ campaigns: [] })),
      clipsAPI.list({ limit: 50 }).catch(() => ({ clips: [] })),
      adminAPI.dashboard().catch(() => null),
    ]).then(([campaignsRes, clipsRes, dashRes]) => {
      setCampaignData(campaignsRes.campaigns || []);
      setClipData(clipsRes.clips || []);
      setDashboardStats(dashRes);
    }).finally(() => setLoading(false));
  }, []);

  const pendingCampaigns = campaignData.filter(c => c.status === 'pending').length;
  const pendingClips = clipData.filter(c => c.status === 'pending').length;
  const approvedClips = clipData.filter(c => c.status === 'approved').length;
  const flaggedClips = clipData.filter(c => c.status === 'flagged').length;

  const stats = [
    { label: 'Total Campaigns', value: dashboardStats?.totalCampaigns || campaignData.length, icon: '📢', trend: `${pendingCampaigns} pending`, trendType: 'neutral', color: '#17a2b8' },
    { label: 'Total Creators', value: dashboardStats?.totalCreators || '—', icon: '👥', trend: 'Registered', trendType: 'positive', color: '#6f42c1' },
    { label: 'Total Clips', value: dashboardStats?.totalClips || clipData.length, icon: '🎬', trend: `${pendingClips} to review`, trendType: 'neutral', color: '#fd7e14' },
    { label: 'Approved Clips', value: approvedClips, icon: '✅', trend: 'On track', trendType: 'positive', color: '#28a745' },
    { label: 'Flagged Content', value: flaggedClips, icon: '⚠️', trend: flaggedClips > 0 ? 'Needs attention' : 'All clear', trendType: flaggedClips > 0 ? 'negative' : 'positive', color: '#dc3545' },
  ];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApproveCampaign = async (campaignId) => {
    try {
      await campaignsAPI.updateStatus(campaignId, 'live');
      setCampaignData(prev => prev.map(c => c.campaignId === campaignId ? { ...c, status: 'live' } : c));
      showToast('Campaign approved and set to live!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to approve campaign', 'error');
    }
  };

  const handleApproveClip = async (clipId) => {
    try {
      await clipsAPI.updateStatus(clipId, 'approved');
      setClipData(prev => prev.map(c => c.clipId === clipId ? { ...c, status: 'approved' } : c));
      showToast('Clip approved!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to approve clip', 'error');
    }
  };

  const handleFlagClip = async (clipId) => {
    try {
      await clipsAPI.updateStatus(clipId, 'flagged');
      setClipData(prev => prev.map(c => c.clipId === clipId ? { ...c, status: 'flagged' } : c));
      showToast('Clip flagged for review.', 'warning');
    } catch (err) {
      showToast(err.message || 'Failed to flag clip', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'tiktok': return '🎵';
      case 'youtube': return '▶️';
      case 'instagram': return '📸';
      default: return '🎬';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved': case 'live': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'flagged': return 'status-flagged';
      default: return 'status-pending';
    }
  };

  if (loading) {
    return (
      <div className="ad-dashboard-page">
        <div className="ad-main-content">
          <p style={{ textAlign: 'center', padding: '3rem' }}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-dashboard-page">
      {/* Toast Notification */}
      {toast && (
        <div className={`ad-toast ad-toast-${toast.type}`}>
          <span className="ad-toast-icon">
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : '⚠️'}
          </span>
          <span className="ad-toast-message">{toast.message}</span>
        </div>
      )}

      {/* Hero Section */}
      <div className="ad-hero">
        <div className="ad-hero-content">
          <div className="ad-hero-text">
            <h1 className="ad-hero-title">Admin Control Center</h1>
            <p className="ad-hero-subtitle">Monitor campaigns, review clips, and manage the platform.</p>
          </div>
          <div className="ad-hero-actions">
            <button onClick={() => setActiveTab('campaigns')} className="ad-hero-btn ad-hero-btn-primary">
              📋 Review Campaigns
            </button>
            <button onClick={() => setActiveTab('clips')} className="ad-hero-btn ad-hero-btn-secondary">
              🎬 Review Clips
            </button>
          </div>
        </div>
        <div className="ad-hero-decorations">
          <span className="ad-glass-badge">🛡️ Admin Panel</span>
          <div className="ad-circle ad-circle-1"></div>
          <div className="ad-circle ad-circle-2"></div>
          <div className="ad-circle ad-circle-3"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ad-main-content">
        {/* Stats Grid */}
        <section className="ad-stats-section">
          <div className="ad-stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="ad-stat-card" style={{ '--accent': stat.color }}>
                <div className="ad-stat-icon-wrap">
                  <span className="ad-stat-icon">{stat.icon}</span>
                </div>
                <div className="ad-stat-info">
                  <p className="ad-stat-label">{stat.label}</p>
                  <h3 className="ad-stat-value">{stat.value}</h3>
                  <span className={`ad-stat-trend ad-trend-${stat.trendType}`}>{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="ad-tab-nav">
          <button className={`ad-tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            📊 Overview
          </button>
          <button className={`ad-tab-btn ${activeTab === 'campaigns' ? 'active' : ''}`} onClick={() => setActiveTab('campaigns')}>
            📋 Campaigns {pendingCampaigns > 0 && <span className="ad-tab-badge">{pendingCampaigns}</span>}
          </button>
          <button className={`ad-tab-btn ${activeTab === 'clips' ? 'active' : ''}`} onClick={() => setActiveTab('clips')}>
            🎬 Clips {pendingClips > 0 && <span className="ad-tab-badge">{pendingClips}</span>}
          </button>
        </div>

        {/* Content Grid */}
        <div className="ad-content-grid">
          <div className="ad-content-main">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                <div className="ad-card">
                  <div className="ad-card-header">
                    <h2 className="ad-card-title">🔔 Pending Campaign Approvals</h2>
                    <button onClick={() => setActiveTab('campaigns')} className="ad-view-all-btn">View All →</button>
                  </div>
                  <div className="ad-campaign-list">
                    {campaignData.filter(c => c.status === 'pending').slice(0, 3).map(campaign => (
                      <div key={campaign.campaignId} className="ad-campaign-row">
                        <div className="ad-campaign-info">
                          <p className="ad-campaign-name">{campaign.title}</p>
                          <p className="ad-campaign-meta">CPM: ${campaign.CPM} • {new Date(campaign.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="ad-campaign-actions">
                          <button className="ad-btn-approve" onClick={() => handleApproveCampaign(campaign.campaignId)}>
                            ✓ Approve
                          </button>
                        </div>
                      </div>
                    ))}
                    {campaignData.filter(c => c.status === 'pending').length === 0 && (
                      <p className="ad-empty-state">🎉 All campaigns have been reviewed!</p>
                    )}
                  </div>
                </div>

                <div className="ad-card">
                  <div className="ad-card-header">
                    <h2 className="ad-card-title">🎬 Pending Clip Reviews</h2>
                    <button onClick={() => setActiveTab('clips')} className="ad-view-all-btn">View All →</button>
                  </div>
                  <div className="ad-clips-preview-grid">
                    {clipData.filter(c => c.status === 'pending').slice(0, 4).map(clip => (
                      <div key={clip.clipId} className="ad-clip-mini-card">
                        <div className="ad-clip-mini-preview">
                          <span className="ad-clip-mini-icon">🎬</span>
                          <span className={`ad-clip-mini-status ${getStatusClass(clip.status)}`}>{clip.status}</span>
                        </div>
                        <div className="ad-clip-mini-info">
                          <p className="ad-clip-mini-creator">{clip.creatorId}</p>
                          <p className="ad-clip-mini-meta">{getPlatformIcon(clip.platform)} {clip.platform} • {(clip.views || 0).toLocaleString()} views</p>
                        </div>
                        <div className="ad-clip-mini-actions">
                          <button className="ad-btn-sm-approve" onClick={() => handleApproveClip(clip.clipId)}>✓</button>
                          <button className="ad-btn-sm-flag" onClick={() => handleFlagClip(clip.clipId)}>⚑</button>
                        </div>
                      </div>
                    ))}
                    {clipData.filter(c => c.status === 'pending').length === 0 && (
                      <p className="ad-empty-state">🎉 All clips have been reviewed!</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* CAMPAIGNS TAB */}
            {activeTab === 'campaigns' && (
              <div className="ad-card">
                <div className="ad-card-header">
                  <h2 className="ad-card-title">📋 All Campaigns</h2>
                </div>
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Campaign</th>
                        <th>CPM</th>
                        <th>Deposit</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignData.map(campaign => (
                        <tr key={campaign.campaignId} className="ad-campaign-row">
                          <td data-label="Campaign"><span className="ad-table-name">{campaign.title}</span></td>
                          <td data-label="CPM">${campaign.CPM}</td>
                          <td data-label="Deposit">${campaign.deposit?.toLocaleString()}</td>
                          <td data-label="Status">
                            <span className={`ad-status-badge ${getStatusClass(campaign.status)}`}>{campaign.status}</span>
                          </td>
                          <td data-label="Actions">
                            <div className="ad-table-actions">
                              <button className="ad-btn-approve" onClick={() => handleApproveCampaign(campaign.campaignId)} disabled={campaign.status !== 'pending'}>
                                ✓ Approve
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CLIPS TAB */}
            {activeTab === 'clips' && (
              <div className="ad-card">
                <div className="ad-card-header">
                  <h2 className="ad-card-title">🎬 All Clip Submissions</h2>
                </div>
                <div className="ad-clips-grid">
                  {clipData.map(clip => (
                    <div key={clip.clipId} className="ad-clip-card">
                      <div className="ad-clip-preview-area">
                        <div className="ad-clip-preview-inner">
                          <span className="ad-clip-preview-icon">🎬</span>
                          <span className="ad-clip-preview-text">Clip Preview</span>
                        </div>
                        <span className={`ad-clip-status-tag ${getStatusClass(clip.status)}`}>{clip.status}</span>
                      </div>
                      <div className="ad-clip-body">
                        <div className="ad-clip-top">
                          <h3 className="ad-clip-creator">{clip.creatorId}</h3>
                          <span className="ad-clip-platform-tag">{getPlatformIcon(clip.platform)} {clip.platform}</span>
                        </div>
                        <p className="ad-clip-campaign">{clip.campaignId}</p>
                        <div className="ad-clip-meta-row">
                          <span>👁️ {(clip.views || 0).toLocaleString()}</span>
                          <span>📅 {new Date(clip.createdAt).toLocaleDateString()}</span>
                        </div>
                        {clip.clipUrl && (
                          <a href={clip.clipUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#32CD32', fontSize: '0.85rem' }}>
                            🔗 View Original
                          </a>
                        )}
                        <div className="ad-clip-actions">
                          <button className="ad-btn-approve" onClick={() => handleApproveClip(clip.clipId)} disabled={clip.status === 'approved'}>
                            ✓ Approve
                          </button>
                          <button className="ad-btn-flag" onClick={() => handleFlagClip(clip.clipId)} disabled={clip.status === 'flagged'}>
                            ⚑ Flag
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {clipData.length === 0 && (
                    <p className="ad-empty-state">No clips submitted yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="ad-sidebar">
            <div className="ad-sidebar-widget">
              <h3 className="ad-widget-title">⚡ Quick Actions</h3>
              <div className="ad-quick-actions-grid">
                <button onClick={() => setActiveTab('campaigns')} className="ad-quick-action">
                  📋 Campaigns
                </button>
                <button onClick={() => setActiveTab('clips')} className="ad-quick-action">
                  🎬 Clips
                </button>
                <button onClick={() => { setActiveTab('campaigns'); }} className="ad-quick-action">
                  🔔 Pending ({pendingCampaigns})
                </button>
                <button onClick={() => { setActiveTab('clips'); }} className="ad-quick-action">
                  ⚠️ Flagged ({flaggedClips})
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

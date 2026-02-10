import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clipsAPI } from '../services/api';
import './admin.css';

const ClipReview = () => {
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clipsAPI.list({ limit: 50 })
      .then(data => setClips(data.clips || []))
      .catch(() => setClips([]))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (clipId) => {
    try {
      await clipsAPI.updateStatus(clipId, 'approved');
      setClips(prev => prev.map(c => c.clipId === clipId ? { ...c, status: 'approved' } : c));
    } catch {
      // stay silent
    }
  };

  const handleFlag = async (clipId) => {
    try {
      await clipsAPI.updateStatus(clipId, 'flagged');
      setClips(prev => prev.map(c => c.clipId === clipId ? { ...c, status: 'flagged' } : c));
    } catch {
      // stay silent
    }
  };

  const getPlatformIcon = (platform) => {
    const icons = { tiktok: '🎵', youtube: '▶️', instagram: '📷' };
    return icons[platform] || '🎬';
  };

  const getStatusClass = (status) => {
    const classes = { pending: 'badge-pending', approved: 'badge-approved', flagged: 'badge-flagged' };
    return classes[status] || 'badge-pending';
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
            <h1 className="admin-title">Clip Reviews</h1>
          </div>
        </div>

        <div className="clips-grid">
          {clips.map((clip) => (
            <div key={clip.clipId} className="clip-card">
              <div className="clip-preview">
                <div className="preview-placeholder">
                  <span className="preview-icon">🎬</span>
                  <span className="preview-text">Preview</span>
                </div>
                <span className={`clip-status ${getStatusClass(clip.status)}`}>{clip.status}</span>
              </div>

              <div className="clip-details">
                <div className="clip-header">
                  <h3 className="clip-creator">{clip.creatorId}</h3>
                  <span className="clip-platform">{getPlatformIcon(clip.platform)} {clip.platform}</span>
                </div>

                <p className="clip-campaign">{clip.campaignId}</p>

                <div className="clip-meta">
                  <span className="clip-views">👁️ {(clip.views || 0).toLocaleString()}</span>
                  <span className="clip-time">📅 {new Date(clip.createdAt).toLocaleDateString()}</span>
                </div>

                {clip.clipUrl && (
                  <a href={clip.clipUrl} target="_blank" rel="noopener noreferrer" className="clip-source">
                    🔗 View Original
                  </a>
                )}

                <div className="clip-actions">
                  <button className="btn-approve" onClick={() => handleApprove(clip.clipId)} disabled={clip.status === 'approved'}>
                    ✓ Approve
                  </button>
                  <button className="btn-flag" onClick={() => handleFlag(clip.clipId)} disabled={clip.status === 'flagged'}>
                    ⚑ Flag
                  </button>
                </div>
              </div>
            </div>
          ))}
          {clips.length === 0 && (
            <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>No clips to review.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClipReview;

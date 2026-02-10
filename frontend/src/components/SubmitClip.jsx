import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { clipsAPI, campaignsAPI } from '../services/api';
import './form.css';

const SubmitClip = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    campaignId: searchParams.get('campaign') || '',
    clipUrl: '',
    platform: 'tiktok',
    clipTimestamps: '',
    editDescription: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    campaignsAPI.list({ status: 'live', limit: 100 })
      .then(data => setCampaigns(data.campaigns))
      .catch(() => {});
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await clipsAPI.submit({
        campaignId: formData.campaignId,
        clipUrl: formData.clipUrl,
        platform: formData.platform,
        clipTimestamps: formData.clipTimestamps,
      });
      navigate('/creator/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to submit clip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-container">
        <div className="form-header">
          <h1 className="form-title">Submit Clip</h1>
          <p className="form-subtitle">Submit your clip link for a campaign</p>
        </div>

        {error && <div style={{ background: 'rgba(220,53,69,0.1)', color: '#dc3545', border: '1px solid rgba(220,53,69,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <form className="campaign-form" onSubmit={handleSubmit}>
          {/* Campaign Selection */}
          <div className="form-group">
            <label htmlFor="campaignId" className="form-label">
              Campaign <span className="required">*</span>
            </label>
            <select
              id="campaignId"
              name="campaignId"
              className="form-input"
              value={formData.campaignId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a campaign</option>
              {campaigns.map(c => (
                <option key={c.campaignId} value={c.campaignId}>{c.title} (CPM: ${c.CPM})</option>
              ))}
            </select>
          </div>

          {/* Platform */}
          <div className="form-group">
            <label htmlFor="platform" className="form-label">
              Platform <span className="required">*</span>
            </label>
            <select
              id="platform"
              name="platform"
              className="form-input"
              value={formData.platform}
              onChange={handleInputChange}
              required
            >
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>

          {/* Clip URL */}
          <div className="form-group">
            <label htmlFor="clipUrl" className="form-label">
              Clip URL <span className="required">*</span>
            </label>
            <input
              type="url"
              id="clipUrl"
              name="clipUrl"
              className="form-input"
              placeholder="https://tiktok.com/@user/video/123"
              value={formData.clipUrl}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Timestamp Used */}
          <div className="form-group">
            <label htmlFor="clipTimestamps" className="form-label">
              Timestamp Used <span className="required">*</span>
            </label>
            <input
              type="text"
              id="clipTimestamps"
              name="clipTimestamps"
              className="form-input"
              placeholder="e.g., 00:15-00:45"
              value={formData.clipTimestamps}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Edit Description */}
          <div className="form-group">
            <label htmlFor="editDescription" className="form-label">
              Edit Description
            </label>
            <textarea
              id="editDescription"
              name="editDescription"
              className="form-textarea"
              placeholder="Describe any edits or modifications you made to the clip"
              rows="5"
              value={formData.editDescription}
              onChange={handleInputChange}
            />
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Clip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitClip;

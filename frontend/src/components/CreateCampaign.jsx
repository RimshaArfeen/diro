import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignsAPI } from '../services/api';
import './form.css';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalViews: '',
    cpm: '',
    totalBudget: '',
    minViewsForPayout: '',
  });
  const [sourceVideoUrls, setSourceVideoUrls] = useState(['']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVideoUrlChange = (index, value) => {
    const updated = [...sourceVideoUrls];
    updated[index] = value;
    setSourceVideoUrls(updated);
  };

  const addVideoUrl = () => {
    setSourceVideoUrls((prev) => [...prev, '']);
  };

  const removeVideoUrl = (index) => {
    setSourceVideoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const sourceVideos = sourceVideoUrls.filter(url => url.trim());
    if (sourceVideos.length === 0) {
      setError('At least one source video URL is required');
      setLoading(false);
      return;
    }

    try {
      await campaignsAPI.create({
        title: formData.title,
        description: formData.description,
        sourceVideos,
        goalViews: parseInt(formData.goalViews),
        CPM: parseFloat(formData.cpm),
        deposit: parseFloat(formData.totalBudget),
        minViewsForPayout: parseInt(formData.minViewsForPayout) || 0,
      });
      navigate('/brand/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-container">
        <div className="form-header">
          <h1 className="form-title">Create New Campaign</h1>
          <p className="form-subtitle">Fill in the details to launch your campaign</p>
        </div>

        {error && <div style={{ background: 'rgba(220,53,69,0.1)', color: '#dc3545', border: '1px solid rgba(220,53,69,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <form className="campaign-form" onSubmit={handleSubmit}>
          {/* Campaign Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Campaign Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              placeholder="Enter campaign title (min 5 characters)"
              value={formData.title}
              onChange={handleInputChange}
              required
              minLength={5}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              placeholder="Describe your campaign goals and requirements (min 10 characters)"
              rows="5"
              value={formData.description}
              onChange={handleInputChange}
              required
              minLength={10}
            />
          </div>

          {/* Source Video URLs */}
          <div className="form-group">
            <label className="form-label">
              Source Video URLs <span className="required">*</span>
            </label>
            {sourceVideoUrls.map((url, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/video"
                  value={url}
                  onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                  style={{ flex: 1 }}
                />
                {sourceVideoUrls.length > 1 && (
                  <button type="button" onClick={() => removeVideoUrl(index)} style={{ padding: '0 0.75rem', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '8px', background: 'transparent' }}>
                    X
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addVideoUrl} style={{ cursor: 'pointer', color: '#32CD32', background: 'none', border: 'none', fontSize: '0.875rem' }}>
              + Add another video URL
            </button>
          </div>

          {/* Goal Views */}
          <div className="form-group">
            <label htmlFor="goalViews" className="form-label">
              Goal Views <span className="required">*</span>
            </label>
            <input
              type="number"
              id="goalViews"
              name="goalViews"
              className="form-input"
              placeholder="e.g., 10000"
              value={formData.goalViews}
              onChange={handleInputChange}
              min="1"
              required
            />
          </div>

          {/* CPM */}
          <div className="form-group">
            <label htmlFor="cpm" className="form-label">
              CPM (Cost Per Mille) <span className="required">*</span>
            </label>
            <div className="input-with-prefix">
              <span className="input-prefix">$</span>
              <input
                type="number"
                id="cpm"
                name="cpm"
                className="form-input"
                placeholder="0.00"
                value={formData.cpm}
                onChange={handleInputChange}
                min="0.01"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Total Budget (Deposit) */}
          <div className="form-group">
            <label htmlFor="totalBudget" className="form-label">
              Total Budget (Deposit) <span className="required">*</span>
            </label>
            <div className="input-with-prefix">
              <span className="input-prefix">$</span>
              <input
                type="number"
                id="totalBudget"
                name="totalBudget"
                className="form-input"
                placeholder="0.00"
                value={formData.totalBudget}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            {formData.goalViews && formData.cpm && (
              <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                Minimum deposit needed: ${((parseInt(formData.goalViews) / 1000) * parseFloat(formData.cpm)).toFixed(2)}
              </p>
            )}
          </div>

          {/* Min Views for Payout */}
          <div className="form-group">
            <label htmlFor="minViewsForPayout" className="form-label">
              Minimum Views for Creator Payout
            </label>
            <input
              type="number"
              id="minViewsForPayout"
              name="minViewsForPayout"
              className="form-input"
              placeholder="e.g., 1000 (0 = no minimum)"
              value={formData.minViewsForPayout}
              onChange={handleInputChange}
              min="0"
            />
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;

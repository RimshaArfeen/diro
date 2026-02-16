import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { campaignsAPI } from '../services/api'
import { FiPlus, FiTrendingUp, FiDollarSign, FiBarChart2, FiSettings, FiMessageCircle, FiHelpCircle, FiLifeBuoy, FiLogOut, FiX, FiPaperclip } from 'react-icons/fi'
import './Dashboard.css'
import './BrandDashboard.css'

const MIN_CPM = 0.50

function BrandDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
  }, [user, navigate])

  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const [showForm, setShowForm] = useState(false)
  const [showPerformance, setShowPerformance] = useState(false)
  const [showBudget, setShowBudget] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', cpm: '', budget: '', goal: '', videos: [] })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Load campaigns from API
  useEffect(() => {
    if (!user) return
    campaignsAPI.list()
      .then((data) => {
        const mapped = (data.campaigns || []).map(c => ({
          id: c.campaignId || c._id,
          title: c.title,
          description: c.description,
          cpm: c.CPM || 0,
          budget: c.deposit || 0,
          goal: c.goalViews ? `${c.goalViews.toLocaleString()} views` : '',
          videos: c.sourceVideos || [],
          status: c.status === 'live' ? 'Active' : c.status === 'pending' ? 'Pending Approval' : c.status === 'completed' ? 'Completed' : c.status,
          views: 0,
          clicks: 0,
          spend: 0,
          remaining: c.deposit || 0,
          createdAt: new Date(c.createdAt).getTime(),
        }))
        setCampaigns(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    const handle = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).map(f => ({ name: f.name, size: f.size, type: f.type }))
    setForm(p => ({ ...p, videos: [...p.videos, ...files] }))
  }

  const removeVideo = (i) => setForm(p => ({ ...p, videos: p.videos.filter((_, idx) => idx !== i) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    // Frontend validation
    if (!form.title.trim() || !form.description.trim() || !form.cpm || !form.goal.trim()) {
      setFormError('All required fields must be filled'); return
    }
    if (form.title.trim().length < 5) {
      setFormError('Campaign title must be at least 5 characters'); return
    }
    if (form.description.trim().length < 10) {
      setFormError('Description must be at least 10 characters'); return
    }
    if (Number(form.cpm) < MIN_CPM) {
      setFormError(`CPM cannot be below $${MIN_CPM.toFixed(2)}`); return
    }
    if (!form.budget || Number(form.budget) <= 0) {
      setFormError('Budget must be greater than 0'); return
    }

    // Check if budget covers the goal
    const goalViews = parseInt(form.goal.replace(/\D/g, '')) || 100000
    const cpm = Number(form.cpm)
    const budget = Number(form.budget)
    const requiredBudget = (goalViews / 1000) * cpm
    if (budget < requiredBudget) {
      setFormError(`Budget ($${budget}) must cover goal views cost ($${requiredBudget.toFixed(2)}). Either increase budget or reduce goal/CPM.`); return
    }

    setSubmitting(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        CPM: cpm,
        deposit: budget,
        goalViews: goalViews,
        sourceVideos: form.videos.length > 0 ? form.videos.map(v => v.name) : ['default-video.mp4'],
        minViewsForPayout: 5000,
      }
      const data = await campaignsAPI.create(payload)
      const c = data.campaign
      setCampaigns(prev => [{
        id: c.campaignId || c._id,
        title: c.title,
        description: c.description,
        cpm: c.CPM || 0,
        budget: c.deposit || 0,
        goal: c.goalViews ? `${c.goalViews.toLocaleString()} views` : '',
        videos: c.sourceVideos || [],
        status: 'Pending Approval',
        views: 0, clicks: 0, spend: 0,
        remaining: c.deposit || 0,
        createdAt: new Date(c.createdAt).getTime(),
      }, ...prev])
      setForm({ title: '', description: '', cpm: '', budget: '', goal: '', videos: [] })
      setShowForm(false)
    } catch (err) {
      setFormError(err.message || 'Failed to create campaign')
    } finally {
      setSubmitting(false)
    }
  }

  const totalViews = campaigns.reduce((s, c) => s + (c.views || 0), 0)
  const totalSpend = campaigns.reduce((s, c) => s + (c.spend || 0), 0)
  const totalBudget = campaigns.reduce((s, c) => s + (c.budget || 0), 0)
  const activeCamps = campaigns.filter(c => c.status === 'Active').length

  if (!user) return null

  const statusClass = (s) => s.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="dash">
      <nav className="dash-nav">
        <Link to="/brand-dashboard" className="dash-logo">CLYPZY <span className="dash-beta brand-beta">BRAND</span></Link>
        <div className="dash-tabs">
          <span className="dash-tab active"><span className="tab-icon"><FiBarChart2 size={14} /></span> Dashboard</span>
        </div>
        <div className="dash-user" ref={profileRef}>
          <button className="dash-avatar" onClick={() => setProfileOpen(!profileOpen)}>
            {user.name?.charAt(0).toUpperCase()}
          </button>
          {profileOpen && (
            <div className="profile-dropdown">
              <div className="pd-header">
                <span className="pd-badge">BRAND</span>
                <p className="pd-name">{user?.name}</p>
                <p className="pd-email">{user?.email}</p>
              </div>
              <div className="pd-divider" />
              <Link to="/brand-settings" className="pd-item" onClick={() => setProfileOpen(false)}>
                <FiSettings size={14} /> Settings
              </Link>
              <div className="pd-divider" />
              <a href="#" className="pd-item"><FiMessageCircle size={14} /> Discord <span className="pd-arrow">↗</span></a>
              <a href="#" className="pd-item"><FiHelpCircle size={14} /> Give feedback <span className="pd-arrow">↗</span></a>
              <a href="#" className="pd-item"><FiLifeBuoy size={14} /> Support <span className="pd-arrow">↗</span></a>
              <button className="pd-item pd-logout" onClick={logout}><FiLogOut size={14} /> Log out</button>
              <div className="pd-divider" />
              <div className="pd-footer">
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Clipper Terms</a>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="dash-main">
        {/* Permission Warning Banner */}
        {!user?.canCreateCampaign && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{ fontSize: '1.3rem' }}>🔒</span>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: '#92400e', fontSize: '0.9rem' }}>
                Campaign Creation Restricted
              </p>
              <p style={{ margin: '4px 0 0', color: '#a16207', fontSize: '0.84rem' }}>
                Your account is not authorized to create campaigns. Please contact admin for approval.
              </p>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="dash-actions">
          <div
            className="action-card"
            onClick={() => user?.canCreateCampaign && setShowForm(true)}
            style={!user?.canCreateCampaign ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <div className="action-icon"><FiPlus size={24} /></div>
            <h3 className="action-title">Create campaign</h3>
            <p className="action-desc">
              {user?.canCreateCampaign
                ? 'Launch a new clipping campaign for creators.'
                : 'Permission required — contact admin.'}
            </p>
          </div>
          <div className="action-card" onClick={() => setShowPerformance(true)}>
            <div className="action-icon"><FiTrendingUp size={24} /></div>
            <h3 className="action-title">Performance</h3>
            <p className="action-desc">Track views, clicks, and spend across campaigns.</p>
          </div>
          <div className="action-card" onClick={() => setShowBudget(true)}>
            <div className="action-icon"><FiDollarSign size={24} /></div>
            <h3 className="action-title">Budget</h3>
            <p className="action-desc">Manage deposits and remaining budgets.</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="dash-stats-section">
          <div className="stats-header">
            <div>
              <h2 className="stats-heading">Overview</h2>
              <p className="stats-sub">Campaign performance at a glance</p>
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-box-label">Campaigns</span>
              <span className="stat-box-value">{campaigns.length}</span>
            </div>
            <div className="stat-box">
              <span className="stat-box-label">Active</span>
              <span className="stat-box-value">{activeCamps}</span>
            </div>
            <div className="stat-box">
              <span className="stat-box-label">Total Views</span>
              <span className="stat-box-value">{totalViews.toLocaleString()}</span>
            </div>
            <div className="stat-box">
              <span className="stat-box-label">Total Spend</span>
              <span className="stat-box-value">${totalSpend.toFixed(2)}</span>
            </div>
            <div className="stat-box">
              <span className="stat-box-label">Total Budget</span>
              <span className="stat-box-value">${totalBudget.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="dash-campaigns" style={{ marginTop: 40 }}>
          <div className="bc-list-header">
            <h2 className="campaigns-heading">My campaigns</h2>
            <button
              className="bc-new-btn"
              onClick={() => user?.canCreateCampaign && setShowForm(true)}
              disabled={!user?.canCreateCampaign}
              style={!user?.canCreateCampaign ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              title={!user?.canCreateCampaign ? 'Permission required — contact admin' : 'Create a new campaign'}
            >
              <FiPlus size={14} /> New campaign
            </button>
          </div>

          {loading ? (
            <div className="no-campaigns-box">
              <p className="no-campaigns-desc">Loading campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="no-campaigns-box">
              <h3 className="no-campaigns-title">No campaigns yet</h3>
              <p className="no-campaigns-desc">Create your first campaign to start<br />getting clips from creators.</p>
              <button
                className="find-campaigns-btn"
                onClick={() => user?.canCreateCampaign && setShowForm(true)}
                disabled={!user?.canCreateCampaign}
                style={!user?.canCreateCampaign ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                {user?.canCreateCampaign ? 'Create campaign' : 'Permission required'}
              </button>
            </div>
          ) : (
            <div className="bc-list">
              {campaigns.map(c => (
                <div className="bc-card" key={c.id}>
                  <div className="bc-card-top">
                    <div>
                      <h3 className="bc-title">{c.title}</h3>
                      <span className="bc-date">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`bc-status bc-s-${statusClass(c.status)}`}>{c.status}</span>
                  </div>
                  <p className="bc-desc">{c.description}</p>

                  <div className="bc-metrics">
                    <div className="bc-metric">
                      <span className="bc-metric-val">${c.cpm.toFixed(2)}</span>
                      <span className="bc-metric-lbl">CPM</span>
                    </div>
                    <div className="bc-metric">
                      <span className="bc-metric-val">${c.budget.toFixed(2)}</span>
                      <span className="bc-metric-lbl">Budget</span>
                    </div>
                    <div className="bc-metric">
                      <span className="bc-metric-val">${(c.remaining ?? c.budget).toFixed(2)}</span>
                      <span className="bc-metric-lbl">Remaining</span>
                    </div>
                    <div className="bc-metric">
                      <span className="bc-metric-val">{(c.views || 0).toLocaleString()}</span>
                      <span className="bc-metric-lbl">Views</span>
                    </div>
                    <div className="bc-metric">
                      <span className="bc-metric-val">{(c.clicks || 0).toLocaleString()}</span>
                      <span className="bc-metric-lbl">Clicks</span>
                    </div>
                    <div className="bc-metric">
                      <span className="bc-metric-val">${(c.spend || 0).toFixed(2)}</span>
                      <span className="bc-metric-lbl">Spend</span>
                    </div>
                  </div>

                  {c.videos?.length > 0 && (
                    <div className="bc-videos"><FiPaperclip size={14} /> {c.videos.length} source video{c.videos.length > 1 ? 's' : ''}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Campaign Modal — only render if brand has permission */}
      {showForm && user?.canCreateCampaign && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowForm(false)}><FiX /></button>
            <h2 className="modal-title">Create campaign</h2>
            <p className="modal-desc">Set up a new campaign for creators to clip.</p>
            {formError && <div className="bc-form-error">{formError}</div>}
            <form onSubmit={handleSubmit} className="bc-form">
              <div className="bc-field">
                <label>Campaign title *</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Epic Gaming Highlights" />
                <small style={{ color: '#888', fontSize: '0.85rem', marginTop: 4, display: 'block' }}>Minimum 5 characters</small>
              </div>
              <div className="bc-field">
                <label>Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe what creators should clip..." rows={3} />
                <small style={{ color: '#888', fontSize: '0.85rem', marginTop: 4, display: 'block' }}>Minimum 10 characters</small>
              </div>
              <div className="bc-field-row">
                <div className="bc-field">
                  <label>CPM rate ($) *</label>
                  <input name="cpm" type="number" step="0.01" min={MIN_CPM} value={form.cpm} onChange={handleChange} placeholder={`Min $${MIN_CPM.toFixed(2)}`} />
                  <small style={{ color: '#888', fontSize: '0.85rem', marginTop: 4, display: 'block' }}>Cost per 1000 views</small>
                </div>
                <div className="bc-field">
                  <label>Total budget ($) *</label>
                  <input name="budget" type="number" step="0.01" min="1" value={form.budget} onChange={handleChange} placeholder="e.g. 5000" />
                  <small style={{ color: '#888', fontSize: '0.85rem', marginTop: 4, display: 'block' }}>Total campaign deposit</small>
                </div>
              </div>
              <div className="bc-field">
                <label>Goal *</label>
                <input name="goal" value={form.goal} onChange={handleChange} placeholder="e.g. 1000000 views" />
                <small style={{ color: '#888', fontSize: '0.85rem', marginTop: 4, display: 'block' }}>Target views for campaign</small>
              </div>
              {form.cpm && form.goal && (
                <div style={{ padding: '12px', background: '#f7f9fc', borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: 4 }}>Budget Calculator:</div>
                  <div style={{ fontSize: '0.9rem', color: '#333' }}>
                    Required budget: <strong>${((parseInt(form.goal.replace(/\D/g, '')) || 0) / 1000 * Number(form.cpm)).toFixed(2)}</strong>
                  </div>
                  {form.budget && Number(form.budget) < ((parseInt(form.goal.replace(/\D/g, '')) || 0) / 1000 * Number(form.cpm)) && (
                    <div style={{ fontSize: '0.85rem', color: '#e53e3e', marginTop: 4 }}>
                      ⚠️ Budget is insufficient for goal views
                    </div>
                  )}
                </div>
              )}
              <div className="bc-field">
                <label>Source videos</label>
                <input type="file" accept="video/*" multiple onChange={handleFileChange} className="bc-file-input" />
                {form.videos.length > 0 && (
                  <div className="bc-video-list">
                    {form.videos.map((v, i) => (
                      <div className="bc-video-item" key={i}>
                        <span><FiPaperclip size={12} /> {v.name}</span>
                        <button type="button" onClick={() => removeVideo(i)}><FiX size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="cd-join-btn" style={{ marginTop: 8 }} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create campaign'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Performance Modal */}
      {showPerformance && (
        <div className="modal-overlay" onClick={() => setShowPerformance(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <button className="modal-close" onClick={() => setShowPerformance(false)}><FiX /></button>
            <h2 className="modal-title">Performance Analytics</h2>
            <p className="modal-desc">Track views, clicks, and spend across all campaigns.</p>

            <div style={{ marginTop: 24 }}>
              <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-box">
                  <span className="stat-box-label">Total Views</span>
                  <span className="stat-box-value">{totalViews.toLocaleString()}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-box-label">Total Spend</span>
                  <span className="stat-box-value">${totalSpend.toFixed(2)}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-box-label">Avg CPM</span>
                  <span className="stat-box-value">${totalViews > 0 ? ((totalSpend / totalViews) * 1000).toFixed(2) : '0.00'}</span>
                </div>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, color: '#1a1a1a' }}>Campaign Breakdown</h3>
              {campaigns.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#666' }}>
                  No campaigns yet. Create your first campaign to see performance data.
                </div>
              ) : (
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {campaigns.map(c => (
                    <div key={c.id} style={{ padding: 16, background: '#f7f9fc', borderRadius: 8, marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>{c.title}</h4>
                          <span style={{ fontSize: '0.85rem', color: '#666' }}>{c.status}</span>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>${c.cpm.toFixed(2)} CPM</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 2 }}>Views</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a' }}>{(c.views || 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 2 }}>Clicks</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a' }}>{(c.clicks || 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 2 }}>Spend</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a' }}>${(c.spend || 0).toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudget && (
        <div className="modal-overlay" onClick={() => setShowBudget(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <button className="modal-close" onClick={() => setShowBudget(false)}><FiX /></button>
            <h2 className="modal-title">Budget Management</h2>
            <p className="modal-desc">Manage deposits and remaining budgets across campaigns.</p>

            <div style={{ marginTop: 24 }}>
              <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-box">
                  <span className="stat-box-label">Total Budget</span>
                  <span className="stat-box-value">${totalBudget.toFixed(2)}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-box-label">Total Spent</span>
                  <span className="stat-box-value">${totalSpend.toFixed(2)}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-box-label">Remaining</span>
                  <span className="stat-box-value" style={{ color: '#10b981' }}>${(totalBudget - totalSpend).toFixed(2)}</span>
                </div>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, color: '#1a1a1a' }}>Budget by Campaign</h3>
              {campaigns.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#666' }}>
                  No campaigns yet. Create your first campaign to manage budgets.
                </div>
              ) : (
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {campaigns.map(c => {
                    const remaining = c.remaining ?? c.budget
                    const spent = c.spend || 0
                    const percentUsed = c.budget > 0 ? (spent / c.budget) * 100 : 0
                    return (
                      <div key={c.id} style={{ padding: 16, background: '#f7f9fc', borderRadius: 8, marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>{c.title}</h4>
                            <span style={{ fontSize: '0.85rem', color: '#666' }}>{c.status}</span>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 2 }}>Budget</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a' }}>${c.budget.toFixed(2)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 2 }}>Spent</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a' }}>${spent.toFixed(2)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 2 }}>Remaining</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#10b981' }}>${remaining.toFixed(2)}</div>
                          </div>
                        </div>
                        <div style={{ width: '100%', height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(percentUsed, 100)}%`, height: '100%', background: percentUsed > 90 ? '#ef4444' : percentUsed > 70 ? '#f59e0b' : '#10b981', transition: 'width 0.3s' }} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 6 }}>
                          {percentUsed.toFixed(1)}% used
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BrandDashboard

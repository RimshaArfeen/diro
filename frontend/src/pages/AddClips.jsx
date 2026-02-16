import { useState } from 'react'
import { Link } from 'react-router-dom'
import DashNav from '../components/DashNav'
import { useCampaigns } from '../context/CampaignContext'
import { useAuth } from '../context/AuthContext'
import { usersAPI } from '../services/api'
import { FiLink, FiAlertCircle, FiCheck, FiPlus, FiX, FiClipboard, FiUpload, FiAward } from 'react-icons/fi'
import { SiInstagram, SiTiktok, SiYoutube } from 'react-icons/si'
import './Dashboard.css'
import './AddClips.css'

const PLATFORM_CONFIG = [
  { key: 'instagram', label: 'Instagram', icon: SiInstagram },
  { key: 'tiktok', label: 'TikTok', icon: SiTiktok },
  { key: 'youtube', label: 'YouTube', icon: SiYoutube },
]

function AddClips() {
  const {
    campaigns, joinedCampaigns, clips,
    submitClip,
  } = useCampaigns()
  const { user, updateUser } = useAuth()

  // Derive connected accounts from user.socialAccounts (backend)
  const socialAccounts = user?.socialAccounts || {}
  const connectedAccounts = PLATFORM_CONFIG
    .filter(p => socialAccounts[p.key] && socialAccounts[p.key] !== '')
    .map(p => p.key)

  // Social connect state
  const [connectingPlatform, setConnectingPlatform] = useState(null)
  const [socialInput, setSocialInput] = useState('')
  const [socialSaving, setSocialSaving] = useState(false)
  const [socialError, setSocialError] = useState('')

  const connectAccount = async (platform) => {
    if (!socialInput.trim()) return
    setSocialSaving(true)
    setSocialError('')
    try {
      const data = await usersAPI.linkSocial(platform, socialInput.trim())
      updateUser({ socialAccounts: data.user.socialAccounts })
    } catch (err) {
      setSocialError(err.message || 'Failed to connect account')
    }
    setSocialSaving(false)
    setConnectingPlatform(null)
    setSocialInput('')
  }

  const disconnectAccount = async (platform) => {
    setSocialSaving(true)
    setSocialError('')
    try {
      const data = await usersAPI.linkSocial(platform, '')
      updateUser({ socialAccounts: data.user.socialAccounts })
    } catch (err) {
      setSocialError(err.message || 'Failed to disconnect account')
    }
    setSocialSaving(false)
  }

  const [submitModal, setSubmitModal] = useState(null)
  const [link, setLink] = useState('')
  const [showConnect, setShowConnect] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Only show joined campaigns that are still live/active
  const joinedCamps = campaigns.filter(c => joinedCampaigns.includes(c.id) && c.status === 'Active')

  const handleSubmit = async () => {
    if (!link.trim()) return
    setSubmitError('')
    setSubmitting(true)
    try {
      await submitClip(submitModal, link.trim())
      setLink('')
      setSubmitModal(null)
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit clip')
    } finally {
      setSubmitting(false)
    }
  }

  const getCampaignClips = (campId) => clips.filter(c => c.campaignId === campId)

  const getTodayClips = (campId) => {
    const today = new Date().toDateString()
    return clips.filter(c => c.campaignId === campId && new Date(c.submittedAt).toDateString() === today)
  }

  return (
    <div className="dash">
      <DashNav active="clips" />
      <main className="dash-main">
        <div className="clips-notice">
          <span className="notice-icon"><FiAlertCircle size={18} /></span>
          <div>
            <p className="notice-bold">Submit clips as soon as you post them.</p>
            <p className="notice-sub">Views gained before submission do not count toward payouts.</p>
          </div>
        </div>

        <div className="my-campaigns-header">
          <h2 className="stats-heading">My campaigns</h2>
          <span className="updated-label">Updated just now</span>
        </div>

        {joinedCamps.length === 0 ? (
          <div className="no-campaigns-box">
            <h3 className="no-campaigns-title">No active campaigns</h3>
            <p className="no-campaigns-desc">Browse listings to make clips<br />for creators and brands.</p>
            <Link to="/dashboard" className="find-campaigns-btn">Find campaigns</Link>
          </div>
        ) : (
          <div className="joined-campaigns-list">
            {joinedCamps.map(camp => {
              const campClips = getCampaignClips(camp.id)
              const earned = campClips.reduce((s, c) => s + (c.earnings || 0), 0)
              const views = campClips.reduce((s, c) => s + c.views, 0)
              const pending = campClips.filter(c => c.status === 'pending').length
              const approved = campClips.filter(c => c.status === 'approved').length

              return (
                <div className="joined-campaign-card" key={camp.id}>
                  <div className="jc-header">
                    <div className="camp-avatar-placeholder">{camp.name?.charAt(0).toUpperCase() || 'C'}</div>
                    <div className="jc-info">
                      <span className="jc-name">{camp.name} <span className="camp-verified"><FiCheck size={10} /></span></span>
                      <span className="jc-title">{camp.title}</span>
                    </div>
                    <span className="jc-status">{camp.status}</span>
                  </div>

                  <div className="jc-stats-bar">
                    <div className="jc-stat">
                      <span className="jc-stat-value">${earned.toFixed(2)}</span>
                      <span className="jc-stat-label">Earned</span>
                    </div>
                    <div className="jc-stat">
                      <span className="jc-stat-value">{views.toLocaleString()}</span>
                      <span className="jc-stat-label">Views</span>
                    </div>
                    <div className="jc-stat">
                      <span className="jc-stat-value">{camp.endsIn}</span>
                      <span className="jc-stat-label">Status</span>
                    </div>
                    <div className="jc-rate">
                      <span>Earn ${camp.cpm.toFixed(2)} per 1,000 views</span>
                      <span className="jc-min">Min. views per post: {camp.minViews.toLocaleString()}</span>
                    </div>
                    <button
                      className="jc-submit-btn"
                      onClick={() => {
                        if (connectedAccounts.length === 0) {
                          setShowConnect(true)
                        } else {
                          setSubmitModal(camp.id)
                        }
                      }}
                    >
                      Submit post
                    </button>
                  </div>

                  <div className="jc-cards">
                    <div className="jc-card">
                      <div className="jc-card-header">
                        <span><FiClipboard size={14} style={{ marginRight: 6 }} />Directions and content</span>
                      </div>
                    </div>
                    <div className="jc-card">
                      <div className="jc-card-header">
                        <span><FiUpload size={14} style={{ marginRight: 6 }} />My posts ({campClips.length})</span>
                      </div>
                      <div className="jc-card-tags">
                        <span className="jc-tag">{pending} Pending</span>
                        <span className="jc-tag">{approved} Approved</span>
                      </div>
                    </div>
                    <div className="jc-card">
                      <div className="jc-card-header">
                        <span><FiAward size={14} style={{ marginRight: 6 }} />Campaign leaderboard</span>
                      </div>
                      <div className="jc-card-tabs">
                        <span className="jc-mini-tab">Posts</span>
                        <span className="jc-mini-tab">Views</span>
                        <span className="jc-mini-tab">Earnings</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ===== Submit Post Modal ===== */}
      {submitModal && (
        <div className="modal-overlay" onClick={() => { setSubmitModal(null); setLink(''); setSubmitError('') }}>
          <div className="modal-content modal-sm" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setSubmitModal(null); setLink(''); setSubmitError('') }}><FiX /></button>
            <div className="sp-header">
              <h2 className="modal-title">Submit post</h2>
              <span className="sp-limit">Daily limit: {getTodayClips(submitModal).length}/10</span>
            </div>
            <p className="modal-desc">Link your Instagram, YouTube, TikTok post</p>
            {submitError && <div className="bc-form-error">{submitError}</div>}
            <div className="sp-input-wrap">
              <span className="sp-link-icon"><FiLink size={16} /></span>
              <input
                className="sp-input"
                placeholder="Paste link"
                value={link}
                onChange={e => setLink(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                autoFocus
              />
            </div>
            <div className="sp-tip">
              <span className="sp-tip-icon"><FiAlertCircle size={16} /></span>
              <div>
                <p className="notice-bold">Submit clips as soon as you post them.</p>
                <p className="notice-sub">Views gained before submission do not count toward payouts.</p>
              </div>
            </div>
            <button
              className="cd-join-btn"
              onClick={handleSubmit}
              disabled={!link.trim() || submitting}
              style={{ marginTop: 16 }}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      )}

      {/* ===== Connect Accounts Modal ===== */}
      {showConnect && (
        <div className="modal-overlay" onClick={() => { setShowConnect(false); setConnectingPlatform(null); setSocialInput(''); setSocialError('') }}>
          <div className="modal-content modal-sm" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setShowConnect(false); setConnectingPlatform(null); setSocialInput(''); setSocialError('') }}><FiX /></button>
            <h2 className="modal-title">Connect accounts</h2>
            <p className="modal-desc">Link the social media accounts where you post content.</p>
            {socialError && <p style={{ color: '#e53e3e', fontSize: '0.82rem', margin: '8px 0' }}>{socialError}</p>}
            <div className="connect-list">
              {PLATFORM_CONFIG.map(p => {
                const Icon = p.icon
                const isConnected = connectedAccounts.includes(p.key)
                return (
                  <div className="connect-row" key={p.key}>
                    <span className="connect-icon"><Icon size={18} /></span>
                    <span className="connect-platform">
                      {isConnected ? `${p.label}: @${socialAccounts[p.key]}` : `Connect ${p.label}`}
                    </span>
                    {connectingPlatform === p.key ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input
                          style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #333', background: '#1a1a2e', color: '#fff', fontSize: '0.85rem', width: 120 }}
                          placeholder="username"
                          value={socialInput}
                          onChange={e => setSocialInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && connectAccount(p.key)}
                          autoFocus
                        />
                        <button className="connect-toggle connected" onClick={() => connectAccount(p.key)} disabled={socialSaving}><FiCheck size={14} /></button>
                        <button className="connect-toggle" onClick={() => { setConnectingPlatform(null); setSocialInput('') }}><FiX size={14} /></button>
                      </div>
                    ) : isConnected ? (
                      <button className="connect-toggle connected" onClick={() => disconnectAccount(p.key)} disabled={socialSaving}><FiCheck size={16} /></button>
                    ) : (
                      <button className="connect-toggle" onClick={() => { setConnectingPlatform(p.key); setSocialError('') }}><FiPlus size={16} /></button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddClips

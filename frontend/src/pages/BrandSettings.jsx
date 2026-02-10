import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usersAPI } from '../services/api'
import { FiBarChart2, FiSettings, FiMessageCircle, FiHelpCircle, FiLifeBuoy, FiLogOut, FiImage, FiEdit2, FiLink, FiTag, FiPlus, FiAlertTriangle, FiTrash2, FiCreditCard, FiCheck } from 'react-icons/fi'
import './Dashboard.css'
import './Settings.css'

const SETTINGS_KEY = 'diro_brand_settings'

const sidebarSections = [
  'Brand profile',
  'Campaign defaults',
  'Notifications',
  'Billing',
  'Security',
  'Close account',
]

function BrandSettings() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  // Access control
  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  // Brand profile state from user data
  const [companyName, setCompanyName] = useState(user?.name || '')
  const [businessEmail, setBusinessEmail] = useState(user?.email || '')
  const [website, setWebsite] = useState('')
  const [industry, setIndustry] = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const verified = false
  const [saving, setSaving] = useState(false)

  // Brand settings state from localStorage
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })

  const [defaultCpm, setDefaultCpm] = useState(settings.defaultCpm || '5.00')
  const [defaultGoal, setDefaultGoal] = useState(settings.defaultGoal || '1000000')
  const [notifNewCreators, setNotifNewCreators] = useState(settings.notifNewCreators ?? true)
  const [notifCampaignUpdates, setNotifCampaignUpdates] = useState(settings.notifCampaignUpdates ?? true)
  const [notifBudgetAlerts, setNotifBudgetAlerts] = useState(settings.notifBudgetAlerts ?? true)

  // Change password mock
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')

  const [activeSection, setActiveSection] = useState('Brand profile')
  const [editing, setEditing] = useState(null)

  // Profile dropdown on nav
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const handle = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // Persist settings (local preferences only)
  useEffect(() => {
    const data = { defaultCpm, defaultGoal, notifNewCreators, notifCampaignUpdates, notifBudgetAlerts }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data))
  }, [defaultCpm, defaultGoal, notifNewCreators, notifCampaignUpdates, notifBudgetAlerts])

  const saveCompanyName = async () => {
    setSaving(true)
    try {
      await usersAPI.updateProfile({ name: companyName })
      updateUser({ name: companyName })
    } catch {}
    setSaving(false)
    setEditing(null)
  }
  const saveBusinessEmail = () => { setEditing(null) }
  const saveWebsite = () => { setEditing(null) }
  const saveIndustry = () => { setEditing(null) }
  const saveCpmGoal = () => { setEditing(null) }

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setLogoPreview(ev.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handlePasswordChange = (e) => {
    e.preventDefault()
    setPwMsg('Password change is not available yet.')
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete your brand account? This cannot be undone.')) {
      localStorage.removeItem(SETTINGS_KEY)
      logout()
      navigate('/')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const scrollTo = (id) => {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="dash">
      <nav className="dash-nav">
        <Link to="/brand-dashboard" className="dash-logo">DIRO <span className="dash-beta brand-beta">BRAND</span></Link>
        <div className="dash-tabs">
          <Link to="/brand-dashboard" className="dash-tab"><span className="tab-icon"><FiBarChart2 size={14} /></span> Dashboard</Link>
          <span className="dash-tab active"><span className="tab-icon"><FiSettings size={14} /></span> Settings</span>
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
              <Link to="/brand-settings" className="pd-item" onClick={() => setProfileOpen(false)}><FiSettings size={14} /> Settings</Link>
              <div className="pd-divider" />
              <a href="#" className="pd-item"><FiMessageCircle size={14} /> Discord <span className="pd-arrow">↗</span></a>
              <a href="#" className="pd-item"><FiHelpCircle size={14} /> Give feedback <span className="pd-arrow">↗</span></a>
              <a href="#" className="pd-item"><FiLifeBuoy size={14} /> Support <span className="pd-arrow">↗</span></a>
              <button className="pd-item pd-logout" onClick={handleLogout}><FiLogOut size={14} /> Log out</button>
              <div className="pd-divider" />
              <div className="pd-footer">
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Brand Terms</a>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="settings-page">
        <div className="settings-profile-header">
          {logoPreview ? (
            <img src={logoPreview} alt="Brand logo" className="settings-avatar" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="settings-avatar">{companyName?.charAt(0).toUpperCase() || 'B'}</div>
          )}
          <div>
            <h1 className="settings-name">
              {companyName || user?.name}
              {verified && <span style={{ marginLeft: 8, fontSize: '0.75rem', color: '#38b6e8', fontWeight: 600 }}>✓ Verified</span>}
            </h1>
            <p className="settings-email">{businessEmail || user?.email}</p>
          </div>
        </div>

        <div className="settings-layout">
          <aside className="settings-sidebar">
            {sidebarSections.map((s) => (
              <button
                key={s}
                className={`sidebar-item ${activeSection === s ? 'active' : ''}`}
                onClick={() => scrollTo(s)}
              >{s}</button>
            ))}
          </aside>

          <div className="settings-content">
            {/* Brand Profile */}
            <div className="settings-card" id="Brand profile">
              <h2 className="card-title">Brand profile</h2>

              <div className="field-group">
                <span className="field-label">Brand logo</span>
                {logoPreview && <img src={logoPreview} alt="Logo" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', marginBottom: 8, display: 'block' }} />}
                <label className="replace-btn" style={{ cursor: 'pointer' }}>
                  <FiImage size={14} style={{ marginRight: 4 }} /> {logoPreview ? 'Replace logo' : 'Upload logo'}
                  <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                </label>
              </div>
              <div className="field-divider" />

              <div className="field-group">
                <div className="field-row">
                  <div>
                    <span className="field-label">Company name</span>
                    {editing === 'company' ? (
                      <input className="field-input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    ) : (
                      <span className="field-value">{companyName || '---'}</span>
                    )}
                  </div>
                  {editing === 'company' ? (
                    <div className="field-actions">
                      <button className="save-btn" onClick={saveCompanyName}>Save</button>
                      <button className="cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button className="edit-btn" onClick={() => setEditing('company')}><FiEdit2 size={14} /></button>
                  )}
                </div>
              </div>
              <div className="field-divider" />

              <div className="field-group">
                <div className="field-row">
                  <div>
                    <span className="field-label">Business email</span>
                    {editing === 'bemail' ? (
                      <input className="field-input" type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} />
                    ) : (
                      <span className="field-value">{businessEmail || '---'}</span>
                    )}
                  </div>
                  {editing === 'bemail' ? (
                    <div className="field-actions">
                      <button className="save-btn" onClick={saveBusinessEmail}>Save</button>
                      <button className="cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button className="edit-btn" onClick={() => setEditing('bemail')}><FiEdit2 size={14} /></button>
                  )}
                </div>
              </div>
              <div className="field-divider" />

              <div className="field-group">
                <div className="field-row">
                  <div>
                    <span className="field-label">Website URL</span>
                    {editing === 'website' ? (
                      <input className="field-input" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
                    ) : (
                      <span className="field-value"><FiLink size={12} /> {website || '---'}</span>
                    )}
                  </div>
                  {editing === 'website' ? (
                    <div className="field-actions">
                      <button className="save-btn" onClick={saveWebsite}>Save</button>
                      <button className="cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button className="edit-btn" onClick={() => setEditing('website')}><FiEdit2 size={14} /></button>
                  )}
                </div>
              </div>
              <div className="field-divider" />

              <div className="field-group">
                <div className="field-row">
                  <div>
                    <span className="field-label">Industry / Category</span>
                    {editing === 'industry' ? (
                      <input className="field-input" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Gaming, Tech, Fashion" />
                    ) : (
                      <span className="field-value"><FiTag size={12} /> {industry || '---'}</span>
                    )}
                  </div>
                  {editing === 'industry' ? (
                    <div className="field-actions">
                      <button className="save-btn" onClick={saveIndustry}>Save</button>
                      <button className="cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button className="edit-btn" onClick={() => setEditing('industry')}><FiEdit2 size={14} /></button>
                  )}
                </div>
              </div>
              <div className="field-divider" />

              <div className="field-group">
                <span className="field-label">Verification status</span>
                <span className="field-value" style={{ color: verified ? '#38b6e8' : '#9aa3ae' }}>
                  {verified ? <><FiCheck size={12} /> Verified brand</> : 'Pending verification'}
                </span>
              </div>
            </div>

            {/* Campaign Defaults */}
            <div className="settings-card" id="Campaign defaults">
              <h2 className="card-title">Campaign defaults</h2>
              <p className="card-desc">Set default values for new campaigns.</p>

              <div className="field-group">
                <div className="field-row">
                  <div>
                    <span className="field-label">Default CPM ($)</span>
                    {editing === 'cpmgoal' ? (
                      <input className="field-input" type="number" step="0.01" min="0.50" value={defaultCpm} onChange={(e) => setDefaultCpm(e.target.value)} />
                    ) : (
                      <span className="field-value">${defaultCpm}</span>
                    )}
                  </div>
                  <div>
                    <span className="field-label">Default goal (views)</span>
                    {editing === 'cpmgoal' ? (
                      <input className="field-input" type="number" min="1000" value={defaultGoal} onChange={(e) => setDefaultGoal(e.target.value)} />
                    ) : (
                      <span className="field-value">{Number(defaultGoal).toLocaleString()} views</span>
                    )}
                  </div>
                  {editing === 'cpmgoal' ? (
                    <div className="field-actions">
                      <button className="save-btn" onClick={saveCpmGoal}>Save</button>
                      <button className="cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button className="edit-btn" onClick={() => setEditing('cpmgoal')}><FiEdit2 size={14} /></button>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="settings-card" id="Notifications">
              <h2 className="card-title">Notifications</h2>
              <span className="notif-section-label">Email</span>

              <div className="notif-row">
                <div>
                  <span className="notif-title">New creator submissions</span>
                  <span className="notif-desc">Notify me when creators submit clips to my campaigns.</span>
                </div>
                <button className={`toggle ${notifNewCreators ? 'on' : ''}`} onClick={() => setNotifNewCreators(!notifNewCreators)}>
                  <span className="toggle-knob" />
                </button>
              </div>
              <div className="field-divider" />

              <div className="notif-row">
                <div>
                  <span className="notif-title">Campaign updates</span>
                  <span className="notif-desc">Send me status updates for my active campaigns.</span>
                </div>
                <button className={`toggle ${notifCampaignUpdates ? 'on' : ''}`} onClick={() => setNotifCampaignUpdates(!notifCampaignUpdates)}>
                  <span className="toggle-knob" />
                </button>
              </div>
              <div className="field-divider" />

              <div className="notif-row">
                <div>
                  <span className="notif-title">Budget alerts</span>
                  <span className="notif-desc">Alert me when campaign budget is running low.</span>
                </div>
                <button className={`toggle ${notifBudgetAlerts ? 'on' : ''}`} onClick={() => setNotifBudgetAlerts(!notifBudgetAlerts)}>
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>

            {/* Billing */}
            <div className="settings-card" id="Billing">
              <h2 className="card-title">Billing</h2>
              <p className="card-desc">Manage your payment methods and billing information.</p>

              <div className="field-group">
                <span className="field-label">Payment method</span>
                <span className="field-value"><FiCreditCard size={12} /> No payment method on file</span>
              </div>
              <div className="field-divider" />

              <div className="field-group">
                <span className="field-label">Billing address</span>
                <span className="field-value">No billing address set</span>
              </div>
              <div className="field-divider" />

              <button className="connect-account-btn"><FiPlus size={14} style={{ marginRight: 4 }} /> Add payment method</button>
            </div>

            {/* Security */}
            <div className="settings-card" id="Security">
              <h2 className="card-title">Security</h2>
              <p className="card-desc">Update your password.</p>

              <form onSubmit={handlePasswordChange} style={{ maxWidth: 360 }}>
                <div className="field-group">
                  <span className="field-label">Current password</span>
                  <input className="field-input" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
                </div>
                <div className="field-group">
                  <span className="field-label">New password</span>
                  <input className="field-input" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                </div>
                <div className="field-group">
                  <span className="field-label">Confirm new password</span>
                  <input className="field-input" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
                </div>
                {pwMsg && (
                  <p style={{ fontSize: '0.82rem', color: pwMsg.includes('success') ? '#38b6e8' : '#e53e3e', margin: '8px 0' }}>{pwMsg}</p>
                )}
                <button type="submit" className="save-btn" style={{ marginTop: 8 }}>Update password</button>
              </form>
            </div>

            {/* Close Account */}
            <div className="settings-card danger-card" id="Close account">
              <h2 className="card-title">Close account</h2>
              <div className="delete-row">
                <div className="delete-icon"><FiAlertTriangle size={20} /></div>
                <div>
                  <span className="delete-title">Delete brand account</span>
                  <span className="delete-desc">Permanently delete your Diro brand account and all campaigns.</span>
                </div>
                <button className="delete-btn" onClick={handleDelete}><FiTrash2 size={14} style={{ marginRight: 4 }} /> Delete</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default BrandSettings


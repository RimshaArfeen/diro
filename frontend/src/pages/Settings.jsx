import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCampaigns } from '../context/CampaignContext'
import { usersAPI } from '../services/api'
import DashNav from '../components/DashNav'
import { FiImage, FiEdit2, FiMapPin, FiGlobe, FiPlus, FiCheck, FiX, FiAlertTriangle, FiTrash2 } from 'react-icons/fi'
import { SiInstagram, SiTiktok, SiYoutube } from 'react-icons/si'
import './Dashboard.css'
import './Settings.css'

const NOTIF_KEY = 'diro_creator_notifs'
const PROFILE_KEY = 'diro_creator_profile'

const sections = ['Personal info', 'Connected accounts', 'Payout methods', 'Notifications', 'Security', 'Close account']

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: SiInstagram },
  { key: 'tiktok', label: 'TikTok', icon: SiTiktok },
  { key: 'youtube', label: 'YouTube', icon: SiYoutube },
]

function Settings() {
  const { user, updateUser, logout } = useAuth()
  const { wallet } = useCampaigns()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
  }, [user, navigate])

  const [activeSection, setActiveSection] = useState('Personal info')
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const [savedProfile] = useState(() => {
    try { const s = localStorage.getItem(PROFILE_KEY); return s ? JSON.parse(s) : {} }
    catch { return {} }
  })

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [location, setLocation] = useState('')
  const [language, setLanguage] = useState('English')
  const [bio, setBio] = useState(savedProfile.bio || '')
  const [profileImage, setProfileImage] = useState(savedProfile.profileImage || '')

  // Social accounts from backend user
  const socialAccounts = user?.socialAccounts || {}

  // Init from user data
  useEffect(() => {
    if (!user) return
    const parts = (user.name || '').split(' ')
    setFirstName(parts[0] || '')
    setLastName(parts.slice(1).join(' ') || '')
    setUsername(user.email?.split('@')[0] || '')
  }, [user])

  // Notification prefs
  const [savedNotifs] = useState(() => {
    try { const s = localStorage.getItem(NOTIF_KEY); return s ? JSON.parse(s) : {} }
    catch { return {} }
  })
  const [newCampaigns, setNewCampaigns] = useState(savedNotifs.newCampaigns ?? true)
  const [campaignUpdates, setCampaignUpdates] = useState(savedNotifs.campaignUpdates ?? true)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')

  // Social connect state
  const [connectingPlatform, setConnectingPlatform] = useState(null)
  const [socialInput, setSocialInput] = useState('')

  useEffect(() => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify({ newCampaigns, campaignUpdates }))
  }, [newCampaigns, campaignUpdates])

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ bio, profileImage }))
  }, [bio, profileImage])

  const saveName = async () => {
    setSaving(true)
    try {
      const fullName = `${firstName} ${lastName}`.trim() || user.name
      await usersAPI.updateProfile({ name: fullName })
      updateUser({ name: fullName })
    } catch {}
    setSaving(false)
    setEditing(null)
  }

  const saveUsername = async () => {
    setSaving(true)
    try {
      await usersAPI.updateProfile({ username })
    } catch {}
    setSaving(false)
    setEditing(null)
  }

  const saveLocation = async () => {
    setSaving(true)
    try {
      await usersAPI.updateProfile({ location })
    } catch {}
    setSaving(false)
    setEditing(null)
  }

  const saveLanguage = async () => {
    setSaving(true)
    try {
      await usersAPI.updateProfile({ language })
    } catch {}
    setSaving(false)
    setEditing(null)
  }

  const saveBio = async () => {
    setSaving(true)
    try {
      await usersAPI.updateProfile({ bio })
    } catch {}
    setSaving(false)
    setEditing(null)
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setProfileImage(ev.target.result)
      reader.readAsDataURL(file)
    }
  }

  const [socialError, setSocialError] = useState('')

  const handleConnectSocial = async (platform) => {
    if (!socialInput.trim()) return
    setSaving(true)
    setSocialError('')
    try {
      const data = await usersAPI.linkSocial(platform, socialInput.trim())
      updateUser({ socialAccounts: data.user.socialAccounts })
    } catch (err) {
      setSocialError(err.message || 'Failed to connect account')
    }
    setSaving(false)
    setConnectingPlatform(null)
    setSocialInput('')
  }

  const handleDisconnectSocial = async (platform) => {
    setSaving(true)
    setSocialError('')
    try {
      const data = await usersAPI.linkSocial(platform, '')
      updateUser({ socialAccounts: data.user.socialAccounts })
    } catch (err) {
      setSocialError(err.message || 'Failed to disconnect account')
    }
    setSaving(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwMsg('')
    if (!currentPw || !newPw || !confirmPw) { setPwMsg('All fields are required'); return }
    if (newPw !== confirmPw) { setPwMsg('New passwords do not match'); return }
    if (newPw.length < 6) { setPwMsg('Password must be at least 6 characters'); return }
    setSaving(true)
    try {
      await usersAPI.updateProfile({ currentPassword: currentPw, newPassword: newPw })
      setPwMsg('Password updated successfully')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err) {
      setPwMsg(err.message || 'Failed to update password')
    }
    setSaving(false)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      localStorage.removeItem(NOTIF_KEY)
      localStorage.removeItem(PROFILE_KEY)
      logout()
      navigate('/login')
    }
  }

  const scrollTo = (id) => {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const connectedCount = SOCIAL_PLATFORMS.filter(p => socialAccounts[p.key]).length

  if (!user) return null

  return (
    <div className="dash">
      <DashNav active="" />
      <main className="settings-page">
        <div className="settings-profile-header">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="settings-avatar" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="settings-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          )}
          <div>
            <h1 className="settings-name">{firstName && lastName ? `${firstName} ${lastName}` : user?.name}</h1>
            <p className="settings-email">{user?.email}</p>
          </div>
        </div>

        <div className="settings-layout">
          <aside className="settings-sidebar">
            {sections.map((s) => (
              <button
                key={s}
                className={`sidebar-item ${activeSection === s ? 'active' : ''}`}
                onClick={() => scrollTo(s)}
              >{s}</button>
            ))}
          </aside>

          <div className="settings-content">
            {/* Personal Info */}
            <div className="settings-card" id="Personal info">
              <h2 className="card-title">Personal info</h2>

              <div className="field-group">
                <span className="field-label">Profile picture</span>
                {profileImage && <img src={profileImage} alt="Profile" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', marginBottom: 8, display: 'block' }} />}
                <label className="replace-btn" style={{ cursor: 'pointer' }}>
                  <FiImage size={14} style={{ marginRight: 4 }} /> {profileImage ? 'Replace picture' : 'Upload picture'}
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
              </div>
              <div className="field-divider" />

              <div className="field-group">
                <div className="field-row">
                  <div>
                    <span className="field-label">First name</span>
                    {editing === 'name' ? (
                      <input className="field-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    ) : (
                      <span className="field-value">{firstName || '---'}</span>
                    )}
                  </div>
                  <div>
                    <span className="field-label">Last name</span>
                    {editing === 'name' ? (
                      <input className="field-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    ) : (
                      <span className="field-value">{lastName || '---'}</span>
                    )}
                  </div>
                  {editing === 'name' ? (
                    <div className="field-actions">
                      <button className="save-btn" onClick={saveName} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                      <button className="cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button className="edit-btn" onClick={() => setEditing('name')}><FiEdit2 size={14} /></button>
                  )}
                </div>
              </div>
              <div className="field-divider" />

              <div className="field-group">
                <div className="field-row">
                  <div>
                    <span className="field-label">Username</span>
                    {editing === 'username' ? (
                      <input className="field-input" value={username} onChange={(e) => setUsername(e.target.value)} />
                    ) : (
                      <span className="field-value">@ {username || '---'}</span>
                    )}
                  </div>
                  {editing === 'username' ? (
                    <div className="field-actions">
                      <button className="save-btn" onClick={saveUsername} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                      <button className="cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button className="edit-btn" onClick={() => setEditing('username')}><FiEdit2 size={14} /></button>
                  )}
                </div>
              </div>
              <div className="field-divider" />

              <div className="field-group">
                <div className="field-row">
                  <div>
                    <span className="field-label">Bio</span>
                    {editing === 'bio' ? (
                      <textarea className="field-input" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
                    ) : (
                      <span className="field-value">{bio || '---'}</span>
                    )}
                  </div>
                  {editing === 'bio' ? (
                    <div className="field-actions">
                      <button className="save-btn" onClick={saveBio} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                      <button className="cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button className="edit-btn" onClick={() => setEditing('bio')}><FiEdit2 size={14} /></button>
                  )}
                </div>
              </div>
              <div className="field-divider" />

              <div className="field-group">
                <div className="field-row">
                  <div>
                    <span className="field-label">Location</span>
                    {editing === 'location' ? (
                      <input className="field-input" value={location} onChange={(e) => setLocation(e.target.value)} />
                    ) : (
                      <span className="field-value"><FiMapPin size={12} /> {location || '---'}</span>
                    )}
                  </div>
                  {editing === 'location' ? (
                    <div className="field-actions">
                      <button className="save-btn" onClick={saveLocation} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                      <button className="cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button className="edit-btn" onClick={() => setEditing('location')}><FiEdit2 size={14} /></button>
                  )}
                </div>
              </div>
              <div className="field-divider" />

              <div className="field-group">
                <div className="field-row">
                  <div>
                    <span className="field-label">Languages you post in</span>
                    {editing === 'language' ? (
                      <input className="field-input" value={language} onChange={(e) => setLanguage(e.target.value)} />
                    ) : (
                      <span className="field-value"><FiGlobe size={12} /> {language}</span>
                    )}
                  </div>
                  {editing === 'language' ? (
                    <div className="field-actions">
                      <button className="save-btn" onClick={saveLanguage} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                      <button className="cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button className="edit-btn" onClick={() => setEditing('language')}><FiEdit2 size={14} /></button>
                  )}
                </div>
              </div>
              <div className="field-divider" />

              <div className="field-group">
                <span className="field-label">Email</span>
                <span className="field-value">{user?.email}</span>
              </div>
            </div>

            {/* Connected Accounts - Real API */}
            <div className="settings-card" id="Connected accounts">
              <h2 className="card-title">Connected accounts ({connectedCount})</h2>
              <p className="card-desc">Link the social media accounts where you post content.<br />An account must be connected to submit clips.</p>
              {socialError && <p style={{ color: '#e53e3e', fontSize: '0.82rem', margin: '8px 0' }}>{socialError}</p>}
              <div className="connect-list" style={{ marginTop: 12 }}>
                {SOCIAL_PLATFORMS.map(p => {
                  const Icon = p.icon
                  return (
                    <div className="connect-row" key={p.key}>
                      <span className="connect-icon"><Icon size={18} /></span>
                      <span className="connect-platform">
                        {socialAccounts[p.key] ? `${p.label}: @${socialAccounts[p.key]}` : `Connect ${p.label}`}
                      </span>
                      {connectingPlatform === p.key ? (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input
                            style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #333', background: '#1a1a2e', color: '#fff', fontSize: '0.85rem', width: 120 }}
                            placeholder="username"
                            value={socialInput}
                            onChange={e => setSocialInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleConnectSocial(p.key)}
                            autoFocus
                          />
                          <button className="connect-toggle connected" onClick={() => handleConnectSocial(p.key)} disabled={saving}><FiCheck size={14} /></button>
                          <button className="connect-toggle" onClick={() => { setConnectingPlatform(null); setSocialInput('') }}><FiX size={14} /></button>
                        </div>
                      ) : socialAccounts[p.key] ? (
                        <button className="connect-toggle connected" onClick={() => handleDisconnectSocial(p.key)} disabled={saving}><FiCheck size={14} /></button>
                      ) : (
                        <button className="connect-toggle" onClick={() => setConnectingPlatform(p.key)}><FiPlus size={14} /></button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Payout Methods */}
            <div className="settings-card" id="Payout methods">
              <h2 className="card-title">Payout methods</h2>
              <p className="card-desc">Link an account to withdraw funds. Depending on your location, you can connect either a <strong>Stripe</strong> or <strong>PayPal</strong> account.</p>
              <p className="card-desc-sm">You can choose a preferred method when you cash out.</p>

              <div className="field-group">
                <div className="field-row">
                  <div>
                    <span className="field-label">Available balance</span>
                    <span className="field-value">${wallet.available.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="field-label">Pending</span>
                    <span className="field-value">${wallet.pending.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="field-label">Paid out</span>
                    <span className="field-value">${wallet.paidOut.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="field-label">Lifetime</span>
                    <span className="field-value">${wallet.lifetime.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="field-divider" />

              <button className="connect-account-btn"><FiPlus size={14} style={{ marginRight: 4 }} /> Connect an account</button>
            </div>

            {/* Notifications */}
            <div className="settings-card" id="Notifications">
              <h2 className="card-title">Notifications</h2>
              <span className="notif-section-label">Email</span>
              <div className="notif-row">
                <div>
                  <span className="notif-title">New campaigns</span>
                  <span className="notif-desc">Notify me when new clipping campaigns launch.</span>
                </div>
                <button className={`toggle ${newCampaigns ? 'on' : ''}`} onClick={() => setNewCampaigns(!newCampaigns)}>
                  <span className="toggle-knob" />
                </button>
              </div>
              <div className="field-divider" />
              <div className="notif-row">
                <div>
                  <span className="notif-title">Campaign updates</span>
                  <span className="notif-desc">Send me status updates for campaigns I've joined.</span>
                </div>
                <button className={`toggle ${campaignUpdates ? 'on' : ''}`} onClick={() => setCampaignUpdates(!campaignUpdates)}>
                  <span className="toggle-knob" />
                </button>
              </div>
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
                <button type="submit" className="save-btn" style={{ marginTop: 8 }} disabled={saving}>
                  {saving ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </div>

            {/* Close Account */}
            <div className="settings-card danger-card" id="Close account">
              <h2 className="card-title">Close account</h2>
              <div className="delete-row">
                <div className="delete-icon"><FiAlertTriangle size={20} /></div>
                <div>
                  <span className="delete-title">Delete account</span>
                  <span className="delete-desc">Permanently delete your Diro account.</span>
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

export default Settings

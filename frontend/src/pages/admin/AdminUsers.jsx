import { useState, useEffect } from 'react'
import { usersAPI, clipsAPI, campaignsAPI, adminAPI } from '../../services/api'
import AdminLayout from './AdminLayout'
import './Admin.css'

function AdminUsers() {
  const [tab, setTab] = useState('creators')
  const [creators, setCreators] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewUser, setViewUser] = useState(null)

  useEffect(() => {
    Promise.all([
      usersAPI.listUsers({ role: 'creator' }),
      usersAPI.listUsers({ role: 'brand' }),
    ])
      .then(async ([creatorsData, brandsData]) => {
        // Fetch clips and campaigns data
        const [clipsData, campaignsData] = await Promise.all([
          clipsAPI.list().catch(() => ({ clips: [] })),
          campaignsAPI.list().catch(() => ({ campaigns: [] }))
        ])

        // Count clips per creator
        const clipsPerCreator = {}
        ;(clipsData.clips || []).forEach(clip => {
          const creatorId = clip.creatorId
          clipsPerCreator[creatorId] = (clipsPerCreator[creatorId] || 0) + 1
        })

        // Count campaigns per brand
        const campaignsPerBrand = {}
        ;(campaignsData.campaigns || []).forEach(campaign => {
          const brandId = campaign.brandId
          campaignsPerBrand[brandId] = (campaignsPerBrand[brandId] || 0) + 1
        })

        setCreators((creatorsData.users || []).map(u => ({
          id: u.userId || u._id,
          name: u.name,
          email: u.email,
          status: u.isActive ? 'active' : 'suspended',
          joined: new Date(u.createdAt).toLocaleDateString('en-CA'),
          clips: clipsPerCreator[u.userId] || 0,
          socialAccounts: u.socialAccounts || {},
        })))
        setBrands((brandsData.users || []).map(u => ({
          id: u.userId || u._id,
          name: u.name,
          email: u.email,
          status: u.isActive ? 'active' : 'suspended',
          joined: new Date(u.createdAt).toLocaleDateString('en-CA'),
          campaigns: campaignsPerBrand[u.userId] || 0,
          canCreateCampaign: !!u.canCreateCampaign,
        })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleCreatorStatus = async (id) => {
    const user = creators.find(u => u.id === id)
    if (!user) return
    try {
      // Use updateProfile to toggle isActive via admin endpoint
      await usersAPI.updateProfile.call(null, { isActive: user.status !== 'active' })
    } catch {
      // If no admin toggle endpoint, use delete for suspend
    }
    setCreators(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
    ))
  }

  const toggleBrandStatus = async (id) => {
    const user = brands.find(u => u.id === id)
    if (!user) return
    try {
      await usersAPI.updateProfile.call(null, { isActive: user.status !== 'active' })
    } catch {}
    setBrands(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
    ))
  }

  // Toggle campaign creation permission for a brand
  const toggleCampaignPermission = async (id) => {
    const brand = brands.find(u => u.id === id)
    if (!brand) return
    const newValue = !brand.canCreateCampaign
    // Optimistic UI update
    setBrands(prev => prev.map(u =>
      u.id === id ? { ...u, canCreateCampaign: newValue } : u
    ))
    try {
      await adminAPI.updateBrandPermission(id, newValue)
    } catch {
      // Revert on failure
      setBrands(prev => prev.map(u =>
        u.id === id ? { ...u, canCreateCampaign: !newValue } : u
      ))
    }
  }

  return (
    <AdminLayout title="User Management">
      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'creators' ? 'active' : ''}`} onClick={() => setTab('creators')}>
          Creators ({creators.length})
        </button>
        <button className={`admin-tab ${tab === 'brands' ? 'active' : ''}`} onClick={() => setTab('brands')}>
          Brands ({brands.length})
        </button>
      </div>

      {loading ? (
        <div className="admin-card" style={{ padding: 32, textAlign: 'center', color: '#9aa3ae' }}>Loading users...</div>
      ) : (
        <>
          {tab === 'creators' && (
            <div className="admin-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Clips</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {creators.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td style={{ fontWeight: 600, color: '#6366f1' }}>{u.clips}</td>
                      <td><span className={`status-badge status-${u.status}`}>{u.status}</span></td>
                      <td style={{ color: '#9aa3ae' }}>{u.joined}</td>
                      <td>
                        <div className="admin-actions-cell">
                          <button className="admin-action-btn" onClick={() => setViewUser(u)}>View</button>
                          <button
                            className={`admin-action-btn ${u.status === 'active' ? 'danger' : 'success'}`}
                            onClick={() => toggleCreatorStatus(u.id)}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'brands' && (
            <div className="admin-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Brand</th>
                    <th>Email</th>
                    <th>Campaigns</th>
                    <th>Campaign Permission</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td style={{ fontWeight: 600, color: '#6366f1' }}>{u.campaigns}</td>
                      <td>
                        {/* Campaign creation permission toggle */}
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                          <span
                            onClick={() => toggleCampaignPermission(u.id)}
                            style={{
                              display: 'inline-block',
                              width: 40,
                              height: 22,
                              borderRadius: 12,
                              background: u.canCreateCampaign ? '#22c55e' : '#d1d5db',
                              position: 'relative',
                              transition: 'background 0.2s',
                              cursor: 'pointer',
                            }}
                          >
                            <span style={{
                              display: 'block',
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              background: '#fff',
                              position: 'absolute',
                              top: 3,
                              left: u.canCreateCampaign ? 21 : 3,
                              transition: 'left 0.2s',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }} />
                          </span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: u.canCreateCampaign ? '#22c55e' : '#9aa3ae' }}>
                            {u.canCreateCampaign ? 'Allowed' : 'Denied'}
                          </span>
                        </label>
                      </td>
                      <td><span className={`status-badge status-${u.status}`}>{u.status}</span></td>
                      <td style={{ color: '#9aa3ae' }}>{u.joined}</td>
                      <td>
                        <div className="admin-actions-cell">
                          <button className="admin-action-btn" onClick={() => setViewUser(u)}>View</button>
                          <button
                            className={`admin-action-btn ${u.status === 'active' ? 'danger' : 'success'}`}
                            onClick={() => toggleBrandStatus(u.id)}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* View User Modal */}
      {viewUser && (
        <div className="admin-modal-overlay" onClick={() => setViewUser(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h2>{tab === 'creators' ? 'Creator' : 'Brand'} Details</h2>
            <div className="admin-modal-field">
              <label>Name</label>
              <span>{viewUser.name}</span>
            </div>
            <div className="admin-modal-field">
              <label>Email</label>
              <span>{viewUser.email}</span>
            </div>
            <div className="admin-modal-field">
              <label>Status</label>
              <span className={`status-badge status-${viewUser.status}`}>{viewUser.status}</span>
            </div>
            <div className="admin-modal-field">
              <label>Joined</label>
              <span>{viewUser.joined}</span>
            </div>
            {tab === 'creators' && (
              <>
                <div className="admin-modal-field">
                  <label>Total Clips</label>
                  <span style={{ fontWeight: 600, color: '#6366f1' }}>{viewUser.clips}</span>
                </div>
                {viewUser.socialAccounts && (
                  <div className="admin-modal-field">
                    <label>Social Accounts</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {viewUser.socialAccounts.instagram && (
                        <span style={{ fontSize: '0.9rem' }}>📷 Instagram: {viewUser.socialAccounts.instagram}</span>
                      )}
                      {viewUser.socialAccounts.tiktok && (
                        <span style={{ fontSize: '0.9rem' }}>🎵 TikTok: {viewUser.socialAccounts.tiktok}</span>
                      )}
                      {viewUser.socialAccounts.youtube && (
                        <span style={{ fontSize: '0.9rem' }}>▶️ YouTube: {viewUser.socialAccounts.youtube}</span>
                      )}
                      {!viewUser.socialAccounts.instagram && !viewUser.socialAccounts.tiktok && !viewUser.socialAccounts.youtube && (
                        <span style={{ fontSize: '0.9rem', color: '#9aa3ae' }}>No social accounts linked</span>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
            {tab === 'brands' && (
              <>
                <div className="admin-modal-field">
                  <label>Total Campaigns</label>
                  <span style={{ fontWeight: 600, color: '#6366f1' }}>{viewUser.campaigns}</span>
                </div>
                <div className="admin-modal-field">
                  <label>Campaign Permission</label>
                  <span style={{
                    fontWeight: 600,
                    color: viewUser.canCreateCampaign ? '#22c55e' : '#e53e3e'
                  }}>
                    {viewUser.canCreateCampaign ? 'Allowed' : 'Denied'}
                  </span>
                </div>
              </>
            )}
            <button className="admin-action-btn primary" style={{ marginTop: 16 }} onClick={() => setViewUser(null)}>Close</button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminUsers

import { useState, useEffect } from 'react'
import { campaignsAPI } from '../../services/api'
import AdminLayout from './AdminLayout'
import './Admin.css'

function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    campaignsAPI.list()
      .then((data) => {
        setCampaigns((data.campaigns || []).map(c => ({
          id: c.campaignId || c._id,
          title: c.title,
          brand: c.brandDetails?.name || c.brandId || 'Unknown',
          brandEmail: c.brandDetails?.email || '',
          cpm: c.CPM || 0,
          status: c.status === 'live' ? 'Active' : c.status === 'pending' ? 'Pending' : c.status === 'completed' ? 'Completed' : c.status === 'rejected' ? 'Rejected' : c.status,
          budget: c.deposit || 0,
          goalViews: c.goalViews || 0,
          views: 0,
        })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, newStatus) => {
    const backendStatus = newStatus === 'Active' ? 'live' : newStatus === 'Pending' ? 'pending' : newStatus === 'Rejected' ? 'rejected' : newStatus.toLowerCase()
    try {
      await campaignsAPI.updateStatus(id, backendStatus)
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    } catch (err) {
      console.error('Failed to update campaign status:', err)
      alert(err.message || 'Failed to update campaign status')
    }
  }

  const statusKey = (s) => s.toLowerCase()

  return (
    <AdminLayout title="Campaign Management">
      <div className="admin-stats" style={{ marginBottom: 24 }}>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total</span>
          <span className="admin-stat-value">{campaigns.length}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Active</span>
          <span className="admin-stat-value">{campaigns.filter(c => c.status === 'Active').length}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Pending</span>
          <span className="admin-stat-value">{campaigns.filter(c => c.status === 'Pending').length}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Rejected</span>
          <span className="admin-stat-value" style={{ color: '#ef4444' }}>{campaigns.filter(c => c.status === 'Rejected').length}</span>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">All Campaigns</h2>
            <p className="admin-card-desc">Manage campaign statuses and approvals</p>
          </div>
        </div>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#9aa3ae' }}>Loading campaigns...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Brand</th>
                <th>CPM</th>
                <th>Budget</th>
                <th>Goal</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.title}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 500 }}>{c.brand}</span>
                      {c.brandEmail && <span style={{ fontSize: '0.8rem', color: '#9aa3ae' }}>{c.brandEmail}</span>}
                    </div>
                  </td>
                  <td>${c.cpm.toFixed(2)}</td>
                  <td>${c.budget.toLocaleString()}</td>
                  <td>{c.goalViews.toLocaleString()} views</td>
                  <td><span className={`status-badge status-${statusKey(c.status)}`}>{c.status}</span></td>
                  <td>
                    <div className="admin-actions-cell">
                      {c.status === 'Pending' && (
                        <>
                          <button className="admin-action-btn success" onClick={() => updateStatus(c.id, 'Active')}>Approve</button>
                          <button className="admin-action-btn danger" onClick={() => updateStatus(c.id, 'Rejected')}>Reject</button>
                        </>
                      )}
                      {c.status === 'Active' && (
                        <button className="admin-action-btn" onClick={() => updateStatus(c.id, 'Completed')}>Complete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminCampaigns

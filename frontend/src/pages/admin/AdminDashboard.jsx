import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import AdminLayout from './AdminLayout'
import './Admin.css'

function AdminDashboard() {
  const [stats, setStats] = useState({
    creators: 0,
    brands: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.dashboard()
      .then((data) => {
        setStats({
          creators: data.users?.creators || 0,
          brands: data.users?.brands || 0,
          totalCampaigns: data.campaigns?.total || 0,
          activeCampaigns: data.campaigns?.live || 0,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminLayout title="Overview">
      <div className="admin-stats">
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total Creators</span>
          <span className="admin-stat-value">{loading ? '...' : stats.creators}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total Brands</span>
          <span className="admin-stat-value">{loading ? '...' : stats.brands}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total Campaigns</span>
          <span className="admin-stat-value">{loading ? '...' : stats.totalCampaigns}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Active Campaigns</span>
          <span className="admin-stat-value">{loading ? '...' : stats.activeCampaigns}</span>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard

import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import AdminLayout from './AdminLayout'
import './Admin.css'

function AdminSettings() {
  const [settings, setSettings] = useState({
    commission: 15,
    minCpm: 0.50,
    minViewsForPayout: 1000,
    payoutSchedule: 'weekly',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load settings from backend
  useEffect(() => {
    adminAPI.getSettings()
      .then((data) => {
        const s = data.settings || {}
        setSettings({
          commission: s.platformCommissionPercentage ?? 15,
          minCpm: s.minCPM ?? 0.50,
          minViewsForPayout: s.minViewsForPayout ?? 1000,
          payoutSchedule: s.payoutSchedule || 'weekly',
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminAPI.updateSettings({
        platformCommissionPercentage: settings.commission,
        minCPM: settings.minCpm,
        minViewsForPayout: settings.minViewsForPayout,
        payoutSchedule: settings.payoutSchedule,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setSaved(false)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div style={{ padding: 32, textAlign: 'center', color: '#9aa3ae' }}>Loading settings...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Settings">
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Platform Settings</h2>
            <p className="admin-card-desc">Configure global platform settings</p>
          </div>
          <button className="admin-action-btn primary" onClick={handleSave} disabled={saving}>
            {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <div className="admin-setting-row">
          <div className="admin-setting-info">
            <span className="admin-setting-label">Platform Commission (%)</span>
            <span className="admin-setting-desc">Percentage taken from each campaign payout</span>
          </div>
          <input
            type="number"
            className="admin-setting-input"
            value={settings.commission}
            onChange={(e) => updateSetting('commission', Number(e.target.value))}
            min="0"
            max="100"
            step="1"
          />
        </div>

        <div className="admin-setting-row">
          <div className="admin-setting-info">
            <span className="admin-setting-label">Minimum CPM ($)</span>
            <span className="admin-setting-desc">Minimum cost per 1000 views that brands can set</span>
          </div>
          <input
            type="number"
            className="admin-setting-input"
            value={settings.minCpm}
            onChange={(e) => updateSetting('minCpm', Number(e.target.value))}
            min="0.01"
            step="0.01"
          />
        </div>

        <div className="admin-setting-row">
          <div className="admin-setting-info">
            <span className="admin-setting-label">Min Views for Payout</span>
            <span className="admin-setting-desc">Minimum views required before a creator can earn</span>
          </div>
          <input
            type="number"
            className="admin-setting-input"
            value={settings.minViewsForPayout}
            onChange={(e) => updateSetting('minViewsForPayout', Number(e.target.value))}
            min="1"
            step="1"
          />
        </div>

        <div className="admin-setting-row">
          <div className="admin-setting-info">
            <span className="admin-setting-label">Payout Schedule</span>
            <span className="admin-setting-desc">How often creators receive payouts</span>
          </div>
          <select
            className="admin-setting-input"
            value={settings.payoutSchedule}
            onChange={(e) => updateSetting('payoutSchedule', e.target.value)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Platform Info</h2>
            <p className="admin-card-desc">Current configuration summary</p>
          </div>
        </div>
        <table className="admin-table">
          <tbody>
            <tr>
              <td style={{ fontWeight: 600, color: '#9aa3ae', width: 200 }}>Commission Rate</td>
              <td>{settings.commission}%</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600, color: '#9aa3ae' }}>Minimum CPM</td>
              <td>${settings.minCpm.toFixed(2)}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600, color: '#9aa3ae' }}>Min Views for Payout</td>
              <td>{settings.minViewsForPayout.toLocaleString()}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600, color: '#9aa3ae' }}>Payout Schedule</td>
              <td style={{ textTransform: 'capitalize' }}>{settings.payoutSchedule}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

export default AdminSettings

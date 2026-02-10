import { useState } from 'react'
import DashNav from '../components/DashNav'
import { useCampaigns } from '../context/CampaignContext'
import { FiInfo, FiDollarSign } from 'react-icons/fi'
import './Dashboard.css'
import './Earnings.css'

function Earnings() {
  const { campaigns, clips, wallet, payouts, cashOut } = useCampaigns()
  const [activeTab, setActiveTab] = useState('available')
  const [cashingOut, setCashingOut] = useState(false)
  const [cashOutMsg, setCashOutMsg] = useState('')

  const getTabClips = () => {
    switch (activeTab) {
      case 'available': return clips.filter(c => c.status === 'approved')
      case 'pending': return clips.filter(c => c.status === 'pending')
      case 'paidout': return []
      default: return []
    }
  }

  const tabClips = getTabClips()
  const completedPayouts = payouts.filter(p => p.status === 'completed')

  const handleCashOut = async () => {
    if (wallet.available <= 0) return
    setCashingOut(true)
    setCashOutMsg('')
    try {
      await cashOut(wallet.available)
      setCashOutMsg('Payout request submitted successfully!')
    } catch (err) {
      setCashOutMsg(err.message || 'Failed to process payout')
    } finally {
      setCashingOut(false)
    }
  }

  return (
    <div className="dash">
      <DashNav active="earnings" />
      <main className="dash-main">
        <div className="earnings-boxes">
          <div className="earn-box">
            <span className="earn-box-label">Available balance <span className="earn-info"><FiInfo size={12} /></span></span>
            <div className="earn-box-row">
              <span className="earn-box-amount">${wallet.available.toFixed(2)}</span>
              {wallet.available > 0 ? (
                <button className="add-account-btn" onClick={handleCashOut} disabled={cashingOut}>
                  {cashingOut ? 'Processing...' : 'Cash out'}
                </button>
              ) : (
                <button className="add-account-btn" disabled>No balance</button>
              )}
            </div>
            {cashOutMsg && (
              <p style={{ fontSize: '0.8rem', color: cashOutMsg.includes('success') ? '#38b6e8' : '#e53e3e', marginTop: 6 }}>
                {cashOutMsg}
              </p>
            )}
          </div>
          <div className="earn-box">
            <span className="earn-box-label">Pending balance <span className="earn-info"><FiInfo size={12} /></span></span>
            <span className="earn-box-amount">${wallet.pending.toFixed(2)}</span>
          </div>
          <div className="earn-box">
            <span className="earn-box-label">Lifetime earnings <span className="earn-info"><FiInfo size={12} /></span></span>
            <span className="earn-box-amount">${wallet.lifetime.toFixed(2)}</span>
          </div>
        </div>

        <div className="earn-tabs">
          <button className={`earn-tab ${activeTab === 'available' ? 'active' : ''}`} onClick={() => setActiveTab('available')}>Available</button>
          <button className={`earn-tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pending</button>
          <button className={`earn-tab ${activeTab === 'paidout' ? 'active' : ''}`} onClick={() => setActiveTab('paidout')}>Paid out</button>
        </div>

        <div className="earn-table">
          {activeTab === 'paidout' ? (
            <>
              <div className="earn-table-header">
                <span className="etcol-date">Date</span>
                <span className="etcol-clip">Amount</span>
                <span className="etcol-campaign">Status</span>
              </div>
              {completedPayouts.length === 0 ? (
                <div className="earn-table-empty">
                  <h3 className="empty-title">No payouts yet</h3>
                  <p className="empty-desc">Cash out your earnings to see payout history.</p>
                </div>
              ) : (
                <div className="earn-table-body">
                  {completedPayouts.map(p => (
                    <div className="earn-table-row" key={p.id}>
                      <span className="etcol-date">{new Date(p.date).toLocaleDateString()}</span>
                      <span className="etcol-clip"><FiDollarSign size={14} /> ${p.amount.toFixed(2)}</span>
                      <span className="etcol-campaign" style={{ textTransform: 'capitalize' }}>{p.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="earn-table-header">
                <span className="etcol-date">Date</span>
                <span className="etcol-clip">Clip</span>
                <span className="etcol-campaign">Campaign/Description</span>
                <span className="etcol-amount">Amount</span>
              </div>
              {tabClips.length === 0 ? (
                <div className="earn-table-empty">
                  <h3 className="empty-title">No {activeTab} earnings</h3>
                  <p className="empty-desc">Submit clips to campaigns and start earning!</p>
                </div>
              ) : (
                <div className="earn-table-body">
                  {tabClips.map(clip => {
                    const camp = campaigns.find(c => c.id === clip.campaignId)
                    return (
                      <div className="earn-table-row" key={clip.id}>
                        <span className="etcol-date">{new Date(clip.submittedAt).toLocaleDateString()}</span>
                        <span className="etcol-clip">{clip.views.toLocaleString()} views</span>
                        <span className="etcol-campaign">{camp?.name || 'Unknown'}</span>
                        <span className="etcol-amount">${clip.earnings.toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default Earnings

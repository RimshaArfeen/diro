import { useState, useEffect } from 'react'
import { paymentsAPI } from '../../services/api'
import AdminLayout from './AdminLayout'
import './Admin.css'

function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [audit, setAudit] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      paymentsAPI.list(),
      paymentsAPI.audit(),
    ])
      .then(([paymentsData, auditData]) => {
        setPayments((paymentsData.payments || []).map(p => ({
          id: p.paymentId || p._id,
          type: p.type === 'deposit' ? 'Brand Deposit' : 'Creator Payout',
          user: p.creatorId || p.campaignId || 'System',
          amount: p.amount || 0,
          date: new Date(p.createdAt).toLocaleDateString('en-CA'),
          status: p.status === 'completed' ? 'Completed' : 'Pending',
        })))
        setAudit(auditData)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Calculate summary from audit data
  const totalDeposits = audit?.deposits?.reduce((sum, d) => sum + (d.total || 0), 0) || 0
  const totalPayouts = audit?.payouts?.reduce((sum, p) => sum + (p.total || 0), 0) || 0
  const totalVolume = audit?.summary?.totalVolume || 0
  const totalTransactions = audit?.summary?.totalTransactions || 0

  // Calculate completed deposits and payouts
  const completedDeposits = audit?.deposits?.find(d => d._id === 'completed')?.total || 0
  const completedPayouts = audit?.payouts?.find(p => p._id === 'completed')?.total || 0
  const platformRevenue = completedDeposits - completedPayouts

  return (
    <AdminLayout title="Payments">
      <div className="admin-payment-grid">
        <div className="admin-payment-card">
          <span className="admin-payment-label">Total Deposits</span>
          <span className="admin-payment-value">${loading ? '...' : completedDeposits.toFixed(2)}</span>
          <span style={{ fontSize: '0.75rem', color: '#9aa3ae', marginTop: 4 }}>
            {loading ? '' : `${audit?.deposits?.find(d => d._id === 'completed')?.count || 0} transactions`}
          </span>
        </div>
        <div className="admin-payment-card">
          <span className="admin-payment-label">Creator Payouts</span>
          <span className="admin-payment-value">${loading ? '...' : completedPayouts.toFixed(2)}</span>
          <span style={{ fontSize: '0.75rem', color: '#9aa3ae', marginTop: 4 }}>
            {loading ? '' : `${audit?.payouts?.find(p => p._id === 'completed')?.count || 0} transactions`}
          </span>
        </div>
        <div className="admin-payment-card">
          <span className="admin-payment-label">Platform Revenue</span>
          <span className="admin-payment-value" style={{ color: '#10b981' }}>${loading ? '...' : platformRevenue.toFixed(2)}</span>
          <span style={{ fontSize: '0.75rem', color: '#9aa3ae', marginTop: 4 }}>
            {loading ? '' : `${totalTransactions} total transactions`}
          </span>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Recent Transactions</h2>
            <p className="admin-card-desc">All platform payment activity</p>
          </div>
        </div>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#9aa3ae' }}>Loading payments...</div>
        ) : payments.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#9aa3ae' }}>No payments yet</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.type}</td>
                  <td style={{ fontWeight: 700 }}>${p.amount.toLocaleString()}</td>
                  <td style={{ color: '#9aa3ae' }}>{p.date}</td>
                  <td>
                    <span className={`status-badge ${p.status === 'Completed' ? 'status-active' : 'status-pending'}`}>
                      {p.status}
                    </span>
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

export default AdminPayments

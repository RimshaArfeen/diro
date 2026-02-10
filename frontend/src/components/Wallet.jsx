import { useState, useEffect } from 'react';
import { usersAPI, paymentsAPI } from '../services/api';
import './wallet.css';

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      usersAPI.getWallet().catch(() => ({ wallet: { balance: 0, pendingBalance: 0 } })),
      paymentsAPI.list({ limit: 20 }).catch(() => ({ payments: [] })),
    ]).then(([walletData, paymentsData]) => {
      setWallet(walletData.wallet);
      setPayments(paymentsData.payments);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="wallet-page">
        <div className="wallet-container">
          <p style={{ textAlign: 'center', padding: '3rem' }}>Loading wallet...</p>
        </div>
      </div>
    );
  }

  const balances = [
    { label: 'Available Balance', amount: `$${(wallet?.balance || 0).toFixed(2)}`, icon: '💰' },
    { label: 'Pending Balance', amount: `$${(wallet?.pendingBalance || 0).toFixed(2)}`, icon: '⏳' },
    { label: 'Total Earned', amount: `$${((wallet?.balance || 0) + (wallet?.pendingBalance || 0)).toFixed(2)}`, icon: '💳' },
  ];

  return (
    <div className="wallet-page">
      <div className="wallet-container">
        <h1 className="wallet-title">Creator Wallet</h1>

        <div className="balance-cards">
          {balances.map((b, i) => (
            <div key={i} className="balance-card">
              <span className="balance-icon">{b.icon}</span>
              <p className="balance-label">{b.label}</p>
              <p className="balance-amount">{b.amount}</p>
            </div>
          ))}
        </div>

        <div className="transactions-section">
          <h2>Recent Transactions</h2>
          {payments.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>No transactions yet.</p>
          ) : (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.paymentId}>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>{p.type}</td>
                    <td>{p.status}</td>
                    <td className={p.type === 'payout' ? 'earning' : 'withdrawal'}>
                      {p.type === 'payout' ? '+' : '-'}${p.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;

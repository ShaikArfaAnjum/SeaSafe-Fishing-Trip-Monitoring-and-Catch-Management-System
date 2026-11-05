// ============================================================
// src/pages/fisherman/PriceBoard.jsx
// Displays the live fish price board maintained by the port administration.
// ============================================================

import { useState, useEffect } from 'react';
import api from '../../api';
import { formatDate } from '../../utils/formatDate';

export default function PriceBoard() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/prices')
      .then((res) => {
        setPrices(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to fetch prices.');
        setLoading(false);
      });
  }, []);

  // Pick appropriate seafood emoji
  const getFishEmoji = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('prawn') || t.includes('shrimp')) return '🦐';
    if (t.includes('crab')) return '🦀';
    if (t.includes('pomfret') || t.includes('tuna')) return '🐟';
    return '🐟';
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Fish Price Board</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Daily market prices across Andhra Pradesh coastal landing centers.
        </p>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading market prices...</p>
      ) : prices.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🏷️</div>
          <h3>No Prices Published</h3>
          <p>The port administration has not listed prices yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {prices.map((p) => (
            <div
              key={p._id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease',
                borderTop: '3px solid var(--ocean-blue)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <span
                  style={{
                    fontSize: '2.5rem',
                    background: '#f1f5f9',
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {getFishEmoji(p.fishType)}
                </span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{p.fishType}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fresh Marine Catch</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Current Rate
                  </span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ocean-blue)' }}>
                    ₹{p.pricePerKg} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ kg</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatDate(p.updatedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


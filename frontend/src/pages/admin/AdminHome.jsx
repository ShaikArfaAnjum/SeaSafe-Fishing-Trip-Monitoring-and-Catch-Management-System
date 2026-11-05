// ============================================================
// src/pages/admin/AdminHome.jsx
// Admin dashboard overview matching panel 4 in the reference image.
// Contains: System StatCards, Fish Price Management preview,
// and Catch Reports Summary with clean CSS progress bars.
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import StatCard from '../../components/StatCard';
import { formatDate } from '../../utils/formatDate';

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/prices')
    ])
      .then(([statsRes, pricesRes]) => {
        setStats(statsRes.data);
        setPrices(pricesRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching admin dashboard data:', err);
        setLoading(false);
      });
  }, []);

  const previewPrices = prices.slice(0, 3);

  // Compute maximum catch for progress bar scaling
  const maxCatch = stats?.totalCatchKg || 1;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span>📊</span> Admin Dashboard
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Overview of registered users, vessels, fishing activity, and landing reports.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="stat-cards-grid">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon="👥"
          iconBg="#e0f2fe"
        />
        <StatCard
          title="Total Boats"
          value={stats?.totalBoats || 0}
          icon="🚢"
          iconBg="#e0f2fe"
        />
        <StatCard
          title="Total Trips"
          value={stats?.totalTrips || 0}
          icon="📅"
          iconBg="#e0f2fe"
        />
        <StatCard
          title="Overdue Trips"
          value={stats?.overdueTrips || 0}
          icon="⚠️"
          iconBg={(stats?.overdueTrips || 0) > 0 ? 'var(--danger-light)' : '#f1f5f9'}
        />
      </div>

      {/* Two columns: Fish Price Management preview & Reports Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Fish Price Management Preview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Fish Price Management</h3>
            <Link to="/admin/prices" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
              View All →
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading prices...</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Fish Type</th>
                    <th>Price per KG</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {previewPrices.map((p) => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 600 }}>{p.fishType}</td>
                      <td style={{ fontWeight: 700, color: 'var(--ocean-blue)' }}>₹{p.pricePerKg}</td>
                      <td>{formatDate(p.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reports Summary with CSS Bars */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Reports Summary</h3>
            <Link to="/admin/reports" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
              Detailed Report →
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading stats...</p>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontWeight: 700 }}>Total Catch Landed</span>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--ocean-blue)' }}>
                  {stats?.totalCatchKg || 0} kg
                </span>
              </div>

              {(stats?.catchByFish || []).slice(0, 4).map((item) => {
                const percentage = Math.round((item.totalKg / maxCatch) * 100);
                return (
                  <div key={item.fishType} className="progress-bar-wrapper">
                    <div className="progress-bar-label">
                      <span>{item.fishType}</span>
                      <span>{item.totalKg} kg</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


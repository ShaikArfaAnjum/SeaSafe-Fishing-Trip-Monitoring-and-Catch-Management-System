// ============================================================
// src/pages/admin/Reports.jsx
// Fishery analytics and harvest reporting page for administrators.
// Uses clean CSS progress bars and tables (no bulky chart libraries).
// ============================================================

import { useState, useEffect } from 'react';
import api from '../../api';

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load report analytics.');
        setLoading(false);
      });
  }, []);

  const totalCatch = stats?.totalCatchKg || 0;
  const maxCatch = totalCatch || 1;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Fishery Landing Reports & Analytics</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Cumulative statistics on marine catch volumes, species distribution, and harbour traffic.
        </p>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading analytics...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Top Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div className="card">
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Total Catch Landed
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ocean-blue)', marginTop: '0.25rem' }}>
                {totalCatch} kg
              </div>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Completed Expeditions
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>
                {(stats?.totalTrips || 0) - (stats?.overdueTrips || 0)}
              </div>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Active Fleet Size
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                {stats?.totalBoats || 0} boats
              </div>
            </div>
          </div>

          {/* Catch by Species Breakdown */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Catch Distribution by Marine Species
            </h3>

            {(!stats?.catchByFish || stats.catchByFish.length === 0) ? (
              <p style={{ color: 'var(--text-muted)' }}>No catch records available.</p>
            ) : (
              <div>
                {stats.catchByFish.map((item) => {
                  const percentage = Math.round((item.totalKg / maxCatch) * 100);

                  return (
                    <div key={item.fishType} className="progress-bar-wrapper" style={{ marginBottom: '1.25rem' }}>
                      <div className="progress-bar-label">
                        <span style={{ fontWeight: 600 }}>{item.fishType}</span>
                        <span style={{ fontWeight: 700, color: 'var(--ocean-blue)' }}>
                          {item.totalKg} kg ({percentage}%)
                        </span>
                      </div>
                      <div className="progress-track" style={{ height: '12px' }}>
                        <div className="progress-fill" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Boats per Harbour Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Fleet Allocation by Harbour</h3>
            </div>
            <div className="table-container" style={{ border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Harbour Name</th>
                    <th>Registered Vessels</th>
                    <th>Port Share</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.boatsByHarbour || []).map((h) => {
                    const share = stats.totalBoats > 0 ? Math.round((h.count / stats.totalBoats) * 100) : 0;
                    return (
                      <tr key={h.harbour}>
                        <td style={{ fontWeight: 700 }}>📍 {h.harbour}</td>
                        <td style={{ fontWeight: 600 }}>{h.count} boats</td>
                        <td>{share}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


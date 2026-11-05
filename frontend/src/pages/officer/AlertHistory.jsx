// ============================================================
// src/pages/officer/AlertHistory.jsx
// Displays complete historical audit log of all Overdue Trip Alerts,
// verification statuses, and notes recorded by harbour officers.
// ============================================================

import { useState, useEffect } from 'react';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import { formatDateTime } from '../../utils/formatDate';

export default function AlertHistory() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/trips/alerts')
      .then((res) => {
        setAlerts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load alert history.');
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Alert History Log</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Audit trail of past overdue trip warnings, officer notes, and verification outcomes.
        </p>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading alert logs...</p>
      ) : alerts.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📜</div>
          <h3>No Alerts Recorded</h3>
          <p>No overdue trip alerts have been generated yet.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Boat Name</th>
                  <th>Harbour</th>
                  <th>Owner</th>
                  <th>Expected Return</th>
                  <th>Alert Status</th>
                  <th>Officer Note</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((trip) => (
                  <tr key={trip._id}>
                    <td style={{ fontWeight: 700 }}>{trip.boat?.boatName || 'Deleted boat'}</td>
                    <td>{trip.boat?.harbour || '-'}</td>
                    <td>{trip.owner?.name || '-'}</td>
                    <td>{formatDateTime(trip.expectedReturnTime)}</td>
                    <td>
                      <StatusBadge status={trip.alertStatus} />
                    </td>
                    <td style={{ maxWidth: '320px', fontSize: '0.88rem' }}>
                      {trip.officerNote ? (
                        <span style={{ color: 'var(--text-main)' }}>"{trip.officerNote}"</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No notes added</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


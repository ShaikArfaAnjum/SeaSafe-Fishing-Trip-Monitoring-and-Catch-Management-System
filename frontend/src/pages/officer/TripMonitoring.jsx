// ============================================================
// src/pages/officer/TripMonitoring.jsx
// Comprehensive trip monitoring table with status filter buttons
// for harbour officers to track all past and present sea movements.
// ============================================================

import { useState, useEffect } from 'react';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import { formatDateTime } from '../../utils/formatDate';

export default function TripMonitoring() {
  const [trips, setTrips] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTrips = async () => {
    try {
      setError('');
      const res = await api.get('/trips/all');
      setTrips(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch trips.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Filter trips based on selected status
  const filteredTrips = trips.filter((t) => {
    if (statusFilter === 'All') return true;
    return t.status === statusFilter;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Trip Monitoring</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Comprehensive overview of all coastal fishing movements.
          </p>
        </div>

        {/* Status filter buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['All', 'At Sea', 'Overdue', 'Returned'].map((status) => (
            <button
              key={status}
              className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading trips...</p>
      ) : filteredTrips.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>No Trips Matching "{statusFilter}"</h3>
          <p>Try switching the filter to view other trips.</p>
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
                  <th>Departure</th>
                  <th>Expected Return</th>
                  <th>Actual Return</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip) => (
                  <tr key={trip._id}>
                    <td style={{ fontWeight: 700 }}>{trip.boat?.boatName || 'Deleted boat'}</td>
                    <td>{trip.boat?.harbour || '-'}</td>
                    <td>{trip.owner?.name || '-'}</td>
                    <td>{formatDateTime(trip.departureTime)}</td>
                    <td>{formatDateTime(trip.expectedReturnTime)}</td>
                    <td>{trip.actualReturnTime ? formatDateTime(trip.actualReturnTime) : '—'}</td>
                    <td>
                      <StatusBadge status={trip.status} />
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


// Admin page to view all fishing trips across the system with status filters.

import { useState, useEffect } from 'react';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import { formatDateTime } from '../../utils/formatDate';

export default function AllTrips() {
  const [trips, setTrips] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/trips/all')
      .then((res) => {
        setTrips(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load trips.');
        setLoading(false);
      });
  }, []);

  const filteredTrips = trips.filter((t) => {
    if (filter === 'All') return true;
    return t.status === filter;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>All Fishing Trips</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            System-wide log of all historical and active coastal fishing expeditions.
          </p>
        </div>

        {/* Status filter buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['All', 'At Sea', 'Overdue', 'Returned'].map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading trips...</p>
      ) : filteredTrips.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🚢</div>
          <h3>No Trips Found</h3>
          <p>No trips match the current filter selection.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Boat</th>
                  <th>Harbour</th>
                  <th>Fisherman</th>
                  <th>Departure</th>
                  <th>Expected Return</th>
                  <th>Actual Return</th>
                  <th>Status</th>
                  <th>Catch (kg)</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip) => {
                  const totalKg = (trip.catches || []).reduce((acc, c) => acc + c.quantityKg, 0);

                  return (
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
                      <td style={{ fontWeight: 600 }}>{totalKg > 0 ? `${totalKg} kg` : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


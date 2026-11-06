// Displays complete historical record of all trips for the logged-in fisherman.
// Includes departure, expected return, actual return, status, and catches.


import { useState, useEffect } from 'react';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import { formatDateTime } from '../../utils/formatDate';

export default function TripHistory() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/trips/my')
      .then((res) => {
        setTrips(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load trip history.');
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Trip History</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Historical record of all your completed and active fishing expeditions.
        </p>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading trips...</p>
      ) : trips.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No Trip History</h3>
          <p>You haven't logged any trips yet.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Boat Name</th>
                  <th>Harbour</th>
                  <th>Departure Time</th>
                  <th>Expected Return</th>
                  <th>Actual Return</th>
                  <th>Status</th>
                  <th>Catches Recorded</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => {
                  const catchesSummary = (trip.catches || [])
                    .map((c) => `${c.fishType} (${c.quantityKg}kg)`)
                    .join(', ');

                  return (
                    <tr key={trip._id}>
                      <td style={{ fontWeight: 600 }}>{trip.boat?.boatName || 'Deleted boat'}</td>
                      <td>{trip.boat?.harbour || '-'}</td>
                      <td>{formatDateTime(trip.departureTime)}</td>
                      <td>{formatDateTime(trip.expectedReturnTime)}</td>
                      <td>{trip.actualReturnTime ? formatDateTime(trip.actualReturnTime) : '—'}</td>
                      <td>
                        <StatusBadge status={trip.status} />
                      </td>
                      <td style={{ fontSize: '0.85rem', color: catchesSummary ? 'inherit' : 'var(--text-muted)' }}>
                        {catchesSummary || 'None'}
                      </td>
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


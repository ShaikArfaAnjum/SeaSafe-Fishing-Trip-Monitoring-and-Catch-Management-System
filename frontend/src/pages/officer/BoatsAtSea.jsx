// ============================================================
// src/pages/officer/BoatsAtSea.jsx
// Detailed monitoring of all boats currently at sea (status: "At Sea" or "Overdue").
// Includes expanding boat details, crew rosters, and emergency contact numbers.
// ============================================================

import { useState, useEffect } from 'react';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import { formatDateTime } from '../../utils/formatDate';

export default function BoatsAtSea() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchTrips = async () => {
    try {
      setError('');
      const res = await api.get('/trips/at-sea');
      setTrips(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch active boats.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Boats at Sea</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Live status of vessels operating in coastal waters, sorted by expected return time.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchTrips}>
          🔄 Refresh
        </button>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading active vessels...</p>
      ) : trips.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🚢</div>
          <h3>No Vessels Currently at Sea</h3>
          <p>All registered fishing boats have safely returned to harbour.</p>
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
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => {
                  const isExpanded = expandedId === trip._id;
                  const isOverdue = trip.status === 'Overdue';

                  return (
                    <tr key={trip._id} style={{ backgroundColor: isOverdue ? '#fff5f5' : 'inherit' }}>
                      <td style={{ fontWeight: 700 }}>{trip.boat?.boatName || 'Deleted boat'}</td>
                      <td>{trip.boat?.harbour || '-'}</td>
                      <td>{trip.owner?.name || '-'}</td>
                      <td>{formatDateTime(trip.departureTime)}</td>
                      <td style={{ fontWeight: isOverdue ? 700 : 'normal', color: isOverdue ? 'var(--danger)' : 'inherit' }}>
                        {formatDateTime(trip.expectedReturnTime)}
                      </td>
                      <td>
                        <StatusBadge status={trip.status} />
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => toggleExpand(trip._id)}
                        >
                          {isExpanded ? 'Hide' : 'View Details'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expanded Details Drawer / Modal for the selected trip */}
      {expandedId && (
        <div className="card" style={{ marginTop: '1.5rem', border: '2px solid var(--ocean-blue)' }}>
          {(() => {
            const trip = trips.find((t) => t._id === expandedId);
            if (!trip) return null;

            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    Vessel Roster: {trip.boat?.boatName} ({trip.boat?.registrationNumber})
                  </h3>
                  <button className="btn btn-secondary btn-sm" onClick={() => setExpandedId(null)}>
                    ✕ Close
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--ocean-blue)' }}>
                      Contact Information
                    </h4>
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                      <strong>Owner:</strong> {trip.owner?.name} ({trip.owner?.email})
                    </p>
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                      <strong>Emergency Contact:</strong> {trip.boat?.emergencyContactName}
                    </p>
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                      <strong>Phone:</strong>{' '}
                      <a href={`tel:${trip.boat?.emergencyContactPhone}`} style={{ fontWeight: 700 }}>
                        {trip.boat?.emergencyContactPhone}
                      </a>
                    </p>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--ocean-blue)' }}>
                      Crew on Board ({trip.boat?.crew?.length || 0})
                    </h4>
                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                      {(trip.boat?.crew || []).map((c, idx) => (
                        <li key={idx} style={{ marginBottom: '0.25rem' }}>
                          <strong>{c.name}</strong> ({c.age} yrs) - {c.phone}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}


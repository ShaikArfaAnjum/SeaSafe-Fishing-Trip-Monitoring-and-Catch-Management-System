// Displays active trips (At Sea or Overdue) for the logged-in fisherman.
// Allows marking trips as returned and quick access to catch recording.


import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import { formatDateTime } from '../../utils/formatDate';

export default function ActiveTrips() {
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all trips for this fisherman and filter active ones
  const fetchActiveTrips = async () => {
    try {
      setError('');
      const res = await api.get('/trips/my');
      // Active trips are either "At Sea" or "Overdue"
      const active = res.data.filter((t) => t.status === 'At Sea' || t.status === 'Overdue');
      setActiveTrips(active);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch active trips.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTrips();
  }, []);

  // Mark a trip as returned
  const handleMarkReturned = async (id, boatName) => {
    if (!window.confirm(`Mark trip for boat "${boatName}" as Returned? This records actual return time as now.`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await api.put(`/trips/${id}/return`);
      setSuccess(`Trip for boat "${boatName}" marked as Returned successfully!`);
      fetchActiveTrips();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update trip status.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Active Trips at Sea</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Trips currently ongoing or flagged Overdue.
          </p>
        </div>
        <Link to="/fisherman/start-trip" className="btn btn-primary">
          + Start Another Trip
        </Link>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}
      {success && <div className="alert-box alert-success">{success}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading active trips...</p>
      ) : activeTrips.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">⚓</div>
          <h3>No Active Trips</h3>
          <p>All your boats are safely in harbour. Ready to depart?</p>
          <Link to="/fisherman/start-trip" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
            Start a new trip
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {activeTrips.map((trip) => {
            const boatName = trip.boat?.boatName || 'Deleted boat';
            const isOverdue = trip.status === 'Overdue';

            return (
              <div
                key={trip._id}
                className="card"
                style={{
                  borderLeft: isOverdue ? '4px solid var(--danger)' : '4px solid var(--ocean-blue)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {boatName}
                      </h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {trip.boat?.registrationNumber} • {trip.boat?.harbour} Harbour
                      </span>
                    </div>
                    <StatusBadge status={trip.status} />
                  </div>

                  {isOverdue && (
                    <div
                      style={{
                        background: 'var(--danger-light)',
                        color: 'var(--danger)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        marginBottom: '0.85rem'
                      }}
                    >
                      ⚠️ Overdue Trip Alert: Return time has passed. Harbour officer has been notified.
                    </div>
                  )}

                  <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', margin: '0.85rem 0' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Departure: </span>
                      <strong>{formatDateTime(trip.departureTime)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Expected Return: </span>
                      <strong style={{ color: isOverdue ? 'var(--danger)' : 'inherit' }}>
                        {formatDateTime(trip.expectedReturnTime)}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Recorded Catch: </span>
                      <strong>
                        {trip.catches && trip.catches.length > 0
                          ? `${trip.catches.reduce((acc, c) => acc + c.quantityKg, 0)} kg (${trip.catches.length} items)`
                          : 'None yet'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, backgroundColor: 'var(--success)' }}
                    onClick={() => handleMarkReturned(trip._id, boatName)}
                  >
                    ✓ Mark as Returned
                  </button>
                  <Link
                    to="/fisherman/add-catch"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    + Add Catch
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


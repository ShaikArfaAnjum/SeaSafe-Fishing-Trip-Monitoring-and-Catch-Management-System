// ============================================================
// src/pages/officer/OverdueBoats.jsx
// Displays trips whose expected return time has passed (status: "Overdue").
// Harbour officers follow up with emergency contacts and update alert status.
// WORDING RULE: Uses "Overdue Trip Alert" wording exclusively.
// ============================================================

import { useState, useEffect } from 'react';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import { formatDateTime } from '../../utils/formatDate';

export default function OverdueBoats() {
  const [overdueTrips, setOverdueTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected trip for handling alert
  const [activeTrip, setActiveTrip] = useState(null);
  const [alertStatus, setAlertStatus] = useState('Verified');
  const [officerNote, setOfficerNote] = useState('');

  // Fetch overdue trips
  const fetchOverdue = async () => {
    try {
      setError('');
      const res = await api.get('/trips/overdue');
      setOverdueTrips(res.data);
      if (res.data.length > 0 && !activeTrip) {
        setActiveTrip(res.data[0]);
        setOfficerNote(res.data[0].officerNote || '');
      }
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch overdue trips.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const handleSelectTrip = (trip) => {
    setActiveTrip(trip);
    setAlertStatus(trip.alertStatus === 'None' || trip.alertStatus === 'Open' ? 'Verified' : trip.alertStatus);
    setOfficerNote(trip.officerNote || '');
  };

  // Submit alert status update
  const handleUpdateAlert = async (e) => {
    e.preventDefault();
    if (!activeTrip) return;

    setError('');
    setSuccess('');

    try {
      const res = await api.put(`/trips/${activeTrip._id}/alert`, {
        alertStatus,
        officerNote
      });

      setSuccess(`Overdue trip alert status updated to "${alertStatus}"!`);
      // Update local state
      setActiveTrip(res.data);
      fetchOverdue();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update alert status.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>⚠️</span> Overdue Trip Alerts
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Vessels that have not returned by their scheduled expected return time. Check contacts and update alert status.
        </p>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}
      {success && <div className="alert-box alert-success">{success}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Checking overdue status...</p>
      ) : overdueTrips.length === 0 ? (
        <div className="card empty-state" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <div className="empty-state-icon">✅</div>
          <h3 style={{ color: 'var(--success)' }}>No Overdue Trips</h3>
          <p>All vessels at sea are operating within their expected departure schedules.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {/* Overdue Trips List */}
          <div className="card" style={{ borderColor: '#fca5a5' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', color: '#991b1b' }}>
              Flagged Overdue Vessels ({overdueTrips.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {overdueTrips.map((trip) => {
                const isSelected = activeTrip && activeTrip._id === trip._id;

                return (
                  <div
                    key={trip._id}
                    onClick={() => handleSelectTrip(trip)}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? '#fee2e2' : '#fef2f2',
                      border: isSelected ? '2px solid #ef4444' : '1px solid #fecaca',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: '#991b1b' }}>
                        {trip.boat?.boatName || 'Deleted boat'}
                      </strong>
                      <StatusBadge status={trip.alertStatus} />
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>
                      <div>Reg: {trip.boat?.registrationNumber} • {trip.boat?.harbour}</div>
                      <div>Expected Return: <strong>{formatDateTime(trip.expectedReturnTime)}</strong></div>
                      <div>Contact: {trip.boat?.emergencyContactName} ({trip.boat?.emergencyContactPhone})</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details & Alert Resolution Form */}
          {activeTrip && (
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                Follow-up & Update Alert: {activeTrip.boat?.boatName}
              </h3>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                <p><strong>Owner:</strong> {activeTrip.owner?.name} ({activeTrip.owner?.email})</p>
                <p>
                  <strong>Emergency Contact:</strong> {activeTrip.boat?.emergencyContactName} (
                  <a href={`tel:${activeTrip.boat?.emergencyContactPhone}`} style={{ fontWeight: 700 }}>
                    {activeTrip.boat?.emergencyContactPhone}
                  </a>)
                </p>
                <p style={{ marginTop: '0.5rem' }}><strong>Crew on Board:</strong></p>
                <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)' }}>
                  {(activeTrip.boat?.crew || []).map((c, i) => (
                    <li key={i}>{c.name} ({c.age} yrs) - {c.phone}</li>
                  ))}
                </ul>
              </div>

              <form onSubmit={handleUpdateAlert}>
                <div className="form-group">
                  <label>Update Alert Status *</label>
                  <select
                    className="form-input"
                    value={alertStatus}
                    onChange={(e) => setAlertStatus(e.target.value)}
                  >
                    <option value="Verified">Verified (Officer confirmed delay / made contact)</option>
                    <option value="Resolved">Resolved (Safe return confirmed)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Officer Follow-up Note</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    placeholder="e.g. Called emergency contact Kamala Devi. Confirmed boat is anchoring safely due to engine check."
                    value={officerNote}
                    onChange={(e) => setOfficerNote(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  Save Alert Status & Note
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


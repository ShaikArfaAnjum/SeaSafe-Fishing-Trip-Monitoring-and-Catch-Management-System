// ============================================================
// src/pages/officer/OfficerHome.jsx
// Harbour officer dashboard home page matching the SeaSafe reference design.
// Contains: Overdue Trip Alert banner, Boats at Sea table,
// Weather info card, and Emergency Contacts card.
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import WeatherCard from '../../components/WeatherCard';
import { formatTime } from '../../utils/formatDate';

export default function OfficerHome() {
  const navigate = useNavigate();

  const [atSeaTrips, setAtSeaTrips] = useState([]);
  const [overdueTrips, setOverdueTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTripDetails, setSelectedTripDetails] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/trips/at-sea'),
      api.get('/trips/overdue')
    ])
      .then(([atSeaRes, overdueRes]) => {
        setAtSeaTrips(atSeaRes.data);
        setOverdueTrips(overdueRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching officer home data:', err);
        setLoading(false);
      });
  }, []);

  // First overdue trip contact for quick dial
  const firstOverdue = overdueTrips.length > 0 ? overdueTrips[0] : null;

  return (
    <div>
      {/* Overdue Trip Alert Banner (shown when overdue trips exist) */}
      {overdueTrips.length > 0 && (
        <div className="overdue-alert-banner">
          <div className="overdue-alert-banner-left">
            <span style={{ fontSize: '1.4rem' }}>⚠️</span>
            <span>
              {overdueTrips.length} Overdue Trip Alert{overdueTrips.length > 1 ? 's' : ''}
            </span>
          </div>
          <Link
            to="/officer/overdue"
            className="btn btn-primary"
            style={{ background: '#dc2626', color: '#fff', padding: '0.45rem 1rem' }}
          >
            View Details →
          </Link>
        </div>
      )}

      {/* Main Section: Boats at Sea Table */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🚢</span> Boats at Sea
          </h3>
          <Link to="/officer/at-sea" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
            Full List →
          </Link>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading active boats...</p>
        ) : atSeaTrips.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚓</div>
            <p>No boats currently at sea.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Boat Name</th>
                  <th>Departure</th>
                  <th>Expected Return</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {atSeaTrips.map((trip) => (
                  <tr key={trip._id}>
                    <td style={{ fontWeight: 600 }}>{trip.boat?.boatName || 'Deleted boat'}</td>
                    <td>{formatTime(trip.departureTime)}</td>
                    <td>{formatTime(trip.expectedReturnTime)}</td>
                    <td>
                      <StatusBadge status={trip.status} />
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedTripDetails(trip)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal / Details Popup if a boat is clicked */}
      {selectedTripDetails && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem'
          }}
          onClick={() => setSelectedTripDetails(null)}
        >
          <div
            className="card"
            style={{ maxWidth: '480px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.2rem' }}>
                {selectedTripDetails.boat?.boatName || 'Boat Details'}
              </h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedTripDetails(null)}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              <p><strong>Registration:</strong> {selectedTripDetails.boat?.registrationNumber || '-'}</p>
              <p><strong>Harbour:</strong> {selectedTripDetails.boat?.harbour || '-'}</p>
              <p><strong>Owner:</strong> {selectedTripDetails.owner?.name} ({selectedTripDetails.owner?.email})</p>
              <p>
                <strong>Emergency Contact:</strong> {selectedTripDetails.boat?.emergencyContactName} (
                <a href={`tel:${selectedTripDetails.boat?.emergencyContactPhone}`}>
                  {selectedTripDetails.boat?.emergencyContactPhone}
                </a>)
              </p>
              <p style={{ marginTop: '0.5rem' }}><strong>Crew Members:</strong></p>
              <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)' }}>
                {(selectedTripDetails.boat?.crew || []).map((c, i) => (
                  <li key={i}>{c.name} ({c.age} yrs) - {c.phone}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Grid: Weather Card & Quick Emergency Contacts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <WeatherCard />

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.75rem', color: 'var(--ocean-blue)' }}>📞</span>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Emergency Contact Follow-up</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {firstOverdue ? 'Action Required for Overdue Boat' : 'No overdue emergencies'}
              </span>
            </div>
          </div>

          {firstOverdue ? (
            <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca' }}>
              <p style={{ fontWeight: 700, color: '#991b1b', marginBottom: '0.25rem' }}>
                Boat: {firstOverdue.boat?.boatName} ({firstOverdue.boat?.registrationNumber})
              </p>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                Contact Person: <strong>{firstOverdue.boat?.emergencyContactName}</strong>
              </p>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#b91c1c' }}>
                <a href={`tel:${firstOverdue.boat?.emergencyContactPhone}`} style={{ color: 'inherit' }}>
                  {firstOverdue.boat?.emergencyContactPhone}
                </a>
              </p>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: '0.75rem', background: '#dc2626' }}
                onClick={() => navigate('/officer/overdue')}
              >
                Open Overdue Case
              </button>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              All fishing trips are within their scheduled return windows. You can search full contacts via the directory.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


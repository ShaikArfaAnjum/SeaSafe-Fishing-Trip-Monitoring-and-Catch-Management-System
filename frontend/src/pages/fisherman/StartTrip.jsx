// ============================================================
// src/pages/fisherman/StartTrip.jsx
// Form for fishermen to start a new fishing trip with expected return time.
// Includes harbour weather forecast for safe departure planning.
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import WeatherCard from '../../components/WeatherCard';

export default function StartTrip() {
  const navigate = useNavigate();

  const [boats, setBoats] = useState([]);
  const [selectedBoat, setSelectedBoat] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [expectedReturnTime, setExpectedReturnTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [boatsLoading, setBoatsLoading] = useState(true);

  // Set default departure to current local time, and return to 6 hours later
  useEffect(() => {
    const now = new Date();
    const future = new Date(now.getTime() + 6 * 60 * 60 * 1000);

    // Format to YYYY-MM-DDTHH:mm for datetime-local input
    const toLocalISO = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setDepartureTime(toLocalISO(now));
    setExpectedReturnTime(toLocalISO(future));

    // Fetch boats owned by the fisherman
    api.get('/boats')
      .then((res) => {
        setBoats(res.data);
        if (res.data.length > 0) {
          setSelectedBoat(res.data[0]._id);
        }
        setBoatsLoading(false);
      })
      .catch((err) => {
        setError('Failed to load boats. Please check your connection.');
        setBoatsLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedBoat) {
      setError('Please select a boat.');
      return;
    }

    try {
      setLoading(true);

      // Convert local datetime to UTC ISO string before sending to backend
      const depISO = new Date(departureTime).toISOString();
      const expISO = new Date(expectedReturnTime).toISOString();

      await api.post('/trips', {
        boat: selectedBoat,
        departureTime: depISO,
        expectedReturnTime: expISO
      });

      // On success, go to active trips page
      navigate('/fisherman/active-trips');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start trip.');
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Start New Fishing Trip</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Register departure and expected return time. Trips past expected return are automatically flagged as Overdue.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Trip Form Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Trip Departure Details
          </h3>

          {error && <div className="alert-box alert-error">{error}</div>}

          {boatsLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading your registered boats...</p>
          ) : boats.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🚢</div>
              <p>You need to register a boat before starting a trip.</p>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: '0.75rem' }}
                onClick={() => navigate('/fisherman/boats')}
              >
                Go to My Boats
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Boat *</label>
                <select
                  required
                  className="form-input"
                  value={selectedBoat}
                  onChange={(e) => setSelectedBoat(e.target.value)}
                >
                  {boats.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.boatName} ({b.registrationNumber}) - {b.harbour} Harbour
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Departure Time *</label>
                <input
                  type="datetime-local"
                  required
                  className="form-input"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Expected Return Time *</label>
                <input
                  type="datetime-local"
                  required
                  className="form-input"
                  value={expectedReturnTime}
                  onChange={(e) => setExpectedReturnTime(e.target.value)}
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                  Must be after departure time and in the future.
                </small>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.25rem' }}
              >
                {loading ? 'Registering Trip...' : 'Confirm & Start Trip'}
              </button>
            </form>
          )}
        </div>

        {/* Weather Card Column */}
        <div>
          <WeatherCard />

          <div className="card" style={{ marginTop: '1.5rem', background: '#f8fafc' }}>
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🛡️</span> Safety Notice
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              SeaSafe monitors departure schedules to ensure timely returns. If you expect a delay at sea, notify your emergency contact or harbour officer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


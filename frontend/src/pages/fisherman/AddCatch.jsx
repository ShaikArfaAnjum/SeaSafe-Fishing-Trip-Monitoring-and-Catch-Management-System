// ============================================================
// src/pages/fisherman/AddCatch.jsx
// Form to record fish caught during a fishing trip.
// Displays the trip's recorded catches and allows deleting individual entries.
// ============================================================

import { useState, useEffect } from 'react';
import api from '../../api';

export default function AddCatch() {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [prices, setPrices] = useState([]);
  const [fishType, setFishType] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch my trips and prices
  const fetchData = async () => {
    try {
      setError('');
      const [tripsRes, pricesRes] = await Promise.all([
        api.get('/trips/my'),
        api.get('/prices')
      ]);

      setTrips(tripsRes.data);
      setPrices(pricesRes.data);

      if (tripsRes.data.length > 0 && !selectedTripId) {
        setSelectedTripId(tripsRes.data[0]._id);
      }
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load trip and price data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Currently selected trip object
  const currentTrip = trips.find((t) => t._id === selectedTripId);

  // Handle adding catch
  const handleAddCatch = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedTripId) {
      setError('Please select a trip.');
      return;
    }

    if (!fishType || !quantityKg || Number(quantityKg) <= 0) {
      setError('Please provide a valid fish type and positive quantity in kg.');
      return;
    }

    try {
      const res = await api.post(`/trips/${selectedTripId}/catch`, {
        fishType: fishType.trim(),
        quantityKg: Number(quantityKg)
      });

      // Update state with updated trip
      setTrips(trips.map((t) => (t._id === selectedTripId ? res.data : t)));
      setSuccess(`Added ${quantityKg} kg of ${fishType} to catch record!`);
      setFishType('');
      setQuantityKg('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add catch.');
    }
  };

  // Handle deleting catch entry
  const handleDeleteCatch = async (catchId, type) => {
    if (!window.confirm(`Delete catch entry for "${type}"?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      const res = await api.delete(`/trips/${selectedTripId}/catch/${catchId}`);
      setTrips(trips.map((t) => (t._id === selectedTripId ? res.data : t)));
      setSuccess(`Catch entry deleted successfully.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete catch entry.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Record Fish Catch</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Log catch quantities for each trip to track harvest totals and price estimates.
        </p>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}
      {success && <div className="alert-box alert-success">{success}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading trips...</p>
      ) : trips.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🐟</div>
          <h3>No Trips Available</h3>
          <p>You need to have at least one trip registered before recording catch.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Catch Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Add Catch Entry
            </h3>

            <form onSubmit={handleAddCatch}>
              <div className="form-group">
                <label>Select Trip *</label>
                <select
                  required
                  className="form-input"
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                >
                  {trips.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.boat?.boatName || 'Boat'} ({t.status}) - ID: {t._id.slice(-6)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Fish Type *</label>
                <input
                  type="text"
                  required
                  list="fish-types-list"
                  className="form-input"
                  placeholder="e.g. Tuna, Prawns, Sardines"
                  value={fishType}
                  onChange={(e) => setFishType(e.target.value)}
                />
                <datalist id="fish-types-list">
                  {prices.map((p) => (
                    <option key={p._id} value={p.fishType}>
                      ₹{p.pricePerKg}/kg
                    </option>
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label>Quantity in Kilograms (kg) *</label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="any"
                  className="form-input"
                  placeholder="e.g. 50"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                + Add Catch to Trip
              </button>
            </form>
          </div>

          {/* Current Trip Catch List */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
              Catches for Selected Trip
            </h3>

            {currentTrip ? (
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Boat: <strong>{currentTrip.boat?.boatName || 'Deleted boat'}</strong> | Status:{' '}
                  <strong>{currentTrip.status}</strong>
                </p>

                {(!currentTrip.catches || currentTrip.catches.length === 0) ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    No fish catches recorded for this trip yet.
                  </p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Fish Type</th>
                          <th>Quantity</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTrip.catches.map((item) => (
                          <tr key={item._id}>
                            <td style={{ fontWeight: 600 }}>{item.fishType}</td>
                            <td>{item.quantityKg} kg</td>
                            <td>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteCatch(item._id, item.fishType)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No trip selected.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// ============================================================
// src/pages/fisherman/MyBoats.jsx
// Page for fishermen to register, view, update and delete their boats.
// Includes crew members list and emergency contact info.
// ============================================================

import { useState, useEffect } from 'react';
import api from '../../api';

export default function MyBoats() {
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [boatName, setBoatName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [harbour, setHarbour] = useState('Visakhapatnam');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('+91 ');
  const [crew, setCrew] = useState([{ name: '', age: '', phone: '+91 ' }]);

  // Fetch boats on load
  const fetchBoats = async () => {
    try {
      setError('');
      const res = await api.get('/boats');
      setBoats(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch boats.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoats();
  }, []);

  // Reset form inputs
  const resetForm = () => {
    setEditingId(null);
    setBoatName('');
    setRegistrationNumber('');
    setHarbour('Visakhapatnam');
    setEmergencyContactName('');
    setEmergencyContactPhone('+91 ');
    setCrew([{ name: '', age: '', phone: '+91 ' }]);
    setShowForm(false);
  };

  // Populate form for editing
  const handleEditClick = (boat) => {
    setEditingId(boat._id);
    setBoatName(boat.boatName);
    setRegistrationNumber(boat.registrationNumber);
    setHarbour(boat.harbour);
    setEmergencyContactName(boat.emergencyContactName);
    setEmergencyContactPhone(boat.emergencyContactPhone);
    setCrew(boat.crew && boat.crew.length > 0 ? boat.crew : [{ name: '', age: '', phone: '+91 ' }]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add / remove crew member rows
  const handleAddCrewRow = () => {
    setCrew([...crew, { name: '', age: '', phone: '+91 ' }]);
  };

  const handleRemoveCrewRow = (index) => {
    setCrew(crew.filter((_, i) => i !== index));
  };

  const handleCrewChange = (index, field, value) => {
    const updated = [...crew];
    updated[index][field] = value;
    setCrew(updated);
  };

  // Submit create or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Filter out empty crew members
    const cleanedCrew = crew
      .filter((c) => c.name.trim() !== '')
      .map((c) => ({
        name: c.name.trim(),
        age: Number(c.age) || 25,
        phone: c.phone.trim()
      }));

    const payload = {
      boatName,
      registrationNumber,
      harbour,
      emergencyContactName,
      emergencyContactPhone,
      crew: cleanedCrew
    };

    try {
      if (editingId) {
        await api.put(`/boats/${editingId}`, payload);
        setSuccess('Boat details updated successfully!');
      } else {
        await api.post('/boats', payload);
        setSuccess('New boat registered successfully!');
      }
      resetForm();
      fetchBoats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save boat.');
    }
  };

  // Delete boat (with confirmation)
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will delete all its historical trips as well.`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const res = await api.delete(`/boats/${id}`);
      setSuccess(res.data.message || 'Boat deleted successfully.');
      fetchBoats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete boat.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My Boats</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Register and manage your registered fishing boats and crew.
          </p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Register New Boat
          </button>
        )}
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}
      {success && <div className="alert-box alert-success">{success}</div>}

      {/* Boat Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            {editingId ? 'Edit Boat Details' : 'Register New Boat'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label>Boat Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Sagar Mitra"
                  value={boatName}
                  onChange={(e) => setBoatName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Registration Number *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. AP-VZ-101"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Harbour *</label>
                <select
                  className="form-input"
                  value={harbour}
                  onChange={(e) => setHarbour(e.target.value)}
                >
                  <option value="Visakhapatnam">Visakhapatnam</option>
                  <option value="Kakinada">Kakinada</option>
                  <option value="Machilipatnam">Machilipatnam</option>
                  <option value="Nizampatnam">Nizampatnam</option>
                </select>
              </div>

              <div className="form-group">
                <label>Emergency Contact Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Lakshmi Devi"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact Phone *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Crew Members Section */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Crew Members</h4>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddCrewRow}>
                  + Add Crew Member
                </button>
              </div>

              {crew.map((member, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 2fr auto',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                    alignItems: 'center'
                  }}
                >
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Crew Member Name"
                    value={member.name}
                    onChange={(e) => handleCrewChange(idx, 'name', e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Age"
                    value={member.age}
                    onChange={(e) => handleCrewChange(idx, 'age', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Phone (+91)"
                    value={member.phone}
                    onChange={(e) => handleCrewChange(idx, 'phone', e.target.value)}
                  />
                  {crew.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveCrewRow(idx)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Boat' : 'Save Boat'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Boats Grid */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading boats...</p>
      ) : boats.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🚢</div>
          <h3>No Boats Registered</h3>
          <p>You haven't registered any boats yet. Click the button above to register your first boat.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {boats.map((boat) => (
            <div key={boat._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ocean-blue)' }}>
                      {boat.boatName}
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Reg: {boat.registrationNumber}
                    </span>
                  </div>
                  <span
                    style={{
                      background: '#f1f5f9',
                      padding: '0.25rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    📍 {boat.harbour}
                  </span>
                </div>

                <div style={{ fontSize: '0.88rem', margin: '0.85rem 0' }}>
                  <p style={{ marginBottom: '0.35rem' }}>
                    <strong>🚨 Emergency Contact:</strong> {boat.emergencyContactName} ({boat.emergencyContactPhone})
                  </p>
                  <p>
                    <strong>👥 Crew Members ({boat.crew?.length || 0}):</strong>
                  </p>
                  {boat.crew && boat.crew.length > 0 ? (
                    <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                      {boat.crew.map((c, i) => (
                        <li key={i}>
                          {c.name} ({c.age} yrs) - {c.phone}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No crew listed</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(boat)}>
                  ✏️ Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(boat._id, boat.boatName)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


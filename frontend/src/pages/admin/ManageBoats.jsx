// Admin page to manage all registered vessels across harbours.
// Allows updating harbour assignments and displays harbour fleet counts.

import { useState, useEffect } from 'react';
import api from '../../api';

export default function ManageBoats() {
  const [boats, setBoats] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Inline editing state for harbour
  const [editingBoatId, setEditingBoatId] = useState(null);
  const [newHarbour, setNewHarbour] = useState('');

  const fetchData = async () => {
    try {
      setError('');
      const [boatsRes, statsRes] = await Promise.all([
        api.get('/boats/all'),
        api.get('/admin/stats')
      ]);
      setBoats(boatsRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load fleet data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartEdit = (boat) => {
    setEditingBoatId(boat._id);
    setNewHarbour(boat.harbour);
  };

  const handleSaveHarbour = async (id) => {
    try {
      setError('');
      setSuccess('');
      const res = await api.put(`/admin/boats/${id}`, { harbour: newHarbour });
      setBoats(boats.map((b) => (b._id === id ? res.data : b)));
      setEditingBoatId(null);
      setSuccess(`Harbour updated to "${newHarbour}"!`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update harbour.');
    }
  };

  const handleDeleteBoat = async (id, name) => {
    if (!window.confirm(`Delete boat "${name}"? This will delete all its historical trip records as well.`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      const res = await api.delete(`/admin/boats/${id}`);
      setSuccess(res.data.message || 'Boat deleted successfully.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete boat.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Manage Boats & Harbours</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Port-level management of registered vessels and fleet distribution.
        </p>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}
      {success && <div className="alert-box alert-success">{success}</div>}

      {/* Boats by Harbour Summary Cards */}
      {stats?.boatsByHarbour && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          {stats.boatsByHarbour.map((item) => (
            <div key={item.harbour} className="card" style={{ background: '#ffffff', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>⚓</div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {item.harbour}
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {item.count} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>boats</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading boats...</p>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Boat Name</th>
                  <th>Registration</th>
                  <th>Owner</th>
                  <th>Harbour Assignment</th>
                  <th>Crew Size</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {boats.map((boat) => {
                  const isEditing = editingBoatId === boat._id;

                  return (
                    <tr key={boat._id}>
                      <td style={{ fontWeight: 700 }}>{boat.boatName}</td>
                      <td>{boat.registrationNumber}</td>
                      <td>{boat.owner?.name || 'Unknown'}</td>
                      <td>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <select
                              className="form-input"
                              style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                              value={newHarbour}
                              onChange={(e) => setNewHarbour(e.target.value)}
                            >
                              <option value="Visakhapatnam">Visakhapatnam</option>
                              <option value="Kakinada">Kakinada</option>
                              <option value="Machilipatnam">Machilipatnam</option>
                              <option value="Nizampatnam">Nizampatnam</option>
                            </select>
                            <button className="btn btn-primary btn-sm" onClick={() => handleSaveHarbour(boat._id)}>
                              Save
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditingBoatId(null)}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span>📍 {boat.harbour}</span>
                        )}
                      </td>
                      <td>{boat.crew?.length || 0} crew</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {!isEditing && (
                            <button className="btn btn-secondary btn-sm" onClick={() => handleStartEdit(boat)}>
                              Edit Harbour
                            </button>
                          )}
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteBoat(boat._id, boat.boatName)}
                          >
                            Delete
                          </button>
                        </div>
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


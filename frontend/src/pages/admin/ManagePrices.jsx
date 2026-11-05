// ============================================================
// src/pages/admin/ManagePrices.jsx
// Admin page to create, update, and delete fish prices on the official price board.
// ============================================================

import { useState, useEffect } from 'react';
import api from '../../api';
import { formatDate } from '../../utils/formatDate';

export default function ManagePrices() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [fishType, setFishType] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchPrices = async () => {
    try {
      setError('');
      const res = await api.get('/prices');
      setPrices(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch prices.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFishType('');
    setPricePerKg('');
  };

  const handleStartEdit = (p) => {
    setEditingId(p._id);
    setFishType(p.fishType);
    setPricePerKg(p.pricePerKg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await api.put(`/prices/${editingId}`, {
          fishType: fishType.trim(),
          pricePerKg: Number(pricePerKg)
        });
        setSuccess(`Price for "${fishType}" updated successfully!`);
      } else {
        await api.post('/prices', {
          fishType: fishType.trim(),
          pricePerKg: Number(pricePerKg)
        });
        setSuccess(`Price for "${fishType}" added successfully!`);
      }
      resetForm();
      fetchPrices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save price.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete price for "${name}"?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      const res = await api.delete(`/prices/${id}`);
      setSuccess(res.data.message || 'Price deleted successfully.');
      fetchPrices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete price.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Manage Fish Prices</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Publish and update standard market rates per kilogram for marine catch.
        </p>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}
      {success && <div className="alert-box alert-success">{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Price Form Card */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            {editingId ? 'Edit Fish Price' : 'Add New Fish Type'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Fish Variety / Type *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Kingfish, Lobster, Hilsa"
                value={fishType}
                onChange={(e) => setFishType(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Price per Kilogram (₹/kg) *</label>
              <input
                type="number"
                required
                min="1"
                step="any"
                className="form-input"
                placeholder="e.g. 350"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {editingId ? 'Update Price' : 'Publish Price'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Prices Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Published Price List</h3>
          </div>

          {loading ? (
            <p style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>Loading prices...</p>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Fish Variety</th>
                    <th>Price per KG</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((p) => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 700 }}>{p.fishType}</td>
                      <td style={{ fontWeight: 800, color: 'var(--ocean-blue)', fontSize: '1.05rem' }}>
                        ₹{p.pricePerKg} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ kg</span>
                      </td>
                      <td>{formatDate(p.updatedAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleStartEdit(p)}>
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(p._id, p.fishType)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


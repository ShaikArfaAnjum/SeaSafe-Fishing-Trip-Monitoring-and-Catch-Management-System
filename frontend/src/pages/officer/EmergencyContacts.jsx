// ============================================================
// src/pages/officer/EmergencyContacts.jsx
// Directory of all boats with emergency contact names and phone numbers.
// Includes quick search filtering by boat name or owner name.
// ============================================================

import { useState, useEffect } from 'react';
import api from '../../api';

export default function EmergencyContacts() {
  const [boats, setBoats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/boats/all')
      .then((res) => {
        setBoats(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load emergency directory.');
        setLoading(false);
      });
  }, []);

  // Filter boats by search query
  const filteredBoats = boats.filter((b) => {
    const term = searchTerm.toLowerCase();
    const boatName = (b.boatName || '').toLowerCase();
    const ownerName = (b.owner?.name || '').toLowerCase();
    const reg = (b.registrationNumber || '').toLowerCase();
    const harbour = (b.harbour || '').toLowerCase();
    return boatName.includes(term) || ownerName.includes(term) || reg.includes(term) || harbour.includes(term);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Emergency Contacts Directory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Quick lookup directory for coastal emergency responders and harbour officers.
          </p>
        </div>

        {/* Search input */}
        <div style={{ minWidth: '280px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Search boat, owner or reg number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading contacts...</p>
      ) : filteredBoats.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📞</div>
          <h3>No Records Found</h3>
          <p>{searchTerm ? `No boats match "${searchTerm}".` : 'No registered boats in system.'}</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Boat Name</th>
                  <th>Registration</th>
                  <th>Owner</th>
                  <th>Harbour</th>
                  <th>Emergency Contact</th>
                  <th>Phone Number</th>
                </tr>
              </thead>
              <tbody>
                {filteredBoats.map((boat) => (
                  <tr key={boat._id}>
                    <td style={{ fontWeight: 700 }}>{boat.boatName}</td>
                    <td>{boat.registrationNumber}</td>
                    <td>{boat.owner?.name || 'Unknown'}</td>
                    <td>{boat.harbour}</td>
                    <td style={{ fontWeight: 600 }}>{boat.emergencyContactName}</td>
                    <td>
                      <a
                        href={`tel:${boat.emergencyContactPhone}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontWeight: 700,
                          color: 'var(--ocean-blue)'
                        }}
                      >
                        <span>📞</span> {boat.emergencyContactPhone}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


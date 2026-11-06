// Admin page to manage system accounts and change user roles.Prevents an admin from deleting their own account.

import { useState, useEffect, useContext } from 'react';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatDate';

export default function ManageUsers() {
  const { user: currentUser } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setError('');
      const res = await api.get('/admin/users');
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update a user's role
  const handleRoleChange = async (id, newRole) => {
    try {
      setError('');
      setSuccess('');
      const res = await api.put(`/admin/users/${id}/role`, { role: newRole });
      setUsers(users.map((u) => (u._id === id ? res.data : u)));
      setSuccess(`Role updated to "${newRole}" for ${res.data.name}!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role.');
    }
  };

  // Delete a user account
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This will delete all their registered boats and historical trips as well.`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      const res = await api.delete(`/admin/users/${id}`);
      setSuccess(res.data.message || 'User deleted successfully.');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Manage Users</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Assign system roles and manage user access permissions.
        </p>
      </div>

      {error && <div className="alert-box alert-error">{error}</div>}
      {success && <div className="alert-box alert-success">{success}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading users...</p>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registered</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u._id === currentUser?._id;

                  return (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 700 }}>
                        {u.name} {isSelf && <span style={{ color: 'var(--ocean-blue)', fontSize: '0.8rem' }}>(You)</span>}
                      </td>
                      <td>{u.email}</td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        <select
                          className="form-input"
                          style={{ padding: '0.35rem 0.65rem', width: 'auto', fontSize: '0.85rem' }}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        >
                          <option value="fisherman">Fisherman</option>
                          <option value="officer">Harbour Officer</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                      <td>
                        {!isSelf ? (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(u._id, u.name)}
                          >
                            Delete
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Current Session</span>
                        )}
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


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import './Admin.css';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('simple');

  console.log('AdminUsers component mounted');

  useEffect(() => {
    console.log('Fetching users on mount');
    fetchUsers();
  }, [viewMode]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching users with viewMode:', viewMode);
      
      const response = viewMode === 'detailed' 
        ? await adminAPI.getUserStats()
        : await adminAPI.getAllUsers();
      
      console.log('Users fetched:', response.data);
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user: ${userName}?`)) {
      try {
        await adminAPI.deleteUser(userId);
        alert('User deleted successfully ✅');
        fetchUsers();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: '#6366f1',
      buyer: '#10b981',
      seller: '#f59e0b',
      both: '#8b5cf6'
    };

    return (
      <span 
        className="role-badge"
        style={{ backgroundColor: `${colors[role] || '#6b7280'}20`, color: colors[role] || '#6b7280' }}
      >
        {role}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <button className="btn btn-link back-button" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
        <button className="btn btn-secondary" onClick={fetchUsers}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <button 
        className="btn btn-link back-button" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          navigate('/dashboard');
        }}
        type="button"
      >
        ← Back to Dashboard
      </button>

      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage all platform users</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'simple' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setViewMode('simple');
              }}
              type="button"
            >
              Simple View
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'detailed' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setViewMode('detailed');
              }}
              type="button"
            >
              Detailed View
            </button>
          </div>
          <div className="header-stats">
            <div className="stat-pill">
              <span className="stat-number">{users.length}</span>
              <span className="stat-label">Total Users</span>
            </div>
            <div className="stat-pill">
              <span className="stat-number">{users.filter(u => u.role === 'buyer').length}</span>
              <span className="stat-label">Buyers</span>
            </div>
            <div className="stat-pill">
              <span className="stat-number">{users.filter(u => u.role === 'seller').length}</span>
              <span className="stat-label">Sellers</span>
            </div>
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: '64px' }}>👥</span>
          <h3>No users found</h3>
          <p>There are currently no users in the system</p>
        </div>
      ) : viewMode === 'simple' ? (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    {user.role !== 'admin' && (
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteUser(user._id, user.name);
                        }}
                        type="button"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="users-detailed-grid">
          {users.map((user) => (
            <div key={user._id} className="user-detail-card">
              <div className="user-card-header">
                <div>
                  <h3>{user.name}</h3>
                  <p className="user-email">{user.email}</p>
                </div>
                {getRoleBadge(user.role)}
              </div>

              <div className="user-card-info">
                <div className="info-row">
                  <span>📞 Phone:</span>
                  <span>{user.phone || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span>📅 Joined:</span>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {user.sellerStats && (
                <div className="user-stats-section">
                  <h4>📊 Seller Activity</h4>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-value">{user.sellerStats.totalListings}</span>
                      <span className="stat-label">Listings</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{user.sellerStats.activeListings}</span>
                      <span className="stat-label">Active</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{user.sellerStats.completedOrders}</span>
                      <span className="stat-label">Sales</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">₹{user.sellerStats.revenue.toFixed(2)}</span>
                      <span className="stat-label">Revenue</span>
                    </div>
                  </div>
                </div>
              )}

              {user.buyerStats && (
                <div className="user-stats-section">
                  <h4>🛒 Buyer Activity</h4>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-value">{user.buyerStats.totalOrders}</span>
                      <span className="stat-label">Orders</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{user.buyerStats.completedOrders}</span>
                      <span className="stat-label">Completed</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">₹{user.buyerStats.totalSpent.toFixed(2)}</span>
                      <span className="stat-label">Total Spent</span>
                    </div>
                  </div>
                </div>
              )}

              {user.role !== 'admin' && (
                <div className="user-card-actions">
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteUser(user._id, user.name);
                    }}
                    type="button"
                  >
                    🗑️ Delete User
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
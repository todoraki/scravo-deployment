import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import './Admin.css';

const AdminListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getAllListings();
      setListings(response.data.data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError(error.response?.data?.message || 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId, listingTitle) => {
    if (window.confirm(`Are you sure you want to delete listing: "${listingTitle}"?`)) {
      try {
        await adminAPI.deleteListing(listingId);
        alert('Listing deleted successfully ✅');
        fetchListings();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete listing');
      }
    }
  };

  const handleViewDetails = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: '#10b981', label: 'Active' },
      sold: { color: '#ef4444', label: 'Sold' },
      draft: { color: '#6b7280', label: 'Draft' },
      inactive: { color: '#f59e0b', label: 'Inactive' },
      reserved: { color: '#8b5cf6', label: 'Reserved' }
    };

    const config = statusConfig[status] || statusConfig.active;

    return (
      <span 
        className="status-badge"
        style={{ backgroundColor: `${config.color}20`, color: config.color }}
      >
        {config.label}
      </span>
    );
  };

  const getFilteredListings = () => {
    if (filter === 'all') return listings;
    return listings.filter(listing => listing.status === filter);
  };

  const filteredListings = getFilteredListings();

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">Loading listings...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <button className="btn btn-link back-button" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      <div className="page-header">
        <div>
          <h1>All Listings</h1>
          <p>Manage all platform listings</p>
        </div>
        <div className="header-stats">
          <div className="stat-pill">
            <span className="stat-number">{listings.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-pill">
            <span className="stat-number">{listings.filter(l => l.status === 'active').length}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-pill">
            <span className="stat-number">{listings.filter(l => l.status === 'sold').length}</span>
            <span className="stat-label">Sold</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({listings.length})
        </button>
        <button 
          className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({listings.filter(l => l.status === 'active').length})
        </button>
        <button 
          className={`filter-tab ${filter === 'sold' ? 'active' : ''}`}
          onClick={() => setFilter('sold')}
        >
          Sold ({listings.filter(l => l.status === 'sold').length})
        </button>
        <button 
          className={`filter-tab ${filter === 'inactive' ? 'active' : ''}`}
          onClick={() => setFilter('inactive')}
        >
          Inactive ({listings.filter(l => l.status === 'inactive').length})
        </button>
      </div>

      {filteredListings.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: '64px' }}>📦</span>
          <h3>No {filter !== 'all' ? filter : ''} listings found</h3>
          <p>There are currently no listings in the system</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Seller</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price/Unit</th>
                <th>Status</th>
                <th>Views</th>
                <th>Posted Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.map((listing) => (
                <tr key={listing._id}>
                  <td>
                    <div className="table-material-info">
                      <strong>{listing.materialTitle}</strong>
                      <small>📍 {listing.location?.address || listing.location || 'N/A'}</small>
                    </div>
                  </td>
                  <td>{listing.seller?.name || 'Unknown'}</td>
                  <td>{listing.category}</td>
                  <td>{listing.quantity} {listing.unit}</td>
                  <td>${listing.pricePerUnit}</td>
                  <td>{getStatusBadge(listing.status)}</td>
                  <td>{listing.views || 0}</td>
                  <td>{new Date(listing.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/listing/${listing._id}`);
                        }}
                        title="View Details"
                        type="button"
                      >
                        👁️ View
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteListing(listing._id, listing.materialTitle);
                        }}
                        title="Delete Listing"
                        type="button"
                      >
                        🗑️ Delete
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
  );
};

export default AdminListings;

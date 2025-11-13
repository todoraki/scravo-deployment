import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingAPI } from '../../utils/api';
import './MyListings.css';

const MyListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await listingAPI.getMy();
      setListings(response.data.data);
    } catch (error) {
      setError('Failed to fetch listings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  const handleEdit = (listingId) => {
    navigate(`/edit-listing/${listingId}`);
  };

  const handleDelete = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await listingAPI.delete(listingId);
        alert('Listing deleted successfully');
        fetchListings();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete listing');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: '#10b981', label: 'Active' },
      sold: { color: '#ef4444', label: 'Sold' },
      draft: { color: '#6b7280', label: 'Draft' },
      inactive: { color: '#f59e0b', label: 'Inactive' }
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

  if (loading) {
    return (
      <div className="my-listings">
        <div className="loading">Loading listings...</div>
      </div>
    );
  }

  return (
    <div className="my-listings">
      <div className="page-header">
        <div>
          <h1>My Listings</h1>
          <p>Manage your material listings</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/create-listing')}
        >
          <span>➕</span>
          <span>Create New Listing</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {listings.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: '64px' }}>📦</span>
          <h3>No listings yet</h3>
          <p>Create your first listing to start selling materials</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/create-listing')}
          >
            Create Listing
          </button>
        </div>
      ) : (
        <div className="listings-table">
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price/Unit</th>
                <th>Status</th>
                <th>Views</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing._id}>
                  <td>
                    <div className="material-info">
                      <div className="material-image">
                        {listing.images && listing.images.length > 0 ? (
                          <img 
                            src={`http://localhost:5000${listing.images[0]}`} 
                            alt={listing.materialTitle}
                            onError={(e) => {
                              console.error('Image load error:', e.target.src);
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="no-image">📦</div>';
                            }}
                          />
                        ) : (
                          <div className="no-image">📦</div>
                        )}
                      </div>

                      <div>
                        <div className="material-title">{listing.materialTitle}</div>
                        <div className="material-location">📍 {typeof listing.location === 'string' ? listing.location : listing.location?.address || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{listing.category}</td>
                  <td>{listing.quantity} {listing.unit}</td>
                  <td>₹{listing.pricePerUnit}</td>
                  <td>{getStatusBadge(listing.status)}</td>
                  <td>{listing.views || 0}</td>
                  <td>
                    <div className="material-actions">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/listing/${listing._id}`);
                        }}
                        type="button"
                      >
                        👁️ View
                      </button>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/edit-listing/${listing._id}`);
                        }}
                        type="button"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(listing._id);
                        }}
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

export default MyListings ;
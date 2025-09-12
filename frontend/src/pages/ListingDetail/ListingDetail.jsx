import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listingAPI } from '../../utils/api';
import './ListingDetail.css';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [showSellerContact, setShowSellerContact] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await listingAPI.getOne(id);
      setListing(response.data.data);
    } catch (error) {
      console.error('Error fetching listing:', error);
      setError('Failed to load listing details');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = () => {
    // Navigate to order page with listing details
    navigate('/create-order', { state: { listing, quantity: orderQuantity } });
  };

  const handleContactSeller = () => {
    setShowSellerContact(true);
  };

  if (loading) {
    return (
      <div className="listing-detail">
        <div className="loading">Loading listing details...</div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="listing-detail">
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error || 'Listing not found'}</span>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="listing-detail">
      <button 
        className="btn btn-link back-button" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          navigate(-1);
        }}
        type="button"
      >
        ← Back to Marketplace
      </button>

      <div className="detail-container">
        <div className="detail-images">
          {listing.images && listing.images.length > 0 ? (
            <div className="main-image">
              <img 
                src={`http://localhost:5000${listing.images[0]}`} 
                alt={listing.materialTitle}
                onError={(e) => e.target.src = 'https://via.placeholder.com/600x400?text=No+Image'}
              />
            </div>
          ) : (
            <div className="no-image-large">📦</div>
          )}
        </div>

        <div className="detail-info">
          <div className="category-badge">{listing.category}</div>
          <h1>{listing.materialTitle}</h1>
          
          <div className="price-section">
            <div className="price">${listing.pricePerUnit}</div>
            <div className="unit">per {listing.unit}</div>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Available Quantity</span>
              <span className="info-value">{listing.quantity} {listing.unit}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Location</span>
              <span className="info-value">📍 {listing.location?.address || listing.location}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status</span>
              <span className="info-value">
                <span className={`status-badge ${listing.status}`}>{listing.status}</span>
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Views</span>
              <span className="info-value">👁️ {listing.views}</span>
            </div>
          </div>

          <div className="description-section">
            <h3>Description</h3>
            <p>{listing.description}</p>
          </div>

          <div className="seller-section">
            <h3>Seller Information</h3>
            <div className="seller-info">
              <div className="seller-name">👤 {listing.seller?.name}</div>
              
              {showSellerContact ? (
                <>
                  <div className="seller-contact">📧 {listing.seller?.email}</div>
                  {listing.seller?.phone && (
                    <div className="seller-contact">📞 {listing.seller?.phone}</div>
                  )}
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `mailto:${listing.seller?.email}`;
                    }}
                    type="button"
                  >
                    ✉️ Send Email
                  </button>
                </>
              ) : (
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleContactSeller();
                  }}
                  type="button"
                >
                  📞 Show Contact Details
                </button>
              )}
            </div>
          </div>

          {user?.role === 'buyer' && listing.status === 'active' && (
            <div className="action-section">
              <div className="quantity-selector">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={listing.quantity}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Number(e.target.value))}
                />
                <span className="unit-label">{listing.unit}</span>
              </div>

              <div className="total-price">
                <span>Total:</span>
                <span className="amount">${(listing.pricePerUnit * orderQuantity).toFixed(2)}</span>
              </div>

              <div className="action-buttons">
                <button 
                  className="btn btn-primary btn-large"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePlaceOrder();
                  }}
                  disabled={orderQuantity > listing.quantity || orderQuantity < 1}
                  type="button"
                >
                  🛒 Place Order
                </button>
              </div>
            </div>
          )}

          {user?.role === 'seller' && listing.seller?._id === user._id && (
            <div className="action-section">
              <button 
                className="btn btn-primary"
                onClick={() => navigate(`/edit-listing/${listing._id}`)}
              >
                ✏️ Edit Listing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;

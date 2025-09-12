import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../utils/api';
import './Offers.css';

const Offers = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getSellerOrders();
      setOffers(response.data.data);
      setError('');
    } catch (error) {
      console.error('Error fetching offers:', error);
      setError('Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      let note = '';
      
      if (newStatus === 'cancelled') {
        note = prompt('⚠️ Please provide a reason for rejecting this order (required):');
        if (!note || note.trim() === '') {
          alert('Rejection reason is required!');
          return;
        }
      } else {
        note = prompt(`Enter a note for status update to "${newStatus}" (optional):`);
        if (note === null) return; // User cancelled
      }

      await orderAPI.updateStatus(orderId, newStatus, note);
      alert('Order status updated successfully! ✅');
      fetchOffers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: '#f59e0b', label: 'Pending' },
      confirmed: { color: '#3b82f6', label: 'Confirmed' },
      shipped: { color: '#6366f1', label: 'Shipped' },
      delivered: { color: '#10b981', label: 'Delivered' },
      cancelled: { color: '#ef4444', label: 'Cancelled' },
      refunded: { color: '#ef4444', label: 'Refunded' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span 
        className="status-badge"
        style={{ backgroundColor: `${config.color}20`, color: config.color }}
      >
        {config.label}
      </span>
    );
  };

  const getFilteredOffers = () => {
    if (filter === 'all') return offers;
    return offers.filter(offer => offer.status === filter);
  };

  const filteredOffers = getFilteredOffers();

  if (loading) {
    return (
      <div className="offers">
        <div className="loading">Loading offers...</div>
      </div>
    );
  }

  return (
    <div className="offers">
      <button className="btn btn-link back-button" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      <div className="page-header">
        <div>
          <h1>Offers Received</h1>
          <p>Manage orders from buyers</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{offers.filter(o => o.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{offers.filter(o => ['confirmed', 'shipped'].includes(o.status)).length}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{offers.filter(o => o.status === 'delivered').length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="offers-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({offers.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({offers.filter(o => o.status === 'pending').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Confirmed ({offers.filter(o => o.status === 'confirmed').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'processing' ? 'active' : ''}`}
          onClick={() => setFilter('processing')}
        >
          Processing ({offers.filter(o => o.status === 'processing').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
          onClick={() => setFilter('delivered')}
        >
          Delivered ({offers.filter(o => o.status === 'delivered').length})
        </button>
      </div>

      {filteredOffers.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: '64px' }}>📭</span>
          <h3>No {filter !== 'all' ? filter : ''} offers</h3>
          <p>You haven't received any {filter !== 'all' ? filter : ''} orders yet</p>
        </div>
      ) : (
        <div className="offers-list">
          {filteredOffers.map((offer) => (
            <div key={offer._id} className="offer-card">
              <div className="offer-header">
                <div className="offer-title">
                  <h3>{offer.orderDetails.materialTitle}</h3>
                  <p className="offer-id">Order #{offer._id.slice(-8)}</p>
                  <p className="offer-date">📅 {new Date(offer.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                {getStatusBadge(offer.status)}
              </div>

              <div className="offer-body">
                <div className="offer-grid">
                  <div className="offer-section">
                    <h4>📦 Order Details</h4>
                    <div className="detail-list">
                      <div className="detail-item">
                        <span className="label">Material:</span>
                        <span className="value">{offer.orderDetails.materialTitle}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Category:</span>
                        <span className="value">{offer.orderDetails.category}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Quantity:</span>
                        <span className="value">{offer.orderDetails.quantity} {offer.orderDetails.unit}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Price/Unit:</span>
                        <span className="value">${offer.orderDetails.pricePerUnit}</span>
                      </div>
                      <div className="detail-item total">
                        <span className="label">Total Amount:</span>
                        <span className="value">${offer.orderDetails.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="offer-section">
                    <h4>👤 Buyer Information</h4>
                    <div className="buyer-info">
                      <p><strong>Name:</strong> {offer.buyer?.name}</p>
                      <p><strong>Email:</strong> {offer.buyer?.email}</p>
                      {offer.buyer?.phone && (
                        <p><strong>Phone:</strong> {offer.buyer?.phone}</p>
                      )}
                    </div>

                    <h4>📍 Shipping Address</h4>
                    <div className="shipping-address">
                      <p>{offer.shippingAddress?.street}</p>
                      <p>{offer.shippingAddress?.city}, {offer.shippingAddress?.state} {offer.shippingAddress?.zipCode}</p>
                      <p>{offer.shippingAddress?.country}</p>
                    </div>
                  </div>
                </div>

                {offer.notes && (
                  <div className="offer-notes">
                    <strong>📝 Buyer Notes:</strong>
                    <p>{offer.notes}</p>
                  </div>
                )}

                {offer.statusHistory && offer.statusHistory.length > 0 && (
                  <div className="status-history">
                    <h4>📋 Status History</h4>
                    <div className="history-timeline">
                      {offer.statusHistory.map((history, index) => (
                        <div key={index} className="history-item">
                          <div className="history-dot"></div>
                          <div className="history-content">
                            <span className="history-status">{history.status}</span>
                            <span className="history-date">{new Date(history.timestamp).toLocaleString()}</span>
                            {history.note && <p className="history-note">{history.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="offer-actions">
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/order/${offer._id}`);
                  }}
                  type="button"
                >
                  View Full Details
                </button>

                {offer.status === 'pending' && (
                  <>
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUpdateStatus(offer._id, 'confirmed');
                      }}
                      type="button"
                    >
                      ✅ Confirm Order
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUpdateStatus(offer._id, 'cancelled');
                      }}
                      type="button"
                    >
                      ❌ Reject
                    </button>
                  </>
                )}

                {offer.status === 'confirmed' && (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUpdateStatus(offer._id, 'shipped');
                    }}
                    type="button"
                  >
                    🚚 Mark as Shipped
                  </button>
                )}

                {offer.status === 'shipped' && (
                  <div className="waiting-confirmation">
                    <span className="info-badge">⏳ Waiting for buyer to confirm delivery</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Offers;

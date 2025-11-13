import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../utils/api';
import './MyOrders.css';

const MyOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = user.role === 'buyer' 
        ? await orderAPI.getBuyerOrders()
        : await orderAPI.getSellerOrders();
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderAPI.cancelOrder(orderId);
        alert('Order cancelled successfully');
        fetchOrders();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel order');
      }
    }
  };

  const handleConfirmDelivery = async (orderId) => {
    const isUndamaged = window.confirm(
      '⚠️ IMPORTANT: Did you receive the product WITHOUT any damage?\n\n' +
      'Click "OK" if product is in good condition\n' +
      'Click "Cancel" if product is damaged'
    );

    const feedback = prompt('Please provide any feedback (optional):');
    
    try {
      await orderAPI.confirmDelivery(orderId, isUndamaged, feedback);
      alert(isUndamaged 
        ? '✅ Delivery confirmed! Thank you for your purchase.' 
        : '⚠️ Order cancelled due to damage. Seller has been notified.'
      );
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to confirm delivery');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: '#f59e0b', label: 'Pending' },
      confirmed: { color: '#3b82f6', label: 'Confirmed' },
      shipped: { color: '#6366f1', label: 'Shipped' },
      delivered: { color: '#10b981', label: 'Delivered' },
      cancelled: { color: '#ef4444', label: 'Cancelled' }
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

  if (loading) {
    return (
      <div className="my-orders">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <button className="btn btn-link back-button" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      <div className="page-header">
        <h1>{user.role === 'buyer' ? 'My Orders' : 'Received Orders'}</h1>
        <p>{user.role === 'buyer' ? 'Track your purchases' : 'Manage customer orders'}</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: '64px' }}>📦</span>
          <h3>No orders yet</h3>
          <p>{user.role === 'buyer' ? 'Start shopping in the marketplace' : 'No orders received yet'}</p>
          {user.role === 'buyer' && (
            <button className="btn btn-primary" onClick={() => navigate('/marketplace')}>
              Browse Marketplace
            </button>
          )}
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>{order.orderDetails.materialTitle}</h3>
                  <p className="order-id">Order #{order._id.slice(-8)}</p>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="order-body">
                <div className="order-details-grid">
                  <div className="detail-item">
                    <span className="label">Quantity:</span>
                    <span className="value">{order.orderDetails.quantity} {order.orderDetails.unit}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Price per unit:</span>
                    <span className="value">₹{order.orderDetails.pricePerUnit}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Total Amount:</span>
                    <span className="value total-price">₹{order.orderDetails.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Order Date:</span>
                    <span className="value">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="party-info">
                  {user.role === 'buyer' ? (
                    <>
                      <strong>Seller:</strong> {order.seller?.name} ({order.seller?.email})
                    </>
                  ) : (
                    <>
                      <strong>Buyer:</strong> {order.buyer?.name} ({order.buyer?.email})
                      <br />
                      <strong>Shipping:</strong> {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                    </>
                  )}
                </div>

                {order.notes && (
                  <div className="order-notes">
                    <strong>Notes:</strong> {order.notes}
                  </div>
                )}

                {/* Show rejection/cancellation reason to buyer */}
                {user.role === 'buyer' && (order.status === 'cancelled' || order.status === 'refunded') && order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="rejection-reason">
                    <strong>⚠️ Cancellation Reason:</strong>
                    {(() => {
                      const cancellationHistory = order.statusHistory
                        .filter(h => h.status === 'cancelled' || h.status === 'refunded')
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
                      
                      return cancellationHistory?.note 
                        ? <p>{cancellationHistory.note}</p>
                        : <p>No reason provided</p>;
                    })()}
                  </div>
                )}

                {/* Show delivery feedback for completed orders */}
                {order.status === 'delivered' && order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="delivery-feedback">
                    <strong>✅ Delivery Confirmation:</strong>
                    {(() => {
                      const deliveryHistory = order.statusHistory
                        .filter(h => h.status === 'delivered')
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
                      
                      return deliveryHistory?.note 
                        ? <p>{deliveryHistory.note}</p>
                        : <p>Delivered successfully</p>;
                    })()}
                  </div>
                )}

                {/* Show status timeline */}
                {order.statusHistory && order.statusHistory.length > 1 && (
                  <div className="status-timeline">
                    <strong>📋 Order Timeline:</strong>
                    <div className="timeline-items">
                      {order.statusHistory
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .map((history, index) => (
                          <div key={index} className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                              <span className="timeline-status">{history.status}</span>
                              <span className="timeline-date">
                                {new Date(history.timestamp).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {history.note && (
                                <p className="timeline-note">{history.note}</p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="order-actions">
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/order/${order._id}`);
                  }}
                  type="button"
                >
                  View Details
                </button>
                
                {user.role === 'buyer' && (order.status === 'pending' || order.status === 'confirmed') && (
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCancelOrder(order._id);
                    }}
                    type="button"
                  >
                    Cancel Order
                  </button>
                )}

                {user.role === 'buyer' && order.status === 'shipped' && (
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleConfirmDelivery(order._id);
                    }}
                    type="button"
                  >
                    ✅ Confirm Delivery
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;

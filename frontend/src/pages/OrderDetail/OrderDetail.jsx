import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../utils/api';
import './OrderDetail.css';

const OrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const response = await orderAPI.getOne(id);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError(error.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderAPI.cancelOrder(id);
        alert('Order cancelled successfully');
        navigate('/my-orders');
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel order');
      }
    }
  };

  const handleConfirmDelivery = async () => {
    const isUndamaged = window.confirm(
      '⚠️ IMPORTANT: Did you receive the product WITHOUT any damage?\n\n' +
      'Click "OK" if product is in good condition\n' +
      'Click "Cancel" if product is damaged'
    );

    const feedback = prompt('Please provide any feedback (optional):');
    
    try {
      await orderAPI.confirmDelivery(id, isUndamaged, feedback);
      alert(isUndamaged 
        ? '✅ Delivery confirmed! Thank you for your purchase.' 
        : '⚠️ Order cancelled due to damage. Seller has been notified.'
      );
      fetchOrderDetail();
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
      <div className="order-detail">
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail">
        <button className="btn btn-link back-button" onClick={() => navigate('/my-orders')}>
          ← Back to Orders
        </button>
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail">
        <button className="btn btn-link back-button" onClick={() => navigate('/my-orders')}>
          ← Back to Orders
        </button>
        <div className="empty-state">
          <h3>Order not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail">
      <button className="btn btn-link back-button" onClick={() => navigate('/my-orders')}>
        ← Back to Orders
      </button>

      <div className="page-header">
        <div>
          <h1>Order Details</h1>
          <p className="order-id">Order ID: #{order._id}</p>
        </div>
        {getStatusBadge(order.status)}
      </div>

      <div className="order-detail-container">
        {/* Product Information */}
        <div className="detail-section">
          <h2>📦 Product Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Material:</span>
              <span className="value">{order.orderDetails.materialTitle}</span>
            </div>
            <div className="info-item">
              <span className="label">Quantity:</span>
              <span className="value">{order.orderDetails.quantity} {order.orderDetails.unit}</span>
            </div>
            <div className="info-row">
              <span className="label">Price per Unit:</span>
              <span className="value">₹{order.orderDetails.pricePerUnit}</span>
            </div>
            <div className="info-row">
              <span className="label">Total Price:</span>
              <span className="value total-price">₹{order.orderDetails.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Buyer/Seller Information */}
        <div className="detail-section">
          <h2>👥 {user.role === 'buyer' ? 'Seller' : 'Buyer'} Information</h2>
          <div className="info-grid">
            {user.role === 'buyer' ? (
              <>
                <div className="info-item">
                  <span className="label">Name:</span>
                  <span className="value">{order.seller?.name}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{order.seller?.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">Phone:</span>
                  <span className="value">{order.seller?.phone || 'N/A'}</span>
                </div>
              </>
            ) : (
              <>
                <div className="info-item">
                  <span className="label">Name:</span>
                  <span className="value">{order.buyer?.name}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{order.buyer?.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">Phone:</span>
                  <span className="value">{order.buyer?.phone || 'N/A'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Shipping Information */}
        <div className="detail-section">
          <h2>🚚 Shipping Information</h2>
          <div className="shipping-address">
            <p><strong>Delivery Address:</strong></p>
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
            <p>{order.shippingAddress?.country}</p>
          </div>
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div className="detail-section">
            <h2>📝 Order Notes</h2>
            <p className="order-notes-text">{order.notes}</p>
          </div>
        )}

        {/* Cancellation/Rejection Reason */}
        {user.role === 'buyer' && (order.status === 'cancelled' || order.status === 'refunded') && order.statusHistory && order.statusHistory.length > 0 && (
          <div className="detail-section alert-section">
            <h2>⚠️ Cancellation Information</h2>
            {(() => {
              const cancellationHistory = order.statusHistory
                .filter(h => h.status === 'cancelled' || h.status === 'refunded')
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
              
              return cancellationHistory?.note 
                ? <p className="cancellation-reason">{cancellationHistory.note}</p>
                : <p className="cancellation-reason">No reason provided</p>;
            })()}
          </div>
        )}

        {/* Delivery Feedback */}
        {order.status === 'delivered' && order.statusHistory && order.statusHistory.length > 0 && (
          <div className="detail-section success-section">
            <h2>✅ Delivery Confirmation</h2>
            {(() => {
              const deliveryHistory = order.statusHistory
                .filter(h => h.status === 'delivered')
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
              
              return deliveryHistory?.note 
                ? <p className="delivery-feedback-text">{deliveryHistory.note}</p>
                : <p className="delivery-feedback-text">Delivered successfully</p>;
            })()}
          </div>
        )}

        {/* Status Timeline */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="detail-section">
            <h2>📋 Order Timeline</h2>
            <div className="timeline">
              {order.statusHistory
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((history, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-status">{history.status.toUpperCase()}</span>
                        <span className="timeline-date">
                          {new Date(history.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {history.note && (
                        <p className="timeline-note">{history.note}</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Order Metadata */}
        <div className="detail-section">
          <h2>ℹ️ Order Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Order Date:</span>
              <span className="value">{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div className="info-item">
              <span className="label">Last Updated:</span>
              <span className="value">{new Date(order.updatedAt).toLocaleString()}</span>
            </div>
            <div className="info-item">
              <span className="label">Order Status:</span>
              <span className="value">{getStatusBadge(order.status)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="order-actions-footer">
          {user.role === 'buyer' && (order.status === 'pending' || order.status === 'confirmed') && (
            <button 
              className="btn btn-danger"
              onClick={handleCancelOrder}
            >
              Cancel Order
            </button>
          )}

          {user.role === 'buyer' && order.status === 'shipped' && (
            <button 
              className="btn btn-success"
              onClick={handleConfirmDelivery}
            >
              ✅ Confirm Delivery
            </button>
          )}

          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/my-orders')}
          >
            Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

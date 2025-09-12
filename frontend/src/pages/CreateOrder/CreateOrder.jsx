import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../utils/api';
import './CreateOrder.css';

const CreateOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { listing, quantity } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState({
    quantity: quantity || 1,
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    notes: ''
  });

  if (!listing) {
    return (
      <div className="create-order">
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>No listing data found</span>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/marketplace')}>
          ← Back to Marketplace
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setOrderData({
        ...orderData,
        shippingAddress: {
          ...orderData.shippingAddress,
          [field]: value
        }
      });
    } else {
      setOrderData({
        ...orderData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const orderPayload = {
        listingId: listing._id,
        quantity: Number(orderData.quantity),
        shippingAddress: orderData.shippingAddress,
        notes: orderData.notes
      };

      const response = await orderAPI.create(orderPayload);
      
      alert('Order placed successfully! ✅');
      navigate('/my-orders');
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = listing.pricePerUnit * orderData.quantity;

  return (
    <div className="create-order">
      <button className="btn btn-link back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="page-header">
        <h1>Place Order</h1>
        <p>Review your order details and shipping information</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="order-container">
        <div className="order-summary">
          <h3>Order Summary</h3>
          
          <div className="listing-info">
            <h4>{listing.materialTitle}</h4>
            <p className="category">{listing.category}</p>
            
            <div className="order-details">
              <div className="detail-row">
                <span>Price per {listing.unit}:</span>
                <span>${listing.pricePerUnit}</span>
              </div>
              <div className="detail-row">
                <span>Quantity:</span>
                <span>{orderData.quantity} {listing.unit}</span>
              </div>
              <div className="detail-row total">
                <span>Total Amount:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="seller-info-box">
              <h5>Seller Information</h5>
              <p>👤 {listing.seller?.name}</p>
              <p>📧 {listing.seller?.email}</p>
              <p>📍 {listing.location?.address || listing.location}</p>
            </div>
          </div>
        </div>

        <div className="order-form">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Quantity</h3>
              <div className="form-group">
                <label htmlFor="quantity">
                  Quantity ({listing.unit}) *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  max={listing.availableQuantity}
                  value={orderData.quantity}
                  onChange={handleChange}
                  required
                />
                <small>Available: {listing.availableQuantity} {listing.unit}</small>
              </div>
            </div>

            <div className="form-section">
              <h3>Shipping Address</h3>
              
              <div className="form-group">
                <label htmlFor="street">Street Address *</label>
                <input
                  type="text"
                  id="street"
                  name="address.street"
                  value={orderData.shippingAddress.street}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="address.city"
                    value={orderData.shippingAddress.city}
                    onChange={handleChange}
                    placeholder="New York"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <input
                    type="text"
                    id="state"
                    name="address.state"
                    value={orderData.shippingAddress.state}
                    onChange={handleChange}
                    placeholder="NY"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="zipCode">Zip Code *</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="address.zipCode"
                    value={orderData.shippingAddress.zipCode}
                    onChange={handleChange}
                    placeholder="10001"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="country">Country *</label>
                  <input
                    type="text"
                    id="country"
                    name="address.country"
                    value={orderData.shippingAddress.country}
                    onChange={handleChange}
                    placeholder="USA"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Additional Notes (Optional)</h3>
              <div className="form-group">
                <textarea
                  id="notes"
                  name="notes"
                  value={orderData.notes}
                  onChange={handleChange}
                  placeholder="Add any special instructions or notes..."
                  rows="4"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-large"
                disabled={loading}
              >
                {loading ? 'Placing Order...' : `Place Order - $${totalPrice.toFixed(2)}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;

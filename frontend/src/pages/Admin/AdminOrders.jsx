import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import './Admin.css';

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  console.log('AdminOrders component mounted');

  useEffect(() => {
    console.log('Fetching orders on mount');
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching all orders...');
      
      const response = await adminAPI.getAllOrders();
      console.log('Orders response:', response.data);
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
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

  const getFilteredOrders = () => {
    if (filter === 'all') return orders;
    return orders.filter(order => order.status === filter);
  };

  const filteredOrders = getFilteredOrders();

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">Loading orders...</div>
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
        <button className="btn btn-secondary" onClick={fetchOrders}>
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
          <h1>All Orders</h1>
          <p>Monitor all platform transactions</p>
        </div>
        <div className="header-stats">
          <div className="stat-pill">
            <span className="stat-number">{orders.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-pill">
            <span className="stat-number">{orders.filter(o => o.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-pill">
            <span className="stat-number">{orders.filter(o => o.status === 'delivered').length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setFilter('all');
          }}
          type="button"
        >
          All ({orders.length})
        </button>
        <button 
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setFilter('pending');
          }}
          type="button"
        >
          Pending ({orders.filter(o => o.status === 'pending').length})
        </button>
        <button 
          className={`filter-tab ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setFilter('confirmed');
          }}
          type="button"
        >
          Confirmed ({orders.filter(o => o.status === 'confirmed').length})
        </button>
        <button 
          className={`filter-tab ${filter === 'shipped' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setFilter('shipped');
          }}
          type="button"
        >
          Shipped ({orders.filter(o => o.status === 'shipped').length})
        </button>
        <button 
          className={`filter-tab ${filter === 'delivered' ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setFilter('delivered');
          }}
          type="button"
        >
          Completed ({orders.filter(o => o.status === 'delivered').length})
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: '64px' }}>🛒</span>
          <h3>No {filter !== 'all' ? filter : ''} orders found</h3>
          <p>There are currently no orders in the system</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Material</th>
                <th>Buyer</th>
                <th>Seller</th>
                <th>Quantity</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Order Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-8)}</td>
                  <td>
                    <div className="table-material-info">
                      <strong>{order.orderDetails?.materialTitle || 'N/A'}</strong>
                      <small>{order.orderDetails?.category || ''}</small>
                    </div>
                  </td>
                  <td>{order.buyer?.name || 'Unknown'}</td>
                  <td>{order.seller?.name || 'Unknown'}</td>
                  <td>{order.orderDetails?.quantity || 0} {order.orderDetails?.unit || ''}</td>
                  <td>${order.orderDetails?.totalPrice?.toFixed(2) || '0.00'}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
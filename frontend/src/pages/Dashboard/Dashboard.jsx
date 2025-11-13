import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listingAPI, orderAPI, adminAPI } from '../../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [user.role]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Current user role:', user.role);
      
      if (user.role === 'seller') {
        const [listingsRes, ordersRes] = await Promise.all([
          listingAPI.getMy(),
          orderAPI.getSellerOrders()
        ]);
        
        const listings = listingsRes.data.data;
        const orders = ordersRes.data.data;
        
        setStats({
          totalListings: listings.length,
          activeListings: listings.filter(l => l.status === 'active').length,
          totalOrders: orders.length,
          pendingOffers: orders.filter(o => o.status === 'pending').length,
          confirmedOffers: orders.filter(o => o.status === 'confirmed').length,
          shippedOrders: orders.filter(o => o.status === 'shipped').length,
          completedOrders: orders.filter(o => o.status === 'delivered').length,
          totalRevenue: orders
            .filter(o => o.status === 'delivered')
            .reduce((sum, o) => sum + o.orderDetails.totalPrice, 0),
          pendingRevenue: orders
            .filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status))
            .reduce((sum, o) => sum + o.orderDetails.totalPrice, 0)
        });
        
      } else if (user.role === 'buyer') {
        const ordersRes = await orderAPI.getBuyerOrders();
        const orders = ordersRes.data.data;
        
        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
          shippedOrders: orders.filter(o => o.status === 'shipped').length,
          completedOrders: orders.filter(o => o.status === 'delivered').length,
          cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
          totalSpent: orders
            .filter(o => o.status === 'delivered')
            .reduce((sum, o) => sum + o.orderDetails.totalPrice, 0),
          pendingAmount: orders
            .filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status))
            .reduce((sum, o) => sum + o.orderDetails.totalPrice, 0)
        });
      } else if (user.role === 'admin') {
        console.log('Fetching admin stats...');
        const statsRes = await adminAPI.getStats();
        console.log('Admin API response:', statsRes);
        console.log('Admin stats data:', statsRes.data);
        
        if (statsRes.data && statsRes.data.data) {
          console.log('Setting stats:', statsRes.data.data);
          setStats(statsRes.data.data);
          setError('');
        } else {
          console.error('Invalid response structure:', statsRes);
          setError('Invalid data received from server');
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response);
      setError(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getSellerStats = () => [
    { 
      icon: '📦', 
      label: 'Active Listings', 
      value: stats?.activeListings || 0, 
      total: stats?.totalListings || 0,
      color: '#3b82f6',
      link: '/my-listings'
    },
    { 
      icon: '⏳', 
      label: 'Pending Offers', 
      value: stats?.pendingOffers || 0, 
      color: '#f59e0b',
      link: '/offers'
    },
    { 
      icon: '✅', 
      label: 'Confirmed Orders', 
      value: stats?.confirmedOffers || 0, 
      color: '#10b981',
      link: '/offers'
    },
    { 
      icon: '🚚', 
      label: 'Shipped Orders', 
      value: stats?.shippedOrders || 0, 
      color: '#6366f1',
      link: '/offers'
    },
    { 
      icon: '💰', 
      label: 'Total Revenue', 
      value: `₹${stats?.totalRevenue?.toFixed(2) || '0.00'}`, 
      color: '#10b981',
      subtitle: `Pending: ₹${stats?.pendingRevenue?.toFixed(2) || '0.00'}`
    },
    { 
      icon: '📊', 
      label: 'Completed Orders', 
      value: stats?.completedOrders || 0, 
      color: '#8b5cf6',
      link: '/offers'
    }
  ];

  const getBuyerStats = () => [
    { 
      icon: '🛒', 
      label: 'Total Orders', 
      value: stats?.totalOrders || 0, 
      color: '#3b82f6',
      link: '/my-orders'
    },
    { 
      icon: '⏳', 
      label: 'Pending Orders', 
      value: stats?.pendingOrders || 0, 
      color: '#f59e0b',
      link: '/my-orders'
    },
    { 
      icon: '✅', 
      label: 'Confirmed Orders', 
      value: stats?.confirmedOrders || 0, 
      color: '#3b82f6',
      link: '/my-orders'
    },
    { 
      icon: '🚚', 
      label: 'Shipped Orders', 
      value: stats?.shippedOrders || 0, 
      color: '#6366f1',
      link: '/my-orders'
    },
    { 
      icon: '💳', 
      label: 'Total Spent', 
      value: `₹${stats?.totalSpent?.toFixed(2) || '0.00'}`, 
      color: '#f59e0b',
      subtitle: `Pending: ₹${stats?.pendingAmount?.toFixed(2) || '0.00'}`
    },
    { 
      icon: '📦', 
      label: 'Completed Orders', 
      value: stats?.completedOrders || 0, 
      color: '#8b5cf6',
      link: '/my-orders'
    }
  ];

  const getAdminStats = () => {
    console.log('Getting admin stats from state:', stats);
    
    return [
      { 
        icon: '👥', 
        label: 'Total Users', 
        value: stats?.users?.total || 0, 
        color: '#3b82f6',
        subtitle: `${stats?.users?.buyers || 0} Buyers, ${stats?.users?.sellers || 0} Sellers`,
        link: '/admin/users'
      },
      { 
        icon: '📦', 
        label: 'Total Listings', 
        value: stats?.listings?.total || 0, 
        color: '#10b981',
        subtitle: `${stats?.listings?.active || 0} Active, ${stats?.listings?.sold || 0} Sold`,
        link: '/admin/listings'
      },
      { 
        icon: '🛒', 
        label: 'Total Orders', 
        value: stats?.orders?.total || 0, 
        color: '#f59e0b',
        subtitle: `${stats?.orders?.completed || 0} Completed, ${stats?.orders?.pending || 0} Pending`,
        link: '/admin/orders'
      }
    ];
  };

  const getStatsForRole = () => {
    if (user.role === 'seller') return getSellerStats();
    if (user.role === 'buyer') return getBuyerStats();
    if (user.role === 'admin') return getAdminStats();
    return [];
  };

  const getDashboardTitle = () => {
    if (user.role === 'seller') return 'Seller Dashboard';
    if (user.role === 'buyer') return 'Buyer Dashboard';
    if (user.role === 'admin') return 'Admin Dashboard';
    return 'Dashboard';
  };

  const getDashboardSubtitle = () => {
    if (user.role === 'seller') return 'Manage your listings and track offers';
    if (user.role === 'buyer') return 'Track your orders and purchases';
    if (user.role === 'admin') return 'Monitor platform activity and manage users';
    return 'Overview of your account';
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
        <button className="btn btn-secondary" onClick={fetchDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>{getDashboardTitle()}</h1>
          <p>{getDashboardSubtitle()}</p>
        </div>
        {user.role === 'buyer' && (
          <button className="btn btn-primary" onClick={() => navigate('/marketplace')}>
            🛒 Browse Marketplace
          </button>
        )}
        {user.role === 'seller' && (
          <button className="btn btn-primary" onClick={() => navigate('/create-listing')}>
            ➕ Create Listing
          </button>
        )}
      </div>

      <div className="stats-grid">
        {getStatsForRole().map((stat, index) => (
          <div 
            key={index} 
            className={`stat-card ${stat.link ? 'clickable' : ''}`} 
            style={{ borderLeftColor: stat.color }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (stat.link) {
                console.log('Navigating to:', stat.link);
                navigate(stat.link);
              }
            }}
          >
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20` }}>
              <span style={{ fontSize: '32px' }}>{stat.icon}</span>
            </div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">
                {stat.value}
                {stat.total !== undefined && <span className="stat-total"> / {stat.total}</span>}
              </div>
              {stat.subtitle && <div className="stat-subtitle">{stat.subtitle}</div>}
            </div>
          </div>
        ))}
      </div>

      {user.role === 'seller' && stats?.pendingOffers > 0 && (
        <div className="dashboard-alert">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <h3>Action Required</h3>
            <p>You have {stats.pendingOffers} pending {stats.pendingOffers === 1 ? 'offer' : 'offers'} waiting for your response</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/offers');
            }}
            type="button"
          >
            Review Offers
          </button>
        </div>
      )}

      {user.role === 'buyer' && stats?.shippedOrders > 0 && (
        <div className="dashboard-alert">
          <div className="alert-icon">📦</div>
          <div className="alert-content">
            <h3>Confirm Delivery</h3>
            <p>You have {stats.shippedOrders} {stats.shippedOrders === 1 ? 'order' : 'orders'} marked as shipped. Confirm delivery once received.</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/my-orders');
            }}
            type="button"
          >
            View Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
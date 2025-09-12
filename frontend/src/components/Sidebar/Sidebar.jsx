import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(false);
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getBuyerMenu = () => [
    { icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { icon: '🛒', label: 'Marketplace', path: '/marketplace' },
    { icon: '📦', label: 'My Orders', path: '/my-orders' }
  ];

  const getSellerMenu = () => [
    { icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { icon: '📦', label: 'My Listings', path: '/my-listings' },
    { icon: '➕', label: 'Create Listing', path: '/create-listing' },
    { icon: '💼', label: 'Offers', path: '/offers' }
  ];

  const getAdminMenu = () => [
    { icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { icon: '👥', label: 'Users', path: '/admin/users' },
    { icon: '📦', label: 'All Listings', path: '/admin/listings' },
    { icon: '🛒', label: 'All Orders', path: '/admin/orders' }
  ];

  const getMenuForRole = () => {
    if (user.role === 'buyer') return getBuyerMenu();
    if (user.role === 'seller') return getSellerMenu();
    if (user.role === 'admin') return getAdminMenu();
    return [];
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleSidebar();
        }}
        type="button"
      >
        <span className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Toggle Button - Desktop Only */}
        <button 
          className="sidebar-toggle desktop-only" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
          }}
          type="button"
        >
          <span className={`menu-icon ${isCollapsed ? 'collapsed' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <div className="sidebar-header">
          <div 
            className="logo" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNavigation('/dashboard');
            }}
          >
            <div className="logo-icon">
              <img 
                src="/logo.png" 
                alt="Scravo Logo" 
                className="logo-icon-img"
              />
            </div>
            {!isCollapsed && <span className="logo-text">scravo</span>}
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {getMenuForRole().map((item, index) => (
            <div
              key={index}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNavigation(item.path);
              }}
              title={isCollapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div
            className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNavigation('/settings');
            }}
            title={isCollapsed ? 'Settings' : ''}
          >
            <span className="nav-icon">⚙️</span>
            {!isCollapsed && <span className="nav-label">Settings</span>}
          </div>
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
          }}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: '#6366f1',
      buyer: '#10b981',
      seller: '#f59e0b'
    };
    return colors[role] || '#6b7280';
  };

  return (
    <div className="header">
      <div className="header-content">
        <div className="header-left">
          <h3>Welcome back, {user.name}!</h3>
          <p>Have a great day</p>
        </div>
        <div className="header-right">
          <button 
            className="logout-btn" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLogout();
            }}
            type="button"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
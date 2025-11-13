import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import './RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();
  const [adminExists, setAdminExists] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const response = await authAPI.checkAdminExists();
      setAdminExists(response.data.adminExists);
    } catch (error) {
      console.error('Error checking admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    navigate('/login', { state: { role } });
  };

  const roles = [
    {
      id: 'buyer',
      title: 'Buyer',
      description: 'Browse and purchase scrap materials from verified sellers',
      icon: '🛒',
      color: '#10b981'
    },
    {
      id: 'seller',
      title: 'Seller',
      description: 'List your scrap materials and connect with potential buyers',
      icon: '💼',
      color: '#f59e0b'
    }
  ];

  // Only show admin if no admin exists yet
  if (!adminExists && !loading) {
    roles.push({
      id: 'admin',
      title: 'Admin',
      description: 'Manage platform operations and oversee all activities',
      icon: '👨‍💼',
      color: '#6366f1'
    });
  }

  if (loading) {
    return (
      <div className="role-selection-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="role-selection-container">
      <div className="role-selection-content">
        <div className="role-selection-header">
          <div className="logo">
            <img src="/logo.png" alt="Scravo Logo" className="logo-icon-img" />
            <h1>scravo</h1>
          </div>
          <h2>Choose Your Role</h2>
          <p>Select how you want to use the platform</p>
        </div>

        <div className="roles-grid">
          {roles.map((role) => (
            <div key={role.id} className="role-card">
              <div className="role-icon" style={{ backgroundColor: `${role.color}20` }}>
                <span style={{ color: role.color, fontSize: '48px' }}>{role.icon}</span>
              </div>
              <h3>{role.title}</h3>
              <p>{role.description}</p>
              <button
                className="role-btn"
                style={{ backgroundColor: role.color }}
                onClick={() => handleRoleSelect(role.id)}
              >
                Continue as {role.title}
              </button>
            </div>
          ))}
        </div>

        <div className="admin-login-link">
          <p>Are you an admin?</p>
          <button 
            className="admin-login-btn"
            onClick={() => navigate('/login', { state: { role: 'admin' } })}
          >
            🔐 Admin Login
          </button>
        </div>

        <div className="role-selection-footer">
          <p>© 2025 Scravo. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
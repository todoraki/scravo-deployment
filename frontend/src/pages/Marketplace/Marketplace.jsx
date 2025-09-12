import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingAPI } from '../../utils/api';
import './Marketplace.css';

const Marketplace = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching marketplace listings...');
      console.log('📍 API endpoint:', '/api/listings/marketplace');
      console.log('🔧 Filters:', filters);
      
      const response = await listingAPI.getAll(filters);
      console.log('✅ API Response:', response);
      console.log('📦 Data:', response.data);
      console.log('📋 Listings array:', response.data.data);
      console.log('🔢 Count:', response.data.data?.length);
      
      setListings(response.data.data || []);
      setError('');
    } catch (error) {
      console.error('❌ Error fetching listings:', error);
      console.error('📛 Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = () => {
    fetchListings();
  };

  const handleViewDetails = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  if (loading) {
    return (
      <div className="marketplace">
        <div className="loading">Loading marketplace...</div>
      </div>
    );
  }

  return (
    <div className="marketplace">
      <button className="btn btn-link back-button" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      <div className="page-header">
        <h1>Marketplace</h1>
        <p>Browse and purchase scrap materials</p>
      </div>

      {/* Filters */}
      <div className="marketplace-filters">
        <div className="filter-group">
          <input
            type="text"
            name="search"
            placeholder="Search materials..."
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">All Categories</option>
            <option value="Metals">Metals</option>
            <option value="Plastics">Plastics</option>
            <option value="Paper">Paper</option>
            <option value="Glass">Glass</option>
            <option value="Electronics">Electronics</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="filter-group">
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={handleFilterChange}
          />
        </div>

        <button className="btn btn-primary" onClick={handleSearch}>
          Search
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {listings.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: '64px' }}>📦</span>
          <h3>No listings available</h3>
          <p>Check back later for new materials</p>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map((listing) => (
            <div key={listing._id} className="listing-card">
              <div className="listing-image">
                {listing.images && listing.images.length > 0 ? (
                  <img 
                    src={`http://localhost:5000${listing.images[0]}`} 
                    alt={listing.materialTitle}
                    onError={(e) => {
                      console.error('Image load error:', e.target.src);
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="no-image">📦</div>';
                    }}
                  />
                ) : (
                  <div className="no-image">📦</div>
                )}
              </div>

              <div className="listing-content">
                <div className="listing-category">{listing.category}</div>
                <h3>{listing.materialTitle}</h3>
                <p className="listing-description">{listing.description}</p>

                <div className="listing-details">
                  <div className="detail-item">
                    <span className="label">Quantity:</span>
                    <span className="value">{listing.quantity} {listing.unit}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Price:</span>
                    <span className="value price">${listing.pricePerUnit}/{listing.unit}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Location:</span>
                    <span className="value">📍 {listing.location?.address || listing.location}</span>
                  </div>
                </div>

                <div className="listing-seller">
                  <span>Seller: {listing.seller?.name || 'Unknown'}</span>
                </div>
              </div>

              <div className="listing-footer">
                <button 
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/listing/${listing._id}`);
                  }}
                  type="button"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;

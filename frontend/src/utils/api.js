import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds timeout
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  checkAdminExists: () => api.get('/auth/check-admin')
};

// Listing APIs
export const listingAPI = {
  getAll: (params) => api.get('/listings/marketplace', { params }),
  getOne: (id) => api.get(`/listings/${id}`),
  getMy: () => api.get('/listings/seller/my-listings'),
  create: (data) => api.post('/listings', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/listings/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/listings/${id}`)
};

// Transaction APIs
export const transactionAPI = {
  getAll: () => api.get('/transactions'),
  getOne: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  updateStatus: (id, status) => api.put(`/transactions/${id}/status`, { status }),
  cancel: (id) => api.delete(`/transactions/${id}`),
  getSellerStats: () => api.get('/transactions/stats/seller'),
  getBuyerStats: () => api.get('/transactions/stats/buyer')
};

// Order APIs
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getBuyerOrders: () => api.get('/orders/buyer/my-orders'),
  getSellerOrders: () => api.get('/orders/seller/my-orders'),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status, note) => api.put(`/orders/${id}/status`, { status, note }),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  confirmDelivery: (id, isUndamaged, feedback) => api.put(`/orders/${id}/confirm-delivery`, { isUndamaged, feedback })
};

// Admin APIs
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getAllUsers: () => api.get('/admin/users'),
  getUserStats: () => api.get('/admin/users/stats'),
  getAllListings: () => api.get('/admin/listings'),
  getAllOrders: () => api.get('/admin/orders'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  deleteListing: (id) => api.delete(`/admin/listings/${id}`)
};

export default api;
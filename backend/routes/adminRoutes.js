const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  getUserStats,
  getAllListings,
  getAllOrders,
  deleteUser,
  deleteListing
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

console.log('Admin routes loading...');

// Protect all admin routes
router.use(protect);

// Test route to verify authentication
router.get('/test', (req, res) => {
  console.log('Admin test route hit');
  res.json({
    success: true,
    message: 'Admin route accessible',
    user: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role
    }
  });
});

// Apply authorization middleware
router.use(authorize('admin'));

router.get('/stats', (req, res, next) => {
  console.log('Stats route hit');
  next();
}, getAdminStats);

router.get('/users', getAllUsers);
router.get('/users/stats', getUserStats);
router.get('/listings', getAllListings);
router.get('/orders', getAllOrders);
router.delete('/users/:id', deleteUser);
router.delete('/listings/:id', deleteListing);

console.log('Admin routes loaded successfully');

module.exports = router;
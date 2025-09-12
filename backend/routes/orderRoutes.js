const express = require('express');
const router = express.Router();
const {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  confirmDelivery
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.post('/', createOrder);
router.get('/buyer/my-orders', getBuyerOrders);
router.get('/seller/my-orders', getSellerOrders);
router.get('/:id', getOrder);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/confirm-delivery', confirmDelivery);

module.exports = router;

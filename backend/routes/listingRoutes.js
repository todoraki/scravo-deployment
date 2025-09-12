const express = require('express');
const router = express.Router();
const {
  createListing,
  getMarketplaceListings,
  getSellerListings,
  getListing,
  updateListing,
  deleteListing
} = require('../controllers/listingController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Test route
router.post('/test', (req, res) => {
  res.json({ received: req.body, success: true });
});

// Public routes
router.get('/marketplace', getMarketplaceListings);

// Protected routes - SPECIFIC ROUTES FIRST! (CRITICAL ORDER)
router.get('/seller/my-listings', protect, getSellerListings);
router.post('/', protect, upload.array('images', 5), createListing);
router.put('/:id', protect, upload.array('images', 5), updateListing);
router.delete('/:id', protect, deleteListing);

// Parameterized routes LAST (otherwise /:id catches everything)
router.get('/:id', getListing);

module.exports = router;

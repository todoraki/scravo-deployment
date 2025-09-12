const Order = require('../models/Order');
const Listing = require('../models/Listing');

// Create new order (buyer purchases)
exports.createOrder = async (req, res) => {
  try {
    const { listingId, quantity, shippingAddress, notes } = req.body;

    // Find listing
    const listing = await Listing.findById(listingId).populate('seller');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if listing is active and visible
    if (listing.status !== 'active' || !listing.isMarketplaceVisible) {
      return res.status(400).json({
        success: false,
        message: 'Listing is not available for purchase'
      });
    }

    // Check availability against availableQuantity
    if (!listing.checkAvailability(quantity)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient quantity available. Please contact seller.`
      });
    }

    // Calculate total price
    const totalPrice = listing.pricePerUnit * quantity;

    // Create order
    const order = await Order.create({
      buyer: req.user._id,
      seller: listing.seller._id,
      listing: listing._id,
      orderDetails: {
        materialTitle: listing.materialTitle,
        category: listing.category,
        quantity,
        unit: listing.unit,
        pricePerUnit: listing.pricePerUnit,
        totalPrice,
        location: listing.location.address || listing.location
      },
      shippingAddress,
      notes
    });

    // Add initial status to history
    order.addStatusHistory('pending', 'Order placed');
    await order.save();

    // Reserve quantity in listing
    listing.reserveQuantity(quantity);
    await listing.save();

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('listing');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get buyer's orders
exports.getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('seller', 'name email phone')
      .populate('listing', 'materialTitle images')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get seller's orders
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user._id })
      .populate('buyer', 'name email phone')
      .populate('listing', 'materialTitle images')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email phone')
      .populate('seller', 'name email phone')
      .populate('listing');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (
      order.buyer._id.toString() !== req.user._id.toString() &&
      order.seller._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update order status (seller only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const order = await Order.findById(req.params.id).populate('listing');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is the seller (unless admin)
    if (order.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only seller can update order status'
      });
    }

    // Sellers can only update to: confirmed, shipped, cancelled
    const allowedSellerStatuses = ['confirmed', 'shipped', 'cancelled'];
    if (!allowedSellerStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Sellers can only confirm, ship, or cancel orders. Delivery must be confirmed by buyer.'
      });
    }

    order.status = status;
    order.addStatusHistory(status, note);

    // If order is cancelled, return quantity to available
    if (status === 'cancelled') {
      const listing = await Listing.findById(order.listing._id);
      listing.availableQuantity += order.orderDetails.quantity;
      listing.reservedQuantity -= order.orderDetails.quantity;
      await listing.save();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Confirm delivery (buyer only)
exports.confirmDelivery = async (req, res) => {
  try {
    const { isUndamaged, feedback } = req.body;
    
    const order = await Order.findById(req.params.id).populate('listing');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is the buyer
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only buyer can confirm delivery'
      });
    }

    // Can only confirm if order is shipped
    if (order.status !== 'shipped') {
      return res.status(400).json({
        success: false,
        message: 'Order must be shipped before confirming delivery'
      });
    }

    if (!isUndamaged) {
      // If product is damaged, buyer can report issue
      order.status = 'cancelled';
      order.addStatusHistory('cancelled', `Product damaged - Buyer feedback: ${feedback}`);
      
      // Return quantity to available
      const listing = await Listing.findById(order.listing._id);
      listing.availableQuantity += order.orderDetails.quantity;
      listing.reservedQuantity -= order.orderDetails.quantity;
      await listing.save();
      
      await order.save();
      
      return res.status(200).json({
        success: true,
        message: 'Order cancelled due to damage. Seller has been notified.',
        data: order
      });
    }

    // Product received without damage
    order.status = 'delivered';
    order.addStatusHistory('delivered', `Delivered successfully - Buyer feedback: ${feedback || 'No feedback'}`);
    
    // Mark quantity as sold in listing
    const listing = await Listing.findById(order.listing._id);
    listing.markAsSold(order.orderDetails.quantity);
    await listing.save();
    
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Delivery confirmed successfully!',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Cancel order (buyer only)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only buyer can cancel
    if (order.buyer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Can only cancel if pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel pending or confirmed orders'
      });
    }

    // Restore listing quantity
    const listing = await Listing.findById(order.listing);
    if (listing) {
      listing.availableQuantity += order.orderDetails.quantity;
      listing.reservedQuantity -= order.orderDetails.quantity;
      if (listing.status === 'sold') {
        listing.status = 'active';
      }
      await listing.save();
    }

    order.status = 'cancelled';
    order.addStatusHistory('cancelled', 'Cancelled by buyer');
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

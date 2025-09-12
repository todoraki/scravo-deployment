const User = require('../models/User');
const Listing = require('../models/Listing');
const Order = require('../models/Order');

// Get admin dashboard statistics
exports.getAdminStats = async (req, res) => {
  try {
    console.log('=== ADMIN STATS REQUEST ===');
    console.log('User:', req.user);
    
    // Get all users
    const totalUsers = await User.countDocuments();
    const buyers = await User.countDocuments({ role: 'buyer' });
    const sellers = await User.countDocuments({ role: 'seller' });
    
    console.log('User counts:', { totalUsers, buyers, sellers });
    
    // Get all listings
    const totalListings = await Listing.countDocuments();
    const activeListings = await Listing.countDocuments({ status: 'active' });
    const soldListings = await Listing.countDocuments({ status: 'sold' });
    
    console.log('Listing counts:', { totalListings, activeListings, soldListings });
    
    // Get all orders
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    
    console.log('Order counts:', { totalOrders, pendingOrders, completedOrders, cancelledOrders });
    
    // Calculate total revenue
    const completedOrdersData = await Order.find({ status: 'delivered' });
    const totalRevenue = completedOrdersData.reduce((sum, order) => sum + (order.orderDetails?.totalPrice || 0), 0);
    
    console.log('Total revenue:', totalRevenue);
    
    const statsData = {
      users: {
        total: totalUsers,
        buyers,
        sellers
      },
      listings: {
        total: totalListings,
        active: activeListings,
        sold: soldListings
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders
      },
      revenue: {
        total: totalRevenue
      }
    };
    
    console.log('Sending stats:', statsData);
    
    res.status(200).json({
      success: true,
      data: statsData
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.stack
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all listings (admin view)
exports.getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate('seller', 'name email')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    console.error('Get all listings error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all orders (admin view)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('listing', 'materialTitle')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Cannot delete admin
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin user'
      });
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete listing
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }
    
    await listing.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get detailed user statistics
exports.getUserStats = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    
    // Get activity stats for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      let userStats = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
        isActive: user.isActive
      };

      if (user.role === 'seller' || user.role === 'both') {
        const listings = await Listing.countDocuments({ seller: user._id });
        const activeListings = await Listing.countDocuments({ seller: user._id, status: 'active' });
        const orders = await Order.countDocuments({ seller: user._id });
        const completedOrders = await Order.countDocuments({ seller: user._id, status: 'delivered' });
        const revenue = await Order.find({ seller: user._id, status: 'delivered' })
          .then(orders => orders.reduce((sum, o) => sum + o.orderDetails.totalPrice, 0));

        userStats.sellerStats = {
          totalListings: listings,
          activeListings: activeListings,
          totalOrders: orders,
          completedOrders: completedOrders,
          revenue: revenue
        };
      }

      if (user.role === 'buyer' || user.role === 'both') {
        const orders = await Order.countDocuments({ buyer: user._id });
        const completedOrders = await Order.countDocuments({ buyer: user._id, status: 'delivered' });
        const totalSpent = await Order.find({ buyer: user._id, status: 'delivered' })
          .then(orders => orders.reduce((sum, o) => sum + o.orderDetails.totalPrice, 0));

        userStats.buyerStats = {
          totalOrders: orders,
          completedOrders: completedOrders,
          totalSpent: totalSpent
        };
      }

      return userStats;
    }));

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      data: usersWithStats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

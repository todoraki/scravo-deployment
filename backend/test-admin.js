const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Listing = require('./models/Listing');
const Order = require('./models/Order');

async function testAdminStats() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scravo');
    console.log('✅ Connected to MongoDB\n');

    // Test user counts
    const totalUsers = await User.countDocuments();
    const buyers = await User.countDocuments({ role: 'buyer' });
    const sellers = await User.countDocuments({ role: 'seller' });
    const admins = await User.countDocuments({ role: 'admin' });

    console.log('👥 USER STATS:');
    console.log(`Total: ${totalUsers}`);
    console.log(`Buyers: ${buyers}`);
    console.log(`Sellers: ${sellers}`);
    console.log(`Admins: ${admins}\n`);

    // Test listing counts
    const totalListings = await Listing.countDocuments();
    const activeListings = await Listing.countDocuments({ status: 'active' });
    const soldListings = await Listing.countDocuments({ status: 'sold' });

    console.log('📦 LISTING STATS:');
    console.log(`Total: ${totalListings}`);
    console.log(`Active: ${activeListings}`);
    console.log(`Sold: ${soldListings}\n`);

    // Test order counts
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'delivered' });

    console.log('🛒 ORDER STATS:');
    console.log(`Total: ${totalOrders}`);
    console.log(`Pending: ${pendingOrders}`);
    console.log(`Completed: ${completedOrders}\n`);

    // Check if admin user exists
    const adminUser = await User.findOne({ role: 'admin' });
    console.log('👨‍💼 ADMIN USER:');
    if (adminUser) {
      console.log(`Name: ${adminUser.name}`);
      console.log(`Email: ${adminUser.email}`);
    } else {
      console.log('⚠️  No admin user found!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAdminStats();

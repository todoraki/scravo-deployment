const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ===== CRITICAL: Middleware MUST be in this exact order =====

// 1. Body Parser Middleware (FIRST!)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. CORS Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Logging Middleware (for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ===== Database Connection =====
const connectDB = async () => {
  const maxRetries = 5;
  let currentRetry = 0;
  
  const attemptConnection = async () => {
    try {
      mongoose.set('strictQuery', false);
      mongoose.set('bufferCommands', false);
      
      const conn = await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scravo',
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        }
      );
      
      console.log('✅ MongoDB Connected Successfully!');
      console.log(`📦 Database: ${conn.connection.name}`);
      console.log(`🌍 Host: ${conn.connection.host}`);
    } catch (error) {
      currentRetry++;
      console.error(`❌ MongoDB Connection Error (Attempt ${currentRetry}/${maxRetries}):`, error.message);
      
      if (currentRetry < maxRetries) {
        console.log(`🔄 Retrying in 3 seconds...`);
        setTimeout(attemptConnection, 3000);
      } else {
        console.error('💡 Make sure MongoDB is running:');
        console.error('   brew services start mongodb-community');
        console.error('   OR');
        console.error('   mongod --dbpath /usr/local/var/mongodb');
        process.exit(1);
      }
    }
  };
  
  await attemptConnection();
};

// Connect to database
connectDB();

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    mongoStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
console.log('Mounting routes...');
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
console.log('Routes mounted successfully');

// List all registered routes (for debugging)
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`Route: ${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        console.log(`Route: ${Object.keys(handler.route.methods)} ${handler.route.path}`);
      }
    });
  }
});

// ===== Error Handler =====
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message
  });
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('  - GET  /api/test');
  console.log('  - GET  /health');
  console.log('  - POST /api/auth/register');
  console.log('  - POST /api/auth/login');
  console.log('  - GET  /api/auth/check-admin');
  console.log('  - GET  /api/admin/stats');
  console.log('  - GET  /api/admin/users');
  console.log('  - GET  /api/listings/marketplace');
  console.log('  - GET  /api/orders/buyer/my-orders');
  console.log('  - GET  /api/orders/seller/my-orders');
});

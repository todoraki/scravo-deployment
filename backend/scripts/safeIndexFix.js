const mongoose = require('mongoose');
require('dotenv').config();

async function safeIndexFix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scravo');
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check if listings collection exists
    const collections = await db.listCollections({ name: 'listings' }).toArray();
    
    if (collections.length === 0) {
      console.log('\nℹ️  Listings collection does not exist yet.');
      console.log('✅ This is normal for a fresh database.');
      console.log('💡 The collection and indexes will be created automatically when you create your first listing.');
      process.exit(0);
    }
    
    const listingsCollection = db.collection('listings');
    
    // Step 1: List current indexes
    console.log('\n📋 Current indexes:');
    try {
      const indexes = await listingsCollection.indexes();
      indexes.forEach(idx => console.log('  -', idx.name));
    } catch (err) {
      console.log('  No indexes yet');
    }
    
    // Step 2: Drop ONLY the geospatial index if it exists
    console.log('\n🗑️  Dropping geospatial index...');
    try {
      await listingsCollection.dropIndex('location.coordinates_2dsphere');
      console.log('✅ Dropped location.coordinates_2dsphere');
    } catch (err) {
      console.log('ℹ️  No geospatial index found');
    }
    
    // Step 3: Count and optionally delete listings
    const count = await listingsCollection.countDocuments();
    console.log(`\n📊 Found ${count} existing listings`);
    
    if (count > 0) {
      console.log('🗑️  Deleting old listings with wrong structure...');
      const deleteResult = await listingsCollection.deleteMany({});
      console.log(`✅ Deleted ${deleteResult.deletedCount} listings`);
    }
    
    // Step 4: Recreate the index with correct schema
    console.log('\n🔧 Creating new geospatial index...');
    await listingsCollection.createIndex(
      { 'location.coordinates': '2dsphere' },
      { name: 'location_coordinates_2dsphere' }
    );
    console.log('✅ Geospatial index created');
    
    console.log('\n✅ Database is ready!');
    console.log('💡 You can now:');
    console.log('   1. Register/Login users');
    console.log('   2. Create listings with correct structure');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

safeIndexFix();

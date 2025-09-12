const mongoose = require('mongoose');
require('dotenv').config();

async function removeGeoIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scravo');
    
    const Listing = mongoose.connection.collection('listings');
    
    // Get all indexes
    const indexes = await Listing.indexes();
    console.log('Current indexes:', indexes);
    
    // Drop the location index if it exists
    try {
      await Listing.dropIndex('location_2dsphere');
      console.log('Dropped location_2dsphere index');
    } catch (err) {
      console.log('No location_2dsphere index found');
    }
    
    try {
      await Listing.dropIndex('location_2d');
      console.log('Dropped location_2d index');
    } catch (err) {
      console.log('No location_2d index found');
    }
    
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

removeGeoIndex();

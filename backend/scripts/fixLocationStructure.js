const mongoose = require('mongoose');
require('dotenv').config();

async function fixLocationStructure() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scravo');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const listingsCollection = db.collection('listings');
    
    // Step 1: Drop the geospatial index
    console.log('Dropping geospatial indexes...');
    try {
      await listingsCollection.dropIndex('location.coordinates_2dsphere');
      console.log('✓ Dropped location.coordinates_2dsphere index');
    } catch (err) {
      console.log('No geospatial index found or already dropped');
    }
    
    // Step 2: Find all documents with old location structure
    console.log('\nFinding documents with old location structure...');
    const oldDocs = await listingsCollection.find({
      'location.coordinates.coordinates': { $exists: true }
    }).toArray();
    
    console.log(`Found ${oldDocs.length} documents to migrate`);
    
    // Step 3: Update each document
    for (const doc of oldDocs) {
      const newLocation = {
        address: doc.location.address || 'Unknown',
        type: 'Point',
        coordinates: doc.location.coordinates?.coordinates || [0, 0]
      };
      
      await listingsCollection.updateOne(
        { _id: doc._id },
        { $set: { location: newLocation } }
      );
      
      console.log(`✓ Updated document ${doc._id}`);
    }
    
    // Step 4: Fix any documents with string coordinates
    console.log('\nFixing string coordinates...');
    const stringCoordDocs = await listingsCollection.find({}).toArray();
    
    for (const doc of stringCoordDocs) {
      if (doc.location) {
        const coords = doc.location.coordinates;
        
        // Check if coordinates need fixing
        if (typeof coords === 'string' || !Array.isArray(coords) || coords.length !== 2) {
          await listingsCollection.updateOne(
            { _id: doc._id },
            { 
              $set: { 
                'location.coordinates': [0, 0],
                'location.type': 'Point'
              } 
            }
          );
          console.log(`✓ Fixed coordinates for document ${doc._id}`);
        }
      }
    }
    
    // Step 5: Recreate the geospatial index
    console.log('\nRecreating geospatial index...');
    await listingsCollection.createIndex(
      { 'location.coordinates': '2dsphere' }
    );
    console.log('✓ Geospatial index created');
    
    console.log('\n✅ Migration completed successfully!');
    
    // Verify the structure
    console.log('\nVerifying structure of first document:');
    const sample = await listingsCollection.findOne({});
    if (sample) {
      console.log(JSON.stringify(sample.location, null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

fixLocationStructure();

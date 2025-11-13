const Listing = require('../models/Listing');

// Create new listing
exports.createListing = async (req, res) => {
  try {
    console.log('=== CREATE LISTING DEBUG ===');
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    console.log('User:', req.user ? req.user._id : 'No user');

    const {
      materialTitle,
      description,
      category,
      quantity,
      unit,
      pricePerUnit,
      location,
      latitude,
      longitude,
      status,
      isMarketplaceVisible
    } = req.body;

    if (!materialTitle || !description || !category || !quantity || !unit || !pricePerUnit || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
        required: ['materialTitle', 'description', 'category', 'quantity', 'unit', 'pricePerUnit', 'location'],
        received: Object.keys(req.body)
      });
    }

    // Process uploaded images - store the server path
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    const listingData = {
      seller: req.user._id,
      materialTitle,
      description,
      category,
      quantity: Number(quantity),
      unit,
      pricePerUnit: Number(pricePerUnit),
      location: {
        address: location,
        type: 'Point',
        coordinates: [
          longitude ? Number(longitude) : 0,
          latitude ? Number(latitude) : 0
        ]
      },
      images,
      status: status || 'active',
      isMarketplaceVisible: isMarketplaceVisible !== undefined ? isMarketplaceVisible === 'true' : true
    };

    console.log('Creating listing with data:', JSON.stringify(listingData, null, 2));

    const listing = await Listing.create(listingData);
    
    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: listing
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      error: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : error.message
    });
  }
};

// Get all marketplace listings (for buyers)
exports.getMarketplaceListings = async (req, res) => {
  try {
    console.log('=== MARKETPLACE LISTINGS REQUEST ===');
    console.log('Query params:', req.query);
    
    const { category, minPrice, maxPrice, location, search } = req.query;
    
    const query = {
      status: 'active',
      isMarketplaceVisible: true
    };

    console.log('Base query:', query);

    if (category) query.category = category;
    if (location) query['location.address'] = new RegExp(location, 'i');
    if (minPrice || maxPrice) {
      query.pricePerUnit = {};
      if (minPrice) query.pricePerUnit.$gte = Number(minPrice);
      if (maxPrice) query.pricePerUnit.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { materialTitle: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    console.log('Final query:', JSON.stringify(query, null, 2));

    const listings = await Listing.find(query)
      .populate('seller', 'name email')
      .sort('-createdAt');

    console.log(`Found ${listings.length} listings`);

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    console.error('Error in getMarketplaceListings:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get seller's own listings
exports.getSellerListings = async (req, res) => {
  try {
    console.log('Fetching listings for seller:', req.user._id);
    
    const listings = await Listing.find({ seller: req.user._id })
      .sort('-createdAt');

    console.log(`Found ${listings.length} listings`);

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    console.error('Error fetching seller listings:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single listing
exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name email phone');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    listing.views += 1;
    await listing.save();

    res.status(200).json({
      success: true,
      data: listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update listing
exports.updateListing = async (req, res) => {
  try {
    console.log('=== UPDATE LISTING DEBUG ===');
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing'
      });
    }

    // Prepare update data
    const updateData = { ...req.body };
    
    // Handle location field - convert string to location object if needed
    if (updateData.location && typeof updateData.location === 'string') {
      updateData.location = {
        address: updateData.location,
        type: 'Point',
        coordinates: [
          updateData.longitude ? Number(updateData.longitude) : listing.location.coordinates[0],
          updateData.latitude ? Number(updateData.latitude) : listing.location.coordinates[1]
        ]
      };
      delete updateData.longitude;
      delete updateData.latitude;
    }

    // Handle image uploads if any new images provided
    if (req.files && req.files.length > 0) {
      const newImages = [];
      req.files.forEach(file => {
        newImages.push(`/uploads/${file.filename}`);
      });
      updateData.images = newImages;
    }

    console.log('Updating listing with data:', JSON.stringify(updateData, null, 2));

    listing = await Listing.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: listing
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(400).json({
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

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing'
      });
    }

    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

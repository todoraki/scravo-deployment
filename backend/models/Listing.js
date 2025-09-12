const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  materialTitle: {
    type: String,
    required: [true, 'Please provide material title'],
    trim: true
  },

  description: {
    type: String,
    required: [true, 'Please provide description'],
    trim: true
  },

  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Metals', 'Plastics', 'Paper', 'Glass', 'Electronics', 'Other']
  },

  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: 0
  },
  
  unit: {
    type: String,
    required: [true, 'Please select a unit'],
    enum: ['kg', 'tons', 'pieces', 'liters', 'meters']
  },
  
  pricePerUnit: {
    type: Number,
    required: [true, 'Please provide price per unit'],
    min: 0
  },

  location: {
    address: {
      type: String,
      required: [true, 'Please provide location'],
      trim: true
    },
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },

  images: [{
    type: String
  }],

  status: {
    type: String,
    enum: ['active', 'sold', 'draft', 'inactive', 'reserved'],
    default: 'active'
  },

  views: {
    type: Number,
    default: 0
  },

  isMarketplaceVisible: {
    type: Boolean,
    default: true
  },

  availableQuantity: {
    type: Number,
    min: 0
  },

  reservedQuantity: {
    type: Number,
    default: 0
  },

  soldQuantity: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

listingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set availableQuantity to quantity on first save if not set
  if (this.isNew && !this.availableQuantity) {
    this.availableQuantity = this.quantity;
  }
  
  // Update status based on available quantity, not total quantity
  if (this.availableQuantity === 0 && this.reservedQuantity === 0) {
    this.status = 'sold';
  } else if (this.status === 'sold' && this.availableQuantity > 0) {
    this.status = 'active';
  }
  
  next();
});

// Create geospatial index
listingSchema.index({ 'location.coordinates': '2dsphere' });

// Add method to check availability
listingSchema.methods.checkAvailability = function(requestedQuantity) {
  return this.availableQuantity >= requestedQuantity;
};

// Add method to reserve quantity
listingSchema.methods.reserveQuantity = function(quantity) {
  if (this.availableQuantity >= quantity) {
    this.availableQuantity -= quantity;
    this.reservedQuantity += quantity;
    return true;
  }
  return false;
};

// Add method to mark as sold
listingSchema.methods.markAsSold = function(quantity) {
  this.reservedQuantity -= quantity;
  this.soldQuantity += quantity;
  if (this.availableQuantity === 0 && this.reservedQuantity === 0) {
    this.status = 'sold';
  }
};

module.exports = mongoose.model('Listing', listingSchema);
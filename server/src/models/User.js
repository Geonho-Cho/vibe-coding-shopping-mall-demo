const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    required: true,
    enum: ['customer', 'admin', 'seller'],
    default: 'customer'
  },
  address: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);

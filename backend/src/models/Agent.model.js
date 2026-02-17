const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  passwordHash: String,
  businessName: String,
  businessType: String,
  businessAddress: String,
  businessPhone: String,
  website: String,
  role: { type: String, default: 'agent' },
  method: { type: String, enum: ['email', 'phone'], default: 'email' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Agent', agentSchema);

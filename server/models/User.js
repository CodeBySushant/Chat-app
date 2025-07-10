const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String }, // Only for normal signup
  googleId: { type: String }, // For Google Sign-In
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);

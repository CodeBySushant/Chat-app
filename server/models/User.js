const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for Google users
  googleId: { type: String, unique: true, sparse: true }, // unique but optional
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

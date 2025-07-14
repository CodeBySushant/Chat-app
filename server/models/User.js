const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
  pendingRequests: [{ type: String }], // Incoming friend requests
  sentRequests: [{ type: String }], // Sent friend requests
  friends: [{ type: String }], // Accepted friends
});

module.exports = mongoose.model('User', userSchema);
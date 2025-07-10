const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
<<<<<<< HEAD
  password: { type: String },             // optional for Google users
  googleId: { type: String, unique: true, sparse: true },  // unique but optional
=======
  password: { type: String }, // Only for normal signup
  googleId: { type: String }, // For Google Sign-In
  createdAt: { type: Date, default: Date.now },
>>>>>>> origin/main
});

module.exports = mongoose.model('User', userSchema);

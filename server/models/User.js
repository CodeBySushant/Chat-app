const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String },             // optional for Google users
  googleId: { type: String, unique: true, sparse: true },  // unique but optional
});

module.exports = mongoose.model('User', userSchema);

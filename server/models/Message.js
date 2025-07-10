const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: String,
  message: String,
  room: String,
  isPrivate: Boolean,
  participants: [String],
  timestamp: { type: Date, default: Date.now },
  readBy: [{ type: String }]
});

module.exports = mongoose.model('Message', messageSchema);

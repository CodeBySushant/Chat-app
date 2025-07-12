const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  emoji: String,
  by: String,
}, { _id: false });

const messageSchema = new mongoose.Schema({
  user: String,
  message: String,
  room: String,
  timestamp: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  reactions: [reactionSchema],
});

module.exports = mongoose.model('Message', messageSchema);

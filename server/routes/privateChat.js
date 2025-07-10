const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

router.get('/history/:user1/:user2', async (req, res) => {
  const room = [req.params.user1, req.params.user2].sort().join('_');
  const messages = await Message.find({ room }).sort({ timestamp: 1 }).limit(100);
  res.json(messages);
});

module.exports = router;

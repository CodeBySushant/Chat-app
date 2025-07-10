const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
  const users = await User.find({}, 'username');
  res.json(users.map(u => u.username));
});

module.exports = router;

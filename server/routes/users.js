const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

router.get('/search', authenticateToken, async (req, res) => {
  const { query } = req.query;
  if (!query || query.trim() === '') {
    return res.json([]);
  }
  try {
    const users = await User.find(
      { 
        username: { $regex: query, $options: 'i' },
        username: { $ne: req.user.username } // Exclude current user
      },
      'username'
    );
    res.json(users.map(u => u.username));
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
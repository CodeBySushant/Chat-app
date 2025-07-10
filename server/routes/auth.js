const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport'); // Added passport import
const User = require('../models/User');
const authenticateToken = require('../middleware/auth'); // Moved up

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// 📌 Register Route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: 'User exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.json({ message: 'Registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 📌 Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🌐 Google OAuth Route
router.get('/google', passport.authenticate('google', {
  scope: ['profile']
}));

// 🔄 Google OAuth Callback
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: 'http://localhost:3000',
  session: false
}), (req, res) => {
  // JWT token with MongoDB user _id (safer and standard)
  const token = jwt.sign({ id: req.user._id }, JWT_SECRET, { expiresIn: '7d' });
  res.redirect(`http://localhost:3000?token=${token}&username=${req.user.username}`);
});

// 🔐 Protected Route
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'You have access!', user: req.user });
});

module.exports = router;

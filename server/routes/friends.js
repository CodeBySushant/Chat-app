const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

// Search users by username
router.get('/search', authenticateToken, async (req, res) => {
  const { query } = req.query;
  try {
    const users = await User.find(
      { username: { $regex: query, $options: 'i' } },
      'username'
    );
    res.json(users.map(u => u.username));
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get friend requests and friends
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    res.json({
      pendingRequests: user.pendingRequests || [],
      sentRequests: user.sentRequests || [],
      friends: user.friends || [],
    });
  } catch (err) {
    console.error('Error fetching friends:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send friend request
router.post('/request', authenticateToken, async (req, res) => {
  const { recipient } = req.body;
  try {
    const sender = await User.findOne({ username: req.user.username });
    const recipientUser = await User.findOne({ username: recipient });
    if (!recipientUser) return res.status(404).json({ error: 'User not found' });
    if (sender.friends.includes(recipient) || sender.sentRequests.includes(recipient)) {
      return res.status(400).json({ error: 'Already friends or request sent' });
    }
    sender.sentRequests.push(recipient);
    recipientUser.pendingRequests.push(req.user.username);
    await sender.save();
    await recipientUser.save();
    res.json({ message: 'Friend request sent' });
  } catch (err) {
    console.error('Error sending friend request:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept friend request
router.post('/accept', authenticateToken, async (req, res) => {
  const { sender } = req.body;
  try {
    const user = await User.findOne({ username: req.user.username });
    const senderUser = await User.findOne({ username: sender });
    if (!senderUser) return res.status(404).json({ error: 'User not found' });
    if (!user.pendingRequests.includes(sender)) {
      return res.status(400).json({ error: 'No pending request' });
    }
    user.pendingRequests = user.pendingRequests.filter(req => req !== sender);
    user.friends.push(sender);
    senderUser.friends.push(req.user.username);
    senderUser.sentRequests = senderUser.sentRequests.filter(req => req !== req.user.username);
    await user.save();
    await senderUser.save();
    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    console.error('Error accepting friend request:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject friend request
router.post('/reject', authenticateToken, async (req, res) => {
  const { sender } = req.body;
  try {
    const user = await User.findOne({ username: req.user.username });
    const senderUser = await User.findOne({ username: sender });
    if (!senderUser) return res.status(404).json({ error: 'User not found' });
    if (!user.pendingRequests.includes(sender)) {
      return res.status(400).json({ error: 'No pending request' });
    }
    user.pendingRequests = user.pendingRequests.filter(req => req !== sender);
    senderUser.sentRequests = senderUser.sentRequests.filter(req => req !== req.user.username);
    await user.save();
    await senderUser.save();
    res.json({ message: 'Friend request rejected' });
  } catch (err) {
    console.error('Error rejecting friend request:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/profile/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers', 'username firstName lastName profilePicture')
      .populate('following', 'username firstName lastName profilePicture')
      .populate('posts')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the profile is private and user is not following
    if (user.isPrivate && !user.followers.includes(req.user._id) && user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This profile is private' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        profilePicture: user.profilePicture,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        postsCount: user.posts.length,
        createdAt: user.createdAt,
        isPrivate: user.isPrivate,
        isOwnProfile: user._id.toString() === req.user._id.toString(),
        isFollowing: user.followers.includes(req.user._id)
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, bio, isPrivate } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        firstName,
        lastName,
        bio,
        isPrivate
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        bio: updatedUser.bio,
        profilePicture: updatedUser.profilePicture,
        isPrivate: updatedUser.isPrivate
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } }
      ]
    })
    .select('username firstName lastName profilePicture bio')
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get followers
router.get('/:userId/followers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', 'username firstName lastName profilePicture bio');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ followers: user.followers });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get following
router.get('/:userId/following', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('following', 'username firstName lastName profilePicture bio');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ following: user.following });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

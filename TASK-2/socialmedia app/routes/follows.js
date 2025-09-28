const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Follow a user
router.post('/:userId', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    // Check if already following
    if (currentUser.following.includes(req.params.userId)) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    // Add to following list of current user
    currentUser.following.push(req.params.userId);
    await currentUser.save();

    // Add to followers list of target user
    userToFollow.followers.push(req.user._id);
    await userToFollow.save();

    res.json({
      message: 'User followed successfully',
      following: true,
      followersCount: userToFollow.followers.length,
      followingCount: currentUser.following.length
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unfollow a user
router.delete('/:userId', auth, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user._id);

    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    // Check if currently following
    if (!currentUser.following.includes(req.params.userId)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    // Remove from following list of current user
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== req.params.userId
    );
    await currentUser.save();

    // Remove from followers list of target user
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== req.user._id.toString()
    );
    await userToUnfollow.save();

    res.json({
      message: 'User unfollowed successfully',
      following: false,
      followersCount: userToUnfollow.followers.length,
      followingCount: currentUser.following.length
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get follow status
router.get('/status/:userId', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(req.params.userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(req.params.userId);
    const isFollower = targetUser.following.includes(req.user._id);

    res.json({
      isFollowing,
      isFollower,
      followersCount: targetUser.followers.length,
      followingCount: targetUser.following.length
    });
  } catch (error) {
    console.error('Get follow status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get follow suggestions
router.get('/suggestions', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    // Find users not followed by current user (excluding themselves)
    const suggestions = await User.find({
      _id: { 
        $nin: [...currentUser.following, req.user._id] 
      }
    })
    .select('username firstName lastName profilePicture bio followers')
    .limit(10)
    .sort({ 'followers.length': -1 }); // Sort by follower count

    // Add follower count and mutual followers info
    const suggestionsWithInfo = suggestions.map(user => ({
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followersCount: user.followers.length,
      mutualFollowers: user.followers.filter(followerId => 
        currentUser.following.includes(followerId)
      ).length
    }));

    res.json({ suggestions: suggestionsWithInfo });
  } catch (error) {
    console.error('Get follow suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

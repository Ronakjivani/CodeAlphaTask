const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');

// Search users
router.get('/search', auth, userController.searchUsers);

// Get user profile
router.get('/:username', auth, userController.getProfile);

// Follow/Unfollow user
router.post('/:userId/follow', auth, userController.followUser);
router.post('/:userId/unfollow', auth, userController.unfollowUser);

// Get followers/following
router.get('/:userId/followers', auth, userController.getFollowers);
router.get('/:userId/following', auth, userController.getFollowing);

module.exports = router; 
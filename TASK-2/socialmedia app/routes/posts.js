const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a new post
router.post('/', auth, async (req, res) => {
  try {
    const { content, image, tags, visibility } = req.body;

    const post = new Post({
      author: req.user._id,
      content,
      image: image || '',
      tags: tags || [],
      visibility: visibility || 'public'
    });

    await post.save();

    // Add post to user's posts array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { posts: post._id }
    });

    // Populate author information
    await post.populate('author', 'username firstName lastName profilePicture');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts (feed)
router.get('/feed', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Get posts from users the current user follows + their own posts
    const user = await User.findById(req.user._id);
    const followingIds = [...user.following, req.user._id];

    const posts = await Post.find({
      author: { $in: followingIds },
      visibility: { $in: ['public', 'followers'] }
    })
    .populate('author', 'username firstName lastName profilePicture')
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'username firstName lastName profilePicture'
      }
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json({ posts });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get posts by user
router.get('/user/:username', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check visibility
    const isOwnProfile = user._id.toString() === req.user._id.toString();
    const isFollowing = user.followers.includes(req.user._id);

    let visibilityFilter = { author: user._id };
    
    if (!isOwnProfile) {
      if (user.isPrivate && !isFollowing) {
        return res.status(403).json({ message: 'This profile is private' });
      }
      visibilityFilter.visibility = isFollowing ? { $in: ['public', 'followers'] } : 'public';
    }

    const posts = await Post.find(visibilityFilter)
      .populate('author', 'username firstName lastName profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username firstName lastName profilePicture'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({ posts });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'username firstName lastName profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username firstName lastName profilePicture'
        }
      });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check visibility
    const isOwnPost = post.author._id.toString() === req.user._id.toString();
    const author = await User.findById(post.author._id);
    const isFollowing = author.followers.includes(req.user._id);

    if (!isOwnPost && post.visibility === 'private') {
      return res.status(403).json({ message: 'This post is private' });
    }

    if (!isOwnPost && post.visibility === 'followers' && !isFollowing) {
      return res.status(403).json({ message: 'This post is only visible to followers' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post
router.put('/:postId', auth, async (req, res) => {
  try {
    const { content, tags, visibility } = req.body;

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    post.content = content || post.content;
    post.tags = tags || post.tags;
    post.visibility = visibility || post.visibility;

    await post.save();
    await post.populate('author', 'username firstName lastName profilePicture');

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.postId);

    // Remove post from user's posts array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { posts: req.params.postId }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

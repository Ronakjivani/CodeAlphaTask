const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');
const router = express.Router();

// Like/Unlike a post
router.post('/post/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingLike = post.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      // Unlike the post
      post.likes = post.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
      await post.save();

      res.json({
        message: 'Post unliked successfully',
        liked: false,
        likeCount: post.likes.length
      });
    } else {
      // Like the post
      post.likes.push({
        user: req.user._id,
        createdAt: new Date()
      });
      await post.save();

      res.json({
        message: 'Post liked successfully',
        liked: true,
        likeCount: post.likes.length
      });
    }
  } catch (error) {
    console.error('Like/unlike post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike a comment
router.post('/comment/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const existingLike = comment.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      // Unlike the comment
      comment.likes = comment.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
      await comment.save();

      res.json({
        message: 'Comment unliked successfully',
        liked: false,
        likeCount: comment.likes.length
      });
    } else {
      // Like the comment
      comment.likes.push({
        user: req.user._id,
        createdAt: new Date()
      });
      await comment.save();

      res.json({
        message: 'Comment liked successfully',
        liked: true,
        likeCount: comment.likes.length
      });
    }
  } catch (error) {
    console.error('Like/unlike comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get likes for a post
router.get('/post/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('likes.user', 'username firstName lastName profilePicture');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({
      likes: post.likes,
      likeCount: post.likes.length,
      userLiked: post.likes.some(like => like.user._id.toString() === req.user._id.toString())
    });
  } catch (error) {
    console.error('Get post likes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get likes for a comment
router.get('/comment/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId)
      .populate('likes.user', 'username firstName lastName profilePicture');

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({
      likes: comment.likes,
      likeCount: comment.likes.length,
      userLiked: comment.likes.some(like => like.user._id.toString() === req.user._id.toString())
    });
  } catch (error) {
    console.error('Get comment likes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

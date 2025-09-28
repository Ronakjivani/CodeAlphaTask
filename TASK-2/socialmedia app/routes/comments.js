const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const router = express.Router();

// Add comment to post
router.post('/', auth, async (req, res) => {
  try {
    const { postId, content, parentCommentId } = req.body;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      author: req.user._id,
      post: postId,
      content,
      parentComment: parentCommentId || null
    });

    await comment.save();

    // Add comment to post's comments array
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id }
    });

    // If it's a reply, add to parent comment's replies
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id }
      });
    }

    // Populate author information
    await comment.populate('author', 'username firstName lastName profilePicture');

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for a post
router.get('/post/:postId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const comments = await Comment.find({ 
      post: req.params.postId,
      parentComment: null // Only get top-level comments
    })
    .populate('author', 'username firstName lastName profilePicture')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'username firstName lastName profilePicture'
      }
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update comment
router.put('/:commentId', auth, async (req, res) => {
  try {
    const { content } = req.body;

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    comment.content = content;
    await comment.save();
    await comment.populate('author', 'username firstName lastName profilePicture');

    res.json({
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Remove comment from post's comments array
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: req.params.commentId }
    });

    // If it's a reply, remove from parent comment's replies
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: req.params.commentId }
      });
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentComment: req.params.commentId });

    await Comment.findByIdAndDelete(req.params.commentId);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router({ mergeParams: true });
const Comment = require('../models/Comment');
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const commentController = require('../controllers/commentController');

// Get comments for a project or task
router.get('/', auth, commentController.getComments);

// Create a new comment
router.post('/', auth, commentController.createComment);

// Like/Unlike a comment
router.post('/:commentId/like', auth, commentController.toggleLike);

// Delete a comment
router.delete('/:commentId', auth, commentController.deleteComment);

// Get all comments for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    // Check if user has access to the project
    const project = await Project.findOne({
      _id: req.params.projectId,
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id }
      ]
    });

    if (!project) {
      return res.status(403).json({ message: 'Access denied to project' });
    }

    const comments = await Comment.find({ project: req.params.projectId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// Get all comments for a task
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the project
    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id }
      ]
    });

    if (!project) {
      return res.status(403).json({ message: 'Access denied to task' });
    }

    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// Update a comment
router.patch('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only allow the comment creator to update it
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied to comment' });
    }

    comment.content = req.body.content;
    await comment.save();
    await comment.populate('user', 'name email');
    res.json(comment);
  } catch (error) {
    res.status(400).json({ message: 'Error updating comment' });
  }
});

module.exports = router; 
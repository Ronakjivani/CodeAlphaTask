const Comment = require('../models/Comment');
const Project = require('../models/Project');
const Task = require('../models/Task');

// Get comments for a project or task
exports.getComments = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const query = {};

    if (projectId) {
      // Check if user has access to the project
      const project = await Project.findOne({
        _id: projectId,
        $or: [
          { createdBy: req.user._id },
          { 'team.user': req.user._id }
        ]
      });

      if (!project) {
        return res.status(403).json({ message: 'Access denied to project' });
      }
      query.project = projectId;
    }

    if (taskId) {
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Check if user has access to the project
      const project = await Project.findOne({
        _id: task.project,
        $or: [
          { createdBy: req.user._id },
          { 'team.user': req.user._id }
        ]
      });

      if (!project) {
        return res.status(403).json({ message: 'Access denied to task' });
      }
      query.task = taskId;
    }

    const comments = await Comment.find(query)
      .populate('author', 'name email')
      .populate('likes', 'name')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { content, parentComment } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const commentData = {
      content,
      author: req.user._id
    };

    if (projectId) {
      // Check if user has access to the project
      const project = await Project.findOne({
        _id: projectId,
        $or: [
          { createdBy: req.user._id },
          { 'team.user': req.user._id }
        ]
      });

      if (!project) {
        return res.status(403).json({ message: 'Access denied to project' });
      }
      commentData.project = projectId;
    }

    if (taskId) {
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Check if user has access to the project
      const project = await Project.findOne({
        _id: task.project,
        $or: [
          { createdBy: req.user._id },
          { 'team.user': req.user._id }
        ]
      });

      if (!project) {
        return res.status(403).json({ message: 'Access denied to task' });
      }
      commentData.task = taskId;
    }

    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
      commentData.parentComment = parentComment;
    }

    const comment = new Comment(commentData);
    await comment.save();
    await comment.populate('author', 'name email');

    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating comment' });
  }
};

// Toggle like on a comment
exports.toggleLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const likeIndex = comment.likes.indexOf(req.user._id);
    if (likeIndex === -1) {
      comment.likes.push(req.user._id);
    } else {
      comment.likes.splice(likeIndex, 1);
    }

    await comment.save();
    await comment.populate('author', 'name email');
    await comment.populate('likes', 'name');

    res.json(comment);
  } catch (error) {
    res.status(400).json({ message: 'Error toggling like' });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only allow the comment author or project admin to delete
    if (comment.author.toString() !== req.user._id.toString()) {
      const project = await Project.findOne({
        _id: comment.project,
        'team.user': req.user._id,
        'team.role': 'admin'
      });

      if (!project) {
        return res.status(403).json({ message: 'Access denied to comment' });
      }
    }

    await comment.remove();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment' });
  }
}; 
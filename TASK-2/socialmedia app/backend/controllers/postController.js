const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const fs = require('fs');
const path = require('path');

exports.createPost = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image is required' });
    const post = await Post.create({
      user: req.user._id,
      image: req.file.filename,
      caption: req.body.caption || '',
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFeed = async (req, res) => {
  try {
    // Following feed
    const following = req.user.following;
    const posts = await Post.find({ user: { $in: [...following, req.user._id] } })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePicture')
      .populate({ path: 'comments', populate: { path: 'user', select: 'username profilePicture' } });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePicture')
      .populate({ path: 'comments', populate: { path: 'user', select: 'username profilePicture' } });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('user', 'username profilePicture')
      .populate({ path: 'comments', populate: { path: 'user', select: 'username profilePicture' } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (!post.user.equals(req.user._id)) return res.status(403).json({ message: 'Unauthorized' });
    // Remove image file
    if (post.image && fs.existsSync(path.join('uploads', post.image))) {
      fs.unlinkSync(path.join('uploads', post.image));
    }
    await Comment.deleteMany({ post: post._id });
    await post.remove();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const liked = post.likes.includes(req.user._id);
    if (liked) {
      post.likes = post.likes.filter(id => !id.equals(req.user._id));
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = await Comment.create({
      user: req.user._id,
      post: post._id,
      text: req.body.text,
    });
    post.comments.push(comment._id);
    await post.save();
    await comment.populate('user', 'username profilePicture');
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (!comment.user.equals(req.user._id) && !post.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    post.comments = post.comments.filter(id => !id.equals(comment._id));
    await post.save();
    await comment.remove();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate({
      path: 'comments',
      populate: { path: 'user', select: 'username profilePicture' }
    });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 
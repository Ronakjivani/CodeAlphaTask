const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, upload.single('image'), postController.createPost);
router.get('/feed', auth, postController.getFeed);
router.get('/user/:userId', auth, postController.getUserPosts);
router.get('/:postId', auth, postController.getPost);
router.delete('/:postId', auth, postController.deletePost);
router.post('/:postId/like', auth, postController.likePost);
router.post('/:postId/comments', auth, postController.addComment);
router.delete('/:postId/comments/:commentId', auth, postController.deleteComment);
router.get('/:postId/comments', auth, postController.getComments);

module.exports = router; 
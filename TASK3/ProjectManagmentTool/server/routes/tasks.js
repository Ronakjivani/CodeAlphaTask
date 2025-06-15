const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');

// Get all tasks for a project
router.get('/', auth, taskController.getTasks);

// Create a new task
router.post('/', auth, taskController.createTask);

// Update a task
router.put('/:taskId', auth, taskController.updateTask);

// Delete a task
router.delete('/:taskId', auth, taskController.deleteTask);

module.exports = router; 
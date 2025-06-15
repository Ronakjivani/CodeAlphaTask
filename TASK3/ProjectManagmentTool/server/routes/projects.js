const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const projectController = require('../controllers/projectController');

// Get all projects
router.get('/', auth, projectController.getProjects);

// Get a single project
router.get('/:id', auth, projectController.getProject);

// Create a new project
router.post('/', auth, projectController.createProject);

// Update a project
router.put('/:id', auth, projectController.updateProject);

// Delete a project
router.delete('/:id', auth, projectController.deleteProject);

module.exports = router; 
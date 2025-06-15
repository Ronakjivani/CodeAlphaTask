const Task = require('../models/Task');
const Project = require('../models/Project');

// Get all tasks for a project
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    // Find the project and check if the user is in the team
    const project = await Project.findOne({
      _id: req.params.projectId,
      'team.user': req.user._id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or you do not have permission to add tasks to this project' });
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      project: req.params.projectId,
      createdBy: req.user._id,
      assignedTo
    });

    const savedTask = await task.save();
    await savedTask.populate('assignedTo', 'name email');
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating task' });
  }
};

// Get a single task by ID
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignedTo', 'name email');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Error fetching task' });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      { title, description, status, priority, dueDate, assignedTo },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating task' });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
}; 
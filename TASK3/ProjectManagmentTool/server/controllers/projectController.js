const Project = require('../models/Project');
const User = require('../models/User'); // Import User model

// Get all projects
exports.getProjects = async (req, res) => {
  try {
    // Find projects where user is either creator or a member of any group
    const projects = await Project.find({
      $or: [
        { createdBy: req.user._id },
        { 'groups.members': req.user._id }
      ]
    })
    .populate('createdBy', 'name email')
    .populate('groups.members', 'name email')
    .populate('team.user', 'name email')
    .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

// Get a single project
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user._id },
        { 'groups.members': req.user._id }
      ]
    })
    .populate('createdBy', 'name email')
    .populate('groups.members', 'name email')
    .populate('team.user', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Error fetching project' });
  }
};

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { title, description, startDate, endDate, isPublic, tags, groups } = req.body;

    const project = new Project({
      title,
      description,
      startDate,
      endDate,
      isPublic,
      tags,
      createdBy: req.user._id
    });

    // Add creator to the team
    project.team.push({
      user: req.user._id,
      role: 'admin'
    });

    // Process groups and add members
    if (groups && groups.length > 0) {
      for (const group of groups) {
        const groupMembers = [];
        
        // Find users by email and add to group members
        if (group.members && group.members.length > 0) {
          const users = await User.find({ email: { $in: group.members } });
          
          // Add users to group members
          groupMembers.push(...users.map(user => user._id));
          
          // Add users to team if not already present
          users.forEach(user => {
            if (user._id.toString() !== req.user._id.toString()) {
              const existingMember = project.team.find(member => 
                member.user.toString() === user._id.toString()
              );
              if (!existingMember) {
                project.team.push({
                  user: user._id,
                  role: 'member'
                });
              }
            }
          });
        }

        // Add group to project
        project.groups.push({
          name: group.name,
          members: groupMembers
        });
      }
    }

    const savedProject = await project.save();
    const populatedProject = await Project.findById(savedProject._id)
      .populate('createdBy', 'name email')
      .populate('team.user', 'name email')
      .populate('groups.members', 'name email');
    
    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating project' });
  }
};

// Update a project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user._id },
        { 'groups.members': req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only allow project creator to update project details
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project creator can update project details' });
    }

    const { groups, team, ...updateData } = req.body;

    // Update basic project data
    Object.assign(project, updateData);

    // Update groups if provided
    if (groups) {
      project.groups = [];
      for (const group of groups) {
        const groupMembers = [];
        
        if (group.members && group.members.length > 0) {
          const users = await User.find({ email: { $in: group.members } });
          groupMembers.push(...users.map(user => user._id));
        }

        project.groups.push({
          name: group.name,
          members: groupMembers
        });
      }
    }

    const updatedProject = await project.save();
    const populatedProject = await Project.findById(updatedProject._id)
      .populate('createdBy', 'name email')
      .populate('team.user', 'name email')
      .populate('groups.members', 'name email');

    res.json(populatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating project' });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user._id // Only creator can delete
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
}; 
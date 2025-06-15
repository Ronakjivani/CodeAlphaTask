import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup, Modal, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CommentList from '../components/CommentList';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
    assignedTo: ''
  });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskError, setTaskError] = useState('');

  const fetchProjectDetails = useCallback(async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/projects/${id}`),
        axios.get(`http://localhost:5000/api/projects/${id}/tasks`)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch project details');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskError('');
    
    try {
      const taskData = {
        ...newTask,
        dueDate: new Date(newTask.dueDate).toISOString(),
        ...(newTask.assignedTo && { assignedTo: newTask.assignedTo })
      };

      const response = await axios.post(`http://localhost:5000/api/projects/${id}/tasks`, taskData);
      setTasks([...tasks, response.data]);
      setShowTaskModal(false);
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'todo',
        assignedTo: ''
      });
    } catch (error) {
      setTaskError(error.response?.data?.message || 'Error creating task');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/projects/${id}/tasks/${taskId}`, {
        status: newStatus
      });
      setTasks(tasks.map(task =>
        task._id === taskId ? response.data : task
      ));
    } catch (error) {
      setError('Error updating task status');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'secondary';
      case 'in-progress': return 'primary';
      case 'completed': return 'success';
      default: return 'secondary';
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>{project.title}</h2>
          <p className="text-muted">{project.description}</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowTaskModal(true)}>Add Task</Button>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h4>Tasks</h4>
            </Card.Header>
            <ListGroup variant="flush">
              {tasks.map((task) => (
                <ListGroup.Item key={task._id}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5>{task.title}</h5>
                      <p className="mb-1">{task.description}</p>
                      <div>
                        <span className={`badge bg-${getPriorityColor(task.priority)} me-2`}>{task.priority}</span>
                        <span className={`badge bg-${getStatusColor(task.status)}`}>{task.status}</span>
                        {task.dueDate && (
                          <span className="ms-2 text-muted">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                        {task.assignedTo && (
                          <span className="ms-2 text-muted">Assigned to: {task.assignedTo.name}</span>
                        )}
                      </div>
                    </div>
                    <Form.Select
                      value={task.status}
                      onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                      style={{ width: 'auto' }}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </Form.Select>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h4>Project Details</h4>
            </Card.Header>
            <Card.Body>
              <p><strong>Status:</strong> {project.status}</p>
              <p><strong>Start Date:</strong> {new Date(project.startDate).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> {new Date(project.endDate).toLocaleDateString()}</p>
              <Button variant="outline-primary" onClick={() => navigate(`/projects/${id}/edit`)} className="w-100">
                Edit Project
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <CommentList projectId={project._id} />

      <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {taskError && <Alert variant="danger">{taskError}</Alert>}
          <Form onSubmit={handleCreateTask}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit">Create Task</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProjectDetail; 
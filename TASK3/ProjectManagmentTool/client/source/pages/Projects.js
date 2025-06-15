import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'active',
    teamMembersByEmail: ''
  });
  const [modalError, setModalError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects');
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching projects');
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      const emailsArray = newProject.teamMembersByEmail
        .split(',')
        .map(email => email.trim())
        .filter(email => email);

      const projectData = {
        ...newProject,
        teamMembersByEmail: emailsArray
      };

      const response = await axios.post('http://localhost:5000/api/projects', projectData);
      setProjects([...projects, response.data]);
      setShowModal(false);
      setNewProject({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'active',
        teamMembersByEmail: ''
      });
    } catch (error) {
      setModalError(error.response?.data?.message || 'Error creating project');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'on-hold': return 'warning';
      default: return 'secondary';
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>Projects</h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowModal(true)}>Create Project</Button>
        </Col>
      </Row>

      <Row>
        {projects.map((project) => (
          <Col key={project._id} md={4} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{project.title}</Card.Title>
                <Card.Text>{project.description}</Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <span className={`badge bg-${getStatusColor(project.status)}`}>{project.status}</span>
                  <Button variant="outline-primary" size="sm" onClick={() => navigate(`/projects/${project._id}`)}>View Details</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalError && <Alert variant="danger">{modalError}</Alert>}
          <Form onSubmit={handleCreateProject}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control type="date" value={newProject.startDate} onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control type="date" value={newProject.endDate} onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select value={newProject.status} onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Add Team Members (comma-separated emails)</Form.Label>
              <Form.Control type="text" value={newProject.teamMembersByEmail} onChange={(e) => setNewProject({ ...newProject, teamMembersByEmail: e.target.value })} placeholder="e.g., user1@example.com, user2@example.com" />
            </Form.Group>

            <Button variant="primary" type="submit">Create Project</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Projects;
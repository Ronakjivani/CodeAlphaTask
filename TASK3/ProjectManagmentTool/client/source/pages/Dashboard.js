import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects');
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch projects');
      setLoading(false);
    }
  };

  const getProjectStatus = (status) => {
    const statusColors = {
      active: 'success',
      completed: 'primary',
      'on-hold': 'warning'
    };
    return statusColors[status] || 'secondary';
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>Dashboard</h2>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/projects/new" variant="primary">
            Create New Project
          </Button>
        </Col>
      </Row>

      <Row>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Active Projects</Card.Title>
              <h3>{projects.filter(p => p.status === 'active').length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Completed Projects</Card.Title>
              <h3>{projects.filter(p => p.status === 'completed').length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>On Hold Projects</Card.Title>
              <h3>{projects.filter(p => p.status === 'on-hold').length}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h3 className="mt-4 mb-3">Recent Projects</h3>
      <Row>
        {projects.slice(0, 6).map((project) => (
          <Col md={4} key={project._id} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{project.title}</Card.Title>
                <Card.Text>{project.description}</Card.Text>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className={`badge bg-${getProjectStatus(project.status)}`}>
                    {project.status}
                  </span>
                  <Button
                    as={Link}
                    to={`/projects/${project._id}`}
                    variant="outline-primary"
                    size="sm"
                  >
                    View Details
                  </Button>
                </div>
                
                {/* Project Groups */}
                {project.groups && project.groups.length > 0 && (
                  <div className="mt-3">
                    <h6 className="mb-2">Groups:</h6>
                    <ListGroup variant="flush">
                      {project.groups.map((group, index) => (
                        <ListGroup.Item key={index} className="px-0">
                          <div className="d-flex justify-content-between align-items-center">
                            <strong>{group.name}</strong>
                            <small className="text-muted">
                              {group.members.length} members
                            </small>
                          </div>
                          <div className="mt-1">
                            {group.members.map((member, memberIndex) => (
                              <span key={member._id} className="badge bg-light text-dark me-1">
                                {member.name}
                              </span>
                            ))}
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Dashboard; 
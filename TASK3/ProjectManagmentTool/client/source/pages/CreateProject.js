import React, { useState } from 'react';
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active',
    startDate: '',
    endDate: '',
    groups: [{ name: '', members: '' }]
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleGroupChange = (index, field, value) => {
    const updatedGroups = [...formData.groups];
    updatedGroups[index] = {
      ...updatedGroups[index],
      [field]: value
    };
    setFormData(prevState => ({
      ...prevState,
      groups: updatedGroups
    }));
  };

  const addGroup = () => {
    setFormData(prevState => ({
      ...prevState,
      groups: [...prevState.groups, { name: '', members: '' }]
    }));
  };

  const removeGroup = (index) => {
    setFormData(prevState => ({
      ...prevState,
      groups: prevState.groups.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const processedGroups = formData.groups.map(group => ({
        ...group,
        members: group.members.split(',').map(email => email.trim()).filter(email => email)
      }));

      const projectData = {
        ...formData,
        groups: processedGroups
      };

      await axios.post('http://localhost:5000/api/projects', projectData);
      navigate('/projects');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Create New Project</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Project Title</Form.Label>
          <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Enter project title" />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" name="description" value={formData.description} onChange={handleChange} required rows={3} placeholder="Enter project description" />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select name="status" value={formData.status} onChange={handleChange} required>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Start Date</Form.Label>
          <Form.Control type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>End Date</Form.Label>
          <Form.Control type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
        </Form.Group>

        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Project Groups</h4>
            <Button variant="outline-primary" onClick={addGroup}>Add Group</Button>
          </div>
          
          {formData.groups.map((group, index) => (
            <div key={index} className="border rounded p-3 mb-3">
              <Row>
                <Col md={5}>
                  <Form.Group className="mb-3">
                    <Form.Label>Group Name</Form.Label>
                    <Form.Control type="text" value={group.name} onChange={(e) => handleGroupChange(index, 'name', e.target.value)} placeholder="Enter group name" required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Group Members (comma-separated emails)</Form.Label>
                    <Form.Control type="text" value={group.members} onChange={(e) => handleGroupChange(index, 'members', e.target.value)} placeholder="e.g., member1@email.com, member2@email.com" required />
                  </Form.Group>
                </Col>
                <Col md={1} className="d-flex align-items-end">
                  {formData.groups.length > 1 && (
                    <Button variant="danger" size="sm" onClick={() => removeGroup(index)} className="mb-3">×</Button>
                  )}
                </Col>
              </Row>
            </div>
          ))}
        </div>

        <div className="d-flex gap-2">
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/projects')} disabled={loading}>Cancel</Button>
        </div>
      </Form>
    </Container>
  );
};

export default CreateProject; 
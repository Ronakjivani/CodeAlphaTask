import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavigationBar from '../components/Navbar';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/projects/${id}`);
      const fetchedProject = response.data;
      fetchedProject.startDate = fetchedProject.startDate ? new Date(fetchedProject.startDate).toISOString().split('T')[0] : '';
      fetchedProject.endDate = fetchedProject.endDate ? new Date(fetchedProject.endDate).toISOString().split('T')[0] : '';
      setProject(fetchedProject);
      setLoading(false);
    } catch (error) {
      setError('Error fetching project details');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      await axios.put(`http://localhost:5000/api/projects/${id}`, project);
      setSuccess('Project updated successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating project');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <NavigationBar />
      <Container className="mt-4">
        <h2>Edit Project</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" name="title" value={project.title} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} name="description" value={project.description} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select name="status" value={project.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control type="date" name="startDate" value={project.startDate} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>End Date</Form.Label>
            <Form.Control type="date" name="endDate" value={project.endDate} onChange={handleChange} required />
          </Form.Group>

          <Button variant="primary" type="submit">Update Project</Button>
          <Button variant="secondary" className="ms-2" onClick={() => navigate(-1)}>Cancel</Button>
        </Form>
      </Container>
    </>
  );
};

export default EditProject; 
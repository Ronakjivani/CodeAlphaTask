import React, { useState, useEffect } from 'react';
import { Card, Form, Button, ListGroup, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CommentList = ({ projectId, taskId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchComments = async () => {
    try {
      const url = taskId 
        ? `http://localhost:5000/api/tasks/${taskId}/comments`
        : `http://localhost:5000/api/projects/${projectId}/comments`;
      const response = await axios.get(url);
      setComments(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [projectId, taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const url = taskId 
        ? `http://localhost:5000/api/tasks/${taskId}/comments`
        : `http://localhost:5000/api/projects/${projectId}/comments`;
      const response = await axios.post(url, {
        content: newComment,
        project: projectId,
        task: taskId
      });
      setComments([...comments, response.data]);
      setNewComment('');
      setError(null);
    } catch (err) {
      setError('Failed to post comment');
    }
  };

  const handleLike = async (commentId) => {
    try {
      const url = taskId 
        ? `http://localhost:5000/api/tasks/${taskId}/comments/${commentId}/like`
        : `http://localhost:5000/api/projects/${projectId}/comments/${commentId}/like`;
      const response = await axios.post(url);
      setComments(comments.map(comment => 
        comment._id === commentId ? response.data : comment
      ));
    } catch (err) {
      setError('Failed to like comment');
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const url = taskId 
        ? `http://localhost:5000/api/tasks/${taskId}/comments/${commentId}`
        : `http://localhost:5000/api/projects/${projectId}/comments/${commentId}`;
      await axios.delete(url);
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (err) {
      setError('Failed to delete comment');
    }
  };

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <Card className="mt-3">
      <Card.Header>Comments</Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
            />
          </Form.Group>
          <Button type="submit" variant="primary">Post Comment</Button>
        </Form>

        <ListGroup className="mt-3">
          {comments.map((comment) => (
            <ListGroup.Item key={comment._id}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6>{comment.author.name}</h6>
                  <p className="mb-1">{comment.content}</p>
                  <small className="text-muted">
                    {new Date(comment.createdAt).toLocaleString()}
                  </small>
                </div>
                <div>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => handleLike(comment._id)}
                  >
                    <i className={`bi bi-heart${comment.likes.includes(user._id) ? '-fill' : ''}`}></i>
                    <Badge bg="secondary" className="ms-1">{comment.likes.length}</Badge>
                  </Button>
                  {comment.author._id === user._id && (
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger"
                      onClick={() => handleDelete(comment._id)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  )}
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default CommentList; 
import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { createTrousseau } from '../services/api';

const CreateTrousseau = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await createTrousseau({ name, description });
    if (response._id) {
      setSuccess('Trousseau créé avec succès');
      setError('');
      setName('');
      setDescription('');
    } else {
      setError(response.message || 'Erreur lors de la création du trousseau');
      setSuccess('');
    }
  };

  return (
    <Container className="mt-5">
      <h2>Créer un trousseau partagé</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formTrousseauName">
          <Form.Label>Nom du trousseau</Form.Label>
          <Form.Control
            type="text"
            placeholder="Entrez le nom du trousseau"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formTrousseauDescription" className="mt-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="text"
            placeholder="Entrez la description du trousseau"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Créer
        </Button>
      </Form>
    </Container>
  );
};

export default CreateTrousseau;

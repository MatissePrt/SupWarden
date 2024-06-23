import React, { useState, useContext } from 'react';
import { Container, Form, Button, Alert, Col, Row, Card } from 'react-bootstrap';
import { createTrousseau } from '../services/api';
import { UserContext } from './UserContext';

const CreateTrousseau = () => {
    const { user } = useContext(UserContext);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await createTrousseau(name, description);
        if (response.message) {
            setSuccess(response.message);
            setError('');
            setName('');
            setDescription('');
        } else {
            setError(response.message || 'Erreur de création de trousseau');
            setSuccess('');
        }
    };

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card className="p-4 shadow-sm" style={{ maxWidth: '500px', width: '100%' }}>
                <Card.Body>
                    <h3 className="text-center mb-4">Créer un Trousseau</h3>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formTrousseauName" className="mb-3">
                            <Form.Label>Nom du trousseau</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Entrez le nom du trousseau"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formTrousseauDescription" className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Entrez la description du trousseau"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Créer
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CreateTrousseau;

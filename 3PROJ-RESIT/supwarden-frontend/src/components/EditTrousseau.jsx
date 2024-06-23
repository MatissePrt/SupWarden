import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { updateTrousseau, getTrousseau } from '../services/api';

const EditTrousseau = () => {
    const { id } = useParams();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrousseau = async () => {
            const response = await getTrousseau(id);
            if (response.id) {
                setName(response.name);
                setDescription(response.description);
            } else {
                setError('Erreur de récupération du trousseau');
            }
        };

        fetchTrousseau();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await updateTrousseau({ id, name, description });
            if (response.id) {
                setSuccess('Trousseau mis à jour avec succès');
                setError('');
                navigate('/dashboard'); // Redirige vers le tableau de bord après l'édition
            } else {
                setError('Erreur de mise à jour du trousseau');
            }
        } catch (err) {
            setError('Erreur de mise à jour du trousseau');
        }
    };

    return (
        <Container className="mt-5">
            <h2>Éditer un Trousseau</h2>
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
                    Mettre à jour
                </Button>
            </Form>
        </Container>
    );
};

export default EditTrousseau;

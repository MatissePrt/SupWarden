import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password || password.length < 6) {
            setError('Le mot de passe doit comporter au moins 6 caractères.');
            return;
        }
        
        const response = await registerUser({ username, email, password });
        if (response.token) {
            setError('');
            navigate('/login');
        } else {
            setError(response.message || 'Erreur d\'inscription');
        }
    };

    return (
        <Container className="mt-5">
            <h2>Inscription</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicUsername">
                    <Form.Label>Nom d'utilisateur</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Entrez votre nom d'utilisateur"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formBasicEmail" className="mt-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Entrez votre email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formBasicPassword" className="mt-3">
                    <Form.Label>Mot de passe</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Entrez votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-3">
                    Inscription
                </Button>
            </Form>
        </Container>
    );
};

export default Register;

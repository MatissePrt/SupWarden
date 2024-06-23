import React, { useState, useContext, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { UserContext } from './UserContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, login } = useContext(UserContext);

    useEffect(() => {
        if (user) {
            navigate('/dashboard'); // Redirige vers le tableau de bord si l'utilisateur est déjà connecté
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser({ email, password });
            if (response.token) {
                login(response);
                setError('');
                navigate('/'); // Redirige vers la page d'accueil après la connexion
            } else {
                setError(response.message || 'Erreur de connexion. Veuillez réessayer.');
            }
        } catch (err) {
            setError('Erreur de connexion. Veuillez réessayer.');
        }
    };

    return (
        <Container className="mt-5">
            <h2>Connexion</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="mt-3">
                    <Form.Label>Mot de passe</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Group>

                <Button variant="primary" type="submit" className="mt-3">
                    Connexion
                </Button>
            </Form>
        </Container>
    );
};

export default Login;

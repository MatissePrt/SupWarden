import React, { useState, useContext } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { setPin } from '../services/api';
import { UserContext } from './UserContext';

const SetPin = () => {
    const { user } = useContext(UserContext);
    const [pin, setPinValue] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!pin || !confirmPin) {
            setError('Tous les champs sont obligatoires');
            return;
        }

        if (pin !== confirmPin) {
            setError('Les codes PIN ne correspondent pas');
            return;
        }

        try {
            await setPin(pin);
            setSuccess('Code PIN défini avec succès');
            setError('');
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Erreur lors de la définition du code PIN');
        }
    };

    return (
        <Container className="mt-5">
            <h2>Définir votre code PIN</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formPin">
                    <Form.Label>Nouveau code PIN</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Entrez votre code PIN"
                        value={pin}
                        onChange={(e) => setPinValue(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formConfirmPin" className="mt-3">
                    <Form.Label>Confirmez le code PIN</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Confirmez votre code PIN"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-3">
                    Définir le code PIN
                </Button>
            </Form>
        </Container>
    );
};

export default SetPin;

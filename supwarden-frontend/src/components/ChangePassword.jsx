import React, { useState, useContext } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../services/api'; // Import de la fonction API
import { UserContext } from './UserContext';

const ChangePassword = () => {
    const { user } = useContext(UserContext);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!oldPassword || !newPassword || !confirmNewPassword) {
            setError('Tous les champs sont obligatoires');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError('Les nouveaux mots de passe ne correspondent pas');
            return;
        }

        try {
            const response = await changePassword(oldPassword, newPassword);
            setSuccess('Mot de passe mis à jour avec succès');
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            setError('Erreur lors de la mise à jour du mot de passe');
        }
    };

    return (
        <Container className="mt-5">
            <h2>Changer de mot de passe</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formOldPassword">
                    <Form.Label>Ancien mot de passe</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Entrez votre ancien mot de passe"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formNewPassword" className="mt-3">
                    <Form.Label>Nouveau mot de passe</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Entrez votre nouveau mot de passe"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formConfirmNewPassword" className="mt-3">
                    <Form.Label>Confirmez le nouveau mot de passe</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Confirmez votre nouveau mot de passe"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-3">
                    Changer le mot de passe
                </Button>
            </Form>
        </Container>
    );
};

export default ChangePassword;

import React, { useState, useEffect, useContext } from 'react';
import { Container, ListGroup, Button, Alert } from 'react-bootstrap';
import { getUserInvitations, respondToInvitation } from '../services/api';
import { UserContext } from './UserContext';

const Invitations = () => {
    const { user } = useContext(UserContext);
    const [invitations, setInvitations] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchInvitations = async () => {
            const response = await getUserInvitations();
            if (response.success) {
                setInvitations(response.invitations);
            } else {
                setError('Erreur de récupération des invitations');
            }
        };

        fetchInvitations();
    }, []);

    const handleResponse = async (trousseauId, response) => {
        const res = await respondToInvitation(trousseauId, response);
        if (res.success) {
            setSuccess('Invitation mise à jour avec succès');
            setError('');
            setInvitations(invitations.filter(inv => inv.trousseauId !== trousseauId));
        } else {
            setError('Erreur de réponse à l\'invitation');
            setSuccess('');
        }
    };

    return (
        <Container className="mt-5">
            <h2>Vos invitations</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <ListGroup className="my-3">
                {invitations.length === 0 ? (
                    <ListGroup.Item>Aucune invitation en attente</ListGroup.Item>
                ) : (
                    invitations.map((invitation, index) => (
                        <ListGroup.Item key={index}>
                            {invitation.trousseauName} - {invitation.email} - {invitation.status}
                            <Button
                                variant="success"
                                className="ms-2"
                                onClick={() => handleResponse(invitation.trousseauId, 'accepted')}
                            >
                                Accepter
                            </Button>
                            <Button
                                variant="danger"
                                className="ms-2"
                                onClick={() => handleResponse(invitation.trousseauId, 'rejected')}
                            >
                                Refuser
                            </Button>
                        </ListGroup.Item>
                    ))
                )}
            </ListGroup>
        </Container>
    );
};

export default Invitations;

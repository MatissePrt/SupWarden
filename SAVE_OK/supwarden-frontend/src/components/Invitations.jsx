import React, { useState, useEffect } from 'react';
import { Container, ListGroup, Button, Alert } from 'react-bootstrap';
import { getUserInvitations, respondToInvitation } from '../services/api';

const Invitations = () => {
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
            setSuccess('Réponse à l\'invitation enregistrée');
            setError('');
            setInvitations(prevInvitations => prevInvitations.filter(inv => inv.trousseauId !== trousseauId));
        } else {
            setError(res.message);
            setSuccess('');
        }
    };

    return (
        <Container className="mt-5">
            <h2>Vos invitations</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <ListGroup>
                {invitations.map(invitation => (
                    <ListGroup.Item key={invitation.trousseauId}>
                        {invitation.trousseauName ? `Invitation au trousseau ${invitation.trousseauName}` : 'Invitation'}
                        <Button variant="success" className="ms-2" onClick={() => handleResponse(invitation.trousseauId, 'accepted')}>
                            Accepter
                        </Button>
                        <Button variant="danger" className="ms-2" onClick={() => handleResponse(invitation.trousseauId, 'refused')}>
                            Refuser
                        </Button>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
};

export default Invitations;

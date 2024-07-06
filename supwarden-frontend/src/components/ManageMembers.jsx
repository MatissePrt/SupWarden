import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { getTrousseau, inviteMember } from '../services/api';

const ManageMembers = () => {
    const { id } = useParams();
    const [trousseau, setTrousseau] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const fetchTrousseau = async () => {
            const response = await getTrousseau(id);
            if (response._id) {
                setTrousseau(response);
            } else {
                setError('Erreur de récupération du trousseau');
            }
        };

        fetchTrousseau();
    }, [id]);

    const handleInviteMember = async (e) => {
        e.preventDefault();
        try {
            const response = await inviteMember({ trousseauId: id, email });
            if (response.message) {
                setSuccess(response.message);
                setError('');
                setEmail('');
                // Refresh trousseau data to show updated members and invitations
                const updatedTrousseau = await getTrousseau(id);
                setTrousseau(updatedTrousseau);
            } else {
                setError(response.message || 'Erreur d\'invitation du membre');
            }
        } catch (err) {
            setError('Erreur d\'invitation du membre');
        }
    };

    return (
        <Container className="mt-5">
            <h2>Gérer les membres</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            {trousseau && (
                <>
                    <h3>{trousseau.name}</h3>
                    <ListGroup className="mb-4">
                        {trousseau.members && trousseau.members.map((member, index) => (
                            <ListGroup.Item key={`member-${index}`}>{member.email}</ListGroup.Item>
                        ))}
                        {trousseau.invitations && trousseau.invitations.map((invitation, index) => (
                            <ListGroup.Item key={`invitation-${index}`}>
                                {invitation.email} - {invitation.status}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                    <Form onSubmit={handleInviteMember}>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email du membre</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Entrez l'email du membre"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3">
                            Inviter
                        </Button>
                    </Form>
                </>
            )}
        </Container>
    );
};

export default ManageMembers;

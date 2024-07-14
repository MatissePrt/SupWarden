import React, { useState, useEffect } from 'react';
import { Container, ListGroup, Button, Form, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { getTrousseauById, inviteMember } from '../services/api';

const ManageMembers = () => {
    const { id } = useParams();
    const [trousseau, setTrousseau] = useState(null);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchTrousseau = async () => {
            const response = await getTrousseauById(id);
            if (response.success) {
                console.log('Fetched trousseau:', response.trousseau); // Log ajoutée
                setTrousseau(response.trousseau);
            } else {
                setError('Erreur de récupération du trousseau');
            }
        };
        fetchTrousseau();
    }, [id]);
    

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Veuillez entrer un email');
            return;
        }
        const response = await inviteMember({ trousseauId: id, email });
        if (response.success) {
            setSuccess('Invitation envoyée avec succès');
            setTrousseau((prevTrousseau) => ({
                ...prevTrousseau,
                invitations: [...prevTrousseau.invitations, { email, status: 'pending' }],
            }));
            setEmail('');
        } else {
            setError(response.message);
        }
    };

    if (!trousseau) {
        return <Container>Chargement...</Container>;
    }

    return (
        <Container className="mt-5">
            <h2>Gérer les membres</h2>
            <h4>{trousseau.name}</h4>
            <ListGroup className="my-3">
                <ListGroup.Item><strong>Membres:</strong></ListGroup.Item>
                {trousseau.members && trousseau.members.map(member => (
                    <ListGroup.Item key={member._id}>{member.email}</ListGroup.Item>
                ))}
            </ListGroup>
            <ListGroup className="my-3">
                <ListGroup.Item><strong>Invitations en attente:</strong></ListGroup.Item>
                {trousseau.invitations.length === 0 ? (
                    <ListGroup.Item>Aucune invitation en attente</ListGroup.Item>
                ) : (
                    trousseau.invitations.map((invitation, index) => (
                        <ListGroup.Item key={index}>{invitation.email} - {invitation.status}</ListGroup.Item>
                    ))
                )}
            </ListGroup>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleInvite}>
                <Form.Group controlId="formBasicEmail">
                    <Form.Label>Email du membre</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Entrez l'email du membre"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" className="mt-3" type="submit">
                    Inviter
                </Button>
            </Form>
        </Container>
    );
};

export default ManageMembers;

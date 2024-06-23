import React, { useEffect, useState, useContext } from 'react';
import { Container, ListGroup, Button, Alert, Modal } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { getUserInvitations, respondToInvitation } from '../services/api';
import { UserContext } from './UserContext';

const Invitations = () => {
    const { user } = useContext(UserContext);
    const [invitations, setInvitations] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({});
    
    useEffect(() => {
        const fetchInvitations = async () => {
            const response = await getUserInvitations();
            if (Array.isArray(response)) {
                setInvitations(response);
            } else {
                setError('Erreur de récupération des invitations');
            }
        };

        fetchInvitations();
    }, []);

    const handleResponse = async (trousseauId, response) => {
        try {
            const res = await respondToInvitation({ trousseauId, response });
            if (res.message) {
                setSuccess(res.message);
                setError('');
                setInvitations(invitations.filter(inv => inv.trousseauId !== trousseauId));
                setTimeout(() => setSuccess(''), 5000); // Effacer le message après 5 secondes
            } else {
                setError(res.message || 'Erreur de réponse à l\'invitation');
                setTimeout(() => setError(''), 5000); // Effacer le message après 5 secondes
            }
        } catch (err) {
            setError('Erreur de réponse à l\'invitation');
            setTimeout(() => setError(''), 5000); // Effacer le message après 5 secondes
        }
    };

    const openModal = (trousseauId, response, trousseauName) => {
        setModalContent({ trousseauId, response, trousseauName });
        setShowModal(true);
    };

    const confirmResponse = () => {
        handleResponse(modalContent.trousseauId, modalContent.response);
        setShowModal(false);
    };

    return (
        <Container className="mt-5">
            <h2>Vos invitations :</h2>
            <br/>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <ListGroup>
                {invitations.map((invitation, index) => (
                    <ListGroup.Item key={index}>
                        Invitation à rejoindre le trousseau "{invitation.trousseauName}"
                        <Button
                            variant="success"
                            className="ms-2"
                            onClick={() => openModal(invitation.trousseauId, 'accepted', invitation.trousseauName)}
                        >
                            <FaCheck /> Accepter
                        </Button>
                        <Button
                            variant="danger"
                            className="ms-2"
                            onClick={() => openModal(invitation.trousseauId, 'rejected', invitation.trousseauName)}
                        >
                            <FaTimes /> Refuser
                        </Button>
                    </ListGroup.Item>
                ))}
            </ListGroup>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmer l'action</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Êtes-vous sûr de vouloir {modalContent.response === 'accepted' ? 'accepter' : 'refuser'} l'invitation à rejoindre le trousseau "{modalContent.trousseauName}" ?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={confirmResponse}>
                        Confirmer
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Invitations;

import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Row, Col, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getTrousseaux, deleteTrousseau } from '../services/api';
import { UserContext } from './UserContext';

const Dashboard = () => {
    const { user } = useContext(UserContext);
    const [trousseaux, setTrousseaux] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchTrousseaux = async () => {
            const response = await getTrousseaux();
            if (Array.isArray(response)) {
                setTrousseaux(response);
            } else {
                setError('Erreur de récupération des trousseaux');
            }
        };

        fetchTrousseaux();
    }, []);

    const handleDeleteTrousseau = async (id) => {
        try {
            const response = await deleteTrousseau(id);
            if (response.message) {
                setSuccess(response.message);
                setError('');
                setTrousseaux(trousseaux.filter(trousseau => trousseau._id !== id));
            } else {
                setError(response.message || 'Erreur de suppression du trousseau');
            }
        } catch (err) {
            setError('Erreur de suppression du trousseau');
        }
    };

    return (
        <Container className="mt-5">
            <div className="text-center mb-5">
                <h2>Tableau de bord</h2>
                <h3>Bienvenue, {user && user.username} !</h3>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <h4>Vos trousseaux :</h4>
            <br/>
            <Row>
                {trousseaux.map(trousseau => (
                    <Col md={4} key={trousseau._id} className="mb-4">
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <Card.Title>{trousseau.name}</Card.Title>
                                <Card.Text>{trousseau.description}</Card.Text>
                                <Button
                                    variant="danger"
                                    className="me-2"
                                    onClick={() => handleDeleteTrousseau(trousseau._id)}
                                >
                                    Supprimer
                                </Button>
                                <Link to={`/manage-members/${trousseau._id}`} className="btn btn-primary">
                                    Gérer les membres
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Dashboard;

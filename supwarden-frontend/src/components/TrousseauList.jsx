import React, { useContext, useEffect, useState } from 'react';
import { Container, ListGroup, Button } from 'react-bootstrap';
import { UserContext } from './UserContext';
import { getTrousseaux } from '../services/api';
import { Link } from 'react-router-dom';

const TrousseauList = () => {
    const { user } = useContext(UserContext);
    const [trousseaux, setTrousseaux] = useState([]);
    const [error, setError] = useState('');

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

    return (
        <Container className="mt-5">
            <h2>Vos trousseaux</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <ListGroup>
                {trousseaux.map(trousseau => (
                    <ListGroup.Item key={trousseau._id}>
                        {trousseau.name}
                        <Button variant="link" as={Link} to={`/manage-members/${trousseau._id}`} className="ms-2">
                            Gérer les membres
                        </Button>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
};

export default TrousseauList;

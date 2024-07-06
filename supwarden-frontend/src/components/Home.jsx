import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <Container className="text-center bg-light rounded p-5">
            <h1 className="display-4">Bienvenue sur SupWarden</h1>
            <p className="lead">Un gestionnaire de mots de passe sécurisé pour votre entreprise.</p>
            <hr className="my-4" />
            <p>Créez et partagez des mots de passe de manière sécurisée avec vos collègues.</p>
            <Button variant="primary" as={Link} to="/register">Commencer</Button>
        </Container>
    );
};

export default Home;

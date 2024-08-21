import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="home-hero">
            <Container className="hero-content">
                <h1 className="display-4">
                    L'intelligence humaine <br />
                    <span className="highlighted-text">au service de la cybersécurité</span>
                </h1>
                <p className="lead mt-4">
                    Chez SupWarden, nous nous mobilisons chaque jour pour sécuriser vos identités numériques.
                </p>
                <Button variant="primary" as={Link} to="/register" className="mt-3">
                    Commencer
                </Button>
            </Container>
        </div>
    );
};

export default Home;

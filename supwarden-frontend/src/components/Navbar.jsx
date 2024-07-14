import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import Cookies from 'js-cookie';

const NavigationBar = () => {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/">SupWarden</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Accueil</Nav.Link>
                        {user ? (
                            <>
                                <Nav.Link as={Link} to="/dashboard">Tableau de bord</Nav.Link>
                                <Nav.Link as={Link} to="/create-trousseau">Créer un trousseau</Nav.Link>
                                <Nav.Link as={Link} to="/invitations">Invitations</Nav.Link>
                                <Button variant="outline-light" onClick={handleLogout}>Déconnexion</Button>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">Connexion</Nav.Link>
                                <Nav.Link as={Link} to="/register">Inscription</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;

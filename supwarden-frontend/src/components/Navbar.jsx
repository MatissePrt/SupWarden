import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';

const NavigationBar = () => {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Navbar bg="light" variant="light" expand="lg" className="custom-navbar">
            <Container>
                <Navbar.Brand as={Link} to="/" className="navbar-logo">SupWarden</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-between">
                    <Nav className="mx-auto">
                        <Nav.Link as={Link} to="/" className="nav-link">Accueil</Nav.Link>
                        {user ? (
                            <>
                                <Nav.Link as={Link} to="/dashboard" className="nav-link">Tableau de bord</Nav.Link>
                                <Nav.Link as={Link} to="/create-trousseau" className="nav-link">Créer un trousseau</Nav.Link>
                                <Nav.Link as={Link} to="/invitations" className="nav-link">Invitations</Nav.Link>
                                <Nav.Link as={Link} to="/import-export" className="nav-link">Importer / Exporter</Nav.Link>
                                <Nav.Link as={Link} to="/set-pin" className="nav-link">Définir le code PIN</Nav.Link>

                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login" className="nav-link">Connexion</Nav.Link>
                                <Nav.Link as={Link} to="/register" className="nav-link">Inscription</Nav.Link>
                            </>
                        )}
                    </Nav>
                    {user && (
                        <>
                            <Button variant="outline-primary" onClick={handleLogout} className="logout-button">Déconnexion</Button>
                            <div className="user-info d-flex align-items-center">
                                {user.imageUrl && (
                                    <img src={user.imageUrl} alt="User Avatar" className="user-avatar ml-2" crossOrigin="anonymous" referrerPolicy="no-referrer" />)}
                                <span className="ml-2">{user.name}</span>
                            </div>
                        </>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;

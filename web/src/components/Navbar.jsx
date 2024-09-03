import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
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
            <Container className="d-flex justify-content-center">
                <Navbar.Brand as={Link} to="/" className="navbar-logo">SupWarden</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-between">
                    <Nav className="mx-auto text-center">
                        <Nav.Link as={Link} to="/" className="nav-link">Accueil</Nav.Link>
                        {user ? (
                            <>
                                <Nav.Link as={Link} to="/dashboard" className="nav-link">Tableau de bord</Nav.Link>
                                <Nav.Link as={Link} to="/create-trousseau" className="nav-link">Créer un trousseau</Nav.Link>
                                <Nav.Link as={Link} to="/invitations" className="nav-link">Invitations</Nav.Link>
                                <NavDropdown title="Options" id="options-dropdown" className="nav-link">
                                    <NavDropdown.Item as={Link} to="/import-export">Importer / Exporter</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/set-pin">Définir le code PIN</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/change-password">Modifier mot de passe</NavDropdown.Item>
                                </NavDropdown>
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
                                    <img src={user.imageUrl} alt="User Avatar" className="user-avatar ml-2" crossOrigin="anonymous" referrerPolicy="no-referrer" style={{ width: '35px', height: '35px', borderRadius: '50%' }} />
                                )}
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

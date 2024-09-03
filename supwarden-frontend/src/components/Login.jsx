import React, { useState, useContext } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { loginUser, googleLogin } from '../services/api';
import { UserContext } from './UserContext';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { gapi } from 'gapi-script';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
    const { user, login, logout } = useContext(UserContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await loginUser({ email, password });
        if (response.token) {
            localStorage.setItem('token', response.token);
            login(response);
            navigate('/dashboard');
        } else {
            setError(response.message || 'Erreur de connexion');
        }
    };

    const onSuccess = async (res) => {
        const userInfo = {
            googleId: res.profileObj.googleId,
            email: res.profileObj.email,
            name: res.profileObj.name,
            imageUrl: res.profileObj.imageUrl, 
        };

        try {
            const data = await googleLogin(userInfo);
            localStorage.setItem('token', data.token);
            login(data);
            navigate('/dashboard');
        } catch (error) {
            setError(error.message || 'Erreur lors de la connexion via Google');
        }
    };

    const onFailure = () => {
        setError('Connexion via Google a échoué');
    };

    const handleLogout = () => {
        const auth2 = gapi.auth2.getAuthInstance();
        if (auth2) {
            auth2.signOut().then(auth2.disconnect().then(logout));
        } else {
            logout();
        }
    };

    return (
        <Container className="mt-5">
            <h2>Connexion</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Entrez votre email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formBasicPassword" className="mt-3">
                    <Form.Label>Mot de passe</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Entrez votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-3">
                    Connexion
                </Button>

                <div id="signInButton" className="mt-3">
                    <GoogleLogin
                        clientId={clientId}
                        buttonText="Connexion avec Google"
                        onSuccess={onSuccess}
                        onFailure={onFailure}
                        cookiePolicy={'single_host_origin'}
                        isSignedIn={false}
                    />
                </div>
            </Form>

            {user && (
                <GoogleLogout
                    clientId={clientId}
                    buttonText="Déconnexion"
                    onLogoutSuccess={handleLogout}
                />
            )}
        </Container>
    );
};

export default Login;
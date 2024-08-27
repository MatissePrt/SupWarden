import React, { useState, useContext } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { UserContext } from './UserContext';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { gapi } from 'gapi-script';
import { alignPropType } from 'react-bootstrap/esm/types';

const clientId = "1025165429712-7prrkj9ipbiukd72emqnevu3c23ga098.apps.googleusercontent.com";

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
        console.log("Login Success! Current user: ", res.profileObj);
        console.log("Google Access Token: ", res.tokenObj.access_token);
    
        const userInfo = {
            googleId: res.profileObj.googleId,
            email: res.profileObj.email,
            name: res.profileObj.name,
            imageUrl: res.profileObj.imageUrl, 
        };
    
        // Envoyer les données à l'API de login Google
        const response = await fetch('http://localhost:5000/api/users/google-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userInfo),
        });
    
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            login(data);
            navigate('/dashboard');
        } else {
            console.error('Erreur lors de la connexion via Google');
            setError('Erreur lors de la connexion via Google');
        }
    };

    const onFailure = (res) => {
        console.log("Login Failed! res:", res);
    };

    const handleLogout = () => {
        const auth2 = gapi.auth2.getAuthInstance();
        if (auth2 != null) {
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

                <div id="signInButton">
                    <GoogleLogin
                        clientId={clientId}
                        buttonText="Login with Google"
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
                    buttonText="Logout"
                    onLogoutSuccess={handleLogout}
                />
            )}
        </Container>
    );
};

export default Login;

opti : useronctroller / auth.js / user.js / userRoutes.js / .env / login.jsx  / Navbar.jsx / alignPropType.js / app.jsx
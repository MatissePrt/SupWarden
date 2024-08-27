import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserProvider from './components/UserContext';
import NavigationBar from './components/Navbar';
import Home from './components/Home';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CreateTrousseau from './components/CreateTrousseau';
import Invitations from './components/Invitations';
import ManageMembers from './components/ManageMembers';
import ManageElements from './components/ManageElements';
import PrivateRoute from './components/PrivateRoute';
import { gapi } from 'gapi-script';

const clientId = "1025165429712-7prrkj9ipbiukd72emqnevu3c23ga098.apps.googleusercontent.com";

const App = () => {
    useEffect(() => {
        function start() {
            gapi.client.init({
                clientId: clientId,
                scope: ""
            });
        }

        gapi.load('client:auth2', start);
    }, []);  // Ajoutez ce tableau vide pour éviter des initialisations multiples

    return (
        <UserProvider>
            <Router>
                <NavigationBar />
                <div className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<PrivateRoute />}>
                            <Route path="" element={<Dashboard />} />
                        </Route>
                        <Route path="/create-trousseau" element={<PrivateRoute />}>
                            <Route path="" element={<CreateTrousseau />} />
                        </Route>
                        <Route path="/invitations" element={<PrivateRoute />}>
                            <Route path="" element={<Invitations />} />
                        </Route>
                        <Route path="/manage-members/:id" element={<PrivateRoute />}>
                            <Route path="" element={<ManageMembers />} />
                        </Route>
                        <Route path="/manage-elements/:id" element={<PrivateRoute />}>
                            <Route path="" element={<ManageElements />} />
                        </Route>
                    </Routes>
                </div>
                <Footer />
            </Router>
        </UserProvider>
    );
};

export default App;

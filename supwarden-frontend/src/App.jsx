import React, { useEffect } from 'react';
import { gapi } from 'gapi-script';
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
import ChangePassword from './components/ChangePassword';
import ManageElements from './components/ManageElements';
import PrivateRoute from './components/PrivateRoute';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const App = () => {
    useEffect(() => {
        if (clientId) {
            function start() {
                gapi.client.init({
                    clientId: clientId,
                    scope: ""
                });
            }
            gapi.load('client:auth2', start);
        }
    }, []);

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
                        <Route path="/change-password" element={<PrivateRoute />}>
                            <Route path="" element={<ChangePassword />} />
                        </Route>
                    </Routes>
                </div>
                <Footer />
            </Router>
        </UserProvider>
    );
};

export default App;

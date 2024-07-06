import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './components/Dashboard';
import CreateTrousseau from './components/CreateTrousseau';
import EditTrousseau from './components/EditTrousseau';
import ManageMembers from './components/ManageMembers';
import Invitations from './components/Invitations';
import UserProvider from './components/UserContext';

const App = () => {
    return (
        <UserProvider>
            <Router>
                <Navbar />
                <div className="main-content">
                    <Routes>
                        <Route exact path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/create-trousseau"
                            element={
                                <PrivateRoute>
                                    <CreateTrousseau />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/edit-trousseau/:id"
                            element={
                                <PrivateRoute>
                                    <EditTrousseau />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/manage-members/:id"
                            element={
                                <PrivateRoute>
                                    <ManageMembers />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/invitations"
                            element={
                                <PrivateRoute>
                                    <Invitations />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </div>
                <Footer />
            </Router>
        </UserProvider>
    );
};

export default App;

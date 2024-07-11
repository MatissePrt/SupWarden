import React, { useState, useEffect } from 'react';
import { Form, Table, Button, InputGroup, FormControl } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { getTrousseauById, deleteIdentifiant } from '../services/api';

const IdentifiantsList = () => {
    const { id } = useParams();
    const [trousseau, setTrousseau] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredIdentifiants, setFilteredIdentifiants] = useState([]);

    useEffect(() => {
        const fetchTrousseau = async () => {
            const data = await getTrousseauById(id);
            setTrousseau(data);
            setFilteredIdentifiants(data.identifiants);
        };

        fetchTrousseau();
    }, [id]);

    useEffect(() => {
        if (trousseau) {
            setFilteredIdentifiants(
                trousseau.identifiants.filter(identifiant =>
                    identifiant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    identifiant.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    identifiant.uri.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
    }, [searchTerm, trousseau]);

    const handleDeleteIdentifiant = async (identifiantId) => {
        const response = await deleteIdentifiant(id, identifiantId);
        if (response.message) {
            alert(response.message);
        } else {
            setTrousseau(prev => ({
                ...prev,
                identifiants: prev.identifiants.filter(ident => ident._id !== identifiantId)
            }));
            setFilteredIdentifiants(prev => prev.filter(ident => ident._id !== identifiantId));
        }
    };

    return (
        <div className="container mt-5">
            <h3>Identifiants du trousseau</h3>
            <InputGroup className="mb-3">
                <FormControl
                    placeholder="Rechercher des identifiants"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </InputGroup>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Nom d'utilisateur</th>
                        <th>Mot de passe</th>
                        <th>URI</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredIdentifiants.map(identifiant => (
                        <tr key={identifiant._id}>
                            <td>{identifiant.name}</td>
                            <td>{identifiant.username}</td>
                            <td>{identifiant.password}</td>
                            <td>{identifiant.uri}</td>
                            <td>
                                <Button variant="danger" onClick={() => handleDeleteIdentifiant(identifiant._id)}>Supprimer</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default IdentifiantsList;

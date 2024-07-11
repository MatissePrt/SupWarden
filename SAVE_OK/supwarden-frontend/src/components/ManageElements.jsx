import React, { useState, useEffect } from 'react';
import { Container, ListGroup, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { getElementsByTrousseau, addElement, getElementDetails } from '../services/api';

const ManageElements = () => {
    const { id } = useParams();
    const [elements, setElements] = useState([]);
    const [show, setShow] = useState(false);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [uri, setUri] = useState('');
    const [note, setNote] = useState('');
    const [customFields, setCustomFields] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [passwordVisibility, setPasswordVisibility] = useState({});

    useEffect(() => {
        const fetchElements = async () => {
            const response = await getElementsByTrousseau(id);
            if (response.success) {
                setElements(response.elements);
            } else {
                setError('Erreur de récupération des éléments');
            }
        };
        fetchElements();
    }, [id]);

    const handleAddElement = async () => {
        const response = await addElement(id, { name, username, password, uri, note, customFields });
        if (response.success) {
            setSuccess('Élément ajouté avec succès');
            setElements([...elements, response.element]);
            setShow(false);
            setName('');
            setUsername('');
            setPassword('');
            setUri('');
            setNote('');
            setCustomFields('');
        } else {
            setError('Erreur d\'ajout de l\'élément');
        }
    };

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const togglePasswordVisibility = async (index) => {
        const elementId = elements[index]._id;
        const response = await getElementDetails(elementId);
        if (response.success) {
            setElements(prevElements => {
                const updatedElements = [...prevElements];
                updatedElements[index].password = response.decryptedPassword;
                return updatedElements;
            });
            setPasswordVisibility((prevState) => ({
                ...prevState,
                [index]: !prevState[index],
            }));
        } else {
            setError('Erreur de récupération des détails de l\'élément');
        }
    };

    return (
        <Container className="mt-5">
            <h2>Gérer les éléments</h2>
            <Button variant="primary" onClick={handleShow}>
                Ajouter un élément
            </Button>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <ListGroup className="my-3">
                <ListGroup.Item><strong>Éléments:</strong></ListGroup.Item>
                {elements.map((element, index) => (
                    <ListGroup.Item key={element._id}>
                        <strong>{element.name}</strong> - {element.username} - {element.uri} - 
                        {passwordVisibility[index] ? element.password : '********'}
                        <Button variant="link" onClick={() => togglePasswordVisibility(index)}>
                            {passwordVisibility[index] ? 'Cacher' : 'Voir'}
                        </Button>
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Ajouter un élément</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formName">
                            <Form.Label>Nom de l'élément</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Entrez le nom de l'élément"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formUsername">
                            <Form.Label>Nom d'utilisateur</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Entrez le nom d'utilisateur"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formPassword">
                            <Form.Label>Mot de passe</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Entrez le mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formUri">
                            <Form.Label>URI</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Entrez l'URI"
                                value={uri}
                                onChange={(e) => setUri(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formNote">
                            <Form.Label>Note</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Entrez une note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formCustomFields">
                            <Form.Label>Champs personnalisés</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Entrez des champs personnalisés"
                                value={customFields}
                                onChange={(e) => setCustomFields(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Fermer
                    </Button>
                    <Button variant="primary" onClick={handleAddElement}>
                        Ajouter l'élément
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ManageElements;

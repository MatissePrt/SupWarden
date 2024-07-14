import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getElements, createElement, deleteElement, getElementDetails } from '../services/api';
import { Modal, Button, Form, Alert, Card, Container, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import '../App.css';

const ManageElements = () => {
    const { id: trousseauId } = useParams();
    const [elements, setElements] = useState([]);
    const [form, setForm] = useState({
        name: '',
        username: '',
        password: '',
        uris: [''],
        note: '',
        sensitive: false,
        customFields: [{ type: 'text', value: '' }],
    });
    const [files, setFiles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedElement, setSelectedElement] = useState(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [showCreationModal, setShowCreationModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    useEffect(() => {
        fetchElements();
    }, []);

    const fetchElements = async () => {
        const response = await getElements(trousseauId);
        setElements(response);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleURIChange = (index, value) => {
        const newURIs = form.uris.map((uri, i) => (i === index ? value : uri));
        setForm({ ...form, uris: newURIs });
    };

    const handleAddURI = () => {
        setForm({ ...form, uris: [...form.uris, ''] });
    };

    const handleCustomFieldChange = (index, field, value) => {
        const newCustomFields = form.customFields.map((cf, i) =>
            i === index ? { ...cf, [field]: value } : cf
        );
        setForm({ ...form, customFields: newCustomFields });
    };

    const handleAddCustomField = () => {
        setForm({ ...form, customFields: [...form.customFields, { type: 'text', value: '' }] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('username', form.username);
        formData.append('password', form.password);
        formData.append('uris', JSON.stringify(form.uris)); // Convertir en chaîne JSON
        formData.append('note', form.note);
        formData.append('sensitive', form.sensitive);
        formData.append('trousseau', trousseauId);
        formData.append('customFields', JSON.stringify(form.customFields)); // Convertir en chaîne JSON

        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            await createElement(trousseauId, formData);
            setForm({
                name: '',
                username: '',
                password: '',
                uris: [''],
                note: '',
                sensitive: false,
                customFields: [{ type: 'text', value: '' }],
            });
            setFiles([]);
            setShowCreationModal(false);
            fetchElements();
        } catch (error) {
            setError(error.message || 'Erreur lors de la création de l\'élément');
        }
    };

    const handleDelete = async (elementId) => {
        await deleteElement(trousseauId, elementId);
        fetchElements();
    };

    const handleDetails = async (element) => {
        if (element.sensitive) {
            setSelectedElement(element);
            setShowPasswordModal(true);
        } else {
            const response = await getElementDetails(element._id, '');
            if (response && response.name) {
                setSelectedElement(response);
                setShowModal(true);
            } else {
                alert('Erreur récupération de l\'élément');
            }
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        const response = await getElementDetails(selectedElement._id, password);
        if (response && response.name) {
            setSelectedElement(response);
            setShowPasswordModal(false);
            setShowModal(true);
        } else {
            setPasswordError('Mot de passe incorrect');
        }
    };

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(selectedElement.password).then(() => {
            setCopySuccess('Mot de passe copié dans le presse-papiers !');
            setTimeout(() => setCopySuccess(''), 3000);
        });
    };

    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    return (
        <Container className="mt-5">
            <h1 className="text-center">Gérer les éléments</h1>
            <div className="text-center mb-4">
                <Button variant="success" onClick={() => setShowCreationModal(true)}>Créer un nouvel élément</Button>
            </div>
            <Row>
                {elements.map((element) => (
                    <Col key={element._id} md={4} className="mb-4">
                        <Card className="element-card">
                            <Card.Body>
                                <Card.Title>{element.name}</Card.Title>
                                <div className="button-group">
                                    <Button variant="primary" onClick={() => handleDetails(element)} className="btn-block mb-2">Voir les détails</Button>
                                    <Button variant="danger" onClick={() => handleDelete(element._id)} className="btn-block">Supprimer</Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Détails de l'élément</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {selectedElement && (
                        <div>
                            <p><strong>Nom:</strong> {selectedElement.name}</p>
                            <p><strong>Identifiant:</strong> {selectedElement.username}</p>
                            <p><strong>Mot de passe:</strong></p>
                            <InputGroup>
                                <FormControl
                                    type={isPasswordVisible ? 'text' : 'password'}
                                    value={selectedElement.password}
                                    readOnly
                                />
                                <Button variant="outline-secondary" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                                    {isPasswordVisible ? 'Cacher' : 'Afficher'}
                                </Button>
                                <Button variant="outline-secondary" onClick={handleCopyPassword}>Copier</Button>
                            </InputGroup>
                            {copySuccess && <div className="text-success mt-2">{copySuccess}</div>}
                            <p><strong>URIs:</strong></p>
                            <ul>
                                {selectedElement.uris.map((uri, index) => (
                                    <li key={index}>{uri}</li>
                                ))}
                            </ul>
                            <p><strong>Note:</strong> {selectedElement.note}</p>
                            <p><strong>Sensible:</strong> {selectedElement.sensitive ? 'Oui' : 'Non'}</p>
                            <p><strong>Champs personnalisables:</strong></p>
                            <ul>
                                {selectedElement.customFields.map((cf, index) => (
                                    <li key={index}>
                                        <strong>{cf.type === 'password' ? 'Mot de passe' : 'Texte'}:</strong> {cf.value}
                                    </li>
                                ))}
                            </ul>
                            {selectedElement.attachments && selectedElement.attachments.length > 0 && (
                                <div>
                                    <strong>Pièces jointes:</strong>
                                    <ul>
                                        {selectedElement.attachments.map((attachment, index) => (
                                            <li key={index}>
                                                <a href={`data:${attachment.contentType};base64,${arrayBufferToBase64(attachment.data.data)}`} target="_blank" rel="noopener noreferrer">
                                                    {attachment.filename}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Fermer</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showCreationModal} onHide={() => setShowCreationModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Créer un nouvel élément</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                            <Form.Label>Nom</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Identifiant</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Mot de passe</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>URIs</Form.Label>
                            {form.uris.map((uri, index) => (
                                <Form.Control
                                    key={index}
                                    type="url"
                                    value={uri}
                                    onChange={(e) => handleURIChange(index, e.target.value)}
                                />
                            ))}
                            <Button variant="secondary" onClick={handleAddURI}>Ajouter URI</Button>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Note</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="note"
                                value={form.note}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Champs personnalisables</Form.Label>
                            {form.customFields.map((cf, index) => (
                                <div key={index}>
                                    <Form.Control
                                        as="select"
                                        value={cf.type}
                                        onChange={(e) => handleCustomFieldChange(index, 'type', e.target.value)}
                                    >
                                        <option value="text">Texte</option>
                                        <option value="password">Mot de passe</option>
                                    </Form.Control>
                                    <Form.Control
                                        type={cf.type === 'password' ? 'password' : 'text'}
                                        value={cf.value}
                                        onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                                    />
                                </div>
                            ))}
                            <Button variant="secondary" onClick={handleAddCustomField}>Ajouter champ</Button>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Pièce jointe (PDF ou image)</Form.Label>
                            <Form.Control
                                type="file"
                                name="files"
                                onChange={handleFileChange}
                                multiple
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Élément sensible"
                                name="sensitive"
                                checked={form.sensitive}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Button type="submit" variant="success">Créer l'élément</Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreationModal(false)}>Fermer</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Mot de passe requis</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handlePasswordSubmit}>
                        {passwordError && <Alert variant="danger">{passwordError}</Alert>}
                        <Form.Group>
                            <Form.Label>Veuillez entrer votre mot de passe pour voir les détails:</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button type="submit" variant="primary" className="mt-3">Valider</Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>Fermer</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ManageElements;

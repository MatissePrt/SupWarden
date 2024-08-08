import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getElements, createElement, deleteElement, getElementDetails } from '../services/api';
import { Modal, Button, Form, Alert, Card, Container, Row, Col, InputGroup, FormControl } from 'react-bootstrap';

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
    const [showCreationModal, setShowCreationModal] = useState(false);
    const [selectedElement, setSelectedElement] = useState(null);
    const [error, setError] = useState(null);
    const [isPasswordVisible, setIsPasswordVisible] = useState({});
    const [customFieldVisibility, setCustomFieldVisibility] = useState({});

    useEffect(() => {
        fetchElements();
    }, []);

    const fetchElements = async () => {
        const response = await getElements(trousseauId);
        setElements(response);
    };

    const toggleFieldVisibility = (index) => {
        setCustomFieldVisibility(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleURIChange = (index, value) => {
        const newURIs = form.uris.map((uri, i) => (i === index ? value : uri));
        setForm({ ...form, uris: newURIs });
    };

    const handleAddURI = () => {
        setForm({ ...form, uris: [...form.uris, ''] });
    };

    const handleRemoveURI = (index) => {
        const newURIs = form.uris.filter((_, i) => i !== index);
        setForm({ ...form, uris: newURIs });
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

    const handleRemoveCustomField = (index) => {
        const newCustomFields = form.customFields.filter((_, i) => i !== index);
        setForm({ ...form, customFields: newCustomFields });
    };

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('username', form.username);
        formData.append('password', form.password);
        formData.append('uris', JSON.stringify(form.uris));
        formData.append('note', form.note);
        formData.append('sensitive', form.sensitive);
        formData.append('trousseau', trousseauId);
        formData.append('customFields', JSON.stringify(form.customFields));

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

    const handleDetails = async (element) => {
        const response = await getElementDetails(element._id, '');
        if (response && response.name) {
            setSelectedElement(response);
            setShowModal(true);
        } else {
            alert('Erreur récupération de l\'élément');
        }
    };

    const handleDelete = async (elementId) => {
        await deleteElement(trousseauId, elementId);
        fetchElements();
    };

    const handleCopyPassword = (password) => {
        navigator.clipboard.writeText(password).then(() => {
            alert('Mot de passe copié dans le presse-papiers !');
        });
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
                                    type={isPasswordVisible['main'] ? 'text' : 'password'}
                                    value={selectedElement.password}
                                    readOnly
                                />
                                <Button variant="outline-secondary" onClick={() => setIsPasswordVisible(prevState => ({ ...prevState, 'main': !prevState['main'] }))}>
                                    {isPasswordVisible['main'] ? 'Cacher' : 'Afficher'}
                                </Button>
                                <Button variant="outline-secondary" onClick={() => handleCopyPassword(selectedElement.password)}>Copier</Button>
                            </InputGroup>
                            <p><strong>URIs:</strong></p>
                            {selectedElement.uris.length > 0 && selectedElement.uris[0] !== '' ? (
                                <ul>
                                    {selectedElement.uris.map((uri, index) => (
                                        <li key={index}>{uri}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Vide</p>
                            )}
                            <p><strong>Note:</strong> {selectedElement.note || 'Vide'}</p>
                            <p><strong>Sensible:</strong> {selectedElement.sensitive ? 'Oui' : 'Non'}</p>
                            <p><strong>Champs personnalisables:</strong></p>
                            {selectedElement.customFields.map((field, index) => (
                                <div key={index}>
                                    <p><strong>{field.type === 'password' ? 'Masqué' : 'Visible'}:</strong></p>
                                    {field.type === 'password' ? (
                                        <InputGroup>
                                            <FormControl
                                                type={customFieldVisibility[index] ? 'text' : 'password'}
                                                value={field.value}
                                                readOnly
                                            />
                                            <Button variant="outline-secondary" onClick={() => toggleFieldVisibility(index)}>
                                                {customFieldVisibility[index] ? 'Cacher' : 'Afficher'}
                                            </Button>
                                            <Button variant="outline-secondary" onClick={() => handleCopyPassword(field.value)}>Copier</Button>
                                        </InputGroup>
                                    ) : (
                                        <p>{field.value || 'Vide'}</p>
                                    )}
                                </div>
                            ))}
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
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nom</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleFieldChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Identifiant</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleFieldChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Mot de passe</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleFieldChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>URIs</Form.Label>
                            {form.uris.map((uri, index) => (
                                <InputGroup key={index} className="mb-2">
                                    <FormControl
                                        type="text"
                                        value={uri}
                                        onChange={(e) => handleURIChange(index, e.target.value)}
                                    />
                                    {form.uris.length > 1 && (
                                        <Button variant="danger" onClick={() => handleRemoveURI(index)}>Supprimer</Button>
                                    )}
                                </InputGroup>
                            ))}
                            <Button variant="secondary" onClick={handleAddURI}>Ajouter URI</Button>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Note</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="note"
                                value={form.note}
                                onChange={handleFieldChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Champs personnalisables</Form.Label>
                            {form.customFields.map((field, index) => (
                                <InputGroup key={index} className="mb-2">
                                    <FormControl
                                        as="select"
                                        value={field.type}
                                        onChange={(e) => handleCustomFieldChange(index, 'type', e.target.value)}
                                    >
                                        <option value="text">Visible</option>
                                        <option value="password">Masqué</option>
                                    </FormControl>
                                    <FormControl
                                        type={field.type === 'password' ? 'password' : 'text'}
                                        value={field.value}
                                        onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                                    />
                                    {form.customFields.length > 1 && (
                                        <Button variant="danger" onClick={() => handleRemoveCustomField(index)}>Supprimer</Button>
                                    )}
                                </InputGroup>
                            ))}
                            <Button variant="secondary" onClick={handleAddCustomField}>Ajouter champ</Button>
                        </Form.Group>
                        <Form.Group className="mb-3">
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
                                onChange={handleFieldChange}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">Créer l'élément</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default ManageElements;

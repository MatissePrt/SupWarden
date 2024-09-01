import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getElements, createElement, deleteElement, updateElement, getElementDetails, getTrousseauById } from '../services/api';
import { Modal, Button, Form, Alert, Card, Container, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import { UserContext } from './UserContext';
import PasswordGenerator from './PasswordGenerator';

const ManageElements = () => {
    const { user } = useContext(UserContext);
    const currentUserId = user ? user._id : null;
    const { id: trousseauId } = useParams();
    const [elements, setElements] = useState([]);
    const [form, setForm] = useState({
        name: '',
        username: '',
        password: '',
        uris: [''],
        note: '',
        sensitive: false,
        customFields: [],
        editors: currentUserId ? [currentUserId] : [],
    });
    const [members, setMembers] = useState([]);
    const [files, setFiles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showCreationModal, setShowCreationModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
    const [selectedElement, setSelectedElement] = useState(null);
    const [error, setError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [passwordInput, setPasswordInput] = useState('');
    const [pinInput, setPinInput] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState({});
    const [customFieldVisibility, setCustomFieldVisibility] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (currentUserId) {
            fetchElements();
            fetchMembers();
        } else {
            console.error("User is not logged in or user ID is undefined.");
        }
    }, [currentUserId, showCreationModal, showPasswordModal]);

    useEffect(() => {
        if (selectedElement) {
            setForm(prevForm => ({
                ...prevForm,
                editors: selectedElement.editors || [currentUserId],
            }));
        }
    }, [selectedElement, currentUserId]);

    const fetchElements = async () => {
        try {
            const response = await getElements(trousseauId);
            setElements(response);
        } catch (error) {
            console.error('Error fetching elements:', error);
        }
    };

    const fetchMembers = async () => {
        try {
            const response = await getTrousseauById(trousseauId);
            if (response && response.success && Array.isArray(response.trousseau.members)) {
                setMembers(response.trousseau.members);
            } else {
                console.error('Failed to fetch members:', response);
                setMembers([]);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            setMembers([]);
        }
    };

    const toggleFieldVisibility = (index) => {
        setCustomFieldVisibility(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    const handleFieldChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prevForm => ({
            ...prevForm,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleURIChange = (index, value) => {
        setForm(prevForm => ({
            ...prevForm,
            uris: prevForm.uris.map((uri, i) => (i === index ? value : uri)),
        }));
    };

    const handleAddURI = () => {
        setForm(prevForm => ({
            ...prevForm,
            uris: [...prevForm.uris, ''],
        }));
    };

    const handleRemoveURI = (index) => {
        setForm(prevForm => ({
            ...prevForm,
            uris: prevForm.uris.filter((_, i) => i !== index),
        }));
    };

    const handleCustomFieldChange = (index, field, value) => {
        setForm(prevForm => ({
            ...prevForm,
            customFields: prevForm.customFields.map((cf, i) => 
                i === index ? { ...cf, [field]: value } : cf
            ),
        }));
    };

    const handleAddCustomField = () => {
        setForm(prevForm => ({
            ...prevForm,
            customFields: [...prevForm.customFields, { key: 'visible', value: '' }],
        }));
    };

    const handleRemoveCustomField = (index) => {
        setForm(prevForm => ({
            ...prevForm,
            customFields: prevForm.customFields.filter((_, i) => i !== index),
        }));
    };

    const handleFileChange = (e, index) => {
        const file = e.target.files[0];
        setForm(prevForm => ({
            ...prevForm,
            customFields: prevForm.customFields.map((cf, i) =>
                i === index ? { ...cf, value: file } : cf
            ),
        }));
    };

    const handleEditorChange = (e) => {
        const { value, checked } = e.target;
        setForm(prevForm => {
            let selectedEditors = [...prevForm.editors];
            if (checked) {
                if (!selectedEditors.includes(value)) {
                    selectedEditors.push(value);
                }
            } else if (value !== selectedElement?.creatorId || currentUserId !== selectedElement?.creatorId) {
                selectedEditors = selectedEditors.filter(editorId => editorId !== value);
            }
            return { ...prevForm, editors: selectedEditors };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('username', form.username);
        formData.append('password', form.password || '');
        formData.append('uris', JSON.stringify(form.uris));
        formData.append('note', form.note);
        formData.append('sensitive', form.sensitive ? 'true' : 'false');
        formData.append('trousseau', trousseauId);

        const customFields = form.customFields.map((field) => {
            if (field.key === 'file' && field.value instanceof File) {
                formData.append('files', field.value);
                return {
                    key: field.key,
                    value: field.value.name // Store only the file name to match the file in req.files
                };
            } else {
                return field;
            }
        });

        formData.append('customFields', JSON.stringify(customFields));
        formData.append('editors', JSON.stringify(form.editors));

        try {
            if (selectedElement) {
                await updateElement(selectedElement._id, formData);
            } else {
                await createElement(trousseauId, formData);
            }

            setForm({
                name: '',
                username: '',
                password: '',
                uris: [''],
                note: '',
                sensitive: false,
                customFields: [],
                editors: [currentUserId],
            });
            setFiles([]);
            setError(null);
            setShowCreationModal(false);
            setTimeout(fetchElements, 200);
            setSelectedElement(null);
        } catch (error) {
            setError(error.message || 'Erreur lors de la création ou de la modification de l\'élément');
        }
    };

    const handleEdit = async (element) => {
        if (!element.editors.includes(currentUserId)) {
            alert("Vous n'avez pas les droits pour modifier cet élément");
            return;
        }

        if (element.sensitive) {
            setSelectedElement(element);
            setIsEditMode(true);
            setShowPasswordModal(true);
            return;
        }

        const customFieldsWithoutFiles = element.customFields.filter(cf => cf.key !== 'file');
        const files = element.attachments.map(attachment => ({
            key: 'file',
            value: attachment.filename
        }));

        setIsEditMode(true);
        setSelectedElement(element);
        setForm({
            name: element.name,
            username: element.username,
            password: '',
            uris: element.uris || [''],
            note: element.note,
            sensitive: element.sensitive,
            customFields: [...customFieldsWithoutFiles, ...files],
            editors: element.editors || [],
        });
        setFiles(element.attachments || []);
        setShowCreationModal(true);
    };

    const handleDetails = async (element) => {
        setIsEditMode(false);
        if (element.sensitive) {
            setSelectedElement(element);
            setShowPasswordModal(true);
        } else {
            const response = await getElementDetails(element._id, passwordInput, pinInput);
            if (response && response.name) {
                setSelectedElement(response);
                setShowModal(true);
            } else {
                alert('Erreur récupération de l\'élément');
            }
        }
    };

    const handlePasswordSubmit = async () => {
        const response = await getElementDetails(selectedElement._id, passwordInput, pinInput);
        if (response && response.name) {
            setSelectedElement(response);
            setShowPasswordModal(false);
            setPasswordInput('');
            setPinInput('');
            setPasswordError(null);

            if (isEditMode) {
                const customFieldsWithoutFiles = response.customFields.filter(cf => cf.key !== 'file');
                const files = response.attachments.map(attachment => ({
                    key: 'file',
                    value: new File([attachment.data.data], attachment.filename, { type: attachment.contentType })
                }));

                setForm({
                    name: response.name,
                    username: response.username,
                    password: '',
                    uris: response.uris,
                    note: response.note,
                    sensitive: response.sensitive,
                    customFields: [...customFieldsWithoutFiles, ...files],
                    editors: response.editors || [],
                });

                setFiles(response.attachments || []);
                setShowCreationModal(true);
            } else {
                setShowModal(true);
            }
        } else {
            setPasswordError('Mot de passe ou code PIN incorrect');
        }
    };

    const handleDelete = async (elementId) => {
        try {
            await deleteElement(trousseauId, elementId);
            fetchElements();
        } catch (error) {
            console.error('Error deleting element:', error);
        }
    };

    const handleClosePasswordModal = () => {
        setPasswordInput('');
        setPinInput('');
        setPasswordError(null);
        setShowPasswordModal(false);
    };

    const handleCloseCreationModal = () => {
        setForm({
            name: '',
            username: '',
            password: '',
            uris: [''],
            note: '',
            sensitive: false,
            customFields: [],
            editors: [currentUserId],
        });
        setFiles([]);
        setError(null);
        setShowCreationModal(false);
    };

    const handleCloseDetailsModal = () => {
        setShowModal(false);
    };

    const handleOpenCreationModal = () => {
        setForm({
            name: '',
            username: '',
            password: '',
            uris: [''],
            note: '',
            sensitive: false,
            customFields: [],
            editors: currentUserId ? [currentUserId] : [],
        });
        setSelectedElement(null);
        setShowCreationModal(true);
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

    const handlePasswordGenerated = (password) => {
        setForm(prevForm => ({ ...prevForm, password }));
        setShowPasswordGenerator(false);
    };

    return (
        <Container className="mt-5">
            <h1 className="text-center">Gérer les éléments</h1>
            <div className="text-center mb-4">
                <Button variant="success" onClick={handleOpenCreationModal}>Créer un nouvel élément</Button>
            </div>
            <Row>
                {elements.map((element) => (
                    <Col key={element._id} md={4} className="mb-4">
                        <Card className="element-card">
                            <Card.Body>
                                <Card.Title>{element.name}</Card.Title>
                                <div className="button-group">
                                    <Button variant="primary" onClick={() => handleDetails(element)} className="btn-block mb-2">Voir les détails</Button>
                                    {element.editors.includes(currentUserId) && (
                                        <Button variant="warning" onClick={() => handleEdit(element)} className="btn-block mb-2">Modifier</Button>
                                    )}
                                    <Button variant="danger" onClick={() => handleDelete(element._id)} className="btn-block">Supprimer</Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal show={showCreationModal} onHide={handleCloseCreationModal} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{selectedElement ? 'Modifier l\'élément' : 'Créer un nouvel élément'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
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
                                    <InputGroup>
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            placeholder={selectedElement ? 'Laissez vide pour conserver' : ''}
                                            value={form.password}
                                            onChange={handleFieldChange}
                                        />
                                        <Button variant="outline-secondary" onClick={() => setShowPasswordGenerator(true)}>
                                            Générer
                                        </Button>
                                    </InputGroup>
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
                            </Col>
                            <Col md={6}>
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
                                                value={field.key}
                                                onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
                                                disabled={field.key === 'file'} // Désactiver la modification du type pour les fichiers existants
                                            >
                                                <option value="visible">Visible</option>
                                                <option value="masqué">Masqué</option>
                                                <option value="file">Fichier</option>
                                            </FormControl>
                                            {field.key === 'file' ? (
                                                <FormControl
                                                    type="file"
                                                    onChange={(e) => handleFileChange(e, index)}
                                                />
                                            ) : (
                                                <FormControl
                                                    type={field.key === 'masqué' ? 'password' : 'text'}
                                                    value={field.value || ''}
                                                    onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                                                />
                                            )}
                                            <Button variant="danger" onClick={() => handleRemoveCustomField(index)}>Supprimer</Button>
                                        </InputGroup>
                                    ))}
                                    <Button variant="secondary" onClick={handleAddCustomField}>Ajouter champ</Button>
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
                                <Form.Group className="mb-3">
                                    <Form.Label>Choisir les éditeurs</Form.Label>
                                    <div>
                                        {members.length > 0 ? (
                                            members.map(member => (
                                                <Form.Check
                                                    key={member._id}
                                                    type="checkbox"
                                                    label={member.email}
                                                    value={member._id}
                                                    checked={form.editors.includes(member._id)}
                                                    onChange={handleEditorChange}
                                                    disabled={selectedElement ? member._id === selectedElement.creatorId : member._id === currentUserId} // Verrouille la case pour le créateur
                                                />
                                            ))
                                        ) : (
                                            <p>Aucun membre disponible</p>
                                        )}
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Button variant="primary" type="submit">{selectedElement ? 'Modifier' : 'Créer l\'élément'}</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showPasswordModal} onHide={handleClosePasswordModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Accès requis</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Entrez votre mot de passe ou code PIN</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                            />
                        </InputGroup>
                        <Form.Text className="text-muted">Ou</Form.Text>
                        <InputGroup>
                            <Form.Control
                                type="password"
                                placeholder="Entrez votre code PIN"
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value)}
                            />
                        </InputGroup>
                        {passwordError && <Alert variant="danger" className="mt-3">{passwordError}</Alert>}
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClosePasswordModal}>Annuler</Button>
                    <Button variant="primary" onClick={handlePasswordSubmit}>OK</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showModal} onHide={handleCloseDetailsModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Détails de l'élément</Modal.Title>
                </Modal.Header>
                <Modal.Body>
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
                                <Button variant="outline-secondary" onClick={() => navigator.clipboard.writeText(selectedElement.password)}>
                                    Copier
                                </Button>
                            </InputGroup>
                            <p><strong>URIs:</strong></p>
                            {selectedElement.uris.length > 0 ? (
                                <ul>
                                    {selectedElement.uris.map((uri, index) => (
                                        <li key={index}>{uri || 'Vide'}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Vide</p>
                            )}
                            <p><strong>Note:</strong> {selectedElement.note || 'Vide'}</p>
                            <p><strong>Sensible:</strong> {selectedElement.sensitive ? 'Oui' : 'Non'}</p>
                            <p><strong>Champs personnalisables:</strong></p>
                            {selectedElement.customFields.length > 0 ? (
                                selectedElement.customFields.map((field, index) => (
                                    field.key === 'file' ? null : (
                                        <div key={index}>
                                            <p><strong>{field.key === 'masqué' ? 'Masqué' : 'Visible'}:</strong></p>
                                            {field.key === 'masqué' ? (
                                                <InputGroup>
                                                    <FormControl
                                                        type={customFieldVisibility[index] ? 'text' : 'password'}
                                                        value={field.value || ''}
                                                        readOnly
                                                    />
                                                    <Button variant="outline-secondary" onClick={() => toggleFieldVisibility(index)}>
                                                        {customFieldVisibility[index] ? 'Cacher' : 'Afficher'}
                                                    </Button>
                                                    <Button variant="outline-secondary" onClick={() => navigator.clipboard.writeText(field.value)}>
                                                        Copier
                                                    </Button>
                                                </InputGroup>
                                            ) : (
                                                <p>{field.value || ''}</p>
                                            )}
                                        </div>
                                    )
                                ))
                            ) : (
                                <p>Vide</p>
                            )}
                            {selectedElement.attachments && selectedElement.attachments.length > 0 && (
                                <div>
                                    <p><strong>Pièces jointes:</strong></p>
                                    <ul>
                                        {selectedElement.attachments.map((attachment, index) => (
                                            <li key={index}>
                                                <a
                                                    href={`data:${attachment.contentType};base64,${arrayBufferToBase64(attachment.data.data)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {attachment.filename}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <p><strong>Éditeurs:</strong></p>
                            <ul>
                                {selectedElement.editors.map((editor, index) => (
                                    <li key={index}>{members.find(member => member._id === editor)?.email || 'Inconnu'}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDetailsModal}>Fermer</Button>
                </Modal.Footer>
            </Modal>

            {/* Password Generator Modal */}
            <PasswordGenerator
                show={showPasswordGenerator}
                handleClose={() => setShowPasswordGenerator(false)}
                onPasswordSelected={handlePasswordGenerated}
            />
        </Container>
    );
};

export default ManageElements;

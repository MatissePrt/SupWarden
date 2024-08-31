import React, { useState } from 'react';
import { exportData, importData } from '../services/api';
import { Alert, Container, Button, Form } from 'react-bootstrap';

const ImportExport = () => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleExport = async () => {
        setError('');
        setSuccess('');

        try {
            const response = await exportData();

            if (!response || !response.headers) {
                throw new Error('Réponse non valide reçue du serveur');
            }

            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'mes_trousseaux.json';
                document.body.appendChild(a);
                a.click();
                a.remove();
                setSuccess('Exportation réussie');
            } else {
                throw new Error('Le fichier exporté n\'est pas un JSON');
            }
        } catch (error) {
            console.error('Erreur lors de l\'exportation', error);
            setError('Erreur lors de l\'exportation');
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files[0];

        if (!file) {
            setError('Aucun fichier sélectionné');
            return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const content = JSON.parse(e.target.result);

                // Vérifier que le fichier contient un tableau avec des trousseaux
                if (!Array.isArray(content)) {
                    throw new Error('Le fichier JSON doit contenir un tableau de trousseaux.');
                }

                const response = await importData(content); // Assurez-vous que importData est correctement défini dans votre api.js
                if (response.success) {
                    setSuccess('Importation réussie');
                    event.target.value = '';  // Réinitialiser le champ du fichier
                } else {
                    setError(response.message || 'Erreur lors de l\'importation');
                }
            } catch (error) {
                console.error('Erreur lors de l\'importation', error);
                setError('Erreur lors de l\'importation : ' + error.message);
            }
        };

        reader.onerror = () => {
            setError('Erreur lors de la lecture du fichier');
        };

        reader.readAsText(file);
    };

    return (
        <Container className="mt-5">
            <h2>Importer / Exporter</h2>
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
            
            <div className="my-4">
                <h4>Exporter vos données</h4>
                <p>Cliquez sur le bouton ci-dessous pour exporter tous vos trousseaux et éléments créés.</p>
                <Button onClick={handleExport} variant="primary">Exporter mes données</Button>
            </div>

            <hr />

            <div className="my-4">
                <h4>Importer des données</h4>
                <p>Importez un fichier JSON pour ajouter ou fusionner vos trousseaux et éléments existants.</p>
                <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Sélectionnez un fichier JSON à importer</Form.Label>
                    <Form.Control type="file" accept=".json" onChange={handleImport} />
                </Form.Group>
            </div>
        </Container>
    );
};

export default ImportExport;

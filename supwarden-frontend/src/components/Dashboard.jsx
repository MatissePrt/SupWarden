import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getTrousseaux, deleteTrousseau } from '../services/api';
import { UserContext } from './UserContext';
import { FaTrashAlt, FaUsers, FaKey } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const [trousseaux, setTrousseaux] = useState([]);
  const [personalTrousseau, setPersonalTrousseau] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchTrousseaux = async () => {
      const response = await getTrousseaux();
      if (response.success) {
        const personal = response.trousseaux.find(trousseau => trousseau._id === response.personalTrousseau._id);
        const shared = response.trousseaux.filter(trousseau => trousseau._id !== response.personalTrousseau._id);

        setPersonalTrousseau(personal);
        setTrousseaux(shared);
      } else {
        setError('Erreur de récupération des trousseaux');
      }
    };

    fetchTrousseaux();
  }, []);

  const handleDeleteTrousseau = async (trousseauId) => {
    const response = await deleteTrousseau(trousseauId);
    if (response.success) {
      setSuccess('Trousseau supprimé avec succès');
      setError('');
      setTrousseaux(trousseaux.filter(trousseau => trousseau._id !== trousseauId));
    } else {
      setError(response.message || 'Erreur de suppression du trousseau');
    }
  };

  return (
    <Container className="mt-5 text-center">
      <h2>Tableau de bord</h2>
      <Button as={Link} to="/change-password" variant="secondary">Modifier le mot de passe</Button>
      <h3>Bienvenue, {user && user.username} !</h3>
      <h4>Votre trousseau personnel</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {personalTrousseau && (
        <Row className="mb-4">
          <Col sm={12} md={6} lg={4} className="mb-3">
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <Card.Title>{personalTrousseau.name}</Card.Title>
                <Card.Text>{personalTrousseau.description}</Card.Text>
                <div className="mt-auto d-flex justify-content-center flex-wrap">
                  <Link to={`/manage-elements/${personalTrousseau._id}`} className="btn btn-secondary mb-2">
                    <FaKey className="me-1" /> Gérer les éléments
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      <h4>Vos trousseaux partagés</h4>
      <Row>
        {trousseaux.map(trousseau => (
          <Col key={trousseau._id} sm={12} md={6} lg={4} className="mb-3">
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <Card.Title>{trousseau.name}</Card.Title>
                <Card.Text>{trousseau.description}</Card.Text>
                <div className="mt-auto d-flex justify-content-center flex-wrap">
                  <Button
                    variant="danger"
                    className="me-2 mb-2 button_home"
                    onClick={() => handleDeleteTrousseau(trousseau._id)}
                  >
                    <FaTrashAlt className="me-1" /> Supprimer
                  </Button>
                  <Link to={`/manage-members/${trousseau._id}`} className="btn btn-primary me-2 mb-2">
                    <FaUsers className="me-1" /> Gérer les membres
                  </Link>
                  <Link to={`/manage-elements/${trousseau._id}`} className="btn btn-secondary mb-2">
                    <FaKey className="me-1" /> Gérer les éléments
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Dashboard;

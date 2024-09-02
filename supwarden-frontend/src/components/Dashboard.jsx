import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getTrousseaux, deleteTrousseau } from '../services/api';
import { UserContext } from './UserContext';
import { FaTrashAlt, FaUsers, FaKey, FaComments } from 'react-icons/fa';

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
      <h3>Bienvenue, {user && user.username} !</h3>
      <h4 className='mb-4'>Votre trousseau personnel</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {personalTrousseau && (
        <Row className="mb-4 justify-content-center">
          <Col sm={12} md={6} lg={4} className="mb-3">
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <Card.Title>{personalTrousseau.name}</Card.Title>
                <Card.Text>{personalTrousseau.description}</Card.Text>
                <div className="mt-auto">
                  <Link to={`/manage-elements/${personalTrousseau._id}`} className="btn btn-outline-secondary mb-2 w-100">
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
                <div className="mt-auto">
                  <Link to={`/manage-members/${trousseau._id}`} className="btn btn-outline-primary mb-2 w-100">
                    <FaUsers className="me-1" /> Gérer les membres
                  </Link>
                  <Link to={`/manage-elements/${trousseau._id}`} className="btn btn-outline-secondary mb-2 w-100">
                    <FaKey className="me-1" /> Gérer les éléments
                  </Link>
                  <Link to={`/chat/${trousseau._id}`} className="btn btn-outline-info mb-2 w-100">
                    <FaComments className="me-1" /> Chat du Trousseau
                  </Link>
                  <Button
                    variant="outline-danger"
                    className="w-100"
                    onClick={() => handleDeleteTrousseau(trousseau._id)}
                  >
                    <FaTrashAlt className="me-1" /> Supprimer
                  </Button>
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

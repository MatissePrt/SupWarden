import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="bg-dark text-light mt-5 p-4 text-center" aria-label="Footer">
            <Container>
                <Row>
                    <Col>
                        <p>&copy; {new Date().getFullYear()} SupWarden. Tous droits réservés.</p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;

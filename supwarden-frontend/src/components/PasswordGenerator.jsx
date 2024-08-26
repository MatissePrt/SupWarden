import React, { useState, useEffect } from "react";
import { Modal, Button, Form, InputGroup, FormControl } from "react-bootstrap";
import Slider from "@mui/material/Slider";

const PasswordGenerator = ({ show, handleClose, onPasswordSelected }) => {
    const [length, setLength] = useState(12);
    const [minUppercase, setMinUppercase] = useState(1);
    const [minLowercase, setMinLowercase] = useState(1);
    const [minNumbers, setMinNumbers] = useState(1);
    const [minSymbols, setMinSymbols] = useState(1);
    const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState("");

    useEffect(() => {
        const totalMin = minUppercase + minLowercase + minNumbers + minSymbols;
        if (totalMin > length) {
            const excess = totalMin - length;
            if (minSymbols >= excess) {
                setMinSymbols(minSymbols - excess);
            } else if (minNumbers >= excess - minSymbols) {
                setMinNumbers(minNumbers - (excess - minSymbols));
            } else if (minLowercase >= excess - minSymbols - minNumbers) {
                setMinLowercase(minLowercase - (excess - minSymbols - minNumbers));
            } else if (minUppercase >= excess - minSymbols - minNumbers - minLowercase) {
                setMinUppercase(minUppercase - (excess - minSymbols - minNumbers - minLowercase));
            }
        }
    }, [length, minUppercase, minLowercase, minNumbers, minSymbols]);

    const generatePassword = () => {
        const uppercaseChars = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // Exclude I
        const lowercaseChars = "abcdefghijkmnopqrstuvwxyz"; // Exclude l
        const numberChars = "23456789"; // Exclude 0, 1
        const symbolChars = "!@#$%^&*()_+[]{}|;:,.<>?";
        const ambiguousChars = "IL1O0S5";

        let allChars = "";
        let password = "";

        if (minUppercase > 0) allChars += uppercaseChars;
        if (minLowercase > 0) allChars += lowercaseChars;
        if (minNumbers > 0) allChars += numberChars;
        if (minSymbols > 0) allChars += symbolChars;

        if (avoidAmbiguous) {
            allChars = allChars.replace(new RegExp(`[${ambiguousChars}]`, 'g'), '');
        }

        const getRandomChar = (charSet) => charSet[Math.floor(Math.random() * charSet.length)];
        
        let tempPassword = [];

        for (let i = 0; i < minUppercase; i++) {
            tempPassword.push(getRandomChar(uppercaseChars));
        }
        for (let i = 0; i < minLowercase; i++) {
            tempPassword.push(getRandomChar(lowercaseChars));
        }
        for (let i = 0; i < minNumbers; i++) {
            tempPassword.push(getRandomChar(numberChars));
        }
        for (let i = 0; i < minSymbols; i++) {
            tempPassword.push(getRandomChar(symbolChars));
        }

        while (tempPassword.length < length) {
            tempPassword.push(getRandomChar(allChars));
        }

        password = tempPassword.sort(() => Math.random() - 0.5).join('');

        setGeneratedPassword(password);
    };

    const handleChoose = () => {
        onPasswordSelected(generatedPassword);
        handleClose();
    };

    const handleMinValueChange = (setter, newValue) => {
        if (newValue === 0) return; // Empêche la mise à jour à 0
        const totalMin = minUppercase + minLowercase + minNumbers + minSymbols;
        if (totalMin <= length) {
            setter(newValue);
        } else {
            setter(newValue - (totalMin - length));
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            style={{ zIndex: 1055, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            backdrop="static"
        >
            <Modal.Header closeButton>
                <Modal.Title>Générer un mot de passe</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Longueur du mot de passe: {length}</Form.Label>
                        <Slider
                            value={length}
                            min={7}
                            max={25}
                            onChange={(e, newValue) => setLength(newValue)}
                            valueLabelDisplay="auto"
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Check
                            type="checkbox"
                            label={`Majuscules: ${minUppercase}`}
                            checked={minUppercase > 0}
                            onChange={(e) => setMinUppercase(e.target.checked ? 1 : 0)}
                        />
                        {minUppercase > 0 && (
                            <Slider
                                value={minUppercase}
                                min={0}
                                max={length - minLowercase - minNumbers - minSymbols}
                                onChange={(e, newValue) => handleMinValueChange(setMinUppercase, newValue)}
                                valueLabelDisplay="auto"
                            />
                        )}
                    </Form.Group>
                    <Form.Group>
                        <Form.Check
                            type="checkbox"
                            label={`Minuscules: ${minLowercase}`}
                            checked={minLowercase > 0}
                            onChange={(e) => setMinLowercase(e.target.checked ? 1 : 0)}
                        />
                        {minLowercase > 0 && (
                            <Slider
                                value={minLowercase}
                                min={0}
                                max={length - minUppercase - minNumbers - minSymbols}
                                onChange={(e, newValue) => handleMinValueChange(setMinLowercase, newValue)}
                                valueLabelDisplay="auto"
                            />
                        )}
                    </Form.Group>
                    <Form.Group>
                        <Form.Check
                            type="checkbox"
                            label={`Chiffres: ${minNumbers}`}
                            checked={minNumbers > 0}
                            onChange={(e) => setMinNumbers(e.target.checked ? 1 : 0)}
                        />
                        {minNumbers > 0 && (
                            <Slider
                                value={minNumbers}
                                min={0}
                                max={length - minUppercase - minLowercase - minSymbols}
                                onChange={(e, newValue) => handleMinValueChange(setMinNumbers, newValue)}
                                valueLabelDisplay="auto"
                            />
                        )}
                    </Form.Group>
                    <Form.Group>
                        <Form.Check
                            type="checkbox"
                            label={`Caractères spéciaux: ${minSymbols}`}
                            checked={minSymbols > 0}
                            onChange={(e) => setMinSymbols(e.target.checked ? 1 : 0)}
                        />
                        {minSymbols > 0 && (
                            <Slider
                                value={minSymbols}
                                min={0}
                                max={length - minUppercase - minLowercase - minNumbers}
                                onChange={(e, newValue) => handleMinValueChange(setMinSymbols, newValue)}
                                valueLabelDisplay="auto"
                            />
                        )}
                    </Form.Group>
                    <Form.Group>
                        <Form.Check
                            type="checkbox"
                            label="Éviter les caractères ambigus (I, L, O, 0, S, 5)"
                            checked={avoidAmbiguous}
                            onChange={(e) => setAvoidAmbiguous(e.target.checked)}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Mot de passe généré</Form.Label>
                        <InputGroup>
                            <FormControl
                                type="text"
                                value={generatedPassword}
                                readOnly
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => navigator.clipboard.writeText(generatedPassword)}
                            >
                                Copier
                            </Button>
                        </InputGroup>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Annuler
                </Button>
                <Button variant="primary" onClick={generatePassword}>
                    Générer
                </Button>
                <Button variant="success" onClick={handleChoose} disabled={!generatedPassword}>
                    Choisir
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PasswordGenerator;

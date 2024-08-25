import React, { useState } from "react";
import { Modal, Button, Form, InputGroup, FormControl } from "react-bootstrap";
import Slider from "@mui/material/Slider";

const PasswordGenerator = ({ show, handleClose, onPasswordGenerated }) => {
    const [passwordLength, setPasswordLength] = useState(12);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSpecialChars, setIncludeSpecialChars] = useState(true);
    const [avoidAmbiguousChars, setAvoidAmbiguousChars] = useState(false);
    const [minUppercase, setMinUppercase] = useState(1);
    const [minLowercase, setMinLowercase] = useState(1);
    const [minNumbers, setMinNumbers] = useState(1);
    const [minSpecialChars, setMinSpecialChars] = useState(1);
    const [generatedPassword, setGeneratedPassword] = useState('');

    const generatePassword = () => {
        const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
        const numberChars = "0123456789";
        const specialChars = "!@#$%^&*()_+[]{}|;:,.<>?";
        const ambiguousChars = "ILOS05";

        let allChars = "";
        if (includeUppercase) allChars += uppercaseChars;
        if (includeLowercase) allChars += lowercaseChars;
        if (includeNumbers) allChars += numberChars;
        if (includeSpecialChars) allChars += specialChars;

        if (avoidAmbiguousChars) {
            allChars = allChars.split('').filter(char => !ambiguousChars.includes(char)).join('');
        }

        let newPassword = "";
        let remainingLength = passwordLength;

        if (includeUppercase) {
            newPassword += getRandomChars(uppercaseChars, minUppercase);
            remainingLength -= minUppercase;
        }
        if (includeLowercase) {
            newPassword += getRandomChars(lowercaseChars, minLowercase);
            remainingLength -= minLowercase;
        }
        if (includeNumbers) {
            newPassword += getRandomChars(numberChars, minNumbers);
            remainingLength -= minNumbers;
        }
        if (includeSpecialChars) {
            newPassword += getRandomChars(specialChars, minSpecialChars);
            remainingLength -= minSpecialChars;
        }

        // Fill the rest of the password length with random characters from allChars
        newPassword += getRandomChars(allChars, remainingLength);

        // Shuffle the password to make the distribution more random
        newPassword = shuffleString(newPassword);

        setGeneratedPassword(newPassword);
        onPasswordGenerated(newPassword);
    };

    const getRandomChars = (chars, length) => {
        let result = "";
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const shuffleString = (string) => {
        return string.split('').sort(() => 0.5 - Math.random()).join('');
    };

    return (
        <>
            <Modal 
                show={show} 
                onHide={handleClose} 
                centered 
                backdrop="static"
                style={{ zIndex: 1050 }} // zIndex supérieur pour garantir que la modale est bien au-dessus
            >
                <Modal.Header closeButton>
                    <Modal.Title>Générer un mot de passe</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group style={{ marginBottom: "20px" }}>
                            <Form.Label>Longueur du mot de passe</Form.Label>
                            <Slider
                                value={passwordLength}
                                min={4}
                                max={32}
                                onChange={(e, val) => setPasswordLength(val)}
                                valueLabelDisplay="auto"
                                style={{ marginBottom: "20px" }}
                            />
                        </Form.Group>
                        <Form.Group style={{ marginBottom: "20px" }}>
                            <Form.Check
                                type="checkbox"
                                label="Majuscules"
                                checked={includeUppercase}
                                onChange={() => setIncludeUppercase(!includeUppercase)}
                            />
                            {includeUppercase && (
                                <Slider
                                    value={minUppercase}
                                    min={1}
                                    max={passwordLength - minLowercase - minNumbers - minSpecialChars}
                                    onChange={(e, val) => setMinUppercase(val)}
                                    valueLabelDisplay="auto"
                                    style={{ marginBottom: "20px" }}
                                />
                            )}
                        </Form.Group>
                        <Form.Group style={{ marginBottom: "20px" }}>
                            <Form.Check
                                type="checkbox"
                                label="Minuscules"
                                checked={includeLowercase}
                                onChange={() => setIncludeLowercase(!includeLowercase)}
                            />
                            {includeLowercase && (
                                <Slider
                                    value={minLowercase}
                                    min={1}
                                    max={passwordLength - minUppercase - minNumbers - minSpecialChars}
                                    onChange={(e, val) => setMinLowercase(val)}
                                    valueLabelDisplay="auto"
                                    style={{ marginBottom: "20px" }}
                                />
                            )}
                        </Form.Group>
                        <Form.Group style={{ marginBottom: "20px" }}>
                            <Form.Check
                                type="checkbox"
                                label="Chiffres"
                                checked={includeNumbers}
                                onChange={() => setIncludeNumbers(!includeNumbers)}
                            />
                            {includeNumbers && (
                                <Slider
                                    value={minNumbers}
                                    min={1}
                                    max={passwordLength - minUppercase - minLowercase - minSpecialChars}
                                    onChange={(e, val) => setMinNumbers(val)}
                                    valueLabelDisplay="auto"
                                    style={{ marginBottom: "20px" }}
                                />
                            )}
                        </Form.Group>
                        <Form.Group style={{ marginBottom: "20px" }}>
                            <Form.Check
                                type="checkbox"
                                label="Caractères spéciaux"
                                checked={includeSpecialChars}
                                onChange={() => setIncludeSpecialChars(!includeSpecialChars)}
                            />
                            {includeSpecialChars && (
                                <Slider
                                    value={minSpecialChars}
                                    min={1}
                                    max={passwordLength - minUppercase - minLowercase - minNumbers}
                                    onChange={(e, val) => setMinSpecialChars(val)}
                                    valueLabelDisplay="auto"
                                    style={{ marginBottom: "20px" }}
                                />
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.Check
                                type="checkbox"
                                label="Éviter les caractères ambigus (I, L, O, 0, S, 5)"
                                checked={avoidAmbiguousChars}
                                onChange={() => setAvoidAmbiguousChars(!avoidAmbiguousChars)}
                            />
                        </Form.Group>
                        <Form.Group className="mt-3">
                            <Form.Label>Mot de passe généré</Form.Label>
                            <InputGroup>
                                <FormControl
                                    type="text"
                                    value={generatedPassword}
                                    readOnly
                                />
                            </InputGroup>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Annuler</Button>
                    <Button variant="primary" onClick={generatePassword}>Générer</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default PasswordGenerator;

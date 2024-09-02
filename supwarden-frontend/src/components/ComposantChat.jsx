import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Container, ListGroup, InputGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { getMessages, sendMessage } from '../services/api';
import { UserContext } from './UserContext';

const Chat = () => {
    const { id: trousseauId } = useParams();
    const { user } = useContext(UserContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        const fetchMessages = async () => {
            const response = await getMessages(trousseauId);
            if (Array.isArray(response)) {
                setMessages(response);
            }
        };

        const interval = setInterval(fetchMessages, 2000);

        return () => clearInterval(interval);
    }, [trousseauId]);

    useEffect(() => {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const tempMessage = {
            _id: Math.random().toString(36).substr(2, 9), // Génère un ID temporaire
            content: newMessage,
            sender: { username: user.username }, // Assurez-vous que `user` contient au moins le pseudo ou username
            createdAt: new Date(),
        };

        setMessages([...messages, tempMessage]);
        setNewMessage(''); // Vider le champ immédiatement après l'ajout du message

        try {
            const response = await sendMessage(trousseauId, newMessage);

            if (response.success && response.data) {
                // Remplacer l'ID temporaire par l'ID réel une fois la réponse du serveur reçue
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg._id === tempMessage._id ? { ...msg, _id: response.data._id } : msg
                    )
                );
            } else {
                console.error("Message not sent or server did not return an ID:", response);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
        }
    };

    return (
        <Container className="mt-5 p-3" style={{ maxWidth: '600px', backgroundColor: '#2c2f33', borderRadius: '8px' }}>
            <h2 style={{ color: '#fff', marginBottom: '20px' }}>Chat du Trousseau</h2>
            <div id="chat-container" style={{ maxHeight: '400px', overflowY: 'auto', backgroundColor: '#23272a', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <ListGroup variant="flush">
                    {messages.map(message => (
                        <ListGroup.Item
                            key={message._id}
                            style={{
                                backgroundColor: '#2c2f33',
                                color: '#dcddde',
                                borderColor: '#2c2f33',
                                marginBottom: '5px',
                                borderRadius: '5px',
                                padding: '10px'
                            }}>
                            <strong style={{ color: '#7289da' }}>
                                {message.sender.username}:
                            </strong> {message.content}
                            <span className="float-end" style={{ fontSize: '0.8rem', color: '#bcbdac' }}>
                                {message.createdAt && !isNaN(new Date(message.createdAt))
                                    ? new Date(message.createdAt).toLocaleTimeString()
                                    : '...'}
                            </span>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
            <Form onSubmit={handleSendMessage}>
                <InputGroup>
                    <Form.Control
                        type="text"
                        placeholder="Votre message"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        style={{ backgroundColor: '#40444b', color: '#fff', borderColor: '#40444b' }}
                    />

                    <Button type="submit" variant="primary" style={{ backgroundColor: '#7289da', borderColor: '#7289da' }}>
                        Envoyer
                    </Button>
                </InputGroup>
            </Form>
        </Container>
    );
};

export default Chat;

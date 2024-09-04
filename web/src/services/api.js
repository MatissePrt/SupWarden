import Cookies from 'js-cookie';

const getAuthToken = () => {
    const token = Cookies.get('userInfo');
    const userInfo = token ? JSON.parse(token) : null;
    return userInfo ? userInfo.token : '';
};

const fetchWithAuth = async (url, options = {}) => {
    const authToken = getAuthToken();
    const defaultHeaders = {
        'Authorization': `Bearer ${authToken}`,
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers: { ...defaultHeaders, ...options.headers },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Erreur lors de la requête fetch:', error.message);
        throw error;
    }
};


export const registerUser = async (userData) => {
    try {
        const data = await fetchWithAuth('http://localhost:5000/api/users/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return data;
    } catch (error) {
        console.error('Erreur lors de la requête fetch:', error.message);
        return { message: error.message };
    }
};

export const loginUser = async (userData) => {
    try {
        const response = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la connexion');
        }

        const data = await response.json();

        if (!data._id) {
            throw new Error('La réponse de l\'API ne contient pas d\'ID utilisateur');
        }

        return data;
    } catch (error) {
        console.error('Erreur de connexion:', error.message);
        return { message: 'Erreur de connexion' };
    }
};

export const createTrousseau = async (trousseauData) => {
    try {
        const data = await fetchWithAuth('http://localhost:5000/api/trousseaux/create', {
            method: 'POST',
            body: JSON.stringify(trousseauData),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return data;
    } catch (error) {
        console.error('Erreur de création du trousseau:', error);
        return { message: 'Erreur de création du trousseau' };
    }
};

export const getTrousseauById = async (id) => {
    try {
        const data = await fetchWithAuth(`http://localhost:5000/api/trousseaux/${id}`, {
            method: 'GET',
        });
        console.log('Retour complet de l\'API:', data);
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération du trousseau:', error);
        return { success: false, message: 'Erreur lors de la récupération du trousseau' };
    }
};

export const deleteTrousseau = async (trousseauId) => {
    try {
        const response = await fetch(`http://localhost:5000/api/trousseaux/${trousseauId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        console.log('Delete response:', data);
        return data;
    } catch (error) {
        console.error('Erreur de suppression du trousseau:', error);
        return { message: 'Erreur de suppression du trousseau' };
    }
};

export const getTrousseaux = async () => {
    try {
        const data = await fetchWithAuth('http://localhost:5000/api/trousseaux', {
            method: 'GET',
        });
        return data;
    } catch (error) {
        console.error('Erreur de récupération des trousseaux:', error);
        return { message: 'Erreur de récupération des trousseaux' };
    }
};


export const addMemberToTrousseau = async ({ trousseauId, memberId }) => {
    try {
        const data = await fetchWithAuth('http://localhost:5000/api/trousseaux/addMember', {
            method: 'POST',
            body: JSON.stringify({ trousseauId, memberId }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return data;
    } catch (error) {
        console.error('Erreur d\'ajout du membre:', error);
        return { message: 'Erreur d\'ajout du membre' };
    }
};

export const inviteMember = async ({ trousseauId, email }) => {
    try {
        const response = await fetchWithAuth(`http://localhost:5000/api/trousseaux/inviteMember`, {
            method: 'POST',
            body: JSON.stringify({ trousseauId, email }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.success) {
            throw new Error(response.message || 'Erreur lors de l\'invitation');
        }

        return response;
    } catch (error) {
        console.error('Erreur lors de l\'invitation:', error);
        throw error;
    }
};


export const getUserInvitations = async () => {
    try {
        const data = await fetchWithAuth('http://localhost:5000/api/users/invitations', {
            method: 'GET',
        });
        console.log('API response for getUserInvitations:', data);
        return data;
    } catch (error) {
        console.error('Erreur de récupération des invitations:', error);
        return { message: 'Erreur de récupération des invitations' };
    }
};

export const respondToInvitation = async (trousseauId, response) => {
    try {
        const data = await fetchWithAuth('http://localhost:5000/api/trousseaux/respondToInvitation', {
            method: 'POST',
            body: JSON.stringify({ trousseauId, response }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return data;
    } catch (error) {
        console.error('Erreur de réponse à l\'invitation:', error);
        return { message: 'Erreur de réponse à l\'invitation' };
    }
};

export const getElements = async (trousseauId) => {
    try {
        const response = await fetch(`http://localhost:5000/api/elements/${trousseauId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur récupération des éléments:', error);
        return { message: 'Erreur récupération des éléments' };
    }
};

export const createElement = async (trousseauId, elementData) => {
    try {
        const response = await fetch(`http://localhost:5000/api/elements`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: elementData,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur création de l\'élément:', error);
        return { message: 'Erreur création de l\'élément' };
    }
};

export const deleteElement = async (trousseauId, elementId) => {
    try {
        const response = await fetch(`http://localhost:5000/api/elements/${elementId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ trousseauId }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur suppression de l\'élément:', error);
        return { message: 'Erreur suppression de l\'élément' };
    }
};

export const updateElement = async (elementId, elementData) => {
    try {
        const response = await fetch(`http://localhost:5000/api/elements/${elementId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: elementData,
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur modification de l\'élément:', error);
        return { message: 'Erreur modification de l\'élément' };
    }
};

export const getElementDetails = async (elementId, password = '', pin = '') => {
    try {
        const response = await fetch(`http://localhost:5000/api/elements/${elementId}/details`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ password, pin }),
        });
        return await response.json();
    } catch (error) {
        console.error('Erreur récupération de l\'élément:', error);
        return { message: 'Erreur récupération de l\'élément' };
    }
};



export const googleLogin = async (userInfo) => {
    try {
        const response = await fetch(`http://localhost:5000/api/users/google-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userInfo),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la connexion via Google');
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la connexion via Google', error);
        throw error;
    }
};

export const changePassword = async (currentPassword, newPassword) => {
    try {
        const data = await fetchWithAuth('http://localhost:5000/api/users/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        return data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du mot de passe', error);
        throw error;
    }
};

export const exportData = async () => {
    const authToken = getAuthToken();
    
    try {
        const response = await fetch('http://localhost:5000/api/trousseaux/export', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response;
    } catch (error) {
        console.error('Erreur lors de l\'exportation des données:', error);
        throw error;
    }
};

export const importData = async (data) => {
    try {
        const response = await fetchWithAuth('http://localhost:5000/api/trousseaux/import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Erreur lors de l\'importation des données:', error);
        throw error;
    }
};

export const setPin = async (pin) => {
    try {
        const data = await fetchWithAuth('http://localhost:5000/api/users/set-pin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pin })
        });

        return data;
    } catch (error) {
        console.error('Erreur lors de la définition du code PIN', error);
        throw error;
    }
};

export const sendMessage = async (trousseauId, messageContent) => {
    try {
        const data = await fetchWithAuth(`http://localhost:5000/api/messages/${trousseauId}`, {
            method: 'POST',
            body: JSON.stringify({ content: messageContent }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return data;
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error.message);
        throw error;
    }
};

export const getMessages = async (trousseauId) => {
    try {
        const response = await fetchWithAuth(`http://localhost:5000/api/messages/${trousseauId}`, {
            method: 'GET',
        });
        return response;
    } catch (error) {
        console.error('Erreur lors de la récupération des messages:', error);
        return { message: 'Erreur lors de la récupération des messages' };
    }
};


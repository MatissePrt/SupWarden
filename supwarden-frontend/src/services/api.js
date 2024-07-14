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

    const response = await fetch(url, {
        ...options,
        headers: { ...defaultHeaders, ...options.headers },
    });

    return response.json();
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
        return { message: 'Erreur d\'inscription' };
    }
};

export const loginUser = async (userData) => {
    try {
        const data = await fetchWithAuth('http://localhost:5000/api/users/login', {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return data;
    } catch (error) {
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
        return { success: true, trousseau: data };
    } catch (error) {
        console.error('Error fetching trousseau:', error);
        return { success: false, message: 'Error fetching trousseau' };
    }
};

export const deleteTrousseau = async (trousseauId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/trousseaux/${trousseauId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
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
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/trousseaux', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
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

export const inviteMember = async (invitationData) => {
    try {
        const data = await fetchWithAuth('http://localhost:5000/api/trousseaux/inviteMember', {
            method: 'POST',
            body: JSON.stringify(invitationData),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return data;
    } catch (error) {
        console.error('Erreur d\'invitation:', error);
        return { message: 'Erreur d\'invitation' };
    }
};

export const getUserInvitations = async () => {
    try {
        const data = await fetchWithAuth('http://localhost:5000/api/users/invitations', {
            method: 'GET',
        });
        console.log('API response for getUserInvitations:', data); // Log ajoutée
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
            body: elementData, // No need to set content type for FormData
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
            body: JSON.stringify({ trousseauId }), // Pass the trousseauId in the body if needed
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
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(elementData),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur modification de l\'élément:', error);
        return { message: 'Erreur modification de l\'élément' };
    }
};

export const getElementDetails = async (elementId, password) => {
    try {
        const response = await fetch(`http://localhost:5000/api/elements/${elementId}/details`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ password }),
        });
        return await response.json();
    } catch (error) {
        console.error('Erreur récupération de l\'élément:', error);
        return { message: 'Erreur récupération de l\'élément' };
    }
};

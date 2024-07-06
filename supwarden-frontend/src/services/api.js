import Cookies from 'js-cookie';

export const registerUser = async (userData) => {
    try {
        const response = await fetch('http://localhost:5000/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        return data; // L'objet retourné doit contenir { success: true } si l'inscription est réussie
    } catch (error) {
        return { message: 'Erreur d\'inscription' };
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
        const data = await response.json();
        return data; // L'objet retourné doit contenir { token, username, ... }
    } catch (error) {
        return { message: 'Erreur de connexion' };
    }
};


export const createTrousseau = async (trousseauData) => {
    try {
        const token = Cookies.get('userInfo');
        const userInfo = token ? JSON.parse(token) : null;
        const authToken = userInfo ? userInfo.token : '';

        const response = await fetch('http://localhost:5000/api/trousseaux/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(trousseauData),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur de création du trousseau:', error);
        return { message: 'Erreur de création du trousseau' };
    }
};



export const updateTrousseau = async (trousseauData) => {
    try {
        const response = await fetch('http://localhost:5000/api/trousseaux/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assurez-vous d'avoir le token
            },
            body: JSON.stringify(trousseauData),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return { message: 'Erreur de mise à jour du trousseau' };
    }
};

export const getTrousseau = async (id) => {
    try {
        const token = Cookies.get('userInfo');
        const userInfo = token ? JSON.parse(token) : null;
        const authToken = userInfo ? userInfo.token : '';

        const response = await fetch(`http://localhost:5000/api/trousseaux/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur de récupération du trousseau:', error);
        return { message: 'Erreur de récupération du trousseau' };
    }
};

export const deleteTrousseau = async (trousseauData) => {
    try {
        const response = await fetch('http://localhost:5000/api/trousseaux/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assurez-vous d'avoir le token
            },
            body: JSON.stringify(trousseauData),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return { message: 'Erreur de suppression du trousseau' };
    }
};

export const getTrousseaux = async () => {
    try {
        const token = Cookies.get('userInfo');
        const userInfo = token ? JSON.parse(token) : null;
        const authToken = userInfo ? userInfo.token : '';

        const response = await fetch('http://localhost:5000/api/trousseaux', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur de récupération des trousseaux:', error);
        return { message: 'Erreur de récupération des trousseaux' };
    }
};

export const addMemberToTrousseau = async ({ trousseauId, memberId }) => {
    try {
        const token = Cookies.get('userInfo');
        const userInfo = token ? JSON.parse(token) : null;
        const authToken = userInfo ? userInfo.token : '';

        const response = await fetch('http://localhost:5000/api/trousseaux/addMember', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ trousseauId, memberId }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur d\'ajout du membre:', error);
        return { message: 'Erreur d\'ajout du membre' };
    }
};

export const inviteMember = async ({ trousseauId, email }) => {
    try {
        const token = Cookies.get('userInfo');
        const userInfo = token ? JSON.parse(token) : null;
        const authToken = userInfo ? userInfo.token : '';

        const response = await fetch('http://localhost:5000/api/trousseaux/inviteMember', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ trousseauId, email }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur d\'invitation du membre:', error);
        return { message: 'Erreur d\'invitation du membre' };
    }
};


export const respondToInvitation = async ({ trousseauId, response }) => {
    try {
        const token = Cookies.get('userInfo');
        const userInfo = token ? JSON.parse(token) : null;
        const authToken = userInfo ? userInfo.token : '';

        const res = await fetch('http://localhost:5000/api/trousseaux/respondToInvitation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ trousseauId, response }),
        });
        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Erreur de réponse à l\'invitation:', error);
        return { message: 'Erreur de réponse à l\'invitation' };
    }
};

export const getUserInvitations = async () => {
    try {
        const token = Cookies.get('userInfo');
        const userInfo = token ? JSON.parse(token) : null;
        const authToken = userInfo ? userInfo.token : '';

        const response = await fetch('http://localhost:5000/api/users/invitations', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur de récupération des invitations:', error);
        return { message: 'Erreur de récupération des invitations' };
    }
};
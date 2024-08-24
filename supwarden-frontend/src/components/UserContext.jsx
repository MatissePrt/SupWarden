import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userInfo = Cookies.get('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo)); // On assume que `userInfo` contient un objet avec l'ID utilisateur
        }
    }, []);

    const login = (userInfo) => {
        if (!userInfo || !userInfo._id) {
            console.error('userInfo ne contient pas d\'ID utilisateur');
            return;
        }

        setUser(userInfo);
        Cookies.set('userInfo', JSON.stringify(userInfo), { expires: 7 });
    };




    const logout = () => {
        setUser(null);
        Cookies.remove('userInfo');
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;

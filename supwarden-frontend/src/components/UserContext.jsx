import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userInfo = Cookies.get('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo)); 
        }
    }, []);

    const login = (userInfo) => {
        if (userInfo?._id) {
            setUser(userInfo);
            Cookies.set('userInfo', JSON.stringify(userInfo), { expires: 7 });
        } else {
            console.error('userInfo ne contient pas d\'ID utilisateur');
        }
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

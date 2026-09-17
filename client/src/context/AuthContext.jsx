import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [name, setName] = useState(null);

    function login(newToken, newRole, newName) {
        setToken(newToken);
        setRole(newRole);
        setName(newName || null);
    }

    function logout() {
        setToken(null);
        setRole(null);
        setName(null);
    }

    const value = {
        token,
        role,
        name,
        isAuthenticated: !!token,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside an AuthProvider");
    }
    return context;
}
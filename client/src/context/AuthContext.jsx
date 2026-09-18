import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [name, setName] = useState(null);
    const [mustResetPassword, setMustResetPassword] = useState(false);

    function login(newToken, newRole, newName, newMustReset) {
        setToken(newToken);
        setRole(newRole);
        setName(newName || null);
        setMustResetPassword(!!newMustReset);
    }

    function logout() {
        setToken(null);
        setRole(null);
        setName(null);
        setMustResetPassword(false);
    }

    function clearMustResetPassword() {
        setMustResetPassword(false);
    }

    const value = {
        token,
        role,
        name,
        mustResetPassword,
        isAuthenticated: !!token,
        login,
        logout,
        clearMustResetPassword,
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
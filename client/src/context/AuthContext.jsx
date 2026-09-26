import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "sau_auth";

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [name, setName] = useState(null);
    const [mustResetPassword, setMustResetPassword] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // On first load, check localStorage for a saved session and restore it if still valid
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
                    setToken(parsed.token);
                    setRole(parsed.role);
                    setName(parsed.name);
                    setMustResetPassword(!!parsed.mustResetPassword);
                } else {
                    localStorage.removeItem(STORAGE_KEY);
                }
            }
        } catch (err) {
            localStorage.removeItem(STORAGE_KEY);
        } finally {
            setIsReady(true);
        }
    }, []);

    function login(newToken, newRole, newName, newMustReset) {
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now

        setToken(newToken);
        setRole(newRole);
        setName(newName || null);
        setMustResetPassword(!!newMustReset);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                token: newToken,
                role: newRole,
                name: newName || null,
                mustResetPassword: !!newMustReset,
                expiresAt,
            })
        );
    }

    function logout() {
        setToken(null);
        setRole(null);
        setName(null);
        setMustResetPassword(false);
        localStorage.removeItem(STORAGE_KEY);
    }

    function clearMustResetPassword() {
        setMustResetPassword(false);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            parsed.mustResetPassword = false;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
    }

    const value = {
        token,
        role,
        name,
        mustResetPassword,
        isAuthenticated: !!token,
        isReady,
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
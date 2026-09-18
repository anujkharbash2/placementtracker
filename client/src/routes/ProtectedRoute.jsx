import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRole, children }) {
    const { isAuthenticated, role, mustResetPassword } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (mustResetPassword) {
        return <Navigate to="/reset-password" replace />;
    }

    if (role !== allowedRole) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <h2>Unauthorized</h2>
                <p>You don't have permission to view this page.</p>
            </div>
        );
    }

    return children;
}

export default ProtectedRoute;
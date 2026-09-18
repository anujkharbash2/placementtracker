import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import Student from './dashboards/Student';
import Recruiter from './dashboards/Recruiter';
import Admin from './dashboards/Admin';
import Login from "./pages/Login";

import ProtectedRoute from "./routes/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import { useAuth } from "./context/AuthContext";
import ResetPassword from "./pages/ResetPassword";


function AppRoutes() {
    const { isAuthenticated } = useAuth();

    return (
        <>
            {isAuthenticated && <Navbar />}

            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route
                    path="/student"
                    element={
                        <ProtectedRoute allowedRole="student">
                            <Student />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/recruiter"
                    element={
                        <ProtectedRoute allowedRole="recruiter">
                            <Recruiter />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRole="admin">
                            <Admin />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

export default App;
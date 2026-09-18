import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import ErrorMessage from "../components/common/ErrorMessage";
import SuccessMessage from "../components/common/SuccessMessage";

function ResetPassword() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const { token, role, clearMustResetPassword } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!newPassword || newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Could not reset password.");
                return;
            }

            clearMustResetPassword();
            setSuccess("Password updated. Redirecting...");

            setTimeout(() => {
                navigate(`/${role}`);
            }, 1000);
        } catch (err) {
            setError("Could not reach the server.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 380, margin: "4rem auto" }}>
            <h2>Set New Password</h2>
            <p>You're logging in for the first time — please set a new password.</p>

            <form onSubmit={handleSubmit}>
                <Input
                    label="New Password"
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                    label="Confirm Password"
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Set Password"}
                </Button>

                <ErrorMessage message={error} />
                <SuccessMessage message={success} />
            </form>
        </div>
    );
}

export default ResetPassword;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";
import Button from "../components/common/Button";
import BrandBanner from "../components/common/BrandBanner";
import Input from "../components/common/Input";
import ErrorMessage from "../components/common/ErrorMessage";
import styles from "./Login.module.css";
import loginBg from "../assets/images/SAU.jpg";
import monumentsSkyline from "../assets/images/monuments-skyline-trimmed.png";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Login failed.");
                return;
            }

            login(data.token, data.user.role, data.user.name, data.must_reset_password);

            if (data.must_reset_password) {
                navigate("/reset-password");
            } else {
                navigate(`/${data.user.role}`);
            }
        } catch (err) {
            setError("Could not reach the server.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.page} style={{ "--bg-image": `url(${loginBg})` }}>
            <div className={styles.stack}>
                <BrandBanner />

                <div className={styles.card}>
                    <h2 className={styles.title}>Login</h2>
                    <form onSubmit={handleSubmit}>
                        <Input
                            label="Email"
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Input
                            label="Password"
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading}
                            className={styles.submitButton}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </Button>

                        <ErrorMessage message={error} />
                    </form>

                    <p className={styles.hint}>
                        Use SAU email or Company email to login.
                    </p>
                </div>
            </div>

            <div
                className={styles.skyline}
                style={{ "--skyline-mask": `url(${monumentsSkyline})` }}
            />
        </div>
    );
}

export default Login;
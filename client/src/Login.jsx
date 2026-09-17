import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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

    function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        setLoading(true);

        setTimeout(() => {
            setLoading(false);

            // Mock: pretend login succeeded, fake token + role
            // Replace this whole block with a real fetch call in Task 7
            const fakeToken = "mock-jwt-token";
            const fakeRole = "admin";

            login(fakeToken, fakeRole);
            navigate("/admin");
        }, 800);
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
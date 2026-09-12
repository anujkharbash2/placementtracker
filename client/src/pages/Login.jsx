import { useState } from "react";
import Button from "../components/common/Button";
import BrandBanner from "../components/common/BrandBanner";
import styles from "./Login.module.css";
import loginBg from "../assets/images/SAU.jpg";
import monumentsSkyline from "../assets/images/monuments-skyline-trimmed.png";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleSubmit(e) {
        e.preventDefault();
    }

    return (
        <div className={styles.page} style={{ "--bg-image": `url(${loginBg})` }}>
            <div className={styles.stack}>
                <BrandBanner />

                <div className={styles.card}>
                    <h2 className={styles.title}>Login</h2>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                className={styles.input}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                className={styles.input}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading}
                            className={styles.submitButton}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </Button>

                        {error && <p className={styles.error}>{error}</p>}
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
import { useState } from "react";
import Button from "./components/common/Button";

function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

function handleSubmit(e){
        e.preventDefault(); 
    }
    
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>
                    Email:
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <br />
                <label>
                    Password:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <br />
                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </Button>
                {error && <p>{error}</p>}
            </form>

            <p>
                Use SAU email or Company email to login. 
            </p>
        </div>
    )
}

export default Login;
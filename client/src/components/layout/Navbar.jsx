import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/Button";
import styles from "./Navbar.module.css";

function Navbar() {
    const { role, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <nav className={styles.navbar}>
            <div className={styles.brand}>SAU Placement Tracker</div>

            <div className={styles.links}>
                {role === "student" && (
                    <Link className={styles.link} to="/student">
                        Student Dashboard
                    </Link>
                )}

                {role === "recruiter" && (
                    <Link className={styles.link} to="/recruiter">
                        Recruiter Dashboard
                    </Link>
                )}

                {role === "admin" && (
                    <Link className={styles.link} to="/admin">
                        Admin Dashboard
                    </Link>
                )}

                <Button variant="secondary" onClick={handleLogout}>
                    Logout
                </Button>
            </div>
        </nav>
    );
}

export default Navbar;
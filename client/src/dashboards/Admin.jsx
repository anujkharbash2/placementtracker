import { useAuth } from "../context/AuthContext";
import CreateUserForm from "../components/admin/CreateUserForm";
import styles from "./Admin.module.css";
import Button from "../components/common/Button";
import Sidebar from "../components/common/Sidebar";

function Admin() {
    const { role, name, logout } = useAuth();
    const adminSidebarItems = [
        { label: "Dashboard", path: "/admin" },
        { label: "Create User", path: "/admin/create-user" },
        { label: "Manage Users", path: "/admin/manage-users" },
    ];

    return (
        <div className={styles.adminDashboard}>
            <Sidebar items={adminSidebarItems} />
            <div className={styles.mainContent}>
                <h1>Admin Dashboard</h1>
                <p>Logged in as: {role}</p>
                <Button variant="primary" onClick={logout} className={styles.logoutButton}>
                    Logout
                </Button>
                <CreateUserForm />
        </div>
        </div>);
}

export default Admin;
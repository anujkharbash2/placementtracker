import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import CreateUserForm from "../components/admin/CreateUserForm";
import styles from "./Admin.module.css";
import Button from "../components/common/Button";
import Sidebar from "../components/common/Sidebar";

function Admin() {
    const { role, logout } = useAuth();

    const [activePage, setActivePage] = useState("dashboard");

    const adminSidebarItems = [
        {
            label: "Dashboard",
            active: activePage === "dashboard",
            onClick: () => setActivePage("dashboard"),
        },
        {
            label: "Create User",
            active: activePage === "create-user",
            onClick: () => setActivePage("create-user"),
        },
        {
            label: "Manage Users",
            active: activePage === "manage-users",
            onClick: () => setActivePage("manage-users"),
        },
    ];

    return (
        <div className={styles.adminDashboard}>

            <Sidebar items={adminSidebarItems} />

            <div className={styles.mainContent}>

                {activePage === "dashboard" && (
                    <>
                        <h1>Admin Dashboard</h1>

                        <p>Logged in as: {role}</p>

                        <Button
                            variant="primary"
                            onClick={logout}
                            className={styles.logoutButton}
                        >
                            Logout
                        </Button>
                    </>
                )}

                {activePage === "create-user" && (
                    <CreateUserForm />
                )}

                {activePage === "manage-users" && (
                    <h1>Manage Users</h1>
                )}

            </div>
        </div>
    );
}

export default Admin;
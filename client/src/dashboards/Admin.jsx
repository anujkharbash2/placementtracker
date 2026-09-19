import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

import CreateUserForm from "../components/admin/CreateUserForm";
import UserList from "../components/admin/sections/UserList";

import styles from "./Admin.module.css";
import Button from "../components/common/Button";
import Sidebar from "../components/common/Sidebar";

function Admin() {
    const { token, role, name, logout } = useAuth();

    const [activePage, setActivePage] = useState("dashboard");

    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState("");

    const adminSidebarItems = [
        {
            label: "Dashboard",
            active: activePage === "dashboard",
            onClick: () => setActivePage("dashboard"),
        },
        {
            label: "Manage Students",
            active: activePage === "students",
            onClick: () => setActivePage("students"),
        },
        {
            label: "Manage Recruiters",
            active: activePage === "recruiters",
            onClick: () => setActivePage("recruiters"),
        },
        {
            label: "Create User",
            active: activePage === "create-user",
            onClick: () => setActivePage("create-user"),
        },
    ];

    async function fetchUsers() {
        setUsersLoading(true);
        setUsersError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/users`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setUsersError(
                    data.message || "Failed to load users."
                );
                return;
            }

            setUsers(data.users || []);

        } catch (err) {
            console.error("Failed to fetch users:", err);

            setUsersError(
                "Could not reach the server."
            );

        } finally {
            setUsersLoading(false);
        }
    }

    useEffect(() => {
        if (token && role === "admin") {
            fetchUsers();
        }
    }, [token, role]);

    return (
        <div className={styles.adminDashboard}>

            <Sidebar items={adminSidebarItems} />

            <div className={styles.mainContent}>

                {/* Dashboard */}
                {activePage === "dashboard" && (
                    <>
                        <h1>Admin Dashboard</h1>

                        <p>
                            Logged in as: {role}
                        </p>

                        <Button
                            variant="primary"
                            onClick={logout}
                            className={styles.logoutButton}
                        >
                            Logout
                        </Button>
                    </>
                )}

                {/* Create User */}
                {activePage === "create-user" && (
                    <CreateUserForm />
                )}

                {/* Manage Students */}
                {activePage === "students" && (
                    <UserList
                        users={users.filter(
                            (user) => user.role === "student"
                        )}
                        loading={usersLoading}
                        error={usersError}
                        title="Manage Students"
                    />
                )}

                {/* Manage Recruiters */}
                {activePage === "recruiters" && (
                    <UserList
                        users={users.filter(
                            (user) => user.role === "recruiter"
                        )}
                        loading={usersLoading}
                        error={usersError}
                        title="Manage Recruiters"
                    />
                )}

            </div>
        </div>
    );
}

export default Admin;
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

import CreateUserForm from "../components/admin/CreateUserForm";
import UserList from "../components/admin/UserList";

import styles from "./Admin.module.css";
import Button from "../components/common/Button";
import Sidebar from "../components/common/Sidebar";
import EditUserForm from "../components/admin/EditUserForm";



function Admin() {
    const { token, role, logout } = useAuth();

    const [activePage, setActivePage] = useState("dashboard");

    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState("");

    const [editingUser, setEditingUser] = useState(null);

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

    // =====================================================
    // GET USERS
    // =====================================================

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
            console.error(
                "Failed to fetch users:",
                err
            );

            setUsersError(
                "Could not reach the server."
            );

        } finally {
            setUsersLoading(false);
        }
    }

    // =====================================================
    // Deactivate USER
    // =====================================================

    async function handleDeactivateUser(userId) {
        const confirmed = window.confirm(
            "Are you sure you want to Deactivate this user?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/users/${userId}/deactivate`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to Deactivate user."
                );
                return;
            }

            setUsers((prevUsers) =>
    prevUsers.map((user) =>
        user.id === userId
            ? { ...user, is_active: false }
            : user
    )
);

        } catch (err) {
            console.error(
                "Failed to Deactivate user:",
                err
            );

            alert("Could not reach the server.");
        }
    }


    //====== Reactivate user id =======
    async function handleReactivateUser(userId) {
        const confirmed = window.confirm(
            "Are you sure you want to Reactivate this user?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/users/${userId}/reactivate`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to Reactivate user."
                );
                return;
            }

            setUsers((prevUsers) =>
    prevUsers.map((user) =>
        user.id === userId
            ? { ...user, is_active: true }
            : user
    )
);

        } catch (err) {
            console.error(
                "Failed to Reactivate user:",
                err
            );

            alert("Could not reach the server.");
        }
    }

    // =====================================================
    // OPEN EDIT FORM
    // =====================================================

    function handleEditUser(user) {
        setEditingUser(user);
    }

    // =====================================================
    // UPDATE USER
    // =====================================================

    async function handleUpdateUser(userId, updatedData) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/users/${userId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(updatedData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to update user."
                );

                return false;
            }

            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId
                        ? data.user
                        : user
                )
            );

            setEditingUser(null);

            return true;

        } catch (err) {
            console.error(
                "Failed to update user:",
                err
            );

            alert("Could not reach the server.");

            return false;
        }
    }

    // =====================================================
    // LOAD USERS
    // =====================================================

    useEffect(() => {
        if (token && role === "admin") {
            fetchUsers();
        }
    }, [token, role]);

    return (
        <div className={styles.adminDashboard}>

            <Sidebar items={adminSidebarItems} />

            <div className={styles.mainContent}>

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

                {activePage === "create-user" && (
                    <CreateUserForm />
                )}

                {activePage === "students" && (
                    <UserList
                        users={users.filter(
                            (user) =>
                                user.role === "student"
                        )}
                        loading={usersLoading}
                        error={usersError}
                        title="Manage Students"
                        onEdit={handleEditUser}
                        onDeactivate={handleDeactivateUser}
                        onReactivate={handleReactivateUser}
                    />
                )}

                {activePage === "recruiters" && (
                    <UserList
                        users={users.filter(
                            (user) =>
                                user.role === "recruiter"
                        )}
                        loading={usersLoading}
                        error={usersError}
                        title="Manage Recruiters"
                        onEdit={handleEditUser}
                        onDeactivate={handleDeactivateUser}
                        onReactivate={handleReactivateUser}
                    />
                )}

                {editingUser && (
                    <EditUserForm
                        user={editingUser}
                        onUpdate={handleUpdateUser}
                        onClose={() =>
                            setEditingUser(null)
                        }
                    />
                )}

            </div>
        </div>
    );
}

export default Admin;
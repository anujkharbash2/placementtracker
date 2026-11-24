import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";

import CreateUserForm from "../components/admin/CreateUserForm";
import UserList from "../components/admin/UserList";
import EditUserForm from "../components/admin/EditUserForm";
import AdminHome from "../components/admin/home/AdminHome";
import AllDrives from "../components/admin/AllDrives";
import PendingDrives from "../components/admin/PendingDrives";

import styles from "./Admin.module.css";
import Sidebar from "../components/common/Sidebar";

function Admin() {
    const { token, role } = useAuth();

    const [activePage, setActivePage] = useState("dashboard");
    // Carries filters (or other options) from a dashboard card to the page it opens
    const [pageOptions, setPageOptions] = useState({});

    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState("");

    const [editingUser, setEditingUser] = useState(null);

    function goTo(page, options = {}) {
        setPageOptions(options);
        setActivePage(page);
    }

    const adminSidebarItems = [
        {
            label: "Dashboard",
            active: activePage === "dashboard",
            onClick: () => goTo("dashboard"),
        },
        {
            label: "Manage Students",
            active: activePage === "students",
            onClick: () => goTo("students"),
        },
        {
            label: "Manage Recruiters",
            active: activePage === "recruiters",
            onClick: () => goTo("recruiters"),
        },
        {
            label: "Create User",
            active: activePage === "create-user",
            onClick: () => goTo("create-user"),
        },
        {
            label: "All Drives",
            active: activePage === "all-drives",
            onClick: () => goTo("all-drives"),
        },
        {
            label: "Pending Drives",
            active: activePage === "pending-drives",
            onClick: () => goTo("pending-drives"),
        },
    ];

    // =====================================================
    // GET USERS
    // =====================================================

    async function fetchUsers() {
        setUsersLoading(true);
        setUsersError("");

        try {
            const response = await fetch(`${API_BASE_URL}/api/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                setUsersError(data.message || "Failed to load users.");
                return;
            }

            setUsers(data.users || []);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setUsersError("Could not reach the server.");
        } finally {
            setUsersLoading(false);
        }
    }

    // =====================================================
    // DEACTIVATE USER
    // =====================================================

    async function handleDeactivateUser(userId) {
        const confirmed = window.confirm("Are you sure you want to Deactivate this user?");
        if (!confirmed) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}/deactivate`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to Deactivate user.");
                return;
            }

            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? { ...user, is_active: false } : user
                )
            );
        } catch (err) {
            console.error("Failed to Deactivate user:", err);
            alert("Could not reach the server.");
        }
    }

    // =====================================================
    // REACTIVATE USER
    // =====================================================

    async function handleReactivateUser(userId) {
        const confirmed = window.confirm("Are you sure you want to Reactivate this user?");
        if (!confirmed) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}/reactivate`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to Reactivate user.");
                return;
            }

            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? { ...user, is_active: true } : user
                )
            );
        } catch (err) {
            console.error("Failed to Reactivate user:", err);
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
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedData),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to update user.");
                return false;
            }

            setUsers((prevUsers) =>
                prevUsers.map((user) => (user.id === userId ? data.user : user))
            );

            setEditingUser(null);

            return true;
        } catch (err) {
            console.error("Failed to update user:", err);
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
                {activePage === "dashboard" && <AdminHome onNavigate={goTo} />}

                {activePage === "create-user" && <CreateUserForm />}

                {activePage === "students" && (
                    <UserList
                        users={users.filter((user) => user.role === "student")}
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
                        users={users.filter((user) => user.role === "recruiter")}
                        loading={usersLoading}
                        error={usersError}
                        title="Manage Recruiters"
                        onEdit={handleEditUser}
                        onDeactivate={handleDeactivateUser}
                        onReactivate={handleReactivateUser}
                    />
                )}

                {activePage === "all-drives" && (
                    <AllDrives initialFilters={pageOptions.filters} />
                )}

                {activePage === "pending-drives" && <PendingDrives />}

                {editingUser && (
                    <EditUserForm
                        user={editingUser}
                        onUpdate={handleUpdateUser}
                        onClose={() => setEditingUser(null)}
                    />
                )}
            </div>
        </div>
    );
}

export default Admin;
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

import styles from "./Student.module.css";
import Button from "../components/common/Button";
import Sidebar from "../components/common/Sidebar";

function student(){
    const{role, name, logout} = useAuth();
    const [activePage, setActivePage] = useState("dashboard");
    const studentSidebarItems = [
        {
            label: "Dashboard",
            active: activePage === "dashboard",
            onClick: () => setActivePage("dashboard"),
        },
        {
            label: "Opportunities",
            active: activePage === "opportunitites",
            onClick: () => setActivePage("opportunitites"),
        },
        {
            label: "Track Applications",
            active: activePage === "track-applications",
            onClick: () => setActivePage("track-applications"),
        },
        {
            label: "Profile",
            active: activePage === "profile",
            onClick: () => setActivePage("profile"),
        },
    ];
    return(
     <div className={styles.studentDashboard}>

            <Sidebar items={studentSidebarItems} />

            <div className={styles.mainContent}>

                {activePage === "dashboard" && (
                    <>
                        <h1>Student Dashboard</h1>

                        <p>Logged in as: {name}</p>

                        <Button
                            variant="primary"
                            onClick={logout}
                            className={styles.logoutButton}
                        >
                            Logout
                        </Button>
                    </>
                )}

                {activePage === "opportunitites" && (
                    <h1>Explore opportunitites</h1>
                )}
                {activePage==="track-applications" && (
                    <h1>Track your applications</h1>
                )}

                {activePage === "profile" && (
                    <h1>Manage Profile</h1>
                )}

            </div>
        </div>
    );
}

export default student;
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

import styles from "./Recruiter.module.css";
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
            label: "Post Drive",
            active: activePage === "post-drive",
            onClick: () => setActivePage("post-drive"),
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
                        <h1>Recruiter Dashboard</h1>

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

                {activePage === "post-drive" && (
                    <h1>Post Drives</h1>
                )}
                {activePage==="track-applications" && (
                    <h1>Track applications</h1>
                )}

                {activePage === "profile" && (
                    <h1>Manage Profile</h1>
                )}

            </div>
        </div>
    );
}

export default student;